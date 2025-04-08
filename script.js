// Helper function to detect mobile devices
function isMobileDevice() {
    return window.innerWidth < 768;
}

// Main Application Class
class JournalApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.calendar = new Calendar(this);
        this.journal = new Journal();
        this.goals = new Goals();
        this.lessons = new Lessons();
        this.spacedRepetition = new SpacedRepetition();
        this.summary = new Summary(this);
        this.scheduledTasks = new ScheduledTasks(this);
        this.userProfile = {
            name: localStorage.getItem('user-name') || 'Friend',
            streak: parseInt(localStorage.getItem('user-streak') || '0'),
            lastActive: localStorage.getItem('last-active-date') || new Date().toISOString().split('T')[0],
            theme: localStorage.getItem('theme') || 'light'
        };

        this.init();
    }

    init() {
        // Initialize date display
        this.updateDateDisplay();
        
        // Initialize user profile
        this.initUserProfile();
        
        // Apply theme
        this.applyTheme();
        
        // Update streak
        this.updateStreak();
        
        // Initialize all modules
        this.calendar.init();
        this.journal.init();
        this.goals.init();
        this.lessons.init();
        this.spacedRepetition.init();
        this.summary.init();
        this.scheduledTasks.init();

        // Set up event listeners for tabs
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Set up collapsible sections
        this.initCollapsibleSections();
        
        // Set up icon navigation
        this.initIconNavigation();
        
        // Set up theme toggle
        this.initThemeToggle();

        // Initial update of day content
        this.updateDayContent(this.selectedDate);
        
        // Add resize event listener to handle mobile/desktop transitions
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Optimize collapsible sections for mobile
        this.optimizeCollapsibleSections();
    }
    
    initUserProfile() {
        // Display user greeting
        const greeting = this.getTimeBasedGreeting();
        document.getElementById('user-greeting').textContent = `${greeting}, ${this.userProfile.name}!`;
        
        // Display streak
        document.getElementById('streak-count').textContent = this.userProfile.streak;
    }
    
    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }
    
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = this.userProfile.lastActive;
        
        // Convert dates to consistent format for comparison
        const lastActiveDate = new Date(lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        
        const todayDate = new Date(today);
        todayDate.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last active was yesterday, increment streak
        if (lastActiveDate.getTime() === yesterday.getTime()) {
            this.userProfile.streak++;
        } 
        // If last active was before yesterday, reset streak
        else if (lastActiveDate < yesterday) {
            this.userProfile.streak = 1;
        }
        
        // Update last active date
        this.userProfile.lastActive = today;
        
        // Save to local storage
        localStorage.setItem('user-streak', this.userProfile.streak.toString());
        localStorage.setItem('last-active-date', today);
        
        // Update streak display
        document.getElementById('streak-count').textContent = this.userProfile.streak;
    }
    
    initThemeToggle() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        
        themeToggleBtn.addEventListener('click', () => {
            this.userProfile.theme = this.userProfile.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('theme', this.userProfile.theme);
        });
    }
    
    applyTheme() {
        if (this.userProfile.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-moon';
        }
    }

    initCollapsibleSections() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.collapsible-section');
                section.classList.toggle('collapsed');
                
                // Update the toggle button icon
                const toggleButton = header.querySelector('.toggle-section i');
                if (section.classList.contains('collapsed')) {
                    toggleButton.className = 'fas fa-chevron-down';
                } else {
                    toggleButton.className = 'fas fa-chevron-up';
                }
            });
        });
    }
    
    initIconNavigation() {
        const iconButtons = document.querySelectorAll('.section-icon-btn');
        
        // Set Day Details icon (first button) as active initially
        if (iconButtons.length > 0) {
            iconButtons[0].classList.add('active');
            this.showSection(iconButtons[0].dataset.section);
        }
        
        // Add click event listeners to icon buttons
        iconButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                iconButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding section
                this.showSection(button.dataset.section);
            });
        });
    }
    
    showSection(sectionClass) {
        // Hide all sections
        document.querySelectorAll('.right-panel > section.collapsible-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        const selectedSection = document.querySelector(`.${sectionClass}`);
        if (selectedSection) {
            selectedSection.style.display = 'block';
            
            // Make sure it's expanded
            if (selectedSection.classList.contains('collapsed')) {
                selectedSection.classList.remove('collapsed');
                
                // Update toggle button icon
                const toggleButton = selectedSection.querySelector('.toggle-section i');
                toggleButton.className = 'fas fa-chevron-up';
            }
        }
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = this.currentDate.toLocaleDateString('en-US', options);
    }

    switchTab(tab) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-summary`).classList.add('active');
    }

    selectDate(date) {
        this.selectedDate = date;
        this.calendar.highlightSelectedDay();
        this.updateDayContent(date);
        this.journal.displayEntries(); // Update journal entries for the new selected date
        this.goals.displayGoals(); // Update goals display for the new selected date
        
        // Automatically show the day details section
        const dayDetailsBtn = document.querySelector('.section-icon-btn[data-section="day-details-section"]');
        if (dayDetailsBtn) {
            // Remove active class from all buttons
            document.querySelectorAll('.section-icon-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to day details button
            dayDetailsBtn.classList.add('active');
            
            // Show day details section
            this.showSection('day-details-section');
        }
    }

    updateDayContent(date) {
        const dayContent = document.getElementById('day-content');
        const selectedDayHeader = document.getElementById('selected-day-header');
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        selectedDayHeader.textContent = formattedDate;
        dayContent.innerHTML = '';

        // Add journal entries for this day
        const journalSection = this.createDayContentSection('Journal Entries');
        const journalEntries = this.journal.getEntriesForDate(date);
        
        if (journalEntries.length > 0) {
            journalEntries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                
                // Add creation time
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                journalSection.appendChild(entryDiv);
            });
        } else {
            journalSection.innerHTML += '<p>No journal entries for this day.</p>';
        }
        
        // Add goals for this day - SUMMARY ONLY
        const goalsSection = this.createDayContentSection('Daily Goals Summary');
        const dayGoals = this.goals.getGoalsForDate(date);
        
        if (dayGoals.length > 0) {
            // Add overall progress bar at the top
            const totalProgress = dayGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
            const progressPercentage = dayGoals.length > 0 ? Math.round(totalProgress / dayGoals.length) : 0;
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <div class="progress-label">Day's Progress:</div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${progressPercentage === 100 ? 'rainbow-progress' : ''}" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-percentage">${progressPercentage}%</div>
            `;
            
            goalsSection.appendChild(progressContainer);
            
            // Add summary list of goals (without progress controls)
            const goalsList = document.createElement('div');
            goalsList.className = 'goals-list summary-list';
            
            dayGoals.forEach(goal => {
                const goalItem = document.createElement('div');
                goalItem.className = `goal-item-summary ${goal.completed ? 'goal-completed' : ''}`;
                
                goalItem.innerHTML = `
                    <div class="goal-text">
                        <i class="fas ${goal.completed ? 'fa-check-circle' : 'fa-circle'}"></i> 
                        ${goal.text} 
                        <span class="goal-progress-value">(${goal.progress || 0}%)</span>
                    </div>
                `;
                goalsList.appendChild(goalItem);
            });
            
            goalsSection.appendChild(goalsList);
        } else {
            goalsSection.innerHTML += '<p>No goals set for this day.</p>';
        }
        
        // Add lessons for this day - TITLE ONLY
        const lessonsSection = this.createDayContentSection('Lessons');
        const dayLessons = this.lessons.getLessonsForDate(date);
        
        if (dayLessons.length > 0) {
            const lessonList = document.createElement('div');
            lessonList.className = 'lesson-list-summary';
            
            dayLessons.forEach(lesson => {
                const lessonItem = document.createElement('div');
                lessonItem.className = 'lesson-item-summary';
                
                // Add creation time
                const lessonTime = new Date(lesson.date);
                const timeStr = lessonTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                lessonItem.innerHTML = `
                    <div class="lesson-title">
                        <i class="fas fa-graduation-cap"></i> ${lesson.title}
                    </div>
                    <div class="lesson-time">${timeStr}</div>
                `;
                lessonList.appendChild(lessonItem);
            });
            
            lessonsSection.appendChild(lessonList);
        } else {
            lessonsSection.innerHTML += '<p>No lessons for this day.</p>';
        }
        
        // Add scheduled tasks for this day
        const tasksSection = this.createDayContentSection('Scheduled Tasks');
        const dayTasks = this.scheduledTasks.getTasksForDate(date);
        
        if (dayTasks.length > 0) {
            const tasksList = document.createElement('div');
            tasksList.className = 'tasks-list-summary';
            
            dayTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item-summary';
                
                // For multi-day tasks, add a special class
                if (task.isMultiDay) {
                    taskItem.classList.add('multi-day-task');
                }
                
                if (task.isAllDay) {
                    taskItem.classList.add('all-day-task');
                }
                
                const startTime = task.isAllDay ? 'All day' : this.formatTime(task.startHour, task.startMinute);
                const endTime = task.isAllDay ? '' : ` - ${this.formatTime(task.endHour, task.endMinute)}`;
                
                let content = `
                    <div class="task-item-header">
                        <div class="task-item-title">
                            <i class="fas fa-clock"></i> ${task.name}
                        </div>
                        <div class="task-item-time">${startTime}${endTime}</div>
                    </div>
                `;
                
                // Add date range for multi-day tasks
                if (task.isMultiDay) {
                    const startDate = new Date(task.startDate).toLocaleDateString();
                    const endDate = new Date(task.endDate).toLocaleDateString();
                    content += `<div class="task-date-range">${startDate} - ${endDate}</div>`;
                }
                
                taskItem.innerHTML = content;
                tasksList.appendChild(taskItem);
            });
            
            tasksSection.appendChild(tasksList);
        } else {
            tasksSection.innerHTML += '<p>No tasks scheduled for this day.</p>';
        }
        
        // Add spaced repetition reminders for this day - ONLY IF THERE ARE REMINDERS
        const srReminders = this.spacedRepetition.getRemindersForDate(date);
        
        if (srReminders.length > 0) {
            const srSection = this.createDayContentSection('Spaced Repetition');
            
            srReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = `sr-item ${reminder.status}`;
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Original: ${new Date(reminder.originalDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="complete-sr" data-id="${reminder.id}"><i class="fas fa-check"></i></button>
                        <button class="reschedule-sr" data-id="${reminder.id}"><i class="fas fa-calendar-alt"></i></button>
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                srSection.appendChild(reminderDiv);
            });
            
            dayContent.appendChild(srSection);
        }
        
        dayContent.appendChild(journalSection);
        dayContent.appendChild(goalsSection);
        dayContent.appendChild(lessonsSection);
        dayContent.appendChild(tasksSection);
        
        // Set up event listeners for the day content
        this.setupDayContentListeners();
    }

    formatTime(hour, minute) {
        hour = parseInt(hour);
        minute = parseInt(minute);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }

    createDayContentSection(title) {
        const section = document.createElement('div');
        section.className = 'day-content-section fade-in';
        
        // Add appropriate icon based on section title
        let iconClass = 'fa-info-circle'; // Default icon
        
        if (title.includes('Journal')) {
            iconClass = 'fa-book';
        } else if (title.includes('Goals')) {
            iconClass = 'fa-bullseye';
        } else if (title.includes('Lesson')) {
            iconClass = 'fa-graduation-cap';
        } else if (title.includes('Repetition')) {
            iconClass = 'fa-sync-alt';
        } else if (title.includes('Summary')) {
            iconClass = 'fa-chart-bar';
        }
        
        section.innerHTML = `<h3><i class="fas ${iconClass}"></i> ${title}</h3>`;
        return section;
    }

    setupDayContentListeners() {
        // Journal actions
        document.querySelectorAll('.edit-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-journal').dataset.id;
                this.journal.editEntry(id);
            });
        });
        
        document.querySelectorAll('.delete-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-journal').dataset.id;
                this.journal.deleteEntry(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        // Goal actions
        document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.goals.toggleGoalCompletion(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.goal-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.goal-delete').dataset.id;
                this.goals.deleteGoal(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        // Use input event for the new text input
        document.querySelectorAll('.goal-progress-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                // Validate input: ensure it's a number between 0 and 100
                if (isNaN(progress)) {
                    progress = 0;
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                }
                
                // Update the input value to the validated progress
                e.target.value = progress;
                
                this.goals.updateGoalProgress(id, progress);
            });
            
            // Handle blur event to ensure the value is valid when user leaves the field
            input.addEventListener('blur', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                if (isNaN(progress)) {
                    progress = 0;
                    e.target.value = '0';
                }
                
                this.goals.updateGoalProgress(id, progress);
            });
        });
        
        // Lesson actions
        document.querySelectorAll('.edit-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                this.lessons.editLesson(id);
            });
        });
        
        document.querySelectorAll('.delete-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.lessons.deleteLesson(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.add-to-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.add-to-sr').dataset.id;
                const lesson = this.lessons.getLessonById(id);
                if (lesson) {
                    this.spacedRepetition.addLesson(lesson);
                    this.updateDayContent(this.selectedDate);
                    this.calendar.updateCalendar();
                }
            });
        });
        
        // SR actions
        document.querySelectorAll('.complete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.complete-sr').dataset.id;
                this.spacedRepetition.completeReminder(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.reschedule-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.reschedule-sr').dataset.id;
                this.spacedRepetition.rescheduleReminder(id);
                this.updateDayContent(this.selectedDate);
                this.calendar.updateCalendar();
            });
        });
        
        document.querySelectorAll('.delete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm("Are you sure you want to delete this reminder?")) {
                    const id = e.target.closest('.delete-sr').dataset.id;
                    this.spacedRepetition.deleteReminder(id);
                    this.updateDayContent(this.selectedDate);
                    this.calendar.updateCalendar();
                }
            });
        });
    }

    // Add new methods to handle responsive behavior
    handleResize() {
        // Handle any responsive layout changes needed when resizing between mobile/desktop
        if (isMobileDevice()) {
            // Mobile-specific adjustments
            this.optimizeCollapsibleSections();
        }
    }
    
    optimizeCollapsibleSections() {
        if (isMobileDevice()) {
            // On mobile, collapse all sections except the first one
            const sections = document.querySelectorAll('.collapsible-section');
            sections.forEach((section, index) => {
                if (index > 0) {
                    section.classList.add('collapsed');
                }
            });
        }
    }
}

