# AI Workshop: Multi-User Kanban Board

## 🎯 Workshop Goal
Learn to leverage AI coding assistants (Cursor/Claude) to build a fully functional application from a user story in just 2 hours.

## 📋 User Story

**As a team member**, I want to drag tasks between columns and see changes reflected instantly for all users, so we can collaborate on project planning in real-time.

### Acceptance Criteria
- [ ] Users can create, edit, and delete tasks
- [ ] Tasks can be dragged and dropped between columns (To Do, In Progress, Done)
- [ ] Changes are synchronized in real-time across all connected users
- [ ] Each task displays title, description, assignee, and priority
- [ ] Visual feedback during drag operations
- [ ] Responsive design that works on desktop and mobile
- [ ] Users can see who else is currently viewing the board

### Bonus Features (if time permits)
- [ ] User avatars and presence indicators
- [ ] Task comments
- [ ] Due dates with visual indicators
- [ ] Filter tasks by assignee or priority
- [ ] Dark mode toggle
- [ ] Export board to JSON/CSV

## 🚀 Getting Started

This repository contains starter templates for both React and Angular. Choose the framework you're most comfortable with:

### Option 1: React
```bash
cd react-kanban
npm install
npm run dev
```

### Option 2: Angular
```bash
cd angular-kanban
npm install
ng serve
```

## 📁 Project Structure

```
kanban-workshop-ai/
├── README.md (this file)
├── react-kanban/
│   ├── .cursor/           # Cursor IDE configuration
│   │   └── rules/         # Project-specific rules
│   ├── CLAUDE.md          # Claude AI context and instructions
│   ├── package.json
│   └── src/
└── angular-kanban/
    ├── .cursor/           # Cursor IDE configuration
    │   └── rules/         # Project-specific rules
    ├── CLAUDE.md          # Claude AI context and instructions
    ├── package.json
    └── src/
```

## 🤖 AI Assistant Configuration

Both projects include:
- **`.cursor/rules/`**: Project-specific rules for Cursor IDE to maintain code consistency
- **`CLAUDE.md`**: Context file for Claude AI with project architecture and coding standards

## 💡 Workshop Tips

1. **Start with the AI**: Let the AI generate the initial structure and components
2. **Iterate quickly**: Use the AI to refine and add features incrementally
3. **Focus on functionality**: Get it working first, then improve
4. **Ask specific questions**: The more specific your prompts, the better the results
5. **Review and understand**: Take time to understand what the AI generates

## 🛠️ Tech Stack Recommendations

### Backend Options
- **Firebase Realtime Database** (easiest for real-time sync)
- **Supabase** (PostgreSQL with real-time capabilities)
- **Socket.io + Express** (more control, requires more setup)
- **Mock API with local state** (quickest to start)

### Styling Options
- **Tailwind CSS** (rapid prototyping)
- **Material UI / Angular Material** (pre-built components)
- **CSS Modules** (scoped styling)

### State Management
- **React**: Zustand, Context API, or Redux Toolkit
- **Angular**: RxJS with Services, NgRx

## 📝 Workshop Agenda

1. **Introduction** (10 min)
   - Overview of AI-assisted development
   - Tour of the starter code

2. **Phase 1: Basic Board** (30 min)
   - Create columns and tasks
   - Implement local state management

3. **Phase 2: Drag and Drop** (30 min)
   - Add drag and drop functionality
   - Visual feedback and animations

4. **Phase 3: Real-time Sync** (30 min)
   - Connect to backend
   - Implement real-time updates

5. **Phase 4: Polish & Features** (20 min)
   - Add additional features
   - Improve UI/UX

6. **Wrap-up & Demo** (10 min)
   - Show your creations
   - Share learnings

## 🎓 Learning Objectives

By the end of this workshop, you will:
- Understand how to effectively prompt AI coding assistants
- Experience the speed of AI-assisted development
- Learn best practices for AI pair programming
- Build a production-ready feature in record time

## 📚 Resources

- [Cursor Documentation](https://docs.cursor.com)
- [Claude Documentation](https://docs.anthropic.com)
- [React DnD](https://react-dnd.github.io/react-dnd/about)
- [Angular CDK Drag Drop](https://material.angular.io/cdk/drag-drop/overview)

## 🤝 Contributing

Feel free to enhance this workshop material! Submit PRs with improvements or additional features.

---

*Created for "Van User Story naar Code met AI" Workshop*