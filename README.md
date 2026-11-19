# Pomodoro Timer Web Application

A simple Pomodoro timer web application built with HTML, CSS, and vanilla JavaScript. This application helps you manage your time using the Pomodoro Technique, combined with task management and quick access to favorite websites.

## Features

- **Timer**: Focus timer with customizable duration (default 25 minutes)
- **To-Do List**: Add, edit, delete, and mark tasks as complete
- **Task Sorting**: Sort tasks by date or completion status
- **Quick Links**: Save and access your favorite websites with custom labels
- **Light/Dark Mode**: Switch between light and dark themes
- **User Personalization**: Set your name for a personalized greeting
- **Local Storage**: All data persists across browser sessions
- **Responsive Design**: Works on desktop and mobile devices

## Requirements

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- No build tools or installation required

## Setup and Installation

1. **Clone or download the project files**

   ```bash
   git clone <repository-url>
   cd pomodoro-timer-app
   ```

2. **Open the application**

   Simply open `index.html` in your web browser:
   - Windows: Double-click `index.html` or right-click and choose "Open with" → Your preferred browser
   - macOS: Double-click `index.html`
   - Linux: Open `index.html` in your browser

   That's it! The application runs directly in your browser with no server required.

## Project Structure

```
pomodoro-timer-app/
├── index.html          # Main HTML file with all UI sections
├── css/
│   └── styles.css      # All CSS styling
├── js/
│   └── app.js          # All JavaScript modules
└── README.md           # This file
```

## Usage

### Timer

1. **Set Duration**: Enter your desired work interval in minutes (1-120 minutes)
2. **Start**: Click "Start" to begin the countdown
3. **Stop**: Click "Stop" to pause the timer
4. **Reset**: Click "Reset" to return to the full duration

### To-Do List

1. **Add Task**: Enter a task name and click "Add Task"
2. **Complete Task**: Click the checkbox next to a task
3. **Edit Task**: Click the edit button, modify the name, and save
4. **Delete Task**: Click the delete button next to a task
5. **Sort Tasks**: Use the sort buttons to organize by date or completion status

### Quick Links

1. **Add Link**: Enter a URL and optional label, then click "Add Link"
   - If no label is provided, the domain will be used automatically
2. **Open Link**: Click the link to open it in a new tab
3. **Delete Link**: Click the delete button next to a link

### User Settings

1. **Set Name**: Enter your name and click "Save Name"
   - Your greeting will be personalized with your name
2. **Clear Name**: Delete your name and save to revert to generic greeting

### Theme Toggle

Click the 🌓 button in the top right corner to switch between light and dark modes. Your preference is saved automatically.

## Technical Details

### Local Storage Keys

The application uses the following Local Storage keys:

- `pomodoro_timer_config`: Timer settings and state
- `pomodoro_tasks`: Task list
- `pomodoro_links`: Quick links
- `pomodoro_user`: User settings (name and theme)

### Browser Compatibility

- Chrome/Edge (Chromium-based): ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## Development

### Code Organization

- **CSS**: All styles are in `css/styles.css`
- **JavaScript**: All logic is in `js/app.js`

### Modules

The application is organized into the following modules:

- `ThemeManager`: Handles light/dark mode switching
- `UserSettings`: Manages user name and preferences
- `Timer`: Controls the countdown timer
- `TaskManager`: Manages to-do list operations
- `LinkManager`: Handles quick links
- `UI`: Coordinates DOM updates and user interactions

## License

This project is open source and available under the MIT License.
