# Taskify // Modern Task Management Web Application

Taskify is a premium, feature-rich task management web application built from scratch. It features a stunning glassmorphic user interface, seamless dark/light mode switching, advanced task sorting and filtering, statistics tracking, local storage persistence, toast notifications, and interactive confetti celebrations.

---

## 🎯 Objective
The primary goal of this project was to design and build a modern, intuitive, responsive, and aesthetically pleasing task management web application using HTML, CSS, and Vanilla JavaScript. 

Key product requirements included:
- **Core CRUD Operations**: Adding, editing, completing, and deleting tasks.
- **Categorization & Priority**: Assigning tasks to categories (Work, Personal, Shopping, Health, Others) and priority levels (Low, Medium, High).
- **Search & Filtering**: Real-time text search and status-based filtering (All, Active, Completed).
- **Sorting Options**: Dynamic sorting by creation date, due date, or priority.
- **Persistence**: Saving tasks and user theme preferences locally.
- **Visual & Interactive Polish**: Delivering a responsive glassmorphic UI with micro-animations, a theme toggle, toast notifications, and custom canvas-based confetti celebrations.

---

## 🛠️ Tools Used
- **Frontend Core**: HTML5 (Semantic Structure) & CSS3 (Modern Custom Properties, Flexbox, CSS Grid).
- **Logic & Interactions**: Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage API, Canvas API).
- **Typography & Assets**: 
  - **Fonts**: *Outfit* (for premium headings) and *Inter* (for clean body text) via Google Fonts.
  - **Icons**: SVG & FontAwesome (v6.4) icons.
- **Development & AI Assistants**: Antigravity pairing assistant with MCP Stitch, file management, and terminal tools.

---

## 📝 Steps Performed

### 1. Planning & Architectural Design
- Defined the visual design language around **glassmorphism** (semi-transparent backgrounds, backdrop-filters, subtle borders, and smooth glowing ambient orbs).
- Established a robust design system in `style.css` using CSS custom properties (`:root`) for easy theme propagation, priority colors, and category badge styles.

### 2. UI Structure Development (`index.html`)
- Built a semantic layout featuring:
  - An **App Header** containing logo elements, date display, and a theme toggle.
  - A **Dashboard Grid Layout** splitting into a sidebar (for progress stats and the task creation form) and a main content section (for search, filters, sorting controls, and the dynamic task list).
  - An **Edit Task Modal** and a container for **Toast Notifications**.
  - A full-screen canvas for the **Confetti Celebration**.

### 3. Styling & Responsive Design (`style.css`)
- Programmed support for two themes: **Dark Mode** (default sleek dark aesthetic) and **Light Mode** (clean, high-contrast light aesthetic) using `[data-theme]` attributes.
- Implemented ambient animated CSS glow orbs (`.glow-orb`) that slowly float in the background.
- Designed custom animated components:
  - Custom SVG checkmark selectors.
  - Category-based and priority-based badge systems.
  - Modern input hover focus lines.
  - Smooth animation transitions for opening/closing modals, deleting tasks (fade-out collapse), and popping toasts.

### 4. Application Logic Development (`app.js`)
- **State Management**: Managed state arrays for tasks, active filters, and search queries.
- **Data Persistence**: Handled loading and saving tasks to `localStorage`.
- **Filtering & Sorting Engine**: Built helper functions to search, filter, and sort tasks simultaneously.
- **Dynamic Render Pipeline**:
  - Implemented dynamic creation of DOM nodes representing tasks.
  - Handled conditional empty states with user-friendly illustration SVGs.
  - Added XSS protection via HTML character escaping on task inputs.
- **Toast Notification Engine**: Created a dynamic toast alert queue showing operations success, info, and warning banners.
- **Interactive Celebration Engine**: Developed a vanilla JS particle-physics engine drawing custom confetti pieces on a `<canvas>` element when all tasks are marked as completed.

---

## 🏆 Key Outcomes
- **Zero Dependencies**: Developed without heavy libraries or frameworks, ensuring lightning-fast load times and lightweight execution.
- **Fully Responsive**: The application shifts fluidly from a 2-column desktop dashboard to a stacked layout on tablets and mobile screens.
- **Outstanding Aesthetics**: The glassmorphic cards, custom backgrounds, and theme transitions create a highly premium, modern app feel.
- **High Usability**: Built-in statistics trackers, instant real-time searches, and status messages keep users fully engaged and informed about their productivity.
