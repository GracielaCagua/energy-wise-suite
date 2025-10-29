import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMetrics } from "@/hooks/useMetrics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Activity, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { trackClick } = useMetrics("admin");

  const [metrics, setMetrics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMetrics: 0,
    totalConsumption: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error("Acceso denegado. Solo para administradores.");
      navigate("/");
    } else if (user && isAdmin) {
      cargarDatosAdmin();
    }
  }, [user, isAdmin, loading, navigate]);

  const cargarDatosAdmin = async () => {
    try {
      // Load metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("metricas_usabilidad")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (metricsError) throw metricsError;

      // Load stats
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: metricsCount } = await supabase
        .from("metricas_usabilidad")
        .select("*", { count: "exact", head: true });

      const { data: consumptionData } = await supabase
        .from("consumo_usuarios")
        .select("consumo_kwh");

      const totalConsumption = consumptionData?.reduce(
        (sum, item) => sum + parseFloat(item.consumo_kwh.toString()),
        0
      ) || 0;

      setMetrics(metricsData || []);
      setStats({
        totalUsers: usersCount || 0,
        totalMetrics: metricsCount || 0,
        totalConsumption,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Error al cargar datos de administración");
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Monitoreo de métricas y actividad de usuarios
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                usuarios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Métricas Registradas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMetrics}</div>
              <p className="text-xs text-muted-foreground">
                interacciones rastreadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalConsumption.toFixed(2)} kWh
              </div>
              <p className="text-xs text-muted-foreground">
                de todos los usuarios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Usabilidad Recientes</CardTitle>
            <CardDescription>
              Últimas 50 interacciones de usuarios en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p className="text-center py-8 text-muted-foreground">
                Cargando datos...
              </p>
            ) : metrics.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha/Hora</TableHead>
                      <TableHead>Formulario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-mono text-xs">
                          {new Date(metric.timestamp).toLocaleString("es-ES")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{metric.formulario}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{metric.accion}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {metric.user_id ? metric.user_id.substring(0, 8) : "Anónimo"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {metric.metadata
                            ? JSON.stringify(metric.metadata)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No hay métricas disponibles
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
