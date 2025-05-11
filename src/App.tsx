
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import SeasonPage from "./pages/SeasonPage";
import ProductsPage from "./pages/ProductsPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import ReportPage from "./pages/ReportPage";
import DailyActivityPage from "./pages/DailyActivityPage";
import HealthFormPage from "./pages/HealthFormPage";
import FormSuccessPage from "./pages/FormSuccessPage";
import PrintableHealthDeclarationPage from "./pages/PrintableHealthDeclarationPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PoolsPage from "./pages/PoolsPage";

// Role-based route protection component
const ProtectedRoute = ({ 
  element, 
  requiredRole 
}: { 
  element: JSX.Element, 
  requiredRole?: 'admin' | 'viewer' 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If a specific role is required and user doesn't have it
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

// יצירת לקוח עבור React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes for health declaration form */}
      <Route path="/health-form/:token" element={<HealthFormPage />} />
      <Route path="/health-form" element={<HealthFormPage />} />
      <Route path="/form-success" element={<FormSuccessPage />} />
      <Route path="/print/health-declaration" element={<PrintableHealthDeclarationPage />} />
      
      {/* App routes wrapped in layout */}
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<SeasonPage />} />
      
        <Route path="/product/:productId/participants" element={<ParticipantsPage />} />
        <Route 
          path="/report" 
          element={<ProtectedRoute element={<ReportPage />} requiredRole="admin" />} 
        />
        <Route path="/daily-activity" element={<DailyActivityPage />} />
        <Route path="/season/:seasonId/pools" element={<PoolsPage />} />
        <Route path="/season/:seasonId/pool/:poolId/products" element={<ProductsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <Toaster />
        <Sonner position="bottom-left" className="rtl" />
        <BrowserRouter>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-background font-inter antialiased">
              <AppRoutes />
            </div>
          </TooltipProvider>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
