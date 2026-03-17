import { supabase } from './supabase'

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001'

export const settingsService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', FIXED_USER_ID)
        .maybeSingle()
      
      if (error) {
        console.warn('Supabase settings error:', error.message)
        return null
      }
      return data
    } catch (e) {
      console.error('Failed to fetch settings:', e)
      return null
    }
  },

  async saveFaceDescriptor(descriptor: number[]) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: FIXED_USER_ID,
        face_descriptor: descriptor,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async verifyPin(pin: string) {
    // For now, hardcoded as per user request, but could be stored in DB
    return pin === '8421'
  }
}
