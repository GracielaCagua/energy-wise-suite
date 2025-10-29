import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMetrics } from "@/hooks/useMetrics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Zap, TrendingDown, Calendar, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { trackClick } = useMetrics("dashboard");

  const [consumoData, setConsumoData] = useState<any[]>([]);
  const [nuevoConsumo, setNuevoConsumo] = useState({ fecha: "", consumo_kwh: "" });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      cargarConsumo();
    }
  }, [user, loading, navigate]);

  const cargarConsumo = async () => {
    try {
      const { data, error } = await supabase
        .from("consumo_usuarios")
        .select("*")
        .eq("user_id", user?.id)
        .order("fecha", { ascending: true })
        .limit(30);

      if (error) throw error;
      setConsumoData(data || []);
    } catch (error) {
      console.error("Error loading consumption:", error);
      toast.error("Error al cargar datos de consumo");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAgregarConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    trackClick("add_consumption");

    try {
      const { error } = await supabase.from("consumo_usuarios").insert({
        user_id: user?.id,
        fecha: nuevoConsumo.fecha,
        consumo_kwh: parseFloat(nuevoConsumo.consumo_kwh),
      });

      if (error) throw error;

      toast.success("Consumo registrado correctamente");
      setNuevoConsumo({ fecha: "", consumo_kwh: "" });
      cargarConsumo();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar consumo");
    }
  };

  if (loading || !user) {
    return null;
  }

  const totalConsumo = consumoData.reduce((sum, item) => sum + parseFloat(item.consumo_kwh), 0);
  const promedioConsumo = consumoData.length > 0 ? totalConsumo / consumoData.length : 0;

  const chartData = consumoData.map((item) => ({
    fecha: new Date(item.fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    }),
    kwh: parseFloat(item.consumo_kwh),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Consumo</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza tu consumo energético
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consumoData.length}</div>
              <p className="text-xs text-muted-foreground">
                días con datos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConsumo.toFixed(2)} kWh</div>
              <p className="text-xs text-muted-foreground">
                en todo el período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promedioConsumo.toFixed(2)} kWh</div>
              <p className="text-xs text-muted-foreground">
                por día registrado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Consumo</CardTitle>
              <CardDescription>
                Últimos {consumoData.length} días registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="kwh"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay datos de consumo aún. ¡Agrega tu primer registro!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Consumption Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nuevo Consumo
            </CardTitle>
            <CardDescription>
              Añade el consumo energético de un día específico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAgregarConsumo} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={nuevoConsumo.fecha}
                    onChange={(e) =>
                      setNuevoConsumo({ ...nuevoConsumo, fecha: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumo">Consumo (kWh)</Label>
                  <Input
                    id="consumo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={nuevoConsumo.consumo_kwh}
                    onChange={(e) =>
                      setNuevoConsumo({
                        ...nuevoConsumo,
                        consumo_kwh: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Registro
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
