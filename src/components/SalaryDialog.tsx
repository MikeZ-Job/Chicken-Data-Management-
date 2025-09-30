import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useFarm } from '@/contexts/FarmContext';
import { useToast } from '@/hooks/use-toast';

const salarySchema = z.object({
  salary_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Salary amount must be a valid positive number",
  }),
  amount_paid: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Amount paid must be a valid number",
  }),
  payment_date: z.string().optional(),
  payment_status: z.enum(['pending', 'partial', 'paid']),
});

type SalaryFormData = z.infer<typeof salarySchema>;

interface Worker {
  id: string;
  worker_id: string;
  full_name: string;
}

interface SalaryDialogProps {
  worker: Worker;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalarySaved: () => void;
}

export function SalaryDialog({ worker, open, onOpenChange, onSalarySaved }: SalaryDialogProps) {
  const { selectedFarm } = useFarm();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      amount_paid: "0",
      payment_status: 'pending',
    },
  });

  const salaryAmount = watch('salary_amount');
  const amountPaid = watch('amount_paid');

  const onSubmit = async (data: SalaryFormData) => {
    if (!selectedFarm) {
      toast({
        title: 'Error',
        description: 'Please select a farm first',
        variant: 'destructive',
      });
      return;
    }

    const salaryNum = Number(data.salary_amount);
    const paidNum = Number(data.amount_paid);

    // Validate that amount paid doesn't exceed salary amount
    if (paidNum > salaryNum) {
      toast({
        title: 'Error',
        description: 'Amount paid cannot exceed salary amount',
        variant: 'destructive',
      });
      return;
    }

    // Auto-determine status based on payment
    let status = data.payment_status;
    if (paidNum === 0) {
      status = 'pending';
    } else if (paidNum < salaryNum) {
      status = 'partial';
    } else {
      status = 'paid';
    }

    try {
      const { error } = await supabase
        .from('salary_tracking')
        .insert({
          worker_id: worker.id,
          salary_amount: salaryNum,
          amount_paid: paidNum,
          payment_date: data.payment_date || null,
          payment_status: status,
          farm_id: selectedFarm.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Salary record added successfully',
      });

      reset();
      onSalarySaved();
    } catch (error: any) {
      console.error('Error adding salary record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add salary record',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // Calculate amount due
  const calculateAmountDue = () => {
    const salary = Number(salaryAmount) || 0;
    const paid = Number(amountPaid) || 0;
    return Math.max(0, salary - paid);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Salary Record</DialogTitle>
          <p className="text-sm text-muted-foreground">
            For worker: {worker.full_name} (ID: {worker.worker_id})
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary_amount">Salary Amount *</Label>
            <Input
              id="salary_amount"
              type="number"
              step="0.01"
              min="0"
              {...register('salary_amount')}
              placeholder="0.00"
            />
            {errors.salary_amount && (
              <p className="text-sm text-destructive">{errors.salary_amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_paid">Amount Paid</Label>
            <Input
              id="amount_paid"
              type="number"
              step="0.01"
              min="0"
              {...register('amount_paid')}
              placeholder="0.00"
            />
            {errors.amount_paid && (
              <p className="text-sm text-destructive">{errors.amount_paid.message}</p>
            )}
          </div>

          {/* Show calculated amount due */}
          {salaryAmount && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex justify-between text-sm">
                <span>Amount Due:</span>
                <span className="font-medium">
                  ${calculateAmountDue().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              {...register('payment_date')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Controller
              name="payment_status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}