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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clinics: {
        Row: {
          clinic: string
          country_id: number
          id: number
        }
        Insert: {
          clinic: string
          country_id: number
          id?: number
        }
        Update: {
          clinic?: string
          country_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinics_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          country: string
          id: number
        }
        Insert: {
          country: string
          id?: number
        }
        Update: {
          country?: string
          id?: number
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          id: number
          language: string
        }
        Insert: {
          code: string
          id?: number
          language: string
        }
        Update: {
          code?: string
          id?: number
          language?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          birthdate: string
          contact_number: string
          country_id: number
          created_at: string
          first_name: string
          id: string
          last_name: string
          name: string
          sex: Database["public"]["Enums"]["sex"]
          updated_at: string
        }
        Insert: {
          birthdate: string
          contact_number: string
          country_id: number
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          name?: string | null
          sex: Database["public"]["Enums"]["sex"]
          updated_at?: string
        }
        Update: {
          birthdate?: string
          contact_number?: string
          country_id?: number
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          name?: string | null
          sex?: Database["public"]["Enums"]["sex"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content: Json
          created_at: string
          description: string
          id: string
          language_id: number
          patient_id: string
          therapist_id: string
          title: string
          type_id: number
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          description: string
          id?: string
          language_id: number
          patient_id: string
          therapist_id: string
          title: string
          type_id: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string
          id?: string
          language_id?: number
          patient_id?: string
          therapist_id?: string
          title?: string
          type_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          age: number
          bio: string
          clinic_id: number
          created_at: string
          first_name: string
          id: string
          last_name: string
          name: string
          picture: string
          updated_at: string
        }
        Insert: {
          age: number
          bio: string
          clinic_id: number
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          name?: string
          picture: string
          updated_at?: string
        }
        Update: {
          age?: number
          bio?: string
          clinic_id?: number
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          name?: string
          picture?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      types: {
        Row: {
          id: number
          type: string
        }
        Insert: {
          id?: number
          type: string
        }
        Update: {
          id?: number
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      patients_view: {
        Row: {
          age_months: number | null
          age_years: number | null
          birthdate: string | null
          contact_number: string | null
          country_id: number | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          name: string | null
          sex: Database["public"]["Enums"]["sex"] | null
          updated_at: string | null
        }
        Insert: {
          age_months?: never
          age_years?: never
          birthdate?: string | null
          contact_number?: string | null
          country_id?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          name?: never
          sex?: Database["public"]["Enums"]["sex"] | null
          updated_at?: string | null
        }
        Update: {
          age_months?: never
          age_years?: never
          birthdate?: string | null
          contact_number?: string | null
          country_id?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          name?: never
          sex?: Database["public"]["Enums"]["sex"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_view: {
        Row: {
          clinic_id: number | null
          content: Json | null
          created_at: string | null
          description: string | null
          id: string | null
          language_id: number | null
          patient_id: string | null
          therapist_id: string | null
          title: string | null
          type_id: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists_view: {
        Row: {
          age: number | null
          bio: string | null
          clinic_id: number | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          name: string | null
          picture: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          clinic_id?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          name?: never
          picture?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          clinic_id?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          name?: never
          picture?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sex: "Male" | "Female"
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
      sex: ["Male", "Female"],
    },
  },
} as const
