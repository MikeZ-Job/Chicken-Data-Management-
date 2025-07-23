import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for farm data
export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  dateReceived: string;
  expiryDate: string;
}

export interface ChickenHealth {
  id: string;
  chickenId: string;
  healthStatus: 'healthy' | 'sick' | 'critical';
  lastCheckup: string;
  notes: string;
  vaccination: string;
}

export interface EggProduction {
  id: string;
  date: string;
  eggsCollected: number;
  henCount: number;
  quality: 'excellent' | 'good' | 'fair';
}

export interface Sale {
  id: string;
  item: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: string;
  customer: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface FarmData {
  food: FoodItem[];
  chickenHealth: ChickenHealth[];
  eggProduction: EggProduction[];
  sales: Sale[];
  expenses: Expense[];
}

interface FarmDataContextType {
  data: FarmData;
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  addChickenHealth: (health: Omit<ChickenHealth, 'id'>) => void;
  addEggProduction: (production: Omit<EggProduction, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  getSummary: () => {
    totalFoodItems: number;
    totalEggs: number;
    totalSales: number;
    totalExpenses: number;
    healthyChickens: number;
    sickChickens: number;
  };
}

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

// Sample data for demonstration
const initialData: FarmData = {
  food: [
    {
      id: '1',
      name: 'Chicken Feed Premium',
      quantity: 500,
      unit: 'kg',
      dateReceived: '2024-07-15',
      expiryDate: '2024-12-15'
    },
    {
      id: '2',
      name: 'Corn Grains',
      quantity: 300,
      unit: 'kg',
      dateReceived: '2024-07-20',
      expiryDate: '2024-11-20'
    }
  ],
  chickenHealth: [
    {
      id: '1',
      chickenId: 'CH001',
      healthStatus: 'healthy',
      lastCheckup: '2024-07-20',
      notes: 'Regular checkup - all good',
      vaccination: 'Newcastle Disease - 2024-06-15'
    },
    {
      id: '2',
      chickenId: 'CH002',
      healthStatus: 'sick',
      lastCheckup: '2024-07-22',
      notes: 'Showing signs of respiratory infection',
      vaccination: 'Newcastle Disease - 2024-06-15'
    }
  ],
  eggProduction: [
    {
      id: '1',
      date: '2024-07-22',
      eggsCollected: 85,
      henCount: 100,
      quality: 'excellent'
    },
    {
      id: '2',
      date: '2024-07-21',
      eggsCollected: 82,
      henCount: 100,
      quality: 'good'
    }
  ],
  sales: [
    {
      id: '1',
      item: 'Fresh Eggs',
      quantity: 300,
      pricePerUnit: 0.5,
      totalAmount: 150,
      date: '2024-07-22',
      customer: 'Local Market'
    },
    {
      id: '2',
      item: 'Chicken Meat',
      quantity: 5,
      pricePerUnit: 15,
      totalAmount: 75,
      date: '2024-07-20',
      customer: 'Restaurant ABC'
    }
  ],
  expenses: [
    {
      id: '1',
      category: 'Feed',
      description: 'Premium chicken feed purchase',
      amount: 250,
      date: '2024-07-15',
      paymentMethod: 'cash'
    },
    {
      id: '2',
      category: 'Medical',
      description: 'Veterinary consultation',
      amount: 80,
      date: '2024-07-18',
      paymentMethod: 'card'
    }
  ]
};

export function FarmDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FarmData>(initialData);

  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setData(prev => ({ ...prev, food: [...prev.food, newItem] }));
  };

  const addChickenHealth = (health: Omit<ChickenHealth, 'id'>) => {
    const newHealth = { ...health, id: Date.now().toString() };
    setData(prev => ({ ...prev, chickenHealth: [...prev.chickenHealth, newHealth] }));
  };

  const addEggProduction = (production: Omit<EggProduction, 'id'>) => {
    const newProduction = { ...production, id: Date.now().toString() };
    setData(prev => ({ ...prev, eggProduction: [...prev.eggProduction, newProduction] }));
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: Date.now().toString() };
    setData(prev => ({ ...prev, sales: [...prev.sales, newSale] }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
  };

  const getSummary = () => {
    const totalFoodItems = data.food.reduce((sum, item) => sum + item.quantity, 0);
    const totalEggs = data.eggProduction.reduce((sum, prod) => sum + prod.eggsCollected, 0);
    const totalSales = data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const healthyChickens = data.chickenHealth.filter(h => h.healthStatus === 'healthy').length;
    const sickChickens = data.chickenHealth.filter(h => h.healthStatus === 'sick' || h.healthStatus === 'critical').length;

    return {
      totalFoodItems,
      totalEggs,
      totalSales,
      totalExpenses,
      healthyChickens,
      sickChickens
    };
  };

  return (
    <FarmDataContext.Provider value={{
      data,
      addFoodItem,
      addChickenHealth,
      addEggProduction,
      addSale,
      addExpense,
      getSummary
    }}>
      {children}
    </FarmDataContext.Provider>
  );
}

export function useFarmData() {
  const context = useContext(FarmDataContext);
  if (context === undefined) {
    throw new Error('useFarmData must be used within a FarmDataProvider');
  }
  return context;
}