import { FarmDataProvider } from "@/contexts/FarmDataContext";
import FarmLayout from "./FarmLayout";

export default function AppLayout() {
  return (
    <FarmDataProvider>
      <FarmLayout />
    </FarmDataProvider>
  );
}