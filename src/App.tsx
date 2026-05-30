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

// Internal Hub (/staff) — Docs 0.1, 0.2, 1.1, 1.2
import ProtectedRoute from "./components/staff/ProtectedRoute";
import InternalHubLayout from "./components/internal-hub/InternalHubLayout";
import StaffHome from "./pages/staff/hub/StaffHome";
import MyProfile from "./pages/staff/hub/MyProfile";
import AdminStaffList from "./pages/staff/hub/admin/AdminStaffList";
import AdminAddStaff from "./pages/staff/hub/admin/AdminAddStaff";
import AdminStaffDetail from "./pages/staff/hub/admin/AdminStaffDetail";
import NoticesList from "./pages/staff/hub/notices/NoticesList";
import NoticeDetail from "./pages/staff/hub/notices/NoticeDetail";
import BroadcastForm from "./pages/staff/hub/notices/admin/BroadcastForm";
import AckReport from "./pages/staff/hub/notices/admin/AckReport";
import ResourcesIndex from "./pages/staff/hub/resources/ResourcesIndex";
import ManageResources from "./pages/staff/hub/resources/admin/ManageResources";
import RequestsIndex from "./pages/staff/hub/requests/RequestsIndex";
import PayslipsIndex from "./pages/staff/hub/payslips/PayslipsIndex";
import { Approvals, SettingsAdmin } from "./pages/staff/hub/admin/Stubs";
import PayrollIndex from "./pages/staff/hub/admin/payroll/PayrollIndex";
import PayrollRunDetail from "./pages/staff/hub/admin/payroll/PayrollRunDetail";
import AdminPayslips from "./pages/staff/hub/admin/payroll/AdminPayslips";
import FinanceIndex from "./pages/staff/hub/admin/finance/FinanceIndex";
import FinanceSnapshotDetail from "./pages/staff/hub/admin/finance/FinanceSnapshotDetail";
import PayslipDetail from "./pages/staff/hub/payslips/PayslipDetail";

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

              {/* Notices */}
              <Route path="notices" element={<NoticesList />} />
              <Route path="notices/:id" element={<NoticeDetail />} />

              {/* Resources */}
              <Route path="resources" element={<ResourcesIndex />} />

              {/* Staff-facing stubs (owned by later cards) */}
              <Route path="requests" element={<RequestsIndex />} />
              <Route path="payslips" element={<PayslipsIndex />} />
              <Route path="payslips/:id" element={<PayslipDetail />} />

              {/* Admin */}
              <Route path="admin/staff" element={
                <ProtectedRoute requireAdmin><AdminStaffList /></ProtectedRoute>
              } />
              <Route path="admin/staff/new" element={
                <ProtectedRoute requireAdmin><AdminAddStaff /></ProtectedRoute>
              } />
              <Route path="admin/staff/:id" element={
                <ProtectedRoute requireAdmin><AdminStaffDetail /></ProtectedRoute>
              } />
              <Route path="admin/notices/new" element={
                <ProtectedRoute requireAdmin><BroadcastForm /></ProtectedRoute>
              } />
              <Route path="admin/notices/:id/ack" element={
                <ProtectedRoute requireAdmin><AckReport /></ProtectedRoute>
              } />
              <Route path="admin/resources" element={
                <ProtectedRoute requireAdmin><ManageResources /></ProtectedRoute>
              } />
              <Route path="admin/approvals" element={
                <ProtectedRoute requireAdmin><Approvals /></ProtectedRoute>
              } />
              <Route path="admin/payroll" element={
                <ProtectedRoute requireAdmin><PayrollIndex /></ProtectedRoute>
              } />
              <Route path="admin/payroll/:runId" element={
                <ProtectedRoute requireAdmin><PayrollRunDetail /></ProtectedRoute>
              } />
              <Route path="admin/payslips" element={
                <ProtectedRoute requireAdmin><AdminPayslips /></ProtectedRoute>
              } />
              <Route path="admin/finance" element={
                <ProtectedRoute requireAdmin><FinanceIndex /></ProtectedRoute>
              } />
              <Route path="admin/finance/:id" element={
                <ProtectedRoute requireAdmin><FinanceSnapshotDetail /></ProtectedRoute>
              } />
              <Route path="admin/settings" element={
                <ProtectedRoute requireAdmin><SettingsAdmin /></ProtectedRoute>
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
