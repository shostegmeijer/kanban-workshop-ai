# React Kanban Board - AI Assistant Context

## Project Overview
You are helping build a real-time collaborative Kanban board using React and TypeScript. This is a 2-hour workshop project where participants will use AI assistance to rapidly develop a working application.

## User Story
**As a team member**, I want to drag tasks between columns and see changes reflected instantly for all users, so we can collaborate on project planning in real-time.

## Technical Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: CSS Modules / Tailwind CSS (participant choice)
- **State Management**: React Context API / Zustand
- **Drag & Drop**: @dnd-kit/sortable or react-beautiful-dnd
- **Real-time**: Firebase, Supabase, or Socket.io (participant choice)
- **Build Tool**: Create React App

## Core Components Structure
```
KanbanBoard
├── Column (To Do, In Progress, Done)
│   ├── ColumnHeader
│   └── TaskList
│       └── TaskCard
│           ├── TaskTitle
│           ├── TaskDescription
│           ├── TaskAssignee
│           └── TaskPriority
└── BoardHeader
    ├── UserPresence
    └── BoardControls
```

## Data Models
```typescript
interface Task {
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

interface Column {
  id: string;
  title: string;
  order: number;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}
```

## Workshop Phases

### Phase 1: Static Board (30 min)
- Create basic board layout
- Add columns and sample tasks
- Style the components
- Make it responsive

### Phase 2: Drag and Drop (30 min)
- Implement drag and drop library
- Add visual feedback during drag
- Handle drop events
- Update local state

### Phase 3: Real-time Sync (30 min)
- Connect to backend service
- Implement optimistic updates
- Add user presence
- Handle conflicts

### Phase 4: Polish (20 min)
- Add animations
- Improve UX
- Add extra features
- Fix bugs

## Implementation Priorities
1. **Get it working** - Focus on functionality first
2. **Make it real-time** - Add synchronization
3. **Make it pretty** - Polish the UI
4. **Make it robust** - Handle edge cases

## Common Implementation Patterns

### Optimistic Updates
```typescript
// Update UI immediately, sync in background
const moveTask = async (taskId, newColumnId) => {
  // 1. Update local state
  updateLocalState(taskId, newColumnId);
  
  // 2. Sync with backend
  try {
    await syncWithBackend(taskId, newColumnId);
  } catch (error) {
    // 3. Rollback on failure
    rollbackLocalState();
    showError("Failed to sync");
  }
};
```

### Quick Wins for Workshop
- Use mock data initially
- Start with local state before adding backend
- Use CSS transitions for smooth animations
- Add loading states for better UX
- Include placeholder content

## Suggested Libraries
- **Drag & Drop**: @dnd-kit/sortable (modern, accessible)
- **Icons**: react-icons or lucide-react
- **Unique IDs**: uuid or nanoid
- **Date handling**: date-fns
- **Animations**: framer-motion (optional)
- **Styling**: Tailwind CSS for rapid prototyping

## Workshop Tips
- Generate components incrementally
- Ask for complete, working code
- Request specific features clearly
- Don't hesitate to ask for alternatives
- Focus on core functionality first

## AI Assistant Guidelines
When asked to implement features:
1. Provide complete, working code
2. Include all necessary imports
3. Add proper TypeScript types
4. Handle common edge cases
5. Suggest logical next steps
6. Keep code simple and readable
7. Prioritize workshop time constraints