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
      
      // Reset daily tasks that were completed on previous days
      const tasks = (rawTasks as Task[]).map(t => {
        if (t.type === "daily" && t.completed && t.completed_at && !t.completed_at.startsWith(todayStr)) {
          return { ...t, completed: false, completed_at: undefined }; // Reset for UI
        }
        return t;
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
      set((state) => ({ tasks: [newTask as Task, ...state.tasks] }));
    } catch (error) {
      console.error("Error adding task:", error);
    }
  },

  updateTask: async (id, updates) => {
    try {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
      await taskService.updateTask(id, updates);
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert or refresh tasks on error
      const tasks = await taskService.getTasks();
      set({ tasks: tasks as Task[] });
    }
  },


  toggleComplete: async (id, completed) => {
    try {
      await taskService.toggleComplete(id, completed);
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : undefined } : t
        )
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
