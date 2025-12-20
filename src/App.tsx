import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Staff pages (existing)
import StaffLayout from "./components/staff/StaffLayout";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Index from "./pages/Index";
import BirthdayDashboard from "./pages/BirthdayDashboard";
import RegisterTracker from "./pages/RegisterTracker";
import CRMTracker from "./pages/CRMTracker";
import NotFound from "./pages/NotFound";

// Placement Portal
import { AuthProvider } from "./lib/placement/AuthContext";
import { PublicLayout, EmployerLayout, OpsLayout } from "./components/placement/layouts";
import { ProtectedRoute, RoleGuard } from "./components/placement/guards";
import DemoLogin from "./pages/placement/DemoLogin";

// Phase 2: Public Pages
import { LandingPage } from "./pages/placement/LandingPage";
import { HowItWorks } from "./pages/placement/HowItWorks";
import { AISkillFramework } from "./pages/placement/AISkillFramework";
import { RequestTalent } from "./pages/placement/RequestTalent";
import { Contact } from "./pages/placement/Contact";

// Phase 3: Employer Portal
import {
  EmployerDashboard,
  RolesList,
  NewRoleRequest,
  RoleDetail,
  CandidateProfile,
  LOIStatus,
  TrainingOverview,
  Settings as EmployerSettings,
} from './pages/placement/employer';

// Phase 4: Ops Cockpit
import {
  OpsDashboard,
  EmployersList,
  EmployerDetail,
  RoleRequestsList,
  OpsRoleDetail,
  CandidatesList,
  OpsCandidateProfile,
  MatchesOverview,
  LOIQueue,
  TrainingManagement,
  GrantsManagement,
  TemplatesPage,
  AnalyticsDashboard,
} from './pages/placement/ops';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ============================================ */}
            {/* PUBLIC ROUTES (Placement Portal) */}
            {/* ============================================ */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/ai-skill-framework" element={<AISkillFramework />} />
              <Route path="/request-talent" element={<RequestTalent />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<DemoLogin />} />
            </Route>

            {/* ============================================ */}
            {/* EMPLOYER PORTAL */}
            {/* ============================================ */}
            <Route
              path="/employer"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['employer_owner', 'employer_hr']}>
                    <EmployerLayout />
                  </RoleGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployerDashboard />} />
              <Route path="roles" element={<RolesList />} />
              <Route path="roles/new" element={<NewRoleRequest />} />
              <Route path="roles/:id" element={<RoleDetail />} />
              <Route path="candidates/:id" element={<CandidateProfile />} />
              <Route path="loi/:id" element={<LOIStatus />} />
              <Route path="training" element={<TrainingOverview />} />
              <Route path="settings" element={<EmployerSettings />} />
            </Route>

            {/* ============================================ */}
            {/* AIHQ OPS COCKPIT */}
            {/* ============================================ */}
            <Route
              path="/ops"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['aihq_admin', 'aihq_placement_ops', 'aihq_training_ops']}>
                    <OpsLayout />
                  </RoleGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<OpsDashboard />} />
              <Route path="employers" element={<EmployersList />} />
              <Route path="employers/:id" element={<EmployerDetail />} />
              <Route path="roles" element={<RoleRequestsList />} />
              <Route path="roles/:id" element={<OpsRoleDetail />} />
              <Route path="candidates" element={<CandidatesList />} />
              <Route path="candidates/:id" element={<OpsCandidateProfile />} />
              <Route path="matches" element={<MatchesOverview />} />
              <Route path="loi" element={<LOIQueue />} />
              <Route path="training" element={<TrainingManagement />} />
              <Route path="grants" element={<GrantsManagement />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>

            {/* ============================================ */}
            {/* STAFF PORTAL (existing) */}
            {/* ============================================ */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="participant-manager" element={<Index />} />
              <Route path="birthday-dashboard" element={<BirthdayDashboard />} />
              <Route path="register-tracker" element={<RegisterTracker />} />
              <Route path="crm-tracker" element={<CRMTracker />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
