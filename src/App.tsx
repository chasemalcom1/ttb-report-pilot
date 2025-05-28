
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import Spirits from "./pages/Spirits";
import Report5110_40 from "./pages/Report5110_40";
import Report5110_28 from "./pages/Report5110_28";
import Report5110_11 from "./pages/Report5110_11";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <AuthGuard>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/operations" element={
              <AuthGuard>
                <AppLayout>
                  <Operations />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/spirits" element={
              <AuthGuard>
                <AppLayout>
                  <Spirits />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/reports/5110-40" element={
              <AuthGuard>
                <AppLayout>
                  <Report5110_40 />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/reports/5110-28" element={
              <AuthGuard>
                <AppLayout>
                  <Report5110_28 />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/reports/5110-11" element={
              <AuthGuard>
                <AppLayout>
                  <Report5110_11 />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/settings" element={
              <AuthGuard allowedRoles={['admin']}>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </AuthGuard>
            } />
            
            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
