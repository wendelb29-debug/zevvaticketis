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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      checkin_logs: {
        Row: {
          id: string
          operator_id: string
          resultado: string
          scanned_at: string | null
          ticket_id: string
        }
        Insert: {
          id?: string
          operator_id: string
          resultado: string
          scanned_at?: string | null
          ticket_id: string
        }
        Update: {
          id?: string
          operator_id?: string
          resultado?: string
          scanned_at?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          ativo: boolean | null
          codigo_iso: string
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo_iso: string
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo_iso?: string
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          id: string
          simbolo: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          id?: string
          simbolo: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          id?: string
          simbolo?: string
        }
        Relationships: []
      }
      event_favorites: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          city: string | null
          country_id: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          destaque: boolean | null
          end_date: string | null
          event_type: string | null
          falta_automatica_ativa: boolean | null
          falta_automatica_minutos: number | null
          id: string
          location: string | null
          min_price: number | null
          organization_id: string | null
          producer_id: string
          start_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          country_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          destaque?: boolean | null
          end_date?: string | null
          event_type?: string | null
          falta_automatica_ativa?: boolean | null
          falta_automatica_minutos?: number | null
          id?: string
          location?: string | null
          min_price?: number | null
          organization_id?: string | null
          producer_id: string
          start_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          category?: string | null
          city?: string | null
          country_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          destaque?: boolean | null
          end_date?: string | null
          event_type?: string | null
          falta_automatica_ativa?: boolean | null
          falta_automatica_minutos?: number | null
          id?: string
          location?: string | null
          min_price?: number | null
          organization_id?: string | null
          producer_id?: string
          start_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          created_at: string | null
          id: string
          moeda_id: string | null
          order_id: string | null
          organization_id: string | null
          tipo: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          moeda_id?: string | null
          order_id?: string | null
          organization_id?: string | null
          tipo?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          id?: string
          moeda_id?: string | null
          order_id?: string | null
          organization_id?: string | null
          tipo?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          event_id: string | null
          forma_pagamento: string | null
          id: string
          moeda_id: string | null
          organization_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          taxa_plataforma: number | null
          valor_bruto: number
          valor_liquido_produtor: number | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          event_id?: string | null
          forma_pagamento?: string | null
          id?: string
          moeda_id?: string | null
          organization_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          taxa_plataforma?: number | null
          valor_bruto: number
          valor_liquido_produtor?: number | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          event_id?: string | null
          forma_pagamento?: string | null
          id?: string
          moeda_id?: string | null
          organization_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          taxa_plataforma?: number | null
          valor_bruto?: number
          valor_liquido_produtor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          documento: string | null
          id: string
          moeda_padrao_id: string | null
          nome: string
          pais_id: string | null
          plan_id: string | null
          status: string | null
          stripe_account_id: string | null
          taxa_percentual_custom: number | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          id?: string
          moeda_padrao_id?: string | null
          nome: string
          pais_id?: string | null
          plan_id?: string | null
          status?: string | null
          stripe_account_id?: string | null
          taxa_percentual_custom?: number | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          id?: string
          moeda_padrao_id?: string | null
          nome?: string
          pais_id?: string | null
          plan_id?: string | null
          status?: string | null
          stripe_account_id?: string | null
          taxa_percentual_custom?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_moeda_padrao_id_fkey"
            columns: ["moeda_padrao_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          id: string
          limite_eventos: number | null
          limite_ingressos: number | null
          nome: string
          preco_mensal: number | null
          taxa_percentual: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_eventos?: number | null
          limite_ingressos?: number | null
          nome: string
          preco_mensal?: number | null
          taxa_percentual: number
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_eventos?: number | null
          limite_ingressos?: number | null
          nome?: string
          preco_mensal?: number | null
          taxa_percentual?: number
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          default_platform_fee: number
          id: string
          updated_at: string
        }
        Insert: {
          default_platform_fee?: number
          id?: string
          updated_at?: string
        }
        Update: {
          default_platform_fee?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          documento: string | null
          email: string | null
          id: string
          idioma_preferido: string | null
          nome: string | null
          pais_id: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          email?: string | null
          id: string
          idioma_preferido?: string | null
          nome?: string | null
          pais_id?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          email?: string | null
          id?: string
          idioma_preferido?: string | null
          nome?: string | null
          pais_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          organization_id: string
          permissions: Json
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          organization_id: string
          permissions?: Json
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          organization_id?: string
          permissions?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          cor: string | null
          created_at: string | null
          data_final: string | null
          data_inicial: string | null
          descricao: string | null
          event_id: string | null
          formas_pagamento_permitidas: string[] | null
          id: string
          limite_por_compra: number | null
          limite_por_cpf: number | null
          moeda_fixa_venda: boolean | null
          moeda_id: string | null
          nome: string
          ordem: number | null
          quantidade: number
          quantidade_vendida: number | null
          taxa: number | null
          valor: number
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          data_final?: string | null
          data_inicial?: string | null
          descricao?: string | null
          event_id?: string | null
          formas_pagamento_permitidas?: string[] | null
          id?: string
          limite_por_compra?: number | null
          limite_por_cpf?: number | null
          moeda_fixa_venda?: boolean | null
          moeda_id?: string | null
          nome: string
          ordem?: number | null
          quantidade: number
          quantidade_vendida?: number | null
          taxa?: number | null
          valor: number
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          data_final?: string | null
          data_inicial?: string | null
          descricao?: string | null
          event_id?: string | null
          formas_pagamento_permitidas?: string[] | null
          id?: string
          limite_por_compra?: number | null
          limite_por_cpf?: number | null
          moeda_fixa_venda?: boolean | null
          moeda_id?: string | null
          nome?: string
          ordem?: number | null
          quantidade?: number
          quantidade_vendida?: number | null
          taxa?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_types_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          attendance_source: string | null
          checked_in_at: string | null
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          name: string
          order_id: string | null
          owner_id: string | null
          price: number
          qr_code: string | null
          quantity: number
          sale_end: string | null
          sale_start: string | null
          status: string | null
          ticket_type_id: string | null
        }
        Insert: {
          attendance_source?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          name: string
          order_id?: string | null
          owner_id?: string | null
          price?: number
          qr_code?: string | null
          quantity?: number
          sale_end?: string | null
          sale_start?: string | null
          status?: string | null
          ticket_type_id?: string | null
        }
        Update: {
          attendance_source?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          order_id?: string | null
          owner_id?: string | null
          price?: number
          qr_code?: string | null
          quantity?: number
          sale_end?: string | null
          sale_start?: string | null
          status?: string | null
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_cost_items: {
        Row: {
          id: string
          incluso: boolean | null
          moeda_id: string | null
          observacao: string | null
          ticket_type_id: string | null
          tipo: string | null
          valor_estimado: number | null
        }
        Insert: {
          id?: string
          incluso?: boolean | null
          moeda_id?: string | null
          observacao?: string | null
          ticket_type_id?: string | null
          tipo?: string | null
          valor_estimado?: number | null
        }
        Update: {
          id?: string
          incluso?: boolean | null
          moeda_id?: string | null
          observacao?: string | null
          ticket_type_id?: string | null
          tipo?: string | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_cost_items_moeda_id_fkey"
            columns: ["moeda_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_cost_items_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_hotels: {
        Row: {
          categoria: string | null
          cidade: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          noites: number | null
          nome_hotel: string | null
          ticket_type_id: string | null
        }
        Insert: {
          categoria?: string | null
          cidade?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          noites?: number | null
          nome_hotel?: string | null
          ticket_type_id?: string | null
        }
        Update: {
          categoria?: string | null
          cidade?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          noites?: number | null
          nome_hotel?: string | null
          ticket_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_hotels_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_itinerary_days: {
        Row: {
          data: string | null
          descricao: string | null
          dia_numero: number
          id: string
          ticket_type_id: string | null
          titulo: string | null
        }
        Insert: {
          data?: string | null
          descricao?: string | null
          dia_numero: number
          id?: string
          ticket_type_id?: string | null
          titulo?: string | null
        }
        Update: {
          data?: string | null
          descricao?: string | null
          dia_numero?: number
          id?: string
          ticket_type_id?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_itinerary_days_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
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
