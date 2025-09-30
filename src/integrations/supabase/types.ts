export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          assigned_farm_id: string | null
          created_at: string
          expiry_date: string | null
          id: string
          permissions: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          assigned_farm_id?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          assigned_farm_id?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_users_assigned_farm_id_fkey"
            columns: ["assigned_farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      "Chicken Processing": {
        Row: {
          avg_weight_per_chicken: number | null
          farm_id: string | null
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
          farm_id?: string | null
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
          farm_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "Chicken Processing_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      chicken_inventory: {
        Row: {
          age: number | null
          breed: string
          date_added: string | null
          date_removed: string | null
          farm_id: string | null
          health_status: string | null
          id: number
        }
        Insert: {
          age?: number | null
          breed: string
          date_added?: string | null
          date_removed?: string | null
          farm_id?: string | null
          health_status?: string | null
          id?: number
        }
        Update: {
          age?: number | null
          breed?: string
          date_added?: string | null
          date_removed?: string | null
          farm_id?: string | null
          health_status?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "chicken_inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      chicken_weights: {
        Row: {
          chicken_id: number
          created_at: string
          date_recorded: string
          id: number
          weight_kg: number
        }
        Insert: {
          chicken_id: number
          created_at?: string
          date_recorded: string
          id?: number
          weight_kg: number
        }
        Update: {
          chicken_id?: number
          created_at?: string
          date_recorded?: string
          id?: number
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "chicken_weights_chicken_id_fkey"
            columns: ["chicken_id"]
            isOneToOne: false
            referencedRelation: "chicken_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string
          farm_name: string
          id: string
          location: string | null
          owner: string | null
        }
        Insert: {
          created_at?: string
          farm_name: string
          id?: string
          location?: string | null
          owner?: string | null
        }
        Update: {
          created_at?: string
          farm_name?: string
          id?: string
          location?: string | null
          owner?: string | null
        }
        Relationships: []
      }
      food_inventory: {
        Row: {
          date_received: string | null
          expiry_date: string | null
          farm_id: string | null
          food_type: string
          id: number
          quantity: number | null
          supplier: string | null
        }
        Insert: {
          date_received?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          food_type: string
          id?: number
          quantity?: number | null
          supplier?: string | null
        }
        Update: {
          date_received?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          food_type?: string
          id?: number
          quantity?: number | null
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_inventory: {
        Row: {
          date_received: string | null
          expiry_date: string | null
          farm_id: string | null
          id: number
          medicine_name: string
          quantity: number | null
        }
        Insert: {
          date_received?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          id?: number
          medicine_name: string
          quantity?: number | null
        }
        Update: {
          date_received?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          id?: number
          medicine_name?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_tracking: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          created_at: string
          farm_id: string | null
          id: string
          payment_date: string | null
          payment_status: string | null
          salary_amount: number
          updated_at: string
          worker_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string
          farm_id?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          salary_amount: number
          updated_at?: string
          worker_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string
          farm_id?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string | null
          salary_amount?: number
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_tracking_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_standards: {
        Row: {
          age_in_days: number
          created_at: string
          expected_weight_kg: number
          id: number
        }
        Insert: {
          age_in_days: number
          created_at?: string
          expected_weight_kg: number
          id?: number
        }
        Update: {
          age_in_days?: number
          created_at?: string
          expected_weight_kg?: number
          id?: number
        }
        Relationships: []
      }
      worker_food: {
        Row: {
          date_provided: string | null
          farm_id: string | null
          food_type: string | null
          id: number
          quantity: number | null
          worker_id: string
        }
        Insert: {
          date_provided?: string | null
          farm_id?: string | null
          food_type?: string | null
          id?: number
          quantity?: number | null
          worker_id: string
        }
        Update: {
          date_provided?: string | null
          farm_id?: string | null
          food_type?: string | null
          id?: number
          quantity?: number | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_food_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          contact_info: string | null
          created_at: string
          farm_id: string | null
          food_allocated: number | null
          full_name: string
          id: string
          national_id_number: string | null
          phone_number: string | null
          role: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          farm_id?: string | null
          food_allocated?: number | null
          full_name: string
          id?: string
          national_id_number?: string | null
          phone_number?: string | null
          role: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          farm_id?: string | null
          food_allocated?: number | null
          full_name?: string
          id?: string
          national_id_number?: string | null
          phone_number?: string | null
          role?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_farm_manager: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_user_expired: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "farm_manager" | "staff"
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
    Enums: {
      user_role: ["admin", "farm_manager", "staff"],
    },
  },
} as const
