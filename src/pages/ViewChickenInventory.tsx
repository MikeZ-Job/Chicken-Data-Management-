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
import { useFarm } from "@/contexts/FarmContext";

interface ChickenInventoryItem {
  id: number;
  breed: string;
  age: number;
  health_status: string;
  date_added: string;
}

const ViewChickenInventory = () => {
  const [inventory, setInventory] = useState<ChickenInventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<ChickenInventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_added");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [breedFilter, setBreedFilter] = useState("all");
  const [healthStatusFilter, setHealthStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { selectedFarm } = useFarm();

  useEffect(() => {
    fetchInventory();
  }, [selectedFarm]);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchTerm, sortBy, sortOrder, breedFilter, healthStatusFilter]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("chicken_inventory")
        .select("*")
        .order("date_added", { ascending: false });

      if (error) throw error;

      setInventory(data || []);
    } catch (error) {
      console.error("Error fetching chicken inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load chicken inventory",
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
        item.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.health_status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by breed
    if (breedFilter !== "all") {
      filtered = filtered.filter((item) => item.breed === breedFilter);
    }

    // Filter by health status
    if (healthStatusFilter !== "all") {
      filtered = filtered.filter((item) => item.health_status === healthStatusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof ChickenInventoryItem];
      let bValue = b[sortBy as keyof ChickenInventoryItem];

      if (sortBy === "date_added") {
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

  const getUniqueBreeds = () => {
    const breeds = inventory.map((item) => item.breed);
    return [...new Set(breeds)].sort();
  };

  const getUniqueHealthStatuses = () => {
    const statuses = inventory.map((item) => item.health_status);
    return [...new Set(statuses)].sort();
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
            <p className="text-muted-foreground">Loading chicken inventory...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Chicken Inventory</h1>
            <p className="text-muted-foreground">
              Total chickens: {filteredInventory.length}
            </p>
          </div>
          <Button asChild>
            <Link to="/add-chicken-inventory">
              <Plus className="mr-2 h-4 w-4" />
              Add Chicken
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chicken Management</CardTitle>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by breed or health status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter by breed */}
              <Select value={breedFilter} onValueChange={setBreedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds</SelectItem>
                  {getUniqueBreeds().map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter by health status */}
              <Select value={healthStatusFilter} onValueChange={setHealthStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health Statuses</SelectItem>
                  {getUniqueHealthStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
                  <SelectItem value="date_added-desc">Date Added (Newest First)</SelectItem>
                  <SelectItem value="date_added-asc">Date Added (Oldest First)</SelectItem>
                  <SelectItem value="age-desc">Age (Oldest First)</SelectItem>
                  <SelectItem value="age-asc">Age (Youngest First)</SelectItem>
                  <SelectItem value="breed-asc">Breed (A-Z)</SelectItem>
                  <SelectItem value="breed-desc">Breed (Z-A)</SelectItem>
                  <SelectItem value="health_status-asc">Health Status (A-Z)</SelectItem>
                  <SelectItem value="health_status-desc">Health Status (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInventory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  {inventory.length === 0
                    ? "No chickens found in inventory"
                    : "No chickens match your search criteria"}
                </p>
                {inventory.length === 0 && (
                  <Button asChild>
                    <Link to="/add-chicken-inventory">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Chicken
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Breed</TableHead>
                      <TableHead>Age (weeks)</TableHead>
                      <TableHead>Health Status</TableHead>
                      <TableHead>Date Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.breed}</TableCell>
                        <TableCell>{item.age}</TableCell>
                        <TableCell>{item.health_status}</TableCell>
                        <TableCell>{formatDate(item.date_added)}</TableCell>
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

export default ViewChickenInventory;