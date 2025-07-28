import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useFarm } from "@/contexts/FarmContext";
import { supabase } from "@/integrations/supabase/client";

interface FarmSummaryData {
  foodInventory: number;
  chickenInventory: number;
  medicineInventory: number;
  workerFoodRecords: number;
  processingRecords: number;
  totalChickensProcessed: number;
  totalWeight: number;
  farmDetails: {
    farm_name: string;
    location: string;
    owner: string;
    created_at: string;
  };
}

export default function FarmSummaryReport() {
  const [summaryData, setSummaryData] = useState<FarmSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchSummaryData();
  }, [selectedFarm]);

  const fetchSummaryData = async () => {
    if (!selectedFarm) return;

    try {
      const [
        foodResponse,
        chickenResponse,
        medicineResponse,
        workerFoodResponse,
        processingResponse,
        farmResponse
      ] = await Promise.all([
        supabase.from('food_inventory').select('*', { count: 'exact' }).eq('farm_id', selectedFarm.id),
        supabase.from('chicken_inventory').select('*', { count: 'exact' }).eq('farm_id', selectedFarm.id),
        supabase.from('medicine_inventory').select('*', { count: 'exact' }).eq('farm_id', selectedFarm.id),
        supabase.from('worker_food').select('*', { count: 'exact' }).eq('farm_id', selectedFarm.id),
        supabase.from('Chicken Processing').select('*').eq('farm_id', selectedFarm.id),
        supabase.from('farms').select('*').eq('id', selectedFarm.id).single()
      ]);

      const processingData = processingResponse.data || [];
      const totalChickens = processingData.reduce((sum, record) => sum + (record.Total_Number_of_Chicken || 0), 0);
      const totalWeight = processingData.reduce((sum, record) => sum + (record.total_weight_kg || 0), 0);

      setSummaryData({
        foodInventory: foodResponse.count || 0,
        chickenInventory: chickenResponse.count || 0,
        medicineInventory: medicineResponse.count || 0,
        workerFoodRecords: workerFoodResponse.count || 0,
        processingRecords: processingData.length,
        totalChickensProcessed: totalChickens,
        totalWeight: totalWeight,
        farmDetails: farmResponse.data
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  if (!summaryData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">No data available</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 print:p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Farm Summary Report</h1>
            <p className="text-muted-foreground mt-1">
              Farm: {summaryData.farmDetails.farm_name} | Generated: {currentDate}
            </p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>

        {/* Farm Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Farm Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Farm Name:</strong> {summaryData.farmDetails.farm_name}</p>
                <p><strong>Location:</strong> {summaryData.farmDetails.location || 'Not specified'}</p>
              </div>
              <div>
                <p><strong>Owner:</strong> {summaryData.farmDetails.owner || 'Not specified'}</p>
                <p><strong>Established:</strong> {new Date(summaryData.farmDetails.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Food Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.foodInventory}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chickens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.chickenInventory}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.medicineInventory}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Worker Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.workerFoodRecords}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.processingRecords}</div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Chickens Processed:</span>
                  <span className="font-bold">{summaryData.totalChickensProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Weight Processed:</span>
                  <span className="font-bold">{summaryData.totalWeight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Weight per Chicken:</span>
                  <span className="font-bold">
                    {summaryData.totalChickensProcessed > 0 
                      ? (summaryData.totalWeight / summaryData.totalChickensProcessed).toFixed(2) 
                      : 0} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Records:</span>
                  <span className="font-bold">{summaryData.processingRecords}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Food Inventory Items:</span>
                  <span className="font-bold">{summaryData.foodInventory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Chicken Count:</span>
                  <span className="font-bold">{summaryData.chickenInventory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medicine Stock Items:</span>
                  <span className="font-bold">{summaryData.medicineInventory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Food Records:</span>
                  <span className="font-bold">{summaryData.workerFoodRecords}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Farm Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {summaryData.processingRecords > 0 ? 
                    Math.round(summaryData.totalChickensProcessed / summaryData.processingRecords) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Avg Chickens per Processing</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summaryData.foodInventory + summaryData.medicineInventory}
                </div>
                <p className="text-sm text-muted-foreground">Total Inventory Items</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.ceil((new Date().getTime() - new Date(summaryData.farmDetails.created_at).getTime()) / (1000 * 3600 * 24))}
                </div>
                <p className="text-sm text-muted-foreground">Days in Operation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Report generated on {new Date().toLocaleString()}</p>
          <p>Farm Management System - Comprehensive Summary</p>
        </div>
      </div>
    </Layout>
  );
}