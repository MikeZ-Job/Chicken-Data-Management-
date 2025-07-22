import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddWorkerFood = () => {
  const [workerId, setWorkerId] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dateProvided, setDateProvided] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("worker_food")
        .insert({
          worker_id: workerId,
          food_type: foodType || null,
          quantity: quantity ? parseInt(quantity) : null,
          date_provided: dateProvided || null,
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Add Worker Food Record</h1>
        </div>

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
  );
};

export default AddWorkerFood;