import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Heart, AlertTriangle } from "lucide-react";
import { useFarmData } from "@/contexts/FarmDataContext";

export default function ChickenHealthModule() {
  const { data, addChickenHealth } = useFarmData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    chickenId: "",
    healthStatus: "",
    lastCheckup: "",
    notes: "",
    vaccination: ""
  });

  const filteredHealth = data.chickenHealth.filter(health =>
    health.chickenId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addChickenHealth({
      chickenId: formData.chickenId,
      healthStatus: formData.healthStatus as 'healthy' | 'sick' | 'critical',
      lastCheckup: formData.lastCheckup,
      notes: formData.notes,
      vaccination: formData.vaccination
    });
    setFormData({
      chickenId: "",
      healthStatus: "",
      lastCheckup: "",
      notes: "",
      vaccination: ""
    });
    setShowAddForm(false);
  };

  const healthStats = {
    healthy: data.chickenHealth.filter(h => h.healthStatus === 'healthy').length,
    sick: data.chickenHealth.filter(h => h.healthStatus === 'sick').length,
    critical: data.chickenHealth.filter(h => h.healthStatus === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold">Chicken Health</h1>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Health Record
        </Button>
      </div>

      {/* Health Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy</p>
                <p className="text-2xl font-bold text-green-600">{healthStats.healthy}</p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sick</p>
                <p className="text-2xl font-bold text-yellow-600">{healthStats.sick}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{healthStats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Health Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chickenId">Chicken ID</Label>
                <Input
                  id="chickenId"
                  value={formData.chickenId}
                  onChange={(e) => setFormData({...formData, chickenId: e.target.value})}
                  placeholder="e.g., CH001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="healthStatus">Health Status</Label>
                <Select value={formData.healthStatus} onValueChange={(value) => setFormData({...formData, healthStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lastCheckup">Last Checkup</Label>
                <Input
                  id="lastCheckup"
                  type="date"
                  value={formData.lastCheckup}
                  onChange={(e) => setFormData({...formData, lastCheckup: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vaccination">Vaccination</Label>
                <Input
                  id="vaccination"
                  value={formData.vaccination}
                  onChange={(e) => setFormData({...formData, vaccination: e.target.value})}
                  placeholder="e.g., Newcastle Disease - 2024-06-15"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Health observations, symptoms, treatment..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="mr-2">Add Record</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by chicken ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Health Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Health Records ({filteredHealth.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chicken ID</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last Checkup</TableHead>
                <TableHead>Vaccination</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealth.map((health) => (
                <TableRow key={health.id}>
                  <TableCell className="font-medium">{health.chickenId}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      health.healthStatus === 'healthy' 
                        ? 'bg-green-100 text-green-800'
                        : health.healthStatus === 'sick'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {health.healthStatus}
                    </span>
                  </TableCell>
                  <TableCell>{health.lastCheckup}</TableCell>
                  <TableCell>{health.vaccination}</TableCell>
                  <TableCell className="max-w-xs truncate">{health.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredHealth.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No health records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}