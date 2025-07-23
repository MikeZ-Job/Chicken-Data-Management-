import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, SortAsc, SortDesc } from "lucide-react";

interface WorkerFood {
  id: number;
  worker_id: string;
  food_type: string | null;
  quantity: number | null;
  date_provided: string | null;
}

const ViewWorkerFood = () => {
  const [workerFoodRecords, setWorkerFoodRecords] = useState<WorkerFood[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<WorkerFood[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date_provided");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [uniqueFoodTypes, setUniqueFoodTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchWorkerFoodRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [workerFoodRecords, searchTerm, filterType, sortBy, sortOrder]);

  const fetchWorkerFoodRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("worker_food")
        .select("*");

      if (error) throw error;

      setWorkerFoodRecords(data || []);
      
      // Extract unique food types for filter dropdown
      const foodTypes = [...new Set(data?.map(record => record.food_type).filter(Boolean) || [])];
      setUniqueFoodTypes(foodTypes as string[]);
    } catch (error) {
      console.error("Error fetching worker food records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch worker food records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = workerFoodRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.worker_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(record => record.food_type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof WorkerFood];
      let bValue: any = b[sortBy as keyof WorkerFood];

      if (sortBy === "quantity") {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === "date_provided") {
        aValue = aValue || "";
        bValue = bValue || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRecords(filtered);
  };

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">Loading worker food records...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Worker Food Records</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search by Worker ID</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search worker ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filter by Food Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Food Types</SelectItem>
                    {uniqueFoodTypes.map((foodType) => (
                      <SelectItem key={foodType} value={foodType}>
                        {foodType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort by</Label>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "date_provided" ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSort("date_provided")}
                    className="flex items-center gap-2"
                  >
                    Date
                    {sortBy === "date_provided" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === "quantity" ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSort("quantity")}
                    className="flex items-center gap-2"
                  >
                    Quantity
                    {sortBy === "quantity" && (
                      sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worker Food Records ({filteredRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No worker food records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.worker_id}</TableCell>
                        <TableCell>{record.food_type || "N/A"}</TableCell>
                        <TableCell>{record.quantity || "N/A"}</TableCell>
                        <TableCell>{formatDate(record.date_provided)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewWorkerFood;