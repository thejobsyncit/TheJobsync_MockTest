// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IT_ROLES = [
  "Software Developer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "Web Developer", "Mobile App Developer",
  "Android Developer", "iOS Developer", "Python Developer",
  "Java Developer", ".NET Developer", "PHP Developer",
  "React Developer", "Node.js Developer", "UI/UX Designer",
  "Data Analyst", "Data Scientist", "Business Analyst",
  "AI/ML Engineer", "DevOps Engineer", "Cloud Engineer",
  "Cybersecurity Analyst", "Network Engineer", "System Administrator",
  "Database Administrator", "QA Engineer", "Software Tester",
  "Automation Tester", "Technical Support Engineer", "IT Support Executive",
  "IT Project Manager", "Product Manager", "Scrum Master",
  "Solutions Architect", "Blockchain Developer", "Game Developer",
  "SEO Specialist", "Digital Marketing Specialist", "Content Writer",
  "Technical Writer"
];

const GENERAL_ROLES = [
  "General Candidate"
];

const NON_IT_ROLES = [
  "HR Executive", "HR Manager", "Recruiter", "Talent Acquisition Executive",
  "Payroll Executive", "Accountant", "Finance Executive", "Financial Analyst",
  "Banking Executive", "Insurance Executive", "Sales Executive", "Sales Manager",
  "Business Development Executive", "Business Development Manager", "Marketing Executive",
  "Marketing Manager", "Digital Marketing Executive", "Customer Care Executive",
  "Customer Support Executive", "Telecaller", "Back Office Executive", "Data Entry Operator",
  "Office Administrator", "Administrative Executive", "Receptionist", "Front Office Executive",
  "Operations Executive", "Operations Manager", "Logistics Executive", "Supply Chain Executive",
  "Procurement Executive", "Purchase Executive", "Store Manager", "Warehouse Executive",
  "Inventory Executive", "Retail Sales Executive", "Store Executive", "Relationship Manager",
  "Account Manager", "Legal Executive", "Legal Assistant", "Content Writer", "Copywriter",
  "Graphic Designer", "Video Editor", "Social Media Executive", "Social Media Manager",
  "Teacher", "Tutor", "Trainer", "School Coordinator", "Healthcare Executive",
  "Medical Representative", "Hospital Administrator", "Pharmacist", "Lab Technician",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Production Engineer",
  "Quality Control Executive", "Quality Assurance Executive", "Manufacturing Executive",
  "Site Engineer", "Architect", "Interior Designer", "Real Estate Executive", "Hotel Manager",
  "Chef", "Restaurant Manager", "Hospitality Executive", "Travel Consultant", "Customer Relationship Executive"
];

const aptitudeQuestions = [
  { q: "What is 15% of 200?", options: ["20", "30", "40", "50"], a: "B", explanation: "15/100 * 200 = 30" },
  { q: "If a shirt is bought for $40 and sold for $50, what is the profit percentage?", options: ["20%", "25%", "30%", "40%"], a: "B", explanation: "Profit = 50-40 = 10. (10/40)*100 = 25%" },
  { q: "If A:B is 2:3 and B:C is 4:5, what is A:B:C?", options: ["8:12:15", "2:3:5", "8:10:15", "6:12:15"], a: "A", explanation: "A:B = 8:12, B:C = 12:15 => A:B:C = 8:12:15" },
  { q: "The average of 5 numbers is 20. If one number is removed, the average becomes 22. What was the removed number?", options: ["10", "12", "14", "16"], a: "B", explanation: "Sum = 100. New sum = 88. Removed = 100 - 88 = 12." },
  { q: "A can do a work in 10 days, and B can do it in 15 days. How long will they take working together?", options: ["5 days", "6 days", "8 days", "10 days"], a: "B", explanation: "(1/10 + 1/15) = 5/30 = 1/6. So 6 days." },
  { q: "A train running at 72 km/hr crosses a pole in 10 seconds. What is the length of the train?", options: ["150m", "200m", "250m", "300m"], a: "B", explanation: "Speed = 72 * (5/18) = 20 m/s. Distance = 20 * 10 = 200m." },
  { q: "Calculate the simple interest on $1000 at 5% per annum for 2 years.", options: ["$50", "$100", "$150", "$200"], a: "B", explanation: "SI = (1000 * 5 * 2) / 100 = 100." },
  { q: "If the sum of two numbers is 30 and their difference is 10, what is the larger number?", options: ["15", "20", "25", "30"], a: "B", explanation: "x+y=30, x-y=10. 2x=40 => x=20." },
  { q: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?", options: ["$0.05", "$0.10", "$0.15", "$0.20"], a: "A", explanation: "Bat = 1.05, Ball = 0.05." },
  { q: "What is the next number in the series: 2, 6, 12, 20, 30, ...?", options: ["38", "40", "42", "44"], a: "C", explanation: "Differences are 4, 6, 8, 10, 12. 30 + 12 = 42." },
  { q: "Which number is a prime number?", options: ["9", "15", "21", "23"], a: "D", explanation: "23 is only divisible by 1 and itself." },
  { q: "If a pipe fills a tank in 4 hours and another empties it in 6 hours, how long to fill the tank if both are open?", options: ["10 hours", "12 hours", "14 hours", "16 hours"], a: "B", explanation: "Net rate = (1/4 - 1/6) = 1/12. Time = 12 hours." },
  { q: "The ratio of boys to girls is 3:2. If there are 150 students, how many are girls?", options: ["40", "50", "60", "90"], a: "C", explanation: "2/5 * 150 = 60." },
  { q: "What is 20% of 40% of 500?", options: ["30", "40", "50", "60"], a: "B", explanation: "0.2 * 0.4 * 500 = 40." },
  { q: "If an item is discounted by 20% twice, what is the net discount?", options: ["36%", "40%", "44%", "50%"], a: "A", explanation: "100 -> 80 -> 64. Net discount = 36%." }
];

const grammarQuestions = [
  { q: "Identify the correct sentence:", options: ["She don't like apples.", "She doesn't likes apples.", "She doesn't like apples.", "She don't likes apples."], a: "C", explanation: "Third-person singular takes 'doesn't' and the base verb 'like'." },
  { q: "Which tense is used in: 'I have been working here for 5 years'?", options: ["Simple Past", "Present Perfect", "Present Perfect Continuous", "Past Continuous"], a: "C", explanation: "'Have been working' is Present Perfect Continuous." },
  { q: "What is the synonym of 'Abundant'?", options: ["Scarce", "Plentiful", "Rare", "Limited"], a: "B", explanation: "Abundant means existing or available in large quantities; plentiful." },
  { q: "What is the antonym of 'Transparent'?", options: ["Opaque", "Clear", "Translucent", "Visible"], a: "A", explanation: "Opaque means not able to be seen through; not transparent." },
  { q: "If APPLE is coded as BQQMF, how is MANGO coded?", options: ["NCOIP", "NBOHP", "MBNHP", "NBPGP"], a: "B", explanation: "Each letter is shifted by +1. M->N, A->B, N->O, G->H, O->P." },
  { q: "Complete the analogy - Book : Author :: Painting : ?", options: ["Brush", "Artist", "Canvas", "Gallery"], a: "B", explanation: "An author creates a book, an artist creates a painting." },
  { q: "Arrange logically: 1. Rain 2. Vaporization 3. Water 4. Condensation 5. Cloud", options: ["3,2,4,5,1", "3,2,5,4,1", "2,3,4,5,1", "3,4,2,5,1"], a: "B", explanation: "Water -> Vaporization -> Cloud -> Condensation -> Rain." },
  { q: "Select the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], a: "C", explanation: "'Accommodate' has two c's and two m's." },
  { q: "Choose the correct preposition: 'She is good ___ mathematics.'", options: ["in", "at", "with", "about"], a: "B", explanation: "'Good at' is the correct prepositional phrase." },
  { q: "What does the idiom 'Bite the bullet' mean?", options: ["To eat quickly", "To endure a painful situation bravely", "To start a fight", "To ignore a problem"], a: "B", explanation: "It means to accept something difficult or unpleasant." },
  { q: "Identify the part of speech of the word 'quickly' in 'She ran quickly.'", options: ["Noun", "Verb", "Adjective", "Adverb"], a: "D", explanation: "It describes the verb 'ran', so it is an adverb." },
  { q: "Which is a compound sentence?", options: ["I like tea.", "I like tea and coffee.", "I like tea, but he likes coffee.", "Because I like tea, I drink it."], a: "C", explanation: "It has two independent clauses joined by a coordinating conjunction." },
  { q: "Complete the series: A, C, F, J, ...?", options: ["M", "N", "O", "P"], a: "C", explanation: "A(+2)C, C(+3)F, F(+4)J, J(+5)O." },
  { q: "Find the odd one out:", options: ["Triangle", "Square", "Circle", "Rectangle"], a: "C", explanation: "Circle has no straight edges or corners." },
  { q: "What is the plural of 'Criterion'?", options: ["Criterions", "Criteria", "Criterion", "Criterias"], a: "B", explanation: "The plural form is 'Criteria'." }
];

const genericTechQuestions = [
  { q: "What is the output of this C code?\n\nint x = 5;\nprintf(\"%d\", x++);", options: ["5", "6", "Compiler Error", "Garbage Value"], a: "A", explanation: "Post-increment (x++) returns the original value before incrementing. So 5 is printed, then x becomes 6." },
  { q: "What is the output of this JavaScript code?\n\nconsole.log(typeof null);", options: ["'null'", "'undefined'", "'object'", "'string'"], a: "C", explanation: "In JavaScript, typeof null is notoriously evaluated as 'object' due to a legacy bug in the language." },
  { q: "What is the output of this Python snippet?\n\nprint(2 ** 3 ** 2)", options: ["64", "512", "72", "Exception"], a: "B", explanation: "Exponentiation (**) is right-associative in Python. So it evaluates as 2 ** (3 ** 2) = 2 ** 9 = 512." },
  { q: "What will this Java code print?\n\nString a = new String(\"test\");\nString b = new String(\"test\");\nSystem.out.println(a == b);", options: ["true", "false", "Compilation Error", "Runtime Exception"], a: "B", explanation: "The == operator in Java compares object references, not content." },
  { q: "What is the time complexity of the following code?\n\nfor(int i=0; i<n; i++) {\n  for(int j=i; j<n; j++) {\n    // O(1) operation\n  }\n}", options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"], a: "C", explanation: "The inner loop runs n-i times, resulting in O(n^2) total iterations." },
  { q: "How do you define a function in JavaScript that doesn't bind its own 'this'?", options: ["function myFunc() {}", "const myFunc = function() {}", "const myFunc = () => {}", "def myFunc():"], a: "C", explanation: "Arrow functions (() => {}) do not have their own 'this' binding." },
  { q: "What is the output of this Python code?\n\ndef f(x, l=[]):\n    l.append(x)\n    return l\nprint(f(1))\nprint(f(2))", options: ["[1]\n[2]", "[1]\n[1, 2]", "[1]\n[2, 1]", "Error"], a: "B", explanation: "Default arguments in Python are evaluated once at function definition." },
  { q: "What is the output of this JavaScript snippet?\n\nconsole.log(0.1 + 0.2 == 0.3);", options: ["true", "false", "undefined", "NaN"], a: "B", explanation: "Due to floating-point precision issues in JavaScript, 0.1 + 0.2 evaluates to 0.30000000000000004." },
  { q: "Which HTTP method should be used to completely replace an existing resource on a server?", options: ["GET", "POST", "PUT", "PATCH"], a: "C", explanation: "PUT is designed to completely replace an existing resource." },
  { q: "What will be printed in JavaScript?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1);\n}", options: ["0 1 2", "1 2 3", "3 3 3", "undefined"], a: "C", explanation: "Because 'var' does not have block scope, by the time the callbacks run, 'i' is 3." }
];

const frontendQuestions = [
  { q: "What is the output of this React code?\n\nconst [count, setCount] = useState(0);\nsetCount(count + 1);\nsetCount(count + 1);\nconsole.log(count);", options: ["0", "1", "2", "Undefined"], a: "A", explanation: "State updates are asynchronous. The console.log runs before the state actually updates." },
  { q: "Which CSS property is used to change the background color?", options: ["color", "bgcolor", "background-color", "bg-color"], a: "C", explanation: "background-color sets the background color of an element." },
  { q: "What is the purpose of the 'useEffect' hook in React?", options: ["To manage state", "To perform side effects", "To create context", "To handle routing"], a: "B", explanation: "useEffect is used to perform side effects like data fetching or DOM manipulation." },
  { q: "In CSS Flexbox, which property aligns items along the main axis?", options: ["align-items", "justify-content", "align-content", "flex-direction"], a: "B", explanation: "justify-content aligns items along the main axis, while align-items aligns them along the cross axis." },
  { q: "What does HTML semantics mean?", options: ["Writing HTML faster", "Using correct tags to describe the meaning of content (e.g., <header>, <article>)", "Styling HTML with CSS automatically", "Using JavaScript to parse HTML"], a: "B", explanation: "Semantic HTML uses tags that convey the meaning of the content, improving accessibility and SEO." },
  { q: "What is the output of this JS code?\n\nconsole.log(1 + '1' - 1);", options: ["11", "1", "10", "NaN"], a: "C", explanation: "1 + '1' becomes '11' (string concatenation). '11' - 1 coerces the string to a number, resulting in 10." },
  { q: "Which hook is used to access the DOM node directly in React?", options: ["useState", "useEffect", "useRef", "useContext"], a: "C", explanation: "useRef returns a mutable ref object whose .current property is initialized to the passed argument." },
  { q: "What is the default position value in CSS?", options: ["relative", "absolute", "fixed", "static"], a: "D", explanation: "static is the default position for all elements in CSS." },
  { q: "How do you pass data from a parent component to a child component in React?", options: ["Using Context", "Using Redux", "Using Props", "Using State"], a: "C", explanation: "Props (properties) are the standard way to pass data down the component tree." },
  { q: "What is a Closure in JavaScript?", options: ["A locked object", "A function bundled with its lexical environment", "A method to close browser tabs", "A secure way to store passwords"], a: "B", explanation: "A closure gives you access to an outer function's scope from an inner function." }
];

const backendQuestions = [
  { q: "What is the purpose of the 'next' function in Express.js middleware?", options: ["To send the response", "To throw an error", "To pass control to the next middleware function", "To close the connection"], a: "C", explanation: "Calling next() passes control to the next middleware in the stack." },
  { q: "Which SQL command is used to add new rows to a table?", options: ["ADD", "INSERT INTO", "UPDATE", "APPEND"], a: "B", explanation: "INSERT INTO is used to insert new records in a table." },
  { q: "What is an ORM?", options: ["Object Relational Mapping", "Online Resource Management", "Operational Runtime Module", "Object REST Model"], a: "A", explanation: "ORM is a technique that lets you query and manipulate data from a database using an object-oriented paradigm." },
  { q: "In Node.js, how do you import a CommonJS module?", options: ["import module from 'module'", "include 'module'", "require('module')", "load('module')"], a: "C", explanation: "require() is the built-in function used to include CommonJS modules in Node.js." },
  { q: "What is the difference between SQL and NoSQL?", options: ["SQL is for web, NoSQL is for mobile", "SQL is relational and structured, NoSQL is non-relational and document-oriented", "SQL is faster than NoSQL", "There is no difference"], a: "B", explanation: "SQL databases use structured tables, while NoSQL databases use flexible documents, key-values, etc." },
  { q: "What HTTP status code represents 'Not Found'?", options: ["200", "400", "404", "500"], a: "C", explanation: "404 Not Found indicates the server cannot find the requested resource." },
  { q: "What is a primary key in a database?", options: ["The first column in a table", "A unique identifier for each record in a table", "A password to access the database", "A foreign key in another table"], a: "B", explanation: "A primary key uniquely identifies each record in a relational database table." },
  { q: "How does Node.js handle concurrency?", options: ["Using multiple threads", "Using an Event Loop and non-blocking I/O", "By creating new processes", "It does not handle concurrency"], a: "B", explanation: "Node.js uses a single-threaded event loop architecture to handle multiple concurrent clients efficiently." },
  { q: "What does REST stand for?", options: ["Representational State Transfer", "Remote Execution System Technology", "Relational Server Transmission", "Runtime Environment Standard Transfer"], a: "A", explanation: "REST is an architectural style for providing standards between computer systems on the web." },
  { q: "Which hashing algorithm is widely considered secure for storing passwords today?", options: ["MD5", "SHA-1", "bcrypt", "Base64"], a: "C", explanation: "bcrypt is a password-hashing function designed to be slow and computationally expensive, resisting brute-force attacks." }
];

const dataQuestions = [
  { q: "What is a DataFrame in Pandas?", options: ["A 1D array", "A 2D labeled data structure", "A 3D tensor", "A database connection"], a: "B", explanation: "A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types." },
  { q: "Which SQL clause is used to filter the results of a GROUP BY?", options: ["WHERE", "ORDER BY", "HAVING", "FILTER"], a: "C", explanation: "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions." },
  { q: "What does standard deviation measure?", options: ["The average of the data", "The middle value", "The amount of variation or dispersion of a set of values", "The most frequent value"], a: "C", explanation: "Standard deviation is a measure of the amount of variation or dispersion of a set of values." },
  { q: "In Python, which library is predominantly used for machine learning?", options: ["Flask", "Scikit-learn", "Requests", "BeautifulSoup"], a: "B", explanation: "Scikit-learn is a free software machine learning library for the Python programming language." },
  { q: "What is the difference between a LEFT JOIN and an INNER JOIN?", options: ["INNER JOIN returns all records, LEFT JOIN returns matched records", "LEFT JOIN returns all records from the left table and matched from the right, INNER JOIN returns only matched records", "There is no difference", "LEFT JOIN is faster"], a: "B", explanation: "LEFT JOIN guarantees all rows from the left table are returned, while INNER JOIN strictly requires matches." },
  { q: "What is 'Overfitting' in Machine Learning?", options: ["Training too fast", "When a model learns the detail and noise in the training data to the extent that it negatively impacts the performance on new data", "Using too much memory", "Underperforming on the training set"], a: "B", explanation: "Overfitting means the model fits the training data too well, memorizing noise instead of generalizing." },
  { q: "Which Python function reads a CSV file into a Pandas DataFrame?", options: ["pd.read_csv()", "pd.open_csv()", "pd.load()", "pd.DataFrame.from_csv()"], a: "A", explanation: "read_csv() is the standard function in Pandas to read comma-separated values into a DataFrame." },
  { q: "What is the purpose of normalization in a database?", options: ["To speed up queries", "To reduce data redundancy and improve data integrity", "To encrypt the data", "To backup the database"], a: "B", explanation: "Normalization involves structuring a relational database to reduce data redundancy." },
  { q: "What is a Null Hypothesis in statistics?", options: ["A hypothesis with missing data", "The hypothesis that there is no significant difference between specified populations", "The alternative hypothesis", "A failed experiment"], a: "B", explanation: "The null hypothesis states that there is no relationship or difference between two groups." },
  { q: "What is a 'Foreign Key'?", options: ["A key from another database", "A field in one table that uniquely identifies a row of another table", "An encrypted key", "A primary key"], a: "B", explanation: "A foreign key is a column or group of columns in a relational database table that provides a link between data in two tables." }
];

const devopsQuestions = [
  { q: "What is the primary purpose of Docker?", options: ["To create virtual machines", "To containerize applications and their dependencies", "To manage databases", "To write code faster"], a: "B", explanation: "Docker is a platform for developing, shipping, and running applications in isolated containers." },
  { q: "What does CI/CD stand for?", options: ["Continuous Integration / Continuous Deployment", "Code Integration / Code Delivery", "Cloud Integration / Cloud Development", "Control Integration / Control Deployment"], a: "A", explanation: "CI/CD bridges the gaps between development and operation activities and teams by enforcing automation." },
  { q: "In Kubernetes, what is a Pod?", options: ["A physical server", "The smallest deployable computing unit", "A load balancer", "A persistent volume"], a: "B", explanation: "A Pod represents a single instance of a running process in your cluster, the smallest unit in Kubernetes." },
  { q: "Which tool is primarily used for Infrastructure as Code (IaC)?", options: ["Jenkins", "Terraform", "Git", "Prometheus"], a: "B", explanation: "Terraform is an open-source infrastructure as code software tool created by HashiCorp." },
  { q: "What is a 'Reverse Proxy'?", options: ["A proxy that routes traffic to the internet", "A server that sits in front of web servers and forwards client requests to those web servers", "A VPN", "A firewall"], a: "B", explanation: "Reverse proxies are typically implemented to help increase security, performance, and reliability." },
  { q: "What command creates a new Git branch and switches to it?", options: ["git branch new-branch", "git checkout -b new-branch", "git create new-branch", "git switch -c new-branch"], a: "B", explanation: "git checkout -b creates a new branch and checks it out. (git switch -c is also valid, but -b is classic)." },
  { q: "What is the purpose of Jenkins?", options: ["Database management", "Automation server for CI/CD pipelines", "Frontend framework", "Operating System"], a: "B", explanation: "Jenkins is an open source automation server which enables developers around the world to reliably build, test, and deploy their software." },
  { q: "What is the default port for SSH?", options: ["21", "22", "80", "443"], a: "B", explanation: "Port 22 is the standard port for Secure Shell (SSH) connections." },
  { q: "In Linux, what command is used to view running processes?", options: ["list", "ps (or top)", "proc", "tasks"], a: "B", explanation: "'ps' displays a snapshot of current processes, 'top' shows them in real-time." },
  { q: "What is the purpose of Prometheus in a DevOps stack?", options: ["Source code hosting", "Monitoring and alerting", "Container orchestration", "Configuration management"], a: "B", explanation: "Prometheus is an open-source systems monitoring and alerting toolkit." }
];

const hrQuestions = [
  { q: "How would you handle an employee complaining about a manager's favoritism?", options: ["Ignore it", "Fire the manager", "Listen to the employee privately and investigate impartially", "Tell the team to sort it out"], a: "C", explanation: "Impartial investigation is key to resolving workplace conflicts." },
  { q: "What is the primary purpose of an employee onboarding process?", options: ["To give them a laptop", "To evaluate their skills", "To integrate them into the company culture and prepare them for their role", "To test their patience"], a: "C", explanation: "Onboarding ensures a smooth transition and integration." },
  { q: "If two team members are constantly arguing, what is the best HR approach?", options: ["Separate them permanently", "Facilitate a mediation meeting", "Fire the instigator", "Give them a warning letter immediately"], a: "B", explanation: "Mediation helps understand root causes and fosters collaboration." },
  { q: "What does 'attrition rate' measure in HR?", options: ["Number of new hires", "Pace of work", "The rate at which employees leave the workforce", "Budget spent on training"], a: "C", explanation: "Attrition indicates employee turnover." },
  { q: "How should HR handle a candidate who fails a background check?", options: ["Publicly shame them", "Inform them privately and follow company policy regarding offer withdrawal", "Ignore the check if they are talented", "Ask them to pay a fine"], a: "B", explanation: "Professionalism and adherence to policy are critical." },
  { q: "What is 360-degree feedback?", options: ["Feedback from peers, managers, and subordinates", "A circular rating scale", "Feedback given once a year", "Feedback only from the CEO"], a: "A", explanation: "It provides a comprehensive view of performance." },
  { q: "When designing a compensation package, what should be the primary consideration?", options: ["Paying the absolute minimum", "Internal equity and market competitiveness", "Only giving stock options", "Ignoring market trends"], a: "B", explanation: "Fairness and competitiveness attract and retain talent." },
  { q: "What is the best way to improve employee engagement?", options: ["Mandatory overtime", "Transparent communication and recognizing achievements", "Removing coffee machines", "Strict micromanagement"], a: "B", explanation: "Engagement thrives on recognition and transparency." },
  { q: "How should you deal with a high-performing employee who is toxic to the team?", options: ["Promote them", "Address the behavior directly and set clear expectations for teamwork", "Ignore the behavior", "Fire the rest of the team"], a: "B", explanation: "Performance does not excuse toxic behavior; it must be addressed." },
  { q: "What is the main goal of performance appraisals?", options: ["To find reasons to fire people", "To evaluate performance, set goals, and identify development needs", "To waste time", "To determine who gets a corner office"], a: "B", explanation: "Appraisals are developmental and evaluative tools." }
];

const financeQuestions = [
  { q: "If a company's expenses exceed its revenue, what is the result?", options: ["Net Profit", "Net Loss", "Break-even", "Capital Gain"], a: "B", explanation: "Loss occurs when expenses > revenue." },
  { q: "What is the purpose of a balance sheet?", options: ["To show daily sales", "To summarize assets, liabilities, and equity at a specific point in time", "To list all employees", "To track marketing ROI"], a: "B", explanation: "A balance sheet provides a financial snapshot." },
  { q: "How would you handle a discrepancy in a financial report?", options: ["Hide it", "Blame the software", "Investigate the root cause, document the error, and correct it", "Ignore small discrepancies"], a: "C", explanation: "Accuracy and transparency are vital in finance." },
  { q: "What does ROI stand for?", options: ["Return On Investment", "Rate Of Income", "Risk Of Inflation", "Revenue Over Index"], a: "A", explanation: "ROI measures the profitability of an investment." },
  { q: "If an invoice is received but not yet paid, where is it recorded?", options: ["Accounts Receivable", "Accounts Payable", "Revenue", "Retained Earnings"], a: "B", explanation: "Accounts payable represents money owed by a business." },
  { q: "What is 'Depreciation'?", options: ["An increase in value", "A tax penalty", "The allocation of the cost of an asset over its useful life", "A type of bank loan"], a: "C", explanation: "Depreciation accounts for the wear and tear of assets." },
  { q: "Why is cash flow management crucial for a business?", options: ["To pay taxes early", "To ensure the company can meet its short-term obligations and fund operations", "To impress investors", "To buy luxury items"], a: "B", explanation: "Cash flow keeps the business operational." },
  { q: "What is the difference between Gross Profit and Net Profit?", options: ["Gross profit includes all expenses, net profit does not", "Gross profit is after taxes, net profit is before", "Gross profit is revenue minus cost of goods sold; Net profit subtracts all other expenses", "They are the same"], a: "C", explanation: "Net profit is the final bottom line." },
  { q: "How do you ensure compliance with financial regulations?", options: ["By ignoring audits", "By staying updated on tax laws and implementing strict internal controls", "By using offshore accounts", "By hiring more salespeople"], a: "B", explanation: "Compliance requires proactive monitoring and controls." },
  { q: "What is a 'sunk cost'?", options: ["A cost that can be recovered", "A cost that has already been incurred and cannot be recovered", "A future planned expense", "A variable cost"], a: "B", explanation: "Sunk costs should not affect future business decisions." }
];

const salesQuestions = [
  { q: "A customer is angry about a delayed delivery. How do you handle it?", options: ["Argue with them", "Hang up", "Apologize, investigate the delay, and offer a concrete solution or compensation", "Tell them it's the shipping company's fault"], a: "C", explanation: "Empathy and problem-solving retain customers." },
  { q: "What is a 'Sales Funnel'?", options: ["A tool for pouring coffee", "A visual representation of the customer journey from awareness to purchase", "A list of competitors", "A pricing strategy"], a: "B", explanation: "It tracks prospects through stages of buying." },
  { q: "How do you overcome a customer objection regarding price?", options: ["Offer a 90% discount immediately", "Tell them they are cheap", "Highlight the value, ROI, and unique benefits of the product", "End the conversation"], a: "C", explanation: "Selling on value overcomes price objections." },
  { q: "What does B2B stand for?", options: ["Business to Business", "Back to Basics", "Business to Buyer", "Brand to Brand"], a: "A", explanation: "B2B involves selling products/services to other companies." },
  { q: "Why is follow-up important in sales?", options: ["To annoy the prospect", "Because most sales require multiple touchpoints before closing", "To kill time", "Because it's legally required"], a: "B", explanation: "Persistence and relationship building are key." },
  { q: "What is cross-selling?", options: ["Selling to a competitor", "Selling a complementary product to an existing customer", "Selling a more expensive version of a product", "Selling across state borders"], a: "B", explanation: "Cross-selling increases the average order value." },
  { q: "How do you identify a qualified lead?", options: ["Anyone who visits the website", "A prospect who has the budget, authority, need, and timeline (BANT)", "Someone who likes your LinkedIn post", "A random phone number"], a: "B", explanation: "Qualification ensures you spend time on viable prospects." },
  { q: "What is the primary goal of a cold call?", options: ["To close a million-dollar deal instantly", "To generate interest and secure a follow-up meeting or demo", "To talk for an hour", "To ask for referrals"], a: "B", explanation: "Cold calls initiate the relationship." },
  { q: "How do you handle a lost sale?", options: ["Delete the contact", "Analyze why it was lost, maintain a positive relationship, and try again in the future", "Send an angry email", "Blame the marketing team"], a: "B", explanation: "Lost sales are learning opportunities." },
  { q: "What is 'churn rate' in a SaaS or subscription business?", options: ["The speed of manufacturing", "The percentage of customers who cancel their subscriptions over a given period", "The rate of new signups", "The commission rate"], a: "B", explanation: "High churn indicates customer dissatisfaction." }
];

const genericWorkplaceQuestions = [
  { q: "You notice a safety hazard in the office. What is your immediate action?", options: ["Ignore it", "Take a picture for social media", "Report it to the relevant authority or facility manager immediately", "Wait for someone else to notice"], a: "C", explanation: "Safety is everyone's responsibility." },
  { q: "How do you prioritize multiple urgent tasks?", options: ["Do the easiest one first", "Assess impact and deadlines, then tackle high-impact/close-deadline tasks first", "Panic and do nothing", "Ask a colleague to do them"], a: "B", explanation: "Prioritization based on impact and urgency is effective time management." },
  { q: "If you make a mistake that affects a client, what should you do?", options: ["Cover it up", "Blame a junior employee", "Admit the mistake, notify your supervisor, and propose a solution to fix it", "Resign immediately"], a: "C", explanation: "Accountability and proactive problem solving are essential." },
  { q: "What is the best approach to effective teamwork?", options: ["Doing everything yourself to ensure it's right", "Clear communication, shared goals, and mutual respect", "Avoiding team meetings", "Competing with team members"], a: "B", explanation: "Collaboration relies on communication and respect." },
  { q: "How should you respond to constructive criticism from a manager?", options: ["Get defensive and argue", "Listen actively, ask for clarification if needed, and apply the feedback", "Ignore it completely", "Complain to HR"], a: "B", explanation: "Feedback is a tool for professional growth." },
  { q: "What does effective time management entail?", options: ["Working 16 hours a day", "Planning, setting goals, and avoiding procrastination", "Saying yes to every request", "Constantly multitasking"], a: "B", explanation: "Working smarter, not just harder, yields better results." },
  { q: "You disagree with a new company policy. What is the professional way to handle it?", options: ["Refuse to follow it", "Complain loudly in the breakroom", "Express your concerns constructively to your manager or HR, but comply with the policy", "Send a company-wide email"], a: "C", explanation: "Professionalism involves expressing dissent appropriately." },
  { q: "A colleague is struggling with their workload. What should you do?", options: ["Laugh at them", "Offer assistance if your own workload permits, or suggest they speak to a manager", "Take over all their tasks", "Ignore them"], a: "B", explanation: "Supporting colleagues fosters a positive team environment." },
  { q: "What is 'active listening'?", options: ["Listening while typing an email", "Hearing the words but not the meaning", "Fully concentrating, understanding, responding, and remembering what is being said", "Waiting for your turn to speak"], a: "C", explanation: "Active listening ensures true comprehension." },
  { q: "How do you maintain a healthy work-life balance?", options: ["Check emails at 2 AM", "Set clear boundaries between work hours and personal time", "Take work home every weekend", "Never take a vacation"], a: "B", explanation: "Boundaries prevent burnout." }
];

const generateQuestions = async () => {
  console.log("Deleting old data to avoid foreign key constraints...");
  await prisma.candidateAnswer.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.question.deleteMany({});
  
  console.log("Seeding realistic questions...");
  
  const allQuestions = [];

  // Seed IT roles
  for (const pos of IT_ROLES) {
    let techSet = genericTechQuestions;
    if (pos.includes("Frontend") || pos.includes("UI/UX")) techSet = frontendQuestions;
    else if (pos.includes("Backend") || pos.includes("Full Stack")) techSet = backendQuestions;
    else if (pos.includes("Data")) techSet = dataQuestions;
    else if (pos.includes("DevOps") || pos.includes("Cloud") || pos.includes("Administrator") || pos.includes("System") || pos.includes("Network")) techSet = devopsQuestions;

    aptitudeQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "IT", position: pos, category: 'Aptitude', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    grammarQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "IT", position: pos, category: 'Grammar & Reasoning', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    techSet.slice(0, 10).forEach(q => allQuestions.push({
      department: "IT", position: pos, category: 'Coding & Technical', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
  }

  // Seed Non-IT roles (Using Aptitude and Grammar, plus a specific set for Workplace Ability)
  for (const pos of NON_IT_ROLES) {
    let workplaceSet = genericWorkplaceQuestions;
    if (pos.includes("HR") || pos.includes("Recruiter") || pos.includes("Talent") || pos.includes("Payroll")) workplaceSet = hrQuestions;
    else if (pos.includes("Account") || pos.includes("Finance") || pos.includes("Bank") || pos.includes("Insurance")) workplaceSet = financeQuestions;
    else if (pos.includes("Sales") || pos.includes("Marketing") || pos.includes("Business Development")) workplaceSet = salesQuestions;

    aptitudeQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "Non-IT", position: pos, category: 'Aptitude', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    grammarQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "Non-IT", position: pos, category: 'Grammar', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    workplaceSet.slice(0, 10).forEach(q => allQuestions.push({
      department: "Non-IT", position: pos, category: 'Reasoning & Workplace Ability', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
  }

  // Seed General roles
  for (const pos of GENERAL_ROLES) {
    aptitudeQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "General", position: pos, category: 'Aptitude', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    grammarQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "General", position: pos, category: 'Grammar', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
    genericWorkplaceQuestions.slice(0, 10).forEach(q => allQuestions.push({
      department: "General", position: pos, category: 'General Knowledge', difficulty: 'Medium',
      question_text: q.q, option_a: q.options[0], option_b: q.options[1], option_c: q.options[2], option_d: q.options[3], correct_answer: q.a, explanation: q.explanation, status: 'ACTIVE'
    }));
  }

  // Insert in chunks to avoid sqlite limitations
  const chunkSize = 500;
  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const chunk = allQuestions.slice(i, i + chunkSize);
    await prisma.question.createMany({ data: chunk });
  }
  
  console.log("Successfully seeded realistic questions for all roles!");
};

generateQuestions()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
