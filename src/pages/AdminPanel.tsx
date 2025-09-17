import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
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
  Trash2,
  Key,
  Building
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  role: 'admin' | 'farm_manager' | 'staff';
  permissions: string[];
  assigned_farm_id?: string;
  expiry_date?: string;
  created_at: string;
}

interface Farm {
  id: string;
  farm_name: string;
  location: string;
  owner: string;
}

const AdminPanel = () => {
  const { toast } = useToast();
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState<{
    email: string;
    role: 'admin' | 'farm_manager' | 'staff';
    assignedFarmId: string;
    expiryDate: string;
  }>({ 
    email: "", 
    role: "staff", 
    assignedFarmId: "none",
    expiryDate: ""
  });
  const [passwordReset, setPasswordReset] = useState({ email: "", newPassword: "" });

  // Load users and farms data
  useEffect(() => {
    if (isAdmin()) {
      loadUsersAndFarms();
    }
  }, [isAdmin]);

  const loadUsersAndFarms = async () => {
    try {
      // Load users - we'll get emails from a separate edge function
      const { data: usersData, error: usersError } = await supabase
        .from('app_users')
        .select(`
          id,
          role,
          permissions,
          assigned_farm_id,
          expiry_date,
          created_at
        `);

      if (usersError) throw usersError;

      // Use edge function to get user emails safely
      const { data: emailsData, error: emailsError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds: usersData?.map(u => u.id) || [] }
      });

      const usersWithEmails = usersData?.map(user => ({
        ...user,
        email: emailsData?.emails?.[user.id] || 'N/A'
      })) || [];

      // Load farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('id, farm_name, location, owner');

      if (farmsError) throw farmsError;

      setUsers(usersWithEmails || []);
      setFarms(farmsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['full_access', 'user_management', 'farm_management', 'view_all_farms'];
      case 'farm_manager':
        return ['manage_assigned_farm', 'view_reports', 'manage_staff'];
      case 'staff':
        return ['record_weights', 'record_food', 'view_assigned_data'];
      default:
        return [];
    }
  };

  const addUser = async () => {
    if (!newUser.email || !newUser.role) {
      toast({
        title: "Error",
        description: "Email and role are required",
        variant: "destructive",
      });
      return;
    }

    // Validate assigned_farm_id if provided (ignore "none" value)
    if (newUser.assignedFarmId && newUser.assignedFarmId !== "none" && !farms.some(f => f.id === newUser.assignedFarmId)) {
      toast({
        title: "Error",
        description: "Invalid farm assignment",
        variant: "destructive",
      });
      return;
    }

    // Validate expiry date if provided
    if (newUser.expiryDate && new Date(newUser.expiryDate) <= new Date()) {
      toast({
        title: "Error",
        description: "Expiry date must be in the future",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          role: newUser.role,
          assignedFarmId: newUser.assignedFarmId === "none" ? null : newUser.assignedFarmId,
          expiryDate: newUser.expiryDate || null,
        },
      });

      if (error) throw error;

      await loadUsersAndFarms();
      setNewUser({ email: "", role: "staff", assignedFarmId: "none", expiryDate: "" });
      
      toast({
        title: "Success",
        description: "User added successfully! They will receive login credentials via email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete from auth.users (this will cascade to app_users)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      await loadUsersAndFarms();
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const updateUserPermissions = async (userId: string, newRole: 'admin' | 'farm_manager' | 'staff', newFarmId?: string) => {
    try {
      const permissions = getPermissionsForRole(newRole);
      const { error } = await supabase
        .from('app_users')
        .update({
          role: newRole,
          permissions: permissions,
          assigned_farm_id: newFarmId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await loadUsersAndFarms();
      
      toast({
        title: "Success",
        description: "User permissions updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user permissions",
        variant: "destructive",
      });
    }
  };

  const resetUserPassword = async () => {
    if (!passwordReset.email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        passwordReset.email,
        {
          redirectTo: `${window.location.origin}/auth`
        }
      );

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: `Password reset email sent to ${passwordReset.email}`,
      });

      setPasswordReset({ email: "", newPassword: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin()) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access this panel.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  + Add User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@farm.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => 
                        setNewUser({ ...newUser, role: value as 'admin' | 'farm_manager' | 'staff' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="farm_manager">Farm Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedFarm">Assigned Farm</Label>
                    <Select
                      value={newUser.assignedFarmId}
                      onValueChange={(value) => setNewUser({ ...newUser, assignedFarmId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No assignment</SelectItem>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.farm_name} - {farm.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newUser.expiryDate}
                      onChange={(e) => setNewUser({ ...newUser, expiryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addUser} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>* Required fields. Users will receive login credentials via email.</p>
                  <p>• Admin: Full access to all farms and settings</p>
                  <p>• Farm Manager: Manage assigned farm and staff</p>
                  <p>• Staff: Record data and view assigned farm only</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reset User Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">User Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={passwordReset.email}
                      onChange={(e) => setPasswordReset({ ...passwordReset, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={resetUserPassword} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Send Reset Email
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
                {loading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-border">
                       <thead>
                         <tr className="bg-muted">
                           <th className="border border-border p-2 text-left">User ID</th>
                           <th className="border border-border p-2 text-left">Email</th>
                           <th className="border border-border p-2 text-left">Role</th>
                           <th className="border border-border p-2 text-left">Assigned Farm</th>
                           <th className="border border-border p-2 text-left">Permissions</th>
                           <th className="border border-border p-2 text-left">Expiry Date</th>
                           <th className="border border-border p-2 text-left">Actions</th>
                         </tr>
                       </thead>
                       <tbody>
                         {users.map((user) => {
                           const assignedFarm = farms.find(f => f.id === user.assigned_farm_id);
                           const isExpired = user.expiry_date && new Date(user.expiry_date) <= new Date();
                           return (
                             <tr key={user.id} className={isExpired ? "bg-red-50" : ""}>
                               <td className="border border-border p-2 font-mono text-xs">
                                 {user.id.slice(0, 8)}...
                               </td>
                               <td className="border border-border p-2 text-sm">
                                 {user.email}
                               </td>
                               <td className="border border-border p-2">
                                 <Select
                                   value={user.role}
                                   onValueChange={(newRole: 'admin' | 'farm_manager' | 'staff') => updateUserPermissions(user.id, newRole, user.assigned_farm_id)}
                                 >
                                   <SelectTrigger className="w-auto">
                                     <SelectValue>
                                       <span className={`px-2 py-1 rounded text-xs ${
                                         user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                         user.role === 'farm_manager' ? 'bg-blue-100 text-blue-800' :
                                         'bg-green-100 text-green-800'
                                       }`}>
                                         {user.role.replace('_', ' ').toUpperCase()}
                                       </span>
                                     </SelectValue>
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="admin">Admin</SelectItem>
                                     <SelectItem value="farm_manager">Farm Manager</SelectItem>
                                     <SelectItem value="staff">Staff</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </td>
                               <td className="border border-border p-2">
                                 {user.role === 'farm_manager' || user.role === 'staff' ? (
                                    <Select
                                      value={user.assigned_farm_id || "none"}
                                      onValueChange={(farmId) => updateUserPermissions(user.id, user.role, farmId === "none" ? null : farmId)}
                                   >
                                     <SelectTrigger className="w-auto">
                                       <SelectValue>
                                         {assignedFarm ? (
                                           <div className="text-sm">
                                             <div className="font-medium">{assignedFarm.farm_name}</div>
                                           </div>
                                         ) : (
                                           <span className="text-muted-foreground">No farm assigned</span>
                                         )}
                                       </SelectValue>
                                     </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">No assignment</SelectItem>
                                        {farms.map((farm) => (
                                          <SelectItem key={farm.id} value={farm.id}>
                                            {farm.farm_name} - {farm.location}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                   </Select>
                                 ) : (
                                   <span className="text-muted-foreground">-</span>
                                 )}
                                 </td>
                                 <td className="border border-border p-2">
                                   <div className="flex flex-wrap gap-1">
                                     {user.permissions.slice(0, 2).map((perm) => (
                                       <Badge key={perm} variant="outline" className="text-xs">
                                         {perm.replace('_', ' ')}
                                       </Badge>
                                     ))}
                                     {user.permissions.length > 2 && (
                                       <Badge variant="secondary" className="text-xs">
                                         +{user.permissions.length - 2} more
                                       </Badge>
                                     )}
                                   </div>
                                 </td>
                                 <td className="border border-border p-2 text-sm">
                                   {user.expiry_date ? (
                                     <span className={isExpired ? "text-red-600 font-medium" : ""}>
                                       {new Date(user.expiry_date).toLocaleDateString()}
                                       {isExpired && " (Expired)"}
                                     </span>
                                   ) : (
                                     <span className="text-muted-foreground">No expiry</span>
                                   )}
                                 </td>
                               <td className="border border-border p-2 text-sm">
                                 {new Date(user.created_at).toLocaleDateString()}
                               </td>
                               <td className="border border-border p-2">
                                 <Button
                                   variant="destructive"
                                   size="sm"
                                   onClick={() => deleteUser(user.id)}
                                   className="h-8 w-8 p-0"
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </td>
                             </tr>
                           );
                         })}
                       </tbody>
                     </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Full access to all farms, settings, and user management
                  </p>
                  <div className="space-y-2">
                    <Badge className="w-full justify-start">Full Access</Badge>
                    <Badge className="w-full justify-start">User Management</Badge>
                    <Badge className="w-full justify-start">Farm Management</Badge>
                    <Badge className="w-full justify-start">View All Farms</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Farm Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can view and manage only their assigned farm's data
                  </p>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-start">Manage Assigned Farm</Badge>
                    <Badge variant="secondary" className="w-full justify-start">View Reports</Badge>
                    <Badge variant="secondary" className="w-full justify-start">Manage Staff</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Can only record and view chicken weights, food usage, and production data
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start">Record Weights</Badge>
                    <Badge variant="outline" className="w-full justify-start">Record Food Usage</Badge>
                    <Badge variant="outline" className="w-full justify-start">View Assigned Data</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Permission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">User Role Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Admins</span>
                        <Badge variant="destructive">
                          {users.filter(u => u.role === 'admin').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Farm Managers</span>
                        <Badge>
                          {users.filter(u => u.role === 'farm_manager').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Staff</span>
                        <Badge variant="secondary">
                          {users.filter(u => u.role === 'staff').length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Farm Assignments</h4>
                    <div className="space-y-2">
                      {farms.map((farm) => {
                        const assignedUsers = users.filter(u => u.assigned_farm_id === farm.id);
                        return (
                          <div key={farm.id} className="flex justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{farm.farm_name}</span>
                            <Badge variant="outline">
                              {assignedUsers.length} assigned
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
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