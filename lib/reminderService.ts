import { supabase } from './supabase'

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface Reminder {
  id: string
  user_id: string
  title: string
  note: string
  remind_at: string
  repeat: 'none' | 'daily' | 'weekly'
  done: boolean
  created_at: string
  updated_at: string
}

export const reminderService = {
  async getReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .order('remind_at', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async addReminder(r: { title: string; note: string; remind_at: string; repeat: Reminder['repeat'] }): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...r, user_id: FIXED_USER_ID, done: false }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateReminder(id: string, updates: Partial<Pick<Reminder, 'title' | 'note' | 'remind_at' | 'repeat' | 'done'>>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
