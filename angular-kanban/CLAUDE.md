# Angular Kanban Board - AI Assistant Context

## Project Overview
You are helping build a real-time collaborative Kanban board using Angular 17 with TypeScript. This is a 2-hour workshop project where participants will use AI assistance to rapidly develop a working application.

## User Story
**As a team member**, I want to drag tasks between columns and see changes reflected instantly for all users, so we can collaborate on project planning in real-time.

## Technical Stack
- **Frontend**: Angular 17 with TypeScript
- **Components**: Standalone components
- **Styling**: CSS / Tailwind CSS / Angular Material (participant choice)
- **State Management**: RxJS with Services / NgRx
- **Drag & Drop**: Angular CDK Drag Drop
- **Real-time**: Firebase, Supabase, or Socket.io (participant choice)
- **Build Tool**: Angular CLI

## Core Components Structure
```
KanbanBoardComponent
├── ColumnComponent (To Do, In Progress, Done)
│   ├── ColumnHeaderComponent
│   └── TaskListComponent
│       └── TaskCardComponent
│           ├── TaskTitle
│           ├── TaskDescription
│           ├── TaskAssignee
│           └── TaskPriority
└── BoardHeaderComponent
    ├── UserPresenceComponent
    └── BoardControlsComponent
```

## Data Models
```typescript
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
}
```

## Workshop Phases

### Phase 1: Static Board (30 min)
- Create basic board layout with Angular components
- Add columns and sample tasks
- Style with Angular Material or custom CSS
- Make it responsive

### Phase 2: Drag and Drop (30 min)
- Implement Angular CDK Drag Drop
- Add visual feedback during drag
- Handle drop events
- Update service state

### Phase 3: Real-time Sync (30 min)
- Connect to backend service
- Implement optimistic updates with RxJS
- Add user presence
- Handle conflicts

### Phase 4: Polish (20 min)
- Add Angular animations
- Improve UX
- Add extra features
- Fix bugs

## Implementation Priorities
1. **Get it working** - Focus on functionality first
2. **Make it real-time** - Add synchronization
3. **Make it pretty** - Polish the UI
4. **Make it robust** - Handle edge cases

## Common Implementation Patterns

### Service-Based State Management
```typescript
@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  moveTask(taskId: string, newColumnId: string): Observable<void> {
    // Optimistic update
    this.updateLocalState(taskId, newColumnId);
    
    // Sync with backend
    return this.api.moveTask(taskId, newColumnId).pipe(
      catchError(error => {
        this.rollbackState();
        return throwError(() => error);
      })
    );
  }
}
```

### Angular CDK Drag Drop
```typescript
drop(event: CdkDragDrop<Task[]>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
```

### Quick Wins for Workshop
- Use Angular CLI generators (`ng generate component`)
- Start with mock data in services
- Use Angular Material for quick UI
- Leverage Angular animations
- Use async pipe for subscriptions

## Suggested Libraries
- **UI Components**: Angular Material
- **Drag & Drop**: @angular/cdk/drag-drop
- **Icons**: Angular Material Icons
- **Unique IDs**: uuid or nanoid
- **Date handling**: date-fns
- **Styling**: Tailwind CSS for rapid prototyping

## Workshop Tips
- Use Angular CLI for scaffolding
- Generate services and components quickly
- Ask for complete, working code
- Request Angular-specific solutions
- Focus on core functionality first

## AI Assistant Guidelines
When asked to implement features:
1. Provide complete, working Angular code
2. Include all necessary imports and decorators
3. Use proper TypeScript types
4. Implement proper RxJS patterns
5. Suggest logical next steps
6. Keep code simple and readable
7. Prioritize workshop time constraints
8. Use standalone components (Angular 17+)