import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task } from '../types/kanban';
import { useSupabaseKanbanStore } from '../store/supabaseStore';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import BoardHeader from './BoardHeader';

const KanbanBoard: React.FC = () => {
  const {
    columns,
    tasks,
    users,
    getTasksByColumn,
    moveTask,
    updateTask,
    loadInitialData,
    subscribeToChanges,
  } = useSupabaseKanbanStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load initial data and set up real-time subscriptions
  useEffect(() => {
    loadInitialData();
    const unsubscribe = subscribeToChanges();
    
    return () => {
      unsubscribe();
    };
  }, [loadInitialData, subscribeToChanges]);


  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: {x: 5, y: 5}, // Allow more reliable activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: {x: 5, y: 5},
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'task';
    const isOverTask = over.data.current?.type === 'task';
    const isOverColumn = over.data.current?.type === 'column';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeTask = active.data.current?.task as Task;
      const overTask = over.data.current?.task as Task;

      if (activeTask.columnId !== overTask.columnId) {
        // Move to different column
        moveTask(activeTask.id, overTask.columnId, overTask.order);
      }
    }

    // Dropping a task over a column
    if (isActiveTask && isOverColumn) {
      const activeTask = active.data.current?.task as Task;
      const overColumn = over.data.current?.column;

      if (activeTask.columnId !== overColumn.id) {
        const targetColumnTasks = getTasksByColumn(overColumn.id);
        moveTask(activeTask.id, overColumn.id, targetColumnTasks.length);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'task';
    const isOverTask = over.data.current?.type === 'task';

    if (isActiveTask && isOverTask) {
      const activeTask = active.data.current?.task as Task;
      const overTask = over.data.current?.task as Task;

      // If in the same column, reorder
      if (activeTask.columnId === overTask.columnId) {
        const columnTasks = getTasksByColumn(activeTask.columnId);
        const activeIndex = columnTasks.findIndex((t: Task) => t.id === activeId);
        const overIndex = columnTasks.findIndex((t: Task) => t.id === overId);
        
        if (activeIndex !== overIndex) {
          const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
          
          // Update order for all affected tasks
          reorderedTasks.forEach((task: Task, index: number) => {
            if (task.order !== index) {
              updateTask(task.id, { order: index });
            }
          });
        }
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumnId(task.columnId);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setSelectedColumnId(null);
    setEditingTask(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <BoardHeader />
      
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          autoScroll={{
            enabled: true,
            threshold: {
              x: 0.2,
              y: 0.2,
            },
            acceleration: 10,
            interval: 5,
          }}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar">
            <div className="flex gap-6 p-6 h-full min-w-max">
              {columns
                .sort((a: any, b: any) => a.order - b.order)
                .map((column: any) => {
                  const columnTasks = getTasksByColumn(column.id);
                  
                  return (
                    <Column
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      onAddTask={() => handleAddTask(column.id)}
                      onEditTask={handleEditTask}
                    />
                  );
                })}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-6 opacity-95">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Form Modal */}
      {isTaskFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <TaskForm
              columnId={selectedColumnId!}
              task={editingTask}
              onClose={handleCloseTaskForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;