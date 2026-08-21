import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  { q: "Which of the following is true about Java's garbage collection?", options: ["It guarantees that there will be no memory leaks", "It can be forced using System.gc()", "It runs in the same thread as the main application", "It frees memory occupied by objects that are no longer reachable"], a: "D", exp: "GC only reclaims unreachable objects, it does not guarantee no memory leaks (e.g. static references). System.gc() only suggests collection." },
  { q: "In Spring Boot, what is the default scope of a bean?", options: ["Prototype", "Request", "Singleton", "Session"], a: "C", exp: "By default, Spring beans are Singletons, meaning one instance per Spring IoC container." },
  { q: "What is the time complexity of searching an element in a balanced Binary Search Tree?", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], a: "C", exp: "In a balanced BST, half of the tree is eliminated at each step, making the search O(log n)." },
  { q: "Which annotation is used in Spring to handle global exceptions?", options: ["@ExceptionHandler", "@ControllerAdvice", "@RestController", "@GlobalException"], a: "B", exp: "@ControllerAdvice allows handling exceptions across the whole application in one global handling component." },
  { q: "In a microservices architecture, which pattern is used to handle distributed transactions?", options: ["Saga Pattern", "Singleton Pattern", "Factory Pattern", "Proxy Pattern"], a: "A", exp: "Saga pattern manages distributed transactions through a sequence of local transactions." },
  { q: "What does the 'volatile' keyword guarantee in Java?", options: ["Atomicity", "Visibility", "Mutual Exclusion", "Thread safety for compound actions"], a: "B", exp: "Volatile guarantees visibility of changes to variables across threads, but not atomicity." },
  { q: "How does HashMap handle collisions internally in Java 8+?", options: ["Linear Probing", "Chaining with LinkedList only", "Chaining with LinkedList, converting to Red-Black Tree when threshold is crossed", "Double Hashing"], a: "C", exp: "Java 8 improves HashMap performance by converting the bucket's LinkedList into a Red-Black Tree if it grows beyond 8 elements." },
  { q: "Which of the following HTTP methods is idempotent?", options: ["POST", "PATCH", "PUT", "CONNECT"], a: "C", exp: "PUT is idempotent, meaning making multiple identical requests has the same effect as making a single request." },
  { q: "What will be the output of: `System.out.println(1.0 / 0.0);` in Java?", options: ["ArithmeticException", "Infinity", "NaN", "Compilation Error"], a: "B", exp: "Floating-point arithmetic in Java handles division by zero by returning Infinity (positive or negative)." },
  { q: "Which of these is NOT a valid state in the React component lifecycle?", options: ["Mounting", "Updating", "Rendering", "Unmounting"], a: "C", exp: "Rendering is a phase, but the high-level lifecycle stages are Mounting, Updating, and Unmounting." },
  { q: "In JPA/Hibernate, what is the difference between get() and load()?", options: ["get() returns a proxy, load() hits the database", "get() hits the database immediately, load() returns a proxy", "They are exactly the same", "load() returns null if entity is not found"], a: "B", exp: "get() hits the DB and returns null if not found. load() returns a proxy and throws an exception if the entity is accessed and not found." },
  { q: "What is the purpose of JWT (JSON Web Token)?", options: ["To encrypt data in transit", "To securely transmit information between parties as a JSON object", "To store user passwords", "To prevent CSRF attacks inherently"], a: "B", exp: "JWTs are used for authorization and securely transmitting information as they are digitally signed." },
  { q: "Which design pattern restricts a class from having more than one instance?", options: ["Factory", "Observer", "Decorator", "Singleton"], a: "D", exp: "Singleton ensures a class has only one instance and provides a global point of access to it." },
  { q: "What is a 'Promise' in JavaScript?", options: ["A function that executes synchronously", "An object representing the eventual completion or failure of an asynchronous operation", "A method to handle DOM events", "A strict data type for numbers"], a: "B", exp: "Promises handle asynchronous operations in JS, providing .then() and .catch() chains." },
  { q: "In Java Streams, what type of operation is `map()`?", options: ["Terminal Operation", "Intermediate Operation", "Short-circuiting Operation", "Static Operation"], a: "B", exp: "map() transforms elements and returns a new Stream, hence it is an intermediate operation." },
  { q: "What is the main advantage of using a Reverse Proxy like Nginx?", options: ["It speeds up database queries", "It compiles Java code faster", "It distributes client requests to backend servers, providing load balancing and security", "It replaces the need for a relational database"], a: "C", exp: "A reverse proxy acts as an intermediary, offering load balancing, SSL termination, and caching." },
  { q: "How do you prevent SQL Injection in a Java JDBC application?", options: ["Using Statement", "Using PreparedStatement", "Encoding passwords", "Using Stored Procedures exclusively"], a: "B", exp: "PreparedStatement uses parameterized queries, which pre-compiles the SQL and escapes user input." },
  { q: "What is the default port for MySQL?", options: ["8080", "5432", "3306", "27017"], a: "C", exp: "3306 is the default port for MySQL. 5432 is PostgreSQL, 27017 is MongoDB." },
  { q: "In React, how do you pass data from a child component back to a parent component?", options: ["Using props directly", "By using a callback function passed as a prop from the parent", "Using context API only", "Using Redux only"], a: "B", exp: "The parent passes a function to the child via props, and the child calls that function with the data." },
  { q: "What is the Time Complexity of inserting an element at the beginning of an ArrayList?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], a: "C", exp: "Inserting at the beginning of an ArrayList requires shifting all existing elements, making it O(n)." },
  { q: "Which of the following is true regarding Java Interfaces starting from Java 8?", options: ["They can have private fields", "They can contain constructor declarations", "They can have default and static methods with implementations", "They can extend multiple abstract classes"], a: "C", exp: "Java 8 introduced default and static methods in interfaces to support backward compatibility." },
  { q: "In a CI/CD pipeline, what does CI stand for?", options: ["Code Integration", "Continuous Integration", "Constant Integration", "Continuous Inspection"], a: "B", exp: "Continuous Integration involves automatically building and testing code changes frequently." },
  { q: "What is the purpose of Docker?", options: ["To write Java code", "To containerize applications so they run consistently across environments", "To replace GitHub", "To manage SQL databases only"], a: "B", exp: "Docker bundles an application and its dependencies into a container for consistent execution." },
  { q: "Which of these is a NoSQL database?", options: ["PostgreSQL", "Oracle", "MongoDB", "MariaDB"], a: "C", exp: "MongoDB is a document-oriented NoSQL database." },
  { q: "What is the output of `String s1 = new String(\"Hi\"); String s2 = \"Hi\"; System.out.println(s1 == s2);`?", options: ["true", "false", "Compilation Error", "Runtime Exception"], a: "B", exp: "s1 refers to an object in the heap, s2 refers to a string literal in the string pool. `==` checks reference equality." },
  { q: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Cross-Object Reference System", "Cascading Object Relational System", "Cross-Origin Routing System"], a: "A", exp: "CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain." },
  { q: "In Spring Security, which interface is used to load user-specific data?", options: ["UserDetailsService", "SecurityContextHolder", "AuthenticationManager", "GrantedAuthority"], a: "A", exp: "UserDetailsService has a method loadUserByUsername() used to fetch user details." },
  { q: "What is the purpose of the `@Transactional` annotation in Spring?", options: ["To define an endpoint", "To manage database transactions automatically", "To map a class to a database table", "To inject dependencies"], a: "B", exp: "@Transactional ensures that a method executes within a database transaction, rolling back on RuntimeExceptions." },
  { q: "Which HTTP status code signifies that a resource was successfully created?", options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"], a: "B", exp: "201 Created is the standard response for a successful POST request that creates a new resource." },
  { q: "What is a 'closure' in JavaScript?", options: ["A way to style components", "A function bundled together with references to its lexical environment", "A method to close browser tabs", "A strict mode feature"], a: "B", exp: "Closures allow a function to access variables from an enclosing scope, even after that scope has finished execution." }
];

async function run() {
  try {
    const dataToInsert = questions.map((q) => ({
      department: "Software Development",
      position: "Full Stack Developer Java",
      category: "Technical",
      difficulty: "Hard",
      type: "MCQ",
      question_text: q.q,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_answer: q.a,
      explanation: q.exp,
      status: "ACTIVE"
    }));

    await prisma.question.createMany({
      data: dataToInsert
    });

    console.log("Successfully inserted 30 questions for Full Stack Developer Java!");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
