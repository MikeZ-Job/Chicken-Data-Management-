import { useFarm } from '@/contexts/FarmContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export const FarmSelector = () => {
  const { farms, selectedFarm, setSelectedFarm, loading } = useFarm();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading farms...</span>
      </div>
    );
  }

  if (farms.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>No farms available</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedFarm?.id || ""}
        onValueChange={(value) => {
          const farm = farms.find(f => f.id === value);
          if (farm) setSelectedFarm(farm);
        }}
      >
        <SelectTrigger className="w-[200px] h-8 text-sm">
          <SelectValue placeholder="Select a farm" />
        </SelectTrigger>
        <SelectContent>
          {farms.map((farm) => (
            <SelectItem key={farm.id} value={farm.id}>
              {farm.farm_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};