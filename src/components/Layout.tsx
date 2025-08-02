import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useFarm } from "@/contexts/FarmContext";
import { FarmSelector } from "@/components/FarmSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Menu, 
  X, 
  Home, 
  Plus, 
  Eye, 
  Bird, 
  Pill, 
  Users,
  ArrowLeft,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

const sidebarGroups = [
  {
    title: "Farm Management",
    collapsible: false,
    items: [
      { name: "Dashboard", path: "/" },
    ]
  },
  {
    title: "Food Inventory",
    collapsible: true,
    items: [
      { name: "Add Food Inventory", path: "/add-food-inventory" },
      { name: "View Food Inventory", path: "/view-food-inventory" },
    ]
  },
  {
    title: "Chicken Inventory",
    collapsible: true,
    items: [
      { name: "Add Chicken Inventory", path: "/add-chicken-inventory" },
      { name: "View Chicken Inventory", path: "/view-chicken-inventory" },
    ]
  },
  {
    title: "Medicine Inventory",
    collapsible: true,
    items: [
      { name: "Add Medicine Inventory", path: "/add-medicine-inventory" },
      { name: "View Medicine Inventory", path: "/view-medicine-inventory" },
    ]
  },
  {
    title: "Worker Food Records",
    collapsible: true,
    items: [
      { name: "Add Worker Food", path: "/add-worker-food" },
      { name: "View Worker Food", path: "/view-worker-food" },
    ]
  },
  {
    title: "Processing Records",
    collapsible: true,
    items: [
      { name: "Add Processing Record", path: "/add-processing-record" },
      { name: "View Processing Records", path: "/view-processing-records" },
    ]
  },
  {
    title: "Reports",
    collapsible: true,
    items: [
      { name: "Food Inventory Report", path: "/reports/food-inventory" },
      { name: "Chicken Inventory Report", path: "/reports/chicken-inventory" },
      { name: "Medicine Inventory Report", path: "/reports/medicine-inventory" },
      { name: "Worker Food Report", path: "/reports/worker-food" },
      { name: "Processing Records Report", path: "/reports/processing-records" },
      { name: "Farm Summary Report", path: "/reports/farm-summary" },
    ]
  },
  {
    title: "Admin Panel",
    collapsible: false,
    items: [
      { name: "Admin Panel", path: "/admin-panel" },
    ]
  },
];

export const Layout = ({ children, showBackButton = false }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 6])); // Default: Farm Management and Admin Panel always expanded
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { selectedFarm } = useFarm();

  // Auto-expand section if it contains the current active route
  const getExpandedSectionsWithActive = () => {
    const expanded = new Set(expandedSections);
    sidebarGroups.forEach((group, index) => {
      if (group.collapsible && group.items.some(item => item.path === location.pathname)) {
        expanded.add(index);
      }
    });
    return expanded;
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h1 className="text-xl font-bold">Farm Management</h1>
            {selectedFarm && (
              <p className="text-sm text-slate-400 mt-1">
                {selectedFarm.farm_name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarGroups.map((group, groupIndex) => {
              const currentExpandedSections = getExpandedSectionsWithActive();
              const isExpanded = !group.collapsible || currentExpandedSections.has(groupIndex);
              
              return (
                <div key={groupIndex}>
                  <div 
                    className={cn(
                      "flex items-center justify-between px-3 py-2 mb-1",
                      group.collapsible 
                        ? "cursor-pointer hover:bg-slate-800 rounded-lg transition-colors" 
                        : ""
                    )}
                    onClick={group.collapsible ? () => toggleSection(groupIndex) : undefined}
                  >
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {group.title}
                    </h3>
                    {group.collapsible && (
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <ul className="space-y-1 mb-3">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={cn(
                                "flex items-center px-3 py-2 rounded-lg transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top navigation bar */}
        <header className="bg-background border-b border-border px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
          
          <h2 className="text-lg font-semibold text-foreground ml-auto lg:ml-0">
            Chicken Farm Management System
          </h2>
          
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <FarmSelector />
            <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};