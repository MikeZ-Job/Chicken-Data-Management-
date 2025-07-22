import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, SortAsc, SortDesc } from "lucide-react";
import { Link } from "react-router-dom";

interface Medicine {
  id: number;
  medicine_name: string;
  quantity: number | null;
  date_received: string | null;
  expiry_date: string | null;
}

const ViewMedicineInventory = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date_received");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterAndSortMedicines();
  }, [medicines, searchTerm, filterType, sortBy, sortOrder]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from("medicine_inventory")
        .select("*");

      if (error) throw error;

      setMedicines(data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast({
        title: "Error",
        description: "Failed to fetch medicines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortMedicines = () => {
    let filtered = medicines;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      const today = new Date().toISOString().split('T')[0];
      if (filterType === "expired") {
        filtered = filtered.filter(medicine => 
          medicine.expiry_date && medicine.expiry_date < today
        );
      } else if (filterType === "expiring_soon") {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        filtered = filtered.filter(medicine => 
          medicine.expiry_date && medicine.expiry_date >= today && medicine.expiry_date <= nextMonthStr
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Medicine];
      let bValue: any = b[sortBy as keyof Medicine];

      if (sortBy === "quantity") {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === "date_received") {
        aValue = aValue || "";
        bValue = bValue || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMedicines(filtered);
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

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return expiry >= today && expiry <= nextMonth;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading medicines...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Medicine Inventory</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search by Medicine Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filter by Status</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Medicines</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort by</Label>
                <div className="flex gap-2">
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
                  <Button
                    variant={sortBy === "date_received" ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSort("date_received")}
                    className="flex items-center gap-2"
                  >
                    Date Received
                    {sortBy === "date_received" && (
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
            <CardTitle>Medicines ({filteredMedicines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No medicines found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                        <TableCell>{medicine.quantity || "N/A"}</TableCell>
                        <TableCell>{formatDate(medicine.date_received)}</TableCell>
                        <TableCell>{formatDate(medicine.expiry_date)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpired(medicine.expiry_date)
                                ? "bg-destructive/10 text-destructive"
                                : isExpiringSoon(medicine.expiry_date)
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isExpired(medicine.expiry_date)
                              ? "Expired"
                              : isExpiringSoon(medicine.expiry_date)
                              ? "Expiring Soon"
                              : "Good"}
                          </span>
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
    </div>
  );
};

export default ViewMedicineInventory;