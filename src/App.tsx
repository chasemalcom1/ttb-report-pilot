
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SupabaseAuthGuard from "@/components/SupabaseAuthGuard";
import AppLayout from "@/components/AppLayout";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Spirits from "./pages/Spirits";
import Report5110_40 from "./pages/Report5110_40";
import Report5110_28 from "./pages/Report5110_28";
import Report5110_11 from "./pages/Report5110_11";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SupabaseAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/operations" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Operations />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/spirits" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Spirits />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/reports/5110-40" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Report5110_40 />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/reports/5110-28" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Report5110_28 />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/reports/5110-11" element={
                <SupabaseAuthGuard>
                  <AppLayout>
                    <Report5110_11 />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              <Route path="/settings" element={
                <SupabaseAuthGuard allowedRoles={['admin']}>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </SupabaseAuthGuard>
              } />
              
              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
