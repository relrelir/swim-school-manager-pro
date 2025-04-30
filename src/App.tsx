
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Layout from "@/components/layout/Layout";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import ProductsPage from "@/pages/ProductsPage";
import SeasonPage from "@/pages/SeasonPage";
import ParticipantsPage from "@/pages/ParticipantsPage";
import ReportPage from "@/pages/ReportPage";
import DailyActivityPage from "@/pages/DailyActivityPage";
import LoginPage from "@/pages/LoginPage";
import HealthFormPage from "@/pages/HealthFormPage";
import FormSuccessPage from "@/pages/FormSuccessPage";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public routes that don't require layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/health-form/:formId" element={<HealthFormPage />} />
            <Route path="/form-success" element={<FormSuccessPage />} />
            
            {/* Routes with layout - using Outlet as children */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route index element={<Index />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/season/:seasonId" element={<SeasonPage />} />
              <Route path="/product/:productId/participants" element={<ParticipantsPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/daily-activity" element={<DailyActivityPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
