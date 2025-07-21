
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import TrainingOutlineCreator from "./pages/TrainingOutlineCreator";
import CertificateGenerator from "./pages/CertificateGenerator";
import RegisterTracker from "./pages/RegisterTracker";
import CRMTracker from "./pages/CRMTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/training-outline" element={<TrainingOutlineCreator />} />
          <Route path="/certificates" element={<CertificateGenerator />} />
          <Route path="/register-tracker" element={<RegisterTracker />} />
          <Route path="/crm-tracker" element={<CRMTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
