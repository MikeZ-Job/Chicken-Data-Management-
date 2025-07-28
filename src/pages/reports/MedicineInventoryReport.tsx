import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface MedicineInventoryItem {
  id: number;
  medicine_name: string;
  quantity: number;
  date_received: string;
  expiry_date: string;
}

export default function MedicineInventoryReport() {
  const [medicineInventory, setMedicineInventory] = useState<MedicineInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchMedicineInventory();
  }, [selectedFarm]);

  const fetchMedicineInventory = async () => {
    if (!selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('medicine_inventory')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('date_received', { ascending: false });

      if (error) throw error;
      setMedicineInventory(data || []);
    } catch (error) {
      console.error('Error fetching medicine inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalMedicines = medicineInventory.length;
  const totalQuantity = medicineInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const expiredMedicines = medicineInventory.filter(item => new Date(item.expiry_date) < new Date()).length;
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
            <h1 className="text-3xl font-bold">Medicine Inventory Report</h1>
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
              <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMedicines}</div>
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
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredMedicines}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valid Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalMedicines - expiredMedicines}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Medicine Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days to Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicineInventory.map((item) => {
                  const expiryDate = new Date(item.expiry_date);
                  const today = new Date();
                  const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  
                  let status = "Good";
                  let statusColor = "text-green-600";
                  
                  if (daysToExpiry < 0) {
                    status = "Expired";
                    statusColor = "text-red-600";
                  } else if (daysToExpiry <= 30) {
                    status = "Expiring Soon";
                    statusColor = "text-yellow-600";
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.medicine_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{new Date(item.date_received).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>{daysToExpiry}</TableCell>
                      <TableCell className={statusColor}>{status}</TableCell>
                    </TableRow>
                  );
                })}
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