-- Create table to store per-device daily consumption
CREATE TABLE public.dispositivo_consumo_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id UUID REFERENCES public.dispositivos(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  consumo_kwh DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(dispositivo_id, fecha)
);

ALTER TABLE public.dispositivo_consumo_diario ENABLE ROW LEVEL SECURITY;

-- Policy: device owners can insert/select their device daily consumption
CREATE POLICY "Owners can insert/select their device daily consumption"
  ON public.dispositivo_consumo_diario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dispositivos d WHERE d.id = dispositivo_consumo_diario.dispositivo_id AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dispositivos d WHERE d.id = dispositivo_consumo_diario.dispositivo_id AND d.user_id = auth.uid()
    )
  );

-- Function to insert daily consumption for all devices (consumo_kwh = potencia_w * hours / 1000)
CREATE OR REPLACE FUNCTION public.insert_daily_consumption(_date DATE DEFAULT current_date, _hours_per_day NUMERIC DEFAULT 24)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.dispositivo_consumo_diario (dispositivo_id, fecha, consumo_kwh)
  SELECT d.id, _date, ROUND((COALESCE(d.potencia_w, 0) * _hours_per_day) / 1000.0::numeric, 3)
  FROM public.dispositivos d
  WHERE NOT EXISTS (
    SELECT 1 FROM public.dispositivo_consumo_diario dc WHERE dc.dispositivo_id = d.id AND dc.fecha = _date
  );
END;
$$;

-- Note: To run this function daily, configure a scheduled job using Supabase (pg_cron) or an external scheduler calling: SELECT public.insert_daily_consumption();
