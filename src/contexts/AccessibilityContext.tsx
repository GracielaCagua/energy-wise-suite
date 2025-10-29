import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type PerfilAccesibilidad = "visual" | "auditiva" | "motriz" | "cognitiva" | "ninguna";

interface AccessibilityContextType {
  perfil: PerfilAccesibilidad;
  setPerfil: (perfil: PerfilAccesibilidad) => void;
  aplicarPerfil: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perfil, setPerfil] = useState<PerfilAccesibilidad>("ninguna");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      cargarPerfil();
    }
  }, [user]);

  const cargarPerfil = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("perfil_accesibilidad")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setPerfil(data.perfil_accesibilidad as PerfilAccesibilidad);
        aplicarPerfilDOM(data.perfil_accesibilidad as PerfilAccesibilidad);
      }
    } catch (error) {
      console.error("Error loading accessibility profile:", error);
    }
  };

  const aplicarPerfil = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ perfil_accesibilidad: perfil })
        .eq("id", user.id);

      if (error) throw error;
      
      aplicarPerfilDOM(perfil);
    } catch (error) {
      console.error("Error saving accessibility profile:", error);
    }
  };

  const aplicarPerfilDOM = (perfilActual: PerfilAccesibilidad) => {
    const root = document.documentElement;
    
    // Remove previous classes
    root.classList.remove('perfil-visual', 'perfil-auditiva', 'perfil-motriz', 'perfil-cognitiva');
    
    // Apply new profile
    if (perfilActual !== 'ninguna') {
      root.classList.add(`perfil-${perfilActual}`);
    }

    // Apply specific styles based on profile
    switch (perfilActual) {
      case 'visual':
        root.style.setProperty('--font-size-base', '1.125rem');
        root.style.setProperty('--contrast-boost', '1.2');
        break;
      case 'auditiva':
        root.style.setProperty('--animation-duration', '0.6s');
        break;
      case 'motriz':
        root.style.setProperty('--target-size-min', '48px');
        root.style.setProperty('--spacing-interactive', '1rem');
        break;
      case 'cognitiva':
        root.style.setProperty('--content-max-width', '65ch');
        root.style.setProperty('--line-height', '1.8');
        break;
      default:
        root.style.removeProperty('--font-size-base');
        root.style.removeProperty('--contrast-boost');
        root.style.removeProperty('--animation-duration');
        root.style.removeProperty('--target-size-min');
        root.style.removeProperty('--spacing-interactive');
        root.style.removeProperty('--content-max-width');
        root.style.removeProperty('--line-height');
    }
  };

  return (
    <AccessibilityContext.Provider value={{ perfil, setPerfil, aplicarPerfil }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
