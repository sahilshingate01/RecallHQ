import { supabase } from './supabase'

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  color: string
  pinned: boolean
  created_at: string
  updated_at: string
}

export const noteService = {
  async getNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async addNote(note: { title: string; content: string; color: string; pinned?: boolean }): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, user_id: FIXED_USER_ID, pinned: note.pinned ?? false }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'color' | 'pinned'>>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
