import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// TryHire Microsite (main public site)
import TryHireHome from "./pages/tryhire/TryHireHome";
import TryHireInterest from "./pages/tryhire/TryHireInterest";
import TryHireThanks from "./pages/tryhire/TryHireThanks";
import TryHirePrivacy from "./pages/tryhire/TryHirePrivacy";

// Auth pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Staff Portal (legacy moved to src/_backup/staff-legacy — revamp in progress)
import ProtectedRoute from "./components/staff/ProtectedRoute";
import StaffComingSoon from "./pages/staff/StaffComingSoon";

// Marketing Portal
import MarketingLayout from "./components/marketing/MarketingLayout";
import MarketingDashboard from "./pages/staff/marketing/MarketingDashboard";
import Index from "./pages/Index";
import BirthdayDashboard from "./pages/BirthdayDashboard";
import RegisterTracker from "./pages/RegisterTracker";
import CRMTracker from "./pages/CRMTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* TryHire - Main Public Site */}
            <Route path="/" element={<TryHireHome />} />
            <Route path="/interest" element={<TryHireInterest />} />
            <Route path="/thanks" element={<TryHireThanks />} />
            <Route path="/privacy" element={<TryHirePrivacy />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Staff Portal placeholder (legacy backed up; revamp pending) */}
            <Route path="/staff" element={<StaffComingSoon />} />

            {/* Marketing Portal routes (protected, nested under /staff/marketing) */}
            <Route path="/staff/marketing" element={
              <ProtectedRoute>
                <MarketingLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MarketingDashboard />} />
              <Route path="participant-manager" element={<Index />} />
              <Route path="birthday-dashboard" element={<BirthdayDashboard />} />
              <Route path="register-tracker" element={<RegisterTracker />} />
              <Route path="crm-tracker" element={<CRMTracker />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
