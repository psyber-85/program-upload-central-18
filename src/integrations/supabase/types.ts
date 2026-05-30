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
      ih_access_checklist: {
        Row: {
          id: string
          item_key: string
          staff_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          item_key: string
          staff_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          item_key?: string
          staff_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ih_access_checklist_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_access_checklist_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_finance_snapshots: {
        Row: {
          created_at: string
          id: string
          line_items: Json
          locked_at: string | null
          locked_by: string | null
          month: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["ih_finance_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          line_items?: Json
          locked_at?: string | null
          locked_by?: string | null
          month: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["ih_finance_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          line_items?: Json
          locked_at?: string | null
          locked_by?: string | null
          month?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["ih_finance_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ih_leave_balances: {
        Row: {
          al_total: number
          al_used: number
          id: string
          sl_total: number
          sl_used: number
          staff_id: string
          updated_at: string
          year: number
        }
        Insert: {
          al_total?: number
          al_used?: number
          id?: string
          sl_total?: number
          sl_used?: number
          staff_id: string
          updated_at?: string
          year: number
        }
        Update: {
          al_total?: number
          al_used?: number
          id?: string
          sl_total?: number
          sl_used?: number
          staff_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ih_leave_balances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_leave_balances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_notice_acks: {
        Row: {
          acked_at: string
          notice_id: string
          staff_id: string
        }
        Insert: {
          acked_at?: string
          notice_id: string
          staff_id: string
        }
        Update: {
          acked_at?: string
          notice_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_notice_acks_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "ih_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_notice_acks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_notice_acks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_notice_reads: {
        Row: {
          notice_id: string
          read_at: string
          staff_id: string
        }
        Insert: {
          notice_id: string
          read_at?: string
          staff_id: string
        }
        Update: {
          notice_id?: string
          read_at?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "ih_notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_notice_reads_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_notice_reads_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_notices: {
        Row: {
          ack_required: boolean
          archived_at: string | null
          audience: string
          audience_staff_id: string | null
          body: string
          created_at: string
          created_by: string | null
          email_required: boolean
          id: string
          importance: Database["public"]["Enums"]["ih_notice_importance"]
          title: string
        }
        Insert: {
          ack_required?: boolean
          archived_at?: string | null
          audience?: string
          audience_staff_id?: string | null
          body: string
          created_at?: string
          created_by?: string | null
          email_required?: boolean
          id?: string
          importance?: Database["public"]["Enums"]["ih_notice_importance"]
          title: string
        }
        Update: {
          ack_required?: boolean
          archived_at?: string | null
          audience?: string
          audience_staff_id?: string | null
          body?: string
          created_at?: string
          created_by?: string | null
          email_required?: boolean
          id?: string
          importance?: Database["public"]["Enums"]["ih_notice_importance"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_notices_audience_staff_id_fkey"
            columns: ["audience_staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_notices_audience_staff_id_fkey"
            columns: ["audience_staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_payroll_items: {
        Row: {
          base_salary: number
          claims_total: number | null
          created_at: string
          days_worked: number | null
          employer_epf: number | null
          employer_socso: number | null
          epf: number | null
          id: string
          net_pay: number
          run_id: string
          socso: number | null
          staff_id: string
          staff_name: string
          total_company_cost: number
          total_days: number | null
          training_total: number | null
        }
        Insert: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string
          days_worked?: number | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          net_pay?: number
          run_id: string
          socso?: number | null
          staff_id: string
          staff_name: string
          total_company_cost?: number
          total_days?: number | null
          training_total?: number | null
        }
        Update: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string
          days_worked?: number | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          net_pay?: number
          run_id?: string
          socso?: number | null
          staff_id?: string
          staff_name?: string
          total_company_cost?: number
          total_days?: number | null
          training_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ih_payroll_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ih_payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payroll_items_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payroll_items_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_payroll_runs: {
        Row: {
          created_at: string
          finalized_at: string | null
          finalized_by: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          month: string
          status: Database["public"]["Enums"]["ih_payroll_status"]
          total_work_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          month: string
          status?: Database["public"]["Enums"]["ih_payroll_status"]
          total_work_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          month?: string
          status?: Database["public"]["Enums"]["ih_payroll_status"]
          total_work_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      ih_payslip_downloads: {
        Row: {
          downloaded_at: string
          id: string
          payslip_id: string
          staff_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          payslip_id: string
          staff_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          payslip_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_payslip_downloads_payslip_id_fkey"
            columns: ["payslip_id"]
            isOneToOne: false
            referencedRelation: "ih_payslips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payslip_downloads_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payslip_downloads_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_payslips: {
        Row: {
          base_salary: number
          claims_total: number | null
          created_at: string
          employer_epf: number | null
          employer_socso: number | null
          epf: number | null
          id: string
          month: string
          net_pay: number
          pdf_path: string | null
          run_id: string
          socso: number | null
          staff_id: string
          training_total: number | null
        }
        Insert: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          month: string
          net_pay?: number
          pdf_path?: string | null
          run_id: string
          socso?: number | null
          staff_id: string
          training_total?: number | null
        }
        Update: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          month?: string
          net_pay?: number
          pdf_path?: string | null
          run_id?: string
          socso?: number | null
          staff_id?: string
          training_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ih_payslips_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ih_payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payslips_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_payslips_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_request_attachments: {
        Row: {
          id: string
          kind: string | null
          mime: string | null
          path: string
          request_id: string
          size: number | null
          staff_id: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          kind?: string | null
          mime?: string | null
          path: string
          request_id: string
          size?: number | null
          staff_id: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          kind?: string | null
          mime?: string | null
          path?: string
          request_id?: string
          size?: number | null
          staff_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_request_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ih_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_request_attachments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_request_attachments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_requests: {
        Row: {
          calendar_event_id: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          kind: Database["public"]["Enums"]["ih_request_kind"]
          payload: Json
          staff_id: string
          status: Database["public"]["Enums"]["ih_request_status"]
          updated_at: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          kind: Database["public"]["Enums"]["ih_request_kind"]
          payload?: Json
          staff_id: string
          status?: Database["public"]["Enums"]["ih_request_status"]
          updated_at?: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["ih_request_kind"]
          payload?: Json
          staff_id?: string
          status?: Database["public"]["Enums"]["ih_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_resources: {
        Row: {
          archived_at: string | null
          audience: string
          category: string
          created_at: string
          description: string | null
          id: string
          title: string
          url: string
        }
        Insert: {
          archived_at?: string | null
          audience?: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          url: string
        }
        Update: {
          archived_at?: string | null
          audience?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      ih_staff_profiles: {
        Row: {
          admin_notes: string | null
          business_arm: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at: string
          deactivated_at: string | null
          email: string
          epf_rate: number | null
          id: string
          insurance_notes: string | null
          job_title: string | null
          join_date: string
          name: string
          notion_unlocked_at: string | null
          role: Database["public"]["Enums"]["ih_app_role"]
          salary_base: number | null
          socso_rate: number | null
          status: Database["public"]["Enums"]["ih_staff_status"]
          updated_at: string
          welcome_email_status: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_arm?: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at?: string
          deactivated_at?: string | null
          email: string
          epf_rate?: number | null
          id: string
          insurance_notes?: string | null
          job_title?: string | null
          join_date?: string
          name: string
          notion_unlocked_at?: string | null
          role?: Database["public"]["Enums"]["ih_app_role"]
          salary_base?: number | null
          socso_rate?: number | null
          status?: Database["public"]["Enums"]["ih_staff_status"]
          updated_at?: string
          welcome_email_status?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_arm?: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at?: string
          deactivated_at?: string | null
          email?: string
          epf_rate?: number | null
          id?: string
          insurance_notes?: string | null
          job_title?: string | null
          join_date?: string
          name?: string
          notion_unlocked_at?: string | null
          role?: Database["public"]["Enums"]["ih_app_role"]
          salary_base?: number | null
          socso_rate?: number | null
          status?: Database["public"]["Enums"]["ih_staff_status"]
          updated_at?: string
          welcome_email_status?: string | null
        }
        Relationships: []
      }
      ih_tool_access: {
        Row: {
          granted_at: string | null
          id: string
          staff_id: string
          status: string
          tool: string
        }
        Insert: {
          granted_at?: string | null
          id?: string
          staff_id: string
          status?: string
          tool: string
        }
        Update: {
          granted_at?: string | null
          id?: string
          staff_id?: string
          status?: string
          tool?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_tool_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_tool_access_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
            referencedColumns: ["id"]
          },
        ]
      }
      ih_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["ih_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ih_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ih_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ih_welcome_emails: {
        Row: {
          created_at: string
          failure_reason: string | null
          id: string
          sent_at: string | null
          staff_id: string
          status: string
        }
        Insert: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          sent_at?: string | null
          staff_id: string
          status?: string
        }
        Update: {
          created_at?: string
          failure_reason?: string | null
          id?: string
          sent_at?: string | null
          staff_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ih_welcome_emails_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ih_welcome_emails_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "ih_staff_profiles_self"
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
      program_links: {
        Row: {
          brochure_url: string
          created_at: string
          id: string
          program_title: string
          signup_form_url: string
          updated_at: string
        }
        Insert: {
          brochure_url: string
          created_at?: string
          id?: string
          program_title: string
          signup_form_url: string
          updated_at?: string
        }
        Update: {
          brochure_url?: string
          created_at?: string
          id?: string
          program_title?: string
          signup_form_url?: string
          updated_at?: string
        }
        Relationships: []
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
          prospect_score: string | null
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
          prospect_score?: string | null
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
          prospect_score?: string | null
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
          round_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pricing?: number | null
          product_id?: string | null
          round_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pricing?: number | null
          product_id?: string | null
          round_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_programs_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "registration_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_rounds: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sp_app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      sp_bills: {
        Row: {
          amount: number
          attachment_file_name: string | null
          attachment_file_size: number | null
          attachment_file_type: string | null
          attachment_uploaded_at: string | null
          category: string
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          status: Database["public"]["Enums"]["sp_bill_status"] | null
          updated_at: string | null
          vendor_name: string
        }
        Insert: {
          amount: number
          attachment_file_name?: string | null
          attachment_file_size?: number | null
          attachment_file_type?: string | null
          attachment_uploaded_at?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["sp_bill_status"] | null
          updated_at?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          attachment_file_name?: string | null
          attachment_file_size?: number | null
          attachment_file_type?: string | null
          attachment_uploaded_at?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["sp_bill_status"] | null
          updated_at?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      sp_claim_requests: {
        Row: {
          admin_comment: string | null
          amount: number
          attachment_url: string | null
          auto_approved: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          included_in_payroll_month: string | null
          linked_training_app_id: string | null
          receipt_file_name: string | null
          receipt_file_size: number | null
          receipt_file_type: string | null
          receipt_uploaded_at: string | null
          status: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          amount: number
          attachment_url?: string | null
          auto_approved?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          included_in_payroll_month?: string | null
          linked_training_app_id?: string | null
          receipt_file_name?: string | null
          receipt_file_size?: number | null
          receipt_file_type?: string | null
          receipt_uploaded_at?: string | null
          status?: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          amount?: number
          attachment_url?: string | null
          auto_approved?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          included_in_payroll_month?: string | null
          linked_training_app_id?: string | null
          receipt_file_name?: string | null
          receipt_file_size?: number | null
          receipt_file_type?: string | null
          receipt_uploaded_at?: string | null
          status?: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sp_doc_links: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      sp_invoices: {
        Row: {
          business_arm: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          items: Json
          notes: string | null
          paid_date: string | null
          payment_terms: string | null
          quotation_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["sp_invoice_status"] | null
          total: number
          updated_at: string | null
        }
        Insert: {
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          items?: Json
          notes?: string | null
          paid_date?: string | null
          payment_terms?: string | null
          quotation_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["sp_invoice_status"] | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          paid_date?: string | null
          payment_terms?: string | null
          quotation_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["sp_invoice_status"] | null
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      sp_leave_balances: {
        Row: {
          al_carry_forward: number | null
          al_total: number | null
          al_used: number | null
          created_at: string | null
          id: string
          sl_total: number | null
          sl_used: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          al_carry_forward?: number | null
          al_total?: number | null
          al_used?: number | null
          created_at?: string | null
          id?: string
          sl_total?: number | null
          sl_used?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          al_carry_forward?: number | null
          al_total?: number | null
          al_used?: number | null
          created_at?: string | null
          id?: string
          sl_total?: number | null
          sl_used?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      sp_leave_requests: {
        Row: {
          admin_comment: string | null
          attachment_url: string | null
          created_at: string | null
          custom_leave_type: string | null
          end_date: string
          half_day: boolean | null
          id: string
          leave_type: Database["public"]["Enums"]["sp_leave_type"]
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          attachment_url?: string | null
          created_at?: string | null
          custom_leave_type?: string | null
          end_date: string
          half_day?: boolean | null
          id?: string
          leave_type: Database["public"]["Enums"]["sp_leave_type"]
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          attachment_url?: string | null
          created_at?: string | null
          custom_leave_type?: string | null
          end_date?: string
          half_day?: boolean | null
          id?: string
          leave_type?: Database["public"]["Enums"]["sp_leave_type"]
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["sp_request_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sp_payments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          payment_number: string
          po_id: string | null
          reference: string | null
          vendor_name: string
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["sp_payment_method"]
          payment_number: string
          po_id?: string | null
          reference?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["sp_payment_method"]
          payment_number?: string
          po_id?: string | null
          reference?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sp_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "sp_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp_payments_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "sp_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_payroll_items: {
        Row: {
          base_salary: number
          claims_total: number | null
          created_at: string | null
          days_worked: number | null
          employer_epf: number | null
          employer_socso: number | null
          epf: number | null
          id: string
          net_pay: number
          original_salary: number | null
          run_id: string
          socso: number | null
          total_company_cost: number
          total_days: number | null
          training_claims_total: number | null
          user_id: string
          user_name: string
        }
        Insert: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string | null
          days_worked?: number | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          net_pay?: number
          original_salary?: number | null
          run_id: string
          socso?: number | null
          total_company_cost?: number
          total_days?: number | null
          training_claims_total?: number | null
          user_id: string
          user_name: string
        }
        Update: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string | null
          days_worked?: number | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          net_pay?: number
          original_salary?: number | null
          run_id?: string
          socso?: number | null
          total_company_cost?: number
          total_days?: number | null
          training_claims_total?: number | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sp_payroll_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sp_payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_payroll_runs: {
        Row: {
          created_at: string | null
          finalized_at: string | null
          id: string
          month: string
          status: Database["public"]["Enums"]["sp_payroll_status"] | null
          total_work_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          finalized_at?: string | null
          id?: string
          month: string
          status?: Database["public"]["Enums"]["sp_payroll_status"] | null
          total_work_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          finalized_at?: string | null
          id?: string
          month?: string
          status?: Database["public"]["Enums"]["sp_payroll_status"] | null
          total_work_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sp_payslips: {
        Row: {
          base_salary: number
          claims_total: number | null
          created_at: string | null
          employer_epf: number | null
          employer_socso: number | null
          epf: number | null
          id: string
          month: string
          net_pay: number
          run_id: string
          socso: number | null
          training_claims_total: number | null
          user_id: string
        }
        Insert: {
          base_salary: number
          claims_total?: number | null
          created_at?: string | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          month: string
          net_pay: number
          run_id: string
          socso?: number | null
          training_claims_total?: number | null
          user_id: string
        }
        Update: {
          base_salary?: number
          claims_total?: number | null
          created_at?: string | null
          employer_epf?: number | null
          employer_socso?: number | null
          epf?: number | null
          id?: string
          month?: string
          net_pay?: number
          run_id?: string
          socso?: number | null
          training_claims_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sp_payslips_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sp_payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sp_purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          expected_delivery: string | null
          id: string
          items: Json
          notes: string | null
          po_number: string
          status: Database["public"]["Enums"]["sp_po_status"] | null
          total: number
          updated_at: string | null
          vendor_address: string | null
          vendor_email: string | null
          vendor_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          items?: Json
          notes?: string | null
          po_number: string
          status?: Database["public"]["Enums"]["sp_po_status"] | null
          total?: number
          updated_at?: string | null
          vendor_address?: string | null
          vendor_email?: string | null
          vendor_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          items?: Json
          notes?: string | null
          po_number?: string
          status?: Database["public"]["Enums"]["sp_po_status"] | null
          total?: number
          updated_at?: string | null
          vendor_address?: string | null
          vendor_email?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      sp_quotations: {
        Row: {
          business_arm: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          converted_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          issue_date: string
          items: Json
          notes: string | null
          quotation_number: string
          reference: string | null
          status: Database["public"]["Enums"]["sp_quotation_status"] | null
          total: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          converted_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          quotation_number: string
          reference?: string | null
          status?: Database["public"]["Enums"]["sp_quotation_status"] | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          converted_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          quotation_number?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["sp_quotation_status"] | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      sp_staff_profiles: {
        Row: {
          avatar_url: string | null
          business_arm: Database["public"]["Enums"]["sp_business_arm"] | null
          created_at: string | null
          email: string
          epf_rate: number | null
          id: string
          is_active: boolean | null
          join_date: string
          name: string
          salary_base: number | null
          socso_rate: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          created_at?: string | null
          email: string
          epf_rate?: number | null
          id: string
          is_active?: boolean | null
          join_date?: string
          name: string
          salary_base?: number | null
          socso_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_arm?: Database["public"]["Enums"]["sp_business_arm"] | null
          created_at?: string | null
          email?: string
          epf_rate?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string
          name?: string
          salary_base?: number | null
          socso_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sp_training_applications: {
        Row: {
          approved_at: string | null
          attachment_url: string | null
          claimed_at: string | null
          completed_at: string | null
          cost: number
          course_name: string
          created_at: string | null
          id: string
          included_in_payroll_month: string | null
          justification: string | null
          link: string | null
          provider: string
          status: Database["public"]["Enums"]["sp_training_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          attachment_url?: string | null
          claimed_at?: string | null
          completed_at?: string | null
          cost: number
          course_name: string
          created_at?: string | null
          id?: string
          included_in_payroll_month?: string | null
          justification?: string | null
          link?: string | null
          provider: string
          status?: Database["public"]["Enums"]["sp_training_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          attachment_url?: string | null
          claimed_at?: string | null
          completed_at?: string | null
          cost?: number
          course_name?: string
          created_at?: string | null
          id?: string
          included_in_payroll_month?: string | null
          justification?: string | null
          link?: string | null
          provider?: string
          status?: Database["public"]["Enums"]["sp_training_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sp_training_entitlements: {
        Row: {
          annual_amount: number | null
          created_at: string | null
          eligible_from: string
          id: string
          override_balance: number | null
          override_eligible: boolean | null
          updated_at: string | null
          used_amount: number | null
          user_id: string
        }
        Insert: {
          annual_amount?: number | null
          created_at?: string | null
          eligible_from?: string
          id?: string
          override_balance?: number | null
          override_eligible?: boolean | null
          updated_at?: string | null
          used_amount?: number | null
          user_id: string
        }
        Update: {
          annual_amount?: number | null
          created_at?: string | null
          eligible_from?: string
          id?: string
          override_balance?: number | null
          override_eligible?: boolean | null
          updated_at?: string | null
          used_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sp_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["sp_app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["sp_app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["sp_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      tryhire_brochure_downloads: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      ih_staff_profiles_self: {
        Row: {
          business_arm: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at: string | null
          deactivated_at: string | null
          email: string | null
          id: string | null
          job_title: string | null
          join_date: string | null
          name: string | null
          notion_unlocked_at: string | null
          role: Database["public"]["Enums"]["ih_app_role"] | null
          status: Database["public"]["Enums"]["ih_staff_status"] | null
          updated_at: string | null
          welcome_email_status: string | null
        }
        Insert: {
          business_arm?: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at?: string | null
          deactivated_at?: string | null
          email?: string | null
          id?: string | null
          job_title?: string | null
          join_date?: string | null
          name?: string | null
          notion_unlocked_at?: string | null
          role?: Database["public"]["Enums"]["ih_app_role"] | null
          status?: Database["public"]["Enums"]["ih_staff_status"] | null
          updated_at?: string | null
          welcome_email_status?: string | null
        }
        Update: {
          business_arm?: Database["public"]["Enums"]["ih_business_arm"] | null
          created_at?: string | null
          deactivated_at?: string | null
          email?: string | null
          id?: string | null
          job_title?: string | null
          join_date?: string | null
          name?: string | null
          notion_unlocked_at?: string | null
          role?: Database["public"]["Enums"]["ih_app_role"] | null
          status?: Database["public"]["Enums"]["ih_staff_status"] | null
          updated_at?: string | null
          welcome_email_status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_ih_role: {
        Args: {
          _role: Database["public"]["Enums"]["ih_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_sp_role: {
        Args: {
          _role: Database["public"]["Enums"]["sp_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_ih_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      crm_activity_type: "Contacted" | "Call" | "Email"
      crm_lead_score: "A" | "B" | "C" | "D" | "E"
      crm_lead_status: "Success" | "Lost" | "Future"
      ih_app_role: "admin" | "staff"
      ih_business_arm: "Training" | "Solutions" | "Both"
      ih_finance_status: "Draft" | "Reviewed" | "Locked"
      ih_notice_importance: "Normal" | "Important" | "Critical"
      ih_payroll_status: "Draft" | "Finalized" | "Locked"
      ih_request_kind: "Leave" | "MC" | "Claim" | "Training" | "Benefit"
      ih_request_status:
        | "Submitted"
        | "Approved"
        | "Rejected"
        | "NeedsCorrection"
        | "Cancelled"
      ih_staff_status: "Pending" | "Active" | "Inactive"
      sp_app_role: "admin" | "staff"
      sp_bill_status: "Draft" | "Paid"
      sp_business_arm: "Training" | "Solutions"
      sp_invoice_status: "Draft" | "Sent" | "Paid"
      sp_leave_type: "AL" | "SL" | "Custom"
      sp_payment_method: "Bank Transfer" | "Cash" | "Cheque" | "Card"
      sp_payroll_status: "Draft" | "Finalized"
      sp_po_status: "Draft" | "Sent" | "Received" | "Closed"
      sp_quotation_status:
        | "Draft"
        | "Sent"
        | "Accepted"
        | "Rejected"
        | "Converted"
      sp_request_status: "Pending" | "Approved" | "Rejected"
      sp_training_status:
        | "Submitted"
        | "Approved"
        | "Rejected"
        | "Completed"
        | "Claimed"
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
      ih_app_role: ["admin", "staff"],
      ih_business_arm: ["Training", "Solutions", "Both"],
      ih_finance_status: ["Draft", "Reviewed", "Locked"],
      ih_notice_importance: ["Normal", "Important", "Critical"],
      ih_payroll_status: ["Draft", "Finalized", "Locked"],
      ih_request_kind: ["Leave", "MC", "Claim", "Training", "Benefit"],
      ih_request_status: [
        "Submitted",
        "Approved",
        "Rejected",
        "NeedsCorrection",
        "Cancelled",
      ],
      ih_staff_status: ["Pending", "Active", "Inactive"],
      sp_app_role: ["admin", "staff"],
      sp_bill_status: ["Draft", "Paid"],
      sp_business_arm: ["Training", "Solutions"],
      sp_invoice_status: ["Draft", "Sent", "Paid"],
      sp_leave_type: ["AL", "SL", "Custom"],
      sp_payment_method: ["Bank Transfer", "Cash", "Cheque", "Card"],
      sp_payroll_status: ["Draft", "Finalized"],
      sp_po_status: ["Draft", "Sent", "Received", "Closed"],
      sp_quotation_status: [
        "Draft",
        "Sent",
        "Accepted",
        "Rejected",
        "Converted",
      ],
      sp_request_status: ["Pending", "Approved", "Rejected"],
      sp_training_status: [
        "Submitted",
        "Approved",
        "Rejected",
        "Completed",
        "Claimed",
      ],
    },
  },
} as const
