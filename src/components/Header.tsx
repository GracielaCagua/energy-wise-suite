import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMetrics } from "@/hooks/useMetrics";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { trackClick } = useMetrics("header");

  const handleSignOut = () => {
    trackClick("logout_button");
    signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          onClick={() => trackClick("logo")}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            EcoSense
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
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

              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
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
      </div>
    </header>
  );
};
