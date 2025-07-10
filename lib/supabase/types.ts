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
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          password_hash: string
          phone_number: string | null
          phone_country: string | null
          role: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          password_hash?: string
          phone_number?: string | null
          phone_country?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          password_hash?: string
          phone_number?: string | null
          phone_country?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_product_id: string | null
          plan_name: string | null
          subscription_status: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_product_id?: string | null
          plan_name?: string | null
          subscription_status?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_product_id?: string | null
          plan_name?: string | null
          subscription_status?: string | null
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          team_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          role?: string
          joined_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          team_id: string
          user_id: string | null
          action: string
          timestamp: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string | null
          action: string
          timestamp?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string | null
          action?: string
          timestamp?: string
          ip_address?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: string
          invited_by: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: string
          invited_by: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: string
          invited_by?: string
          status?: string
          created_at?: string
        }
      }
      daily_message_logs: {
        Row: {
          id: number
          user_id: number
          phone_number: string
          message_content: string
          message_hash: string
          sent_at: string
          status: string
          twilio_sid: string | null
          error_message: string | null
        }
        Insert: {
          id?: number
          user_id: number
          phone_number: string
          message_content: string
          message_hash: string
          sent_at?: string
          status?: string
          twilio_sid?: string | null
          error_message?: string | null
        }
        Update: {
          id?: number
          user_id?: number
          phone_number?: string
          message_content?: string
          message_hash?: string
          sent_at?: string
          status?: string
          twilio_sid?: string | null
          error_message?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type User = Tables<'users'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
export type ActivityLog = Tables<'activity_logs'>
export type Invitation = Tables<'invitations'>

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']
export type InvitationInsert = Database['public']['Tables']['invitations']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']
export type ActivityLogUpdate = Database['public']['Tables']['activity_logs']['Update']
export type InvitationUpdate = Database['public']['Tables']['invitations']['Update']

// Combined types for complex queries
export type UserWithTeam = {
  user: User
  team: Team | null
  teamMember: TeamMember | null
}

export type TeamWithMembers = Team & {
  teamMembers: (TeamMember & { user: User })[]
}

// Activity types enum
export type ActivityType = 
  | 'account.created'
  | 'account.updated'
  | 'account.deleted'
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'team.member.added'
  | 'team.member.removed'
  | 'team.member.role.updated'
  | 'invitation.sent'
  | 'invitation.accepted'
  | 'invitation.declined'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'