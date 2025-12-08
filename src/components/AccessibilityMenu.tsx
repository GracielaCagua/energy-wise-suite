import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Accessibility, Eye, Ear, Hand, Brain, Check, Sun, Moon } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import { toast } from "sonner";

const perfiles = [
  {
    value: "ninguna",
    label: "Ninguno",
    description: "Interfaz estándar sin ajustes especiales",
    icon: Accessibility,
  },
  {
    value: "visual",
    label: "Discapacidad Visual",
    description: "Texto grande, alto contraste, compatibilidad con lectores de pantalla",
    icon: Eye,
  },
  {
    value: "auditiva",
    label: "Discapacidad Auditiva",
    description: "Alertas visuales reforzadas, sin dependencia de audio",
    icon: Ear,
  },
  {
    value: "motriz",
    label: "Discapacidad Motriz",
    description: "Áreas de clic más grandes, navegación por teclado mejorada",
    icon: Hand,
  },
  {
    value: "cognitiva",
    label: "Discapacidad Cognitiva",
    description: "Contenido simplificado, instrucciones claras, menos distracciones",
    icon: Brain,
  },
];

export const AccessibilityMenu = () => {
  const { perfil, setPerfil, aplicarPerfil, dark, toggleDark } = useAccessibility();
  const { trackClick } = useMetrics('accessibility');
  const [open, setOpen] = useState(false);
  const [tempPerfil, setTempPerfil] = useState(perfil);

  // Keep the temporary selection in sync with the context perfil
  // so when the profile is loaded from Supabase the UI reflects it.
  // sync when perfil changes (e.g., after login and cargarPerfil runs)
  useEffect(() => {
    setTempPerfil(perfil);
  }, [perfil]);

  const handleApply = () => {
    // Apply the temporary perfil immediately and persist if possible
    aplicarPerfil(tempPerfil as any);
    setPerfil(tempPerfil as any);
    setOpen(false);
    toast.success("Perfil de accesibilidad aplicado correctamente");
  };

  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      if (highContrast) {
        document.documentElement.setAttribute("data-contrast", "high");
      } else {
        document.documentElement.removeAttribute("data-contrast");
      }
    } catch (e) {
      // ignore (SSR or safety)
    }
  }, [highContrast]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Menú de accesibilidad"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Accesibilidad</SheetTitle>
          <SheetDescription>
            Personaliza la interfaz según tus necesidades. Cumple con WCAG 2.2 nivel AA.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Tema</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { toggleDark(); trackClick('toggle_theme'); toast.success(`Tema ${dark ? 'claro' : 'oscuro'} activado`); }}
              aria-pressed={dark}
            >
              {dark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {dark ? 'Claro' : 'Oscuro'}
            </Button>
          </div>
          <RadioGroup value={tempPerfil} onValueChange={(value) => setTempPerfil(value as any)}>
            <div className="space-y-4">
              {perfiles.map((perfil) => {
                const Icon = perfil.icon;
                return (
                  <div
                    key={perfil.value}
                    className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-all hover:border-primary ${
                      tempPerfil === perfil.value
                        ? "border-primary bg-primary/20"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem
                      value={perfil.value}
                      id={perfil.value}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={perfil.value}
                        className="flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Icon className="h-5 w-5 text-primary-foreground" />
                        {perfil.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {perfil.description}
                      </p>
                    </div>
                    {tempPerfil === perfil.value && (
                      <Check className="h-5 w-5 text-primary mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleApply} className="flex-1">
              Aplicar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTempPerfil(perfil);
                setOpen(false);
              }}
            >
              Cancelar
            </Button>
          </div>
          <div className="mt-4">
            <Label className="mb-2">Contraste</Label>
            <div className="flex items-center gap-3">
              <Button
                variant={highContrast ? "default" : "outline"}
                onClick={() => setHighContrast((v) => !v)}
                size="sm"
              >
                {highContrast ? <Check className="h-4 w-4 mr-2" /> : null}
                Contraste Alto
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
