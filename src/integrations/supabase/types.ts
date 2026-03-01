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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      approved_copies: {
        Row: {
          body: string
          channel: string
          copy_type: string
          copywriter_a_id: string | null
          copywriter_b_id: string | null
          created_at: string | null
          format: string | null
          generation_id: string | null
          id: string
          notes: string | null
          objective: string
          owner_id: string
          product_id: string | null
          size: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          body: string
          channel: string
          copy_type: string
          copywriter_a_id?: string | null
          copywriter_b_id?: string | null
          created_at?: string | null
          format?: string | null
          generation_id?: string | null
          id?: string
          notes?: string | null
          objective: string
          owner_id: string
          product_id?: string | null
          size: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          copy_type?: string
          copywriter_a_id?: string | null
          copywriter_b_id?: string | null
          created_at?: string | null
          format?: string | null
          generation_id?: string | null
          id?: string
          notes?: string | null
          objective?: string
          owner_id?: string
          product_id?: string | null
          size?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approved_copies_copywriter_a_id_fkey"
            columns: ["copywriter_a_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approved_copies_copywriter_b_id_fkey"
            columns: ["copywriter_b_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approved_copies_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approved_copies_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          about: string | null
          audience: string | null
          brand_name: string
          brand_voice: string
          champion_static_copy: string | null
          champion_static_url: string | null
          champion_video_copy: string | null
          champion_video_url: string | null
          claims_allowed: string | null
          disclaimers: string | null
          id: string
          language: string | null
          owner_id: string
          past_clients: string | null
          updated_at: string | null
          usp: string | null
        }
        Insert: {
          about?: string | null
          audience?: string | null
          brand_name: string
          brand_voice: string
          champion_static_copy?: string | null
          champion_static_url?: string | null
          champion_video_copy?: string | null
          champion_video_url?: string | null
          claims_allowed?: string | null
          disclaimers?: string | null
          id?: string
          language?: string | null
          owner_id: string
          past_clients?: string | null
          updated_at?: string | null
          usp?: string | null
        }
        Update: {
          about?: string | null
          audience?: string | null
          brand_name?: string
          brand_voice?: string
          champion_static_copy?: string | null
          champion_static_url?: string | null
          champion_video_copy?: string | null
          champion_video_url?: string | null
          claims_allowed?: string | null
          disclaimers?: string | null
          id?: string
          language?: string | null
          owner_id?: string
          past_clients?: string | null
          updated_at?: string | null
          usp?: string | null
        }
        Relationships: []
      }
      copy_champions: {
        Row: {
          champion_at: string
          channel: string
          copy_id: string
          created_at: string
          format: string
          id: string
          owner_id: string
          product_id: string | null
          replaced_at: string | null
        }
        Insert: {
          champion_at?: string
          channel: string
          copy_id: string
          created_at?: string
          format: string
          id?: string
          owner_id: string
          product_id?: string | null
          replaced_at?: string | null
        }
        Update: {
          champion_at?: string
          channel?: string
          copy_id?: string
          created_at?: string
          format?: string
          id?: string
          owner_id?: string
          product_id?: string | null
          replaced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_champions_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "approved_copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_champions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      copywriter_preferences: {
        Row: {
          copywriter_id: string
          id: string
          is_active: boolean
          owner_id: string
        }
        Insert: {
          copywriter_id: string
          id?: string
          is_active?: boolean
          owner_id: string
        }
        Update: {
          copywriter_id?: string
          id?: string
          is_active?: boolean
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copywriter_preferences_copywriter_id_fkey"
            columns: ["copywriter_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
        ]
      }
      copywriter_samples: {
        Row: {
          body: string
          copywriter_id: string
          created_at: string | null
          id: string
          source: string | null
          title: string | null
        }
        Insert: {
          body: string
          copywriter_id: string
          created_at?: string | null
          id?: string
          source?: string | null
          title?: string | null
        }
        Update: {
          body?: string
          copywriter_id?: string
          created_at?: string | null
          id?: string
          source?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copywriter_samples_copywriter_id_fkey"
            columns: ["copywriter_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
        ]
      }
      copywriters: {
        Row: {
          donts: string | null
          dos: string | null
          era: string | null
          id: string
          is_preset: boolean
          name: string
          notes: string | null
          style_guide_text: string
        }
        Insert: {
          donts?: string | null
          dos?: string | null
          era?: string | null
          id?: string
          is_preset?: boolean
          name: string
          notes?: string | null
          style_guide_text: string
        }
        Update: {
          donts?: string | null
          dos?: string | null
          era?: string | null
          id?: string
          is_preset?: boolean
          name?: string
          notes?: string | null
          style_guide_text?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          channel: string
          copy_type: string
          copywriter_a_id: string | null
          copywriter_b_id: string | null
          created_at: string | null
          format: string | null
          id: string
          objective: string
          owner_id: string
          product_id: string | null
          prompt_compiled: string
          quantity: number
          result_json: Json
          size: string
        }
        Insert: {
          channel: string
          copy_type: string
          copywriter_a_id?: string | null
          copywriter_b_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          objective: string
          owner_id: string
          product_id?: string | null
          prompt_compiled: string
          quantity: number
          result_json: Json
          size: string
        }
        Update: {
          channel?: string
          copy_type?: string
          copywriter_a_id?: string | null
          copywriter_b_id?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          objective?: string
          owner_id?: string
          product_id?: string | null
          prompt_compiled?: string
          quantity?: number
          result_json?: Json
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_copywriter_a_id_fkey"
            columns: ["copywriter_a_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_copywriter_b_id_fkey"
            columns: ["copywriter_b_id"]
            isOneToOne: false
            referencedRelation: "copywriters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: string | null
          created_at: string | null
          description: string | null
          features: string | null
          id: string
          links: string | null
          name: string
          objections: string | null
          owner_id: string
          pricing_notes: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          features?: string | null
          id?: string
          links?: string | null
          name: string
          objections?: string | null
          owner_id: string
          pricing_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          description?: string | null
          features?: string | null
          id?: string
          links?: string | null
          name?: string
          objections?: string | null
          owner_id?: string
          pricing_notes?: string | null
          updated_at?: string | null
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
