import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface ProcessingRecord {
  id: number;
  Processing_date: string;
  Total_Number_of_Chicken: number;
  total_weight_kg: number;
  avg_weight_per_chicken: number;
  num_crates: number;
  stack_no: string;
  mortality: number;
  missing_chickens: number;
  manure_kg: number;
  remarks: string;
}

export default function ProcessingRecordsReport() {
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchProcessingRecords();
  }, [selectedFarm]);

  const fetchProcessingRecords = async () => {
    if (!selectedFarm) return;

    try {
      const { data, error } = await supabase
        .from('Chicken Processing')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('Processing_date', { ascending: false });

      if (error) throw error;
      setProcessingRecords(data || []);
    } catch (error) {
      console.error('Error fetching processing records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRecords = processingRecords.length;
  const totalChickensProcessed = processingRecords.reduce((sum, record) => sum + (record.Total_Number_of_Chicken || 0), 0);
  const totalWeight = processingRecords.reduce((sum, record) => sum + (record.total_weight_kg || 0), 0);
  const totalMortality = processingRecords.reduce((sum, record) => sum + (record.mortality || 0), 0);
  const totalMissingChickens = processingRecords.reduce((sum, record) => sum + (record.missing_chickens || 0), 0);
  const totalManure = processingRecords.reduce((sum, record) => sum + (record.manure_kg || 0), 0);
  const avgWeightOverall = totalChickensProcessed > 0 ? totalWeight / totalChickensProcessed : 0;
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
            <h1 className="text-3xl font-bold">Processing Records Report</h1>
            <p className="text-muted-foreground mt-1">
              Farm: {selectedFarm?.farm_name} | Generated: {currentDate}
            </p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
              <CardTitle className="text-sm font-medium">Total Chickens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChickensProcessed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Weight (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWeight.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Weight (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgWeightOverall.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Mortality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalMortality}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Manure (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalManure.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Mortality Rate:</span>
                  <span className="font-bold">
                    {totalChickensProcessed > 0 ? 
                      ((totalMortality / totalChickensProcessed) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Missing Rate:</span>
                  <span className="font-bold">
                    {totalChickensProcessed > 0 ? 
                      ((totalMissingChickens / totalChickensProcessed) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-bold text-green-600">
                    {totalChickensProcessed > 0 ? 
                      (((totalChickensProcessed - totalMortality - totalMissingChickens) / totalChickensProcessed) * 100).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  processingRecords.reduce((acc, record) => {
                    const month = new Date(record.Processing_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    });
                    if (!acc[month]) acc[month] = { records: 0, chickens: 0 };
                    acc[month].records += 1;
                    acc[month].chickens += record.Total_Number_of_Chicken || 0;
                    return acc;
                  }, {} as Record<string, { records: number; chickens: number }>)
                ).map(([month, data]) => (
                  <div key={month} className="flex justify-between text-sm">
                    <span>{month}</span>
                    <span className="font-bold">{data.chickens} chickens ({data.records} records)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Processing Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Chickens</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Avg Weight</TableHead>
                  <TableHead>Crates</TableHead>
                  <TableHead>Mortality</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Manure (kg)</TableHead>
                  <TableHead>Stack No</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.Processing_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{record.Total_Number_of_Chicken}</TableCell>
                    <TableCell>{record.total_weight_kg?.toFixed(1)}</TableCell>
                    <TableCell>{record.avg_weight_per_chicken?.toFixed(2)}</TableCell>
                    <TableCell>{record.num_crates}</TableCell>
                    <TableCell className="text-red-600">{record.mortality}</TableCell>
                    <TableCell className="text-yellow-600">{record.missing_chickens}</TableCell>
                    <TableCell>{record.manure_kg?.toFixed(1)}</TableCell>
                    <TableCell>{record.stack_no}</TableCell>
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