import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task, Column, User } from '../types/kanban'

// Temporary types for database operations (will be generated later)
type DbTask = {
  id: string
  title: string
  description: string | null
  assignee: string | null
  priority: 'low' | 'medium' | 'high'
  column_id: string
  order: number
  created_at: string
  updated_at: string
  user_id: string | null
}

type DbColumn = {
  id: string
  title: string
  order: number
  created_at: string
  updated_at: string
}

type DbUser = {
  id: string
  name: string
  avatar: string | null
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

// Helper functions to convert between database and app types
const dbTaskToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  assignee: dbTask.assignee || '',
  priority: dbTask.priority,
  columnId: dbTask.column_id,
  order: dbTask.order,
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at),
})

const taskToDbTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => ({
  title: task.title,
  description: task.description || null,
  assignee: task.assignee || null,
  priority: task.priority,
  column_id: task.columnId,
  order: task.order,
})

const dbColumnToColumn = (dbColumn: DbColumn): Column => ({
  id: dbColumn.id,
  title: dbColumn.title,
  order: dbColumn.order,
})

const dbUserToUser = (dbUser: DbUser): User => ({
  id: dbUser.id,
  name: dbUser.name,
  avatar: dbUser.avatar || undefined,
  isOnline: dbUser.is_online,
  lastSeen: new Date(dbUser.last_seen),
})

interface SupabaseKanbanStore {
  // State
  tasks: Task[]
  columns: Column[]
  users: User[]
  loading: boolean
  error: string | null

  // Actions
  loadInitialData: () => Promise<void>
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newColumnId: string, newOrder: number) => Promise<void>
  getTasksByColumn: (columnId: string) => Task[]
  addColumn: (title: string) => Promise<void>
  setCurrentUser: (user: User) => void
  updateUserPresence: (userId: string, isOnline: boolean) => Promise<void>
  reorderTasks: (columnId: string) => void

  // Realtime subscriptions
  subscribeToChanges: () => () => void
}

export const useSupabaseKanbanStore = create<SupabaseKanbanStore>()((set, get) => ({
  // Initial state
  tasks: [],
  columns: [],
  users: [],
  loading: false,
  error: null,


  // Load initial data from Supabase
  loadInitialData: async () => {
    set({ loading: true, error: null })
    
    try {
      // Load all data in parallel
      const [
        { data: dbTasks, error: tasksError },
        { data: dbColumns, error: columnsError },
        { data: dbUsers, error: usersError }
      ] = await Promise.all([
        supabase.from('tasks').select('*').order('order'),
        supabase.from('columns').select('*').order('order'),
        supabase.from('users').select('*')
      ])

      if (tasksError) throw tasksError
      if (columnsError) throw columnsError
      if (usersError) throw usersError

      const tasks = dbTasks?.map(dbTaskToTask) || []
      const columns = dbColumns?.map(dbColumnToColumn) || []
      const users = dbUsers?.map(dbUserToUser) || []

      set({ tasks, columns, users, loading: false })
    } catch (error) {
      console.error('Failed to load initial data:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  // Add new task
  addTask: async (taskData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToDbTask(taskData))
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      const newTask = dbTaskToTask(data)
      set((state) => ({ tasks: [...state.tasks, newTask] }))
    } catch (error) {
      console.error('Failed to add task:', error)
      set({ error: (error as Error).message })
    }
  },

  // Update existing task
  updateTask: async (taskId, updates) => {
    try {
      const dbUpdates: any = {}
      
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee || null
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.columnId !== undefined) dbUpdates.column_id = updates.columnId
      if (updates.order !== undefined) dbUpdates.order = updates.order

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from update')

      const updatedTask = dbTaskToTask(data)
      set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId ? updatedTask : task
        )
      }))
    } catch (error) {
      console.error('Failed to update task:', error)
      set({ error: (error as Error).message })
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId)
      }))
    } catch (error) {
      console.error('Failed to delete task:', error)
      set({ error: (error as Error).message })
    }
  },

  // Move task to different column/order
  moveTask: async (taskId, newColumnId, newOrder) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      // Update task position in database
      await get().updateTask(taskId, { 
        columnId: newColumnId, 
        order: newOrder 
      })

      // Reorder other tasks in the target column
      const targetColumnTasks = get().tasks.filter(t => 
        t.columnId === newColumnId && t.id !== taskId
      )

      // Update order for tasks that need reordering
      for (let i = 0; i < targetColumnTasks.length; i++) {
        const targetTask = targetColumnTasks[i]
        const expectedOrder = i >= newOrder ? i + 1 : i
        
        if (targetTask.order !== expectedOrder) {
          await get().updateTask(targetTask.id, { order: expectedOrder })
        }
      }
    } catch (error) {
      console.error('Failed to move task:', error)
      set({ error: (error as Error).message })
    }
  },

  // Get tasks by column ID
  getTasksByColumn: (columnId) => {
    return get().tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.order - b.order)
  },

  // Add new column
  addColumn: async (title) => {
    try {
      const existingColumns = get().columns
      const order = existingColumns.length

      const { data, error } = await supabase
        .from('columns')
        .insert({ title, order })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      const newColumn = dbColumnToColumn(data)
      set((state) => ({ columns: [...state.columns, newColumn] }))
    } catch (error) {
      console.error('Failed to add column:', error)
      set({ error: (error as Error).message })
    }
  },

  // Set current user (local only for now)
  setCurrentUser: (user) => {
    set((state) => ({
      users: state.users.some((u) => u.id === user.id)
        ? state.users.map((u) => (u.id === user.id ? user : u))
        : [...state.users, user]
    }))
  },

  // Update user presence
  updateUserPresence: async (userId, isOnline) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId
            ? { ...user, isOnline, lastSeen: new Date() }
            : user
        )
      }))
    } catch (error) {
      console.error('Failed to update user presence:', error)
      set({ error: (error as Error).message })
    }
  },

  // Reorder tasks within a column
  reorderTasks: (columnId) => {
    const columnTasks = get().tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.order - b.order)
      .map((task, index) => ({ ...task, order: index }))

    const otherTasks = get().tasks.filter((task) => task.columnId !== columnId)

    set({ tasks: [...otherTasks, ...columnTasks] })
  },

  // Subscribe to real-time changes
  subscribeToChanges: () => {
    console.log('Setting up Supabase real-time subscriptions...')
    
    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload)
          // Reload data when changes occur
          get().loadInitialData()
        }
      )
      .subscribe()

    const columnsSubscription = supabase
      .channel('columns-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns' },
        (payload) => {
          console.log('Column change received:', payload)
          get().loadInitialData()
        }
      )
      .subscribe()

    const usersSubscription = supabase
      .channel('users-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User change received:', payload)
          get().loadInitialData()
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      supabase.removeChannel(tasksSubscription)
      supabase.removeChannel(columnsSubscription)
      supabase.removeChannel(usersSubscription)
    }
  },
}))