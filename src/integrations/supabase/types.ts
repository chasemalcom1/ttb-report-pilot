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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          batch_number: string
          created_at: string
          current_liters: number
          id: string
          notes: string | null
          organization_id: string
          original_liters: number
          production_date: string
          proof: number
          spirit_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          current_liters: number
          id?: string
          notes?: string | null
          organization_id: string
          original_liters: number
          production_date: string
          proof: number
          spirit_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          current_liters?: number
          id?: string
          notes?: string | null
          organization_id?: string
          original_liters?: number
          production_date?: string
          proof?: number
          spirit_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_spirit_id_fkey"
            columns: ["spirit_id"]
            isOneToOne: false
            referencedRelation: "spirits"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          batch_id: string | null
          bottle_size: string | null
          bottles: number | null
          created_at: string
          destination_or_source: string | null
          id: string
          liters: number
          notes: string | null
          operation_date: string
          operator_id: string
          organization_id: string
          proof: number | null
          proof_gallons: number
          spirit_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          bottle_size?: string | null
          bottles?: number | null
          created_at?: string
          destination_or_source?: string | null
          id?: string
          liters: number
          notes?: string | null
          operation_date: string
          operator_id: string
          organization_id: string
          proof?: number | null
          proof_gallons: number
          spirit_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_id?: string | null
          bottle_size?: string | null
          bottles?: number | null
          created_at?: string
          destination_or_source?: string | null
          id?: string
          liters?: number
          notes?: string | null
          operation_date?: string
          operator_id?: string
          organization_id?: string
          proof?: number | null
          proof_gallons?: number
          spirit_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_spirit_id_fkey"
            columns: ["spirit_id"]
            isOneToOne: false
            referencedRelation: "spirits"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dsp_number: string | null
          ein: string | null
          id: string
          name: string
          permit_number: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dsp_number?: string | null
          ein?: string | null
          id?: string
          name: string
          permit_number?: string | null
          phone?: string | null
          state?: string | null
          type: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dsp_number?: string | null
          ein?: string | null
          id?: string
          name?: string
          permit_number?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports_5110_11: {
        Row: {
          beginning_inventory: number
          bottling: number
          created_at: string
          ein_number: string
          ending_inventory: number
          id: string
          loss: number
          organization_id: string
          production: number
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          transfer_in: number
          updated_at: string
          user_id: string
        }
        Insert: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number: string
          ending_inventory?: number
          id?: string
          loss?: number
          organization_id: string
          production?: number
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          transfer_in?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number?: string
          ending_inventory?: number
          id?: string
          loss?: number
          organization_id?: string
          production?: number
          proprietor_address?: string
          proprietor_name?: string
          registration_number?: string
          report_period?: string
          report_type?: string
          transfer_in?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_5110_11_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_5110_28: {
        Row: {
          beginning_inventory: number
          bottling: number
          created_at: string
          ein_number: string
          ending_inventory: number
          id: string
          organization_id: string
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          tax_withdrawal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number: string
          ending_inventory?: number
          id?: string
          organization_id: string
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          tax_withdrawal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number?: string
          ending_inventory?: number
          id?: string
          organization_id?: string
          proprietor_address?: string
          proprietor_name?: string
          registration_number?: string
          report_period?: string
          report_type?: string
          tax_withdrawal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_5110_28_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_5110_40: {
        Row: {
          beginning_inventory: number
          bottling: number
          created_at: string
          ein_number: string
          ending_inventory: number
          id: string
          loss: number
          organization_id: string
          production: number
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          transfer_in: number
          transfer_out: number
          updated_at: string
          user_id: string
        }
        Insert: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number: string
          ending_inventory?: number
          id?: string
          loss?: number
          organization_id: string
          production?: number
          proprietor_address: string
          proprietor_name: string
          registration_number: string
          report_period: string
          report_type: string
          transfer_in?: number
          transfer_out?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          beginning_inventory?: number
          bottling?: number
          created_at?: string
          ein_number?: string
          ending_inventory?: number
          id?: string
          loss?: number
          organization_id?: string
          production?: number
          proprietor_address?: string
          proprietor_name?: string
          registration_number?: string
          report_period?: string
          report_type?: string
          transfer_in?: number
          transfer_out?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_5110_40_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spirits: {
        Row: {
          active: boolean
          created_at: string
          default_proof: number
          description: string | null
          id: string
          name: string
          organization_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_proof: number
          description?: string | null
          id?: string
          name: string
          organization_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_proof?: number
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spirits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_user_admin_of_org: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
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
