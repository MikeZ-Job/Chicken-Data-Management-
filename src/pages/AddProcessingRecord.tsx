import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  stack_no: z.string().min(1, "Stack number is required"),
  number_of_crates: z.number().min(1, "Number of crates must be at least 1"),
  total_weight_kg: z.number().min(0, "Total weight must be non-negative"),
  total_chickens: z.number().min(1, "Total chickens must be at least 1"),
  mortality: z.number().min(0, "Mortality must be non-negative"),
  missing_chickens: z.number().min(0, "Missing chickens must be non-negative"),
  manure_kg: z.number().min(0, "Manure weight must be non-negative"),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProcessingRecord() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avgWeight, setAvgWeight] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      stack_no: "",
      number_of_crates: 0,
      total_weight_kg: 0,
      total_chickens: 0,
      mortality: 0,
      missing_chickens: 0,
      manure_kg: 0,
      remarks: "",
    },
  });

  const totalWeight = form.watch("total_weight_kg");
  const totalChickens = form.watch("total_chickens");

  // Auto-calculate average weight per chicken
  useEffect(() => {
    if (totalWeight > 0 && totalChickens > 0) {
      const avg = totalWeight / totalChickens;
      setAvgWeight(avg);
    } else {
      setAvgWeight(null);
    }
  }, [totalWeight, totalChickens]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const avgWeightPerChicken = data.total_weight_kg / data.total_chickens;

      const { error } = await supabase
        .from("Chicken Processing")
        .insert([
          {
            Processing_date: data.date,
            stack_no: data.stack_no,
            num_crates: data.number_of_crates,
            total_weight_kg: data.total_weight_kg,
            Total_Number_of_Chicken: data.total_chickens,
            mortality: data.mortality,
            missing_chickens: data.missing_chickens,
            manure_kg: data.manure_kg,
            avg_weight_per_chicken: avgWeightPerChicken,
            remarks: data.remarks,
          },
        ]);

      if (error) {
        throw error;
      }

      toast.success("Processing record added successfully!");
      navigate("/view-processing-records");
    } catch (error) {
      console.error("Error adding processing record:", error);
      toast.error("Failed to add processing record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Processing Record</CardTitle>
            <CardDescription>
              Enter the details for a new chicken processing record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stack_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stack Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter stack number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="number_of_crates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Crates</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter number of crates"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_weight_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Enter total weight"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_chickens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Chickens</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter total chickens"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mortality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mortality</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter mortality count"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="missing_chickens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Missing Chickens</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter missing chickens count"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manure_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manure (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="Enter manure weight"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {avgWeight !== null && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Average Weight per Chicken: {avgWeight.toFixed(2)} kg
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional remarks or notes"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Processing Record"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/view-processing-records")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}