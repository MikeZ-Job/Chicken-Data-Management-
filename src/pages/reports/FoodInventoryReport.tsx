import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface FoodInventoryItem {
  id: number;
  food_type: string;
  quantity: number;
  supplier: string;
  date_received: string;
  expiry_date: string;
}

export default function FoodInventoryReport() {
  const [foodInventory, setFoodInventory] = useState<FoodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchFoodInventory();
  }, [selectedFarm]);

  const fetchFoodInventory = async () => {
    if (!selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('food_inventory')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('date_received', { ascending: false });

      if (error) throw error;
      setFoodInventory(data || []);
    } catch (error) {
      console.error('Error fetching food inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = foodInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const currentDate = new Date().toLocaleDateString();

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 print:p-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 print:mb-4">
          <div>
            <h1 className="text-3xl font-bold print:text-2xl">Food Inventory Report</h1>
            <p className="text-muted-foreground mt-1">
              Farm: {selectedFarm?.farm_name} | Generated: {currentDate}
            </p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{foodInventory.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuantity}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Food Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(foodInventory.map(item => item.food_type)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Food Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodInventory.map((item) => {
                  const expiryDate = new Date(item.expiry_date);
                  const today = new Date();
                  const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  
                  let status = "Good";
                  let statusColor = "text-green-600";
                  
                  if (daysToExpiry < 0) {
                    status = "Expired";
                    statusColor = "text-red-600";
                  } else if (daysToExpiry <= 7) {
                    status = "Expiring Soon";
                    statusColor = "text-yellow-600";
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.food_type}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{new Date(item.date_received).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell className={statusColor}>{status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground print:mt-6">
          <p>Report generated on {new Date().toLocaleString()}</p>
          <p>Farm Management System</p>
        </div>
      </div>
    </Layout>
  );
}