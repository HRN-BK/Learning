// Global variables
let questions = [];
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let feedbackMode = 'instant';
let questionCount = 'all';
let quizStarted = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const resultsScreen = document.getElementById('results-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress-bar');
const questionProgress = document.getElementById('question-progress');
const scoreDisplay = document.getElementById('score-display');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const finalScore = document.getElementById('final-score');
const scorePercentage = document.getElementById('score-percentage');
const reviewQuestions = document.getElementById('review-questions');

// Start Quiz Button
document.getElementById('start-quiz').addEventListener('click', startQuiz);

// Navigation Buttons
prevBtn.addEventListener('click', goToPreviousQuestion);
nextBtn.addEventListener('click', goToNextQuestion);
submitBtn.addEventListener('click', confirmSubmit);

// Retake and New Quiz Buttons
document.getElementById('retake-quiz').addEventListener('click', retakeQuiz);
document.getElementById('new-quiz').addEventListener('click', showStartScreen);

// Initialize the app
init();

// Functions
async function init() {
    try {
        // Show a loading indicator and log the path
        console.log('Attempting to load questions from quiz-app/data/questions.json...');
        
        // Try different paths to find the correct one
        let response;
        try {
            // Try relative path with more explicit directory structure
            response = await fetch('./data/questions.json');
            if (!response.ok) throw new Error('First path failed');
        } catch (e) {
            console.log('Trying alternate path...');
            // Try without leading ./
            response = await fetch('data/questions.json');
            if (!response.ok) throw new Error('Second path failed');
        }
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
        }
        
        console.log('Successfully fetched questions.json');
        
        // Try to parse the JSON
        let data;
        try {
            data = await response.json();
            console.log('Successfully parsed JSON data');
        } catch (parseError) {
            throw new Error(`Failed to parse JSON: ${parseError.message}. Check if your questions.json is valid JSON.`);
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
            // Successfully loaded questions from JSON
            questions = data;
            console.log(`Successfully loaded ${questions.length} questions from JSON file`);
            
            // Log the first question for debugging
            console.log('First question sample:', JSON.stringify(questions[0]).substring(0, 100) + '...');
            
            // Remove any warning messages if present
            const warningMsg = document.querySelector('.bg-yellow-100');
            if (warningMsg) {
                warningMsg.remove();
            }
            
            // Update the dropdown options to show the actual available count
            const questionCountSelect = document.getElementById('question-count');
            const maxQuestions = Math.min(100, questions.length);
            
            // Update "All Questions" option
            questionCountSelect.querySelector('option[value="all"]').textContent = `All Questions (${questions.length})`;
            
            // Disable options that exceed the available count
            Array.from(questionCountSelect.options).forEach(option => {
                if (option.value !== 'all') {
                    const count = parseInt(option.value);
                    if (count > questions.length) {
                        option.disabled = true;
                        option.textContent += ' (exceeds available)';
                    }
                }
            });
        } else {
            throw new Error('Questions data is empty or malformed. Please check your JSON structure.');
        }
    } catch (error) {
        console.error('Error loading questions from JSON:', error);
        
        // Add sample question as fallback so users can still test the app
        questions = [
            {
                "question": "Đối tượng nghiên cứu môn học giáo dục quốc phòng, an ninh:",
                "options": {
                    "a": "Nghiên cứu về chiến lược xây dựng và bảo vệ Tổ quốc của Đảng, Nhà nước trong tình hình mới.",
                    "b": "Nghiên cứu về đường lối quân sự của Đảng, Công tác quốc phòng an ninh, Quân sự và kỹ năng quân sự cần thiết.",
                    "c": "Nghiên cứu về chiến lược kinh tế, quốc phòng của Đảng, Nhà nước trong sự nghiệp đổi mới.",
                    "d": "Nghiên cứu về chiến lược kinh tế, quốc phòng, an ninh và đối ngoại của Đảng, Nhà nước."
                },
                "answer": "b",
                "lesson": "Bài C1: Đối tượng, phương pháp nghiên cứu môn học giáo dục quốc phòng - an ninh",
                "order": "1.1"
            }
        ];
        
        // Show warning instead of error to let users continue with sample question
        const warningMessage = document.createElement('div');
        warningMessage.className = 'bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4';
        warningMessage.innerHTML = `
            <p><strong>Warning:</strong> Using sample question because we couldn't load your questions.json file.</p>
            <p class="mt-2">To fix this:</p>
            <ol class="list-decimal ml-5 mt-1">
                <li>Check that your questions.json file is in the correct location (quiz-app/data/questions.json)</li>
                <li>Verify that the JSON is properly formatted</li>
            </ol>
            <p class="mt-2 text-sm">Technical details: ${error.message}</p>
        `;
        
        // Insert at the top of the start screen
        const existingWarning = document.querySelector('.bg-yellow-100');
        if (!existingWarning) {
            startScreen.insertBefore(warningMessage, startScreen.firstChild);
        }
        
        console.log('Using sample question as fallback');
    }
    
    // Add submit button to the navigation bar
    const submitAnyTimeBtn = document.createElement('button');
    submitAnyTimeBtn.id = 'submit-anytime-btn';
    submitAnyTimeBtn.classList.add('bg-green-600', 'text-white', 'py-3', 'px-4', 'rounded-lg', 'hover:bg-green-700', 'text-lg', 'font-medium');
    submitAnyTimeBtn.textContent = 'Submit Quiz';
    submitAnyTimeBtn.addEventListener('click', confirmSubmit);
    submitAnyTimeBtn.disabled = true;
    submitAnyTimeBtn.classList.add('opacity-50');
    
    // Add back button to return to start screen
    const backBtn = document.createElement('button');
    backBtn.id = 'back-to-start-btn';
    backBtn.classList.add('bg-gray-500', 'text-white', 'py-3', 'px-4', 'rounded-lg', 'hover:bg-gray-600', 'text-lg', 'font-medium', 'mb-4', 'w-full', 'sm:w-auto');
    backBtn.textContent = '← Back to Settings';
    backBtn.addEventListener('click', () => {
        if (quizStarted) {
            if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
                showStartScreen();
            }
        } else {
            showStartScreen();
        }
    });
    
    // Add the back button to the top of the quiz container
    const topNav = document.createElement('div');
    topNav.classList.add('mb-4');
    topNav.appendChild(backBtn);
    quizContainer.insertBefore(topNav, quizContainer.firstChild);
    
    // Add submit anytime button to the navigation section
    const navSection = document.querySelector('#quiz-container .flex');
    if (navSection) {
        navSection.appendChild(submitAnyTimeBtn);
    }
}

