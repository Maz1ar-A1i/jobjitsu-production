export const PRACTICE_DATA = {
  frontend: {
    title: "Frontend Development",
    guidelines: [
      "Review React lifecycle methods and hooks (useEffect, useState, etc.).",
      "Understand closures, hoisting, and event delegation in JavaScript.",
      "Brush up on CSS Flexbox, Grid, and responsive design principles.",
      "Be prepared to discuss state management (Redux, Zustand, Context API).",
      "Know how to optimize web performance (lazy loading, memoization, core web vitals)."
    ],
    technicalQuestions: [
      { q: "Explain the virtual DOM and how React uses it.", hint: "React creates an in-memory representation. It diffs this with the real DOM and only updates varied nodes." },
      { q: "What is the difference between var, let, and const?", hint: "var is function-scoped and hoisted. let and const are block-scoped." },
      { q: "How do you handle unmounting in a useEffect hook?", hint: "Return a cleanup function from the useEffect callback." },
      { q: "What is event bubbling?", hint: "Events trigger on the deepest element and propagate upwards." },
      { q: "Explain what promises are and how async/await works.", hint: "Promises represent async operations. async/await provides syntactic sugar to write async code synchronously." },
      { q: "What is CSS Specificity?", hint: "The algorithm browsers use to determine which CSS rule applies if multiple rules match." },
      { q: "Explain Cross-Origin Resource Sharing (CORS).", hint: "A mechanism letting a server indicate any origins other than its own from which a browser should permit loading resources." },
      { q: "What are semantic HTML tags?", hint: "Tags like <article>, <nav>, <header> that clearly describe their meaning to both the browser and developer." }
    ],
    behavioralQuestions: [
      { q: "Tell me about a time you had a conflict with a team member.", hint: "Focus on communication, empathy, and how you reached a resolution." },
      { q: "Describe a project that failed and what you learned.", hint: "Take accountability, analyze the root cause, and explain the lessons applied later." },
      { q: "How do you handle tight deadlines?", hint: "Discuss prioritization, communication with stakeholders, and breaking tasks down." },
      { q: "Give an example of when you learned a new technology quickly.", hint: "Highlight your adaptable learning process and hands-on approach." },
      { q: "Why do you want to work for our company?", hint: "Align your values and goals with the company's mission and culture." }
    ],
    codeSnippets: [
      { title: "Two Sum", difficulty: "Easy", language: "javascript", starterCode: "function twoSum(nums, target) {\n  // Print index of two numbers that add up to target\n  \n}\n\nconsole.log('Expected: [0, 1]');\nconsole.log('Result:  ', twoSum([2,7,11,15], 9));", link: "https://leetcode.com/problems/two-sum/" },
      { title: "Reverse String", difficulty: "Easy", language: "javascript", starterCode: "function reverseStr(str) {\n  // return reversed string\n}\n\nconsole.log('Expected: ustiJboJ');\nconsole.log('Result:  ', reverseStr('JobJitsu'));", link: "https://leetcode.com/problems/valid-parentheses/" },
      { title: "Implement Debounce", difficulty: "Medium", language: "javascript", starterCode: "function debounce(func, delay) {\n  \n}\nconsole.log('Test debounce locally');", link: "https://playcode.io/javascript" },
      { title: "Array Flattening", difficulty: "Medium", language: "javascript", starterCode: "function flatten(arr) {\n  // flatten 2D array\n}\n\nconsole.log('Expected: [1,2,3,4]');\nconsole.log('Result:  ', flatten([1, [2, [3, 4]]]));", link: "https://playcode.io/javascript" },
      { title: "Deep Clone", difficulty: "Medium", language: "javascript", starterCode: "function deepClone(obj) {\n  // clone nested object\n}\nconsole.log('Test deepClone({a:1, b:{c:2}})');\nconsole.log('Result:', deepClone({a:1, b:{c:2}}));", link: "https://playcode.io/javascript" }
    ],
    videos: [
      { title: "React Full Course", youtubeId: "bMknfKXIFA8", duration: "7:08:00" },
      { title: "JavaScript Full Course", youtubeId: "jS4aFq5-91M", duration: "3:26:00" },
      { title: "HTML & CSS Tutorial", youtubeId: "mU6anWqZJcc", duration: "11:30:00" },
      { title: "Git and GitHub for Beginners", youtubeId: "RGOj5yH7evk", duration: "1:08:00" },
      { title: "Frontend Web Development Bootcamp", youtubeId: "zJSY8tbf_ys", duration: "21:15:00" }
    ]
  },
  backend: {
    title: "Backend Development",
    guidelines: [
      "Understand RESTful API design principles and HTTP methods.",
      "Review database concepts: SQL vs NoSQL, indexing, ACID properties.",
      "Be ready to discuss caching strategies (Redis, Memcached).",
      "Understand authentication mechanisms (JWT, OAuth, Cookies).",
      "Review basic system design: Load balancing, microservices, scaling."
    ],
    technicalQuestions: [
      { q: "What is the difference between SQL and NoSQL databases?", hint: "SQL is relational and table-based; NoSQL is non-relational." },
      { q: "Explain what an index is in a database.", hint: "A data structure that improves the speed of data retrieval operations." },
      { q: "What are the core principles of REST?", hint: "Statelessness, client-server architecture, cacheability." },
      { q: "How does JWT authentication work?", hint: "Client sends credentials, server signs a token. Client stores and sends it." },
      { q: "What is a transaction in a database?", hint: "A sequence of operations performed as a single logical unit of work (ACID)." },
      { q: "What is a connection pool?", hint: "A cache of database connections maintained so that they can be reused." },
      { q: "Explain consistent hashing.", hint: "A distributed hashing scheme that operates independently of the number of servers or objects." }
    ],
    behavioralQuestions: [
      { q: "Tell me about a time you optimized slow code.", hint: "Discuss profiling, identifying the bottleneck, and the specific solution." },
      { q: "Have you ever caused a critical production bug?", hint: "Focus on the resolution, communication, and the preventive measures added." },
      { q: "How do you prioritize tech debt vs feature work?", hint: "Balancing business needs with maintainability." },
      { q: "Describe a time you completely disagreed with an architecture decision.", hint: "Professional disagreement and 'disagree and commit'." },
      { q: "How do you keep up with new backend technologies?", hint: "Blogs, side projects, conferences." }
    ],
    codeSnippets: [
      { title: "Design Rate Limiter logic", difficulty: "Medium", language: "javascript", starterCode: "function checkRateLimit(userId) {\n  // return boolean\n}\n\nconsole.log('Expected: true/false');\nconsole.log('Result:  ', checkRateLimit('user123'));", link: "https://leetcode.com/" },
      { title: "Merge Intervals", difficulty: "Medium", language: "javascript", starterCode: "function merge(intervals) {\n  \n}\n\nconsole.log('Expected: [[1,6],[8,10]]');\nconsole.log('Result:  ', merge([[1,3],[2,6],[8,10]]));", link: "https://leetcode.com/problems/merge-intervals/" },
      { title: "Find the Duplicate Number", difficulty: "Medium", language: "javascript", starterCode: "function findDuplicate(nums) {\n  \n}\n\nconsole.log('Expected: 2');\nconsole.log('Result:  ', findDuplicate([1,3,4,2,2]));", link: "https://leetcode.com/problems/find-the-duplicate-number/" },
      { title: "Design Thread-Safe Queue (MOCK)", difficulty: "Hard", language: "javascript", starterCode: "class ConcurrentQueue {\n  \n}\nconsole.log('Mocked in JS');", link: "https://playcode.io" }
    ],
    videos: [
      { title: "Node.js and Express.js - Full Course", youtubeId: "Oe421EPjeBE", duration: "8:16:00" },
      { title: "SQL Tutorial - Full Database Course", youtubeId: "HXV3zeJZ1EQ", duration: "4:20:00" },
      { title: "APIs for Beginners", youtubeId: "GZvSYJDk-us", duration: "2:18:00" },
      { title: "Microservices Architecture Tutorial", youtubeId: "rv4LlOgsCEw", duration: "1:26:00" },
      { title: "Docker Crash Course", youtubeId: "fqMOX6JJhGo", duration: "1:23:00" }
    ]
  },
  datascience: {
    title: "Data Science & ML",
    guidelines: [
      "Review fundamental ML algorithms (Linear/Logistic regression, Forests, SVM).",
      "Understand model evaluation metrics (Precision, Recall, F1-Score).",
      "Be prepared to write Pandas and SQL for data manipulation.",
      "Understand techniques for handling isolated/missing data.",
      "Review basic statistical concepts (hypothesis tuning, A/B testing)."
    ],
    technicalQuestions: [
      { q: "What is overfitting and how do you prevent it?", hint: "When a model learns noise. Prevent via cross-validation, regularization." },
      { q: "Explain Precision and Recall.", hint: "Precision: True positives / Predicted Positives. Recall: True Pos / Actual Pos." },
      { q: "How does a Random Forest work?", hint: "Ensemble of decision trees trained on bootstrap samples." },
      { q: "What is the curse of dimensionality?", hint: "Data space becomes sparse as dimensions grow." },
      { q: "Explain A/B testing.", hint: "Randomized experiment testing two variants against a control." },
      { q: "What is PCA?", hint: "Principal Component Analysis. A dimensionality reduction technique." }
    ],
    behavioralQuestions: [
      { q: "Describe a time your model failed in prod.", hint: "Focus on data drift and retraining loops." },
      { q: "How do you explain ML to non-technical folks?", hint: "Analogies, focus on business impact." },
      { q: "Tell me about a messy dataset you cleaned.", hint: "Imputation techniques, outlier handling." },
      { q: "How do you pick an algorithm?", hint: "Start with simple baselines." },
      { q: "Impactful insight from data?", hint: "Tie analysis to actionable revenue/cost optimization." }
    ],
    codeSnippets: [
      { title: "Pandas: Groupby Sales MOCK", difficulty: "Easy", language: "javascript", starterCode: "// JS array logic representing Pandas DataFrame\nfunction summarize(data) {\n  \n}\nconsole.log(summarize([{city:'NY', sales:10}, {city:'NY', sales:20}]));", link: "https://leetcode.com/" },
      { title: "Implement Binary Search", difficulty: "Easy", language: "javascript", starterCode: "function binary_search(arr, target) {\n  \n}\nconsole.log(binary_search([1,2,3,4,5], 3));", link: "https://leetcode.com/" }
    ],
    videos: [
      { title: "Data Analysis with Python Course", youtubeId: "r-uOLQRoVkM", duration: "9:51:00" },
      { title: "Machine Learning for Everybody", youtubeId: "i_LwzRVP7bg", duration: "3:53:00" },
      { title: "Python for Beginners", youtubeId: "eWRfhZUzrAc", duration: "4:26:00" },
      { title: "Data Structures Easy to Advanced", youtubeId: "8hly31xKli0", duration: "8:03:00" },
      { title: "Statistics and Probability Full Course", youtubeId: "xxpc-HPKN28", duration: "11:23:00" }
    ]
  },
  hr: {
    title: "HR & Behavioral",
    guidelines: [
      "Use the STAR method (Situation, Task, Action, Result).",
      "Prepare anecdotes that showcase leadership and adaptability.",
      "Research the company's core values.",
      "Have 2-3 thoughtful questions ready to ask.",
      "Focus on positive framing, even when describing failures."
    ],
    technicalQuestions: [
      { q: "What is your greatest weakness?", hint: "Share a real weakness and active steps taken to overcome it." },
      { q: "Where do you see yourself in 5 years?", hint: "Align career goals with company trajectory." },
      { q: "Why are you leaving your current job?", hint: "Keep it positive. Seek new challenges." },
      { q: "What is your management style?", hint: "Servant leadership, adapting to team members." },
      { q: "How do you handle bad news?", hint: "Direct, empathetic, with solutions." }
    ],
    behavioralQuestions: [
      { q: "Persuading a colleague of your idea.", hint: "Active listening, presenting data." },
      { q: "Describe a time you failed.", hint: "Own the failure, root cause, lesson learned." },
      { q: "Going above and beyond.", hint: "Intrinsic motivation." },
      { q: "Working with a difficult person.", hint: "Maintain professionalism." },
      { q: "Handling critical feedback.", hint: "Demonstrate a growth mindset." }
    ],
    codeSnippets: [],
    videos: [
      { title: "Mock Software Engineer Interview", youtubeId: "78M_LzL-CVA", duration: "25:00" },
      { title: "Behavioral Interview Prep", youtubeId: "P_6vDLq64gE", duration: "14:50" },
      { title: "How to Answer 'Tell Me About Yourself'", youtubeId: "Mm6yYvA5fEM", duration: "10:00" },
      { title: "Google Coding Interview With A College Student", youtubeId: "3Q_oYDQ2whs", duration: "40:00" }
    ]
  }
};
