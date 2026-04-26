import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import { MerchantShell } from "@/components/MerchantShell";
import Home from "./pages/Home";
import ExploreList from "./pages/ExploreList";
import ExploreMap from "./pages/ExploreMap";
import Preferences from "./pages/Preferences";
import Detail from "./pages/Detail";
import Redeem from "./pages/Redeem";
import MerchantRules from "./pages/merchant/MerchantRules";
import MerchantOffers from "./pages/merchant/MerchantOffers";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Navigate to="/explore/list" replace />} />
            <Route path="/explore/list" element={<ExploreList />} />
            <Route path="/explore/map" element={<ExploreMap />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/redeem" element={<Redeem />} />
          </Route>
          <Route path="/merchant" element={<MerchantShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MerchantDashboard />} />
            <Route path="offers" element={<MerchantOffers />} />
            <Route path="rules" element={<MerchantRules />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