function startQuiz() {
    // Check if questions are available
    if (questions.length === 0) {
        alert('No questions available. Please check your connection and try again.');
        return;
    }
    
    // Add fade-in animation
    quizContainer.classList.add('fade-in');
    
    // Get settings
    feedbackMode = document.querySelector('input[name="feedback-mode"]:checked').value;
    questionCount = document.getElementById('question-count').value;
    
    console.log(`Starting quiz with ${questionCount === 'all' ? 'all' : questionCount} questions...`);
    
    // Track that quiz has started
    quizStarted = true;
    
    // Shuffle and prepare questions
    shuffleQuestions();
    
    // Check if we have questions after shuffling (the shuffle function might filter them)
    if (shuffledQuestions.length === 0) {
        return; // The shuffle function already shows an alert if there are no questions
    }
    
    console.log(`After shuffling, using ${shuffledQuestions.length} questions for this quiz.`);
    
    // Reset quiz state
    currentQuestionIndex = 0;
    userAnswers = Array(shuffledQuestions.length).fill(null);
    score = 0;
    
    // Show quiz container, hide start screen
    startScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    
    // Make sure the navigation buttons are visible
    const navButtons = document.querySelector('#quiz-container .flex');
    if (navButtons) {
        navButtons.classList.remove('hidden');
    }
    
    // Display the first question
    displayQuestion();
    updateProgressBar();
    updateNavigationButtons();
}

