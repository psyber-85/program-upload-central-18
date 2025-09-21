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
      crm_campaigns: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          notes: string | null
          objective: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          objective?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          objective?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_lead_activities: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          note: string
          timestamp: string
          type: Database["public"]["Enums"]["crm_activity_type"]
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          note: string
          timestamp?: string
          type: Database["public"]["Enums"]["crm_activity_type"]
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
          timestamp?: string
          type?: Database["public"]["Enums"]["crm_activity_type"]
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          campaign_id: string
          confirmed_deal_size: number | null
          converted_at: string | null
          created_at: string
          email: string
          id: string
          industry: string
          job_role: string
          last_contacted: string | null
          lead_score: Database["public"]["Enums"]["crm_lead_score"]
          lead_source: string
          name: string
          next_follow_up: string | null
          notes: string | null
          number: string
          org: string
          owner_id: string | null
          owner_name: string
          potential_deal_size: number | null
          state: string
          status: Database["public"]["Enums"]["crm_lead_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          confirmed_deal_size?: number | null
          converted_at?: string | null
          created_at?: string
          email: string
          id?: string
          industry: string
          job_role: string
          last_contacted?: string | null
          lead_score?: Database["public"]["Enums"]["crm_lead_score"]
          lead_source: string
          name: string
          next_follow_up?: string | null
          notes?: string | null
          number: string
          org: string
          owner_id?: string | null
          owner_name: string
          potential_deal_size?: number | null
          state: string
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          confirmed_deal_size?: number | null
          converted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string
          job_role?: string
          last_contacted?: string | null
          lead_score?: Database["public"]["Enums"]["crm_lead_score"]
          lead_source?: string
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          number?: string
          org?: string
          owner_id?: string | null
          owner_name?: string
          potential_deal_size?: number | null
          state?: string
          status?: Database["public"]["Enums"]["crm_lead_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crm_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_contacts: {
        Row: {
          created_at: string
          email: string
          email_sent_at: string | null
          id: string
          name: string
          phone: string | null
          prospect_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_sent_at?: string | null
          id?: string
          name: string
          phone?: string | null
          prospect_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          prospect_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_contacts_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          email: string
          email_sent: boolean
          id: string
          key_skills: string | null
          name: string
          nric_number: string
          phone: string | null
          program_id: string
          program_name: string
          registered_at: string
        }
        Insert: {
          email: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          name: string
          nric_number: string
          phone?: string | null
          program_id: string
          program_name: string
          registered_at?: string
        }
        Update: {
          email?: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          name?: string
          nric_number?: string
          phone?: string | null
          program_id?: string
          program_name?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      participants_bday: {
        Row: {
          birth_date: string | null
          email: string
          email_sent: boolean
          id: string
          key_skills: string | null
          name: string
          nric_number: string
          phone: string | null
          program_id: string
          program_name: string
          registered_at: string
        }
        Insert: {
          birth_date?: string | null
          email: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          name: string
          nric_number: string
          phone?: string | null
          program_id: string
          program_name: string
          registered_at?: string
        }
        Update: {
          birth_date?: string | null
          email?: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          name?: string
          nric_number?: string
          phone?: string | null
          program_id?: string
          program_name?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_bday_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      participants_bday_duplicate: {
        Row: {
          birth_date: string | null
          birth_mmdd: string | null
          email: string
          email_sent: boolean
          id: string
          key_skills: string | null
          last_birthday_sent_year: string | null
          name: string
          nric_number: string
          phone: string | null
          program_id: string
          program_name: string
          registered_at: string
        }
        Insert: {
          birth_date?: string | null
          birth_mmdd?: string | null
          email: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          last_birthday_sent_year?: string | null
          name: string
          nric_number: string
          phone?: string | null
          program_id: string
          program_name: string
          registered_at?: string
        }
        Update: {
          birth_date?: string | null
          birth_mmdd?: string | null
          email?: string
          email_sent?: boolean
          id?: string
          key_skills?: string | null
          last_birthday_sent_year?: string | null
          name?: string
          nric_number?: string
          phone?: string | null
          program_id?: string
          program_name?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_bday_duplicate_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          id: string
          pricing: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pricing?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pricing?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospect_calls: {
        Row: {
          call_date: string
          created_at: string
          id: string
          notes: string | null
          prospect_id: string
        }
        Insert: {
          call_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          prospect_id: string
        }
        Update: {
          call_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_calls_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          org: string | null
          payment: string | null
          phone: string | null
          product_id: string | null
          product_type: string | null
          program_id: string | null
          registration_status: string | null
          role: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          org?: string | null
          payment?: string | null
          phone?: string | null
          product_id?: string | null
          product_type?: string | null
          program_id?: string | null
          registration_status?: string | null
          role?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          org?: string | null
          payment?: string | null
          phone?: string | null
          product_id?: string | null
          product_type?: string | null
          program_id?: string | null
          registration_status?: string | null
          role?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registration_programs: {
        Row: {
          created_at: string
          id: string
          pricing: number | null
          product_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pricing?: number | null
          product_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pricing?: number | null
          product_id?: string | null
          title?: string
          updated_at?: string
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
      crm_activity_type: "Contacted" | "Call" | "Email"
      crm_lead_score: "A" | "B" | "C" | "D" | "E"
      crm_lead_status: "Success" | "Lost" | "Future"
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
      crm_activity_type: ["Contacted", "Call", "Email"],
      crm_lead_score: ["A", "B", "C", "D", "E"],
      crm_lead_status: ["Success", "Lost", "Future"],
    },
  },
} as const
