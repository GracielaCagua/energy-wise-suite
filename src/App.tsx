import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import useNotify from "@/hooks/useNotify";
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Accessibility } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
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

const ShortcutsManager: React.FC = () => {
  const { toggleLang } = useLanguage();
  const { notify } = useNotify();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;
      // focus search on '/'
      if (e.key === "/") {
        const el = document.getElementById('global-search') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.select(); }
      }
      // focus search on Cmd/Ctrl+K
      if (isCmd && e.key.toLowerCase() === 'k') {
        const el = document.getElementById('global-search') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); el.select(); }
      }
      // toggle language on Cmd/Ctrl+Shift+L
      if (isCmd && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLang();
        try { notify({ title: 'Idioma cambiado', description: 'Idioma alternado', forceVisual: true }); } catch {}
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleLang, notify]);

  return null;
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
          <ShortcutsManager />
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          {/* Routes and layout rendered above */}
        </BrowserRouter>
        </AccessibilityProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