function shuffleQuestions() {
    // Create a copy of the questions array
    const questionsCopy = [...questions];
    
    // Check if we have questions
    if (questionsCopy.length === 0) {
        alert('No questions available. Please check your connection and try again.');
        return;
    }
    
    console.log(`Shuffling ${questionsCopy.length} questions...`);

    // Fisher-Yates shuffle algorithm for thorough randomization
    for (let i = questionsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
    }
    
    // Limit number of questions if needed
    if (questionCount !== 'all') {
        const count = parseInt(questionCount);
        // Make sure we don't try to take more questions than available
        const validCount = Math.min(count, questionsCopy.length);
        shuffledQuestions = questionsCopy.slice(0, validCount);
        
        console.log(`Selected ${validCount} questions from ${questionsCopy.length} available questions`);
    } else {
        shuffledQuestions = questionsCopy;
        console.log(`Using all ${questionsCopy.length} available questions`);
    }
    
    // Verify we got the right number of questions
    console.log(`Final shuffled question count: ${shuffledQuestions.length}`);
    
    // Shuffle options for each question
    shuffledQuestions.forEach(question => {
        // Get the correct answer value
        const correctAnswer = question.answer;
        
        // Create an array of option keys (a, b, c, d)
        const optionKeys = Object.keys(question.options);
        
        // Create an array of objects containing key-value pairs
        const optionPairs = optionKeys.map(key => ({
            key: key,
            value: question.options[key]
        }));
        
        // Shuffle the array of option pairs
        for (let i = optionPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionPairs[i], optionPairs[j]] = [optionPairs[j], optionPairs[i]];
        }
        
        // Create a new options object with the shuffled pairs
        const shuffledOptions = {};
        optionPairs.forEach((pair, index) => {
            const newKey = optionKeys[index];
            shuffledOptions[newKey] = pair.value;
            
            // If this was the correct answer, update the correct answer letter
            if (pair.key === correctAnswer) {
                question.answer = newKey;
            }
        });
        
        // Update the question with shuffled options
        question.options = shuffledOptions;
    });
    
    // If no questions could be loaded or selected, show an error
    if (shuffledQuestions.length === 0) {
        alert('No questions available for the quiz. Please try again.');
        showStartScreen();
    }
}

function displayQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    
    // Set question text
    questionText.textContent = question.question;
    
    // Add lesson/category if available
    // First, remove any existing lesson element
    const existingLesson = questionText.querySelector('.text-sm');
    if (existingLesson) {
        existingLesson.remove();
    }
    
    if (question.lesson) {
        const lessonElement = document.createElement('div');
        lessonElement.classList.add('text-sm', 'text-gray-500', 'mt-1');
        lessonElement.textContent = question.lesson;
        questionText.appendChild(lessonElement);
    }
    
    // Clear options container
    optionsContainer.innerHTML = '';
    
    // Create option buttons
    Object.keys(question.options).forEach((optionKey) => {
        const optionValue = question.options[optionKey];
        const optionButton = document.createElement('button');
        optionButton.classList.add('option-btn', 'w-full', 'text-left', 'p-3', 'border', 'rounded', 'hover:bg-gray-100');
        optionButton.innerHTML = `<span class="font-bold mr-2">${optionKey.toUpperCase()}:</span> ${optionValue}`;
        
        // Check if this option was previously selected
        const userAnswer = userAnswers[currentQuestionIndex];
        if (userAnswer === optionKey) {
            optionButton.classList.add('selected');
        }
        
        // Add feedback colors if in instant feedback mode and answer was selected
        if (feedbackMode === 'instant' && userAnswer !== null) {
            if (optionKey === question.answer) {
                optionButton.classList.add('correct-answer');
            } else if (userAnswer === optionKey) {
                optionButton.classList.add('wrong-answer');
            }
        }
        
        // Add click event
        optionButton.addEventListener('click', () => selectOption(optionKey));
        
        optionsContainer.appendChild(optionButton);
    });
    
    // Update progress text
    questionProgress.textContent = `Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}`;
    
    // Update score display
    scoreDisplay.textContent = `Score: ${score}/${shuffledQuestions.length}`;
}

