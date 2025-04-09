// Quiz state
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let quizStarted = false;
let questionAnswered = false;
let uniqueLessons = [];

// Settings
let feedbackMode = 'instant'; // 'instant' or 'end'
let darkMode = false;

// DOM Elements
const quizSettings = document.getElementById('quiz-settings');
const questionCountSelect = document.getElementById('question-count');
const lessonFilterSelect = document.getElementById('lesson-filter');
const startQuizButton = document.getElementById('start-quiz');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const quizContainer = document.getElementById('quiz-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const submitQuizButton = document.getElementById('submit-quiz');
const resultsContainer = document.getElementById('results-container');
const totalScore = document.getElementById('total-score');
const correctAnswers = document.getElementById('correct-answers');
const incorrectAnswers = document.getElementById('incorrect-answers');
const restartQuizButton = document.getElementById('restart-quiz');
const downloadResultsButton = document.getElementById('download-results');
const keyboardHelp = document.getElementById('keyboard-help');

// New DOM Elements
let prevButton; // Will be created dynamically
let feedbackContainer; // Will be created dynamically
let returnHomeButton; // Will be created dynamically
let themeToggleButton; // Will be created dynamically
let feedbackModeToggle; // Will be created dynamically

// Fetch questions from JSON file
async function fetchQuestions() {
    // Define possible paths to try
    const possiblePaths = [
        'data/questions.json',     // Data subdirectory without leading ./
        './data/questions.json',   // In a data subdirectory 
        '../data/questions.json',  // One level up with data subdirectory
        '/data/questions.json',    // Root with data subdirectory
        './questions.json',        // In the same directory as HTML
        'questions.json'           // Simple filename
    ];
    
    let loaded = false;
    
    // Add visible message to the UI while loading
    questionText.textContent = "Đang tải câu hỏi...";
    
    // Try each path until successful
    for (const path of possiblePaths) {
        if (loaded) break;
        
        try {
            console.log(`Trying to fetch from: ${path}`);
            
            // Use a timestamp to avoid cache issues
            const cacheBuster = `?t=${new Date().getTime()}`;
            const response = await fetch(`${path}${cacheBuster}`);
            
            // Check for HTTP errors
            if (!response.ok) {
                console.log(`Path ${path} did not work. Status: ${response.status} ${response.statusText}`);
                continue;
            }
            
            // Try to parse the response as JSON
            try {
                const jsonData = await response.json();
                
                // Validate that the data is an array and has at least one question
                if (!Array.isArray(jsonData) || jsonData.length === 0) {
                    console.error(`Invalid data format from ${path}. Expected non-empty array.`);
                    continue;
                }
                
                // Check that the first item has required fields
                const firstItem = jsonData[0];
                if (!firstItem.question || !firstItem.options || !firstItem.answer) {
                    console.error(`Invalid question format from ${path}. Missing required fields.`);
                    continue;
                }
                
                allQuestions = jsonData;
                console.log(`Questions loaded successfully from ${path}:`, allQuestions.length);
                loaded = true;
                
                // Extract and populate lessons
                extractLessons();
            } catch (parseError) {
                console.error(`Error parsing JSON from ${path}:`, parseError);
            }
            
        } catch (error) {
            console.error(`Error fetching from ${path}:`, error.message);
        }
    }
    
    // If all paths failed, use fallback
    if (!loaded) {
        console.error('All paths failed. Using fallback questions');
        
        // Try to load the fallback questions from an inline script
        // This prevents caching issues that may occur with external files
        allQuestions = [
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
          },
  {
    "question": "Quá trình nghiên cứu môn học giáo dục quốc phòng, an ninh phải nắm vững và vận dụng đúng đắn các quan điểm tiếp cận khoa học:",
    "options": {
      "a": "Hệ thống, lịch sử, logic, thực tiễn.",
      "b": "Khách quan, lịch sử, toàn diện.",
      "c": "Hệ thống, biện chứng, lịch sử, logic.",
      "d": "Lịch sử, cụ thể biện chứng."
    },
    "answer": "c",
    "lesson": "Bài C1: Đối tượng, phương pháp nghiên cứu môn học giáo dục quốc phòng - an ninh",
    "order": "1.2"
  },
  {
    "question": "Các phương pháp nghiên cứu môn học giáo dục quốc phòng, an ninh:",
    "options": {
      "a": "Nghiên cứu lý thuyết, nghiên cứu thực tiễn.",
      "b": "Nghiên cứu tập trung, kết hợp với thảo luận nhóm.",
      "c": "Kết hợp các phương pháp dạy học lý thuyết và thực hành.",
      "d": "Cả A và C."
    },
    "answer": "d",
    "lesson": "Bài C1: Đối tượng, phương pháp nghiên cứu môn học giáo dục quốc phòng - an ninh",
    "order": "1.3"
  },


  {
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin về chiến tranh:",
    "options": {
      "a": "Là một hiện tượng chính trị xã hội có tính lịch sử.",
      "b": "Là những cuộc xung đột tự phát ngẫu nhiên.",
      "c": "Là một hiện tượng xã hội mang tính vĩnh viễn.",
      "d": "Là những xung đột do những mâu thuẫn không mang tính xã hội."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.1"
  },
  {
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin về nguồn gốc của chiến tranh:",
    "options": {
      "a": "Chiến tranh bắt nguồn từ khi xuất hiện xã hội loài người.",
      "b": "Chiến tranh bắt nguồn từ khi xuất hiện chế độ tư hữu, có giai cấp và nhà nước.",
      "c": "Chiến tranh bắt nguồn từ khi xuất hiện yếu tố khách quan của loài người.",
      "d": "Chiến tranh bắt nguồn từ khi xuất hiện những hiện tượng tôn giáo."
    },
    "answer": "b",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.2"
  },
  {
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin về bản chất của chiến tranh:",
    "options": {
      "a": "Là tiếp tục mục tiêu kinh tế bằng thủ đoạn bạo lực.",
      "b": "Là thủ đoạn để đạt được mục tiêu của một giai cấp.",
      "c": "Là tiếp tục của chính trị bằng thủ đoạn bạo lực.",
      "d": "Là thủ đoạn chính trị của một giai cấp."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.3"
  },
  {
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin, chính trị là sự phản ánh tập trung của:",
    "options": {
      "a": "Kinh tế.",
      "b": "Xã hội.",
      "c": "Quốc phòng.",
      "d": "An ninh."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.4"
  },
  {
    "question": "Theo quan điểm của chủ nghĩa Mác - Lênin về quan hệ giữa chiến tranh với chính trị:",
    "options": {
      "a": "Chính trị là con đường, là phương tiện của chiến tranh.",
      "b": "Chính trị là một thời đoạn, một bộ phận của chiến tranh.",
      "c": "Chính trị chi phối và quyết định toàn bộ tiến trình và kết cục của chiến tranh.",
      "d": "Chính trị không thể sử dụng kết quả sau chiến tranh để đề ra nhiệm vụ, mục tiêu."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.5"
  },
  {
    "question": "Trong mối quan hệ giữa chiến tranh và chính trị, thì chiến tranh là kết quả phản ánh:",
    "options": {
      "a": "Những bản chất chính trị xã hội.",
      "b": "Sức mạnh tổng hợp của quân đội.",
      "c": "Những cố gắng cao nhất của chính trị.",
      "d": "Những cố gắng cao nhất về kinh tế."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.6"
  },
  {
    "question": "Hồ Chí Minh khẳng định mục đích cuộc chiến tranh của nhân dân chống thực dân Pháp:",
    "options": {
      "a": "Bảo vệ nhân dân, bảo vệ chế độ, bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa.",
      "b": "Bảo vệ đất nước và chống ách đô hộ của thực dân, đế quốc.",
      "c": "Bảo vệ tính mạng, tài sản của nhân dân, của chế độ xã hội chủ nghĩa.",
      "d": "Bảo vệ độc lập chủ quyền và thống nhất đất nước."
    },
    "answer": "d",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.7"
  },
  {
    "question": "Tư tưởng Hồ Chí Minh xác định thái độ đối với chiến tranh là:",
    "options": {
      "a": "Phản đối tất cả các cuộc chiến tranh.",
      "b": "Phản đối các cuộc chiến tranh chống áp bức, nô dịch.",
      "c": "Phản đối các cuộc chiến tranh sắc tộc tôn giáo.",
      "d": "Ủng hộ chiến tranh chính nghĩa, phản đối chiến tranh phi nghĩa."
    },
    "answer": "d",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.8"
  },
  {
    "question": "Theo tư tưởng Hồ Chí Minh nhất thiết phải sử dụng bạo lực cách mạng:",
    "options": {
      "a": "Để lật đổ xã hội cũ, xây dựng xã hội mới.",
      "b": "Để xây dựng chế độ mới.",
      "c": "Để giành lấy chính quyền và bảo vệ chính quyền.",
      "d": "Để lật đổ chế độ cũ."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.9"
  },
  {
    "question": "Theo tư tưởng Hồ Chí Minh, bạo lực cách mạng được tạo bởi:",
    "options": {
      "a": "Sức mạnh của toàn dân, bằng cả lực lượng chính trị và lực lượng vũ trang.",
      "b": "Sức mạnh của toàn dân, bằng cả tiềm lực chính trị và tiềm lực kinh tế.",
      "c": "Kết hợp chặt chẽ giữa đấu tranh chính trị và đấu tranh ngoại giao.",
      "d": "Tất cả đều đúng."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.10"
  },
  {
    "question": "Lời kêu gọi toàn quốc kháng chiến chống thực dân Pháp của Hồ Chí Minh:",
    "options": {
      "a": "Ngày 22/12/1944.",
      "b": "Ngày 23/11/1945.",
      "c": "Ngày 02/09/1945.",
      "d": "Ngày 19/12/1946."
    },
    "answer": "d",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.11"
  },
  {
    "question": "Theo quan điểm của chủ nghĩa Mác-Lênin về bản chất giai cấp của quân đội phụ thuộc vào:",
    "options": {
      "a": "Bản chất của các nhà nước đã tổ chức ra quân đội đó.",
      "b": "Bản chất của các giai cấp và của nhà nước đã tổ chức ra quân đội đó.",
      "c": "Bản chất của giai cấp công nông và của nhà nước đã tổ chức ra quân đội đó.",
      "d": "Tất cả đều đúng."
    },
    "answer": "b",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.12"
  },
  {
    "question": "Nguyên tắc quan trọng nhất về xây dựng quân đội kiểu mới của Lê-nin là:",
    "options": {
      "a": "Sự lãnh đạo của Đảng Cộng Sản đối với quân đội.",
      "b": "Giữ vững quan điểm giai cấp trong xây dựng quân đội.",
      "c": "Tính kỷ luật cao là yếu tố quyết định sức mạnh quân đội.",
      "d": "Quân đội chính quy, hiện đại, trung thành với giai cấp công nhân."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.13"
  },
  {
    "question": "Lê-nin khẳng định yếu tố giữ vai trò quyết định đến sức mạnh chiến đấu của quân đội là:",
    "options": {
      "a": "Quân số, tổ chức, cơ cấu biên chế.",
      "b": "Chất lượng vũ khí, trang bị kỹ thuật.",
      "c": "Chính trị tinh thần.",
      "d": "Trình độ huấn luyện và thế lực."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.14"
  },
  {
    "question": "Chủ tịch Hồ Chí Minh khẳng định sự ra đời của Quân đội nhân dân Việt Nam là:",
    "options": {
      "a": "Là một tất yếu có tính quy luật trong đấu tranh giai cấp, đấu tranh dân tộc ở Việt Nam.",
      "b": "Là một hiện tượng ngẫu nhiên trong quá trình đấu tranh cách mạng của dân tộc Việt Nam.",
      "c": "Là một sự kế thừa trong lịch sử chống giặc ngoại xâm.",
      "d": "Là một hiện tượng tự phát do đòi hỏi của chiến tranh cách mạng."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.15"
  },
  {
    "question": "Theo tư tưởng Hồ Chí Minh, quân đội nhân dân Việt Nam:",
    "options": {
      "a": "Mang bản chất của giai cấp nông dân.",
      "b": "Mang bản chất giai cấp công - nông.",
      "c": "Mang bản chất của giai cấp công nhân.",
      "d": "Mang bản chất nhân dân lao động Việt Nam."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.16"
  },
  {
    "question": "Quân đội nhân dân Việt Nam mang bản chất của giai cấp công nhân, đồng thời có:",
    "options": {
      "a": "Tính quần chúng, cách mạng sâu sắc.",
      "b": "Tính phong phú và đa dạng.",
      "c": "Tính nhân dân và tính dân tộc sâu sắc.",
      "d": "Tính phổ biến và rộng rãi."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.17"
  },
  {
    "question": "Chủ tịch Hồ Chí Minh khẳng định Quân đội nhân dân Việt Nam có nhiệm vụ:",
    "options": {
      "a": "Xây dựng quân đội ngày càng hùng mạnh và sẵn sàng chiến đấu.",
      "b": "Xây dựng quân đội ngày càng hùng hậu và sẵn sàng chiến đấu.",
      "c": "Xây dựng quân đội ngày càng đông đảo và sẵn sàng chiến đấu.",
      "d": "Xây dựng quân đội có chất lượng cao và sẵn sàng chiến đấu."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.18"
  },
  {
    "question": "Chủ tịch Hồ Chí Minh khẳng định một trong hai nhiệm vụ chính của quân đội ta là:",
    "options": {
      "a": "Tiến hành phổ biến chính sách của Đảng, Nhà nước cho nhân dân.",
      "b": "Giúp nhân dân cải thiện đời sống vật chất tinh thần.",
      "c": "Thực sự tham gia lao động sản xuất, góp phần xây dựng chủ nghĩa xã hội.",
      "d": "Làm nòng cốt phát triển kinh tế tại nơi đóng quân."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.19"
  },
  {
    "question": "Theo tư tưởng Hồ Chí Minh, Quân đội nhân dân Việt Nam có những chức năng:",
    "options": {
      "a": "Chiến đấu và sẵn sàng chiến đấu.",
      "b": "Chiến đấu, lao động sản xuất.",
      "c": "Chiến đấu, công tác, lao động sản xuất.",
      "d": "Chiến đấu tham gia giữ gìn hòa bình khu vực."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.20"
  },
  {
    "question": "Quan điểm đầu tiên của chủ nghĩa Mác - Lênin về bảo vệ Tổ quốc xã hội chủ nghĩa:",
    "options": {
      "a": "Bảo vệ tổ quốc xã hội chủ nghĩa là nhiệm vụ thường xuyên liên tục.",
      "b": "Bảo vệ tổ quốc xã hội chủ nghĩa là nhiệm vụ cấp thiết trường kỳ.",
      "c": "Bảo vệ tổ quốc xã hội chủ nghĩa là nhiệm vụ trong yêu của toàn dân.",
      "d": "Bảo vệ tổ quốc xã hội chủ nghĩa là nhiệm vụ của lực lượng vũ trang."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.21"
  },
  {
    "question": "Bác Hồ nói với Đại đoàn quân tiên phong trong lần về thăm Đền Hùng năm 1954:",
    "options": {
      "a": "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau giữ lấy nước.",
      "b": "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau bảo vệ đất nước.",
      "c": "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau bảo vệ Tổ quốc.",
      "d": "Các vua Hùng đã có công dựng nước, Bác cháu ta phải cùng nhau gìn giữ Tổ quốc."
    },
    "answer": "a",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.22"
  },
  {
    "question": "Theo tư tưởng Hồ Chí Minh, mục tiêu bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa là:",
    "options": {
      "a": "Sự nghiệp đổi mới.",
      "b": "Sự nghiệp công nghiệp hóa hiện đại hóa.",
      "c": "Bản sắc văn hóa dân tộc.",
      "d": "Độc lập dân tộc và chủ nghĩa xã hội."
    },
    "answer": "d",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.23"
  },
  {
    "question": "Tư tưởng Hồ Chí Minh về sức mạnh bảo vệ Tổ quốc:",
    "options": {
      "a": "Là sức mạnh của cả dân tộc, kết hợp với sức mạnh của nền quốc phòng toàn dân.",
      "b": "Là sức mạnh tổng hợp của cả dân tộc, cả nước kết hợp với sức mạnh thời đại.",
      "c": "Là sức mạnh của toàn dân, lấy lực lượng vũ trang làm nòng cốt.",
      "d": "Là sức mạnh của lực lượng vũ trang nhân dân, sức mạnh quốc phòng toàn dân."
    },
    "answer": "b",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.24"
  },
  {
    "question": "Vai trò lãnh đạo sự nghiệp bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa thuộc về:",
    "options": {
      "a": "Các đoàn thể, các tổ chức chính trị xã hội.",
      "b": "Lực lượng vũ trang nhân dân Việt Nam.",
      "c": "Đảng Cộng sản Việt Nam.",
      "d": "Toàn bộ hệ thống chính trị ở Việt Nam."
    },
    "answer": "c",
    "lesson": "Bài C2: Quan điểm của chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc",
    "order": "2.25"
  },
  {
    "question": "Đảng ta khẳng định vị trí của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Xây dựng kinh tế là chủ yếu, quốc phòng, an ninh là thứ yếu.",
      "b": "Chỉ coi trọng quốc phòng, an ninh khi đất nước có chiến tranh.",
      "c": "Luôn luôn coi trọng quốc phòng, an ninh, coi đó là nền tảng để xây dựng đất nước.",
      "d": "Quốc phòng, an ninh là nhiệm vụ của lực lượng vũ trang."
    },
    "answer": "c",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.1"
  },
  {
    "question": "Đặc trưng đầu tiên của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Mang tính chất tự vệ do giai cấp công nhân tiến hành.",
      "b": "Chỉ có mục đích duy nhất là tự vệ chính đáng.",
      "c": "Vững mạnh toàn diện để tự vệ chính đáng.",
      "d": "Được xây dựng hiện đại có sức mạnh tổng hợp."
    },
    "answer": "b",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.2"
  },
  {
    "question": "Đặc trưng mang tính truyền thống của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Nền quốc phòng, an ninh vì dân, của dân và do dân.",
      "b": "Nền quốc phòng, an ninh mang tính giai cấp, dân tộc sâu sắc.",
      "c": "Nền quốc phòng, an ninh bảo vệ quyền lợi của dân.",
      "d": "Nền quốc phòng, an ninh do nhân dân xây dựng, mang tính chất nhân dân sâu sắc."
    },
    "answer": "a",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.3"
  },
  {
    "question": "Sức mạnh của nền quốc phòng toàn dân, an ninh nhân dân bao gồm:",
    "options": {
      "a": "Sức mạnh do các yếu tố chính trị, văn hóa, khoa học.",
      "b": "Sức mạnh quốc phòng, an ninh hiện đại.",
      "c": "Sức mạnh của quân đội nhân dân, công an nhân dân.",
      "d": "Có sức mạnh tổng hợp do nhiều yếu tố tạo thành."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.4"
  },
  {
    "question": "Mục đích xây dựng nền quốc phòng toàn dân, an ninh nhân dân là:",
    "options": {
      "a": "Tạo sức mạnh tổng hợp và tạo thế chủ động cho sự nghiệp xây dựng và bảo vệ Tổ quốc.",
      "b": "Tạo ra sức mạnh quân sự để ngăn chặn nguy cơ chiến tranh.",
      "c": "Tạo ra tiềm lực kinh tế để phòng thủ đất nước.",
      "d": "Tạo ra môi trường hòa bình để phát triển đất nước theo định hướng XHCN."
    },
    "answer": "a",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.5"
  },
  {
    "question": "Nhiệm vụ xây dựng nền quốc phòng toàn dân và an ninh nhân dân là:",
    "options": {
      "a": "Xây dựng các cấp chính quyền ở cơ sở và lực lượng dân quân tự vệ vững mạnh.",
      "b": "Xây dựng lực lượng quốc phòng, an ninh đáp ứng yêu cầu bảo vệ vững chắc Tổ quốc Việt Nam XHCN.",
      "c": "Xây dựng lực lượng công an, quân đội vững mạnh.",
      "d": "Xây dựng tiềm lực quân sự, an ninh vững mạnh."
    },
    "answer": "b",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.6"
  },
  {
    "question": "Hai nhiệm vụ chiến lược của cách mạng Việt Nam hiện nay là:",
    "options": {
      "a": "Xây dựng và phát triển kinh tế xã hội ngày càng vững mạnh.",
      "b": "Xây dựng và phát triển kinh tế.",
      "c": "Xây dựng và phát triển kinh tế, quốc phòng an ninh nhân dân.",
      "d": "Xây dựng và bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.7"
  },
  {
    "question": "Lực lượng của nền Quốc phòng toàn dân, an ninh nhân dân bao gồm:",
    "options": {
      "a": "Lực lượng toàn dân, lực lượng vũ trang nhân dân.",
      "b": "Lực lượng quân đội nhân dân và công an nhân dân.",
      "c": "Lực lượng toàn dân và dân quân tự vệ.",
      "d": "Lực lượng dự bị động viên và dân quân tự vệ."
    },
    "answer": "a",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.8"
  },
  {
    "question": "Tiềm lực quốc phòng - an ninh là:",
    "options": {
      "a": "Khả năng về của cải vật chất có thể huy động để thực hiện nhiệm vụ quốc phòng, an ninh.",
      "b": "Khả năng về thần lực, vật lực, tài chính có thể huy động để thực hiện nhiệm vụ QP-AN.",
      "c": "Khả năng về tài chính có thể huy động phục vụ cho nhiệm vụ quốc phòng, an ninh.",
      "d": "Khả năng về phương tiện kỹ thuật có thể huy động thực hiện nhiệm vụ quốc phòng an ninh."
    },
    "answer": "b",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.9"
  },
  {
    "question": "Tiềm lực quốc phòng, an ninh được thể hiện ở tất cả các lĩnh vực đời sống xã hội nhưng tập trung ở:",
    "options": {
      "a": "Tiềm lực chính trị, tinh thần; khoa học và công nghệ; kinh tế; quân sự, an ninh.",
      "b": "Tiềm lực chính trị, tinh thần; đối ngoại, khoa học và công nghệ.",
      "c": "Tiềm lực công nghiệp quốc phòng, khoa học quân sự.",
      "d": "Tiềm lực chính trị, tinh thần; văn hóa xã hội; kinh tế."
    },
    "answer": "a",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.10"
  },
  {
    "question": "Tiềm lực chính trị, tinh thần của nền quốc phòng toàn dân - an ninh nhân dân:",
    "options": {
      "a": "Là khả năng về chính trị, tinh thần của xã hội để thực hiện nhiệm vụ quốc phòng.",
      "b": "Là khả năng về chính trị, tinh thần của chính quyền địa phương.",
      "c": "Là khả năng về chính trị, tinh thần có thể huy động nhằm tạo thành sức mạnh để thực hiện nhiệm vụ quốc phòng an ninh.",
      "d": "Là khả năng về chính trị, tinh thần của nhân dân được huy động để thực hiện nhiệm vụ quốc phòng an ninh."
    },
    "answer": "c",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.11"
  },
  {
    "question": "Nội dung xây dựng tiềm lực chính trị, tinh thần của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Xây dựng lòng yêu nước, niềm tin vào Đảng, Nhà nước, chế độ Xã hội Chủ nghĩa.",
      "b": "Xây dựng hệ thống chính trị trong sạch, vững mạnh, phát huy quyền làm chủ của nhân dân.",
      "c": "Xây dựng khối đại đoàn kết toàn dân, nâng cao cảnh giác cách mạng, thực hiện tốt giáo dục QP-AN.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.12"
  },
  {
    "question": "Tiềm lực kinh tế của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Khả năng về tài chính và khoa học công nghệ để phục vụ nhiệm vụ quốc phòng, an ninh.",
      "b": "Khả năng về trang bị kỹ thuật quân sự có thể huy động để phục vụ nhiệm vụ quốc phòng, an ninh.",
      "c": "Khả năng về kinh tế của đất nước có thể khai thác, huy động nhằm phục vụ cho quốc phòng, an ninh.",
      "d": "Khả năng về tài chính để phục vụ nhiệm vụ quốc phòng, an ninh."
    },
    "answer": "c",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.13"
  },
  {
    "question": "Nội dung xây dựng tiềm lực kinh tế của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước, xây dựng nền kinh tế độc lập tự chủ.",
      "b": "Kết hợp chặt chẽ phát triển kinh tế - xã hội với tăng cường củng cố quốc phòng, an ninh, xây dựng hạ tầng kinh tế với cơ sở hạ tầng quốc phòng.",
      "c": "Có kế hoạch chuyển sản xuất từ thời bình sang thời chiến và duy trì sự phát triển của nền kinh tế.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.14"
  },
  {
    "question": "Xây dựng tiềm lực khoa học công nghệ của nền quốc phòng toàn dân, an ninh nhân dân:",
    "options": {
      "a": "Tạo nên khả năng về vũ trang bị kỹ thuật để phòng thủ đất nước.",
      "b": "Tạo nên khả năng về khoa học công nghệ của quốc gia có thể khai thác, huy động để phục vụ quốc phòng, an ninh.",
      "c": "Tạo nên khả năng để huy động đội ngũ cán bộ khoa học kỹ thuật phục vụ quốc phòng, an ninh.",
      "d": "Tạo nên khả năng ứng dụng kết quả nghiên cứu khoa học công nghệ vào quốc phòng, an ninh."
    },
    "answer": "b",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.15"
  },
  {
    "question": "Một trong những nội dung xây dựng tiềm lực quân sự, an ninh:",
    "options": {
      "a": "Xây dựng lực lượng quân đội vững mạnh toàn diện.",
      "b": "Xây dựng lực lượng công an vững mạnh toàn diện.",
      "c": "Xây dựng lực lượng thường trực, dân quân tự vệ vững mạnh.",
      "d": "Xây dựng lực lượng vũ trang nhân dân vững mạnh toàn diện."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.16"
  },
  {
    "question": "Thế trận quốc phòng toàn dân, an ninh nhân dân là:",
    "options": {
      "a": "Sự tổ chức, bố trí lực lượng, tiềm lực mọi mặt của đất nước trên toàn bộ lãnh thổ.",
      "b": "Sự bố trí con người và vũ khí trang bị phù hợp trên toàn bộ lãnh thổ.",
      "c": "Sự bố trí thế trận sẵn sàng tác chiến trên mặt địa bàn chiến lược.",
      "d": "Sự bố trí các đơn vị của lực lượng vũ trang trên toàn bộ lãnh thổ."
    },
    "answer": "a",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.17"
  },
  {
    "question": "Một trong những nội dung xây dựng thế trận quốc phòng toàn dân, an ninh nhân dân là:",
    "options": {
      "a": "Tổ chức phòng thủ dân sự, kết hợp cải tạo địa hình với xây dựng hạ tầng và các công trình quốc phòng, an ninh.",
      "b": "Tổ chức phòng thủ dân sự, kết hợp xây dựng các khu vực hậu phương, vùng căn cứ vững chắc về mọi mặt.",
      "c": "Tổ chức phòng thủ dân sự, chủ động tiến công tiêu diệt địch trên tất cả các mặt trận.",
      "d": "Tổ chức phòng thủ dân sự đảm bảo an toàn cho người và của cải vật chất."
    },
    "answer": "b",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.18"
  },
  {
    "question": "Biện pháp chính nhằm xây dựng nhận thức về nền quốc phòng toàn dân, an ninh nhân dân là:",
    "options": {
      "a": "Thường xuyên giáo dục ý thức, trách nhiệm của công dân.",
      "b": "Thường xuyên thực hiện giáo dục nghĩa vụ công dân.",
      "c": "Thường xuyên thực hiện giáo dục quốc phòng, an ninh.",
      "d": "Thường xuyên phổ biến nhiệm vụ quốc phòng an ninh."
    },
    "answer": "c",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.19"
  },
  {
    "question": "Nội dung thực hiện giáo dục quốc phòng, an ninh:",
    "options": {
      "a": "Giáo dục về âm mưu thủ đoạn của địch.",
      "b": "Giáo dục về tình yêu quê hương, đất nước, chế độ Xã hội Chủ nghĩa.",
      "c": "Giáo dục đường lối quan điểm của Đảng, pháp luật của nhà nước về quốc phòng, an ninh.",
      "d": "Cả A, B, C."
    },
    "answer": "d",
    "lesson": "Bài C3: Xây dựng nền quốc phòng toàn dân, an ninh nhân dân",
    "order": "3.20"
  },
  {
    "question": "Mục đích của chiến tranh nhân dân Việt Nam bảo vệ Tổ quốc là:",
    "options": {
      "a": "Bảo vệ vững chắc độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ, bảo vệ an ninh quốc gia, trật tự an toàn xã hội và nền văn hóa.",
      "b": "Bảo vệ Đảng, Nhà nước, nhân dân và chế độ Xã hội Chủ nghĩa, bảo vệ lợi ích quốc gia dân tộc.",
      "c": "Bảo vệ sự nghiệp đổi mới, công nghiệp hóa, hiện đại hóa đất nước, giữ vững ổn định chính trị và môi trường hòa bình, phát triển đất nước theo định hướng Xã hội Chủ nghĩa.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.1"
  },
  {
    "question": "Đối tượng tác chiến của chiến tranh nhân dân Việt Nam bảo vệ Tổ quốc là:",
    "options": {
      "a": "Chủ nghĩa đế quốc và các lực lượng ly khai dân tộc trên thế giới.",
      "b": "Chủ nghĩa đế quốc và các thế lực phản động có hành động phá hoại, xâm lược, lật đổ cách mạng.",
      "c": "Chủ nghĩa đế quốc và các thế lực phản cách mạng trên thế giới.",
      "d": "Lực lượng khủng bố quốc tế và lực lượng phản động trong nước."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.2"
  },
  {
    "question": "Âm mưu, thủ đoạn chủ yếu của kẻ thù khi xâm lược nước ta:",
    "options": {
      "a": "Đánh nhanh, thắng nhanh.",
      "b": "Lực lượng tham gia với quân số đông, vũ khí trang bị hiện đại.",
      "c": "Sử dụng biện pháp chính trị, ngoại giao để lừa bịp dư luận.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.3"
  },
  {
    "question": "Khi tiến hành chiến tranh xâm lược nước ta, địch có điểm yếu:",
    "options": {
      "a": "Tiến hành một cuộc chiến tranh phi nghĩa sẽ bị thế giới lên án.",
      "b": "Phải tác chiến trong điều kiện địa hình, thời tiết phức tạp.",
      "c": "Phải đương đầu với dân tộc ta có truyền thống yêu nước, chống xâm lược.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.4"
  },
  {
    "question": "Tính chất cơ bản chiến tranh nhân dân Việt Nam bảo vệ Tổ quốc là:",
    "options": {
      "a": "Cuộc chiến tranh toàn dân, lấy lực lượng vũ trang làm nòng cốt.",
      "b": "Cuộc chiến tranh toàn dân, toàn diện, dưới sự lãnh đạo của Đảng Cộng sản Việt Nam.",
      "c": "Cuộc chiến tranh toàn diện lấy mặt trận quân sự làm yếu tố quyết định.",
      "d": "Cuộc chiến tranh cách mạng chống các thế lực phản cách mạng."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.5"
  },
  {
    "question": "Tính chất chiến tranh nhân dân bảo vệ Tổ quốc là:",
    "options": {
      "a": "Cuộc chiến tranh của giai cấp công nhân nhằm bảo vệ độc lập chủ quyền và lãnh thổ.",
      "b": "Cuộc chiến tranh cách mạng nhằm bảo vệ biên giới quốc gia.",
      "c": "Cuộc chiến tranh chính nghĩa, tự vệ cách mạng nhằm bảo vệ Tổ quốc Việt Nam XHCN.",
      "d": "Cuộc chiến tranh tự vệ nhằm đánh thắng các thế lực xâm lược để bảo vệ chủ quyền, lãnh thổ đất nước."
    },
    "answer": "c",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.6"
  },
  {
    "question": "Tính chất hiện đại trong chiến tranh nhân dân bảo vệ Tổ quốc được thể hiện:",
    "options": {
      "a": "Sử dụng vũ khí trang bị hiện đại để tiến hành chiến tranh.",
      "b": "Sử dụng vũ khí trang bị hiện đại để đánh bại kẻ thù có vũ khí hiện đại hơn.",
      "c": "Hiện đại về vũ khí, trang bị, tri thức và nghệ thuật quân sự.",
      "d": "Kết hợp sử dụng vũ khí tương đối hiện đại với vũ khí hiện đại."
    },
    "answer": "c",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.7"
  },
  {
    "question": "Đặc điểm về cường độ của chiến tranh nhân dân bảo vệ Tổ quốc:",
    "options": {
      "a": "Diễn ra khẩn trương, quy mô lớn giai đoạn đầu của chiến tranh.",
      "b": "Diễn ra với nhịp độ cao, cường độ lớn giai đoạn giữa của cuộc chiến tranh.",
      "c": "Diễn ra trong bối cảnh quốc tế có những thuận lợi cho chúng ta.",
      "d": "Diễn ra với cường độ cao, quyết liệt từ đầu đến cuối cuộc chiến."
    },
    "answer": "a",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.8"
  },
  {
    "question": "Vị trí, ý nghĩa của quan điểm \"toàn dân đánh giặc\" trong chiến tranh nhân dân bảo vệ Tổ quốc:",
    "options": {
      "a": "Điều kiện để mỗi người dân được tham gia đánh giặc, giữ nước.",
      "b": "Điều kiện để phát huy cao nhất yếu tố con người trong cuộc chiến tranh.",
      "c": "Điều kiện để phát huy cao nhất sức mạnh tổng hợp trong cuộc chiến tranh.",
      "d": "Điều kiện để phát huy sức mạnh toàn dân."
    },
    "answer": "c",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.9"
  },
  {
    "question": "Trong tiến hành chiến tranh toàn diện, mặt trận đấu tranh nào là chủ yếu:",
    "options": {
      "a": "Mặt trận kinh tế.",
      "b": "Mặt trận quân sự.",
      "c": "Mặt trận ngoại giao.",
      "d": "Mặt trận chính trị."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.10"
  },
  {
    "question": "Quan điểm của Đảng ta về chuẩn bị cho chiến tranh nhân dân bảo vệ Tổ quốc:",
    "options": {
      "a": "Chuẩn bị đầy đủ mọi mặt trên các vùng chiến lược của đất nước.",
      "b": "Chuẩn bị con người, vũ khí trang bị cho chiến tranh.",
      "c": "Chuẩn bị đầy đủ tiềm lực kinh tế, quân sự trên cả nước cũng như từng khu vực.",
      "d": "Chuẩn bị mọi mặt trên cả nước, cũng như từng khu vực để bảo vệ vững chắc Tổ quốc Việt Nam XHCN."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.11"
  },
  {
    "question": "Nội dung chủ yếu của chiến tranh nhân dân:",
    "options": {
      "a": "Tổ chức thế trận chiến tranh nhân dân.",
      "b": "Tổ chức lực lượng chiến tranh nhân dân.",
      "c": "Phối hợp chặt chẽ chống quân địch tiến công từ bên ngoài vào và bạo loạn lật đổ bên trong.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.12"
  },
  {
    "question": "Thế trận chiến tranh nhân dân:",
    "options": {
      "a": "Sự tổ chức, bố trí lực lượng để tiến hành chiến tranh và hoạt động tác chiến.",
      "b": "Sự tổ chức, Cloth trí các đơn vị của lực lượng vũ trang nhân dân đánh giặc.",
      "c": "Sự tổ chức, bố trí lực lượng phòng thủ đất nước.",
      "d": "Sự tổ chức, bố trí các lực lượng chiến đấu trên chiến trường."
    },
    "answer": "a",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.13"
  },
  {
    "question": "Trong chiến tranh nhân dân bảo vệ Tổ quốc, thế trận của chiến tranh được:",
    "options": {
      "a": "Bố trí rộng trên cả nước, nhưng phải tập trung cho khu vực chủ yếu.",
      "b": "Bố trí rộng trên cả nước, nhưng phải có trọng tâm, trọng điểm.",
      "c": "Bố trí rộng trên cả nước, nhưng tập trung ở các vùng kinh tế trọng điểm.",
      "d": "Bố trí rộng trên cả nước, nhưng tập trung ở các địa bàn trọng điểm."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.14"
  },
  {
    "question": "Lực lượng chiến tranh nhân dân là:",
    "options": {
      "a": "Các quân khu, quân đoàn chủ lực.",
      "b": "Toàn dân, lấy lực lượng vũ trang ba thứ quân làm nòng cốt.",
      "c": "Lực lượng lục quân, hải quân, phòng không không quân.",
      "d": "Lực lượng quân đội nhân dân và công an nhân dân."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.15"
  },
  {
    "question": "Lực lượng toàn dân trong tiến hành chiến tranh nhân dân được tổ chức chặt chẽ thành:",
    "options": {
      "a": "Lực lượng quân đội nhân dân và công an nhân dân.",
      "b": "Lực lượng quân đội nhân dân và dân quân tự vệ.",
      "c": "Lực lượng quần chúng rộng rãi và lực lượng quân sự.",
      "d": "Lực lượng đấu tranh chính trị và đấu tranh quân sự."
    },
    "answer": "d",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.16"
  },
  {
    "question": "Tiến hành chiến tranh nhân dân bảo vệ Tổ quốc phải phối hợp chặt chẽ giữa:",
    "options": {
      "a": "Chống quân xâm lược từ bên ngoài vào với chống lực lượng khủng bố từ bên trong.",
      "b": "Chống quân địch tấn công từ bên ngoài vào với bạo loạn lật đổ từ bên trong.",
      "c": "Chống bạo loạn lật đổ với trấn áp bọn phản động.",
      "d": "Chống bạo loạn lật đổ với các hoạt động phá hoại khác."
    },
    "answer": "b",
    "lesson": "Bài C4: Chiến tranh nhân dân bảo vệ Tổ quốc Việt Nam xã hội chủ nghĩa",
    "order": "4.17"
  },
  {
    "question": "Lực lượng vũ trang nhân dân gồm các tổ chức:",
    "options": {
      "a": "Vũ trang và bán vũ trang.",
      "b": "Quốc phòng và an ninh.",
      "c": "Quân sự và an ninh trật tự.",
      "d": "An ninh trật tự và bán vũ trang."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.1"
  },
  {
    "question": "Lực lượng vũ trang nhân dân Việt Nam bao gồm:",
    "options": {
      "a": "Quân đội nhân dân, công an nhân dân, dân quân tự vệ.",
      "b": "Quân đội nhân dân, dự bị động viên, dân quân tự vệ.",
      "c": "Quân đội thường trực, dự bị động viên, dân quân tự vệ.",
      "d": "Quân đội chủ lực, cảnh sát nhân dân, dân quân tự vệ."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.2"
  },
  {
    "question": "Quan điểm, nguyên tắc cơ bản nhất trong xây dựng lực lượng vũ trang nhân dân là:",
    "options": {
      "a": "Giữ vững và tăng cường sự lãnh đạo của Đảng Cộng sản Việt Nam đối với lực lượng vũ trang nhân dân.",
      "b": "Giữ vững và tăng cường sự lãnh đạo, quản lý của Nhà nước đối với lực lượng vũ trang nhân dân.",
      "c": "Giữ vững và tăng cường sự lãnh đạo của các tổ chức chính trị trong lực lượng vũ trang.",
      "d": "Giữ vững và tăng cường sự lãnh đạo của các cơ quan chính trị trong lực lượng vũ trang."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.3"
  },
  {
    "question": "Đảng Cộng sản Việt Nam lãnh đạo lực lượng vũ trang nhân dân theo nguyên tắc:",
    "options": {
      "a": "Tuyệt đối, trực tiếp về toàn diện.",
      "b": "Tuyệt đối, trực tiếp về mọi mặt.",
      "c": "Tuyệt đối, toàn diện về mọi mặt.",
      "d": "Toàn diện trên mọi lĩnh vực."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.4"
  },
  {
    "question": "Quan điểm, nguyên tắc cơ bản xây dựng lực lượng vũ trang nhân dân trong thời kỳ mới là:",
    "options": {
      "a": "Tự lực, tự cường xây dựng lực lượng vũ trang.",
      "b": "Tự lực cánh sinh, tăng cường đối ngoại.",
      "c": "Phát huy nội lực, tranh thủ hợp tác kinh tế.",
      "d": "Tích cực hợp tác quốc tế về mọi mặt."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.5"
  },
  {
    "question": "Quan điểm, nguyên tắc cơ bản xây dựng lực lượng vũ trang nhân dân trong thời kỳ mới là:",
    "options": {
      "a": "Lấy chất lượng là chính, lấy công tác huấn luyện làm cơ sở.",
      "b": "Lấy chất lượng là chính, lấy xây dựng chính trị làm cơ sở.",
      "c": "Lấy chất lượng huấn luyện là chính, coi trọng xây dựng chính trị.",
      "d": "Lấy chất lượng là trọng tâm, lấy xây dựng chính trị làm trọng điểm."
    },
    "answer": "b",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.6"
  },
  {
    "question": "Một trong những nội dung xây dựng về chính trị lực lượng vũ trang nhân dân là:",
    "options": {
      "a": "Chăm lo xây dựng củng cố các tổ chức chính trị trong lực lượng vũ trang nhân dân.",
      "b": "Chăm lo xây dựng củng cố các tổ chức chỉ huy trong lực lượng vũ trang nhân dân.",
      "c": "Đẩy mạnh hoạt động phòng chống \"diễn biến hòa bình\" trong lực lượng vũ trang.",
      "d": "Đổi mới công tác đào tạo sĩ quan trong nhà trường."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.7"
  },
  {
    "question": "Nội dung quan trọng nhất trong xây dựng lực lượng vũ trang nhân dân về chính trị là:",
    "options": {
      "a": "Phát triển số lượng Đảng viên trong lực lượng vũ trang nhân dân.",
      "b": "Xây dựng đội ngũ, cán bộ chỉ huy trong lực lượng vũ trang nhân dân.",
      "c": "Giáo dục chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh.",
      "d": "Giữ vững nguyên tắc Đảng lãnh đạo trong lực lượng vũ trang nhân dân."
    },
    "answer": "d",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.8"
  },
  {
    "question": "Bảo đảm lực lượng vũ trang nhân dân luôn trong tư thế sẵn sàng chiến đấu là:",
    "options": {
      "a": "Chức năng, nhiệm vụ chiến lược cơ bản, thường xuyên của lực lượng vũ trang nhân dân.",
      "b": "Chức năng, nhiệm vụ chủ yếu cơ bản, thường xuyên của lực lượng vũ trang nhân dân.",
      "c": "Quy luật của dân tộc Việt Nam trong lịch sử dựng nước và giữ nước.",
      "d": "Quy luật của sự nghiệp bảo vệ Tổ quốc Việt Nam Xã hội Chủ nghĩa."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.9"
  },
  {
    "question": "Phương hướng xây dựng lực lượng dự bị động viên:",
    "options": {
      "a": "Hùng hậu về số lượng, có chất lượng cao, sẵn sàng động viên nhanh chóng khi cần thiết.",
      "b": "Hùng hậu, được huấn luyện và quản lý tốt, bảo đảm khi cần thiết có thể động viên nhanh theo kế hoạch.",
      "c": "Luôn trong tư thế sẵn sàng chiến đấu và chiến đấu thắng lợi.",
      "d": "Luôn sẵn sàng phối hợp với lực lượng thường trực và dân quân tự vệ."
    },
    "answer": "b",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.10"
  },
  {
    "question": "Phương hướng xây dựng dân quân tự vệ:",
    "options": {
      "a": "Vững mạnh, rộng khắp, lấy chất lượng là chính.",
      "b": "Vững mạnh, rộng khắp, lấy chất lượng chính trị là chính.",
      "c": "Toàn diện, rộng khắp, lấy chất lượng là chính.",
      "d": "Rộng khắp nhưng có trọng tâm trọng điểm."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.11"
  },
  {
    "question": "Vấn đề cơ bản hàng đầu trong nhiệm vụ xây dựng quân đội, công an của Đảng trong mọi giai đoạn cách mạng là:",
    "options": {
      "a": "Xây dựng quân đội, công an cách mạng.",
      "b": "Xây dựng quân đội, công an tinh nhuệ.",
      "c": "Xây dựng quân đội, công an chính quy.",
      "d": "Xây dựng quân đội, công an hiện đại."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.12"
  },
  {
    "question": "Xây dựng quân đội nhân dân, công an nhân dân chính quy là:",
    "options": {
      "a": "Thống nhất về mọi mặt (tổ chức, biên chế, trang bị,...).",
      "b": "Thống nhất về chính trị, quân sự, hậu cần.",
      "c": "Thống nhất về chính trị, mục tiêu chiến đấu.",
      "d": "Thống nhất về tổ chức, kỷ luật, điều lệnh."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.13"
  },
  {
    "question": "Xây dựng quân đội nhân dân, công an nhân dân tinh nhuệ trên các lĩnh vực:",
    "options": {
      "a": "Chính trị, kỹ thuật, nghiệp vụ.",
      "b": "Chính trị, quân sự, hậu cần.",
      "c": "Chính trị, quân sự, kỹ thuật.",
      "d": "Chính trị, tổ chức, kỹ chiến thuật."
    },
    "answer": "b",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.14"
  },
  {
    "question": "Một trong những biện pháp chủ yếu xây dựng lực lượng vũ trang nhân dân là:",
    "options": {
      "a": "Nâng cao kết quả huấn luyện quân sự, giáo dục, đẩy mạnh đối ngoại.",
      "b": "Nâng cao kết quả giáo dục chính trị, tư tưởng, phát triển cách đánh.",
      "c": "Nâng cao chất lượng huấn luyện, giáo dục, xây dựng và phát triển khoa học công nghệ quốc phòng.",
      "d": "Nâng cao chất lượng huấn luyện, giáo dục, xây dựng và phát triển khoa học quân sự, khoa học công an."
    },
    "answer": "d",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.15"
  },
  {
    "question": "Một trong những biện pháp chủ yếu xây dựng lực lượng vũ trang nhân dân là:",
    "options": {
      "a": "Từng bước giải quyết yêu cầu về tổ chức, biên chế cho lực lượng vũ trang nhân dân.",
      "b": "Từng bước giải quyết yêu cầu về vũ khí, trang bị kỹ thuật của các lực lượng vũ trang nhân dân.",
      "c": "Từng bước đổi mới, bổ sung đầy đủ vũ khí hiện đại cho lực lượng vũ trang nhân dân.",
      "d": "Từng bước nâng cao chất lượng vũ khí, trang bị kỹ thuật."
    },
    "answer": "b",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.16"
  },
  {
    "question": "Một trong những biện pháp chủ yếu xây dựng lực lượng vũ trang nhân dân là:",
    "options": {
      "a": "Xây dựng đội ngũ cán bộ lực lượng vũ trang nhân dân có phẩm chất, năng lực tốt.",
      "b": "Xây dựng đội ngũ cán bộ lực lượng vũ trang nhân dân có phẩm chất tốt, số lượng đông.",
      "c": "Xây dựng đội ngũ cán bộ lực lượng vũ trang nhân dân có số lượng đông, năng lực tốt.",
      "d": "Xây dựng đội ngũ cán bộ lực lượng vũ trang nhân dân có số lượng đủ, phẩm chất tốt."
    },
    "answer": "a",
    "lesson": "Bài C5: Xây dựng lực lượng vũ trang nhân dân Việt Nam",
    "order": "5.17"
  },
  {
    "question": "Cơ sở lý luận của việc kết hợp phát triển kinh tế với tăng cường củng cố quốc phòng, an ninh:",
    "options": {
      "a": "Quốc phòng, an ninh tạo ra cơ sở vật chất để xây dựng kinh tế.",
      "b": "Quốc phòng, an ninh tạo ra những biến động kích thích kinh tế phát triển.",
      "c": "Quốc phòng, an ninh và kinh tế có quan hệ, tác động qua lại lẫn nhau.",
      "d": "Quốc phòng, an ninh lệ thuộc hoàn toàn vào kinh tế."
    },
    "answer": "c",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Cơ sở lý luận của việc kết hợp phát triển kinh tế với tăng cường củng cố quốc phòng, an ninh:",
    "options": {
      "a": "Kinh tế quyết định toàn bộ sức mạnh của quốc phòng, an ninh.",
      "b": "Kinh tế quyết định việc đảm bảo chất lượng nguồn nhân lực cho quốc phòng, an ninh.",
      "c": "Kinh tế quyết định đến nguồn gốc ra đời, sức mạnh của quốc phòng, an ninh.",
      "d": "Kinh tế không tác động đến quốc phòng, an ninh."
    },
    "answer": "c",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Vị trí, vai trò của kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh trong sự nghiệp xây dựng và bảo vệ Tổ quốc:",
    "options": {
      "a": "Là vấn đề chiến lược cơ bản, lâu dài, xuyên suốt.",
      "b": "Là nhiệm vụ trước mắt.",
      "c": "Là trách nhiệm riêng của Bộ Quốc phòng.",
      "d": "Là một phần trong phát triển công nghiệp."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp phát triển kinh tế – xã hội với quốc phòng, an ninh là:",
    "options": {
      "a": "Kết hợp trong quy hoạch, kế hoạch phát triển kinh tế – xã hội.",
      "b": "Kết hợp trong đào tạo nghề.",
      "c": "Kết hợp trong tuyên truyền giáo dục pháp luật.",
      "d": "Kết hợp trong đối ngoại nhân dân."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong hoạt động công nghiệp là:",
    "options": {
      "a": "Sản xuất vũ khí hạt nhân.",
      "b": "Kết hợp sản xuất quốc phòng với dân dụng.",
      "c": "Xuất khẩu vũ khí chiến lược.",
      "d": "Chuyển giao công nghệ quốc phòng."
    },
    "answer": "b",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Việc kết hợp trong quy hoạch, kế hoạch phải đảm bảo:",
    "options": {
      "a": "Phát triển nhanh và hiệu quả kinh tế.",
      "b": "Đảm bảo quốc phòng, an ninh ngay từ đầu.",
      "c": "Tối đa hóa lợi nhuận nhà đầu tư.",
      "d": "Hợp tác với các tổ chức phi chính phủ."
    },
    "answer": "b",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong hoạt động giao thông vận tải là:",
    "options": {
      "a": "Xây dựng đường sắt cao tốc phục vụ quốc phòng.",
      "b": "Kết hợp vận chuyển quân sự với dân sự trong thời bình.",
      "c": "Huy động phương tiện vận tải dân dụng khi cần thiết.",
      "d": "Mở rộng mạng lưới giao thông nội bộ khu công nghiệp."
    },
    "answer": "c",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong lĩnh vực tài chính là:",
    "options": {
      "a": "Cắt giảm ngân sách quốc phòng.",
      "b": "Bố trí ngân sách quốc phòng phù hợp với phát triển kinh tế.",
      "c": "Tập trung đầu tư phát triển khu công nghiệp.",
      "d": "Tăng chi đầu tư nước ngoài cho quốc phòng."
    },
    "answer": "b",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những yêu cầu của kết hợp phát triển kinh tế – xã hội với quốc phòng, an ninh là:",
    "options": {
      "a": "Gắn chặt với nhiệm vụ xây dựng và bảo vệ Tổ quốc.",
      "b": "Phù hợp với kế hoạch của doanh nghiệp nhà nước.",
      "c": "Tối ưu hóa lợi nhuận tư nhân.",
      "d": "Tập trung vùng kinh tế trọng điểm."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Chủ trương của Đảng về kết hợp phát triển kinh tế – xã hội với quốc phòng, an ninh là:",
    "options": {
      "a": "Phải kết hợp ngay từ đầu trong từng chiến lược, quy hoạch, kế hoạch.",
      "b": "Phải kết hợp sau khi hoàn tất các mục tiêu kinh tế.",
      "c": "Chỉ kết hợp khi có yêu cầu từ Bộ Quốc phòng.",
      "d": "Không cần kết hợp nếu tình hình an ninh ổn định."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong lĩnh vực nông nghiệp, nông thôn là:",
    "options": {
      "a": "Xây dựng cơ sở hạ tầng quốc phòng gắn với phát triển vùng sâu, vùng xa.",
      "b": "Tăng cường sản xuất xuất khẩu lương thực.",
      "c": "Đẩy mạnh ứng dụng công nghệ sinh học.",
      "d": "Giảm quy mô lực lượng dân quân tự vệ ở nông thôn."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nguyên tắc của việc kết hợp phát triển kinh tế – xã hội với quốc phòng, an ninh là:",
    "options": {
      "a": "Phát triển kinh tế là trước hết, quốc phòng là bổ sung.",
      "b": "Đảm bảo sự lãnh đạo của Đảng trong mọi hoạt động kết hợp.",
      "c": "Tăng trưởng GDP là thước đo duy nhất của hiệu quả.",
      "d": "Quốc phòng và an ninh được thực hiện bởi tư nhân hóa."
    },
    "answer": "b",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong lĩnh vực văn hóa là:",
    "options": {
      "a": "Phát triển các giá trị văn hóa truyền thống gắn với tinh thần yêu nước.",
      "b": "Xuất khẩu văn hóa đại chúng sang các nước.",
      "c": "Thúc đẩy tự do tôn giáo không giới hạn.",
      "d": "Giảm đầu tư vào giáo dục quốc phòng trong trường học."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp phát triển kinh tế – xã hội với tăng cường củng cố quốc phòng, an ninh trong xây dựng cơ bản:",
    "options": {
      "a": "Công trình trọng điểm phải tính đến yếu tố tự bảo vệ và chuyển hóa phục vụ cho quốc phòng, an ninh.",
      "b": "Công trình nào, ở đâu đều phải tính đến yếu tố tự bảo vệ và chuyển hóa phục vụ cho quốc phòng, an ninh.",
      "c": "Các công trình ở vùng núi, biên giới phải tính đến yếu tố tự bảo vệ và phục vụ cho quốc phòng, an ninh.",
      "d": "Công trình trọng điểm, ở vùng kinh tế trọng điểm phải tính đến yếu tố tự bảo vệ."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong khoa học, công nghệ và giáo dục là:",
    "options": {
      "a": "Coi trọng giáo dục, bồi dưỡng nhân lực, đào tạo nhân tài của đất nước.",
      "b": "Thực hiện có hiệu quả công tác giáo dục quốc phòng, an ninh cho các đối tượng.",
      "c": "Coi trọng đầu tư phát triển khoa học công nghệ quân sự.",
      "d": "Cả A và B."
    },
    "answer": "d",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong y tế là:",
    "options": {
      "a": "Xây dựng mô hình quân dân y kết hợp trên các địa bàn, đặc biệt là ở miền núi, biên giới, hải đảo.",
      "b": "Xây dựng mô hình quân dân y kết hợp trên các địa bàn, đặc biệt là ở các vùng kinh tế trọng điểm.",
      "c": "Tăng cường xuất khẩu dược phẩm phục vụ nhiệm vụ quốc phòng.",
      "d": "Xây dựng bệnh viện quân đội đa năng."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong bảo vệ môi trường là:",
    "options": {
      "a": "Kết hợp xử lý chất thải quân sự và dân sự.",
      "b": "Xây dựng các khu kinh tế quốc phòng xanh – sạch – đẹp.",
      "c": "Bảo đảm an toàn sinh thái trong phát triển công nghiệp quốc phòng.",
      "d": "Cả A và B đúng."
    },
    "answer": "d",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong phòng chống thiên tai là:",
    "options": {
      "a": "Phối hợp quân dân trong công tác cứu hộ, cứu nạn.",
      "b": "Xây dựng hệ thống cảnh báo sớm quốc gia.",
      "c": "Đầu tư phương tiện chuyên dụng phục vụ cả quốc phòng và dân sinh.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những nội dung kết hợp trong quốc phòng toàn dân và thế trận an ninh nhân dân là:",
    "options": {
      "a": "Gắn với các khu vực kinh tế trọng điểm, các địa bàn chiến lược.",
      "b": "Gắn với khu vực trung tâm đô thị phát triển cao.",
      "c": "Chủ yếu triển khai tại vùng biển và hải đảo.",
      "d": "Tập trung ở vùng sâu, vùng xa, không cần đồng bộ."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Nội dung kết hợp trong công tác động viên quốc phòng bao gồm:",
    "options": {
      "a": "Xây dựng kế hoạch huy động nhân lực thời chiến.",
      "b": "Xây dựng kế hoạch động viên kinh tế, giao thông vận tải.",
      "c": "Xây dựng kế hoạch động viên từng giai đoạn.",
      "d": "Tất cả đều đúng."
    },
    "answer": "d",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Để kết hợp hiệu quả, cần chú trọng vai trò của lực lượng nào?",
    "options": {
      "a": "Quân đội nhân dân.",
      "b": "Công an nhân dân.",
      "c": "Cả hệ thống chính trị và nhân dân.",
      "d": "Ủy ban nhân dân tỉnh, thành."
    },
    "answer": "c",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Trong thời kỳ hội nhập quốc tế, yêu cầu đặt ra trong kết hợp phát triển kinh tế với quốc phòng, an ninh là:",
    "options": {
      "a": "Chủ động phòng ngừa, làm thất bại mọi âm mưu của các thế lực thù địch.",
      "b": "Tăng cường đối ngoại quốc phòng độc lập, tự chủ.",
      "c": "Kết hợp kinh tế - quốc phòng để cạnh tranh với các nước lớn.",
      "d": "Giảm chi phí quốc phòng để tập trung cho phát triển kinh tế."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Một trong những điều kiện tiên quyết để thực hiện tốt kết hợp kinh tế – quốc phòng, an ninh là:",
    "options": {
      "a": "Sự lãnh đạo của Đảng Cộng sản Việt Nam.",
      "b": "Cơ chế thị trường linh hoạt.",
      "c": "Nguồn vốn đầu tư nước ngoài.",
      "d": "Phát triển hạ tầng giao thông."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Nguyên tắc cốt lõi trong kết hợp phát triển kinh tế – xã hội với quốc phòng, an ninh là:",
    "options": {
      "a": "Phát triển kinh tế gắn liền với bảo đảm quốc phòng, an ninh.",
      "b": "Tối đa hóa hiệu quả kinh tế, hạn chế chi phí quốc phòng.",
      "c": "Ưu tiên đầu tư công nghệ cao trong quốc phòng.",
      "d": "Phát triển độc lập từng ngành, không chồng chéo."
    },
    "answer": "a",
    "lesson": "Bài C6: Kết hợp phát triển kinh tế – xã hội với tăng cường, củng cố quốc phòng, an ninh"
  },
  {
    "question": "Vì sao nước ta thường bị các thế lực ngoại xâm nhòm ngó, đe dọa, tiến công xâm lược?",
    "options": {
      "a": "Việt Nam có vị trí chiến lược quan trọng ở khu vực Đông Nam Á và biển Đông.",
      "b": "Việt Nam có dân số ít và có rất nhiều tài nguyên khoáng sản.",
      "c": "Việt Nam có rừng vàng, biển bạc.",
      "d": "Việt Nam là một thị trường tiềm năng."
    },
    "answer": "a",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Thời kỳ Bắc thuộc hơn 1000 năm được tính từ:",
    "options": {
      "a": "Năm 179 trước Công nguyên đến năm 983.",
      "b": "Năm 184 trước Công nguyên đến năm 938.",
      "c": "Năm 197 trước Công nguyên đến năm 893.",
      "d": "Năm 179 trước Công nguyên đến năm 938."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Cuộc khởi nghĩa Hai Bà Trưng vào năm:",
    "options": {
      "a": "Năm 40 trước Công nguyên.",
      "b": "Năm 140 sau Công nguyên.",
      "c": "Năm 248 sau Công nguyên.",
      "d": "Năm 40 sau Công nguyên."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Lý Thường Kiệt lãnh đạo cuộc kháng chiến chống quân Tống xâm lược nước ta lần thứ hai:",
    "options": {
      "a": "Năm 981 – 983.",
      "b": "Năm 1070 – 1075.",
      "c": "Năm 1075 – 1077.",
      "d": "Năm 1076 – 1077."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Ba lần kháng chiến chống quân Mông – Nguyên xâm lược nước ta của nhà Trần vào các năm:",
    "options": {
      "a": "1258, 1285 và 1287 đến 1289.",
      "b": "1258, 1284 và 1287 đến 1288.",
      "c": "1258, 1286 và 1287 đến 1288.",
      "d": "1258, 1285 và 1287 đến 1288."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Chiến dịch Điện Biên Phủ diễn ra vào năm nào?",
    "options": {
      "a": "1953",
      "b": "1954",
      "c": "1955",
      "d": "1956"
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Nội dung cơ bản của nghệ thuật quân sự Việt Nam là:",
    "options": {
      "a": "Nghệ thuật chỉ huy chiến lược, chiến dịch và chiến thuật.",
      "b": "Chủ trương toàn dân đánh giặc.",
      "c": "Phát triển kinh tế gắn với quốc phòng.",
      "d": "Giữ vững chủ quyền biên giới."
    },
    "answer": "a",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Một trong các nguyên tắc nghệ thuật quân sự Việt Nam là:",
    "options": {
      "a": "Tiên phát chế nhân.",
      "b": "Tự lực, tự cường, lấy nhỏ thắng lớn.",
      "c": "Dĩ hòa vi quý.",
      "d": "Công thủ linh hoạt."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Một số loại hình chiến dịch trong nghệ thuật quân sự Việt Nam là:",
    "options": {
      "a": "Chiến dịch phục kích, tập kích, đổ bộ đường không tổng hợp.",
      "b": "Chiến dịch tiến công, phản công, phòng ngự, phòng không, tiến công tổng hợp.",
      "c": "Chiến dịch tiến công, tập kích đường không chiến lược.",
      "d": "Chiến dịch tiến công đường chiến lược bằng vũ khí công nghệ cao."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Trong chiến dịch Điện Biên Phủ chúng ta đã thay đổi phương châm tác chiến đó là:",
    "options": {
      "a": "Đánh lâu dài sang đánh nhanh, thắng nhanh.",
      "b": "Đánh nhanh thắng nhanh sang đánh lâu dài.",
      "c": "Đánh lâu dài sang đánh chắc, tiến chắc.",
      "d": "Đánh nhanh thắng nhanh sang đánh chắc, tiến chắc."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Các hình thức chiến thuật thường vận dụng trong giai đoạn đầu kháng chiến chống Pháp và chống Mỹ:",
    "options": {
      "a": "Phản công, phòng ngự, tập kích.",
      "b": "Tập kích, phục kích, vận động tiến công.",
      "c": "Phục kích, đánh úp, đánh công kiên.",
      "d": "Phòng ngự, phục kích, phản kích."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Bài học kinh nghiệm về nghệ thuật quân sự Việt Nam được vận dụng hiện nay:",
    "options": {
      "a": "Quán triệt tư tưởng tích cực tiến công và phòng ngự.",
      "b": "Quán triệt tư tưởng tích cực phòng ngự và chủ động phản công.",
      "c": "Quán triệt tư tưởng tích cực phòng ngự.",
      "d": "Quán triệt tư tưởng tích cực tiến công."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Bài học kinh nghiệm về nghệ thuật quân sự Việt Nam được vận dụng vào sự nghiệp bảo vệ Tổ quốc trong thời kỳ mới là:",
    "options": {
      "a": "Tạo sức mạnh tổng hợp bằng giáo dục truyền thống.",
      "b": "Tạo sức mạnh tổng hợp bằng xây dựng phát triển kinh tế.",
      "c": "Tạo sức mạnh tổng hợp bằng mưu kế, thế, thời, lực.",
      "d": "Tạo sức mạnh tổng hợp bằng thiên thời, địa lợi, nhân hòa."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Một trong những đặc điểm của nghệ thuật quân sự Việt Nam thời hiện đại là:",
    "options": {
      "a": "Kết hợp tiến công và phòng ngự, tiến công là chủ yếu.",
      "b": "Tập trung toàn lực cho tiến công quy ước.",
      "c": "Đánh nhanh, thắng nhanh là phương châm duy nhất.",
      "d": "Dựa vào các chiến dịch cơ động đường không."
    },
    "answer": "a",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Tư tưởng chiến lược quân sự của Đảng ta trong thời kỳ mới là:",
    "options": {
      "a": "Tiến công tổng lực.",
      "b": "Tích cực phòng ngự, chủ động tiến công.",
      "c": "Phòng ngự là chủ yếu.",
      "d": "Tiến công trước, phòng ngự sau."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Nghệ thuật quân sự Việt Nam truyền thống nhấn mạnh:",
    "options": {
      "a": "Dụng binh linh hoạt, sáng tạo.",
      "b": "Chiến đấu bằng vũ khí hiện đại.",
      "c": "Tấn công từ xa.",
      "d": "Chiến tranh nhân dân lấy vũ khí làm gốc."
    },
    "answer": "a",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Bài học xuyên suốt của nghệ thuật quân sự Việt Nam là:",
    "options": {
      "a": "Đem quân ra nước ngoài để đánh trước.",
      "b": "Tạo thế trận phòng thủ biển là chủ yếu.",
      "c": "Lấy dân làm gốc, lấy địch làm chính.",
      "d": "Lấy nhỏ thắng lớn, lấy ít địch nhiều."
    },
    "answer": "d",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Chiến tranh nhân dân ở Việt Nam là hình thức chiến tranh:",
    "options": {
      "a": "Phòng thủ chủ động, lấy quân đội làm nòng cốt.",
      "b": "Phòng thủ tích cực, toàn dân đánh giặc, lấy LLVTND làm nòng cốt.",
      "c": "Tiến công toàn diện, đánh phủ đầu.",
      "d": "Chuyên nghiệp hóa, hiện đại hóa toàn bộ."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Chiến dịch Hồ Chí Minh năm 1975 là chiến dịch:",
    "options": {
      "a": "Phản công quy mô nhỏ.",
      "b": "Tổng tiến công chiến lược mang tính quyết định.",
      "c": "Tiến công phòng ngự kết hợp.",
      "d": "Tổng động viên toàn quốc phòng ngự lâu dài."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Trong nghệ thuật quân sự Việt Nam hiện đại, yếu tố quyết định thắng lợi là:",
    "options": {
      "a": "Vũ khí công nghệ cao.",
      "b": "Sức mạnh chiến đấu của quân đội.",
      "c": "Ý chí, tinh thần và lòng yêu nước của nhân dân.",
      "d": "Sự hỗ trợ từ quốc tế."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Vai trò của Đảng trong nghệ thuật quân sự Việt Nam là:",
    "options": {
      "a": "Chỉ đạo chiến dịch, giữ vững ổn định chính trị.",
      "b": "Lãnh đạo tuyệt đối, trực tiếp về mọi mặt.",
      "c": "Tổ chức chiến tranh du kích.",
      "d": "Thực hiện vận động quốc tế."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Đặc điểm nổi bật trong nghệ thuật chiến dịch Việt Nam là:",
    "options": {
      "a": "Kết hợp đánh lớn và đánh nhỏ.",
      "b": "Tập trung lực lượng tinh nhuệ.",
      "c": "Tạo thế bao vây tiêu diệt địch.",
      "d": "Phát huy vai trò hỏa lực không quân."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Kế thừa truyền thống và đổi mới là:",
    "options": {
      "a": "Nguyên tắc bất biến trong chiến lược phát triển đất nước.",
      "b": "Cơ sở vận dụng nghệ thuật quân sự Việt Nam trong thời đại mới.",
      "c": "Mục tiêu của chiến tranh cách mạng.",
      "d": "Cách xây dựng lực lượng vũ trang."
    },
    "answer": "b",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Trong giai đoạn hiện nay, bảo vệ Tổ quốc cần chú trọng:",
    "options": {
      "a": "Chuẩn bị chiến tranh tổng lực.",
      "b": "Tăng cường vũ khí công nghệ cao.",
      "c": "Xây dựng thế trận quốc phòng toàn dân gắn với thế trận an ninh nhân dân.",
      "d": "Phát triển lực lượng phòng không."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Yếu tố then chốt làm nên sức mạnh chiến đấu của quân đội là:",
    "options": {
      "a": "Vũ khí hiện đại.",
      "b": "Truyền thống yêu nước.",
      "c": "Sự lãnh đạo của Đảng.",
      "d": "Kỹ năng chiến đấu."
    },
    "answer": "c",
    "lesson": "Bài C7: Nghệ thuật quân sự Việt Nam"
  },
  {
    "question": "Chủ tịch nước giữ vai trò gì trong lực lượng vũ trang?",
    "options": {
      "a": "Chỉ đạo toàn bộ quốc phòng",
      "b": "Là người đứng đầu chính phủ",
      "c": "Là Tổng tư lệnh các lực lượng vũ trang",
      "d": "Không liên quan"
    },
    "answer": "c",
    "lesson": "Bài C1: Tổ chức Quốc phòng",
    "explanation": "Theo quy định của hiến pháp."
  },
  {
    "question": "Nhiệm vụ của Hội đồng Quốc phòng và An ninh là gì?",
    "options": {
      "a": "Điều hành các lực lượng vũ trang",
      "b": "Tham mưu cho Đảng, Nhà nước về quốc phòng và an ninh",
      "c": "Quản lý trực tiếp các đơn vị quân đội",
      "d": "Phát triển vũ khí mới"
    },
    "answer": "b",
    "lesson": "Bài C1: Tổ chức Quốc phòng",
    "explanation": "Theo luật quốc phòng."
  },
  {
    "question": "Quân đội nhân dân Việt Nam được thành lập vào ngày tháng năm nào?",
    "options": {
      "a": "22/12/1944",
      "b": "22/12/1945",
      "c": "22/12/1946",
      "d": "22/12/1947"
    },
    "answer": "b",
    "lesson": "Bài C2: Lịch sử Quân đội",
    "explanation": "Theo tài liệu lịch sử chính thức."
  },
  {
    "question": "Đâu là một trong những nhiệm vụ của Quân đội nhân dân Việt Nam?",
    "options": {
      "a": "Chỉ tham gia chiến đấu khi có chiến tranh",
      "b": "Chỉ làm nhiệm vụ quốc tế",
      "c": "Sẵn sàng chiến đấu, bảo vệ vững chắc Tổ quốc",
      "d": "Chỉ phục vụ phát triển kinh tế"
    },
    "answer": "c",
    "lesson": "Bài C2: Lịch sử Quân đội",
    "explanation": "Theo quy định chức năng, nhiệm vụ của quân đội."
  },
  {
    "question": "Lực lượng dân quân tự vệ là lực lượng vũ trang nào?",
    "options": {
      "a": "Lực lượng vũ trang chuyên nghiệp",
      "b": "Lực lượng vũ trang nhân dân",
      "c": "Lực lượng vũ trang quốc tế",
      "d": "Lực lượng vũ trang khu vực"
    },
    "answer": "b",
    "lesson": "Bài C3: Lực lượng vũ trang",
    "explanation": "Theo quy định tại luật dân quân tự vệ."
  },
  {
    "question": "Theo Luật Nghĩa vụ quân sự, độ tuổi gọi nhập ngũ là bao nhiêu?",
    "options": {
      "a": "Từ đủ 16 đến hết 25 tuổi",
      "b": "Từ đủ 17 đến hết 25 tuổi",
      "c": "Từ đủ 18 đến hết 25 tuổi",
      "d": "Từ đủ 18 đến hết 27 tuổi"
    },
    "answer": "d",
    "lesson": "Bài C3: Lực lượng vũ trang",
    "explanation": "Theo quy định tại luật nghĩa vụ quân sự."
  },
  {
    "question": "Quân khu nào không thuộc địa bàn quân sự của Việt Nam?",
    "options": {
      "a": "Quân khu 1",
      "b": "Quân khu 3",
      "c": "Quân khu 6",
      "d": "Quân khu 8"
    },
    "answer": "a",
    "lesson": "Bài C4: Tổ chức quân đội",
    "explanation": "Theo quy định phân chia quân khu hiện tại."
  },
  {
    "question": "Việt Nam có bao nhiêu quân chủng?",
    "options": {
      "a": "3",
      "b": "4",
      "c": "5",
      "d": "6"
    },
    "answer": "c",
    "lesson": "Bài C4: Tổ chức quân đội",
    "explanation": "Theo cơ cấu tổ chức quân đội."
  },
  {
    "question": "Nước Cộng hòa xã hội chủ nghĩa Việt Nam xây dựng nền quốc phòng toàn dân dựa trên nền tảng nào?",
    "options": {
      "a": "Sức mạnh chính trị - tinh thần",
      "b": "Sức mạnh khoa học - công nghệ",
      "c": "Sức mạnh kinh tế - xã hội",
      "d": "Sức mạnh quân sự - an ninh"
    },
    "answer": "a",
    "lesson": "Bài C5: Chiến lược quốc phòng",
    "explanation": "Theo chiến lược quốc phòng Việt Nam."
  },
  {
    "question": "Lực lượng vũ trang nhân dân Việt Nam gồm những thành phần nào?",
    "options": {
      "a": "Quân đội nhân dân, Công an nhân dân, Dân quân tự vệ",
      "b": "Quân đội nhân dân, Công an nhân dân, Cảnh sát biển",
      "c": "Quân đội nhân dân, Dân quân tự vệ, Biên phòng",
      "d": "Quân đội nhân dân, Công an nhân dân, Cảnh sát giao thông"
    },
    "answer": "a",
    "lesson": "Bài C5: Chiến lược quốc phòng",
    "explanation": "Theo quy định tại Hiến pháp và Luật quốc phòng."
  }
        ];
        
        // Fallback success message
        console.log("Loaded fallback questions:", allQuestions.length);
        
        // Extract and populate lessons from fallback
        extractLessons();
    }
    
    // Display diagnostic information if no questions were loaded
    if (allQuestions.length === 0) {
        console.error("Failed to load any questions. Please check your JSON file.");
        questionText.textContent = "Không thể tải câu hỏi. Vui lòng kiểm tra file JSON và console để biết thêm chi tiết.";
        return;
    }
    
    // Reset question text if it was showing loading message
    if (questionText.textContent === "Đang tải câu hỏi...") {
        questionText.textContent = "Nội dung câu hỏi sẽ hiển thị ở đây";
    }
}

// Extract unique lessons from questions
function extractLessons() {
    const lessonSet = new Set();
    
    // Extract unique lessons from questions
    allQuestions.forEach(question => {
        if (question.lesson) {
            lessonSet.add(question.lesson);
        }
    });
    
    // Convert Set to Array and sort
    uniqueLessons = Array.from(lessonSet).sort();
    
    // Clear existing options except the "all" option
    while (lessonFilterSelect.options.length > 1) {
        lessonFilterSelect.remove(1);
    }
    
    // Add lesson options to select
    uniqueLessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson;
        option.textContent = lesson;
        lessonFilterSelect.appendChild(option);
    });
    
    // Setup lesson filter event
    lessonFilterSelect.addEventListener('change', updateQuestionCountOptions);
    
    // Initialize question count options
    updateQuestionCountOptions();
}

// Update question count options based on selected lesson
function updateQuestionCountOptions() {
    const selectedLesson = lessonFilterSelect.value;
    const filteredQuestions = selectedLesson === 'all' 
        ? allQuestions 
        : allQuestions.filter(q => q.lesson === selectedLesson);
    
    // Save current selection if possible
    const currentSelection = questionCountSelect.value;
    
    // Clear existing options
    questionCountSelect.innerHTML = '';
    
    // Add options based on number of questions available
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = `Tất cả câu hỏi (${filteredQuestions.length})`;
    questionCountSelect.appendChild(allOption);
    
    // Add fixed count options if enough questions
    const counts = [10, 20, 50];
    counts.forEach(count => {
        if (filteredQuestions.length >= count) {
            const option = document.createElement('option');
            option.value = count.toString();
            option.textContent = `${count} câu hỏi`;
            questionCountSelect.appendChild(option);
        }
    });
    
    // Try to restore previous selection if it exists
    for (let i = 0; i < questionCountSelect.options.length; i++) {
        if (questionCountSelect.options[i].value === currentSelection) {
            questionCountSelect.selectedIndex = i;
            break;
        }
    }
}

// Initialize the app
async function init() {
    try {
        // Check if all required DOM elements exist
        if (!validateDomElements()) {
            console.error('Required DOM elements not found.');
            return;
        }
        
        // Create theme toggle button
        themeToggleButton = document.createElement('button');
        themeToggleButton.id = 'theme-toggle';
        themeToggleButton.className = 'btn btn-outline-secondary position-fixed';
        themeToggleButton.style.top = '10px';
        themeToggleButton.style.right = '10px';
        themeToggleButton.innerHTML = '<i class="bi bi-moon"></i>';
        themeToggleButton.title = 'Chuyển sang chế độ tối';
        themeToggleButton.addEventListener('click', toggleTheme);
        document.body.appendChild(themeToggleButton);
        
        // Create feedback mode toggle
        feedbackModeToggle = document.createElement('div');
        feedbackModeToggle.className = 'btn-group mb-3 w-100';
        feedbackModeToggle.setAttribute('role', 'group');
        feedbackModeToggle.innerHTML = `
            <button type="button" class="btn ${feedbackMode === 'instant' ? 'btn-primary' : 'btn-outline-primary'}" id="instant-feedback">Hiển thị đáp án ngay</button>
            <button type="button" class="btn ${feedbackMode === 'end' ? 'btn-primary' : 'btn-outline-primary'}" id="end-feedback">Hiển thị đáp án cuối bài</button>
        `;
        document.querySelector('#quiz-settings .card-body .row').appendChild(feedbackModeToggle);
        
        document.getElementById('instant-feedback').addEventListener('click', () => {
            feedbackMode = 'instant';
            document.getElementById('instant-feedback').className = 'btn btn-primary';
            document.getElementById('end-feedback').className = 'btn btn-outline-primary';
        });
        
        document.getElementById('end-feedback').addEventListener('click', () => {
            feedbackMode = 'end';
            document.getElementById('end-feedback').className = 'btn btn-primary';
            document.getElementById('instant-feedback').className = 'btn btn-outline-primary';
        });
        
        // Add theme stylesheet
        const style = document.createElement('style');
        style.id = 'theme-style';
        style.textContent = `
            .dark-mode {
                background-color: #222;
                color: #f8f9fa;
            }
            .dark-mode .card {
                background-color: #333;
                color: #f8f9fa;
                border-color: #444;
            }
            .dark-mode .btn-primary {
                background-color: #0d6efd;
            }
            .dark-mode .btn-outline-primary {
                color: #0d6efd;
                border-color: #0d6efd;
            }
            .dark-mode .form-control, .dark-mode .form-select {
                background-color: #333;
                color: #f8f9fa;
                border-color: #444;
            }
            .option-item {
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 5px;
                cursor: pointer;
                border: 1px solid #dee2e6;
            }
            .dark-mode .option-item {
                border-color: #444;
            }
            .option-item:hover {
                background-color: #f8f9fa;
            }
            .dark-mode .option-item:hover {
                background-color: #444;
            }
            .option-item.correct {
                background-color: rgba(25, 135, 84, 0.2);
                border-color: #198754;
            }
            .option-item.incorrect {
                background-color: rgba(220, 53, 69, 0.2);
                border-color: #dc3545;
            }
            .dark-mode .option-item.correct {
                background-color: rgba(25, 135, 84, 0.3);
            }
            .dark-mode .option-item.incorrect {
                background-color: rgba(220, 53, 69, 0.3);
            }
        `;
        document.head.appendChild(style);
        
        // Load Bootstrap Icons
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
        document.head.appendChild(link);
        
        // Update home screen
        updateHomeScreen();
        
        await fetchQuestions();
        addEventListeners();
        
        // Show keyboard help
        keyboardHelp.classList.remove('d-none');
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Update home screen with modern design
function updateHomeScreen() {
    // Update title
    document.querySelector('h1').textContent = 'Trắc Nghiệm Quốc Phòng An Ninh';
    
    // Hide lesson selector
    const lessonFilterLabel = document.querySelector('label[for="lesson-filter"]').parentNode;
    lessonFilterLabel.style.display = 'none';
    
    // Update question count label
    document.querySelector('label[for="question-count"]').textContent = 'Bạn muốn làm bao nhiêu câu hỏi?';
    
    // Make question count take full width
    document.querySelector('label[for="question-count"]').parentNode.className = 'col-12 mb-3';
    
    // Update question count options
    questionCountSelect.innerHTML = `
        <option value="5">5 câu hỏi</option>
        <option value="10" selected>10 câu hỏi</option>
        <option value="20">20 câu hỏi</option>
        <option value="50">50 câu hỏi</option>
        <option value="all">Tất cả câu hỏi</option>
    `;
    
    // Update start button
    startQuizButton.innerHTML = '<i class="bi bi-play-fill"></i> Bắt đầu làm bài';
    startQuizButton.className = 'btn btn-primary btn-lg w-100';
    
    // Add card shadow
    document.querySelectorAll('.card').forEach(card => {
        card.classList.add('shadow');
    });
    
    // Set default value for lesson filter to 'all'
    lessonFilterSelect.value = 'all';
}

// Validate that all required DOM elements exist
function validateDomElements() {
    const requiredElements = [
        quizSettings,
        questionCountSelect,
        lessonFilterSelect,
        startQuizButton,
        progressContainer,
        progressBar,
        progressText,
        quizContainer,
        questionText,
        optionsContainer,
        nextButton,
        submitQuizButton,
        resultsContainer,
        totalScore,
        correctAnswers,
        incorrectAnswers,
        restartQuizButton,
        downloadResultsButton
    ];
    
    // Check if any element is null or undefined
    for (const element of requiredElements) {
        if (!element) {
            console.error('Missing element:', element);
            return false;
        }
    }
    
    return true;
}

// Add event listeners
function addEventListeners() {
    startQuizButton.addEventListener('click', startQuiz);
    nextButton.addEventListener('click', goToNextQuestion);
    submitQuizButton.addEventListener('click', submitQuiz);
    restartQuizButton.addEventListener('click', restartQuiz);
    downloadResultsButton.addEventListener('click', downloadResults);
    
    // Add Return Home button to results if it doesn't exist
    const resultActions = document.getElementById('result-actions');
    if (resultActions && !document.getElementById('return-home-results')) {
        const returnHomeResults = document.createElement('button');
        returnHomeResults.id = 'return-home-results';
        returnHomeResults.className = 'btn btn-outline-primary';
        returnHomeResults.textContent = 'Quay về trang chủ';
        returnHomeResults.addEventListener('click', returnToHome);
        resultActions.appendChild(returnHomeResults);
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Initially disable next button until an answer is selected
    nextButton.disabled = true;
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
    if (!quizStarted) return;
    
    // Keyboard shortcuts for question selection
    switch(event.key.toLowerCase()) {
        case 'a':
        case '1':
            selectOptionByKey('a');
            break;
        case 'b':
        case '2':
            selectOptionByKey('b');
            break;
        case 'c':
        case '3':
            selectOptionByKey('c');
            break;
        case 'd':
        case '4':
            selectOptionByKey('d');
            break;
        case ' ':
        case 'enter':
            if (questionAnswered) {
                if (currentQuestionIndex < currentQuestions.length - 1) {
                    goToNextQuestion();
                } else if (!submitQuizButton.classList.contains('d-none')) {
                    submitQuiz();
                }
            } else {
                const selectedRadio = document.querySelector('input[name="answer"]:checked');
                if (selectedRadio) {
                    const selectedKey = selectedRadio.value;
                    const correctKey = currentQuestions[currentQuestionIndex].answer;
                    showFeedback(selectedKey, correctKey);
                }
            }
            break;
        case 'escape':
            if (confirm('Bạn có muốn dừng bài kiểm tra hiện tại không?')) {
                restartQuiz();
            }
            break;
    }
}

// Select option by key
function selectOptionByKey(key) {
    if (questionAnswered) return;
    
    const optionItems = optionsContainer.querySelectorAll('.option-item');
    let targetOption = null;
    
    optionItems.forEach(option => {
        if (option.dataset.key === key) {
            targetOption = option;
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
            userAnswers[currentQuestionIndex] = key;
            questionAnswered = true;
            nextButton.disabled = false;
        } else {
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = false;
        }
    });
    
    // Show immediate feedback if in instant mode
    if (feedbackMode === 'instant' && targetOption) {
        showFeedback(key, currentQuestions[currentQuestionIndex].answer);
    }
    
    // Scroll to the selected option
    if (targetOption) {
        targetOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Start the quiz
function startQuiz() {
    const questionCount = questionCountSelect.value;
    const selectedLesson = lessonFilterSelect.value;
    
    // Filter questions by lesson if needed
    let filteredQuestions = selectedLesson === 'all'
        ? allQuestions
        : allQuestions.filter(q => q.lesson === selectedLesson);
    
    if (filteredQuestions.length === 0) {
        alert('Không có câu hỏi nào phù hợp với điều kiện lọc. Vui lòng chọn lại.');
        return;
    }
    
    // Shuffle filtered questions
    const shuffledQuestions = shuffleArray(filteredQuestions);
    
    // Select requested number of questions
    if (questionCount === 'all') {
        currentQuestions = shuffledQuestions;
    } else {
        const count = Math.min(parseInt(questionCount), shuffledQuestions.length);
        currentQuestions = shuffledQuestions.slice(0, count);
    }
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    questionAnswered = false;
    
    // Update UI
    quizSettings.classList.add('d-none');
    progressContainer.classList.remove('d-none');
    quizContainer.classList.remove('d-none');
    keyboardHelp.classList.remove('d-none');
    
    // Create Previous button if it doesn't exist
    if (!prevButton) {
        prevButton = document.createElement('button');
        prevButton.id = 'prev-button';
        prevButton.className = 'btn btn-secondary';
        prevButton.textContent = 'Câu trước';
        prevButton.addEventListener('click', goToPrevQuestion);
        nextButton.parentNode.insertBefore(prevButton, nextButton);
    }
    
    // Create Return Home button if it doesn't exist
    if (!returnHomeButton) {
        returnHomeButton = document.createElement('button');
        returnHomeButton.id = 'return-home-button';
        returnHomeButton.className = 'btn btn-outline-primary position-fixed';
        returnHomeButton.style.top = '10px';
        returnHomeButton.style.left = '10px';
        returnHomeButton.innerHTML = '<i class="bi bi-house"></i> Trang chủ';
        returnHomeButton.addEventListener('click', returnToHome);
        document.body.appendChild(returnHomeButton);
        returnHomeButton.style.zIndex = '1000';
    }
    
    // Create feedback container if it doesn't exist
    if (!feedbackContainer) {
        feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'feedback-container';
        feedbackContainer.className = 'd-none alert mt-3';
        document.getElementById('question-container').appendChild(feedbackContainer);
    }
    
    // Show first question
    showQuestion(currentQuestionIndex);
    updateProgress();
    
    quizStarted = true;
}

// Show the current question
function showQuestion(index) {
    const question = currentQuestions[index];
    
    // Reset state for new question
    questionAnswered = false;
    
    // Set question text
    questionText.textContent = question.question;
    
    // Add lesson info if available
    if (question.lesson) {
        const lessonInfo = document.createElement('small');
        lessonInfo.className = 'text-muted d-block mt-2';
        lessonInfo.textContent = question.lesson;
        questionText.appendChild(lessonInfo);
    }
    
    // Clear previous options and feedback
    optionsContainer.innerHTML = '';
    if (feedbackContainer) {
        feedbackContainer.innerHTML = '';
        feedbackContainer.className = 'd-none alert mt-3';
    }
    
    // Create options array for display
    const optionKeys = Object.keys(question.options);
    
    // Add options
    optionKeys.forEach(key => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.dataset.key = key;
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'answer';
        radio.id = `option-${key}`;
        radio.value = key;
        
        // Check if user has already selected this option
        if (userAnswers[index] === key) {
            radio.checked = true;
            questionAnswered = true;
            
            // Apply the appropriate styling for answered questions
            if (feedbackMode === 'instant') {
                const correctKey = question.answer;
                if (key === correctKey) {
                    optionDiv.classList.add('correct');
                } else {
                    optionDiv.classList.add('incorrect');
                    
                    // Find and mark the correct answer
                    setTimeout(() => {
                        const correctDiv = Array.from(optionsContainer.querySelectorAll('.option-item'))
                            .find(item => item.dataset.key === correctKey);
                        if (correctDiv) {
                            correctDiv.classList.add('correct');
                        }
                    }, 0);
                }
            }
        }
        
        const label = document.createElement('label');
        label.htmlFor = `option-${key}`;
        label.textContent = `${key.toUpperCase()}. ${question.options[key]}`;
        
        optionDiv.appendChild(radio);
        optionDiv.appendChild(label);
        
        // Add click event to the entire div
        optionDiv.addEventListener('click', () => {
            if (questionAnswered) return; // Prevent changing answer
            
            document.querySelectorAll('input[name="answer"]').forEach(radio => {
                radio.checked = false;
            });
            radio.checked = true;
            userAnswers[index] = key;
            questionAnswered = true;
            
            // Enable next button after selecting an answer
            nextButton.disabled = false;
            
            // Show immediate feedback if in instant mode
            if (feedbackMode === 'instant') {
                showFeedback(key, question.answer);
            }
        });
        
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update buttons
    if (index === 0) {
        prevButton.disabled = true;
    } else {
        prevButton.disabled = false;
    }
    
    // Enable next button if question is already answered
    nextButton.disabled = !questionAnswered;
    
    if (index === currentQuestions.length - 1) {
        nextButton.classList.add('d-none');
        submitQuizButton.classList.remove('d-none');
    } else {
        nextButton.classList.remove('d-none');
        submitQuizButton.classList.add('d-none');
    }
}

// Show feedback for current answer
function showFeedback(selectedKey, correctKey) {
    // Get all option elements
    const optionItems = optionsContainer.querySelectorAll('.option-item');
    
    // Loop through options to apply correct styling
    optionItems.forEach(item => {
        const key = item.dataset.key;
        
        if (key === selectedKey) {
            if (key === correctKey) {
                // Correct answer
                item.classList.add('correct');
                if (!userAnswers.includes(null)) {
                    score++;
                }
            } else {
                // Incorrect answer
                item.classList.add('incorrect');
            }
        } else if (key === correctKey && selectedKey !== correctKey) {
            // Highlight the correct answer when user selected wrong
            item.classList.add('correct');
        }
        
        // Disable further selections
        item.style.pointerEvents = 'none';
    });
    
    // Show feedback message
    if (feedbackContainer) {
        feedbackContainer.classList.remove('d-none');
        if (selectedKey === correctKey) {
            feedbackContainer.className = 'alert alert-success mt-3';
            feedbackContainer.innerHTML = `<strong>✅ Đúng!</strong>`;
        } else {
            feedbackContainer.className = 'alert alert-danger mt-3';
            feedbackContainer.innerHTML = `<strong>❌ Sai!</strong> Đáp án đúng là ${correctKey.toUpperCase()}.`;
        }
    }
    
    // Make sure next button is enabled
    nextButton.disabled = false;
}

// Update progress bar and text
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Câu hỏi ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
}

// Go to next question
function goToNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// Go to previous question
function goToPrevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// Return to home screen
function returnToHome() {
    // Ask for confirmation if quiz is in progress
    if (quizStarted && !confirm('Bạn có chắc muốn quay về trang chủ? Tiến trình làm bài sẽ được lưu lại.')) {
        return;
    }
    
    // Hide quiz components and show home screen
    quizContainer.classList.add('d-none');
    progressContainer.classList.add('d-none');
    resultsContainer.classList.add('d-none');
    keyboardHelp.classList.add('d-none');
    quizSettings.classList.remove('d-none');
}

// Toggle theme between light and dark
function toggleTheme() {
    darkMode = !darkMode;
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeToggleButton.innerHTML = '<i class="bi bi-sun"></i>';
        themeToggleButton.title = 'Chuyển sang chế độ sáng';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleButton.innerHTML = '<i class="bi bi-moon"></i>';
        themeToggleButton.title = 'Chuyển sang chế độ tối';
    }
}

// Toggle feedback mode between instant and end
function toggleFeedbackMode() {
    feedbackMode = feedbackMode === 'instant' ? 'end' : 'instant';
    feedbackModeToggle.textContent = `Chế độ phản hồi: ${feedbackMode === 'instant' ? 'Ngay lập tức' : 'Cuối bài'}`;
}

// Submit quiz and show results
function submitQuiz() {
    // If the last question hasn't been answered, show feedback first
    if (!questionAnswered) {
        const lastIndex = currentQuestionIndex;
        const selectedKey = userAnswers[lastIndex];
        if (selectedKey) {
            showFeedback(selectedKey, currentQuestions[lastIndex].answer);
        }
    }
    
    // Calculate final score (already updated during showFeedback)
    let finalScore = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (userAnswers[i] === currentQuestions[i].answer) {
            finalScore++;
        }
    }
    score = finalScore;
    
    // Calculate percentage
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    // Display results
    totalScore.textContent = `Điểm: ${score}/${currentQuestions.length} (${percentage}%)`;
    correctAnswers.textContent = `Trả lời đúng: ${score}`;
    incorrectAnswers.textContent = `Trả lời sai: ${currentQuestions.length - score}`;
    
    // Show result page
    quizContainer.classList.add('d-none');
    progressContainer.classList.add('d-none');
    resultsContainer.classList.remove('d-none');
    keyboardHelp.classList.add('d-none');
    
    // Show feedback on answers
    showAnswerFeedback();
}

// Show feedback for all answers
function showAnswerFeedback() {
    // Create a container for the feedback if it doesn't exist
    let feedbackContainer = document.getElementById('feedback-container');
    
    if (!feedbackContainer) {
        feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'feedback-container';
        feedbackContainer.className = 'mt-4';
        
        const header = document.createElement('h4');
        header.textContent = 'Xem lại đáp án:';
        feedbackContainer.appendChild(header);
        
        resultsContainer.querySelector('.card-body').appendChild(feedbackContainer);
    } else {
        feedbackContainer.innerHTML = '<h4>Xem lại đáp án:</h4>';
    }
    
    // Add feedback for each question
    currentQuestions.forEach((question, index) => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'card mb-3';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const questionNum = document.createElement('h5');
        questionNum.textContent = `Câu ${index + 1}`;
        
        const questionContent = document.createElement('p');
        questionContent.textContent = question.question;
        
        // Add lesson info if available
        if (question.lesson) {
            const lessonInfo = document.createElement('small');
            lessonInfo.className = 'text-muted d-block mb-2';
            lessonInfo.textContent = question.lesson;
            cardBody.appendChild(questionNum);
            cardBody.appendChild(lessonInfo);
        } else {
            cardBody.appendChild(questionNum);
        }
        
        cardBody.appendChild(questionContent);
        
        const userAnswer = document.createElement('p');
        const isCorrect = userAnswers[index] === question.answer;
        
        if (userAnswers[index]) {
            userAnswer.innerHTML = `Câu trả lời của bạn: <span class="${isCorrect ? 'text-success' : 'text-danger'}">
                                    ${userAnswers[index].toUpperCase()}. ${question.options[userAnswers[index]]}</span>`;
        } else {
            userAnswer.innerHTML = `<span class="text-danger">Bạn chưa trả lời câu hỏi này</span>`;
        }
        
        const correctAnswer = document.createElement('p');
        if (!isCorrect) {
            correctAnswer.innerHTML = `Đáp án đúng: <span class="text-success">
                                      ${question.answer.toUpperCase()}. ${question.options[question.answer]}</span>`;
        }
        
        cardBody.appendChild(userAnswer);
        if (!isCorrect) {
            cardBody.appendChild(correctAnswer);
        }
        
        // Add explanation if available
        if (question.explanation) {
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'alert alert-info mt-2';
            explanationDiv.innerHTML = `<strong>Giải thích:</strong> ${question.explanation}`;
            cardBody.appendChild(explanationDiv);
        }
        
        feedbackItem.appendChild(cardBody);
        feedbackContainer.appendChild(feedbackItem);
    });
}

// Download results as a text file
function downloadResults() {
    // Create content
    let content = "KẾT QUẢ BÀI KIỂM TRA\n\n";
    content += `Điểm số: ${score}/${currentQuestions.length} (${Math.round((score / currentQuestions.length) * 100)}%)\n`;
    content += `Số câu đúng: ${score}\n`;
    content += `Số câu sai: ${currentQuestions.length - score}\n\n`;
    content += "CHI TIẾT TỪNG CÂU HỎI:\n\n";
    
    currentQuestions.forEach((question, index) => {
        content += `Câu ${index + 1}: ${question.question}\n`;
        if (question.lesson) {
            content += `(${question.lesson})\n`;
        }
        
        const userAns = userAnswers[index];
        const correctAns = question.answer;
        
        if (userAns) {
            content += `Câu trả lời của bạn: ${userAns.toUpperCase()}. ${question.options[userAns]}\n`;
        } else {
            content += "Bạn không trả lời câu hỏi này.\n";
        }
        
        if (userAns !== correctAns) {
            content += `Đáp án đúng: ${correctAns.toUpperCase()}. ${question.options[correctAns]}\n`;
        }
        
        content += `Kết quả: ${userAns === correctAns ? "Đúng" : "Sai"}\n`;
        
        // Add explanation if available
        if (question.explanation) {
            content += `Giải thích: ${question.explanation}\n`;
        }
        
        content += "\n";
    });
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ket-qua-kiem-tra-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Restart the quiz
function restartQuiz() {
    resultsContainer.classList.add('d-none');
    quizSettings.classList.remove('d-none');
    
    // Remove feedback container if exists
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        feedbackContainer.remove();
    }
    
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    quizStarted = false;
    questionAnswered = false;
    
    // Update question count options
    updateQuestionCountOptions();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 