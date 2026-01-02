// Database types for Supabase
// These will be auto-generated when you run: npx supabase gen types typescript
// For now, we define the types manually based on our schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Subject = 'math' | 'reading'
export type SourceStyle = 'iowa_like' | 'terranova_like'
export type AttemptResult = 'correct' | 'incorrect'
export type FSRSState = 'new' | 'learning' | 'review' | 'relearning'
export type FSRSRating = 'again' | 'hard' | 'good' | 'easy'
export type SessionType = 'daily' | 'exam'
export type UserRole = 'student' | 'parent'

export interface Database {
  public: {
    Tables: {
      passages: {
        Row: {
          id: string
          genre: string
          title: string | null
          text: string
          lexile_band: string | null
          word_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          genre: string
          title?: string | null
          text: string
          lexile_band?: string | null
          word_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          genre?: string
          title?: string | null
          text?: string
          lexile_band?: string | null
          word_count?: number | null
          created_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          subject: Subject
          topic: string
          subtopic: string | null
          difficulty: number
          cognitive_level: number
          source_style: SourceStyle
          stem: string
          choices: string[] | null
          answer_key: string
          rationale: string
          tags: string[]
          status: string
          passage_id: string | null
          week_phase: string
          created_at: string
        }
        Insert: {
          id?: string
          subject: Subject
          topic: string
          subtopic?: string | null
          difficulty: number
          cognitive_level: number
          source_style: SourceStyle
          stem: string
          choices?: string[] | null
          answer_key: string
          rationale: string
          tags?: string[]
          status?: string
          passage_id?: string | null
          week_phase?: string
          created_at?: string
        }
        Update: {
          id?: string
          subject?: Subject
          topic?: string
          subtopic?: string | null
          difficulty?: number
          cognitive_level?: number
          source_style?: SourceStyle
          stem?: string
          choices?: string[] | null
          answer_key?: string
          rationale?: string
          tags?: string[]
          status?: string
          passage_id?: string | null
          week_phase?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_passage_id_fkey'
            columns: ['passage_id']
            referencedRelation: 'passages'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: UserRole | null
          study_start_date: string | null
          daily_goal: number
          timezone: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role?: UserRole | null
          study_start_date?: string | null
          daily_goal?: number
          timezone?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: UserRole
          study_start_date?: string | null
          daily_goal?: number
          timezone?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      user_item_state: {
        Row: {
          user_id: string
          item_id: string
          due: string
          stability: number
          difficulty: number
          elapsed_days: number
          scheduled_days: number
          reps: number
          lapses: number
          state: FSRSState
          last_review: string | null
          first_seen_at: string | null
        }
        Insert: {
          user_id: string
          item_id: string
          due: string
          stability?: number
          difficulty?: number
          elapsed_days?: number
          scheduled_days?: number
          reps?: number
          lapses?: number
          state?: FSRSState
          last_review?: string | null
          first_seen_at?: string | null
        }
        Update: {
          user_id?: string
          item_id?: string
          due?: string
          stability?: number
          difficulty?: number
          elapsed_days?: number
          scheduled_days?: number
          reps?: number
          lapses?: number
          state?: FSRSState
          last_review?: string | null
          first_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_item_state_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          session_type: SessionType
          session_date: string
          week_number: number
          target_new: number
          target_review: number
          actual_new: number
          actual_review: number
          started_at: string | null
          completed_at: string | null
          total_seconds: number
          correct_count: number
          incorrect_count: number
          time_limit_minutes: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: SessionType
          session_date: string
          week_number: number
          target_new: number
          target_review: number
          actual_new?: number
          actual_review?: number
          started_at?: string | null
          completed_at?: string | null
          total_seconds?: number
          correct_count?: number
          incorrect_count?: number
          time_limit_minutes?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: SessionType
          session_date?: string
          week_number?: number
          target_new?: number
          target_review?: number
          actual_new?: number
          actual_review?: number
          started_at?: string | null
          completed_at?: string | null
          total_seconds?: number
          correct_count?: number
          incorrect_count?: number
          time_limit_minutes?: number | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      session_items: {
        Row: {
          id: string
          session_id: string
          item_id: string
          position: number
          is_review: boolean
          answered: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          item_id: string
          position: number
          is_review: boolean
          answered?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          item_id?: string
          position?: number
          is_review?: boolean
          answered?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_items_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'session_items_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          }
        ]
      }
      attempts: {
        Row: {
          id: string
          user_id: string
          item_id: string
          session_id: string | null
          presented_at: string
          answered_at: string
          seconds_spent: number
          response: string
          result: AttemptResult
          rating: FSRSRating
          state_before: FSRSState | null
          stability_before: number | null
          difficulty_before: number | null
          state_after: FSRSState | null
          stability_after: number | null
          difficulty_after: number | null
          scheduled_days_after: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          session_id?: string | null
          presented_at?: string
          answered_at?: string
          seconds_spent?: number
          response: string
          result: AttemptResult
          rating: FSRSRating
          state_before?: FSRSState | null
          stability_before?: number | null
          difficulty_before?: number | null
          state_after?: FSRSState | null
          stability_after?: number | null
          difficulty_after?: number | null
          scheduled_days_after?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          session_id?: string | null
          presented_at?: string
          answered_at?: string
          seconds_spent?: number
          response?: string
          result?: AttemptResult
          rating?: FSRSRating
          state_before?: FSRSState | null
          stability_before?: number | null
          difficulty_before?: number | null
          state_after?: FSRSState | null
          stability_after?: number | null
          difficulty_after?: number | null
          scheduled_days_after?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attempts_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'sessions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attempts_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          }
        ]
      }
      streaks: {
        Row: {
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          streak_start_date: string | null
          week_days_completed: number
          current_week_start: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          streak_start_date?: string | null
          week_days_completed?: number
          current_week_start?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          streak_start_date?: string | null
          week_days_completed?: number
          current_week_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          stat_date: string
          items_studied: number
          items_correct: number
          items_incorrect: number
          new_items_seen: number
          reviews_completed: number
          total_seconds: number
          sessions_completed: number
          math_correct: number
          math_total: number
          reading_correct: number
          reading_total: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stat_date: string
          items_studied?: number
          items_correct?: number
          items_incorrect?: number
          new_items_seen?: number
          reviews_completed?: number
          total_seconds?: number
          sessions_completed?: number
          math_correct?: number
          math_total?: number
          reading_correct?: number
          reading_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stat_date?: string
          items_studied?: number
          items_correct?: number
          items_incorrect?: number
          new_items_seen?: number
          reviews_completed?: number
          total_seconds?: number
          sessions_completed?: number
          math_correct?: number
          math_total?: number
          reading_correct?: number
          reading_total?: number
          created_at?: string
        }
        Relationships: []
      }
      topic_stats: {
        Row: {
          id: string
          user_id: string
          subject: Subject
          topic: string
          total_attempts: number
          total_correct: number
          recent_attempts: number
          recent_correct: number
          avg_time_seconds: number | null
          mastery_score: number | null
          last_attempted_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: Subject
          topic: string
          total_attempts?: number
          total_correct?: number
          recent_attempts?: number
          recent_correct?: number
          avg_time_seconds?: number | null
          mastery_score?: number | null
          last_attempted_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: Subject
          topic?: string
          total_attempts?: number
          total_correct?: number
          recent_attempts?: number
          recent_correct?: number
          avg_time_seconds?: number | null
          mastery_score?: number | null
          last_attempted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parent_link_requests: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          student_email: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          student_email: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          student_email?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'parent_link_requests_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'parent_link_requests_student_id_fkey'
            columns: ['student_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      subject: Subject
      source_style: SourceStyle
      attempt_result: AttemptResult
      fsrs_state: FSRSState
      fsrs_rating: FSRSRating
      session_type: SessionType
      user_role: UserRole
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience exports
export type Passage = Tables<'passages'>
export type Item = Tables<'items'>
export type Profile = Tables<'profiles'>
export type UserItemState = Tables<'user_item_state'>
export type Session = Tables<'sessions'>
export type SessionItem = Tables<'session_items'>
export type Attempt = Tables<'attempts'>
export type Streak = Tables<'streaks'>
export type DailyStat = Tables<'daily_stats'>
export type TopicStat = Tables<'topic_stats'>
export type ParentLinkRequest = Tables<'parent_link_requests'>

// Item with passage (for reading questions)
export type ItemWithPassage = Item & {
  passage: Passage | null
}

// Session with items for practice
export type SessionWithItems = Session & {
  items: (SessionItem & {
    item: ItemWithPassage
  })[]
}
