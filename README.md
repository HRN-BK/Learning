# Quiz App

A responsive web-based quiz application that presents users with randomized multiple-choice questions. Built with HTML, CSS, and JavaScript.

## Features

- Loads questions from a JSON file
- Randomizes questions and answer options for each quiz attempt
- Allows selecting different quantities of questions (20, 50, or all)
- Filters questions by lesson/category
- Responsive design works on both desktop and mobile devices
- Real-time progress tracking
- Visual feedback on correct and incorrect answers
- Detailed results summary with score breakdown
- Review of all answers after quiz completion
- Download results as a text file

## How to Run the App

### Method 1: Using Node.js (Recommended)

If you have Node.js installed, you can run the included server:

1. Open a terminal/command prompt
2. Navigate to the quiz-app directory
3. Run the server with: `node server.js`
4. Open your browser and go to: `http://localhost:3000`

### Method 2: Using a Local Server

You can use any local server like:
- Visual Studio Code's Live Server extension
- Python's built-in HTTP server: `python -m http.server`
- PHP's built-in server: `php -S localhost:8000`

### Method 3: Directly Opening the HTML File

You can open `index.html` directly in a browser, but some browsers block loading local JSON files for security reasons. If questions don't load:

1. Try a different browser (Firefox tends to be more permissive with local files)
2. Use Method 1 or 2 instead

## Troubleshooting

### Questions Not Loading

If you're experiencing issues with questions not loading:

1. **Check the console**: Press F12 to open developer tools and look for error messages
2. **CORS issues**: If you see CORS errors, use the Node.js server method
3. **File path issues**: Make sure `questions.json` is in the correct location (root directory or in a `data` folder)
4. **JSON format**: Ensure your questions.json is properly formatted without syntax errors

### Common Fixes

- Make sure you have a valid `questions.json` file in the right location
- Use the included Node.js server to avoid CORS issues
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Try a different browser

## Customizing Questions

The quiz questions are stored in the `questions.json` file. You can add, modify, or delete questions by editing this file. Each question should follow this format:

```json
{
  "question": "Question text goes here?",
  "options": {
    "a": "First option",
    "b": "Second option",
    "c": "Third option",
    "d": "Fourth option"
  },
  "answer": "b",
  "lesson": "Lesson or category name",
  "explanation": "Optional explanation of the answer"
}
```

- `question`: The question text
- `options`: Object containing options labeled a, b, c, d
- `answer`: The correct answer key (a, b, c, or d)
- `lesson`: Optional category or lesson name for filtering
- `explanation`: Optional explanation of the correct answer

## Browser Compatibility

The app is compatible with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome) 