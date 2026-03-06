import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ClientProvider } from "@/contexts/ClientContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import MetaAds from "./pages/dashboard/MetaAds";
import GoogleAds from "./pages/dashboard/GoogleAds";
import TikTokAds from "./pages/dashboard/TikTokAds";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import Integrations from "./pages/dashboard/Integrations";
import NotFound from "./pages/NotFound";

// Admin Pages
import Clients from "./pages/admin/Clients";
import Campaigns from "./pages/admin/Campaigns";
import ImportMetrics from "./pages/admin/ImportMetrics";
import Users from "./pages/admin/Users";

import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route component - only for admin users
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      
      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="meta" element={<MetaAds />} />
        <Route path="google" element={<GoogleAds />} />
        <Route path="tiktok" element={<TikTokAds />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="integrations" element={<AdminRoute><Integrations /></AdminRoute>} />
        
        {/* Admin Routes - nested under dashboard */}
        <Route path="admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />
        <Route path="admin/campaigns" element={<AdminRoute><Campaigns /></AdminRoute>} />
        <Route path="admin/import" element={<AdminRoute><ImportMetrics /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;