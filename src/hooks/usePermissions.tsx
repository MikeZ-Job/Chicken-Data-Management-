import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  role: 'admin' | 'farm_manager' | 'staff';
  permissions: string[];
  assigned_farm_id?: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('role, permissions, assigned_farm_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    return profile.permissions.includes(permission) || profile.permissions.includes('full_access');
  };

  const isAdmin = (): boolean => {
    return profile?.role === 'admin';
  };

  const isFarmManager = (): boolean => {
    return profile?.role === 'farm_manager';
  };

  const isStaff = (): boolean => {
    return profile?.role === 'staff';
  };

  const canAccessFarm = (farmId: string): boolean => {
    if (isAdmin()) return true;
    if (isFarmManager() && profile?.assigned_farm_id === farmId) return true;
    if (isStaff() && profile?.assigned_farm_id === farmId) return true;
    return false;
  };

  return {
    profile,
    loading,
    hasPermission,
    isAdmin,
    isFarmManager,
    isStaff,
    canAccessFarm,
  };
};