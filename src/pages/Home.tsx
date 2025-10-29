import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMetrics } from "@/hooks/useMetrics";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import { 
  Leaf, 
  TrendingDown, 
  LineChart, 
  Shield, 
  Zap,
  Eye,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { trackClick, trackMetric } = useMetrics("home");
  const { user } = useAuth();

  // Metrics refs/state
  const startTs = useRef<number>(Date.now());
  const interactionRef = useRef<number>(0);

  // Scroll depth tracking
  useEffect(() => {
    const thresholds = new Set<number>();

    const onScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const winHeight = window.innerHeight;
      const scrolled = Math.min(100, Math.floor(((scrollTop + winHeight) / docHeight) * 100));

      [25, 50, 75, 100].forEach((t) => {
        if (scrolled >= t && !thresholds.has(t)) {
          thresholds.add(t);
          trackMetric({ accion: "scroll_depth", metadata: { percent: t, timestamp: new Date().toISOString() } });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // initial
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abandonment detection and time spent: on unmount
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTs.current) / 1000);

      // If user spent <30s and didn't interact, mark as potential abandonment
      if (timeSpent < 30 && interactionRef.current === 0) {
        trackMetric({ accion: "abandonment", metadata: { timeSpent, reason: "no_interaction", timestamp: new Date().toISOString() } });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard navigation tracking
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Enter") {
        trackMetric({ accion: "keyboard_nav", metadata: { key: e.key, timestamp: new Date().toISOString() } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Monitoreo en Tiempo Real",
      description: "Visualiza tu consumo energético diario con métricas actualizadas.",
    },
    {
      icon: TrendingDown,
      title: "Reduce tu Consumo",
      description: "Recibe recomendaciones personalizadas para optimizar tu energía.",
    },
    {
      icon: LineChart,
      title: "Análisis Detallado",
      description: "Gráficas y reportes completos de tu historial de consumo.",
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Tu información protegida con autenticación robusta.",
    },
    {
      icon: Eye,
      title: "Accesibilidad Universal",
      description: "Interfaz adaptable según WCAG 2.2 para todos los usuarios.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
        
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Sostenibilidad + Tecnología
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Gestiona tu{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                energía
              </span>
              {" "}de forma inteligente
            </h1>

            <p className="text-xl text-muted-foreground">
              EcoSense te ayuda a monitorear, analizar y optimizar tu consumo energético
              con una interfaz completamente accesible para todos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg"
                onClick={() => {
                  trackClick("cta_primary");
                  interactionRef.current += 1;
                  const seconds = Math.floor((Date.now() - startTs.current) / 1000);
                  trackMetric({ accion: "time_to_cta", metadata: { seconds, timestamp: new Date().toISOString() } });
                }}
              >
                <Link to={user ? "/dashboard" : "/auth"} className="flex items-center gap-2">
                  {user ? "Ir al Dashboard" : "Comenzar Gratis"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg"
                onClick={() => { trackClick("cta_secondary"); interactionRef.current += 1; }}
              >
                <Link to="#features">Conocer Más</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Características Principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para tomar control de tu consumo energético
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent opacity-10" />
            <CardContent className="relative p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                ¿Listo para reducir tu consumo energético?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Únete a EcoSense y comienza a tomar decisiones informadas sobre tu energía
              </p>
              <Button
                asChild
                size="lg"
                className="text-lg"
                onClick={() => trackClick("cta_footer")}
              >
                <Link to="/auth">Crear Cuenta Gratuita</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
