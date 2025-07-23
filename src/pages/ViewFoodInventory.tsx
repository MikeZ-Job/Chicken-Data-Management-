import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FoodInventoryItem {
  id: number;
  food_type: string;
  quantity: number;
  supplier: string;
  date_received: string;
}

const ViewFoodInventory = () => {
  const [inventory, setInventory] = useState<FoodInventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<FoodInventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_received");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchTerm, sortBy, sortOrder, foodTypeFilter]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("food_inventory")
        .select("*")
        .order("date_received", { ascending: false });

      if (error) throw error;

      setInventory(data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load food inventory",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortInventory = () => {
    let filtered = [...inventory];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.food_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by food type
    if (foodTypeFilter !== "all") {
      filtered = filtered.filter((item) => item.food_type === foodTypeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof FoodInventoryItem];
      let bValue = b[sortBy as keyof FoodInventoryItem];

      if (sortBy === "date_received") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredInventory(filtered);
  };

  const getUniqueFoodTypes = () => {
    const types = inventory.map((item) => item.food_type);
    return [...new Set(types)].sort();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout showBackButton={true}>
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Food Inventory</h1>
            <p className="text-muted-foreground">
              Total items: {filteredInventory.length}
            </p>
          </div>
          <Button asChild>
            <Link to="/add-food-inventory">
              <Plus className="mr-2 h-4 w-4" />
              Add Food Item
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by food type or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter by food type */}
              <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Food Types</SelectItem>
                  {getUniqueFoodTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_received-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date_received-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="food_type-asc">Food Type (A-Z)</SelectItem>
                  <SelectItem value="food_type-desc">Food Type (Z-A)</SelectItem>
                  <SelectItem value="quantity-desc">Quantity (High-Low)</SelectItem>
                  <SelectItem value="quantity-asc">Quantity (Low-High)</SelectItem>
                  <SelectItem value="supplier-asc">Supplier (A-Z)</SelectItem>
                  <SelectItem value="supplier-desc">Supplier (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  {inventory.length === 0
                    ? "No food inventory items found"
                    : "No items match your search criteria"}
                </p>
                {inventory.length === 0 && (
                  <Button asChild>
                    <Link to="/add-food-inventory">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Item
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Type</TableHead>
                      <TableHead>Quantity (kg)</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.food_type}</TableCell>
                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{formatDate(item.date_received)}</TableCell>
                      </TableRow>
                    ))}
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

export default ViewFoodInventory;