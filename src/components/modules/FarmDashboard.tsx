import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Heart, Egg, DollarSign, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import { useFarmData } from "@/contexts/FarmDataContext";

export default function FarmDashboard() {
  const { getSummary, data } = useFarmData();
  const summary = getSummary();

  const summaryCards = [
    {
      title: "Food Inventory",
      value: `${summary.totalFoodItems} kg`,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: `${data.food.length} items in stock`
    },
    {
      title: "Chicken Health",
      value: `${summary.healthyChickens}/${summary.healthyChickens + summary.sickChickens}`,
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${summary.sickChickens} chickens need attention`
    },
    {
      title: "Egg Production",
      value: `${summary.totalEggs}`,
      icon: Egg,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: `${data.eggProduction.length} production records`
    },
    {
      title: "Total Sales",
      value: `$${summary.totalSales.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${data.sales.length} transactions`
    },
    {
      title: "Total Expenses",
      value: `$${summary.totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: `${data.expenses.length} expense records`
    },
    {
      title: "Net Profit",
      value: `$${(summary.totalSales - summary.totalExpenses).toFixed(2)}`,
      icon: DollarSign,
      color: summary.totalSales > summary.totalExpenses ? "text-green-600" : "text-red-600",
      bgColor: summary.totalSales > summary.totalExpenses ? "bg-green-50" : "bg-red-50",
      description: "Revenue - Expenses"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Farm Management</h1>
        <p className="text-blue-100">
          Monitor your chicken farm operations, track production, and manage inventory all in one place.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color} mb-1`}>
                {card.value}
              </div>
              <p className="text-xs text-gray-500">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sales.slice(0, 3).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{sale.item}</p>
                    <p className="text-sm text-gray-500">{sale.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${sale.totalAmount}</p>
                    <p className="text-xs text-gray-500">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.chickenHealth.filter(h => h.healthStatus !== 'healthy').slice(0, 3).map((health) => (
                <div key={health.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">Chicken {health.chickenId}</p>
                    <p className="text-sm text-gray-500">{health.notes}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      health.healthStatus === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {health.healthStatus}
                    </span>
                  </div>
                </div>
              ))}
              {data.chickenHealth.filter(h => h.healthStatus !== 'healthy').length === 0 && (
                <p className="text-gray-500 text-center py-4">No health alerts! All chickens are healthy. 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}