// Journal Module with Time Support
class Journal {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('journal-entries')) || [];
    }

    init() {
        // Set current time as default
        this.setCurrentTimeAsDefault();
        
        // Event listener for save button
        document.getElementById('save-journal').addEventListener('click', () => this.saveEntry());
        
        // Event listener for time-of-day selection
        const timeOfDaySelect = document.getElementById('journal-time-of-day');
        if (timeOfDaySelect) {
            timeOfDaySelect.addEventListener('change', () => {
                // Focus on content area after selecting time of day
                document.getElementById('journal-content').focus();
            });
        }
        
        // Setup initial display
        this.displayEntries();
    }
    
    setCurrentTimeAsDefault() {
        const hourEl = document.getElementById('journal-hour');
        const minuteEl = document.getElementById('journal-minute');
        const timeOfDayEl = document.getElementById('journal-time-of-day');
        
        if (!hourEl || !minuteEl) return;
        
        const now = new Date();
        
        // Set hour
        hourEl.value = now.getHours().toString().padStart(2, '0');
        
        // Set minute (closest 5-minute interval)
        const minute = Math.floor(now.getMinutes() / 5) * 5;
        minuteEl.value = minute.toString().padStart(2, '0');
        
        // Set time of day based on current hour
        if (timeOfDayEl) {
            const hour = now.getHours();
            if (hour >= 5 && hour < 12) {
                timeOfDayEl.value = 'morning';
            } else if (hour >= 12 && hour < 14) {
                timeOfDayEl.value = 'noon';
            } else if (hour >= 14 && hour < 18) {
                timeOfDayEl.value = 'afternoon';
            } else {
                timeOfDayEl.value = 'evening';
            }
        }
    }
    
    saveEntry(isAutoSave = false) {
        const contentEl = document.getElementById('journal-content');
        const content = contentEl.value.trim();
        
        if (!content) return;
        
        // Get selected time
        const hourEl = document.getElementById('journal-hour');
        const minuteEl = document.getElementById('journal-minute');
        const timeOfDayEl = document.getElementById('journal-time-of-day');
        
        const hour = hourEl ? parseInt(hourEl.value) : new Date().getHours();
        const minute = minuteEl ? parseInt(minuteEl.value) : new Date().getMinutes();
        const timeOfDay = timeOfDayEl ? timeOfDayEl.value : 'none';
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        // Create a date with the selected date and time
        const entryDate = new Date(selectedDate);
        entryDate.setHours(hour, minute, 0, 0);
        
        const entry = {
            id: Date.now().toString(),
            date: entryDate.toISOString(),
            content: content,
            timeOfDay: timeOfDay
        };
        
        this.entries.push(entry);
        this.saveToLocalStorage();
        
        // Always reset inputs after manual save
        contentEl.value = '';
        this.setCurrentTimeAsDefault();
        
        this.displayEntries();
        
        // Update day content if the entry is for the selected date
        const app = window.app;
        if (app) {
            app.updateDayContent(app.selectedDate);
            if (app.calendar) {
                app.calendar.updateCalendar();
            }
        }
    }

    displayEntries() {
        const journalHistory = document.getElementById('journal-history');
        if (!journalHistory) return;
        
        journalHistory.innerHTML = '';
        
        // Get selected date entries and sort by time (newest first)
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDateEntries = this.getEntriesForDate(selectedDate).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        if (selectedDateEntries.length === 0) {
            journalHistory.innerHTML = `<p>No journal entries for ${selectedDate.toLocaleDateString()}. Add one above!</p>`;
            return;
        }
        
        // Group entries by time of day
        const entriesByTimeOfDay = {
            morning: [],
            noon: [],
            afternoon: [],
            evening: [],
            none: []
        };
        
        selectedDateEntries.forEach(entry => {
            // Backward compatibility for entries without timeOfDay
            const timeOfDay = entry.timeOfDay || 'none';
            
            // Also determine timeOfDay from entry time if not explicitly set
            if (timeOfDay === 'none') {
                const entryDate = new Date(entry.date);
                const hour = entryDate.getHours();
                
                if (hour >= 5 && hour < 12) {
                    entriesByTimeOfDay.morning.push(entry);
                } else if (hour >= 12 && hour < 14) {
                    entriesByTimeOfDay.noon.push(entry);
                } else if (hour >= 14 && hour < 18) {
                    entriesByTimeOfDay.afternoon.push(entry);
                } else {
                    entriesByTimeOfDay.evening.push(entry);
                }
            } else {
                entriesByTimeOfDay[timeOfDay].push(entry);
            }
        });
        
        // Display entries by time of day
        const timeOfDayLabels = {
            morning: 'Morning (Sáng sớm)',
            noon: 'Noon (Buổi trưa)',
            afternoon: 'Afternoon (Buổi chiều)',
            evening: 'Evening (Buổi tối)'
        };
        
        // Create sections for each time of day
        Object.keys(timeOfDayLabels).forEach(timeOfDay => {
            const entries = entriesByTimeOfDay[timeOfDay];
            if (entries.length === 0) return;
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'journal-time-section';
            
            const sectionHeader = document.createElement('h3');
            sectionHeader.className = 'journal-time-header';
            sectionHeader.textContent = timeOfDayLabels[timeOfDay];
            sectionDiv.appendChild(sectionHeader);
            
            entries.forEach(entry => {
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                sectionDiv.appendChild(entryDiv);
            });
            
            journalHistory.appendChild(sectionDiv);
        });
        
        // Handle legacy entries with no time of day (if any left)
        const legacyEntries = entriesByTimeOfDay.none;
        if (legacyEntries.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'journal-time-section';
            
            const sectionHeader = document.createElement('h3');
            sectionHeader.className = 'journal-time-header';
            sectionHeader.textContent = 'Other Entries';
            sectionDiv.appendChild(sectionHeader);
            
            legacyEntries.forEach(entry => {
                const entryTime = new Date(entry.date);
                const timeStr = entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-history-item';
                entryDiv.innerHTML = `
                    <div class="journal-date">${timeStr}</div>
                    <div class="journal-content">${entry.content}</div>
                    <div class="journal-actions">
                        <button class="edit-journal" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-journal" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                sectionDiv.appendChild(entryDiv);
            });
            
            journalHistory.appendChild(sectionDiv);
        }
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-journal').dataset.id;
                this.editEntry(id);
            });
        });
        
        document.querySelectorAll('.delete-journal').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-journal').dataset.id;
                this.deleteEntry(id);
            });
        });
    }

    editEntry(id) {
        const entry = this.entries.find(entry => entry.id === id);
        
        if (entry) {
            const contentEl = document.getElementById('journal-content');
            const hourEl = document.getElementById('journal-hour');
            const minuteEl = document.getElementById('journal-minute');
            const timeOfDayEl = document.getElementById('journal-time-of-day');
            
            contentEl.value = entry.content;
            
            const entryDate = new Date(entry.date);
            hourEl.value = entryDate.getHours().toString().padStart(2, '0');
            minuteEl.value = entryDate.getMinutes().toString().padStart(2, '0');
            
            // Set time of day if available
            if (timeOfDayEl && entry.timeOfDay) {
                timeOfDayEl.value = entry.timeOfDay;
            } else if (timeOfDayEl) {
                // Determine time of day from time if not explicitly set
                const hour = entryDate.getHours();
                if (hour >= 5 && hour < 12) {
                    timeOfDayEl.value = 'morning';
                } else if (hour >= 12 && hour < 14) {
                    timeOfDayEl.value = 'noon';
                } else if (hour >= 14 && hour < 18) {
                    timeOfDayEl.value = 'afternoon';
                } else {
                    timeOfDayEl.value = 'evening';
                }
            }
            
            // Focus on the content
            contentEl.focus();
            
            // Delete the old entry
            this.deleteEntry(id, true);
        }
    }

    deleteEntry(id, isAutoSave = false) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }
        
        const index = this.entries.findIndex(entry => entry.id === id);
        
        if (index !== -1) {
            this.entries.splice(index, 1);
            this.saveToLocalStorage();
            this.displayEntries();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
        
        if (!isAutoSave) {
            this.setCurrentTimeAsDefault();
        }
    }

    getEntriesForDate(date) {
        return this.entries.filter(entry => this.isSameDay(new Date(entry.date), date));
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    saveToLocalStorage() {
        localStorage.setItem('journal-entries', JSON.stringify(this.entries));
    }
}

// Goals Module
class Goals {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
    }

    init() {
        document.getElementById('add-goal').addEventListener('click', () => this.addGoal());
        document.getElementById('new-goal').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });
        
        this.displayGoals();
        this.updateProgressBar();
    }

    addGoal() {
        const goalInput = document.getElementById('new-goal');
        const goalText = goalInput.value.trim();
        
        if (!goalText) return;
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        const goal = {
            id: Date.now().toString(),
            text: goalText,
            date: new Date(selectedDate).toISOString(),
            completed: false,
            progress: 0 // Add progress property for individual goal progress
        };
        
        this.goals.push(goal);
        this.saveToLocalStorage();
        
        goalInput.value = '';
        this.displayGoals();
        this.updateProgressBar();
        
        // Update day content and calendar
        const app = window.app;
        if (app && this.isSameDay(new Date(goal.date), app.selectedDate)) {
            app.updateDayContent(app.selectedDate);
        }
        
        if (app && app.calendar) {
            app.calendar.updateCalendar();
        }
    }

    displayGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';
        
        // Get goals for the selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDayGoals = this.goals.filter(goal => this.isSameDay(new Date(goal.date), selectedDate));
        
        if (selectedDayGoals.length === 0) {
            goalsList.innerHTML = `<p>No goals set for ${selectedDate.toLocaleDateString()}. Add one above!</p>`;
            return;
        }
        
        // Display selected day's goals
        selectedDayGoals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = `goal-item ${goal.completed ? 'goal-completed' : ''}`;
            goalItem.dataset.id = goal.id;
            
            // Add rainbow class when progress is 100%
            const progressBarClass = goal.progress === 100 ? 'rainbow-progress' : '';
            
            goalItem.innerHTML = `
                <input type="checkbox" class="goal-checkbox" data-id="${goal.id}" ${goal.completed ? 'checked' : ''}>
                <div class="goal-text">${goal.text}</div>
                <div class="goal-progress-container">
                    <div class="progress-bar-container goal-individual-progress">
                        <div class="progress-bar ${progressBarClass}" style="width: ${goal.progress || 0}%"></div>
                    </div>
                    <input type="text" class="goal-progress-input" data-id="${goal.id}" value="${goal.progress || 0}" min="0" max="100">
                    <button class="goal-progress-apply" data-id="${goal.id}">Apply</button>
                    <span class="goal-progress-value">${goal.progress || 0}%</span>
                </div>
                <button class="goal-delete" data-id="${goal.id}"><i class="fas fa-times"></i></button>
            `;
            
            goalsList.appendChild(goalItem);
        });
        
        // Add event listeners
        document.querySelectorAll('#goals-list .goal-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.toggleGoalCompletion(id);
            });
        });
        
        document.querySelectorAll('#goals-list .goal-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.goal-delete').dataset.id;
                this.deleteGoal(id);
            });
        });
        
        // Add event listener for progress input
        document.querySelectorAll('#goals-list .goal-progress-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                let progress = parseInt(e.target.value);
                
                // Only validate the input, but don't update progress yet
                if (isNaN(progress)) {
                    progress = 0;
                    e.target.value = '0';
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                    e.target.value = progress;
                }
            });
        });
        
        // Add event listener for Apply button
        document.querySelectorAll('#goals-list .goal-progress-apply').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const input = e.target.parentNode.querySelector('.goal-progress-input');
                let progress = parseInt(input.value);
                
                if (isNaN(progress)) {
                    progress = 0;
                    input.value = '0';
                } else {
                    progress = Math.max(0, Math.min(100, progress));
                }
                
                this.updateGoalProgress(id, progress);
                
                // Add visual feedback
                button.textContent = 'Done!';
                setTimeout(() => {
                    button.textContent = 'Apply';
                }, 1000);
            });
        });
    }

    updateGoalProgress(id, progress) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals[index].progress = progress;
            
            // If progress is 100%, also mark as completed
            if (progress === 100) {
                this.goals[index].completed = true;
            } else if (this.goals[index].completed) {
                // If progress is less than 100% but goal is marked completed, unmark it
                this.goals[index].completed = false;
            }
            
            // Update the UI directly without re-rendering everything
            const goalItem = document.querySelector(`.goal-item[data-id="${id}"]`);
            if (goalItem) {
                const progressBar = goalItem.querySelector('.progress-bar');
                const progressValue = goalItem.querySelector('.goal-progress-value');
                const checkbox = goalItem.querySelector('.goal-checkbox');
                
                // Update progress bar and text
                progressBar.style.width = `${progress}%`;
                progressValue.textContent = `${progress}%`;
                
                // Update checkbox state
                checkbox.checked = this.goals[index].completed;
                
                // Add/remove goal-completed class
                if (this.goals[index].completed) {
                    goalItem.classList.add('goal-completed');
                } else {
                    goalItem.classList.remove('goal-completed');
                }
                
                // Add/remove ultimate effects
                if (progress === 100) {
                    progressBar.classList.add('rainbow-progress');
                    progressBar.classList.add('ultimate');
                    
                    // Create flames container if it doesn't exist
                    let progressContainer = progressBar.parentNode;
                    if (!progressContainer.classList.contains('rainbow-progress-container')) {
                        progressContainer.classList.add('rainbow-progress-container');
                    }
                    
                    // Add flames element if it doesn't exist
                    if (!progressContainer.querySelector('.flames')) {
                        const flames = document.createElement('div');
                        flames.className = 'flames';
                        progressContainer.appendChild(flames);
                    }
                    
                    // Add pulse animation
                    progressBar.classList.add('pulse');
                    setTimeout(() => {
                        progressBar.classList.remove('pulse');
                    }, 500);
                } else {
                    progressBar.classList.remove('rainbow-progress');
                    progressBar.classList.remove('ultimate');
                    
                    // Remove flames element if it exists
                    const progressContainer = progressBar.parentNode;
                    const flames = progressContainer.querySelector('.flames');
                    if (flames) {
                        progressContainer.removeChild(flames);
                    }
                }
            }
            
            this.saveToLocalStorage();
            this.updateProgressBar();
        }
    }

    toggleGoalCompletion(id) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals[index].completed = !this.goals[index].completed;
            
            // Auto-set progress to 100% when completed, or to previous progress when uncompleted
            if (this.goals[index].completed) {
                this.goals[index].progress = 100;
            }
            
            this.saveToLocalStorage();
            
            // Update the specific goal item in the UI without re-rendering the whole list
            const goalItem = document.querySelector(`.goal-item[data-id="${id}"]`);
            if (goalItem) {
                const progressBar = goalItem.querySelector('.progress-bar');
                const progressValue = goalItem.querySelector('.goal-progress-value');
                const input = goalItem.querySelector('.goal-progress-input');
                
                if (this.goals[index].completed) {
                    progressBar.style.width = '100%';
                    progressBar.classList.add('rainbow-progress');
                    progressBar.classList.add('ultimate');
                    progressValue.textContent = '100%';
                    input.value = 100;
                    goalItem.classList.add('goal-completed');
                    
                    // Create flames container if it doesn't exist
                    let progressContainer = progressBar.parentNode;
                    if (!progressContainer.classList.contains('rainbow-progress-container')) {
                        progressContainer.classList.add('rainbow-progress-container');
                    }
                    
                    // Add flames element if it doesn't exist
                    if (!progressContainer.querySelector('.flames')) {
                        const flames = document.createElement('div');
                        flames.className = 'flames';
                        progressContainer.appendChild(flames);
                    }
                } else {
                    progressBar.style.width = '0%';
                    progressBar.classList.remove('rainbow-progress');
                    progressBar.classList.remove('ultimate');
                    progressValue.textContent = '0%';
                    input.value = 0;
                    goalItem.classList.remove('goal-completed');
                    
                    // Remove flames element if it exists
                    const progressContainer = progressBar.parentNode;
                    const flames = progressContainer.querySelector('.flames');
                    if (flames) {
                        progressContainer.removeChild(flames);
                    }
                }
            }
            
            this.updateProgressBar();
        }
    }

    deleteGoal(id) {
        const index = this.goals.findIndex(goal => goal.id === id);
        
        if (index !== -1) {
            this.goals.splice(index, 1);
            this.saveToLocalStorage();
            this.displayGoals();
            this.updateProgressBar();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    updateProgressBar() {
        const progressBar = document.getElementById('goal-progress-bar');
        const progressPercentage = document.getElementById('goal-progress-percentage');
        
        if (!progressBar || !progressPercentage) return;
        
        // Get goals for the selected date
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        const selectedDayGoals = this.getGoalsForDate(selectedDate);
        
        // Calculate overall progress
        if (selectedDayGoals.length === 0) {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            return;
        }
        
        const totalProgress = selectedDayGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
        const overallProgress = Math.round(totalProgress / selectedDayGoals.length);
        
        // Update the progress bar width and text
        progressBar.style.width = `${overallProgress}%`;
        progressPercentage.textContent = `${overallProgress}%`;
        
        // Apply rainbow gradient effect at 100%
        if (overallProgress === 100) {
            progressBar.classList.add('rainbow-progress');
            progressBar.classList.add('ultimate');
            
            // Make sure the container has the special class
            const progressContainer = progressBar.parentNode;
            if (!progressContainer.classList.contains('rainbow-progress-container')) {
                progressContainer.classList.add('rainbow-progress-container');
            }
            
            // Add flames element if it doesn't exist
            if (!progressContainer.querySelector('.flames')) {
                const flames = document.createElement('div');
                flames.className = 'flames';
                progressContainer.appendChild(flames);
            }
            
            // Add pulse animation
            progressBar.classList.add('pulse');
            setTimeout(() => {
                progressBar.classList.remove('pulse');
            }, 500);
        } else {
            progressBar.classList.remove('rainbow-progress');
            progressBar.classList.remove('ultimate');
            
            // Remove flames if progress is less than 100%
            const progressContainer = progressBar.parentNode;
            const flames = progressContainer.querySelector('.flames');
            if (flames) {
                progressContainer.removeChild(flames);
            }
            
            if (progressContainer.classList.contains('rainbow-progress-container')) {
                progressContainer.classList.remove('rainbow-progress-container');
            }
        }
    }

    getGoalsForDate(date) {
        return this.goals.filter(goal => this.isSameDay(new Date(goal.date), date));
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getCompletionRate(startDate, endDate) {
        const filteredGoals = this.goals.filter(goal => {
            const goalDate = new Date(goal.date);
            return goalDate >= startDate && goalDate <= endDate;
        });
        
        const totalGoals = filteredGoals.length;
        const completedGoals = filteredGoals.filter(goal => goal.completed).length;
        
        return {
            total: totalGoals,
            completed: completedGoals,
            percentage: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
        };
    }

    saveToLocalStorage() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
}

// Lessons Module
class Lessons {
    constructor() {
        this.lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        this.currentEditingId = null;
        this.currentEditingSubjectId = null;
        this.selectedSubjectId = null;
    }
    
    init() {
        // Create sidebar overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Add floating action button for mobile
        if (isMobileDevice()) {
            const fab = document.createElement('button');
            fab.className = 'mobile-fab';
            fab.innerHTML = '<i class="fas fa-plus"></i>';
            fab.setAttribute('aria-label', 'Add new lesson');
            
            fab.addEventListener('click', () => {
                this.currentEditingId = null; // Ensure we're creating a new lesson
                this.showLessonForm();
            });
            
            document.body.appendChild(fab);
        }
        
        // Initialize mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.lessons-sidebar');
        
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });
            
            // Close sidebar when clicking overlay
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
            
            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            });
        }
        
        // Add Back Button for mobile view
        if (isMobileDevice()) {
            const lessonsContent = document.querySelector('.lessons-content');
            if (lessonsContent) {
                const backButton = document.createElement('button');
                backButton.className = 'mobile-back-btn';
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Subjects';
                backButton.addEventListener('click', () => {
                    if (sidebar) {
                        sidebar.classList.add('active');
                        overlay.classList.add('active');
                    }
                });
                
                // Insert back button at the beginning of content
                lessonsContent.insertBefore(backButton, lessonsContent.firstChild);
            }
        }
        
        // Initialize subject search
        const subjectSearch = document.getElementById('subject-search');
        if (subjectSearch) {
            subjectSearch.addEventListener('input', (e) => {
                this.filterSubjects(e.target.value);
            });
        }
        
        // Initialize new lesson button
        const newLessonBtn = document.getElementById('new-lesson-btn');
        if (newLessonBtn) {
            newLessonBtn.addEventListener('click', () => this.showLessonForm());
        }
        
        // Initialize cancel button
        const cancelBtn = document.getElementById('cancel-lesson');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideLessonForm());
        }
        
        // Initialize rich text editor
        this.initRichTextEditor();
        
        // Initialize file upload
        this.initFileUpload();
        
        // Initial displays
        this.displaySubjects();
        this.displayLessons();
        
        // Setup event listeners for saving
        document.getElementById('save-lesson').addEventListener('click', () => this.saveLesson());
        
        // Add subject button
        const addSubjectBtn = document.querySelector('.add-subject-btn');
        if (addSubjectBtn) {
            addSubjectBtn.addEventListener('click', () => this.showSubjectForm());
        }
    }
    
    initRichTextEditor() {
        const toolbar = document.querySelector('.rich-text-toolbar');
        const editor = document.getElementById('lesson-content');
        
        if (toolbar && editor) {
            toolbar.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    const command = button.title.toLowerCase();
                    document.execCommand(command, false, null);
                });
            });
        }
    }
    
    initFileUpload() {
        const fileInput = document.getElementById('lesson-attachment');
        const attachmentsList = document.getElementById('attachments-list');
        
        if (fileInput && attachmentsList) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    const attachment = document.createElement('div');
                    attachment.className = 'attachment-item';
                    attachment.innerHTML = `
                        <i class="fas fa-file"></i>
                        <span>${file.name}</span>
                        <button class="remove-attachment"><i class="fas fa-times"></i></button>
                    `;
                    
                    attachment.querySelector('.remove-attachment').addEventListener('click', () => {
                        attachment.remove();
                    });
                    
                    attachmentsList.appendChild(attachment);
                });
            });
        }
    }
    
    filterSubjects(searchTerm) {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        const filteredSubjects = this.subjects.filter(subject => 
            subject.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.displaySubjectsList(filteredSubjects);
    }
    
    showLessonForm() {
        const form = document.querySelector('.lesson-form');
        const list = document.querySelector('.lessons-list');
        
        if (form && list) {
            form.style.display = 'block';
            list.style.display = 'none';
            
            // Reset form if not editing
            if (!this.currentEditingId) {
                document.getElementById('lesson-title').value = '';
                document.getElementById('lesson-content').value = '';
                document.getElementById('lesson-subject').value = this.selectedSubjectId || '';
            }
            
            // Focus title field
            document.getElementById('lesson-title').focus();
            
            // On mobile, add a "Cancel" button to the top for easier access
            // and hide the FAB
            if (isMobileDevice()) {
                const existingMobileCancel = form.querySelector('.mobile-cancel-button');
                if (!existingMobileCancel) {
                    const mobileCancel = document.createElement('button');
                    mobileCancel.className = 'btn secondary-btn mobile-cancel-button';
                    mobileCancel.innerHTML = '<i class="fas fa-times"></i> Cancel';
                    mobileCancel.style.marginBottom = '15px';
                    mobileCancel.style.width = '100%';
                    
                    mobileCancel.addEventListener('click', () => this.hideLessonForm());
                    
                    form.insertBefore(mobileCancel, form.firstChild);
                }
                
                // Hide FAB while form is showing
                const fab = document.querySelector('.mobile-fab');
                if (fab) {
                    fab.style.display = 'none';
                }
            }
        }
    }
    
    hideLessonForm() {
        const form = document.querySelector('.lesson-form');
        const list = document.querySelector('.lessons-list');
        
        if (form && list) {
            form.style.display = 'none';
            list.style.display = 'grid';
            
            // Reset editing state
            this.currentEditingId = null;
            
            // Show FAB on mobile if hidden
            if (isMobileDevice()) {
                const fab = document.querySelector('.mobile-fab');
                if (fab) {
                    fab.style.display = 'flex';
                }
            }
        }
    }
    
    displaySubjects() {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        this.displaySubjectsList(this.subjects);
    }
    
    displaySubjectsList(subjects) {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        subjectsList.innerHTML = '';
        
        if (subjects.length === 0) {
            subjectsList.innerHTML = '<p class="no-subjects">No subjects yet. Add one to get started!</p>';
            return;
        }
        
        subjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = `subject-item ${subject.id === this.selectedSubjectId ? 'active' : ''}`;
            subjectItem.innerHTML = `
                <div class="subject-item-title">${subject.name}</div>
                ${subject.description ? `<div class="subject-item-description">${subject.description}</div>` : ''}
                <div class="subject-item-count">${this.getLessonCount(subject.id)} lessons</div>
            `;
            
            subjectItem.addEventListener('click', () => this.selectSubject(subject.id));
            
            subjectsList.appendChild(subjectItem);
        });
    }
    
    selectSubject(subjectId) {
        this.selectedSubjectId = subjectId;
        this.displaySubjects();
        this.displayLessons();
        this.updateBreadcrumb();
        
        // Close sidebar on mobile
        if (isMobileDevice()) {
            const sidebar = document.querySelector('.lessons-sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        }
    }
    
    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb-nav');
        if (!breadcrumb) return;
        
        const subject = this.subjects.find(s => s.id === this.selectedSubjectId);
        
        breadcrumb.innerHTML = `
            <span class="breadcrumb-item" onclick="window.app.lessons.selectSubject(null)">All Subjects</span>
            <i class="fas fa-chevron-right"></i>
            <span class="breadcrumb-item active">${subject ? subject.name : 'All Lessons'}</span>
        `;
    }
    
    getLessonCount(subjectId) {
        return this.lessons.filter(lesson => lesson.subjectId === subjectId).length;
    }
    
    displayLessons() {
        const lessonsList = document.getElementById('lessons-list');
        if (!lessonsList) return;
        
        // Filter lessons by selected subject
        const filteredLessons = this.selectedSubjectId
            ? this.lessons.filter(lesson => lesson.subjectId === this.selectedSubjectId)
            : this.lessons;
        
        // Sort by date (newest first)
        filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredLessons.length === 0) {
            lessonsList.innerHTML = `
                <div class="no-lessons">
                    <i class="fas fa-book"></i>
                    <p>No lessons yet. Create your first lesson to get started!</p>
                </div>
            `;
            return;
        }
        
        lessonsList.innerHTML = '';
        
        filteredLessons.forEach(lesson => {
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            
            const subject = this.subjects.find(s => s.id === lesson.subjectId);
            
            lessonCard.innerHTML = `
                <div class="lesson-card-header">
                    <h3>${lesson.title}</h3>
                    ${subject ? `<span class="lesson-subject">${subject.name}</span>` : ''}
                </div>
                <div class="lesson-card-content">${this.truncateContent(lesson.content)}</div>
                <div class="lesson-card-footer">
                    <div class="lesson-date">${new Date(lesson.date).toLocaleDateString()}</div>
                    <div class="lesson-actions">
                        <button class="edit-lesson" data-id="${lesson.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-lesson" data-id="${lesson.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            lessonCard.querySelector('.edit-lesson').addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                this.editLesson(id);
            });
            
            lessonCard.querySelector('.delete-lesson').addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.deleteLesson(id);
            });
            
            lessonsList.appendChild(lessonCard);
        });
    }
    
    saveLesson() {
        const titleEl = document.getElementById('lesson-title');
        const contentEl = document.getElementById('lesson-content');
        const subjectEl = document.getElementById('lesson-subject');
        
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        const subjectId = subjectEl.value;
        
        if (!title || !content) {
            alert('Please enter both a title and content for your lesson.');
            return;
        }
        
        // Use the app's selected date instead of today
        const selectedDate = window.app ? window.app.selectedDate : new Date();
        
        const lesson = {
            id: this.currentEditingId || Date.now().toString(),
            title: title,
            content: content,
            date: selectedDate.toISOString(),
            subjectId: subjectId || null
        };
        
        // If editing, remove the old lesson
        if (this.currentEditingId) {
            const index = this.lessons.findIndex(l => l.id === this.currentEditingId);
            if (index !== -1) {
                this.lessons.splice(index, 1);
            }
            this.currentEditingId = null;
        }
        
        this.lessons.push(lesson);
        this.saveToLocalStorage();
        
        titleEl.value = '';
        contentEl.value = '';
        subjectEl.value = '';
        
        this.displayLessons();
        
        // Update day content and calendar
        const app = window.app;
        if (app) {
            app.updateDayContent(app.selectedDate);
            if (app.calendar) {
                app.calendar.updateCalendar();
            }
        }
    }
    
    saveSubject() {
        let nameEl, descriptionEl;
        
        if (isMobileDevice()) {
            nameEl = document.querySelector('.mobile-subject-form #subject-name');
            descriptionEl = document.querySelector('.mobile-subject-form #subject-description');
        } else {
            nameEl = document.getElementById('subject-name');
            descriptionEl = document.getElementById('subject-description');
        }
        
        if (!nameEl) return;
        
        const name = nameEl.value.trim();
        const description = descriptionEl ? descriptionEl.value.trim() : '';
        
        if (!name) {
            alert('Please enter a subject name.');
            return;
        }
        
        const subject = {
            id: this.currentEditingSubjectId || Date.now().toString(),
            name: name,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        // If editing, remove the old subject
        if (this.currentEditingSubjectId) {
            const index = this.subjects.findIndex(s => s.id === this.currentEditingSubjectId);
            if (index !== -1) {
                this.subjects.splice(index, 1);
            }
            this.currentEditingSubjectId = null;
        }
        
        this.subjects.push(subject);
        this.saveToLocalStorage();
        
        if (nameEl) nameEl.value = '';
        if (descriptionEl) descriptionEl.value = '';
        
        this.displaySubjects();
        this.populateSubjectDropdown();
    }
    
    displaySubjects() {
        const subjectsList = document.getElementById('subjects-list');
        if (!subjectsList) return;
        
        subjectsList.innerHTML = '';
        
        if (this.subjects.length === 0) {
            subjectsList.innerHTML = '<p>No subjects yet. Add one above!</p>';
            return;
        }
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedSubjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-item';
            
            // Count lessons in this subject
            const lessonCount = this.lessons.filter(lesson => lesson.subjectId === subject.id).length;
            
            subjectItem.innerHTML = `
                <div class="subject-item-title">${subject.name}</div>
                ${subject.description ? `<div class="subject-item-description">${subject.description}</div>` : ''}
                <div class="subject-item-count">${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}</div>
                <div class="subject-item-actions">
                    <button class="edit-subject" data-id="${subject.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-subject" data-id="${subject.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            subjectsList.appendChild(subjectItem);
        });
        
        // Add event listeners
        document.querySelectorAll('#subjects-list .edit-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-subject').dataset.id;
                this.editSubject(id);
            });
        });
        
        document.querySelectorAll('#subjects-list .delete-subject').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-subject').dataset.id;
                this.deleteSubject(id);
            });
        });
    }
    
    displaySubjectSelector() {
        const selector = document.getElementById('subject-selector');
        if (!selector) return;
        
        selector.innerHTML = '';
        
        if (this.subjects.length === 0) {
            selector.innerHTML = '<p>No subjects available. Please create subjects first.</p>';
            return;
        }
        
        // Add "All Lessons" option
        const allCard = document.createElement('div');
        allCard.className = 'subject-card active';
        allCard.dataset.id = 'all';
        allCard.textContent = 'All Lessons';
        allCard.addEventListener('click', () => this.displayLessonsBySubject('all'));
        selector.appendChild(allCard);
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedSubjects.forEach(subject => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.dataset.id = subject.id;
            subjectCard.textContent = subject.name;
            
            subjectCard.addEventListener('click', () => {
                // Remove active class from all cards
                document.querySelectorAll('.subject-card').forEach(card => {
                    card.classList.remove('active');
                });
                
                // Add active class to clicked card
                subjectCard.classList.add('active');
                
                // Display lessons for this subject
                this.displayLessonsBySubject(subject.id);
            });
            
            selector.appendChild(subjectCard);
        });
        
        // Display all lessons initially
        this.displayLessonsBySubject('all');
    }
    
    displayLessonsBySubject(subjectId) {
        const container = document.getElementById('subject-lessons');
        if (!container) return;
        
        container.innerHTML = '';
        
        let lessons;
        let headerText;
        
        if (subjectId === 'all') {
            // Show all lessons
            lessons = [...this.lessons];
            headerText = 'All Lessons';
        } else {
            // Show lessons for the selected subject
            lessons = this.lessons.filter(lesson => lesson.subjectId === subjectId);
            const subject = this.subjects.find(s => s.id === subjectId);
            headerText = subject ? subject.name : 'Unknown Subject';
        }
        
        // Sort lessons by date (newest first)
        lessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create header
        const header = document.createElement('div');
        header.className = 'subject-lessons-header';
        header.innerHTML = `
            <div class="subject-lessons-title">${headerText}</div>
            <div class="subject-lessons-count">${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}</div>
        `;
        container.appendChild(header);
        
        if (lessons.length === 0) {
            container.innerHTML += '<p>No lessons in this subject yet.</p>';
            return;
        }
        
        // Create lessons list
        const lessonsList = document.createElement('div');
        lessonsList.className = 'lessons-list';
        
        lessons.forEach(lesson => {
            const lessonItem = document.createElement('div');
            lessonItem.className = 'lesson-item';
            
            const date = new Date(lesson.date);
            const dateStr = date.toLocaleDateString();
            
            lessonItem.innerHTML = `
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-date">${dateStr}</div>
                <div class="lesson-content">${this.truncateContent(lesson.content)}</div>
                <div class="lesson-actions">
                    <button class="view-lesson" data-id="${lesson.id}"><i class="fas fa-eye"></i></button>
                    <button class="edit-lesson" data-id="${lesson.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-lesson" data-id="${lesson.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            lessonsList.appendChild(lessonItem);
        });
        
        container.appendChild(lessonsList);
        
        // Add event listeners
        document.querySelectorAll('#subject-lessons .view-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.view-lesson').dataset.id;
                this.viewLesson(id);
            });
        });
        
        document.querySelectorAll('#subject-lessons .edit-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-lesson').dataset.id;
                // Switch to edit tab
                document.querySelector('.lesson-tab-btn[data-tab="lesson-input"]').click();
                this.editLesson(id);
            });
        });
        
        document.querySelectorAll('#subject-lessons .delete-lesson').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-lesson').dataset.id;
                this.deleteLesson(id);
                // Refresh the current view
                this.displayLessonsBySubject(subjectId);
            });
        });
    }
    
    viewLesson(id) {
        const lesson = this.getLessonById(id);
        
        if (!lesson) return;
        
        // Create modal for viewing the lesson
        const modal = document.createElement('div');
        modal.className = 'lesson-modal';
        
        // Get subject name if available
        let subjectHtml = '';
        if (lesson.subjectId) {
            const subject = this.subjects.find(s => s.id === lesson.subjectId);
            if (subject) {
                subjectHtml = `<div class="lesson-modal-subject">${subject.name}</div>`;
            }
        }
        
        modal.innerHTML = `
            <div class="lesson-modal-content">
                <div class="lesson-modal-header">
                    <h2>${lesson.title}</h2>
                    ${subjectHtml}
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="lesson-modal-body">
                    <p class="lesson-modal-date">${new Date(lesson.date).toLocaleDateString()}</p>
                    <div class="lesson-modal-text">${lesson.content}</div>
                </div>
                <div class="lesson-modal-footer">
                    <button class="btn secondary-btn edit-btn" data-id="${lesson.id}">Edit</button>
                    <button class="btn secondary-btn close-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal, .close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.edit-btn').addEventListener('click', () => {
            modal.remove();
            // Switch to edit tab
            document.querySelector('.lesson-tab-btn[data-tab="lesson-input"]').click();
            this.editLesson(lesson.id);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    populateSubjectDropdown() {
        const dropdown = document.getElementById('lesson-subject');
        if (!dropdown) return;
        
        // Clear all options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Sort subjects alphabetically
        const sortedSubjects = [...this.subjects].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        // Add options for each subject
        sortedSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            dropdown.appendChild(option);
        });
    }
    
    truncateContent(content) {
        const maxLength = 100;
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    }
    
    editLesson(id) {
        const lesson = this.getLessonById(id);
        
        if (!lesson) return;
        
        const titleEl = document.getElementById('lesson-title');
        const contentEl = document.getElementById('lesson-content');
        const subjectEl = document.getElementById('lesson-subject');
        
        titleEl.value = lesson.title;
        contentEl.value = lesson.content;
        subjectEl.value = lesson.subjectId || '';
        
        // Save the current editing ID
        this.currentEditingId = lesson.id;
        
        // Show the lesson form
        this.showLessonForm();
        
        // On mobile, scroll to form and ensure it's fully visible
        if (isMobileDevice()) {
            const lessonForm = document.querySelector('.lesson-form');
            if (lessonForm) {
                setTimeout(() => {
                    window.scrollTo({
                        top: lessonForm.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }
    
    editSubject(id) {
        const subject = this.subjects.find(s => s.id === id);
        
        if (!subject) return;
        
        // Save the current editing ID
        this.currentEditingSubjectId = subject.id;
        
        if (isMobileDevice()) {
            // Show the mobile subject form with the subject data
            this.showSubjectForm();
        } else {
            // Desktop behavior
            const nameEl = document.getElementById('subject-name');
            const descriptionEl = document.getElementById('subject-description');
            
            if (nameEl && descriptionEl) {
                nameEl.value = subject.name;
                descriptionEl.value = subject.description || '';
                
                // Focus the name field and scroll into view
                nameEl.scrollIntoView({ behavior: 'smooth' });
                nameEl.focus();
            }
        }
    }
    
    deleteLesson(id) {
        if (!confirm('Are you sure you want to delete this lesson? This will also remove any related spaced repetition reminders.')) {
            return;
        }
        
        const index = this.lessons.findIndex(lesson => lesson.id === id);
        
        if (index !== -1) {
            this.lessons.splice(index, 1);
            this.saveToLocalStorage();
            this.displayLessons();
            
            // Update subject lessons view if open
            if (document.getElementById('lessons-by-subject').classList.contains('active')) {
                const activeSubject = document.querySelector('.subject-card.active');
                if (activeSubject) {
                    this.displayLessonsBySubject(activeSubject.dataset.id);
                }
            }
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
                
                // Remove from spaced repetition if exists
                if (app.spacedRepetition) {
                    app.spacedRepetition.deleteRemindersByLessonId(id);
                }
            }
        }
    }
    
    deleteSubject(id) {
        // Count lessons in this subject
        const lessonCount = this.lessons.filter(lesson => lesson.subjectId === id).length;
        
        let confirmMessage = 'Are you sure you want to delete this subject?';
        if (lessonCount > 0) {
            confirmMessage += ` There are ${lessonCount} lesson(s) associated with this subject. The lessons will remain but will no longer be associated with any subject.`;
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        const index = this.subjects.findIndex(subject => subject.id === id);
        
        if (index !== -1) {
            this.subjects.splice(index, 1);
            
            // Update lessons to remove this subject
            this.lessons.forEach(lesson => {
                if (lesson.subjectId === id) {
                    lesson.subjectId = null;
                }
            });
            
            this.saveToLocalStorage();
            this.displaySubjects();
            this.populateSubjectDropdown();
            
            // Update lessons display
            this.displayLessons();
            
            // Refresh the subject selector if active
            if (document.getElementById('lessons-by-subject').classList.contains('active')) {
                this.displaySubjectSelector();
            }
        }
    }
    
    getLessonById(id) {
        return this.lessons.find(lesson => lesson.id === id);
    }
    
    getLessonsForDate(date) {
        return this.lessons.filter(lesson => this.isSameDay(new Date(lesson.date), date));
    }
    
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('lessons', JSON.stringify(this.lessons));
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
    }
    
    // Add the showSubjectForm method
    showSubjectForm() {
        // For mobile, create a popup subject form
        if (isMobileDevice()) {
            // Remove any existing form
            const existingForm = document.querySelector('.mobile-subject-form');
            if (existingForm) existingForm.remove();
            
            const form = document.createElement('div');
            form.className = 'mobile-subject-form';
            form.innerHTML = `
                <div class="mobile-form-overlay"></div>
                <div class="mobile-form-content">
                    <div class="mobile-form-header">
                        <h3>${this.currentEditingSubjectId ? 'Edit Subject' : 'Add New Subject'}</h3>
                        <button class="close-mobile-form"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="mobile-form-body">
                        <div class="form-group">
                            <label for="subject-name">Subject Name</label>
                            <input type="text" id="subject-name" class="form-control" placeholder="Enter subject name">
                        </div>
                        <div class="form-group">
                            <label for="subject-description">Description (Optional)</label>
                            <textarea id="subject-description" class="form-control" placeholder="Enter description"></textarea>
                        </div>
                    </div>
                    <div class="mobile-form-footer">
                        <button class="btn secondary-btn cancel-subject">Cancel</button>
                        <button class="btn primary-btn save-subject">Save Subject</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(form);
            
            // Add event listeners
            form.querySelector('.close-mobile-form').addEventListener('click', () => form.remove());
            form.querySelector('.cancel-subject').addEventListener('click', () => form.remove());
            form.querySelector('.mobile-form-overlay').addEventListener('click', () => form.remove());
            
            form.querySelector('.save-subject').addEventListener('click', () => {
                this.saveSubject();
                form.remove();
            });
            
            // If editing, populate form fields
            if (this.currentEditingSubjectId) {
                const subject = this.subjects.find(s => s.id === this.currentEditingSubjectId);
                if (subject) {
                    form.querySelector('#subject-name').value = subject.name;
                    form.querySelector('#subject-description').value = subject.description || '';
                }
            }
            
            // Focus on name field
            setTimeout(() => form.querySelector('#subject-name').focus(), 100);
        } else {
            // Desktop behavior
            // Here you would implement the desktop version of showing the subject form
            // This preserves the existing desktop functionality
            alert('Please implement the desktop subject form functionality');
        }
    }
}

