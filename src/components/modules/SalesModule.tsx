import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, DollarSign, TrendingUp } from "lucide-react";
import { useFarmData } from "@/contexts/FarmDataContext";

export default function SalesModule() {
  const { data, addSale } = useFarmData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    item: "",
    quantity: "",
    pricePerUnit: "",
    customer: "",
    date: ""
  });

  const filteredSales = data.sales.filter(sale =>
    sale.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(formData.quantity);
    const pricePerUnit = parseFloat(formData.pricePerUnit);
    
    addSale({
      item: formData.item,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      customer: formData.customer,
      date: formData.date
    });
    setFormData({
      item: "",
      quantity: "",
      pricePerUnit: "",
      customer: "",
      date: ""
    });
    setShowAddForm(false);
  };

  const totalSales = data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = data.sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageSale = data.sales.length > 0 ? (totalSales / data.sales.length).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">Sales Management</h1>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
      </div>

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{data.sales.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Sale</p>
                <p className="text-2xl font-bold text-purple-600">${averageSale}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item">Item/Product</Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => setFormData({...formData, item: e.target.value})}
                  placeholder="e.g., Fresh Eggs, Chicken Meat"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  placeholder="e.g., Local Market, Restaurant ABC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePerUnit">Price Per Unit ($)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                  placeholder="e.g., 0.50"
                  required
                />
              </div>
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
                <Label>Total Amount</Label>
                <Input
                  value={formData.quantity && formData.pricePerUnit ? 
                    `$${(parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toFixed(2)}` : 
                    "$0.00"
                  }
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="mr-2">Add Sale</Button>
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
              placeholder="Search by item or customer..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records ({filteredSales.length} transactions)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.date}</TableCell>
                  <TableCell>{sale.item}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>${sale.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${sale.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}