export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  type: "daily" | "onetime";
  link?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}


export type NavItem = {
  label: string;
  icon: string;
  id: string;
};
