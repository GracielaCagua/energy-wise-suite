import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface MetricData {
  formulario: string;
  accion: string;
  metadata?: Record<string, any>;
}

export const useMetrics = (formulario: string) => {
  const { user } = useAuth();

  const trackMetric = useCallback(async (data: Omit<MetricData, 'formulario'>) => {
    try {
      const { error } = await supabase
        .from("metricas_usabilidad")
        .insert({
          user_id: user?.id || null,
          formulario,
          accion: data.accion,
          metadata: data.metadata || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error tracking metric:", error);
    }
  }, [user?.id, formulario]);

  const trackPageView = useCallback(() => {
    trackMetric({
      accion: "page_view",
      metadata: { timestamp: new Date().toISOString() }
    });
  }, [trackMetric]);

  const trackClick = useCallback((elemento: string) => {
    trackMetric({
      accion: "click",
      metadata: { elemento, timestamp: new Date().toISOString() }
    });
  }, [trackMetric]);

  const trackTimeSpent = useCallback((seconds: number) => {
    trackMetric({
      accion: "time_spent",
      metadata: { seconds, timestamp: new Date().toISOString() }
    });
  }, [trackMetric]);

  useEffect(() => {
    trackPageView();

    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 0) {
        trackTimeSpent(timeSpent);
      }
    };
  }, [trackPageView, trackTimeSpent]);

  return {
    trackMetric,
    trackClick,
    trackPageView,
    trackTimeSpent,
  };
};
