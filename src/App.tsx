import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Public pages
import PublicHome from "./pages/PublicHome";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Staff Portal
import PortalLayout from "./components/staff/PortalLayout";
import ProtectedRoute from "./components/staff/ProtectedRoute";
import StaffHome from "./pages/staff/StaffHome";
import StaffRequests from "./pages/staff/StaffRequests";
import NewRequest from "./pages/staff/NewRequest";
import RequestDetail from "./pages/staff/RequestDetail";
import StaffDocs from "./pages/staff/StaffDocs";
import StaffPayslips from "./pages/staff/StaffPayslips";
import PayslipDetail from "./pages/staff/PayslipDetail";
import MyEntries from "./pages/staff/MyEntries";

// Admin pages
import Payroll from "./pages/staff/admin/Payroll";
import PayrollRunDetail from "./pages/staff/admin/PayrollRunDetail";
import Billing from "./pages/staff/admin/Billing";
import Payments from "./pages/staff/admin/Payments";
import Settings from "./pages/staff/admin/Settings";

// Marketing Portal
import MarketingLayout from "./components/marketing/MarketingLayout";
import MarketingDashboard from "./pages/staff/marketing/MarketingDashboard";
import Index from "./pages/Index";
import BirthdayDashboard from "./pages/BirthdayDashboard";
import RegisterTracker from "./pages/RegisterTracker";
import CRMTracker from "./pages/CRMTracker";

// TryHire Microsite
import TryHireHome from "./pages/tryhire/TryHireHome";
import TryHireInterest from "./pages/tryhire/TryHireInterest";
import TryHireThanks from "./pages/tryhire/TryHireThanks";
import TryHirePrivacy from "./pages/tryhire/TryHirePrivacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* TryHire Microsite (public) */}
            <Route path="/tryhire" element={<TryHireHome />} />
            <Route path="/tryhire/interest" element={<TryHireInterest />} />
            <Route path="/tryhire/thanks" element={<TryHireThanks />} />
            <Route path="/tryhire/privacy" element={<TryHirePrivacy />} />
            
            {/* Staff Portal routes (protected) */}
            <Route path="/staff" element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StaffHome />} />
              <Route path="requests" element={<StaffRequests />} />
              <Route path="requests/new" element={<NewRequest />} />
              <Route path="requests/:id" element={<RequestDetail />} />
              <Route path="docs" element={<StaffDocs />} />
              <Route path="payslips" element={<StaffPayslips />} />
              <Route path="payslips/:id" element={<PayslipDetail />} />
              <Route path="my-entries" element={<MyEntries />} />
              {/* Admin-only routes */}
              <Route path="payroll" element={
                <ProtectedRoute requireAdmin>
                  <Payroll />
                </ProtectedRoute>
              } />
              <Route path="payroll/:runId" element={
                <ProtectedRoute requireAdmin>
                  <PayrollRunDetail />
                </ProtectedRoute>
              } />
              <Route path="billing" element={
                <ProtectedRoute requireAdmin>
                  <Billing />
                </ProtectedRoute>
              } />
              <Route path="payments" element={
                <ProtectedRoute requireAdmin>
                  <Payments />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute requireAdmin>
                  <Settings />
                </ProtectedRoute>
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
