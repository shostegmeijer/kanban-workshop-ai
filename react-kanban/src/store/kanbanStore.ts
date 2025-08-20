import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { KanbanStore, Task, Column, User } from '../types/kanban';

// Mock data
const mockColumns: Column[] = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'inprogress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 },
];

const mockUsers: User[] = [
  { 
    id: 'user-1', 
    name: 'Alice Johnson', 
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', 
    isOnline: true,
    lastSeen: new Date(),
  },
  { 
    id: 'user-2', 
    name: 'Bob Smith', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 
    isOnline: true,
    lastSeen: new Date(),
  },
  { 
    id: 'user-3', 
    name: 'Carol Davis', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 
    isOnline: false,
    lastSeen: new Date(Date.now() - 300000),
  },
];

const mockTasks: Task[] = [
  {
    id: nanoid(),
    title: 'Design user authentication flow',
    description: 'Create wireframes and mockups for login and signup process',
    assignee: 'Alice Johnson',
    priority: 'high',
    columnId: 'todo',
    order: 0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: nanoid(),
    title: 'Set up database schema',
    description: 'Create tables for users, projects, and tasks',
    assignee: 'Bob Smith',
    priority: 'high',
    columnId: 'todo',
    order: 1,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: nanoid(),
    title: 'Implement drag and drop functionality',
    description: 'Add @dnd-kit to enable task reordering',
    assignee: 'Alice Johnson',
    priority: 'medium',
    columnId: 'inprogress',
    order: 0,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: nanoid(),
    title: 'Write API documentation',
    description: 'Document all endpoints with examples',
    assignee: 'Carol Davis',
    priority: 'low',
    columnId: 'inprogress',
    order: 1,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: nanoid(),
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    assignee: 'Bob Smith',
    priority: 'medium',
    columnId: 'done',
    order: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: nanoid(),
    title: 'Create project structure',
    description: 'Set up folder structure and initial configuration',
    assignee: 'Alice Johnson',
    priority: 'high',
    columnId: 'done',
    order: 1,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
  },
];

// Add compatibility methods for the components
interface ExtendedKanbanStore extends KanbanStore {
  board: {
    id: string;
    title: string;
    tasks: Task[];
    columns: Column[];
    users: User[];
  };
  addColumn: (title: string) => void;
  // Override addTask to match TaskForm expectations
  addTask: ((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void) & 
           ((columnId: string, taskData: any) => void);
}

export const useKanbanStore = create<ExtendedKanbanStore>()((set, get) => ({
  // Initial state
  tasks: mockTasks,
  columns: mockColumns,
  users: mockUsers,
  
  // Board compatibility object
  get board() {
    const state = get();
    return {
      id: 'board-1',
      title: 'Kanban Workshop Board',
      tasks: state.tasks,
      columns: state.columns,
      users: state.users,
    };
  },

  // Task operations
  addTask: (taskDataOrColumnId, taskData?) => {
    let newTask: Task;
    
    if (typeof taskDataOrColumnId === 'string') {
      // Old signature: addTask(columnId, taskData)
      const columnId = taskDataOrColumnId;
      const tasksInColumn = get().tasks.filter(task => task.columnId === columnId);
      const maxOrder = tasksInColumn.length > 0 
        ? Math.max(...tasksInColumn.map(task => task.order))
        : -1;
        
      newTask = {
        id: nanoid(),
        ...taskData,
        columnId,
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // New signature: addTask(taskData)
      newTask = {
        id: nanoid(),
        ...taskDataOrColumnId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },

  moveTask: (taskId, newColumnId, newOrder) => {
    set((state) => {
      const taskToMove = state.tasks.find((task) => task.id === taskId);
      if (!taskToMove) return state;

      // Remove task from current position
      const tasksWithoutMoved = state.tasks.filter((task) => task.id !== taskId);
      
      // Get tasks in the target column and reorder them
      const targetColumnTasks = tasksWithoutMoved
        .filter((task) => task.columnId === newColumnId)
        .sort((a, b) => a.order - b.order);

      // Insert the moved task at the new position
      targetColumnTasks.splice(newOrder, 0, {
        ...taskToMove,
        columnId: newColumnId,
        order: newOrder,
        updatedAt: new Date(),
      });

      // Update order for all tasks in the target column
      const reorderedTargetTasks = targetColumnTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      // Combine with tasks from other columns
      const otherColumnTasks = tasksWithoutMoved.filter(
        (task) => task.columnId !== newColumnId
      );

      return {
        tasks: [...otherColumnTasks, ...reorderedTargetTasks],
      };
    });
  },

  // Column operations
  getTasksByColumn: (columnId) => {
    return get()
      .tasks.filter((task) => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  },

  // User operations
  setCurrentUser: (user) => {
    set((state) => ({
      users: state.users.some((u) => u.id === user.id)
        ? state.users.map((u) => (u.id === user.id ? user : u))
        : [...state.users, user],
    }));
  },

  updateUserPresence: (userId, isOnline) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? { ...user, isOnline, lastSeen: new Date() }
          : user
      ),
    }));
  },

  // Utility functions
  reorderTasks: (columnId) => {
    set((state) => {
      const columnTasks = state.tasks
        .filter((task) => task.columnId === columnId)
        .sort((a, b) => a.order - b.order)
        .map((task, index) => ({ ...task, order: index }));

      const otherTasks = state.tasks.filter((task) => task.columnId !== columnId);

      return {
        tasks: [...otherTasks, ...columnTasks],
      };
    });
  },
  
  // Column operations
  addColumn: (title) => {
    set((state) => {
      const newColumn: Column = {
        id: nanoid(),
        title,
        order: state.columns.length,
      };
      
      return {
        columns: [...state.columns, newColumn],
      };
    });
  },
}));