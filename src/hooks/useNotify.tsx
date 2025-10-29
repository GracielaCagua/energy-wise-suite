import { useCallback } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useToast } from "@/hooks/use-toast";

type NotifyOptions = {
  title?: string;
  description?: string;
  // If true, always show visual notification even if not in auditiva perfil
  forceVisual?: boolean;
};

export const useNotify = () => {
  const { perfil } = useAccessibility();
  const { toast } = useToast();

  const notify = useCallback((opts: NotifyOptions) => {
    const { title, description, forceVisual } = opts;

    const wantsVisual = perfil === "auditiva" || forceVisual;

    if (wantsVisual) {
      // show visual toast
      toast({ title, description });
      return;
    }

    // Default behaviour: show visual toast as primary channel
    // (audio channel not implemented here)
    toast({ title, description });
  }, [perfil, toast]);

  return { notify };
};

export default useNotify;
