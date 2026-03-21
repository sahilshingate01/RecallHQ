import { supabase } from './supabase'
import { Task } from '@/types'

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001'

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        position: task.position ?? 0,
        user_id: FIXED_USER_ID
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async toggleComplete(id: string, completed: boolean) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        completed, 
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },


  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  subscribeToTasks(onUpdate: () => void) {
    return supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${FIXED_USER_ID}` },
        () => onUpdate()
      )
      .subscribe()
  }
}
