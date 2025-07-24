import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFarm } from "@/contexts/FarmContext";

const AddWorkerFood = () => {
  const [workerId, setWorkerId] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dateProvided, setDateProvided] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { selectedFarm } = useFarm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedFarm) {
      toast({
        title: "Error",
        description: "Please select a farm first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("worker_food")
        .insert({
          worker_id: workerId,
          food_type: foodType || null,
          quantity: quantity ? parseInt(quantity) : null,
          date_provided: dateProvided || null,
          farm_id: selectedFarm.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Worker food record added successfully.",
      });

      // Reset form
      setWorkerId("");
      setFoodType("");
      setQuantity("");
      setDateProvided("");
    } catch (error) {
      console.error("Error adding worker food record:", error);
      toast({
        title: "Error",
        description: "Failed to add worker food record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Add Worker Food Record</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Worker Food Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workerId">Worker ID *</Label>
                  <Input
                    id="workerId"
                    type="text"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type</Label>
                  <Input
                    id="foodType"
                    type="text"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g., Lunch, Breakfast, Snack"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateProvided">Date Provided</Label>
                  <Input
                    id="dateProvided"
                    type="date"
                    value={dateProvided}
                    onChange={(e) => setDateProvided(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Adding..." : "Add Worker Food Record"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddWorkerFood;