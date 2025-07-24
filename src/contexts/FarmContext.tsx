import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Farm {
  id: string;
  farm_name: string;
  location: string | null;
  owner: string | null;
  created_at: string;
}

interface FarmContextType {
  farms: Farm[];
  selectedFarm: Farm | null;
  setSelectedFarm: (farm: Farm) => void;
  loading: boolean;
  refreshFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarmState] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('farm_name');

      if (error) throw error;

      setFarms(data || []);
      
      // If no farm is selected and farms exist, select the first one
      if (!selectedFarm && data && data.length > 0) {
        const savedFarmId = localStorage.getItem('selectedFarmId');
        const farmToSelect = savedFarmId 
          ? data.find(f => f.id === savedFarmId) || data[0]
          : data[0];
        setSelectedFarmState(farmToSelect);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: "Error",
        description: "Failed to load farms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setSelectedFarm = (farm: Farm) => {
    setSelectedFarmState(farm);
    localStorage.setItem('selectedFarmId', farm.id);
  };

  const refreshFarms = async () => {
    await fetchFarms();
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  return (
    <FarmContext.Provider value={{
      farms,
      selectedFarm,
      setSelectedFarm,
      loading,
      refreshFarms
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};