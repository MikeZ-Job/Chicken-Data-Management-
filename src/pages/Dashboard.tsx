import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Home, Package, Bird, Pill, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState({
    foodItems: 0,
    chickens: 0,
    medicineItems: 0,
    workerFoodRecords: 0
  });
  const [loading, setLoading] = useState(true);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodResult, chickenResult, medicineResult, workerFoodResult] = await Promise.all([
          supabase.from('food_inventory').select('id', { count: 'exact' }),
          supabase.from('chicken_inventory').select('id', { count: 'exact' }),
          supabase.from('medicine_inventory').select('id', { count: 'exact' }),
          supabase.from('worker_food').select('id', { count: 'exact' })
        ]);

        setSummaryData({
          foodItems: foodResult.count || 0,
          chickens: chickenResult.count || 0,
          medicineItems: medicineResult.count || 0,
          workerFoodRecords: workerFoodResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const summaryCards = [
    {
      title: "Food Inventory Items",
      value: summaryData.foodItems,
      description: "Total food items in stock",
      icon: Package,
      color: "text-green-600"
    },
    {
      title: "Chickens",
      value: summaryData.chickens,
      description: "Total chickens in inventory",
      icon: Bird,
      color: "text-blue-600"
    },
    {
      title: "Medicine Items",
      value: summaryData.medicineItems,
      description: "Total medicine items in stock",
      icon: Pill,
      color: "text-red-600"
    },
    {
      title: "Worker Food Records",
      value: summaryData.workerFoodRecords,
      description: "Total worker food entries",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Overview of your chicken farm operations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for farm management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link 
                to="/add-food-inventory" 
                className="flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
              >
                <Package className="h-4 w-4 text-green-600" />
                <span>Add new food inventory items</span>
              </Link>
              <Link 
                to="/add-chicken-inventory" 
                className="flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
              >
                <Bird className="h-4 w-4 text-blue-600" />
                <span>Register new chickens</span>
              </Link>
              <Link 
                to="/add-medicine-inventory" 
                className="flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
              >
                <Pill className="h-4 w-4 text-red-600" />
                <span>Stock medicine supplies</span>
              </Link>
              <Link 
                to="/add-worker-food" 
                className="flex items-center gap-2 text-sm hover:bg-muted p-2 rounded-md transition-colors"
              >
                <Users className="h-4 w-4 text-purple-600" />
                <span>Record worker food distribution</span>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Status:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated:</span>
                <span className="text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Data Storage:</span>
                <span className="text-muted-foreground">Local</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;