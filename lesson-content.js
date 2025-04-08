// Lesson Content Page Functionality
class LessonContentManager {
    constructor() {
        this.lessons = JSON.parse(localStorage.getItem('lessons')) || [];
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        this.currentEditingId = null;
        this.currentEditingSubjectId = null;
        this.currentViewId = null;
        this.currentSubjectFilter = '';
        this.currentView = 'card-view'; // card-view or list-view
        this.userTheme = localStorage.getItem('theme') || 'light';
        
        // File handling
        this.currentAttachments = [];
        this.fileStorage = {}; // Simple in-memory storage for files
        
        this.init();
    }
    
    init() {
        // Apply theme
        this.applyTheme();
        
        // Initialize back button
        document.getElementById('back-to-main').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Initialize theme toggle
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Initialize view controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });
        
        // Initialize add buttons
        document.getElementById('add-subject-btn').addEventListener('click', () => {
            this.showSubjectModal();
        });
        
        document.getElementById('add-lesson-btn').addEventListener('click', () => {
            this.showLessonModal();
        });
        
        // Initialize modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Initialize save buttons
        document.getElementById('save-subject').addEventListener('click', () => {
            this.saveSubject();
        });
        
        document.getElementById('save-lesson').addEventListener('click', () => {
            this.saveLesson();
        });
        
        // Initialize filter controls
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Initialize search
        document.getElementById('search-lessons').addEventListener('input', (e) => {
            this.searchLessons(e.target.value);
        });
        
        // Initialize file uploads
        document.getElementById('lesson-attachments').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // Initialize tags input
        document.getElementById('lesson-tags').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });
        
        // Initialize toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToolbarAction(e.currentTarget.dataset.action);
            });
        });
        
        // Initialize export button
        document.getElementById('export-lesson').addEventListener('click', () => {
            this.exportCurrentLesson();
        });

        // Initialize editor buttons for viewed lesson
        document.getElementById('edit-viewed-lesson').addEventListener('click', () => {
            this.editViewedLesson();
        });
        
        document.getElementById('delete-viewed-lesson').addEventListener('click', () => {
            this.deleteViewedLesson();
        });
        
        // Load data
        this.loadSubjects();
        this.loadLessons();
        this.populateSubjectDropdowns();
    }
    
    applyTheme() {
        if (this.userTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-sun';
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelector('#theme-toggle-btn i').className = 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        this.userTheme = this.userTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.userTheme);
        this.applyTheme();
    }
    
    switchView(view) {
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update lessons display
        const displayEl = document.getElementById('lessons-display');
        displayEl.className = `lessons-display ${view}`;
        
        this.currentView = view;
        this.loadLessons(); // Reload with new view
    }
    
    loadSubjects() {
        const subjectsList = document.getElementById('subjects-list');
        subjectsList.innerHTML = '';
        
        if (this.subjects.length === 0) {
            subjectsList.innerHTML = '<div class="empty-message">No subjects yet. Add one to get started!</div>';
            return;
        }
        
        // Add "All Subjects" option
        const allSubjectsItem = document.createElement('div');
        allSubjectsItem.className = `sidebar-subject ${this.currentSubjectFilter === '' ? 'active' : ''}`;
        allSubjectsItem.innerHTML = `
            <div class="subject-name">
                <i class="fas fa-layer-group"></i>
                All Subjects
            </div>
            <div class="subject-count">${this.lessons.length}</div>
        `;
        allSubjectsItem.addEventListener('click', () => {
            this.filterBySubject('');
        });
        subjectsList.appendChild(allSubjectsItem);
        
        // Add each subject
        this.subjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = `sidebar-subject ${this.currentSubjectFilter === subject.id ? 'active' : ''}`;
            
            const lessonCount = this.lessons.filter(lesson => lesson.subjectId === subject.id).length;
            
            subjectItem.innerHTML = `
                <div class="subject-name">
                    <i class="fas fa-book" style="color: ${subject.color || '#4a6bdf'}"></i>
                    ${subject.name}
                </div>
                <div class="subject-count">${lessonCount}</div>
            `;
            
            subjectItem.addEventListener('click', () => {
                this.filterBySubject(subject.id);
            });
            
            subjectsList.appendChild(subjectItem);
        });
    }
    
    loadLessons() {
        const lessonsDisplay = document.getElementById('lessons-display');
        lessonsDisplay.innerHTML = '';
        
        // Get filtered lessons
        let filteredLessons = [...this.lessons];
        
        // Apply subject filter if set
        if (this.currentSubjectFilter) {
            filteredLessons = filteredLessons.filter(lesson => lesson.subjectId === this.currentSubjectFilter);
        }
        
        // Sort by date (newest first)
        filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredLessons.length === 0) {
            lessonsDisplay.innerHTML = '<div class="empty-message">No lessons yet. Create one using the "Add Lesson" button.</div>';
            return;
        }
        
        // Render lessons based on current view
        if (this.currentView === 'card-view') {
            this.renderCardView(filteredLessons);
        } else {
            this.renderListView(filteredLessons);
        }
    }
    
    renderCardView(lessons) {
        const lessonsDisplay = document.getElementById('lessons-display');
        
        lessons.forEach(lesson => {
            const subject = lesson.subjectId 
                ? this.subjects.find(s => s.id === lesson.subjectId) 
                : null;
            
            const lessonCard = document.createElement('div');
            lessonCard.className = `lesson-card ${lesson.important ? 'important' : ''}`;
            lessonCard.setAttribute('data-id', lesson.id);
            
            // Determine if lesson has attachments
            const hasAttachments = lesson.attachments && lesson.attachments.length > 0;
            
            // Determine if lesson has an image
            const hasImage = lesson.image || (lesson.attachments && lesson.attachments.some(a => a.type.startsWith('image/')));
            
            let cardMediaHTML = '';
            if (hasImage) {
                // Display first image in card media
                const image = lesson.image || lesson.attachments.find(a => a.type.startsWith('image/'));
                cardMediaHTML = `
                    <div class="card-media">
                        <img src="${lesson.image || image.dataUrl}" alt="${lesson.title}">
                    </div>
                `;
            }
            
            // Format tags HTML if any
            let tagsHTML = '';
            if (lesson.tags && lesson.tags.length > 0) {
                tagsHTML = `
                    <div class="tags-container">
                        ${lesson.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                `;
            }
            
            // Format date
            const date = new Date(lesson.date);
            const dateStr = date.toLocaleDateString();
            
            lessonCard.innerHTML = `
                ${cardMediaHTML}
                <div class="lesson-card-header">
                    <div class="lesson-card-title">${lesson.title}</div>
                    ${subject ? `<div class="card-subject" style="background-color: ${subject.color || '#4a6bdf'}">${subject.name}</div>` : ''}
                    <div class="card-date">${dateStr}</div>
                    <div class="card-actions">
                        <button class="actions-trigger"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="actions-menu">
                            <button class="view-action" data-id="${lesson.id}"><i class="fas fa-eye"></i> View</button>
                            <button class="edit-action" data-id="${lesson.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="delete-action" data-id="${lesson.id}"><i class="fas fa-trash"></i> Delete</button>
                            ${lesson.important ? 
                                `<button class="unmark-important-action" data-id="${lesson.id}"><i class="fas fa-star"></i> Unmark Important</button>` : 
                                `<button class="mark-important-action" data-id="${lesson.id}"><i class="far fa-star"></i> Mark Important</button>`
                            }
                        </div>
                    </div>
                </div>
                <div class="lesson-card-body">
                    <div class="lesson-card-preview">${this.truncateContent(lesson.content)}</div>
                    ${hasAttachments ? `
                        <div class="card-attachments">
                            <i class="fas fa-paperclip"></i> ${lesson.attachments.length} attachment${lesson.attachments.length !== 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>
                ${tagsHTML ? `<div class="lesson-card-footer">${tagsHTML}</div>` : ''}
            `;
            
            // Add event listeners
            lessonCard.querySelector('.actions-trigger').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleActionsMenu(e.currentTarget);
            });
            
            lessonCard.querySelector('.view-action').addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewLesson(e.currentTarget.dataset.id);
            });
            
            lessonCard.querySelector('.edit-action').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editLesson(e.currentTarget.dataset.id);
            });
            
            lessonCard.querySelector('.delete-action').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLesson(e.currentTarget.dataset.id);
            });
            
            if (lesson.important) {
                lessonCard.querySelector('.unmark-important-action').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleImportant(e.currentTarget.dataset.id);
                });
            } else {
                lessonCard.querySelector('.mark-important-action').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleImportant(e.currentTarget.dataset.id);
                });
            }
            
            // Make the whole card clickable to view the lesson
            lessonCard.addEventListener('click', () => {
                this.viewLesson(lesson.id);
            });
            
            lessonsDisplay.appendChild(lessonCard);
        });
        
        // Close action menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.actions-menu') && !e.target.closest('.actions-trigger')) {
                document.querySelectorAll('.actions-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });
    }
    
    renderListView(lessons) {
        const lessonsDisplay = document.getElementById('lessons-display');
        
        lessons.forEach(lesson => {
            const subject = lesson.subjectId 
                ? this.subjects.find(s => s.id === lesson.subjectId) 
                : null;
            
            const lessonRow = document.createElement('div');
            lessonRow.className = `lesson-row ${lesson.important ? 'important' : ''}`;
            lessonRow.setAttribute('data-id', lesson.id);
            
            // Format date
            const date = new Date(lesson.date);
            const dateStr = date.toLocaleDateString();
            
            lessonRow.innerHTML = `
                <div class="row-title">${lesson.title}</div>
                <div class="row-subject">${subject ? 
                    `<span class="row-subject" style="background-color: ${subject.color || '#4a6bdf'}">${subject.name}</span>` : 
                    'No Subject'
                }</div>
                <div class="row-date">${dateStr}</div>
                <div class="row-actions">
                    <button class="view-btn" data-id="${lesson.id}" title="View"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" data-id="${lesson.id}" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${lesson.id}" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Add event listeners
            lessonRow.querySelector('.view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewLesson(e.currentTarget.dataset.id);
            });
            
            lessonRow.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editLesson(e.currentTarget.dataset.id);
            });
            
            lessonRow.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLesson(e.currentTarget.dataset.id);
            });
            
            // Make the whole row clickable
            lessonRow.addEventListener('click', () => {
                this.viewLesson(lesson.id);
            });
            
            lessonsDisplay.appendChild(lessonRow);
        });
    }
    
    filterBySubject(subjectId) {
        this.currentSubjectFilter = subjectId;
        this.loadSubjects(); // Refresh sidebar to update active state
        this.loadLessons(); // Reload filtered lessons
    }
    
    searchLessons(query) {
        // Clear existing lessons
        const lessonsDisplay = document.getElementById('lessons-display');
        lessonsDisplay.innerHTML = '';
        
        if (!query.trim()) {
            this.loadLessons();
            return;
        }
        
        // Search by title, content, and tags
        let searchResults = this.lessons.filter(lesson => {
            const matchTitle = lesson.title.toLowerCase().includes(query.toLowerCase());
            const matchContent = lesson.content.toLowerCase().includes(query.toLowerCase());
            const matchTags = lesson.tags && lesson.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
            
            return matchTitle || matchContent || matchTags;
        });
        
        // Apply subject filter if set
        if (this.currentSubjectFilter) {
            searchResults = searchResults.filter(lesson => lesson.subjectId === this.currentSubjectFilter);
        }
        
        // Sort by date (newest first)
        searchResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (searchResults.length === 0) {
            lessonsDisplay.innerHTML = '<div class="empty-message">No matching lessons found.</div>';
            return;
        }
        
        // Render search results based on current view
        if (this.currentView === 'card-view') {
            this.renderCardView(searchResults);
        } else {
            this.renderListView(searchResults);
        }
    }
    
    applyFilters() {
        const subjectFilter = document.getElementById('filter-subject').value;
        const startDateFilter = document.getElementById('filter-start-date').value;
        const endDateFilter = document.getElementById('filter-end-date').value;
        const tagsFilter = document.getElementById('filter-tags').value.trim();
        
        // Start with all lessons
        let filteredLessons = [...this.lessons];
        
        // Apply subject filter
        if (subjectFilter) {
            filteredLessons = filteredLessons.filter(lesson => lesson.subjectId === subjectFilter);
        }
        
        // Apply date filters
        if (startDateFilter) {
            const startDate = new Date(startDateFilter);
            filteredLessons = filteredLessons.filter(lesson => new Date(lesson.date) >= startDate);
        }
        
        if (endDateFilter) {
            const endDate = new Date(endDateFilter);
            endDate.setHours(23, 59, 59, 999); // End of the day
            filteredLessons = filteredLessons.filter(lesson => new Date(lesson.date) <= endDate);
        }
        
        // Apply tags filter
        if (tagsFilter) {
            const tags = tagsFilter.split(',').map(tag => tag.trim().toLowerCase());
            filteredLessons = filteredLessons.filter(lesson => 
                lesson.tags && lesson.tags.some(tag => 
                    tags.includes(tag.toLowerCase())
                )
            );
        }
        
        // Display filtered lessons
        const lessonsDisplay = document.getElementById('lessons-display');
        lessonsDisplay.innerHTML = '';
        
        if (filteredLessons.length === 0) {
            lessonsDisplay.innerHTML = '<div class="empty-message">No matching lessons found.</div>';
            return;
        }
        
        // Sort by date (newest first)
        filteredLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render filtered lessons
        if (this.currentView === 'card-view') {
            this.renderCardView(filteredLessons);
        } else {
            this.renderListView(filteredLessons);
        }
    }
    
    resetFilters() {
        document.getElementById('filter-subject').value = '';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        document.getElementById('filter-tags').value = '';
        
        // Reset to current subject filter only
        if (this.currentSubjectFilter) {
            this.filterBySubject(this.currentSubjectFilter);
        } else {
            this.loadLessons();
        }
    }
    
    populateSubjectDropdowns() {
        // Populate the subject dropdown in the lesson form
        const lessonSubjectDropdown = document.getElementById('lesson-subject');
        
        // Clear existing options except the first one
        while (lessonSubjectDropdown.options.length > 1) {
            lessonSubjectDropdown.remove(1);
        }
        
        // Add each subject
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            lessonSubjectDropdown.appendChild(option);
        });
        
        // Populate the subject filter dropdown
        const filterSubjectDropdown = document.getElementById('filter-subject');
        
        // Clear existing options except the first one
        while (filterSubjectDropdown.options.length > 1) {
            filterSubjectDropdown.remove(1);
        }
        
        // Add each subject
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            filterSubjectDropdown.appendChild(option);
        });
    }
    
    showSubjectModal(subjectId = null) {
        const modal = document.getElementById('subject-modal');
        const modalTitle = document.getElementById('subject-modal-title');
        const subjectNameInput = document.getElementById('subject-name');
        const subjectDescriptionInput = document.getElementById('subject-description');
        
        // Reset form
        subjectNameInput.value = '';
        subjectDescriptionInput.value = '';
        
        // Reset color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.color-option[data-color="#4a6bdf"]').classList.add('selected');
        
        if (subjectId) {
            // Edit existing subject
            const subject = this.subjects.find(s => s.id === subjectId);
            if (subject) {
                this.currentEditingSubjectId = subjectId;
                modalTitle.textContent = 'Edit Subject';
                subjectNameInput.value = subject.name;
                subjectDescriptionInput.value = subject.description || '';
                
                // Select the correct color
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.toggle('selected', option.dataset.color === subject.color);
                });
                
                if (!document.querySelector('.color-option.selected')) {
                    // If no color is selected (custom color), select the first one
                    document.querySelector('.color-option').classList.add('selected');
                }
            }
        } else {
            // Add new subject
            this.currentEditingSubjectId = null;
            modalTitle.textContent = 'Add New Subject';
        }
        
        // Initialize color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });
        
        // Show modal
        modal.classList.add('active');
    }
    
    showLessonModal(lessonId = null) {
        const modal = document.getElementById('lesson-modal');
        const modalTitle = document.getElementById('lesson-modal-title');
        const lessonTitleInput = document.getElementById('lesson-title');
        const lessonSubjectSelect = document.getElementById('lesson-subject');
        const lessonContentInput = document.getElementById('lesson-content');
        const lessonTagsInput = document.getElementById('lesson-tags');
        const lessonImportantCheckbox = document.getElementById('lesson-important');
        
        // Reset form
        lessonTitleInput.value = '';
        lessonSubjectSelect.value = '';
        lessonContentInput.value = '';
        lessonTagsInput.value = '';
        lessonImportantCheckbox.checked = false;
        
        // Clear tags display
        document.getElementById('tags-display').innerHTML = '';
        
        // Clear attachments
        this.currentAttachments = [];
        document.getElementById('attachment-list').innerHTML = '';
        
        if (lessonId) {
            // Edit existing lesson
            const lesson = this.lessons.find(l => l.id === lessonId);
            if (lesson) {
                this.currentEditingId = lessonId;
                modalTitle.textContent = 'Edit Lesson';
                lessonTitleInput.value = lesson.title;
                lessonSubjectSelect.value = lesson.subjectId || '';
                lessonContentInput.value = lesson.content;
                lessonImportantCheckbox.checked = lesson.important || false;
                
                // Display tags
                if (lesson.tags && lesson.tags.length > 0) {
                    lesson.tags.forEach(tag => this.addTag(tag, false));
                }
                
                // Display attachments
                if (lesson.attachments && lesson.attachments.length > 0) {
                    this.currentAttachments = [...lesson.attachments];
                    this.displayAttachments();
                }
            }
        } else {
            // Add new lesson
            this.currentEditingId = null;
            modalTitle.textContent = 'Add New Lesson';
        }
        
        // Show modal
        modal.classList.add('active');
    }
    
    viewLesson(lessonId) {
        const modal = document.getElementById('view-lesson-modal');
        const lesson = this.lessons.find(l => l.id === lessonId);
        
        if (!lesson) return;
        
        this.currentViewId = lessonId;
        
        // Populate modal
        document.getElementById('view-lesson-title').textContent = lesson.title;
        
        // Set subject
        const subjectEl = document.getElementById('view-lesson-subject');
        if (lesson.subjectId) {
            const subject = this.subjects.find(s => s.id === lesson.subjectId);
            if (subject) {
                subjectEl.textContent = subject.name;
                subjectEl.style.backgroundColor = subject.color || '#4a6bdf';
                subjectEl.style.display = 'inline-block';
            } else {
                subjectEl.style.display = 'none';
            }
        } else {
            subjectEl.style.display = 'none';
        }
        
        // Set date
        const date = new Date(lesson.date);
        document.getElementById('view-lesson-date').textContent = `Created: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Set content
        document.getElementById('view-lesson-content').innerHTML = this.formatContent(lesson.content);
        
        // Set tags
        const tagsContainer = document.getElementById('view-lesson-tags');
        tagsContainer.innerHTML = '';
        
        if (lesson.tags && lesson.tags.length > 0) {
            lesson.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Set attachments
        const attachmentsContainer = document.getElementById('view-lesson-attachments');
        attachmentsContainer.innerHTML = '';
        
        if (lesson.attachments && lesson.attachments.length > 0) {
            lesson.attachments.forEach(attachment => {
                const attachmentElement = document.createElement('div');
                attachmentElement.className = 'attachment-item';
                
                let icon = 'fa-file';
                if (attachment.type.startsWith('image/')) icon = 'fa-file-image';
                else if (attachment.type.startsWith('video/')) icon = 'fa-file-video';
                else if (attachment.type.startsWith('audio/')) icon = 'fa-file-audio';
                else if (attachment.type === 'application/pdf') icon = 'fa-file-pdf';
                else if (attachment.type.includes('word')) icon = 'fa-file-word';
                else if (attachment.type.includes('excel') || attachment.type.includes('sheet')) icon = 'fa-file-excel';
                else if (attachment.type.includes('powerpoint') || attachment.type.includes('presentation')) icon = 'fa-file-powerpoint';
                
                attachmentElement.innerHTML = `
                    <div class="attachment-name">
                        <i class="fas ${icon}"></i>
                        ${attachment.name}
                    </div>
                    <a href="${attachment.dataUrl}" download="${attachment.name}" class="download-attachment">
                        <i class="fas fa-download"></i>
                    </a>
                `;
                
                attachmentsContainer.appendChild(attachmentElement);
            });
        }
        
        // Show modal
        modal.classList.add('active');
    }
    
    editViewedLesson() {
        const lessonId = this.currentViewId;
        if (lessonId) {
            // Close the view modal
            this.closeModal('view-lesson-modal');
            
            // Open the edit modal
            this.showLessonModal(lessonId);
        }
    }
    
    deleteViewedLesson() {
        const lessonId = this.currentViewId;
        if (lessonId) {
            if (confirm('Are you sure you want to delete this lesson?')) {
                // Delete the lesson
                this.deleteLesson(lessonId);
                
                // Close the view modal
                this.closeModal('view-lesson-modal');
            }
        }
    }
    
    editLesson(lessonId) {
        this.showLessonModal(lessonId);
    }
    
    deleteLesson(lessonId) {
        if (confirm('Are you sure you want to delete this lesson?')) {
            const index = this.lessons.findIndex(l => l.id === lessonId);
            if (index !== -1) {
                this.lessons.splice(index, 1);
                this.saveToLocalStorage();
                this.loadLessons();
            }
        }
    }
    
    toggleImportant(lessonId) {
        const index = this.lessons.findIndex(l => l.id === lessonId);
        if (index !== -1) {
            this.lessons[index].important = !this.lessons[index].important;
            this.saveToLocalStorage();
            this.loadLessons();
        }
    }
    
    saveSubject() {
        const nameEl = document.getElementById('subject-name');
        const descriptionEl = document.getElementById('subject-description');
        const selectedColorEl = document.querySelector('.color-option.selected');
        
        const name = nameEl.value.trim();
        const description = descriptionEl.value.trim();
        const color = selectedColorEl ? selectedColorEl.dataset.color : '#4a6bdf';
        
        if (!name) {
            alert('Please enter a subject name.');
            return;
        }
        
        const subject = {
            id: this.currentEditingSubjectId || Date.now().toString(),
            name: name,
            description: description,
            color: color,
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
        
        // Close modal
        this.closeModal('subject-modal');
        
        // Refresh subjects
        this.loadSubjects();
        this.populateSubjectDropdowns();
    }
    
    saveLesson() {
        const titleEl = document.getElementById('lesson-title');
        const subjectEl = document.getElementById('lesson-subject');
        const contentEl = document.getElementById('lesson-content');
        const importantEl = document.getElementById('lesson-important');
        
        const title = titleEl.value.trim();
        const subjectId = subjectEl.value;
        const content = contentEl.value.trim();
        const important = importantEl.checked;
        
        // Get tags from tag display
        const tags = [];
        document.querySelectorAll('#tags-display .tag-item').forEach(tag => {
            tags.push(tag.querySelector('.tag-text').textContent);
        });
        
        if (!title || !content) {
            alert('Please enter both a title and content for your lesson.');
            return;
        }
        
        const lesson = {
            id: this.currentEditingId || Date.now().toString(),
            title: title,
            content: content,
            subjectId: subjectId || null,
            date: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            tags: tags,
            important: important,
            attachments: this.currentAttachments
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
        
        // Close modal
        this.closeModal('lesson-modal');
        
        // Refresh lessons
        this.loadLessons();
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        
        // Reset editing state if needed
        if (modalId === 'lesson-modal') {
            this.currentEditingId = null;
            this.currentAttachments = [];
        } else if (modalId === 'subject-modal') {
            this.currentEditingSubjectId = null;
        }
    }
    
    toggleActionsMenu(trigger) {
        const menu = trigger.nextElementSibling;
        
        // Close all other open menus
        document.querySelectorAll('.actions-menu.active').forEach(m => {
            if (m !== menu) m.classList.remove('active');
        });
        
        // Toggle this menu
        menu.classList.toggle('active');
    }
    
    handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const attachment = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: e.target.result
                };
                
                this.currentAttachments.push(attachment);
                this.displayAttachments();
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    displayAttachments() {
        const attachmentList = document.getElementById('attachment-list');
        attachmentList.innerHTML = '';
        
        this.currentAttachments.forEach(attachment => {
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'attachment-item';
            
            let icon = 'fa-file';
            if (attachment.type.startsWith('image/')) icon = 'fa-file-image';
            else if (attachment.type.startsWith('video/')) icon = 'fa-file-video';
            else if (attachment.type.startsWith('audio/')) icon = 'fa-file-audio';
            else if (attachment.type === 'application/pdf') icon = 'fa-file-pdf';
            else if (attachment.type.includes('word')) icon = 'fa-file-word';
            else if (attachment.type.includes('excel') || attachment.type.includes('sheet')) icon = 'fa-file-excel';
            else if (attachment.type.includes('powerpoint') || attachment.type.includes('presentation')) icon = 'fa-file-powerpoint';
            
            attachmentItem.innerHTML = `
                <div class="attachment-name">
                    <i class="fas ${icon}"></i>
                    ${attachment.name}
                </div>
                <button class="remove-attachment" data-id="${attachment.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            attachmentItem.querySelector('.remove-attachment').addEventListener('click', () => {
                this.removeAttachment(attachment.id);
            });
            
            attachmentList.appendChild(attachmentItem);
        });
    }
    
    removeAttachment(id) {
        const index = this.currentAttachments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.currentAttachments.splice(index, 1);
            this.displayAttachments();
        }
    }
    
    addTag(tag, refreshInput = true) {
        if (!tag) return;
        
        // Remove commas and extra spaces
        tag = tag.replace(/,/g, '').trim();
        
        if (tag) {
            const tagsDisplay = document.getElementById('tags-display');
            
            // Check if tag already exists
            const existingTags = tagsDisplay.querySelectorAll('.tag-text');
            for (let i = 0; i < existingTags.length; i++) {
                if (existingTags[i].textContent.toLowerCase() === tag.toLowerCase()) {
                    return; // Tag already exists
                }
            }
            
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span class="tag-text">${tag}</span>
                <button class="remove-tag">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            tagItem.querySelector('.remove-tag').addEventListener('click', () => {
                tagItem.remove();
            });
            
            tagsDisplay.appendChild(tagItem);
            
            // Clear the input
            if (refreshInput) {
                document.getElementById('lesson-tags').value = '';
            }
        }
    }
    
    handleToolbarAction(action) {
        const textarea = document.getElementById('lesson-content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        
        switch (action) {
            case 'bold':
                replacement = `**${selectedText}**`;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                break;
            case 'underline':
                replacement = `__${selectedText}__`;
                break;
            case 'heading':
                replacement = `\n# ${selectedText}\n`;
                break;
            case 'list-ul':
                replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
                break;
            case 'list-ol':
                replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
                break;
            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) replacement = `[${selectedText || 'link text'}](${url})`;
                break;
            case 'image':
                const imgUrl = prompt('Enter image URL:', 'https://');
                if (imgUrl) replacement = `![${selectedText || 'image alt text'}](${imgUrl})`;
                break;
            case 'code':
                replacement = selectedText.includes('\n') 
                    ? `\`\`\`\n${selectedText}\n\`\`\``
                    : `\`${selectedText}\``;
                break;
        }
        
        if (replacement) {
            textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
            textarea.focus();
            
            // Set cursor position after the inserted text
            const newPosition = start + replacement.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }
    }
    
    exportCurrentLesson() {
        const titleInput = document.getElementById('lesson-title');
        const contentInput = document.getElementById('lesson-content');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            alert('Please enter both a title and content before exporting.');
            return;
        }
        
        // Create markdown content
        let markdown = `# ${title}\n\n`;
        
        // Add date
        markdown += `*Created: ${new Date().toLocaleDateString()}*\n\n`;
        
        // Add content
        markdown += content;
        
        // Create a Blob with the markdown content
        const blob = new Blob([markdown], { type: 'text/markdown' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
    }
    
    truncateContent(content, length = 150) {
        if (!content) return '';
        if (content.length <= length) return content;
        return content.substring(0, length) + '...';
    }
    
    formatContent(content) {
        if (!content) return '';
        
        // Replace markdown with HTML
        let html = content
            // Headers
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            
            // Bold, italic, underline
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/__(.+?)__/g, '<u>$1</u>')
            
            // Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(^<li>.+<\/li>$\n)+/gm, '<ul>$&</ul>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/(^<li>.+<\/li>$\n)+/gm, '<ol>$&</ol>')
            
            // Links and images
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">')
            
            // Code
            .replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            
            // Preserve line breaks inside paragraphs
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraphs if not already wrapped
        if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>') && !html.startsWith('<p>')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }
    
    saveToLocalStorage() {
        localStorage.setItem('lessons', JSON.stringify(this.lessons));
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lessonContentManager = new LessonContentManager();
}); 