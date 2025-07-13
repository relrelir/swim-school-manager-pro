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
      admin_credentials: {
        Row: {
          created_at: string | null
          id: string
          password: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          role?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      health_declarations: {
        Row: {
          created_at: string
          form_status: string
          id: string
          notes: string | null
          parent_id: string | null
          parent_name: string | null
          participant_id: string
          signature: string | null
          submission_date: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_status?: string
          id?: string
          notes?: string | null
          parent_id?: string | null
          parent_name?: string | null
          participant_id: string
          signature?: string | null
          submission_date?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_status?: string
          id?: string
          notes?: string | null
          parent_id?: string | null
          parent_name?: string | null
          participant_id?: string
          signature?: string | null
          submission_date?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_declarations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string
          firstname: string
          healthapproval: boolean
          id: string
          idnumber: string
          lastname: string
          phone: string
        }
        Insert: {
          created_at?: string
          firstname: string
          healthapproval?: boolean
          id?: string
          idnumber: string
          lastname: string
          phone: string
        }
        Update: {
          created_at?: string
          firstname?: string
          healthapproval?: boolean
          id?: string
          idnumber?: string
          lastname?: string
          phone?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paymentdate: string
          receiptnumber: string
          registrationid: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paymentdate: string
          receiptnumber: string
          registrationid: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paymentdate?: string
          receiptnumber?: string
          registrationid?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_registrationid_fkey"
            columns: ["registrationid"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string
          id: string
          name: string
          seasonid: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          seasonid?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          seasonid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pools_seasonid_fkey"
            columns: ["seasonid"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          daysofweek: string[] | null
          description: string | null
          enddate: string
          id: string
          instructor: string | null
          maxparticipants: number
          meetingscount: number | null
          name: string
          poolid: string | null
          price: number
          seasonid: string
          startdate: string
          starttime: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          daysofweek?: string[] | null
          description?: string | null
          enddate: string
          id?: string
          instructor?: string | null
          maxparticipants?: number
          meetingscount?: number | null
          name: string
          poolid?: string | null
          price: number
          seasonid: string
          startdate: string
          starttime?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          daysofweek?: string[] | null
          description?: string | null
          enddate?: string
          id?: string
          instructor?: string | null
          maxparticipants?: number
          meetingscount?: number | null
          name?: string
          poolid?: string | null
          price?: number
          seasonid?: string
          startdate?: string
          starttime?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_poolid_fkey"
            columns: ["poolid"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seasonid_fkey"
            columns: ["seasonid"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          created_at: string
          discountamount: number | null
          discountapproved: boolean
          id: string
          paidamount: number
          participantid: string
          productid: string
          receiptnumber: string | null
          registrationdate: string
          requiredamount: number
        }
        Insert: {
          created_at?: string
          discountamount?: number | null
          discountapproved?: boolean
          id?: string
          paidamount?: number
          participantid: string
          productid: string
          receiptnumber?: string | null
          registrationdate?: string
          requiredamount: number
        }
        Update: {
          created_at?: string
          discountamount?: number | null
          discountapproved?: boolean
          id?: string
          paidamount?: number
          participantid?: string
          productid?: string
          receiptnumber?: string | null
          registrationdate?: string
          requiredamount?: number
        }
        Relationships: [
          {
            foreignKeyName: "registrations_participantid_fkey"
            columns: ["participantid"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          enddate: string
          id: string
          name: string
          startdate: string
        }
        Insert: {
          created_at?: string
          enddate: string
          id?: string
          name: string
          startdate: string
        }
        Update: {
          created_at?: string
          enddate?: string
          id?: string
          name?: string
          startdate?: string
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
