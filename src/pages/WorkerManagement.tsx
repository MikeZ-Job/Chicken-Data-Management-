import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useFarm } from '@/contexts/FarmContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkerDialog } from '@/components/WorkerDialog';
import { WorkerDetailsDialog } from '@/components/WorkerDetailsDialog';

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

export default function WorkerManagement() {
  const { selectedFarm } = useFarm();
  const { toast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (selectedFarm) {
      fetchWorkers();
    }
  }, [selectedFarm]);

  useEffect(() => {
    filterWorkers();
  }, [workers, searchTerm, roleFilter]);

  const fetchWorkers = async () => {
    if (!selectedFarm) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('farm_id', selectedFarm.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch workers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkers = () => {
    let filtered = workers;

    if (searchTerm) {
      filtered = filtered.filter(worker =>
        worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.worker_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(worker => worker.role === roleFilter);
    }

    setFilteredWorkers(filtered);
  };

  const handleWorkerSaved = () => {
    fetchWorkers();
    setShowAddDialog(false);
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowDetailsDialog(true);
  };

  const uniqueRoles = [...new Set(workers.map(worker => worker.role))];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading workers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Worker Management</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search Workers</label>
                <Input
                  placeholder="Search by name, ID, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{worker.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">ID: {worker.worker_id}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewWorker(worker)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge variant="secondary">{worker.role}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Food Allocated:</span>
                  <span className="text-sm">{worker.food_allocated} kg</span>
                </div>
                {worker.phone_number && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{worker.phone_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No workers found</h3>
              <p className="text-muted-foreground mb-4">
                {workers.length === 0 
                  ? "Get started by adding your first worker."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {workers.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Worker
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Worker Dialog */}
        <WorkerDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onWorkerSaved={handleWorkerSaved}
        />

        {/* Worker Details Dialog */}
        <WorkerDetailsDialog
          worker={selectedWorker}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
        />
      </div>
    </Layout>
  );
}