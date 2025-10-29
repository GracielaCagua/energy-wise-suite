-- Create table to store per-device hourly consumption
CREATE TABLE public.dispositivo_consumo_horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id UUID REFERENCES public.dispositivos(id) ON DELETE CASCADE NOT NULL,
  ts TIMESTAMP WITH TIME ZONE NOT NULL,
  consumo_kwh DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(dispositivo_id, ts)
);

ALTER TABLE public.dispositivo_consumo_horario ENABLE ROW LEVEL SECURITY;

-- Policy: device owners can insert/select their device hourly consumption
CREATE POLICY "Owners can insert/select their device hourly consumption"
  ON public.dispositivo_consumo_horario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dispositivos d WHERE d.id = dispositivo_consumo_horario.dispositivo_id AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dispositivos d WHERE d.id = dispositivo_consumo_horario.dispositivo_id AND d.user_id = auth.uid()
    )
  );

-- Function to insert hourly consumption for devices on a given date
CREATE OR REPLACE FUNCTION public.insert_hourly_consumption(_device_id UUID DEFAULT NULL, _date DATE DEFAULT current_date)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.dispositivo_consumo_horario (dispositivo_id, ts, consumo_kwh)
  SELECT d.id,
         (_date::timestamptz + (g * interval '1 hour')) as ts,
         ROUND((COALESCE(d.potencia_w, 0) / 1000.0::numeric), 4) as consumo_kwh
  FROM public.dispositivos d
  CROSS JOIN generate_series(0,23) g
  WHERE (_device_id IS NULL OR d.id = _device_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.dispositivo_consumo_horario h
      WHERE h.dispositivo_id = d.id
        AND h.ts = (_date::timestamptz + (g * interval '1 hour'))
    );
END;
$$;

-- Note: Schedule this function daily (e.g. with pg_cron or Supabase Scheduled Functions) to populate hourly data automatically.
