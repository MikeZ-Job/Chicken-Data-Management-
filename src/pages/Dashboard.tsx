import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Utensils, Bird, Pill, Users } from "lucide-react";

const Dashboard = () => {
  const dashboardItems = [
    {
      title: "Add Food",
      description: "Add new food items to inventory",
      link: "/add-food-inventory",
      icon: Plus,
      variant: "default" as const
    },
    {
      title: "View Food Inventory",
      description: "View and manage food inventory",
      link: "/view-food-inventory",
      icon: Utensils,
      variant: "outline" as const
    },
    {
      title: "Add Chicken",
      description: "Add new chickens to inventory",
      link: "/add-chicken-inventory",
      icon: Plus,
      variant: "default" as const
    },
    {
      title: "View Chicken Inventory",
      description: "View and manage chicken inventory",
      link: "/view-chicken-inventory",
      icon: Bird,
      variant: "outline" as const
    },
    {
      title: "Add Medicine",
      description: "Add new medicines to inventory",
      link: "/add-medicine-inventory",
      icon: Plus,
      variant: "default" as const
    },
    {
      title: "View Medicine Inventory",
      description: "View and manage medicine inventory",
      link: "/view-medicine-inventory",
      icon: Pill,
      variant: "outline" as const
    },
    {
      title: "Add Worker Food",
      description: "Record food provided to workers",
      link: "/add-worker-food",
      icon: Plus,
      variant: "default" as const
    },
    {
      title: "View Worker Food",
      description: "View worker food records",
      link: "/view-worker-food",
      icon: Users,
      variant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Farm Management Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage all your farm inventory from one place
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((item) => (
            <Card key={item.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  {item.title}
                </CardTitle>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant={item.variant} className="w-full">
                  <Link to={item.link}>
                    {item.variant === "default" ? "Add New" : "View All"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;