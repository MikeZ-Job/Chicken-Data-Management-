export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "Chicken Processing": {
        Row: {
          avg_weight_per_chicken: number | null
          id: number
          manure_kg: number | null
          missing_chickens: number | null
          mortality: number | null
          num_crates: number | null
          Processing_date: string
          remarks: string | null
          stack_no: string | null
          Total_Number_of_Chicken: number | null
          total_weight_kg: number | null
        }
        Insert: {
          avg_weight_per_chicken?: number | null
          id?: number
          manure_kg?: number | null
          missing_chickens?: number | null
          mortality?: number | null
          num_crates?: number | null
          Processing_date: string
          remarks?: string | null
          stack_no?: string | null
          Total_Number_of_Chicken?: number | null
          total_weight_kg?: number | null
        }
        Update: {
          avg_weight_per_chicken?: number | null
          id?: number
          manure_kg?: number | null
          missing_chickens?: number | null
          mortality?: number | null
          num_crates?: number | null
          Processing_date?: string
          remarks?: string | null
          stack_no?: string | null
          Total_Number_of_Chicken?: number | null
          total_weight_kg?: number | null
        }
        Relationships: []
      }
      chicken_inventory: {
        Row: {
          age: number | null
          breed: string
          date_added: string | null
          date_removed: string | null
          health_status: string | null
          id: number
        }
        Insert: {
          age?: number | null
          breed: string
          date_added?: string | null
          date_removed?: string | null
          health_status?: string | null
          id?: number
        }
        Update: {
          age?: number | null
          breed?: string
          date_added?: string | null
          date_removed?: string | null
          health_status?: string | null
          id?: number
        }
        Relationships: []
      }
      food_inventory: {
        Row: {
          date_received: string | null
          expiry_date: string | null
          food_type: string
          id: number
          quantity: number | null
          supplier: string | null
        }
        Insert: {
          date_received?: string | null
          expiry_date?: string | null
          food_type: string
          id?: number
          quantity?: number | null
          supplier?: string | null
        }
        Update: {
          date_received?: string | null
          expiry_date?: string | null
          food_type?: string
          id?: number
          quantity?: number | null
          supplier?: string | null
        }
        Relationships: []
      }
      medicine_inventory: {
        Row: {
          date_received: string | null
          expiry_date: string | null
          id: number
          medicine_name: string
          quantity: number | null
        }
        Insert: {
          date_received?: string | null
          expiry_date?: string | null
          id?: number
          medicine_name: string
          quantity?: number | null
        }
        Update: {
          date_received?: string | null
          expiry_date?: string | null
          id?: number
          medicine_name?: string
          quantity?: number | null
        }
        Relationships: []
      }
      worker_food: {
        Row: {
          date_provided: string | null
          food_type: string | null
          id: number
          quantity: number | null
          worker_id: string
        }
        Insert: {
          date_provided?: string | null
          food_type?: string | null
          id?: number
          quantity?: number | null
          worker_id: string
        }
        Update: {
          date_provided?: string | null
          food_type?: string | null
          id?: number
          quantity?: number | null
          worker_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
