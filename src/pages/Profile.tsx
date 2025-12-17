import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMetrics } from "@/hooks/useMetrics";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { trackClick, trackMetric } = useMetrics("profile");
  const { t } = useLanguage();

  const [profile, setProfile] = useState<any>(null);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      cargarPerfil();
      trackMetric({ accion: "profile_view", metadata: { timestamp: new Date().toISOString(), user: user.id } });
    }
  }, [user, loading, navigate]);

  const cargarPerfil = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      if (error && error.code !== "PGRST116") throw error; // ignore not found
      setProfile(data || null);
      setNombre(data?.nombre || "");
    } catch (e) {
    console.error("Error loading profile:", e);
    toast.error(t('profile')?.messages?.error_load ?? "No se pudo cargar el perfil");
    }
  };

  const saveProfile = async () => {
    trackClick("profile_save");
    if (!user) return;

    const nuevo = nombre?.trim() ?? "";
      if (!nuevo || nuevo.length < 2) {
      // don't save invalid minimal names; just notify
      toast.error(t('profile')?.messages?.name_too_short ?? "El nombre debe tener al menos 2 caracteres");
      return;
    }

    // Avoid unnecessary writes

    if (profile && (profile.nombre || "") === nuevo) return;

    setSaving(true);
    const start = Date.now();
    try {
      const payload = {
        id: user.id,
        email: user.email || "",
        nombre: nuevo,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
      const duration = Date.now() - start;
      try { await trackMetric({ accion: "profile_update", metadata: { ms: duration } }); } catch {}
      toast.success(t('profile')?.messages?.updated ?? "Perfil actualizado");
      await cargarPerfil();
    } catch (e) {
      console.error(e);
      toast.error(t('profile')?.messages?.error_update ?? "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>Ver y editar los datos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input value={user?.email ?? ""} readOnly />
                <p className="text-xs text-muted-foreground">El correo está asociado a tu cuenta. Para cambiarlo, utiliza la gestión de cuenta.</p>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => saveProfile()} />
              </div>


              {/* Guardado automático al salir del campo. Los botones de navegación están en la navbar. */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
