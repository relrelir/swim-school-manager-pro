export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string | null
          id: string
          password: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
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
          receiptnumber: string
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
          receiptnumber: string
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
          receiptnumber?: string
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
      season_pools: {
        Row: {
          pool_id: string
          season_id: string
        }
        Insert: {
          pool_id: string
          season_id: string
        }
        Update: {
          pool_id?: string
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_pools_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_pools_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
