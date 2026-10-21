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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_name: string
          company_name: string | null
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          email: string
          form_data: Json
          id: string
          phone: string | null
          reference_code: string
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          applicant_name: string
          company_name?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email: string
          form_data: Json
          id?: string
          phone?: string | null
          reference_code?: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          company_name?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          email?: string
          form_data?: Json
          id?: string
          phone?: string | null
          reference_code?: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_resources: {
        Row: {
          booking_id: string
          created_at: string
          end_time: string
          id: string
          quantity: number | null
          resource_id: string
          start_time: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          end_time: string
          id?: string
          quantity?: number | null
          resource_id: string
          start_time: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          end_time?: string
          id?: string
          quantity?: number | null
          resource_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_resources_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          assigned_staff: string | null
          booking_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmation_number: string | null
          created_at: string
          duration_hours: number | null
          equipment_needed: string[] | null
          feedback: string | null
          id: string
          location: string | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          priority: string | null
          quote_amount: number | null
          rating: number | null
          recurring_pattern: string | null
          recurring_until: string | null
          requirements: string | null
          resource_ids: string[] | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_staff?: string | null
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string
          duration_hours?: number | null
          equipment_needed?: string[] | null
          feedback?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          quote_amount?: number | null
          rating?: number | null
          recurring_pattern?: string | null
          recurring_until?: string | null
          requirements?: string | null
          resource_ids?: string[] | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_staff?: string | null
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string
          duration_hours?: number | null
          equipment_needed?: string[] | null
          feedback?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          quote_amount?: number | null
          rating?: number | null
          recurring_pattern?: string | null
          recurring_until?: string | null
          requirements?: string | null
          resource_ids?: string[] | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_effective_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      news_updates: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          tenant_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          tenant_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          tenant_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          available: boolean | null
          booking_rules: Json | null
          capacity: number | null
          created_at: string
          description: string | null
          hourly_rate: number | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          specifications: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          booking_rules?: Json | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          specifications?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          booking_rules?: Json | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          specifications?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_activity_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          service_id: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          service_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_activity_log_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_activity_log_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_activity_log_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_effective_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          assigned_to: string | null
          au_affiliate_price: number | null
          availability_status: string | null
          available: boolean | null
          base_price: number | null
          category: string
          contact: Json | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          external_price: number | null
          id: string
          lead_time: string | null
          links: Json | null
          media_urls: string[] | null
          name: string
          notes: string | null
          one_liner: string | null
          price_hint: Json | null
          provider: string | null
          requirements: string | null
          service_name: string | null
          status: string | null
          tags: string[] | null
          tenant_price: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          au_affiliate_price?: number | null
          availability_status?: string | null
          available?: boolean | null
          base_price?: number | null
          category: string
          contact?: Json | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          external_price?: number | null
          id?: string
          lead_time?: string | null
          links?: Json | null
          media_urls?: string[] | null
          name: string
          notes?: string | null
          one_liner?: string | null
          price_hint?: Json | null
          provider?: string | null
          requirements?: string | null
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_price?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          au_affiliate_price?: number | null
          availability_status?: string | null
          available?: boolean | null
          base_price?: number | null
          category?: string
          contact?: Json | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          external_price?: number | null
          id?: string
          lead_time?: string | null
          links?: Json | null
          media_urls?: string[] | null
          name?: string
          notes?: string | null
          one_liner?: string | null
          price_hint?: Json | null
          provider?: string | null
          requirements?: string | null
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_price?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      "Services Entry": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_services: {
        Row: {
          availability_status: string | null
          category: string | null
          description: string | null
          id: string | null
          lead_time: string | null
          one_liner: string | null
          provider: string | null
          requirements: string | null
          service_name: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          category?: string | null
          description?: string | null
          id?: string | null
          lead_time?: string | null
          one_liner?: string | null
          provider?: string | null
          requirements?: string | null
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          category?: string | null
          description?: string | null
          id?: string | null
          lead_time?: string | null
          one_liner?: string | null
          provider?: string | null
          requirements?: string | null
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services_effective_pricing: {
        Row: {
          assigned_to: string | null
          au_affiliate_price: number | null
          availability_status: string | null
          available: boolean | null
          base_price: number | null
          category: string | null
          contact_email: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string | null
          external_price: number | null
          id: string | null
          lead_time: string | null
          media_urls: string[] | null
          name: string | null
          notes: string | null
          pricing: Json | null
          service_name: string | null
          status: string | null
          tags: string[] | null
          tenant_price: number | null
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          au_affiliate_price?: number | null
          availability_status?: string | null
          available?: boolean | null
          base_price?: number | null
          category?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          external_price?: number | null
          id?: string | null
          lead_time?: string | null
          media_urls?: string[] | null
          name?: string | null
          notes?: string | null
          pricing?: never
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_price?: number | null
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          au_affiliate_price?: number | null
          availability_status?: string | null
          available?: boolean | null
          base_price?: number | null
          category?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string | null
          external_price?: number | null
          id?: string | null
          lead_time?: string | null
          media_urls?: string[] | null
          name?: string | null
          notes?: string | null
          pricing?: never
          service_name?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_price?: number | null
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_count: { Args: never; Returns: number }
      get_application_by_reference_and_email: {
        Args: { _email: string; _reference_code: string }
        Returns: {
          applicant_name: string
          decided_at: string
          decision_reason: string
          email: string
          id: string
          phone: string
          reference_code: string
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
    }
    Enums: {
      application_status:
        | "submitted"
        | "under_review"
        | "accepted"
        | "rejected"
        | "waitlisted"
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
      application_status: [
        "submitted",
        "under_review",
        "accepted",
        "rejected",
        "waitlisted",
      ],
    },
  },
} as const
