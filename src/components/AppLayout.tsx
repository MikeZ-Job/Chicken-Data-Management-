import { useState } from "react";
import { Home, Package, Bird, Egg, DollarSign, Receipt, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Module components - placeholders for now
import Dashboard from "@/pages/Dashboard";

const FoodInventoryModule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Food Inventory Management</h2>
    <p className="text-muted-foreground">Manage all food-related inventory here.</p>
    {/* This will be replaced with actual food inventory content */}
  </div>
);

const ChickenHealthModule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Chicken Health</h2>
    <p className="text-muted-foreground">Monitor and manage chicken health records.</p>
    {/* This will be replaced with actual chicken health content */}
  </div>
);

const EggProductionModule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Egg Production</h2>
    <p className="text-muted-foreground">Track and manage egg production data.</p>
    {/* This will be replaced with actual egg production content */}
  </div>
);

const SalesModule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Sales Management</h2>
    <p className="text-muted-foreground">Manage sales and revenue tracking.</p>
    {/* This will be replaced with actual sales content */}
  </div>
);

const ExpensesModule = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Expenses Management</h2>
    <p className="text-muted-foreground">Track and manage farm expenses.</p>
    {/* This will be replaced with actual expenses content */}
  </div>
);

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    component: Dashboard,
  },
  {
    title: "Food Inventory",
    icon: Package,
    component: FoodInventoryModule,
  },
  {
    title: "Chicken Health",
    icon: Bird,
    component: ChickenHealthModule,
  },
  {
    title: "Egg Production",
    icon: Egg,
    component: EggProductionModule,
  },
  {
    title: "Sales",
    icon: DollarSign,
    component: SalesModule,
  },
  {
    title: "Expenses",
    icon: Receipt,
    component: ExpensesModule,
  },
];

function AppSidebar({ activeModule, setActiveModule }: { 
  activeModule: string; 
  setActiveModule: (module: string) => void; 
}) {
  return (
    <Sidebar className="border-r bg-blue-50 dark:bg-blue-950">
      <SidebarContent>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">
            Farm ERP
          </h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-800 dark:text-blue-200">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setActiveModule(item.title)}
                    className={`w-full justify-start rounded-lg transition-colors ${
                      activeModule === item.title
                        ? "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100"
                        : "text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AppLayout() {
  const [activeModule, setActiveModule] = useState("Dashboard");

  const ActiveComponent = menuItems.find(item => item.title === activeModule)?.component || Dashboard;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        
        <div className="flex-1 flex flex-col">
          {/* Header with mobile menu trigger */}
          <header className="border-b bg-white dark:bg-gray-950 p-4 lg:hidden">
            <SidebarTrigger />
          </header>
          
          {/* Main content area */}
          <main className="flex-1 bg-white dark:bg-gray-950 overflow-auto">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}