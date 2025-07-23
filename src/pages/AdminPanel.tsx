import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Settings, 
  Palette, 
  Shield, 
  Monitor,
  Pill,
  UtensilsCrossed,
  Eye,
  Plus,
  Trash2
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

interface SystemColor {
  name: string;
  value: string;
  cssVar: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@farm.com", role: "admin", permissions: ["all"] },
    { id: "2", email: "manager@farm.com", role: "manager", permissions: ["view", "add"] },
  ]);
  
  const [colors, setColors] = useState<SystemColor[]>([
    { name: "Primary", value: "#0ea5e9", cssVar: "--primary" },
    { name: "Secondary", value: "#6b7280", cssVar: "--secondary" },
    { name: "Background", value: "#ffffff", cssVar: "--background" },
    { name: "Foreground", value: "#0f172a", cssVar: "--foreground" },
  ]);

  const [newUser, setNewUser] = useState({ email: "", role: "user", permissions: [] as string[] });
  const [selectedModule, setSelectedModule] = useState("medicine");

  const moduleStats = {
    medicine: {
      adds: 45,
      views: 120,
      lastActivity: "2 hours ago"
    },
    workerFood: {
      adds: 23,
      views: 67,
      lastActivity: "30 minutes ago"
    }
  };

  const addUser = () => {
    if (!newUser.email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
    };

    setUsers([...users, user]);
    setNewUser({ email: "", role: "user", permissions: [] });
    
    toast({
      title: "Success",
      description: "User added successfully",
    });
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User removed successfully",
    });
  };

  const updateColor = (index: number, newValue: string) => {
    const updatedColors = [...colors];
    updatedColors[index].value = newValue;
    setColors(updatedColors);
    
    // Apply the color change to CSS variables
    document.documentElement.style.setProperty(
      updatedColors[index].cssVar,
      newValue
    );
    
    toast({
      title: "Success",
      description: "Color updated successfully",
    });
  };

  const permissionOptions = ["view", "add", "edit", "delete", "admin"];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, permissions, and system settings</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@farm.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={addUser} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{user.role}</Badge>
                          {user.permissions.map((perm) => (
                            <Badge key={perm} variant="outline">{perm}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Available Permissions</h4>
                    <div className="space-y-2">
                      {permissionOptions.map((permission) => (
                        <div key={permission} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{permission}</span>
                            <Badge variant="outline">
                              {users.filter(u => u.permissions.includes(permission)).length} users
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Module Access Control</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4" />
                          <span className="font-medium">Medicine Inventory</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Control access to medicine management</p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <UtensilsCrossed className="h-4 w-4" />
                          <span className="font-medium">Worker Food</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Control access to worker food management</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Color Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {colors.map((color, index) => (
                    <div key={color.name} className="space-y-2">
                      <Label>{color.name}</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={color.value}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={color.value}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="flex-1"
                        />
                        <div 
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: color.value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Changes are applied immediately. Colors are stored in CSS variables for consistent theming.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Activity Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Select Module to Monitor</Label>
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medicine">Medicine Inventory</SelectItem>
                        <SelectItem value="workerFood">Worker Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Plus className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Add Operations</p>
                            <p className="text-2xl font-bold">{moduleStats[selectedModule as keyof typeof moduleStats].adds}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">View Operations</p>
                            <p className="text-2xl font-bold">{moduleStats[selectedModule as keyof typeof moduleStats].views}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Last Activity</p>
                            <p className="text-lg font-medium">{moduleStats[selectedModule as keyof typeof moduleStats].lastActivity}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;