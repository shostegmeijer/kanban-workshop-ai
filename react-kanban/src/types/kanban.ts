export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface BoardState {
  tasks: Task[];
  columns: Column[];
  users: User[];
}

export interface KanbanStore extends BoardState {
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newColumnId: string, newOrder: number) => void;
  
  // Column operations
  getTasksByColumn: (columnId: string) => Task[];
  
  // User operations
  setCurrentUser: (user: User) => void;
  updateUserPresence: (userId: string, isOnline: boolean) => void;
  
  // Utility functions
  reorderTasks: (columnId: string) => void;
}

export type DragEndEvent = {
  active: {
    id: string;
    data: {
      current?: {
        type: 'task';
        task: Task;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        type: 'column';
        columnId: string;
      };
    };
  } | null;
};

export type Priority = 'low' | 'medium' | 'high';

export const PRIORITY_COLORS = {
  low: 'border-priority-low',
  medium: 'border-priority-medium', 
  high: 'border-priority-high',
} as const;

export const PRIORITY_LABELS = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
} as const;

export interface TaskFormData {
  title: string;
  description?: string;
  assignee?: string;
  priority: Priority;
}