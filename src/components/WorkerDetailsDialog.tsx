import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Phone, CreditCard, Package, DollarSign, Calendar, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SalaryDialog } from '@/components/SalaryDialog';

interface Worker {
  id: string;
  worker_id: string;
  full_name: string;
  role: string;
  contact_info?: string;
  phone_number?: string;
  national_id_number?: string;
  food_allocated: number;
  farm_id?: string;
  created_at: string;
}

interface SalaryRecord {
  id: string;
  salary_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_date?: string;
  payment_status: string;
  created_at: string;
}

interface WorkerDetailsDialogProps {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerDetailsDialog({ worker, open, onOpenChange }: WorkerDetailsDialogProps) {
  const { toast } = useToast();
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);

  useEffect(() => {
    if (worker && open) {
      fetchSalaryRecords();
    }
  }, [worker, open]);

  const fetchSalaryRecords = async () => {
    if (!worker) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salary_tracking')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSalaryRecords(data || []);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch salary records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySaved = () => {
    fetchSalaryRecords();
    setShowSalaryDialog(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'pending':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const totalSalary = salaryRecords.reduce((sum, record) => sum + record.salary_amount, 0);
  const totalPaid = salaryRecords.reduce((sum, record) => sum + record.amount_paid, 0);
  const totalDue = salaryRecords.reduce((sum, record) => sum + record.amount_due, 0);

  if (!worker) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              {worker.full_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Worker Profile</TabsTrigger>
              <TabsTrigger value="salary">Salary Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Worker ID:</span>
                      <span>{worker.worker_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Full Name:</span>
                      <span>{worker.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <Badge variant="secondary">{worker.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Joined:</span>
                      <span>{formatDate(worker.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{worker.phone_number || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">National ID:</span>
                      <span>{worker.national_id_number || 'Not provided'}</span>
                    </div>
                    {worker.contact_info && (
                      <div>
                        <span className="font-medium">Additional Info:</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {worker.contact_info}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Food Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Food Allocated:</span>
                      <span className="text-lg font-semibold">{worker.food_allocated} kg</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Salary Records</h3>
                <Button onClick={() => setShowSalaryDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Salary Record
                </Button>
              </div>

              {/* Salary Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSalary)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Total Paid</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Total Due</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Salary Records Table */}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center">Loading salary records...</div>
                  ) : salaryRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Salary Amount</TableHead>
                          <TableHead>Amount Paid</TableHead>
                          <TableHead>Amount Due</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salaryRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {formatCurrency(record.salary_amount)}
                            </TableCell>
                            <TableCell>{formatCurrency(record.amount_paid)}</TableCell>
                            <TableCell>{formatCurrency(record.amount_due)}</TableCell>
                            <TableCell>
                              {record.payment_date ? formatDate(record.payment_date) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(record.payment_status)}>
                                {record.payment_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No salary records</h3>
                      <p className="text-muted-foreground mb-4">
                        Start tracking salary by adding the first record.
                      </p>
                      <Button onClick={() => setShowSalaryDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Record
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Add Salary Record Dialog */}
      <SalaryDialog
        worker={worker}
        open={showSalaryDialog}
        onOpenChange={setShowSalaryDialog}
        onSalarySaved={handleSalarySaved}
      />
    </>
  );
}