// Spaced Repetition Module
class SpacedRepetition {
    constructor() {
        this.reminders = JSON.parse(localStorage.getItem('sr-reminders')) || [];
        this.intervals = [1, 7, 21, 50, 120]; // Days for each review
    }

    init() {
        this.checkOverdueReminders();
        this.updateRemindersDisplay();
    }

    addLesson(lesson) {
        // Create first reminder for the next day
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const reminder = {
            id: Date.now().toString(),
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            originalDate: today.toISOString(),
            reviewDate: tomorrow.toISOString(),
            status: 'normal', // normal, warning, overdue
            stage: 0 // Current stage in the spaced repetition sequence
        };
        
        this.reminders.push(reminder);
        this.saveToLocalStorage();
        this.updateRemindersDisplay();
        
        // Update calendar
        const app = window.app;
        if (app && app.calendar) {
            app.calendar.updateCalendar();
        }
    }

    completeReminder(id) {
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            const reminder = this.reminders[index];
            // Move to next stage
            reminder.stage++;
            
            // If all stages are completed, remove the reminder
            if (reminder.stage >= this.intervals.length) {
                this.reminders.splice(index, 1);
            } else {
                // Schedule next review
                const nextReviewDate = new Date();
                nextReviewDate.setDate(nextReviewDate.getDate() + this.intervals[reminder.stage]);
                reminder.reviewDate = nextReviewDate.toISOString();
                reminder.status = 'normal';
            }
            
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    rescheduleReminder(id) {
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            // Reschedule to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.reminders[index].reviewDate = tomorrow.toISOString();
            this.reminders[index].status = 'normal';
            
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    removeRemindersByLessonId(lessonId) {
        // Filter out all reminders related to the deleted lesson
        this.reminders = this.reminders.filter(reminder => reminder.lessonId !== lessonId);
        this.saveToLocalStorage();
    }

    deleteReminder(id) {
        // Find and remove the reminder with the given id
        const index = this.reminders.findIndex(reminder => reminder.id === id);
        
        if (index !== -1) {
            this.reminders.splice(index, 1);
            this.saveToLocalStorage();
            this.updateRemindersDisplay();
            
            // Update day content and calendar
            const app = window.app;
            if (app) {
                app.updateDayContent(app.selectedDate);
                if (app.calendar) {
                    app.calendar.updateCalendar();
                }
            }
        }
    }

    checkOverdueReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.reminders.forEach(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            
            const timeDiff = today - reviewDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 0) {
                if (daysDiff === 1) {
                    reminder.status = 'warning';
                } else if (daysDiff >= 2) {
                    reminder.status = 'overdue';
                    
                    // If overdue by 2 or more days, reschedule for the next stage
                    const nextReviewDate = new Date();
                    nextReviewDate.setDate(nextReviewDate.getDate() + this.intervals[reminder.stage]);
                    reminder.reviewDate = nextReviewDate.toISOString();
                }
            } else {
                reminder.status = 'normal';
            }
        });
        
