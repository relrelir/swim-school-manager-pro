
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import SeasonPage from "./pages/SeasonPage";
import ProductsPage from "./pages/ProductsPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import ReportPage from "./pages/ReportPage";
import DailyActivityPage from "./pages/DailyActivityPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<SeasonPage />} />
                <Route path="/season/:seasonId/products" element={<ProductsPage />} />
                <Route path="/product/:productId/participants" element={<ParticipantsPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/daily-activity" element={<DailyActivityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
