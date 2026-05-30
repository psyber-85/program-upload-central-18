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

// Internal Hub (/staff) — new portal per Doc 0.1 + 0.2
import ProtectedRoute from "./components/staff/ProtectedRoute";
import InternalHubLayout from "./components/internal-hub/InternalHubLayout";
import StaffHome from "./pages/staff/hub/StaffHome";
import MyProfile from "./pages/staff/hub/MyProfile";
import AdminStaffList from "./pages/staff/hub/admin/AdminStaffList";
import AdminAddStaff from "./pages/staff/hub/admin/AdminAddStaff";
import AdminStaffDetail from "./pages/staff/hub/admin/AdminStaffDetail";

// Marketing Portal (untouched)
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

            {/* Internal Hub */}
            <Route path="/staff" element={
              <ProtectedRoute>
                <InternalHubLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffHome />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="admin/staff" element={
                <ProtectedRoute requireAdmin><AdminStaffList /></ProtectedRoute>
              } />
              <Route path="admin/staff/new" element={
                <ProtectedRoute requireAdmin><AdminAddStaff /></ProtectedRoute>
              } />
              <Route path="admin/staff/:id" element={
                <ProtectedRoute requireAdmin><AdminStaffDetail /></ProtectedRoute>
              } />
            </Route>

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
