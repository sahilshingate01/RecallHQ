import { create } from "zustand";
import { Task } from "@/types";
import { taskService } from "@/lib/taskService";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "completed" | "created_at">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTotalTasks: () => number;
  getCompletedToday: () => number;
  getPending: () => number;
}

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const rawTasks = await taskService.getTasks();
      const todayStr = getTodayDateStr();
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      
      // Reset daily tasks that were completed on previous days
      const processedTasks = (rawTasks as Task[]).map(t => {
        if (t.type === "daily" && t.completed && t.completed_at && !t.completed_at.startsWith(todayStr)) {
          return { ...t, completed: false, completed_at: undefined }; // Reset for UI
        }
        return t;
      });

      // Sort tasks: pending first, then by priority, then by date
      const tasks = processedTasks.sort((a, b) => {
        // First sort by completion status (optional, but keep it stable)
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      set({ tasks, loading: false });

      // Optionally, we could update the reset tasks in db asynchronously
      tasks.forEach(t => {
        const originalTask = (rawTasks as Task[]).find(rt => rt.id === t.id);
        if (originalTask && originalTask.completed && !t.completed) {
          taskService.toggleComplete(t.id, false).catch(console.error);
        }
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const newTask = await taskService.addTask({ ...taskData, completed: false });
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      
      set((state) => ({ 
        tasks: [newTask as Task, ...state.tasks].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        })
      }));
    } catch (error) {
      console.error("Error adding task:", error);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)).sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }),
      }));
      await taskService.updateTask(id, updates);
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert or refresh tasks on error
      get().fetchTasks(); 
    }
  },

  toggleComplete: async (id, completed) => {
    try {
      await taskService.toggleComplete(id, completed);
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : undefined } : t
        ).sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
          const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        })
      }));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  },

  getTotalTasks: () => get().tasks.length,

  getCompletedToday: () => {
    const today = getTodayDateStr();
    return get().tasks.filter(
      (t) => t.completed && t.completed_at && t.completed_at.startsWith(today)
    ).length;
  },

  getPending: () => {
    const today = getTodayDateStr();
    return get().tasks.filter((t) => {
      if (t.type === 'daily') {
        return !t.completed || (t.completed_at && !t.completed_at.startsWith(today));
      }
      return !t.completed;
    }).length;
  },
}));
