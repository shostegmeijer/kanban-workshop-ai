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
  imageUrl: dbUser.avatar || undefined,
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
  isDragging: boolean

  // Actions
  loadInitialData: () => Promise<void>
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newColumnId: string, newOrder: number) => Promise<void>
  moveTaskOptimistic: (taskId: string, newColumnId: string, newOrder: number) => void
  syncTaskPosition: (taskId: string, newColumnId: string, newOrder: number) => Promise<void>
  getTasksByColumn: (columnId: string) => Task[]
  addColumn: (title: string) => Promise<void>
  updateColumn: (columnId: string, updates: Partial<{ title: string }>) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
  setCurrentUser: (user: User) => void
  updateUserPresence: (userId: string, isOnline: boolean) => Promise<void>
  reorderTasks: (columnId: string) => void
  reorderTasksOptimistic: (tasks: Task[]) => void
  setDragging: (isDragging: boolean) => void

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
  isDragging: false,


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
      // Don't load users from database - they will be populated by Clerk authentication
      const users: User[] = []

      set({ tasks, columns, users, loading: false })
    } catch (error) {
      console.error('Failed to load initial data:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  // Add new task (with optimistic updates)
  addTask: async (taskData) => {
    // Create optimistic task with temporary ID
    const optimisticTask: Task = {
      id: `temp-${Date.now()}`,
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Optimistic update - add to UI immediately
    set((state) => ({ tasks: [...state.tasks, optimisticTask] }))

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToDbTask(taskData))
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      const newTask = dbTaskToTask(data)
      
      // Replace optimistic task with real task
      set((state) => ({ 
        tasks: state.tasks.map(t => t.id === optimisticTask.id ? newTask : t)
      }))
    } catch (error) {
      console.error('Failed to add task:', error)
      // Remove optimistic task on error
      set((state) => ({ 
        tasks: state.tasks.filter(t => t.id !== optimisticTask.id),
        error: (error as Error).message 
      }))
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

  // Move task optimistically (for dragging - no database update)
  moveTaskOptimistic: (taskId, newColumnId, newOrder) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) return state

      // Get all tasks in the target column except the one being moved
      const targetColumnTasks = state.tasks
        .filter(t => t.columnId === newColumnId && t.id !== taskId)
        .sort((a, b) => a.order - b.order)

      // Insert the task at the new position
      targetColumnTasks.splice(newOrder, 0, { ...task, columnId: newColumnId })

      // Update orders for all tasks in the column
      const updatedColumnTasks = targetColumnTasks.map((t, index) => ({
        ...t,
        order: index
      }))

      // Get tasks from other columns
      const otherTasks = state.tasks.filter(t => 
        t.columnId !== newColumnId && t.id !== taskId
      )

      return {
        tasks: [...otherTasks, ...updatedColumnTasks]
      }
    })
  },

  // Reorder tasks optimistically (for dragging within same column)
  reorderTasksOptimistic: (tasks) => {
    set((state) => {
      const taskIds = new Set(tasks.map(t => t.id))
      const otherTasks = state.tasks.filter(t => !taskIds.has(t.id))
      return { tasks: [...otherTasks, ...tasks] }
    })
  },

  // Sync task position with database (called on drag end)
  syncTaskPosition: async (taskId, newColumnId, newOrder) => {
    const originalTasks = get().tasks
    
    try {
      // Update the main task in database
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          column_id: newColumnId, 
          order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (updateError) throw updateError

      // Get all tasks in the target column to update their orders
      const columnTasks = get().tasks
        .filter(t => t.columnId === newColumnId)
        .sort((a, b) => a.order - b.order)

      // Batch update orders for all tasks in the column
      const updates = columnTasks.map((task, index) => ({
        id: task.id,
        order: index
      }))

      // Update orders in database (skip if order hasn't changed)
      for (const update of updates) {
        const task = originalTasks.find(t => t.id === update.id)
        if (task && task.order !== update.order) {
          await supabase
            .from('tasks')
            .update({ order: update.order })
            .eq('id', update.id)
        }
      }
    } catch (error) {
      console.error('Failed to sync task position:', error)
      // Rollback on error
      set({ tasks: originalTasks, error: (error as Error).message })
    }
  },

  // Move task to different column/order (with database sync)
  moveTask: async (taskId, newColumnId, newOrder) => {
    // First do optimistic update
    get().moveTaskOptimistic(taskId, newColumnId, newOrder)
    // Then sync with database
    await get().syncTaskPosition(taskId, newColumnId, newOrder)
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

  // Update column
  updateColumn: async (columnId, updates) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update({ title: updates.title, updated_at: new Date().toISOString() })
        .eq('id', columnId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from update')

      const updatedColumn = dbColumnToColumn(data)
      set((state) => ({
        columns: state.columns.map(c => c.id === columnId ? updatedColumn : c)
      }))
    } catch (error) {
      console.error('Failed to update column:', error)
      set({ error: (error as Error).message })
    }
  },

  // Delete column (and all its tasks)
  deleteColumn: async (columnId) => {
    try {
      // First delete all tasks in the column
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('column_id', columnId)

      if (tasksError) throw tasksError

      // Then delete the column
      const { error: columnError } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId)

      if (columnError) throw columnError

      // Update local state
      set((state) => ({
        columns: state.columns.filter(c => c.id !== columnId),
        tasks: state.tasks.filter(t => t.columnId !== columnId)
      }))
    } catch (error) {
      console.error('Failed to delete column:', error)
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

  // Set dragging state
  setDragging: (isDragging) => {
    set({ isDragging })
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
          
          // Skip updates during drag to prevent interference
          if (get().isDragging) {
            console.log('Skipping realtime update during drag')
            return
          }
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newTask = dbTaskToTask(payload.new as DbTask)
            set((state) => ({
              tasks: [...state.tasks.filter(t => !t.id.startsWith('temp-')), newTask]
            }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedTask = dbTaskToTask(payload.new as DbTask)
            set((state) => ({
              tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            }))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            set((state) => ({
              tasks: state.tasks.filter(t => t.id !== (payload.old as DbTask).id)
            }))
          }
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
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newColumn = dbColumnToColumn(payload.new as DbColumn)
            set((state) => ({ columns: [...state.columns, newColumn] }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedColumn = dbColumnToColumn(payload.new as DbColumn)
            set((state) => ({
              columns: state.columns.map(c => c.id === updatedColumn.id ? updatedColumn : c)
            }))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            set((state) => ({
              columns: state.columns.filter(c => c.id !== (payload.old as DbColumn).id)
            }))
          }
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
          
          if (payload.eventType === 'INSERT' && payload.new) {
            const newUser = dbUserToUser(payload.new as DbUser)
            set((state) => ({ users: [...state.users, newUser] }))
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedUser = dbUserToUser(payload.new as DbUser)
            set((state) => ({
              users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
            }))
          } else if (payload.eventType === 'DELETE' && payload.old) {
            set((state) => ({
              users: state.users.filter(u => u.id !== (payload.old as DbUser).id)
            }))
          }
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