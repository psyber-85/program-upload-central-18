import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import PublicHome from "./pages/PublicHome";
import NotFound from "./pages/NotFound";

// Staff Portal
import PortalLayout from "./components/staff/PortalLayout";
import StaffHome from "./pages/staff/StaffHome";

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
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicHome />} />
          
          {/* Staff Portal routes */}
          <Route path="/staff" element={<PortalLayout />}>
            <Route index element={<StaffHome />} />
          </Route>
          
          {/* Marketing Portal routes (nested under /staff/marketing) */}
          <Route path="/staff/marketing" element={<MarketingLayout />}>
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
