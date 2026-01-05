import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import useNotify from "@/hooks/useNotify";
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Accessibility } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ShortcutsManagerContent: React.FC = () => {
  const { toggleLang } = useLanguage();
  const { notify } = useNotify();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;
      
      // Focus search on '/'
      if (e.key === "/") {
        const el = document.getElementById('global-search') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.select(); }
      }
      
      // Focus search on Cmd/Ctrl+K
      if (isCmd && e.key.toLowerCase() === 'k') {
        const el = document.getElementById('global-search') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.select(); }
      }
      
      // Toggle language on Cmd/Ctrl+Shift+L
      if (isCmd && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLang();
        try { notify({ title: 'Idioma cambiado', description: 'Idioma alternado', forceVisual: true }); } catch {}
      }

      // Navigate to Dashboard on Cmd/Ctrl+D
      if (isCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/dashboard');
        try { notify({ title: 'Dashboard', description: 'Navegando al panel de control', forceVisual: true }); } catch {}
      }

      // Navigate to Profile on Cmd/Ctrl+P
      if (isCmd && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/profile');
        try { notify({ title: 'Perfil', description: 'Navegando a tu perfil', forceVisual: true }); } catch {}
      }

      // Navigate to Home on Cmd/Ctrl+H
      if (isCmd && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/');
        try { notify({ title: 'Inicio', description: 'Navegando a la página de inicio', forceVisual: true }); } catch {}
      }

      // Refresh data on Cmd/Ctrl+R
      if (isCmd && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        // Emitir un evento personalizado que los componentes puedan escuchar
        window.dispatchEvent(new CustomEvent('refresh-data'));
        try { notify({ title: 'Actualizando', description: 'Recargando datos...', forceVisual: true }); } catch {}
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleLang, notify, navigate]);

  return null;
};

// Wrapper para usar hooks dentro de BrowserRouter
const ShortcutsManager: React.FC = () => {
  return <ShortcutsManagerContent />;
};

const CollapsibleLogo = () => {
  const { state } = useSidebar();
  if (state !== "collapsed") return null;
  return (
    <div className="flex items-center gap-2 ml-2">
      <SidebarTrigger className="mr-2" />
      <Accessibility className="h-6 w-6 text-primary" />
      <span className="font-semibold hidden md:inline">EcoSense</span>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ShortcutsManager />
            <KeyboardShortcutsDialog />
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1">
                  <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center gap-4 px-4">
                      <CollapsibleLogo />
                      <div className="flex-1" />
                      <Header />
                    </div>
                  </header>
                  <main className="flex-1 px-4 py-6 md:px-6">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/contact" element={<Contact />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <AccessibilityMenu />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </AccessibilityProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
