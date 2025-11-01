import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, LayoutDashboard, Shield, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useNotify from "@/hooks/useNotify";
import { useAuth } from "@/hooks/useAuth";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMetrics } from "@/hooks/useMetrics";
import { useState, useEffect } from "react";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { trackClick } = useMetrics("header");
  const { perfil, aplicarPerfil, cargarPerfil } = useAccessibility();
  const { notify } = useNotify();
  const [localPerfil, setLocalPerfil] = useState<string | null>(null);
  const [showSyncBanner, setShowSyncBanner] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("accessibility_perfil");
    setLocalPerfil(local);
    setShowSyncBanner(!!(user && local && local !== perfil));
  }, [user, perfil]);

  const handleSignOut = () => {
    trackClick("logout_button");
    signOut();
  };

  return (
    <>
      <Dialog open={showSyncBanner} onOpenChange={setShowSyncBanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preferencia local detectada</DialogTitle>
            <DialogDescription>
              Se encontró una preferencia de accesibilidad guardada localmente que difiere de la configurada en tu cuenta.
              ¿Deseas usar tu preferencia local (se sincronizará con tu cuenta) o mantener la preferencia de tu cuenta?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                onClick={() => {
                  if (localPerfil) {
                    aplicarPerfil(localPerfil as any);
                    notify({ title: "Preferencia sincronizada", description: "Se aplicó y sincronizó tu preferencia local." });
                  }
                  setShowSyncBanner(false);
                }}
              >
                Usar local
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  await cargarPerfil(true);
                  notify({ title: "Preferencia de cuenta aplicada", description: "Se aplicó la preferencia almacenada en tu cuenta." });
                  setShowSyncBanner(false);
                }}
              >
                Usar cuenta
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="flex items-center gap-2">
          {/* Current profile indicator */}
          <div className="mr-2 px-3 py-1 rounded-md border bg-white/50 text-sm hidden sm:flex items-center">
            <span className="font-medium mr-2">Perfil:</span>
            <span className="capitalize">{perfil === 'ninguna' ? 'Ninguno' : perfil}</span>
          </div>

          {/* Quick test notification button */}
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => notify({ title: 'Notificación de prueba', description: 'Esta es una notificación visual de prueba.', forceVisual: true })}
            aria-label="Probar notificación"
            title="Probar notificación"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Probar notificación</span>
          </Button>
          {/* Theme toggle moved to AccessibilityMenu */}
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-0">
                    <Avatar>
                      <AvatarFallback>
                        {user?.email ? user.email.split("@")[0].slice(0,2).toUpperCase() : (user?.id?.slice(0,2).toUpperCase() ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" onClick={() => trackClick('profile_link')}>Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" onClick={() => trackClick('dashboard_link')}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => { trackClick('logout_button'); handleSignOut(); }}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                asChild
                onClick={() => trackClick("dashboard_link")}
              >
                <Link to="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              
              {isAdmin && (
                <Button
                  variant="ghost"
                  asChild
                  onClick={() => trackClick("admin_link")}
                >
                  <Link to="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}

              {/* Removed duplicate logout button (now accessible via the avatar dropdown) */}
            </>
          ) : (
            <Button
              asChild
              onClick={() => trackClick("login_link")}
            >
              <Link to="/auth">Iniciar Sesión</Link>
            </Button>
          )}
        </nav>
      </>
  );
};
