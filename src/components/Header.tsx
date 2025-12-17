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
import { useLanguage } from "@/contexts/LanguageContext";
import SearchBar from "@/components/SearchBar";
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
  const { lang, toggleLang, t } = useLanguage();
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
              <DialogTitle>{t('header')?.local_pref_title ?? 'Preferencia local detectada'}</DialogTitle>
              <DialogDescription>
                {t('header')?.local_pref_desc ?? 'Se encontró una preferencia de accesibilidad guardada localmente que difiere de la configurada en tu cuenta.'}
              </DialogDescription>
            </DialogHeader>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                onClick={() => {
                  if (localPerfil) {
                    aplicarPerfil(localPerfil as any);
                    notify({ title: t('header')?.pref_synced_title ?? 'Preferencia sincronizada', description: t('header')?.pref_synced_desc ?? 'Se aplicó y sincronizó tu preferencia local.' });
                  }
                  setShowSyncBanner(false);
                }}
              >
                {t('header')?.use_local ?? 'Usar local'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={async () => {
                  await cargarPerfil(true);
                  notify({ title: t('header')?.pref_synced_title ?? 'Preferencia sincronizada', description: t('header')?.pref_synced_desc ?? 'Se aplicó la preferencia almacenada en tu cuenta.' });
                  setShowSyncBanner(false);
                }}
              >
                {t('header')?.use_account ?? 'Usar cuenta'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="flex items-center gap-2 w-full">
          <div className="flex-1 hidden md:flex mr-4">
            <SearchBar />
          </div>
          {/* Current profile indicator */}
          <div className="mr-2 px-3 py-1 rounded-md border bg-white/50 text-sm hidden sm:flex items-center">
            <span className="font-medium mr-2">{t('profile_label') ?? 'Perfil:'}</span>
            <span className="capitalize">{perfil === 'ninguna' ? (t('none_label') ?? 'Ninguno') : perfil}</span>
          </div>

          {/* Quick test notification button */}
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => notify({ title: t('notification_test_title') ?? 'Notificación de prueba', description: t('notification_test_desc') ?? 'Esta es una notificación visual de prueba.', forceVisual: true })}
            aria-label={t('notification_test_title') ?? 'Probar notificación'}
            title={t('notification_test_title') ?? 'Probar notificación'}
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">{t('notification_test_title') ?? 'Probar notificación'}</span>
          </Button>
          {/* Language toggle */}
          <Button variant="ghost" className="mr-2" onClick={() => { toggleLang(); notify({ title: t('lang_changed_title') ?? 'Idioma cambiado', description: `${lang === 'es' ? 'Inglés' : 'Español'}`, forceVisual: true }); }} aria-label="Cambiar idioma">
            {lang.toUpperCase()}
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
                    <Link to="/profile" onClick={() => trackClick('profile_link')}>{t('perfil') ?? 'Mi perfil'}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" onClick={() => trackClick('dashboard_link')}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => { trackClick('logout_button'); handleSignOut(); }}>{t('logout') ?? 'Cerrar sesión'}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                asChild
                onClick={() => trackClick("dashboard_link")}
              >
                <Link to="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('pages')?.find((p:any)=>p.path==='/dashboard')?.label ?? 'Dashboard'}</span>
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
                    <span className="hidden sm:inline">{t('sidebar')?.admin ?? 'Admin'}</span>
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
              <Link to="/auth">{t('login') ?? 'Iniciar Sesión'}</Link>
            </Button>
          )}
        </nav>
      </>
  );
};
