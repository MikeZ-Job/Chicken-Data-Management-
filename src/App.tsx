import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AddFoodInventory from "./pages/AddFoodInventory";
import ViewFoodInventory from "./pages/ViewFoodInventory";
import AddChickenInventory from "./pages/AddChickenInventory";
import ViewChickenInventory from "./pages/ViewChickenInventory";
import AddMedicineInventory from "./pages/AddMedicineInventory";
import ViewMedicineInventory from "./pages/ViewMedicineInventory";
import AddWorkerFood from "./pages/AddWorkerFood";
import ViewWorkerFood from "./pages/ViewWorkerFood";
import AddProcessingRecord from "./pages/AddProcessingRecord";
import ViewProcessingRecords from "./pages/ViewProcessingRecords";
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { FarmProvider } from "./contexts/FarmContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FarmProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/add-food-inventory" element={
              <ProtectedRoute>
                <AddFoodInventory />
              </ProtectedRoute>
            } />
            <Route path="/view-food-inventory" element={
              <ProtectedRoute>
                <ViewFoodInventory />
              </ProtectedRoute>
            } />
            <Route path="/add-chicken-inventory" element={
              <ProtectedRoute>
                <AddChickenInventory />
              </ProtectedRoute>
            } />
            <Route path="/view-chicken-inventory" element={
              <ProtectedRoute>
                <ViewChickenInventory />
              </ProtectedRoute>
            } />
            <Route path="/add-medicine-inventory" element={
              <ProtectedRoute>
                <AddMedicineInventory />
              </ProtectedRoute>
            } />
            <Route path="/view-medicine-inventory" element={
              <ProtectedRoute>
                <ViewMedicineInventory />
              </ProtectedRoute>
            } />
            <Route path="/add-worker-food" element={
              <ProtectedRoute>
                <AddWorkerFood />
              </ProtectedRoute>
            } />
            <Route path="/view-worker-food" element={
              <ProtectedRoute>
                <ViewWorkerFood />
              </ProtectedRoute>
            } />
            <Route path="/add-processing-record" element={
              <ProtectedRoute>
                <AddProcessingRecord />
              </ProtectedRoute>
            } />
            <Route path="/view-processing-records" element={
              <ProtectedRoute>
                <ViewProcessingRecords />
              </ProtectedRoute>
            } />
            <Route path="/admin-panel" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </FarmProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
