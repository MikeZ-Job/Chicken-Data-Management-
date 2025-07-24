import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFarm } from "@/contexts/FarmContext";

const AddMedicineInventory = () => {
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
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
        .from("medicine_inventory")
        .insert({
          medicine_name: medicineName,
          quantity: parseInt(quantity),
          date_received: dateReceived || null,
          expiry_date: expiryDate || null,
          farm_id: selectedFarm.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Medicine inventory added successfully.",
      });

      // Reset form
      setMedicineName("");
      setQuantity("");
      setDateReceived("");
      setExpiryDate("");
    } catch (error) {
      console.error("Error adding medicine inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add medicine inventory. Please try again.",
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
          <h1 className="text-3xl font-bold">Add Medicine Inventory</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicineName">Medicine Name *</Label>
                  <Input
                    id="medicineName"
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    required
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
                  <Label htmlFor="dateReceived">Date Received</Label>
                  <Input
                    id="dateReceived"
                    type="date"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Adding..." : "Add Medicine"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AddMedicineInventory;