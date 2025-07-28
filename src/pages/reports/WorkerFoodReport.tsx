import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface WorkerFoodItem {
  id: number;
  worker_id: string;
  food_type: string;
  quantity: number;
  date_provided: string;
}

export default function WorkerFoodReport() {
  const [workerFood, setWorkerFood] = useState<WorkerFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchWorkerFood();
  }, [selectedFarm]);

  const fetchWorkerFood = async () => {
    if (!selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('worker_food')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('date_provided', { ascending: false });

      if (error) throw error;
      setWorkerFood(data || []);
    } catch (error) {
      console.error('Error fetching worker food:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRecords = workerFood.length;
  const totalQuantity = workerFood.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const uniqueWorkers = new Set(workerFood.map(item => item.worker_id)).size;
  const workerSummary = workerFood.reduce((acc, item) => {
    if (!acc[item.worker_id]) {
      acc[item.worker_id] = { totalQuantity: 0, records: 0 };
    }
    acc[item.worker_id].totalQuantity += item.quantity || 0;
    acc[item.worker_id].records += 1;
    return acc;
  }, {} as Record<string, { totalQuantity: number; records: number }>);
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
            <h1 className="text-3xl font-bold">Worker Food Report</h1>
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
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords}</div>
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
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueWorkers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg per Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {uniqueWorkers > 0 ? Math.round(totalQuantity / uniqueWorkers) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Worker Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Total Quantity Provided</TableHead>
                  <TableHead>Number of Records</TableHead>
                  <TableHead>Average per Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(workerSummary).map(([workerId, summary]) => (
                  <TableRow key={workerId}>
                    <TableCell className="font-medium">{workerId}</TableCell>
                    <TableCell>{summary.totalQuantity}</TableCell>
                    <TableCell>{summary.records}</TableCell>
                    <TableCell>{Math.round(summary.totalQuantity / summary.records)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Worker Food Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Food Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date Provided</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workerFood.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.worker_id}</TableCell>
                    <TableCell>{item.food_type}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{new Date(item.date_provided).toLocaleDateString()}</TableCell>
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