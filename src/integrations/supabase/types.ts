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
      access_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_name: string
          id: string
          last_access: string | null
          location: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name: string
          id?: string
          last_access?: string | null
          location?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string
          id?: string
          last_access?: string | null
          location?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_type: string | null
          campaign_id: string | null
          content_url: string | null
          created_at: string | null
          id: string
          name: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          utm_content: string | null
          utm_term: string | null
        }
        Insert: {
          ad_type?: string | null
          campaign_id?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          utm_content?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_type?: string | null
          campaign_id?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          utm_content?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_connections: {
        Row: {
          account_email: string | null
          account_name: string | null
          account_photo: string | null
          connection_key_ciphertext: string
          connector_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email?: string | null
          account_name?: string | null
          account_photo?: string | null
          connection_key_ciphertext: string
          connector_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string | null
          account_name?: string | null
          account_photo?: string | null
          connection_key_ciphertext?: string
          connector_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          acao: string
          admin_id: string | null
          alvo_id: string
          alvo_tipo: string
          categoria: string | null
          created_at: string | null
          dados_antes: Json
          dados_depois: Json
          id: string
          payload: Json
        }
        Insert: {
          acao: string
          admin_id?: string | null
          alvo_id: string
          alvo_tipo: string
          categoria?: string | null
          created_at?: string | null
          dados_antes?: Json
          dados_depois?: Json
          id?: string
          payload?: Json
        }
        Update: {
          acao?: string
          admin_id?: string | null
          alvo_id?: string
          alvo_tipo?: string
          categoria?: string | null
          created_at?: string | null
          dados_antes?: Json
          dados_depois?: Json
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          spend: number | null
          start_date: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          spend?: number | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          spend?: number | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_logs: {
        Row: {
          action: string
          created_at: string | null
          event_id: string
          id: string
          metadata: Json | null
          operator_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          event_id: string
          id?: string
          metadata?: Json | null
          operator_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          event_id?: string
          id?: string
          metadata?: Json | null
          operator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkin_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_records: {
        Row: {
          checkin_date: string
          checkin_time: string
          created_at: string | null
          event_id: string
          id: string
          operator_id: string | null
          status: string
          tenant_id: string | null
          ticket_id: string
        }
        Insert: {
          checkin_date?: string
          checkin_time?: string
          created_at?: string | null
          event_id: string
          id?: string
          operator_id?: string | null
          status?: string
          tenant_id?: string | null
          ticket_id: string
        }
        Update: {
          checkin_date?: string
          checkin_time?: string
          created_at?: string | null
          event_id?: string
          id?: string
          operator_id?: string | null
          status?: string
          tenant_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_records_ticket_id_fkey"
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
      email_accounts: {
        Row: {
          created_at: string | null
          display_name: string | null
          email_address: string | null
          id: string
          last_synced_at: string | null
          oauth_tokens: Json | null
          provider: string | null
          status: string | null
          status_message: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email_address?: string | null
          id?: string
          last_synced_at?: string | null
          oauth_tokens?: Json | null
          provider?: string | null
          status?: string | null
          status_message?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email_address?: string | null
          id?: string
          last_synced_at?: string | null
          oauth_tokens?: Json | null
          provider?: string | null
          status?: string | null
          status_message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          display_name: string | null
          email_address: string
          expires_at: string | null
          id: string
          photo_url: string | null
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          display_name?: string | null
          email_address: string
          expires_at?: string | null
          id?: string
          photo_url?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          display_name?: string | null
          email_address?: string
          expires_at?: string | null
          id?: string
          photo_url?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          email: string
          event_id: string | null
          failed_reason: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          operator_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          tenant_id: string | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id?: string | null
          failed_reason?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          operator_id?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_id?: string | null
          tenant_id?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string | null
          failed_reason?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          operator_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          tenant_id?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          account_id: string
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          cc_emails: Json | null
          created_at: string | null
          folder: string | null
          from_email: string | null
          from_name: string | null
          has_attachments: boolean | null
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          provider_msg_id: string | null
          received_at: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_emails: Json | null
        }
        Insert: {
          account_id: string
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string | null
          folder?: string | null
          from_email?: string | null
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          provider_msg_id?: string | null
          received_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: Json | null
        }
        Update: {
          account_id?: string
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: Json | null
          created_at?: string | null
          folder?: string | null
          from_email?: string | null
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          provider_msg_id?: string | null
          received_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages_individual: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          folder: string | null
          from_email: string
          from_name: string | null
          gmail_message_id: string | null
          id: string
          integration_id: string
          is_read: boolean | null
          is_starred: boolean | null
          labels: string[] | null
          received_at: string | null
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_emails: string[]
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          folder?: string | null
          from_email: string
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          integration_id: string
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          received_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails: string[]
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          folder?: string | null
          from_email?: string
          from_name?: string | null
          gmail_message_id?: string | null
          id?: string
          integration_id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          received_at?: string | null
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_individual_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "email_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string
          created_at: string | null
          event_id: string | null
          id: string
          name: string
          owner_id: string | null
          status: string | null
          subject: string
          tenant_id: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          name: string
          owner_id?: string | null
          status?: string | null
          subject: string
          tenant_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          status?: string | null
          subject?: string
          tenant_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      event_staff: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
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
          featured: boolean | null
          id: string
          location: string | null
          min_price: number | null
          producer_id: string
          slug: string | null
          start_date: string | null
          status: string | null
          tenant_id: string | null
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
          featured?: boolean | null
          id?: string
          location?: string | null
          min_price?: number | null
          producer_id: string
          slug?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
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
          featured?: boolean | null
          id?: string
          location?: string | null
          min_price?: number | null
          producer_id?: string
          slug?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
          tipo: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          moeda_id?: string | null
          order_id?: string | null
          tenant_id?: string | null
          tipo?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          id?: string
          moeda_id?: string | null
          order_id?: string | null
          tenant_id?: string | null
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
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          status: string | null
          stripe_payment_intent_id: string | null
          taxa_plataforma: number | null
          tenant_id: string | null
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
          status?: string | null
          stripe_payment_intent_id?: string | null
          taxa_plataforma?: number | null
          tenant_id?: string | null
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
          status?: string | null
          stripe_payment_intent_id?: string | null
          taxa_plataforma?: number | null
          tenant_id?: string | null
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
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          avatar_url: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          data_nascimento: string | null
          documento: string | null
          email: string | null
          estado: string | null
          id: string
          idioma_preferido: string | null
          nome: string | null
          notif_lembrete_evento: boolean | null
          notif_mudancas_evento: boolean | null
          notif_novidades: boolean | null
          numero: string | null
          pais_id: string | null
          rua: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          documento?: string | null
          email?: string | null
          estado?: string | null
          id: string
          idioma_preferido?: string | null
          nome?: string | null
          notif_lembrete_evento?: boolean | null
          notif_mudancas_evento?: boolean | null
          notif_novidades?: boolean | null
          numero?: string | null
          pais_id?: string | null
          rua?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          documento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          idioma_preferido?: string | null
          nome?: string | null
          notif_lembrete_evento?: boolean | null
          notif_mudancas_evento?: boolean | null
          notif_novidades?: boolean | null
          numero?: string | null
          pais_id?: string | null
          rua?: string | null
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
      push_automations: {
        Row: {
          action_url: string | null
          audience: string
          button_text: string | null
          created_at: string | null
          delay_time: string | null
          description: string | null
          id: string
          image_url: string | null
          message_template: string | null
          name: string
          project_id: string | null
          status: string
          tenant_id: string | null
          title_template: string | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          audience?: string
          button_text?: string | null
          created_at?: string | null
          delay_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          message_template?: string | null
          name: string
          project_id?: string | null
          status?: string
          tenant_id?: string | null
          title_template?: string | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          audience?: string
          button_text?: string | null
          created_at?: string | null
          delay_time?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          message_template?: string | null
          name?: string
          project_id?: string | null
          status?: string
          tenant_id?: string | null
          title_template?: string | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_automations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_attribution: {
        Row: {
          ad_id: string | null
          attribution_method: string | null
          campaign_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          tracking_id: string | null
        }
        Insert: {
          ad_id?: string | null
          attribution_method?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          tracking_id?: string | null
        }
        Update: {
          ad_id?: string | null
          attribution_method?: string | null
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          tracking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_attribution_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_attribution_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_attribution_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_attribution_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          access_hours: string | null
          created_at: string
          departments: Json
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          permissions: Json
          role: string
          status: string
          tenant_id: string
        }
        Insert: {
          accepted_at?: string | null
          access_hours?: string | null
          created_at?: string
          departments?: Json
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          permissions?: Json
          role?: string
          status?: string
          tenant_id: string
        }
        Update: {
          accepted_at?: string | null
          access_hours?: string | null
          created_at?: string
          departments?: Json
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          permissions?: Json
          role?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_organization_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          documento: string | null
          empresa: string | null
          id: string
          logo: string | null
          moeda_padrao_id: string | null
          nome: string
          pais_id: string | null
          plan: string | null
          plan_id: string | null
          slug: string
          status: string | null
          stripe_account_id: string | null
          taxa_percentual_custom: number | null
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          empresa?: string | null
          id?: string
          logo?: string | null
          moeda_padrao_id?: string | null
          nome: string
          pais_id?: string | null
          plan?: string | null
          plan_id?: string | null
          slug: string
          status?: string | null
          stripe_account_id?: string | null
          taxa_percentual_custom?: number | null
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          empresa?: string | null
          id?: string
          logo?: string | null
          moeda_padrao_id?: string | null
          nome?: string
          pais_id?: string | null
          plan?: string | null
          plan_id?: string | null
          slug?: string
          status?: string | null
          stripe_account_id?: string | null
          taxa_percentual_custom?: number | null
          telefone?: string | null
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
          share_token: string | null
          status: string | null
          tenant_id: string | null
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
          share_token?: string | null
          status?: string | null
          tenant_id?: string | null
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
          share_token?: string | null
          status?: string | null
          tenant_id?: string | null
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
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          page_url: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_url: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_url?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
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
      whatsapp_attendances: {
        Row: {
          agent_id: string | null
          closed_at: string | null
          closure_reason: string | null
          contact_id: string
          created_at: string
          feedback: string | null
          id: string
          internal_notes: string | null
          metadata: Json | null
          rating: number | null
          status: string
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          contact_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          internal_notes?: string | null
          metadata?: Json | null
          rating?: number | null
          status: string
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          contact_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          internal_notes?: string | null
          metadata?: Json | null
          rating?: number | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_attendances_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_attendances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contact_group_memberships: {
        Row: {
          contact_id: string
          created_at: string
          group_id: string
          id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          group_id: string
          id?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contact_group_memberships_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contact_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contact_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contact_groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contact_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          id: string
          last_interaction_at: string | null
          name: string | null
          name_manually_edited: boolean | null
          phone: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_interaction_at?: string | null
          name?: string | null
          name_manually_edited?: boolean | null
          phone: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_interaction_at?: string | null
          name?: string | null
          name_manually_edited?: boolean | null
          phone?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_organization_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          status: string | null
          uazapi_token: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          status?: string | null
          uazapi_token: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          status?: string | null
          uazapi_token?: string
        }
        Relationships: []
      }
      whatsapp_integrations: {
        Row: {
          access_token: string | null
          business_id: string | null
          created_at: string | null
          id: string
          phone_number: string | null
          project_id: string
          provider: string
          status: string | null
          updated_at: string | null
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          project_id: string
          provider?: string
          status?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          project_id?: string
          provider?: string
          status?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          integration_id: string | null
          response: Json | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          integration_id?: string | null
          response?: Json | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          integration_id?: string | null
          response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          contact_id: string
          content: string | null
          created_at: string | null
          direction: string
          id: string
          media_url: string | null
          message_type: string | null
          status: string | null
          wa_message_id: string | null
        }
        Insert: {
          contact_id: string
          content?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          status?: string | null
          wa_message_id?: string | null
        }
        Update: {
          contact_id?: string
          content?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          status?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_schedules: {
        Row: {
          agent_id: string | null
          contact_id: string
          created_at: string
          id: string
          message_content: string
          metadata: Json | null
          scheduled_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          contact_id: string
          created_at?: string
          id?: string
          message_content: string
          metadata?: Json | null
          scheduled_at: string
          status?: string
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          contact_id?: string
          created_at?: string
          id?: string
          message_content?: string
          metadata?: Json | null
          scheduled_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_schedules_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_webhook_errors: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string | null
          id: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          integration_id: string | null
          payload: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          integration_id?: string | null
          payload?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          integration_id?: string | null
          payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_internal: { Args: { _user_id: string }; Returns: boolean }
      check_is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      ensure_producer_organization_admin: {
        Args: { _uid: string }
        Returns: Json
      }
      get_user_tenants: { Args: never; Returns: string[] }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_event_staff: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      log_resource_access: {
        Args: {
          _action?: string
          _resource_id?: string
          _resource_type: string
        }
        Returns: undefined
      }
      promote_to_platform_admin: {
        Args: { target_email: string }
        Returns: Json
      }
      user_has_producer_role: {
        Args: {
          _required_roles: Database["public"]["Enums"]["tenant_role"][]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "produtor_owner" | "equipe" | "participante"
      staff_role: "scanner_only" | "supervisor"
      tenant_role:
        | "OWNER"
        | "ADMIN"
        | "MANAGER"
        | "CHECKIN_SUPERVISOR"
        | "CHECKIN_OPERATOR"
        | "FINANCEIRO"
        | "MARKETING"
        | "CHECKIN_MANAGER"
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
      app_role: ["admin", "produtor_owner", "equipe", "participante"],
      staff_role: ["scanner_only", "supervisor"],
      tenant_role: [
        "OWNER",
        "ADMIN",
        "MANAGER",
        "CHECKIN_SUPERVISOR",
        "CHECKIN_OPERATOR",
        "FINANCEIRO",
        "MARKETING",
        "CHECKIN_MANAGER",
      ],
    },
  },
} as const
