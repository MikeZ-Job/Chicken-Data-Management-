import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Egg, TrendingUp } from "lucide-react";
import { useFarmData } from "@/contexts/FarmDataContext";

export default function EggProductionModule() {
  const { data, addEggProduction } = useFarmData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    eggsCollected: "",
    henCount: "",
    quality: ""
  });

  const filteredProduction = data.eggProduction.filter(production =>
    production.date.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEggProduction({
      date: formData.date,
      eggsCollected: parseInt(formData.eggsCollected),
      henCount: parseInt(formData.henCount),
      quality: formData.quality as 'excellent' | 'good' | 'fair'
    });
    setFormData({
      date: "",
      eggsCollected: "",
      henCount: "",
      quality: ""
    });
    setShowAddForm(false);
  };

  const totalEggs = data.eggProduction.reduce((sum, prod) => sum + prod.eggsCollected, 0);
  const averageDaily = data.eggProduction.length > 0 ? (totalEggs / data.eggProduction.length).toFixed(1) : 0;
  const averageHenCount = data.eggProduction.length > 0 ? 
    (data.eggProduction.reduce((sum, prod) => sum + prod.henCount, 0) / data.eggProduction.length).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Egg className="h-6 w-6 text-yellow-600" />
          <h1 className="text-2xl font-bold">Egg Production</h1>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Production Record
        </Button>
      </div>

      {/* Production Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eggs</p>
                <p className="text-2xl font-bold text-yellow-600">{totalEggs}</p>
              </div>
              <Egg className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold text-blue-600">{averageDaily}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hens</p>
                <p className="text-2xl font-bold text-green-600">{averageHenCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Production Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eggsCollected">Eggs Collected</Label>
                <Input
                  id="eggsCollected"
                  type="number"
                  value={formData.eggsCollected}
                  onChange={(e) => setFormData({...formData, eggsCollected: e.target.value})}
                  placeholder="e.g., 85"
                  required
                />
              </div>
              <div>
                <Label htmlFor="henCount">Hen Count</Label>
                <Input
                  id="henCount"
                  type="number"
                  value={formData.henCount}
                  onChange={(e) => setFormData({...formData, henCount: e.target.value})}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quality">Quality</Label>
                <Select value={formData.quality} onValueChange={(value) => setFormData({...formData, quality: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
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
              placeholder="Search by date..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Production Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Records ({filteredProduction.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Eggs Collected</TableHead>
                <TableHead>Hen Count</TableHead>
                <TableHead>Production Rate</TableHead>
                <TableHead>Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProduction.map((production) => {
                const productionRate = ((production.eggsCollected / production.henCount) * 100).toFixed(1);
                
                return (
                  <TableRow key={production.id}>
                    <TableCell className="font-medium">{production.date}</TableCell>
                    <TableCell>{production.eggsCollected}</TableCell>
                    <TableCell>{production.henCount}</TableCell>
                    <TableCell>{productionRate}%</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        production.quality === 'excellent' 
                          ? 'bg-green-100 text-green-800'
                          : production.quality === 'good'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {production.quality}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProduction.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No production records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}