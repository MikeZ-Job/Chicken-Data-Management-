import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";

interface ProcessingRecord {
  id: number;
  Processing_date: string;
  stack_no: string;
  num_crates: number;
  total_weight_kg: number;
  Total_Number_of_Chicken: number;
  mortality: number;
  missing_chickens: number;
  manure_kg: number;
  avg_weight_per_chicken: number;
  remarks: string;
}

export default function ViewProcessingRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [stackFilter, setStackFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"Processing_date" | "total_weight_kg" | "Total_Number_of_Chicken" | "mortality">("Processing_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [records, searchTerm, dateFilter, stackFilter, sortBy, sortOrder]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("Chicken Processing")
        .select("*")
        .order("Processing_date", { ascending: false });

      if (error) {
        throw error;
      }

      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching processing records:", error);
      toast.error("Failed to fetch processing records");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.stack_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.Processing_date === dateFilter);
    }

    // Apply stack filter
    if (stackFilter && stackFilter !== "all") {
      filtered = filtered.filter(record => record.stack_no === stackFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRecords(filtered);
  };

  const uniqueStacks = [...new Set(records.map(record => record.stack_no))];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <p>Loading processing records...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processing Records</CardTitle>
                <CardDescription>
                  View and manage chicken processing records
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/add-processing-record")}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Record
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search by stack number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              
              <Select value={stackFilter} onValueChange={setStackFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by stack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stacks</SelectItem>
                  {uniqueStacks.map(stack => (
                    <SelectItem key={stack} value={stack}>{stack}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: "Processing_date" | "total_weight_kg" | "Total_Number_of_Chicken" | "mortality") => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing_date">Date</SelectItem>
                  <SelectItem value="total_weight_kg">Total Weight</SelectItem>
                  <SelectItem value="Total_Number_of_Chicken">Total Chickens</SelectItem>
                  <SelectItem value="mortality">Mortality</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setStackFilter("all");
                  setSortBy("Processing_date");
                  setSortOrder("desc");
                }}
              >
                Clear Filters
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stack No.</TableHead>
                    <TableHead>Crates</TableHead>
                    <TableHead>Total Weight (kg)</TableHead>
                    <TableHead>Total Chickens</TableHead>
                    <TableHead>Avg Weight/Chicken</TableHead>
                    <TableHead>Mortality</TableHead>
                    <TableHead>Missing</TableHead>
                    <TableHead>Manure (kg)</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">
                        No processing records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.Processing_date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.stack_no}</TableCell>
                        <TableCell>{record.num_crates}</TableCell>
                        <TableCell>{record.total_weight_kg}</TableCell>
                        <TableCell>{record.Total_Number_of_Chicken}</TableCell>
                        <TableCell>{record.avg_weight_per_chicken?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>{record.mortality}</TableCell>
                        <TableCell>{record.missing_chickens}</TableCell>
                        <TableCell>{record.manure_kg}</TableCell>
                        <TableCell className="max-w-xs truncate" title={record.remarks}>
                          {record.remarks || 'N/A'}
                        </TableCell>
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
}