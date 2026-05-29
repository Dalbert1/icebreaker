export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          birth_date: string | null
          bio: string
          vibes: string[]
          location_label: string | null
          photo_url: string | null
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          birth_date?: string | null
          bio?: string
          vibes?: string[]
          location_label?: string | null
          photo_url?: string | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          birth_date?: string | null
          bio?: string
          vibes?: string[]
          location_label?: string | null
          photo_url?: string | null
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profile_preferences: {
        Row: {
          profile_id: string
          interested_in: 'male' | 'female' | 'both'
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          interested_in: 'male' | 'female' | 'both'
          created_at?: string
          updated_at?: string
        }
        Update: {
          interested_in?: 'male' | 'female' | 'both'
          updated_at?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          target_id: string
          direction: 'like' | 'pass'
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          target_id: string
          direction: 'like' | 'pass'
          created_at?: string
        }
        Update: {
          direction?: 'like' | 'pass'
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user_a: string
          user_b: string
          status: 'active' | 'unmatched' | 'blocked'
          thaw: number
          chat_unlocked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_a: string
          user_b: string
          status?: 'active' | 'unmatched' | 'blocked'
          thaw?: number
          chat_unlocked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'active' | 'unmatched' | 'blocked'
          thaw?: number
          chat_unlocked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          match_id: string
          category: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          started_by: string
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          match_id: string
          category: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          started_by: string
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          completed_at?: string | null
        }
        Relationships: []
      }
      game_answers: {
        Row: {
          id: string
          game_id: string
          q_index: number
          user_id: string
          option_index: number | null
          answered_at: string
          is_correct: boolean
          timed_out: boolean
          points_awarded: number
        }
        Insert: {
          id?: string
          game_id: string
          q_index: number
          user_id: string
          option_index?: number | null
          answered_at?: string
          is_correct?: boolean
          timed_out?: boolean
          points_awarded?: number
        }
        Update: {
          option_index?: number | null
          answered_at?: string
          is_correct?: boolean
          timed_out?: boolean
          points_awarded?: number
        }
        Relationships: []
      }
      match_scoreboards: {
        Row: {
          match_id: string
          user_a_total: number
          user_b_total: number
          games_played: number
          user_a_wins: number
          user_b_wins: number
          ties: number
          sync_total: number
          current_streak_user_id: string | null
          current_streak_count: number
          updated_at: string
        }
        Insert: {
          match_id: string
          user_a_total?: number
          user_b_total?: number
          games_played?: number
          user_a_wins?: number
          user_b_wins?: number
          ties?: number
          sync_total?: number
          current_streak_user_id?: string | null
          current_streak_count?: number
          updated_at?: string
        }
        Update: {
          user_a_total?: number
          user_b_total?: number
          games_played?: number
          user_a_wins?: number
          user_b_wins?: number
          ties?: number
          sync_total?: number
          current_streak_user_id?: string | null
          current_streak_count?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
