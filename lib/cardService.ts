import { supabase } from './supabase'

export interface Card {
  id: string
  user_id: string
  title: string
  link: string
  created_at: string
  updated_at: string
}

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001'

export const cardService = {
  async getCards() {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Card[]
  },

  async addCard(card: { title: string; link: string }) {
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        ...card,
        user_id: FIXED_USER_ID
      }])
      .select()
      .single()
    
    if (error) throw error
    return data as Card
  },

  async updateCard(id: string, updates: Partial<Card>) {
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Card
  },

  async deleteCard(id: string) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
