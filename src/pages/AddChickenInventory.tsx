import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AddChickenInventory = () => {
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [dateAdded, setDateAdded] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!breed || !age || !healthStatus || !dateAdded) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("chicken_inventory")
        .insert({
          breed: breed,
          age: parseInt(age),
          health_status: healthStatus,
          date_added: format(dateAdded, "yyyy-MM-dd"),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chicken added to inventory successfully",
      });

      // Reset form
      setBreed("");
      setAge("");
      setHealthStatus("");
      setDateAdded(undefined);
      
      // Navigate to view page
      navigate("/view-chicken-inventory");
    } catch (error) {
      console.error("Error adding chicken to inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add chicken to inventory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Add Chicken Inventory</h1>
          <p className="text-muted-foreground">Add new chickens to your inventory</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chicken Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  type="text"
                  placeholder="Enter breed (e.g., Rhode Island Red, Leghorn, etc.)"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age (weeks)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age in weeks"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthStatus">Health Status</Label>
                <Input
                  id="healthStatus"
                  type="text"
                  placeholder="Enter health status (e.g., Healthy, Sick, Vaccinated, etc.)"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Date Added</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateAdded && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateAdded ? format(dateAdded, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateAdded}
                      onSelect={setDateAdded}
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
                  {isSubmitting ? "Adding..." : "Add Chicken"}
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
  );
};

export default AddChickenInventory;