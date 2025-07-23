import { useState } from "react";
import { Home, Package, Heart, Egg, DollarSign, Receipt, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarmData } from "@/contexts/FarmDataContext";

// Import module components
import FarmDashboard from "./modules/FarmDashboard";
import FoodInventoryModule from "./modules/FoodInventoryModule";
import ChickenHealthModule from "./modules/ChickenHealthModule";
import EggProductionModule from "./modules/EggProductionModule";
import SalesModule from "./modules/SalesModule";
import ExpensesModule from "./modules/ExpensesModule";

type ModuleType = 
  | "Dashboard" 
  | "Add Food Inventory" 
  | "View Food Inventory" 
  | "Add Chicken Inventory" 
  | "View Chicken Inventory" 
  | "Add Medicine Inventory" 
  | "View Medicine Inventory" 
  | "Add Worker Food" 
  | "View Worker Food";

const menuItems = [
  {
    title: "Dashboard" as ModuleType,
    icon: Home,
    component: FarmDashboard,
  },
  {
    title: "Add Food Inventory" as ModuleType,
    icon: Package,
    component: () => <div>Add Food Inventory Module</div>,
  },
  {
    title: "View Food Inventory" as ModuleType,
    icon: Package,
    component: () => <div>View Food Inventory Module</div>,
  },
  {
    title: "Add Chicken Inventory" as ModuleType,
    icon: Heart,
    component: () => <div>Add Chicken Inventory Module</div>,
  },
  {
    title: "View Chicken Inventory" as ModuleType,
    icon: Heart,
    component: () => <div>View Chicken Inventory Module</div>,
  },
  {
    title: "Add Medicine Inventory" as ModuleType,
    icon: Package,
    component: () => <div>Add Medicine Inventory Module</div>,
  },
  {
    title: "View Medicine Inventory" as ModuleType,
    icon: Package,
    component: () => <div>View Medicine Inventory Module</div>,
  },
  {
    title: "Add Worker Food" as ModuleType,
    icon: Package,
    component: () => <div>Add Worker Food Module</div>,
  },
  {
    title: "View Worker Food" as ModuleType,
    icon: Package,
    component: () => <div>View Worker Food Module</div>,
  },
];

export default function FarmLayout() {
  const [activeModule, setActiveModule] = useState<ModuleType>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = menuItems.find(item => item.title === activeModule)?.component || FarmDashboard;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">🐔 Farm ERP</h1>
              <button 
                className="lg:hidden text-white hover:text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <button
                    onClick={() => {
                      setActiveModule(item.title);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors
                      ${activeModule === item.title
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-2">
                {activeModule !== "Dashboard" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveModule("Dashboard")}
                    className="text-gray-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                )}
                <h2 className="text-2xl font-semibold text-gray-800">{activeModule}</h2>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}