        this.saveToLocalStorage();
    }

    updateRemindersDisplay() {
        const todayListEl = document.getElementById('sr-today-list');
        const upcomingListEl = document.getElementById('sr-upcoming-list');
        const todayCountEl = document.getElementById('sr-today-count');
        const upcomingCountEl = document.getElementById('sr-upcoming-count');
        
        todayListEl.innerHTML = '';
        upcomingListEl.innerHTML = '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter reminders for today and upcoming
        const todayReminders = this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return this.isSameDay(reviewDate, today) || reviewDate < today;
        });
        
        const upcomingReminders = this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate > today;
        }).sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
        
        // Update counts
        todayCountEl.textContent = todayReminders.length;
        upcomingCountEl.textContent = upcomingReminders.length;
        
        // Display reminders
        if (todayReminders.length === 0) {
            todayListEl.innerHTML = '<p>No reviews scheduled for today.</p>';
        } else {
            todayReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = `sr-item ${reminder.status}`;
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Original: ${new Date(reminder.originalDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="complete-sr" data-id="${reminder.id}"><i class="fas fa-check"></i></button>
                        <button class="reschedule-sr" data-id="${reminder.id}"><i class="fas fa-calendar-alt"></i></button>
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                todayListEl.appendChild(reminderDiv);
            });
        }
        
        if (upcomingReminders.length === 0) {
            upcomingListEl.innerHTML = '<p>No upcoming reviews scheduled.</p>';
        } else {
            // Show only first 5 upcoming reminders
            const displayReminders = upcomingReminders.slice(0, 5);
            
            displayReminders.forEach(reminder => {
                const reminderDiv = document.createElement('div');
                reminderDiv.className = 'sr-item';
                reminderDiv.innerHTML = `
                    <div class="sr-item-title">${reminder.lessonTitle}</div>
                    <div class="sr-item-date">Review: ${new Date(reminder.reviewDate).toLocaleDateString()}</div>
                    <div class="sr-item-actions">
                        <button class="delete-sr" data-id="${reminder.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                upcomingListEl.appendChild(reminderDiv);
            });
            
            if (upcomingReminders.length > 5) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'sr-more';
                moreDiv.textContent = `And ${upcomingReminders.length - 5} more...`;
                upcomingListEl.appendChild(moreDiv);
            }
        }
        
        // Add event listeners
        document.querySelectorAll('#sr-today-list .complete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.complete-sr').dataset.id;
                this.completeReminder(id);
            });
        });
        
        document.querySelectorAll('#sr-today-list .reschedule-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.reschedule-sr').dataset.id;
                this.rescheduleReminder(id);
            });
        });
        
        // Add event listener for delete buttons (both in today and upcoming lists)
        document.querySelectorAll('.delete-sr').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm("Are you sure you want to delete this reminder?")) {
                    const id = e.target.closest('.delete-sr').dataset.id;
                    this.deleteReminder(id);
                }
            });
        });
    }

    getRemindersForDate(date) {
        return this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            return this.isSameDay(reviewDate, date);
        });
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getReviewsStats(startDate, endDate) {
        const completedReviews = this.getCompletedReviewCount(startDate, endDate);
        const pendingReviews = this.getPendingReviewCount();
        const overdueReviews = this.getOverdueReviewCount();
        
        return {
            completed: completedReviews,
            pending: pendingReviews,
            overdue: overdueReviews
        };
    }

    getCompletedReviewCount(startDate, endDate) {
        // Estimation based on stage changes
        let completedCount = 0;
        
        this.reminders.forEach(reminder => {
            // Each stage change represents a completed review
            completedCount += reminder.stage;
        });
        
        return completedCount;
    }

    getPendingReviewCount() {
        return this.reminders.length;
    }

    getOverdueReviewCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.reminders.filter(reminder => {
            const reviewDate = new Date(reminder.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate < today;
        }).length;
    }

    saveToLocalStorage() {
        localStorage.setItem('sr-reminders', JSON.stringify(this.reminders));
    }
}

// Calendar Module
class Calendar {
    constructor(app) {
        this.app = app;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    init() {
        document.getElementById('prev-month').addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());
        
        this.updateCalendar();
    }

    updateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarHeader = document.getElementById('calendar-header');
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Set calendar header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        calendarHeader.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Get first day of month and total days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Create calendar days
        let dayCount = 1;
        const today = new Date();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add cells for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            const currentDate = new Date(this.currentYear, this.currentMonth, i);
            
            // Determine day class
            let dayClass = 'calendar-day';
            if (this.isSameDay(currentDate, today)) {
                dayClass += ' current-day';
            } else if (currentDate < today) {
                dayClass += ' past-day';
            } else {
                dayClass += ' future-day';
            }
            
            // Check if this day is selected
            if (this.isSameDay(currentDate, this.app.selectedDate)) {
                dayClass += ' selected';
            }
            
            dayCell.className = dayClass;
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = i;
            dayCell.appendChild(dayNumber);
            
            // Add indicators
            const indicators = document.createElement('div');
            indicators.className = 'day-indicators';
            
            // Check if this day has journal entries
            if (this.app.journal.getEntriesForDate(currentDate).length > 0) {
                const journalIndicator = document.createElement('div');
                journalIndicator.className = 'day-indicator journal-indicator';
                indicators.appendChild(journalIndicator);
            }
            
            // Check if this day has goals
            if (this.app.goals.getGoalsForDate(currentDate).length > 0) {
                const goalIndicator = document.createElement('div');
                goalIndicator.className = 'day-indicator goal-indicator';
                indicators.appendChild(goalIndicator);
            }
            
            // Check if this day has lessons
            if (this.app.lessons.getLessonsForDate(currentDate).length > 0) {
                const lessonIndicator = document.createElement('div');
                lessonIndicator.className = 'day-indicator lesson-indicator';
                indicators.appendChild(lessonIndicator);
            }
            
            // Check if this day has SR reminders
            const srReminders = this.app.spacedRepetition.getRemindersForDate(currentDate);
            if (srReminders.length > 0) {
                // Check if any reminders are overdue
                const hasOverdue = srReminders.some(reminder => reminder.status === 'overdue');
                const hasWarning = srReminders.some(reminder => reminder.status === 'warning');
                
                const srIndicator = document.createElement('div');
                
                if (hasOverdue) {
                    srIndicator.className = 'day-indicator sr-overdue-indicator';
                } else if (hasWarning) {
                    srIndicator.className = 'day-indicator sr-indicator';
                } else {
                    srIndicator.className = 'day-indicator sr-indicator';
                }
                
                indicators.appendChild(srIndicator);
            }
            
            // Check if this day has scheduled tasks
            if (this.app.scheduledTasks) {
                const dayTasks = this.app.scheduledTasks.getTasksForDate(currentDate);
                if (dayTasks.length > 0) {
                    // Check if any of the tasks are multi-day
                    const hasMultiDayTasks = dayTasks.some(task => task.isMultiDay);
                    
                    const taskIndicator = document.createElement('div');
                    
                    if (hasMultiDayTasks) {
                        taskIndicator.className = 'day-indicator multi-day-task-indicator';
                    } else {
                        taskIndicator.className = 'day-indicator task-indicator';
                    }
                    
                    indicators.appendChild(taskIndicator);
                }
            }
            
            dayCell.appendChild(indicators);
            
            // Add click event
            dayCell.addEventListener('click', () => {
                this.app.selectDate(currentDate);
            });
            
            calendarGrid.appendChild(dayCell);
            dayCount++;
        }
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.updateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateCalendar();
    }

    highlightSelectedDay() {
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selected class to the selected day
        const selectedDate = this.app.selectedDate;
        
        // Only highlight if the selected date is in the current month/year view
        if (selectedDate.getMonth() === this.currentMonth && selectedDate.getFullYear() === this.currentYear) {
            const selectedDay = selectedDate.getDate();
            
            // Get all non-empty day cells
            const dayCells = document.querySelectorAll('.calendar-day:not(.empty)');
            
            // Find the cell that corresponds to the selected day and add the 'selected' class
            dayCells.forEach(cell => {
                const dayNumber = parseInt(cell.querySelector('.day-number').textContent);
                if (dayNumber === selectedDay) {
                    cell.classList.add('selected');
                }
            });
        }
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// Summary Module
class Summary {
    constructor(app) {
        this.app = app;
    }

    init() {
        // Generate initial summaries
        this.generateWeeklySummary();
        this.generateMonthlySummary();
        
        // Setup weekly summary generation on Sunday or when the week changes
        this.setupSummaryGeneration();
    }

    setupSummaryGeneration() {
        // Get current day of week (0 = Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // Store the current week and month for comparison
        this.currentWeek = this.getWeekNumber(today);
        this.currentMonth = today.getMonth();
        
        // Check daily if we need to generate new summaries
        setInterval(() => {
            const now = new Date();
            const nowWeek = this.getWeekNumber(now);
            const nowMonth = now.getMonth();
            
            // If week changed, generate weekly summary
            if (nowWeek !== this.currentWeek) {
                this.generateWeeklySummary();
                this.currentWeek = nowWeek;
            }
            
            // If month changed, generate monthly summary
            if (nowMonth !== this.currentMonth) {
                this.generateMonthlySummary();
                this.currentMonth = nowMonth;
            }
        }, 1000 * 60 * 60 * 6); // Check every 6 hours
    }

    generateWeeklySummary() {
        const summaryEl = document.getElementById('weekly-summary');
        
        // Get date range for this week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);
        
        const weekRange = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
        
        // Get spaced repetition stats
        const srStats = this.app.spacedRepetition.getReviewsStats(startOfWeek, endOfWeek);
        
        // Get goals stats
        const goalStats = this.app.goals.getCompletionRate(startOfWeek, endOfWeek);
        
        // Build summary HTML
        summaryEl.innerHTML = `
            <div class="summary-header">Week of ${weekRange}</div>
            
            <div class="summary-card">
                <h3>Spaced Repetition</h3>
                <div class="summary-stat">
                    <div class="summary-label">Reviews Completed</div>
                    <div class="summary-value">${srStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Pending Reviews</div>
                    <div class="summary-value">${srStats.pending}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Overdue Reviews</div>
                    <div class="summary-value">${srStats.overdue}</div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Goals Progress</h3>
                <div class="summary-stat">
                    <div class="summary-label">Total Goals</div>
                    <div class="summary-value">${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completed Goals</div>
                    <div class="summary-value">${goalStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completion Rate</div>
                    <div class="summary-value">${goalStats.percentage}%</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${goalStats.percentage}%"></div>
                </div>
            </div>
        `;
    }

    generateMonthlySummary() {
        const summaryEl = document.getElementById('monthly-summary');
        
        // Get date range for this month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[today.getMonth()];
        
        // Get spaced repetition stats
        const srStats = this.app.spacedRepetition.getReviewsStats(startOfMonth, endOfMonth);
        
        // Get goals stats
        const goalStats = this.app.goals.getCompletionRate(startOfMonth, endOfMonth);
        
        // Count journal entries this month
        const journalEntries = this.app.journal.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfMonth && entryDate <= endOfMonth;
        }).length;
        
        // Count lessons created this month
        const lessonsCreated = this.app.lessons.lessons.filter(lesson => {
            const lessonDate = new Date(lesson.date);
            return lessonDate >= startOfMonth && lessonDate <= endOfMonth;
        }).length;
        
        // Build summary HTML
        summaryEl.innerHTML = `
            <div class="summary-header">${monthName} ${today.getFullYear()}</div>
            
            <div class="summary-card">
                <h3>Month Overview</h3>
                <div class="summary-stat">
                    <div class="summary-label">Journal Entries</div>
                    <div class="summary-value">${journalEntries}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Goals Created</div>
                    <div class="summary-value">${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Lessons Created</div>
                    <div class="summary-value">${lessonsCreated}</div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Goals Progress</h3>
                <div class="summary-stat">
                    <div class="summary-label">Completed Goals</div>
                    <div class="summary-value">${goalStats.completed} / ${goalStats.total}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Completion Rate</div>
                    <div class="summary-value">${goalStats.percentage}%</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${goalStats.percentage}%"></div>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>Spaced Repetition</h3>
                <div class="summary-stat">
                    <div class="summary-label">Reviews Completed</div>
                    <div class="summary-value">${srStats.completed}</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-label">Current Active Reviews</div>
                    <div class="summary-value">${srStats.pending}</div>
                </div>
            </div>
        `;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
}

// Scheduled Tasks Module
class ScheduledTasks {
    constructor(app) {
        this.app = app;
        this.tasks = JSON.parse(localStorage.getItem('scheduled-tasks')) || [];
        this.currentView = 'day'; // 'day' or 'week'
    }
    
    init() {
        // Setup event listener for saving tasks
        document.getElementById('save-task').addEventListener('click', () => this.saveTask());
        
        // Setup view switching (day/week)
        document.querySelectorAll('.schedule-view-options .tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Setup all-day checkbox
        const allDayCheckbox = document.getElementById('task-all-day');
        allDayCheckbox.addEventListener('change', () => {
            const timeInputs = document.querySelectorAll('.task-time-container select');
            timeInputs.forEach(input => {
                input.disabled = allDayCheckbox.checked;
            });
        });
        
        // Set default dates
        this.setDefaultDates();
        
        // Initial display
        this.displaySchedule();
        this.displayTasksList();
    }
    
    setDefaultDates() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('task-start-date');
        const endDateInput = document.getElementById('task-end-date');
        
        startDateInput.value = todayStr;
        endDateInput.value = todayStr;
        
        // Update dates when the selected date changes
        startDateInput.addEventListener('change', () => {
            // If end date is before start date, update it
            if (endDateInput.value < startDateInput.value) {
                endDateInput.value = startDateInput.value;
            }
        });
    }
    
    saveTask() {
        const nameEl = document.getElementById('task-name');
        const descriptionEl = document.getElementById('task-description');
        const linkEl = document.getElementById('task-link');
        
        const startDateEl = document.getElementById('task-start-date');
        const endDateEl = document.getElementById('task-end-date');
        const allDayEl = document.getElementById('task-all-day');
        
        const startHourEl = document.getElementById('task-start-hour');
        const startMinuteEl = document.getElementById('task-start-minute');
        const endHourEl = document.getElementById('task-end-hour');
        const endMinuteEl = document.getElementById('task-end-minute');
        
        const name = nameEl.value.trim();
        const description = descriptionEl.value.trim();
        const link = linkEl.value.trim();
        
        const startDate = startDateEl.value;
        const endDate = endDateEl.value;
        const isAllDay = allDayEl.checked;
        
        const startHour = isAllDay ? '00' : startHourEl.value;
        const startMinute = isAllDay ? '00' : startMinuteEl.value;
        const endHour = isAllDay ? '23' : endHourEl.value;
        const endMinute = isAllDay ? '59' : endMinuteEl.value;
        
        if (!name) {
            alert('Please enter a task name');
            return;
        }
        
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }
        
        // Validate dates and times
        if (startDate > endDate) {
            alert('End date must be on or after start date');
            return;
        }
        
        // If same day, validate times
        if (startDate === endDate && !isAllDay) {
            if (parseInt(startHour) > parseInt(endHour) || 
                (parseInt(startHour) === parseInt(endHour) && parseInt(startMinute) >= parseInt(endMinute))) {
                alert('End time must be after start time');
                return;
            }
        }
        
        // Create task object
        const task = {
            id: Date.now().toString(),
            name: name,
            description: description,
            link: link,
            startDate: startDate,
            endDate: endDate,
            isAllDay: isAllDay,
            startHour: startHour,
            startMinute: startMinute,
            endHour: endHour,
            endMinute: endMinute,
            isMultiDay: startDate !== endDate
        };
        
        // Add to tasks array
        this.tasks.push(task);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Reset form
        nameEl.value = '';
        descriptionEl.value = '';
        linkEl.value = '';
        allDayEl.checked = false;
        
        // Re-enable time inputs if they were disabled
        const timeInputs = document.querySelectorAll('.task-time-container select');
        timeInputs.forEach(input => {
            input.disabled = false;
        });
        
        // Update displays
        this.displaySchedule();
        this.displayTasksList();
        
        // Update day content
        this.app.updateDayContent(this.app.selectedDate);
    }
    
    displaySchedule() {
        const timelineEl = document.getElementById('schedule-timeline');
        const eventsEl = document.getElementById('schedule-events');
        
        if (!timelineEl || !eventsEl) return;
        
        // Clear previous content
        timelineEl.innerHTML = '';
        eventsEl.innerHTML = '';
        
        if (this.currentView === 'day') {
            this.displayDayView(timelineEl, eventsEl);
        } else {
            this.displayWeekView(timelineEl, eventsEl);
        }
    }
    
    displayDayView(timelineEl, eventsEl) {
        // Create timeline hours
        timelineEl.innerHTML = '';
        for (let h = 0; h < 24; h++) {
            const hourEl = document.createElement('div');
            hourEl.className = 'schedule-timeline-hour';
            hourEl.textContent = h % 12 === 0 ? '12' : h % 12;
            hourEl.textContent += h < 12 ? ' AM' : ' PM';
            timelineEl.appendChild(hourEl);
        }
        
        // Clear previous events
        eventsEl.innerHTML = '';
        
        // Get tasks for the selected date
        const selectedDateStr = this.app.selectedDate.toISOString().split('T')[0];
        const dayTasks = this.tasks.filter(task => {
            // Include tasks where the selected date falls between startDate and endDate (inclusive)
            return selectedDateStr >= task.startDate && selectedDateStr <= task.endDate;
        });
        
        // Sort tasks by start time
        dayTasks.sort((a, b) => {
            const aStart = parseInt(a.startHour) * 60 + parseInt(a.startMinute);
            const bStart = parseInt(b.startHour) * 60 + parseInt(b.startMinute);
            return aStart - bStart;
        });
        
        // Create event elements
        dayTasks.forEach(task => {
            const startHour = parseInt(task.startHour);
            const startMinute = parseInt(task.startMinute);
            const endHour = parseInt(task.endHour);
            const endMinute = parseInt(task.endMinute);
            
            // If the task spans multiple days, adjust the display for the current day
            let adjustedStartHour = startHour;
            let adjustedStartMinute = startMinute;
            let adjustedEndHour = endHour;
            let adjustedEndMinute = endMinute;
            
            // If this is not the start day, begin at midnight
            if (selectedDateStr > task.startDate) {
                adjustedStartHour = 0;
                adjustedStartMinute = 0;
            }
            
            // If this is not the end day, end at midnight
            if (selectedDateStr < task.endDate) {
                adjustedEndHour = 23;
                adjustedEndMinute = 59;
            }
            
            // Calculate position and height
            const top = (adjustedStartHour * 60 + adjustedStartMinute) * (60 / 60); // 60px per hour
            const duration = (adjustedEndHour * 60 + adjustedEndMinute) - (adjustedStartHour * 60 + adjustedStartMinute);
            const height = duration * (60 / 60); // 60px per hour
            
            // Create event element
            const eventEl = document.createElement('div');
            eventEl.className = 'schedule-event';
            
            // Add multi-day class if applicable
            if (task.isMultiDay) {
                eventEl.classList.add('multi-day-task');
            }
            
            // Add all-day class if applicable
            if (task.isAllDay) {
                eventEl.classList.add('all-day-task');
            }
            
            eventEl.style.top = `${top}px`;
            eventEl.style.height = `${height}px`;
            eventEl.style.width = 'calc(100% - 20px)';
            
            // Format time display
            const startTime = this.app.formatTime(adjustedStartHour, adjustedStartMinute);
            const endTime = this.app.formatTime(adjustedEndHour, adjustedEndMinute);
            
            let eventContent = `<div class="event-title">${task.name}</div>`;
            
            // Show date range for multi-day tasks
            if (task.isMultiDay) {
                const startDateFormatted = new Date(task.startDate).toLocaleDateString();
                const endDateFormatted = new Date(task.endDate).toLocaleDateString();
                eventContent += `<div class="event-date-range">${startDateFormatted} - ${endDateFormatted}</div>`;
            }
            
            eventContent += `<div class="event-time">${startTime} - ${endTime}</div>`;
            
            eventEl.innerHTML = eventContent;
            
            // Add click event to show details
            eventEl.addEventListener('click', () => this.showTaskDetails(task));
            
            eventsEl.appendChild(eventEl);
        });
    }
    
    displayWeekView(timelineEl, eventsEl) {
        // Implementation for week view
        eventsEl.innerHTML = '<div class="week-view-message">Week view coming soon...</div>';
    }
    
    displayTasksList() {
        const tasksListEl = document.getElementById('tasks-list');
        if (!tasksListEl) return;
        
        // Clear previous content
        tasksListEl.innerHTML = '';
        
        // Get tasks for the selected date
        const selectedDateStr = this.app.selectedDate.toISOString().split('T')[0];
        const dayTasks = this.tasks.filter(task => {
            return selectedDateStr >= task.startDate && selectedDateStr <= task.endDate;
        });
        
        // Sort tasks by start time
        dayTasks.sort((a, b) => {
            const aStart = parseInt(a.startHour) * 60 + parseInt(a.startMinute);
            const bStart = parseInt(b.startHour) * 60 + parseInt(b.startMinute);
            return aStart - bStart;
        });
        
        // Create task items
        if (dayTasks.length === 0) {
            tasksListEl.innerHTML = `<p>No tasks scheduled for ${this.app.selectedDate.toLocaleDateString()}.</p>`;
            return;
        }
        
        dayTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            
            // Add multi-day class if applicable
            if (task.isMultiDay) {
                taskItem.classList.add('multi-day-task');
            }
            
            taskItem.dataset.id = task.id;
            
            // Format time display
            const startTime = task.isAllDay ? 'All day' : this.app.formatTime(task.startHour, task.startMinute);
            const endTime = task.isAllDay ? '' : ` - ${this.app.formatTime(task.endHour, task.endMinute)}`;
            
            // Create HTML
            let html = `
                <div class="task-item-header">
                    <div class="task-item-title">${task.name}</div>
                    <div class="task-item-time">${startTime}${endTime}</div>
                </div>
            `;
            
            // Add date range for multi-day tasks
            if (task.isMultiDay) {
                const startDate = new Date(task.startDate).toLocaleDateString();
                const endDate = new Date(task.endDate).toLocaleDateString();
                html += `<div class="task-date-range">${startDate} - ${endDate}</div>`;
            }
            
            if (task.description) {
                html += `<div class="task-item-description">${task.description}</div>`;
            }
            
            if (task.link) {
                html += `<a href="${task.link}" target="_blank" class="task-item-link">
                    <i class="fas fa-link"></i> ${this.formatLink(task.link)}
                </a>`;
            }
            
            html += `
                <div class="task-item-actions">
                    <button class="edit-task" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskItem.innerHTML = html;
            tasksListEl.appendChild(taskItem);
        });
        
        // Add event listeners
        document.querySelectorAll('.edit-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-task').dataset.id;
                this.editTask(id);
            });
        });
        
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-task').dataset.id;
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(id);
                }
            });
        });
    }
    
    formatLink(url) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.hostname;
        } catch (e) {
            return url;
        }
    }
    
    showTaskDetails(task) {
        // Create a modal-like popup to show task details
        const existing = document.querySelector('.task-detail-popup');
        if (existing) existing.remove();
        
        const popup = document.createElement('div');
        popup.className = 'task-detail-popup';
        
        // Add task type classes for styling
        if (task.isMultiDay) popup.classList.add('multi-day-task');
        if (task.isAllDay) popup.classList.add('all-day-task');
        
        // Format times based on all-day setting
        const timeDisplay = task.isAllDay 
            ? 'All day' 
            : `${this.app.formatTime(task.startHour, task.startMinute)} - ${this.app.formatTime(task.endHour, task.endMinute)}`;
        
        // Format dates for display
        const startDate = new Date(task.startDate).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const endDate = new Date(task.endDate).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Create date display text based on multi-day status
        let dateDisplay = startDate;
        if (task.isMultiDay) {
            dateDisplay = `${startDate} - ${endDate}`;
        }
        
        // Build the popup content HTML
        popup.innerHTML = `
            <div class="popup-header">
                <h3>${task.name}</h3>
                <button class="close-popup"><i class="fas fa-times"></i></button>
            </div>
            <div class="popup-content">
                <div class="popup-dates">
                    <i class="fas fa-calendar-alt"></i> ${dateDisplay}
                </div>
                <div class="popup-time">
                    <i class="fas fa-clock"></i> ${timeDisplay}
                </div>
                ${task.description ? `<div class="popup-description">${task.description}</div>` : ''}
                ${task.link ? `<div class="popup-link"><a href="${task.link}" target="_blank"><i class="fas fa-link"></i> ${this.formatLink(task.link)}</a></div>` : ''}
            </div>
            <div class="popup-actions">
                <button class="btn secondary-btn edit-task-btn" data-id="${task.id}">Edit</button>
                <button class="btn secondary-btn delete-task-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Position the popup
        const rect = popup.getBoundingClientRect();
        popup.style.top = `${Math.max(20, (window.innerHeight - rect.height) / 2)}px`;
        popup.style.left = `${Math.max(20, (window.innerWidth - rect.width) / 2)}px`;
        
        // Add event listeners
        popup.querySelector('.close-popup').addEventListener('click', () => {
            popup.remove();
        });
        
        popup.querySelector('.edit-task-btn').addEventListener('click', () => {
            this.editTask(task.id);
            popup.remove();
        });
        
        popup.querySelector('.delete-task-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                this.deleteTask(task.id);
                popup.remove();
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }
    
    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        
        if (task) {
            // Fill form with task data
            const nameEl = document.getElementById('task-name');
            const descriptionEl = document.getElementById('task-description');
            const linkEl = document.getElementById('task-link');
            
            const startDateEl = document.getElementById('task-start-date');
            const endDateEl = document.getElementById('task-end-date');
            const allDayEl = document.getElementById('task-all-day');
            
            const startHourEl = document.getElementById('task-start-hour');
            const startMinuteEl = document.getElementById('task-start-minute');
            const endHourEl = document.getElementById('task-end-hour');
            const endMinuteEl = document.getElementById('task-end-minute');
            
            nameEl.value = task.name;
            descriptionEl.value = task.description || '';
            linkEl.value = task.link || '';
            
            startDateEl.value = task.startDate;
            endDateEl.value = task.endDate;
            allDayEl.checked = task.isAllDay || false;
            
            startHourEl.value = task.startHour;
            startMinuteEl.value = task.startMinute;
            endHourEl.value = task.endHour;
            endMinuteEl.value = task.endMinute;
            
            // Enable/disable time inputs based on all-day setting
            const timeInputs = document.querySelectorAll('.task-time-container select');
            timeInputs.forEach(input => {
                input.disabled = allDayEl.checked;
            });
            
            // Delete the task
            this.deleteTask(id);
            
            // Focus the name field
            nameEl.focus();
        }
    }
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToLocalStorage();
            
            // Update displays
            this.displaySchedule();
            this.displayTasksList();
            
            // Update day content
            this.app.updateDayContent(this.app.selectedDate);
        }
    }
    
    switchView(view) {
        if (view === 'day' || view === 'week') {
            this.currentView = view;
            
            // Update active tab
            document.querySelectorAll('.schedule-view-options .tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            
            // Update display
            this.displaySchedule();
        }
    }
    
    getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.tasks.filter(task => {
            return dateStr >= task.startDate && dateStr <= task.endDate;
        });
    }
    
    saveToLocalStorage() {
        localStorage.setItem('scheduled-tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JournalApp();
}); 