function selectOption(optionKey) {
    // Remove selected class from all options
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    // Add selected class to the clicked option
    const selectedIndex = Array.from(Object.keys(shuffledQuestions[currentQuestionIndex].options)).indexOf(optionKey);
    optionButtons[selectedIndex].classList.add('selected');
    
    // Store user's answer
    const previousAnswer = userAnswers[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = optionKey;
    
    // Update score if needed (only if changing from wrong to right or right to wrong)
    const question = shuffledQuestions[currentQuestionIndex];
    const isCorrect = optionKey === question.answer;
    
    if (previousAnswer === null) {
        // First time answering
        if (isCorrect) score++;
    } else if (previousAnswer === question.answer && !isCorrect) {
        // Changed from correct to incorrect
        score--;
    } else if (previousAnswer !== question.answer && isCorrect) {
        // Changed from incorrect to correct
        score++;
    }
    
    // Update the display
    updateNavigationButtons();
    
    // If in instant feedback mode, provide immediate feedback
    if (feedbackMode === 'instant') {
        optionButtons.forEach((button, index) => {
            const buttonKey = Object.keys(question.options)[index];
            
            if (buttonKey === question.answer) {
                button.classList.add('correct-answer', 'feedback-animation');
            } else if (buttonKey === optionKey && buttonKey !== question.answer) {
                button.classList.add('wrong-answer', 'feedback-animation');
            }
        });
        
        // Show explanation if available and in instant feedback mode
        if (question.explanation) {
            const existingExplanation = document.querySelector('.explanation-box');
            if (existingExplanation) {
                existingExplanation.remove();
            }
            
            const explanationBox = document.createElement('div');
            explanationBox.classList.add('explanation-box', 'mt-4', 'p-3', 'bg-blue-50', 'border', 'border-blue-200', 'rounded', 'text-sm');
            explanationBox.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
            optionsContainer.appendChild(explanationBox);
        }
        
        // Auto-advance to next question after a delay if not the last question
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setTimeout(() => {
                if (currentQuestionIndex < shuffledQuestions.length - 1) {
                    goToNextQuestion();
                }
            }, 1500);
        }
    }
    
    // Update score display
    scoreDisplay.textContent = `Score: ${score}/${shuffledQuestions.length}`;
    
    // Enable submit anytime button once at least one question is answered
    document.getElementById('submit-anytime-btn').disabled = false;
    document.getElementById('submit-anytime-btn').classList.remove('opacity-50');
    
    // Update progress bar after answering
    updateProgressBar();
}

function updateProgressBar() {
    // Calculate how many questions have been answered
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progress = (answeredCount / shuffledQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateNavigationButtons() {
    // Disable previous button on first question
    prevBtn.disabled = currentQuestionIndex === 0;
    prevBtn.classList.toggle('opacity-50', currentQuestionIndex === 0);
    
    // Show/hide main submit button on last question
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
    
    // Always show the submit anytime button, but disable it if no questions answered
    const anyAnswered = userAnswers.some(answer => answer !== null);
    const submitAnyTimeBtn = document.getElementById('submit-anytime-btn');
    if (submitAnyTimeBtn) {
        submitAnyTimeBtn.disabled = !anyAnswered;
        submitAnyTimeBtn.classList.toggle('opacity-50', !anyAnswered);
    }
    
    // Update score display
    scoreDisplay.textContent = `Score: ${score}/${shuffledQuestions.length}`;
}

function goToNextQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateProgressBar();
        updateNavigationButtons();
        
        // Scroll to top of question for better UX on mobile
        window.scrollTo(0, 0);
    }
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateProgressBar();
        updateNavigationButtons();
        
        // Scroll to top of question for better UX on mobile
        window.scrollTo(0, 0);
    }
}

function confirmSubmit() {
    // Count answered questions
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const totalCount = shuffledQuestions.length;
    
    // If not all questions are answered, confirm before submitting
    if (answeredCount < totalCount) {
        const unansweredCount = totalCount - answeredCount;
        if (confirm(`You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit the quiz?`)) {
            submitQuiz();
        }
    } else {
        submitQuiz();
    }
}

