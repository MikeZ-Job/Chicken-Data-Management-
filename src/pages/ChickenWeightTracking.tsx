import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { Plus, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ChickenWeight {
  id: number;
  date_recorded: string;
  weight_kg: number;
}

interface WeightStandard {
  age_in_days: number;
  expected_weight_kg: number;
}

interface ChickenInfo {
  id: number;
  breed: string;
  age: number;
  health_status: string;
  date_added: string;
  age_in_days: number;
}

const ChickenWeightTracking = () => {
  const { chickenId } = useParams<{ chickenId: string }>();
  const navigate = useNavigate();
  const [chicken, setChicken] = useState<ChickenInfo | null>(null);
  const [weights, setWeights] = useState<ChickenWeight[]>([]);
  const [standards, setStandards] = useState<WeightStandard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (chickenId) {
      fetchChickenData();
      fetchWeights();
      fetchStandards();
    }
  }, [chickenId]);

  const fetchChickenData = async () => {
    try {
      const { data, error } = await supabase
        .from("chicken_inventory")
        .select("*")
        .eq("id", parseInt(chickenId!))
        .single();

      if (error) throw error;

      const ageInDays = Math.floor((new Date().getTime() - new Date(data.date_added).getTime()) / (1000 * 60 * 60 * 24));
      setChicken({
        ...data,
        age_in_days: ageInDays
      });
    } catch (error) {
      console.error("Error fetching chicken data:", error);
      toast({
        title: "Error",
        description: "Failed to load chicken information",
        variant: "destructive",
      });
    }
  };

  const fetchWeights = async () => {
    try {
      const { data, error } = await supabase
        .from("chicken_weights")
        .select("*")
        .eq("chicken_id", parseInt(chickenId!))
        .order("date_recorded", { ascending: false });

      if (error) throw error;
      setWeights(data || []);
    } catch (error) {
      console.error("Error fetching weights:", error);
      toast({
        title: "Error",
        description: "Failed to load weight records",
        variant: "destructive",
      });
    }
  };

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from("weight_standards")
        .select("*")
        .order("age_in_days", { ascending: true });

      if (error) throw error;
      setStandards(data || []);
    } catch (error) {
      console.error("Error fetching weight standards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeightStatus = (weight: number, ageInDays: number) => {
    // Find the closest standard by age
    const closestStandard = standards.reduce((prev, curr) => {
      return Math.abs(curr.age_in_days - ageInDays) < Math.abs(prev.age_in_days - ageInDays) ? curr : prev;
    });

    if (!closestStandard) return { status: 'unknown', icon: null, color: 'secondary' };

    const expectedWeight = closestStandard.expected_weight_kg;
    const tolerance = expectedWeight * 0.1; // 10% tolerance

    if (weight < expectedWeight - tolerance) {
      return { 
        status: 'underweight', 
        icon: <AlertTriangle className="h-4 w-4" />, 
        color: 'destructive',
        expected: expectedWeight
      };
    } else if (weight > expectedWeight + tolerance) {
      return { 
        status: 'overweight', 
        icon: <XCircle className="h-4 w-4" />, 
        color: 'secondary',
        expected: expectedWeight
      };
    } else {
      return { 
        status: 'normal', 
        icon: <CheckCircle className="h-4 w-4" />, 
        color: 'default',
        expected: expectedWeight
      };
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  if (isLoading) {
    return (
      <Layout showBackButton={true}>
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading weight tracking data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!chicken) {
    return (
      <Layout showBackButton={true}>
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chicken not found</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true}>
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Weight Tracking</h1>
              <p className="text-muted-foreground">
                {chicken.breed} - {chicken.age_in_days} days old
              </p>
            </div>
            <Button onClick={() => navigate('/bulk-weight-upload')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Weight Record
            </Button>
          </div>

          {/* Chicken Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chicken Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Breed</p>
                  <p className="font-medium">{chicken.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age (days)</p>
                  <p className="font-medium">{chicken.age_in_days}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Health Status</p>
                  <p className="font-medium">{chicken.health_status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Added</p>
                  <p className="font-medium">{formatDate(chicken.date_added)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weight Records ({weights.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    No weight records found for this chicken
                  </p>
                  <Button onClick={() => navigate('/bulk-weight-upload')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Weight Record
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date Recorded</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Expected Weight (kg)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Age at Recording</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weights.map((weight) => {
                        const ageAtRecording = Math.floor((new Date(weight.date_recorded).getTime() - new Date(chicken.date_added).getTime()) / (1000 * 60 * 60 * 24));
                        const weightStatus = getWeightStatus(weight.weight_kg, ageAtRecording);
                        
                        return (
                          <TableRow key={weight.id}>
                            <TableCell className="font-medium">
                              {formatDate(weight.date_recorded)}
                            </TableCell>
                            <TableCell>{weight.weight_kg} kg</TableCell>
                            <TableCell>
                              {weightStatus.expected ? `${weightStatus.expected} kg` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={weightStatus.color as any}
                                className="flex items-center gap-1 w-fit"
                              >
                                {weightStatus.icon}
                                {weightStatus.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{ageAtRecording} days</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChickenWeightTracking;