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
      contests: {
        Row: {
          banca_url: string | null
          cargos: string | null
          carreiras: string | null
          created_at: string | null
          edital_url: string | null
          escolaridade: string | null
          evaluation_criteria: Json | null
          exam_date: string | null
          id: string
          inscricoes_periodo: string | null
          institution: string | null
          is_preparing_only: boolean | null
          lotacao: string | null
          materias: Json | null
          name: string
          position: string | null
          remuneracao: string | null
          situacao: string | null
          status: string | null
          taxa_inscricao: string | null
          updated_at: string | null
          user_id: string | null
          vagas: string | null
        }
        Insert: {
          banca_url?: string | null
          cargos?: string | null
          carreiras?: string | null
          created_at?: string | null
          edital_url?: string | null
          escolaridade?: string | null
          evaluation_criteria?: Json | null
          exam_date?: string | null
          id?: string
          inscricoes_periodo?: string | null
          institution?: string | null
          is_preparing_only?: boolean | null
          lotacao?: string | null
          materias?: Json | null
          name: string
          position?: string | null
          remuneracao?: string | null
          situacao?: string | null
          status?: string | null
          taxa_inscricao?: string | null
          updated_at?: string | null
          user_id?: string | null
          vagas?: string | null
        }
        Update: {
          banca_url?: string | null
          cargos?: string | null
          carreiras?: string | null
          created_at?: string | null
          edital_url?: string | null
          escolaridade?: string | null
          evaluation_criteria?: Json | null
          exam_date?: string | null
          id?: string
          inscricoes_periodo?: string | null
          institution?: string | null
          is_preparing_only?: boolean | null
          lotacao?: string | null
          materias?: Json | null
          name?: string
          position?: string | null
          remuneracao?: string | null
          situacao?: string | null
          status?: string | null
          taxa_inscricao?: string | null
          updated_at?: string | null
          user_id?: string | null
          vagas?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          curriculum: Json | null
          deadline: string | null
          id: string
          image_url: string | null
          is_from_bank: boolean | null
          links: Json | null
          name: string
          platform: string | null
          progress: number | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
          workload: number | null
        }
        Insert: {
          created_at?: string | null
          curriculum?: Json | null
          deadline?: string | null
          id?: string
          image_url?: string | null
          is_from_bank?: boolean | null
          links?: Json | null
          name: string
          platform?: string | null
          progress?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          workload?: number | null
        }
        Update: {
          created_at?: string | null
          curriculum?: Json | null
          deadline?: string | null
          id?: string
          image_url?: string | null
          is_from_bank?: boolean | null
          links?: Json | null
          name?: string
          platform?: string | null
          progress?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          workload?: number | null
        }
        Relationships: []
      }
      disciplines: {
        Row: {
          color: string | null
          cover_image: string | null
          created_at: string | null
          grade: string | null
          hours_studied: number | null
          id: string
          name: string
          progress: number | null
          specific_subject: string | null
          study_plan: Json | null
          subject: string
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          grade?: string | null
          hours_studied?: number | null
          id?: string
          name: string
          progress?: number | null
          specific_subject?: string | null
          study_plan?: Json | null
          subject: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          cover_image?: string | null
          created_at?: string | null
          grade?: string | null
          hours_studied?: number | null
          id?: string
          name?: string
          progress?: number | null
          specific_subject?: string | null
          study_plan?: Json | null
          subject?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      entry_allocations: {
        Row: {
          amount: number
          created_at: string | null
          destination_id: string | null
          destination_name: string
          destination_type: string
          entry_id: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          destination_id?: string | null
          destination_name: string
          destination_type: string
          entry_id: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          destination_id?: string | null
          destination_name?: string
          destination_type?: string
          entry_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_allocations_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "financial_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description: string
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          due_day: number | null
          id: string
          name: string
          notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          due_day?: number | null
          id?: string
          name: string
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          due_day?: number | null
          id?: string
          name?: string
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      flashcard_groups: {
        Row: {
          cards: Json | null
          created_at: string | null
          id: string
          last_studied: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cards?: Json | null
          created_at?: string | null
          id?: string
          last_studied?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cards?: Json | null
          created_at?: string | null
          id?: string
          last_studied?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          habit_id: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date: string
          habit_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          habit_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      language_contents: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          id: string
          sort_order: number | null
          structure_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          structure_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          structure_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_contents_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "language_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      language_levels: {
        Row: {
          created_at: string | null
          id: string
          language_id: string
          name: string
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_id: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_levels_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      language_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level_id: string
          name: string
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          level_id: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level_id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_sections_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "language_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      language_structures: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: string
          name: string
          progress: string | null
          section_id: string
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          progress?: string | null
          section_id: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          progress?: string | null
          section_id?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "language_structures_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "language_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          objective: string | null
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          objective?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          objective?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      link_folders: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      link_subfolders: {
        Row: {
          created_at: string | null
          description: string | null
          folder_id: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_subfolders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "link_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          subfolder_id: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          subfolder_id?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          subfolder_id?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "links_subfolder_id_fkey"
            columns: ["subfolder_id"]
            isOneToOne: false
            referencedRelation: "link_subfolders"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          priority: string | null
          requires_money: boolean | null
          status: string | null
          steps: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string | null
          requires_money?: boolean | null
          status?: string | null
          steps?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          priority?: string | null
          requires_money?: boolean | null
          status?: string | null
          steps?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      piggy_banks: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          id: string
          name: string
          target_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          name: string
          target_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          block_duration: number | null
          blocks: Json | null
          created_at: string | null
          end_time: string | null
          hours_per_day: number | null
          id: string
          name: string
          objective: string | null
          rest_duration: number | null
          start_time: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          block_duration?: number | null
          blocks?: Json | null
          created_at?: string | null
          end_time?: string | null
          hours_per_day?: number | null
          id?: string
          name: string
          objective?: string | null
          rest_duration?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          block_duration?: number | null
          blocks?: Json | null
          created_at?: string | null
          end_time?: string | null
          hours_per_day?: number | null
          id?: string
          name?: string
          objective?: string | null
          rest_duration?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      simulados: {
        Row: {
          created_at: string | null
          difficulty: string | null
          discipline: string | null
          id: string
          name: string
          questions: Json | null
          score: number | null
          status: string | null
          subject: string | null
          time_minutes: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          discipline?: string | null
          id?: string
          name: string
          questions?: Json | null
          score?: number | null
          status?: string | null
          subject?: string | null
          time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          discipline?: string | null
          id?: string
          name?: string
          questions?: Json | null
          score?: number | null
          status?: string | null
          subject?: string | null
          time_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_save: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          pomodoro_time: number | null
          sound_effects: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_save?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          pomodoro_time?: number | null
          sound_effects?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_save?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          pomodoro_time?: number | null
          sound_effects?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
