import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Layout } from "@/components/Layout";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFarm } from "@/contexts/FarmContext";

const AddFoodInventory = () => {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dateReceived, setDateReceived] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedFarm } = useFarm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodType || !quantity || !supplier || !dateReceived) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFarm) {
      toast({
        title: "Error",
        description: "Please select a farm first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("food_inventory")
        .insert({
          food_type: foodType,
          quantity: parseInt(quantity),
          supplier: supplier,
          date_received: format(dateReceived, "yyyy-MM-dd"),
          farm_id: selectedFarm.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Food inventory item added successfully",
      });

      // Reset form
      setFoodType("");
      setQuantity("");
      setSupplier("");
      setDateReceived(undefined);
      
      // Navigate to view page
      navigate("/view-food-inventory");
    } catch (error) {
      console.error("Error adding food inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add food inventory item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout showBackButton={true}>
      <div className="p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Add Food Inventory</h1>
            <p className="text-muted-foreground">Add new food items to your inventory</p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Food Inventory Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="foodType">Food Type</Label>
                <Input
                  id="foodType"
                  type="text"
                  placeholder="Enter food type (e.g., Wheat, Corn, etc.)"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity in kilograms"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  type="text"
                  placeholder="Enter supplier name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Date Received</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateReceived && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateReceived ? format(dateReceived, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateReceived}
                      onSelect={setDateReceived}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adding..." : "Add Food Item"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddFoodInventory;