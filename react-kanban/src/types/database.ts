// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          assignee: string | null
          priority: 'low' | 'medium' | 'high'
          column_id: string
          order: number
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          assignee?: string | null
          priority: 'low' | 'medium' | 'high'
          column_id: string
          order: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          assignee?: string | null
          priority?: 'low' | 'medium' | 'high'
          column_id?: string
          order?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      columns: {
        Row: {
          id: string
          title: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          avatar: string | null
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          avatar?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority_type: 'low' | 'medium' | 'high'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}