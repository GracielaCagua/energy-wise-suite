-- Add dispositivos table and reference from consumo_usuarios

CREATE TABLE public.dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  potencia_w INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nombre)
);

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;

-- Trigger to update updated_at
CREATE TRIGGER update_dispositivos_updated_at
  BEFORE UPDATE ON public.dispositivos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies for dispositivos
CREATE POLICY "Users can view their own devices"
  ON public.dispositivos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON public.dispositivos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON public.dispositivos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all devices"
  ON public.dispositivos FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add dispositivo_id to consumo_usuarios
ALTER TABLE public.consumo_usuarios
  ADD COLUMN dispositivo_id UUID REFERENCES public.dispositivos(id) ON DELETE SET NULL;

-- Allow inserting consumo with dispositivo_id if it belongs to the user (checked via device.user_id)
-- We'll rely on general usuario insert policy (auth.uid() = user_id) and FK constraints; additional checks can be added server-side if desired.

-- Note: After applying this migration, run supabase migrations to update your DB.