function submitQuiz() {
    // Reset quiz started flag
    quizStarted = false;
    
    // Add fade-in animation
    resultsScreen.classList.add('fade-in');
    
    // Calculate final score if in end feedback mode
    if (feedbackMode === 'end') {
        score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === shuffledQuestions[index].answer) {
                score++;
            }
        });
    }
    
    // Calculate stats
    const totalQuestions = shuffledQuestions.length;
    const correctCount = score;
    const incorrectCount = userAnswers.filter((answer, index) => 
        answer !== null && answer !== shuffledQuestions[index].answer
    ).length;
    const unansweredCount = totalQuestions - (correctCount + incorrectCount);
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Display results
    finalScore.textContent = `${score}/${totalQuestions}`;
    scorePercentage.textContent = `${percentage}%`;
    
    // Clear previous summary content
    const resultsSummary = document.getElementById('results-summary');
    resultsSummary.innerHTML = '';
    
    // Build enhanced summary
    const summaryContent = document.createElement('div');
    summaryContent.innerHTML = `
        <p class="text-xl mb-2">Your score: <span class="font-bold">${score}/${totalQuestions}</span></p>
        <p class="text-xl mb-2">Percentage: <span class="font-bold">${percentage}%</span></p>
        <div class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div class="bg-green-100 p-2 rounded">
                <p class="text-sm">Correct</p>
                <p class="text-xl font-bold text-green-600">${correctCount}</p>
            </div>
            <div class="bg-red-100 p-2 rounded">
                <p class="text-sm">Incorrect</p>
                <p class="text-xl font-bold text-red-600">${incorrectCount}</p>
            </div>
            <div class="bg-gray-100 p-2 rounded">
                <p class="text-sm">Unanswered</p>
                <p class="text-xl font-bold text-gray-600">${unansweredCount}</p>
            </div>
        </div>
    `;
    resultsSummary.appendChild(summaryContent);
    
    // Add performance message based on score
    const performanceMessage = document.createElement('p');
    performanceMessage.classList.add('text-lg', 'mt-4', 'font-medium');
    
    if (percentage >= 90) {
        performanceMessage.textContent = 'Excellent job! You have mastered this material.';
        performanceMessage.classList.add('text-green-600');
    } else if (percentage >= 70) {
        performanceMessage.textContent = 'Great work! You are doing well.';
        performanceMessage.classList.add('text-green-500');
    } else if (percentage >= 50) {
        performanceMessage.textContent = 'Good effort. Keep practicing to improve further.';
        performanceMessage.classList.add('text-yellow-600');
    } else {
        performanceMessage.textContent = 'Keep practicing. You will get better with more study.';
        performanceMessage.classList.add('text-red-500');
    }
    
    resultsSummary.appendChild(performanceMessage);
    
    // Hide quiz container, show results
    quizContainer.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    // Generate review items
    reviewQuestions.innerHTML = '';
    
    // Add a filter/sorting option
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('mb-4', 'flex', 'flex-wrap', 'gap-2', 'items-center');
    filterContainer.innerHTML = `
        <span class="text-sm font-medium">Filter:</span>
        <button class="filter-btn px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300" data-filter="all">All Questions</button>
        <button class="filter-btn px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300" data-filter="correct">Correct Only</button>
        <button class="filter-btn px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300" data-filter="incorrect">Incorrect Only</button>
        <button class="filter-btn px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300" data-filter="unanswered">Unanswered Only</button>
    `;
    
    // Add event listeners to filter buttons
    const filterBtns = filterContainer.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('bg-blue-500', 'text-white'));
            
            // Add active class to clicked button
            btn.classList.add('bg-blue-500', 'text-white');
            
            // Get filter value
            const filter = btn.dataset.filter;
            
            // Filter review items
            document.querySelectorAll('.review-item').forEach(item => {
                if (filter === 'all') {
                    item.classList.remove('hidden');
                } else if (filter === 'correct' && item.classList.contains('correct')) {
                    item.classList.remove('hidden');
                } else if (filter === 'incorrect' && item.classList.contains('incorrect')) {
                    item.classList.remove('hidden');
                } else if (filter === 'unanswered' && item.classList.contains('unanswered')) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
    
    // Set "All Questions" as active by default
    filterBtns[0].classList.add('bg-blue-500', 'text-white');
    
    // Prepend filter container to review questions
    reviewQuestions.prepend(filterContainer);
    
    // Generate review items for each question
    shuffledQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        const isUnanswered = userAnswer === null;
        
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item', 'p-4', 'border', 'rounded-lg');
        
        // Add appropriate class for filtering
        if (isUnanswered) {
            reviewItem.classList.add('unanswered', 'bg-gray-50');
        } else if (isCorrect) {
            reviewItem.classList.add('correct', 'bg-green-50', 'border-green-200');
        } else {
            reviewItem.classList.add('incorrect', 'bg-red-50', 'border-red-200');
        }
        
        // Question text with status indicator
        let statusIndicator = '';
        if (isUnanswered) {
            statusIndicator = '<span class="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded ml-2">Not Answered</span>';
        } else if (isCorrect) {
            statusIndicator = '<span class="inline-block px-2 py-1 text-xs bg-green-200 text-green-800 rounded ml-2">Correct</span>';
        } else {
            statusIndicator = '<span class="inline-block px-2 py-1 text-xs bg-red-200 text-red-800 rounded ml-2">Incorrect</span>';
        }
        
        reviewItem.innerHTML = `
            <div class="font-medium">Question ${index + 1} ${statusIndicator}</div>
            <p class="my-2">${question.question}</p>
            <div class="mt-3 space-y-2">
        `;
        
        // Add all options
        Object.keys(question.options).forEach(key => {
            const optionValue = question.options[key];
            let optionClass = 'p-2 rounded';
            
            if (key === question.answer) {
                optionClass += ' bg-green-100 border-green-300 border';
            } else if (key === userAnswer && key !== question.answer) {
                optionClass += ' bg-red-100 border-red-300 border';
            } else {
                optionClass += ' bg-gray-50 border-gray-200 border';
            }
            
            reviewItem.innerHTML += `
                <div class="${optionClass}">
                    <span class="font-medium">${key.toUpperCase()}:</span> ${optionValue}
                    ${key === question.answer ? ' <span class="text-green-600 text-sm font-medium">(Correct Answer)</span>' : ''}
                    ${key === userAnswer && key !== question.answer ? ' <span class="text-red-600 text-sm font-medium">(Your Answer)</span>' : ''}
                </div>
            `;
        });
        
        reviewItem.innerHTML += `</div>`;
        
        // Add explanation if available
        if (question.explanation) {
            reviewItem.innerHTML += `
                <div class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            `;
        }
        
        // Add lesson information if available
        if (question.lesson) {
            reviewItem.innerHTML += `
                <div class="mt-2 text-sm text-gray-500">
                    ${question.lesson}
                </div>
            `;
        }
        
        reviewQuestions.appendChild(reviewItem);
    });
}

