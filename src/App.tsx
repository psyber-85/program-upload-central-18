import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlacementAuthProvider } from "@/contexts/PlacementAuthContext";

// Staff Portal imports (existing)
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
import Payroll from "./pages/staff/admin/Payroll";
import PayrollRunDetail from "./pages/staff/admin/PayrollRunDetail";
import Entries from "./pages/staff/admin/Entries";
import Settings from "./pages/staff/admin/Settings";
import MarketingLayout from "./components/marketing/MarketingLayout";
import MarketingDashboard from "./pages/staff/marketing/MarketingDashboard";
import Index from "./pages/Index";
import BirthdayDashboard from "./pages/BirthdayDashboard";
import RegisterTracker from "./pages/RegisterTracker";
import CRMTracker from "./pages/CRMTracker";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Placement System imports (new - completely isolated)
import { PublicLayout } from "./components/placement/public/PublicLayout";
import { Landing } from "./pages/placement/public/Landing";
import { HowItWorks } from "./pages/placement/public/HowItWorks";
import { RequestTalent } from "./pages/placement/public/RequestTalent";
import { Contact } from "./pages/placement/public/Contact";
import { PlacementLogin } from "./pages/placement/PlacementLogin";

// Placement - Employer Portal
import { EmployerProtectedRoute } from "./components/placement/employer/EmployerProtectedRoute";
import { EmployerLayout } from "./components/placement/employer/EmployerLayout";
import { EmployerDashboard } from "./pages/placement/employer/Dashboard";

// Placement - Ops Console
import { OpsProtectedRoute } from "./components/placement/ops/OpsProtectedRoute";
import { OpsLayout } from "./components/placement/ops/OpsLayout";
import { OpsDashboard } from "./pages/placement/ops/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ============================================ */}
          {/* PLACEMENT SYSTEM - Primary Public Site      */}
          {/* Completely isolated from Staff Portal       */}
          {/* ============================================ */}
          <Route element={
            <PlacementAuthProvider>
              <PublicLayout />
            </PlacementAuthProvider>
          }>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/request-talent" element={<RequestTalent />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          
          {/* Placement Login (standalone, no layout) */}
          <Route path="/login" element={
            <PlacementAuthProvider>
              <PlacementLogin />
            </PlacementAuthProvider>
          } />

          {/* ============================================ */}
          {/* EMPLOYER PORTAL - For company users         */}
          {/* ============================================ */}
          <Route path="/employer" element={
            <PlacementAuthProvider>
              <EmployerProtectedRoute>
                <EmployerLayout />
              </EmployerProtectedRoute>
            </PlacementAuthProvider>
          }>
            <Route index element={<EmployerDashboard />} />
            {/* More routes in Phase 4 */}
          </Route>

          {/* ============================================ */}
          {/* OPS CONSOLE - For AIHQ operations           */}
          {/* ============================================ */}
          <Route path="/ops" element={
            <PlacementAuthProvider>
              <OpsProtectedRoute>
                <OpsLayout />
              </OpsProtectedRoute>
            </PlacementAuthProvider>
          }>
            <Route index element={<OpsDashboard />} />
            {/* More routes in Phase 7 */}
          </Route>

          {/* ============================================ */}
          {/* STAFF PORTAL - Internal Tool                */}
          {/* Accessed via /staff/*                       */}
          {/* ============================================ */}
          <Route path="/staff/login" element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          } />

          <Route path="/staff" element={
            <AuthProvider>
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            </AuthProvider>
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
            <Route path="entries" element={
              <ProtectedRoute requireAdmin>
                <Entries />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Marketing Portal routes (nested under /staff/marketing) */}
          <Route path="/staff/marketing" element={
            <AuthProvider>
              <ProtectedRoute>
                <MarketingLayout />
              </ProtectedRoute>
            </AuthProvider>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
