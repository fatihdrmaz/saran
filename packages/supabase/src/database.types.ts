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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          duration_min: number
          id: string
          nurse_id: string
          patient_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          wound_id: string | null
        }
        Insert: {
          created_at?: string
          duration_min?: number
          id?: string
          nurse_id: string
          patient_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
          wound_id?: string | null
        }
        Update: {
          created_at?: string
          duration_min?: number
          id?: string
          nurse_id?: string
          patient_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
          wound_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_wound_id_fkey"
            columns: ["wound_id"]
            isOneToOne: false
            referencedRelation: "wounds"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_nurse_id: string | null
          body: string
          category: string
          created_at: string
          id: string
          image_url: string | null
          intro: string
          locale: Database["public"]["Enums"]["locale_code"]
          published_at: string | null
          reading_minutes: number
          slug: string
          title: string
        }
        Insert: {
          author_nurse_id?: string | null
          body: string
          category: string
          created_at?: string
          id?: string
          image_url?: string | null
          intro: string
          locale?: Database["public"]["Enums"]["locale_code"]
          published_at?: string | null
          reading_minutes?: number
          slug: string
          title: string
        }
        Update: {
          author_nurse_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          intro?: string
          locale?: Database["public"]["Enums"]["locale_code"]
          published_at?: string | null
          reading_minutes?: number
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_nurse_id_fkey"
            columns: ["author_nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          care_instruction: string | null
          created_at: string
          dressing_suggestion: string | null
          estimated_healing_days: number | null
          id: string
          nurse_id: string
          prognosis_note: string
          submission_id: string
          tissue_type: string | null
        }
        Insert: {
          care_instruction?: string | null
          created_at?: string
          dressing_suggestion?: string | null
          estimated_healing_days?: number | null
          id?: string
          nurse_id: string
          prognosis_note: string
          submission_id: string
          tissue_type?: string | null
        }
        Update: {
          care_instruction?: string | null
          created_at?: string
          dressing_suggestion?: string | null
          estimated_healing_days?: number | null
          id?: string
          nurse_id?: string
          prognosis_note?: string
          submission_id?: string
          tissue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      care_templates: {
        Row: {
          category: Database["public"]["Enums"]["care_template_category"]
          content: string
          created_at: string
          id: string
          nurse_id: string | null
          title: string
          usage_count: number
        }
        Insert: {
          category: Database["public"]["Enums"]["care_template_category"]
          content: string
          created_at?: string
          id?: string
          nurse_id?: string | null
          title: string
          usage_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["care_template_category"]
          content?: string
          created_at?: string
          id?: string
          nurse_id?: string | null
          title?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "care_templates_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          nurse_id: string
          patient_id: string
          wound_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          nurse_id: string
          patient_id: string
          wound_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          nurse_id?: string
          patient_id?: string
          wound_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_wound_id_fkey"
            columns: ["wound_id"]
            isOneToOne: false
            referencedRelation: "wounds"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nurse_documents: {
        Row: {
          created_at: string
          id: string
          nurse_id: string
          type: Database["public"]["Enums"]["nurse_document_type"]
          url: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          nurse_id: string
          type: Database["public"]["Enums"]["nurse_document_type"]
          url: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          created_at?: string
          id?: string
          nurse_id?: string
          type?: Database["public"]["Enums"]["nurse_document_type"]
          url?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "nurse_documents_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
        ]
      }
      nurses: {
        Row: {
          active_patient_count: number
          bio: string | null
          diploma_no: string
          experience_years: number
          id: string
          rating: number
          specialty: string
          status: Database["public"]["Enums"]["nurse_status"]
        }
        Insert: {
          active_patient_count?: number
          bio?: string | null
          diploma_no: string
          experience_years?: number
          id: string
          rating?: number
          specialty: string
          status?: Database["public"]["Enums"]["nurse_status"]
        }
        Update: {
          active_patient_count?: number
          bio?: string | null
          diploma_no?: string
          experience_years?: number
          id?: string
          rating?: number
          specialty?: string
          status?: Database["public"]["Enums"]["nurse_status"]
        }
        Relationships: [
          {
            foreignKeyName: "nurses_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          allergies: string[]
          diagnoses: string[]
          emergency_contact: string | null
          id: string
        }
        Insert: {
          age?: number | null
          allergies?: string[]
          diagnoses?: string[]
          emergency_contact?: string | null
          id: string
        }
        Update: {
          age?: number | null
          allergies?: string[]
          diagnoses?: string[]
          emergency_contact?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kurus: number
          created_at: string
          id: string
          method: string
          paid_at: string | null
          patient_id: string
          plan_id: string
          receipt_no: string | null
          status: Database["public"]["Enums"]["payment_status"]
          vat_kurus: number
        }
        Insert: {
          amount_kurus: number
          created_at?: string
          id?: string
          method?: string
          paid_at?: string | null
          patient_id: string
          plan_id: string
          receipt_no?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vat_kurus?: number
        }
        Update: {
          amount_kurus?: number
          created_at?: string
          id?: string
          method?: string
          paid_at?: string | null
          patient_id?: string
          plan_id?: string
          receipt_no?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vat_kurus?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_products: {
        Row: {
          active: boolean
          code: Database["public"]["Enums"]["plan_type"]
          created_at: string
          description: string | null
          duration_days: number
          id: string
          price_kurus: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: Database["public"]["Enums"]["plan_type"]
          created_at?: string
          description?: string | null
          duration_days: number
          id?: string
          price_kurus: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: Database["public"]["Enums"]["plan_type"]
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          price_kurus?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          patient_id: string
          price_kurus: number
          product_id: string | null
          prognosis_note: string | null
          progress_day: number | null
          proposed_by_nurse_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["plan_status"]
          type: Database["public"]["Enums"]["plan_type"]
          wound_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          patient_id: string
          price_kurus: number
          product_id?: string | null
          prognosis_note?: string | null
          progress_day?: number | null
          proposed_by_nurse_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_status"]
          type: Database["public"]["Enums"]["plan_type"]
          wound_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          patient_id?: string
          price_kurus?: number
          product_id?: string | null
          prognosis_note?: string | null
          progress_day?: number | null
          proposed_by_nurse_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["plan_status"]
          type?: Database["public"]["Enums"]["plan_type"]
          wound_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "plan_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_proposed_by_nurse_id_fkey"
            columns: ["proposed_by_nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_wound_id_fkey"
            columns: ["wound_id"]
            isOneToOne: false
            referencedRelation: "wounds"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          kvkk_consent_at: string | null
          locale: Database["public"]["Enums"]["locale_code"]
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id: string
          kvkk_consent_at?: string | null
          locale?: Database["public"]["Enums"]["locale_code"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          kvkk_consent_at?: string | null
          locale?: Database["public"]["Enums"]["locale_code"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          consent_confirmed: boolean
          created_at: string
          display_name: string | null
          duration_label: string | null
          id: string
          patient_id: string | null
          rating: number
          text: string
          wound_type: Database["public"]["Enums"]["wound_type"]
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          consent_confirmed?: boolean
          created_at?: string
          display_name?: string | null
          duration_label?: string | null
          id?: string
          patient_id?: string | null
          rating: number
          text: string
          wound_type: Database["public"]["Enums"]["wound_type"]
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          consent_confirmed?: boolean
          created_at?: string
          display_name?: string | null
          duration_label?: string | null
          id?: string
          patient_id?: string | null
          rating?: number
          text?: string
          wound_type?: Database["public"]["Enums"]["wound_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          exudate: Database["public"]["Enums"]["exudate_level"] | null
          healing_percent: number | null
          id: string
          image_path: string
          pain_level: Database["public"]["Enums"]["pain_level"]
          patient_note: string | null
          wound_id: string
        }
        Insert: {
          created_at?: string
          exudate?: Database["public"]["Enums"]["exudate_level"] | null
          healing_percent?: number | null
          id?: string
          image_path: string
          pain_level?: Database["public"]["Enums"]["pain_level"]
          patient_note?: string | null
          wound_id: string
        }
        Update: {
          created_at?: string
          exudate?: Database["public"]["Enums"]["exudate_level"] | null
          healing_percent?: number | null
          id?: string
          image_path?: string
          pain_level?: Database["public"]["Enums"]["pain_level"]
          patient_note?: string | null
          wound_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_wound_id_fkey"
            columns: ["wound_id"]
            isOneToOne: false
            referencedRelation: "wounds"
            referencedColumns: ["id"]
          },
        ]
      }
      wounds: {
        Row: {
          assigned_nurse_id: string | null
          clinical_status: Database["public"]["Enums"]["wound_clinical_status"]
          created_at: string
          deleted_at: string | null
          id: string
          patient_id: string
          region: string | null
          started_at: string
          type: Database["public"]["Enums"]["wound_type"]
        }
        Insert: {
          assigned_nurse_id?: string | null
          clinical_status?: Database["public"]["Enums"]["wound_clinical_status"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          patient_id: string
          region?: string | null
          started_at?: string
          type: Database["public"]["Enums"]["wound_type"]
        }
        Update: {
          assigned_nurse_id?: string | null
          clinical_status?: Database["public"]["Enums"]["wound_clinical_status"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          patient_id?: string
          region?: string | null
          started_at?: string
          type?: Database["public"]["Enums"]["wound_type"]
        }
        Relationships: [
          {
            foreignKeyName: "wounds_assigned_nurse_id_fkey"
            columns: ["assigned_nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wounds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_wound: {
        Args: { w_id: string }
        Returns: {
          assigned_nurse_id: string | null
          clinical_status: Database["public"]["Enums"]["wound_clinical_status"]
          created_at: string
          deleted_at: string | null
          id: string
          patient_id: string
          region: string | null
          started_at: string
          type: Database["public"]["Enums"]["wound_type"]
        }
        SetofOptions: {
          from: "*"
          to: "wounds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_wound_conversation: {
        Args: { w_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_verified_nurse: { Args: never; Returns: boolean }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      notify_edge: {
        Args: { event: string; record_id: string }
        Returns: undefined
      }
      nurse_can_see_wound: { Args: { w_id: string }; Returns: boolean }
      nurse_is_assigned: { Args: { w_id: string }; Returns: boolean }
    }
    Enums: {
      appointment_status: "requested" | "confirmed" | "completed" | "cancelled"
      appointment_type: "video" | "voice"
      care_template_category:
        | "pressure"
        | "diabetic_foot"
        | "surgical"
        | "emergency_referral"
        | "burn"
      exudate_level: "none" | "light" | "moderate" | "heavy"
      locale_code: "tr" | "en" | "ar"
      message_type: "text" | "image"
      nurse_document_type: "diploma" | "certificate" | "id"
      nurse_status: "pending" | "verified" | "rejected"
      pain_level: "none" | "mild" | "moderate" | "severe"
      payment_status: "paid" | "pending" | "awaiting_approval" | "rejected"
      plan_status: "proposed" | "active" | "expired" | "cancelled"
      plan_type: "one_time" | "week_1" | "week_3" | "monthly" | "week_2"
      user_role: "patient" | "nurse" | "admin"
      verification_status: "pending" | "verified" | "rejected"
      wound_clinical_status: "improving" | "monitoring" | "stalled" | "closed"
      wound_type: "pressure" | "diabetic_foot" | "surgical" | "venous" | "burn"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: ["requested", "confirmed", "completed", "cancelled"],
      appointment_type: ["video", "voice"],
      care_template_category: [
        "pressure",
        "diabetic_foot",
        "surgical",
        "emergency_referral",
        "burn",
      ],
      exudate_level: ["none", "light", "moderate", "heavy"],
      locale_code: ["tr", "en", "ar"],
      message_type: ["text", "image"],
      nurse_document_type: ["diploma", "certificate", "id"],
      nurse_status: ["pending", "verified", "rejected"],
      pain_level: ["none", "mild", "moderate", "severe"],
      payment_status: ["paid", "pending", "awaiting_approval", "rejected"],
      plan_status: ["proposed", "active", "expired", "cancelled"],
      plan_type: ["one_time", "week_1", "week_3", "monthly", "week_2"],
      user_role: ["patient", "nurse", "admin"],
      verification_status: ["pending", "verified", "rejected"],
      wound_clinical_status: ["improving", "monitoring", "stalled", "closed"],
      wound_type: ["pressure", "diabetic_foot", "surgical", "venous", "burn"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