function retakeQuiz() {
    // Check if we have questions
    if (shuffledQuestions.length === 0) {
        alert('No questions available. Please check your connection and try again.');
        showStartScreen();
        return;
    }
    
    // Add fade-in animation
    quizContainer.classList.add('fade-in');
    
    // Reset current quiz with same questions but reshuffled options
    currentQuestionIndex = 0;
    userAnswers = Array(shuffledQuestions.length).fill(null);
    score = 0;
    quizStarted = true;
    
    // Reshuffle options for each question
    shuffledQuestions.forEach(question => {
        // Get the correct answer value
        const correctAnswer = question.answer;
        
        // Create an array of option keys (a, b, c, d)
        const optionKeys = Object.keys(question.options);
        
        // Create an array of objects containing key-value pairs
        const optionPairs = optionKeys.map(key => ({
            key: key,
            value: question.options[key]
        }));
        
        // Shuffle the array of option pairs
        for (let i = optionPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionPairs[i], optionPairs[j]] = [optionPairs[j], optionPairs[i]];
        }
        
        // Create a new options object with the shuffled pairs
        const shuffledOptions = {};
        optionPairs.forEach((pair, index) => {
            const newKey = optionKeys[index];
            shuffledOptions[newKey] = pair.value;
            
            // If this was the correct answer, update the correct answer letter
            if (pair.key === correctAnswer) {
                question.answer = newKey;
            }
        });
        
        // Update the question with shuffled options
        question.options = shuffledOptions;
    });
    
    // Show quiz container, hide results screen
    resultsScreen.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    // Make sure navigation buttons are visible
    const navButtons = document.querySelector('#quiz-container .flex');
    if (navButtons) {
        navButtons.classList.remove('hidden');
    }
    
    // Display first question
    displayQuestion();
    updateProgressBar();
    updateNavigationButtons();
    
    // Scroll to top for better UX
    window.scrollTo(0, 0);
}

function showStartScreen() {
    // Add fade-in animation
    startScreen.classList.add('fade-in');
    
    // Reset quiz state
    quizStarted = false;
    
    // Reset everything and show start screen
    startScreen.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    // Scroll to top for better UX
    window.scrollTo(0, 0);
}
