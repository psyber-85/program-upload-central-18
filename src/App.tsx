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

// Placeholder pages (for remaining phases - Ops Cockpit)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  </div>
);

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
              <Route index element={<PlaceholderPage title="Ops Dashboard" />} />
              <Route path="employers" element={<PlaceholderPage title="All Employers" />} />
              <Route path="employers/:id" element={<PlaceholderPage title="Employer Details" />} />
              <Route path="roles" element={<PlaceholderPage title="All Role Requests" />} />
              <Route path="roles/:id" element={<PlaceholderPage title="Role Details" />} />
              <Route path="candidates" element={<PlaceholderPage title="All Candidates" />} />
              <Route path="candidates/:id" element={<PlaceholderPage title="Candidate Profile" />} />
              <Route path="matches" element={<PlaceholderPage title="Matches" />} />
              <Route path="loi" element={<PlaceholderPage title="LOI Queue" />} />
              <Route path="training" element={<PlaceholderPage title="Training" />} />
              <Route path="grants" element={<PlaceholderPage title="Grants" />} />
              <Route path="templates" element={<PlaceholderPage title="Templates" />} />
              <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
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
