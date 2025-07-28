import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface ChickenInventoryItem {
  id: number;
  breed: string;
  age: number;
  health_status: string;
  date_added: string;
  date_removed: string;
}

export default function ChickenInventoryReport() {
  const [chickenInventory, setChickenInventory] = useState<ChickenInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchChickenInventory();
  }, [selectedFarm]);

  const fetchChickenInventory = async () => {
    if (!selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('chicken_inventory')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('date_added', { ascending: false });

      if (error) throw error;
      setChickenInventory(data || []);
    } catch (error) {
      console.error('Error fetching chicken inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalChickens = chickenInventory.length;
  const activeChickens = chickenInventory.filter(item => !item.date_removed).length;
  const breedCounts = chickenInventory.reduce((acc, item) => {
    acc[item.breed] = (acc[item.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Chicken Inventory Report</h1>
            <p className="text-muted-foreground mt-1">
              Farm: {selectedFarm?.farm_name} | Generated: {currentDate}
            </p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Chickens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChickens}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Chickens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeChickens}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Breeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(breedCounts).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Removed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChickens - activeChickens}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Breed Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(breedCounts).map(([breed, count]) => (
                  <div key={breed} className="flex justify-between">
                    <span>{breed}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Health Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  chickenInventory.reduce((acc, item) => {
                    acc[item.health_status || 'Unknown'] = (acc[item.health_status || 'Unknown'] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span>{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Chicken Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Age (days)</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Date Removed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chickenInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.breed}</TableCell>
                    <TableCell>{item.age}</TableCell>
                    <TableCell>{item.health_status}</TableCell>
                    <TableCell>{new Date(item.date_added).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {item.date_removed ? new Date(item.date_removed).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={item.date_removed ? "text-red-600" : "text-green-600"}>
                        {item.date_removed ? "Removed" : "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Report generated on {new Date().toLocaleString()}</p>
          <p>Farm Management System</p>
        </div>
      </div>
    </Layout>
  );
}