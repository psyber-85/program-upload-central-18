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

// Placeholder pages (to be built in Phase 2)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">Coming in Phase 2</p>
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
              <Route path="/" element={<PlaceholderPage title="AIHQ Talent Placement" />} />
              <Route path="/how-it-works" element={<PlaceholderPage title="How It Works" />} />
              <Route path="/ai-skill-framework" element={<PlaceholderPage title="AI Skill Framework" />} />
              <Route path="/request-talent" element={<PlaceholderPage title="Request Talent" />} />
              <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
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
              <Route index element={<PlaceholderPage title="Placement Overview" />} />
              <Route path="roles" element={<PlaceholderPage title="Role Requests" />} />
              <Route path="roles/new" element={<PlaceholderPage title="New Role Request" />} />
              <Route path="roles/:id" element={<PlaceholderPage title="Role Details" />} />
              <Route path="candidates/:id" element={<PlaceholderPage title="Candidate Profile" />} />
              <Route path="loi/:id" element={<PlaceholderPage title="LOI Status" />} />
              <Route path="training" element={<PlaceholderPage title="Training Overview" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
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
