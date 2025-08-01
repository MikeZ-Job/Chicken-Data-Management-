import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  username: string;
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
    { id: "1", username: "admin", email: "admin@farm.local", role: "admin", permissions: ["all"] },
    { id: "2", username: "manager", email: "manager@farm.local", role: "manager", permissions: ["view", "add"] },
  ]);
  
  const [colors, setColors] = useState<SystemColor[]>([
    { name: "Primary", value: "199 89% 48%", cssVar: "--primary" },
    { name: "Secondary", value: "210 40% 98%", cssVar: "--secondary" },
    { name: "Background", value: "0 0% 100%", cssVar: "--background" },
    { name: "Foreground", value: "222 84% 5%", cssVar: "--foreground" },
    { name: "Card", value: "0 0% 100%", cssVar: "--card" },
    { name: "Card Foreground", value: "222 84% 5%", cssVar: "--card-foreground" },
    { name: "Muted", value: "210 40% 96%", cssVar: "--muted" },
    { name: "Muted Foreground", value: "215 16% 47%", cssVar: "--muted-foreground" },
  ]);

  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user", permissions: [] as string[] });
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

  const addUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create user in Supabase auth
      const email = `${newUser.username}@farm.local`;
      const { error } = await supabase.auth.admin.createUser({
        email,
        password: newUser.password,
        email_confirm: true
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const user: User = {
        id: Date.now().toString(),
        username: newUser.username,
        email,
        role: newUser.role,
        permissions: newUser.permissions,
      };

      setUsers([...users, user]);
      setNewUser({ username: "", password: "", role: "user", permissions: [] });
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User removed successfully",
    });
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const updateColor = (index: number, newValue: string) => {
    const updatedColors = [...colors];
    
    // Convert hex to HSL if it's a hex color
    if (newValue.startsWith('#')) {
      updatedColors[index].value = hexToHsl(newValue);
    } else {
      updatedColors[index].value = newValue;
    }
    
    setColors(updatedColors);
    
    // Apply the color change to CSS variables
    document.documentElement.style.setProperty(
      updatedColors[index].cssVar,
      updatedColors[index].value
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
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
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
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
                          value={`#${color.value.split(' ').map(v => {
                            const num = parseInt(v.replace('%', ''));
                            return Math.round(num * 255 / 100).toString(16).padStart(2, '0');
                          }).join('')}`}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={color.value}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="flex-1"
                          placeholder="H S% L% (e.g., 199 89% 48%)"
                        />
                        <div 
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: `hsl(${color.value})` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        CSS Variable: {color.cssVar}
                      </p>
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