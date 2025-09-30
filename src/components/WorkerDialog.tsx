import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useFarm } from '@/contexts/FarmContext';
import { useToast } from '@/hooks/use-toast';

const workerSchema = z.object({
  worker_id: z.string().min(1, "Worker ID is required"),
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  contact_info: z.string().optional(),
  phone_number: z.string().optional(),
  national_id_number: z.string().optional(),
  food_allocated: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Food allocated must be a valid number",
  }),
});

type WorkerFormData = z.infer<typeof workerSchema>;

interface WorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkerSaved: () => void;
}

export function WorkerDialog({ open, onOpenChange, onWorkerSaved }: WorkerDialogProps) {
  const { selectedFarm } = useFarm();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      food_allocated: "0",
    },
  });

  const onSubmit = async (data: WorkerFormData) => {
    if (!selectedFarm) {
      toast({
        title: 'Error',
        description: 'Please select a farm first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workers')
        .insert({
          worker_id: data.worker_id,
          full_name: data.full_name,
          role: data.role,
          contact_info: data.contact_info || null,
          phone_number: data.phone_number || null,
          national_id_number: data.national_id_number || null,
          food_allocated: Number(data.food_allocated),
          farm_id: selectedFarm.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Worker added successfully',
      });

      reset();
      onWorkerSaved();
    } catch (error: any) {
      console.error('Error adding worker:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add worker',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worker_id">Worker ID *</Label>
            <Input
              id="worker_id"
              {...register('worker_id')}
              placeholder="Enter worker ID"
            />
            {errors.worker_id && (
              <p className="text-sm text-destructive">{errors.worker_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="e.g., Farm Worker, Supervisor, etc."
            />
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register('phone_number')}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="national_id_number">National ID Number</Label>
            <Input
              id="national_id_number"
              {...register('national_id_number')}
              placeholder="Enter national ID number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="food_allocated">Food Allocated (kg)</Label>
            <Input
              id="food_allocated"
              type="number"
              step="0.01"
              min="0"
              {...register('food_allocated')}
              placeholder="0.00"
            />
            {errors.food_allocated && (
              <p className="text-sm text-destructive">{errors.food_allocated.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Contact Information</Label>
            <Textarea
              id="contact_info"
              {...register('contact_info')}
              placeholder="Additional contact information or notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Worker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}