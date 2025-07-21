import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddFoodInventory from "./pages/AddFoodInventory";
import ViewFoodInventory from "./pages/ViewFoodInventory";
import AddChickenInventory from "./pages/AddChickenInventory";
import ViewChickenInventory from "./pages/ViewChickenInventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add-food-inventory" element={<AddFoodInventory />} />
          <Route path="/view-food-inventory" element={<ViewFoodInventory />} />
          <Route path="/add-chicken-inventory" element={<AddChickenInventory />} />
          <Route path="/view-chicken-inventory" element={<ViewChickenInventory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
