import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlanTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayPlan {
  day: number;
  tasks: PlanTask[];
}

export interface TrackPlan {
  name: string;
  description?: string;
  tasks: PlanTask[]; // Some are listed by day, some are general weekly goals
}

export interface WeekPlan {
  week: number;
  title: string;
  tracks: {
    DSA: TrackPlan;
    Development: TrackPlan;
    DevOps: TrackPlan;
  };
}

interface PlanStore {
  completedTasks: Record<string, boolean>; // taskId -> completed
  completedDays: Record<string, boolean>;  // week-day -> completed (e.g., "1-1")
  toggleTask: (taskId: string) => void;
  toggleDay: (week: number, day: number) => void;
  getCompletionPercentage: (week?: number) => number;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      completedTasks: {},
      completedDays: {},
      toggleTask: (taskId) =>
        set((state) => ({
          completedTasks: {
            ...state.completedTasks,
            [taskId]: !state.completedTasks[taskId],
          },
        })),
      toggleDay: (week, day) => {
        const key = `${week}-${day}`;
        set((state) => ({
          completedDays: {
            ...state.completedDays,
            [key]: !state.completedDays[key],
          },
        }));
      },
      getCompletionPercentage: (week) => {
        return 0;
      },
    }),
    {
      name: "plan-progress",
    }
  )
);
