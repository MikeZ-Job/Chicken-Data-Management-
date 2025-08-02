import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
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
import FoodInventoryReport from "./pages/reports/FoodInventoryReport";
import ChickenInventoryReport from "./pages/reports/ChickenInventoryReport";
import MedicineInventoryReport from "./pages/reports/MedicineInventoryReport";
import WorkerFoodReport from "./pages/reports/WorkerFoodReport";
import ProcessingRecordsReport from "./pages/reports/ProcessingRecordsReport";
import FarmSummaryReport from "./pages/reports/FarmSummaryReport";
import { FarmProvider } from "./contexts/FarmContext";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FarmProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/add-food-inventory" element={<Layout><AddFoodInventory /></Layout>} />
              <Route path="/view-food-inventory" element={<Layout><ViewFoodInventory /></Layout>} />
              <Route path="/add-chicken-inventory" element={<Layout><AddChickenInventory /></Layout>} />
              <Route path="/view-chicken-inventory" element={<Layout><ViewChickenInventory /></Layout>} />
              <Route path="/add-medicine-inventory" element={<Layout><AddMedicineInventory /></Layout>} />
              <Route path="/view-medicine-inventory" element={<Layout><ViewMedicineInventory /></Layout>} />
              <Route path="/add-worker-food" element={<Layout><AddWorkerFood /></Layout>} />
              <Route path="/view-worker-food" element={<Layout><ViewWorkerFood /></Layout>} />
              <Route path="/add-processing-record" element={<Layout><AddProcessingRecord /></Layout>} />
              <Route path="/view-processing-records" element={<Layout><ViewProcessingRecords /></Layout>} />
              <Route path="/admin-panel" element={<Layout><AdminPanel /></Layout>} />
              <Route path="/reports/food-inventory" element={<Layout><FoodInventoryReport /></Layout>} />
              <Route path="/reports/chicken-inventory" element={<Layout><ChickenInventoryReport /></Layout>} />
              <Route path="/reports/medicine-inventory" element={<Layout><MedicineInventoryReport /></Layout>} />
              <Route path="/reports/worker-food" element={<Layout><WorkerFoodReport /></Layout>} />
              <Route path="/reports/processing-records" element={<Layout><ProcessingRecordsReport /></Layout>} />
              <Route path="/reports/farm-summary" element={<Layout><FarmSummaryReport /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FarmProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
