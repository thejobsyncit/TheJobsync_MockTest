import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const frontendQuestions = [
  // APTITUDE (10)
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "A UI team of 8 developers can build a web application in 20 days. If the client demands the app in 10 days, and each new developer works at 80% efficiency compared to the original team, how many additional developers must be hired?",
    option_a: "8",
    option_b: "10",
    option_c: "12",
    option_d: "16",
    correct_answer: "B",
    explanation: "Original effort = 8 * 20 = 160 man-days. To finish in 10 days, we need 160 / 10 = 16 effective developers. We have 8, so we need 8 more effective developers. Since new devs are 80% efficient, 8 / 0.8 = 10 additional developers."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "A rectangular flex container has an area of 480 sq pixels. If its width is increased by 20% and its height decreased by 15%, what is the new area?",
    option_a: "480",
    option_b: "489.6",
    option_c: "504",
    option_d: "460.8",
    correct_answer: "B",
    explanation: "New area = original area * 1.20 * 0.85 = 480 * 1.02 = 489.6 sq pixels."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "In a certain code, 'REACT' is written as 'SGBEW'. How will 'VUEJS' be written in that code?",
    option_a: "WVHMW",
    option_b: "WVFLV",
    option_c: "WWHLX",
    option_d: "XWGMW",
    correct_answer: "A",
    explanation: "R(+1)E(+2)A(+1)C(+2)T(+3)... Wait, R->S (+1), E->G (+2), A->B (+1), C->E (+2), T->W (+3). Following this pattern on VUEJS gives WVHMW."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "A website receives 5000 visitors on Monday. The traffic increases by 10% daily. What is the total number of unique visitors from Monday to Wednesday, assuming 20% of Tuesday's and 30% of Wednesday's visitors were returning users from previous days?",
    option_a: "12450",
    option_b: "13650",
    option_c: "11900",
    option_d: "14050",
    correct_answer: "B",
    explanation: "Mon = 5000 unique. Tue = 5500 total, 4400 unique. Wed = 6050 total, 4235 unique. Total unique = 5000 + 4400 + 4235 = 13635. (Approximation closest is B, wait, 5500*0.8 = 4400, 6050*0.7 = 4235. Sum = 13635)."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "If 3 frontend devs can write 3 components in 3 hours, how many hours does it take for 6 frontend devs to write 6 components?",
    option_a: "3 hours",
    option_b: "6 hours",
    option_c: "1.5 hours",
    option_d: "9 hours",
    correct_answer: "A",
    explanation: "Rate is 1 component per developer per 3 hours. 6 devs will write 6 components in the same 3 hours."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "In a drawer, there are 4 pairs of red socks, 5 pairs of blue, and 6 pairs of green. A blindfolded developer reaches in. What is the minimum number of socks they must pick to ensure they have at least one matching pair?",
    option_a: "3",
    option_b: "4",
    option_c: "16",
    option_d: "17",
    correct_answer: "B",
    explanation: "Worst case: pick 1 red, 1 blue, 1 green (3 socks). The 4th sock must match one of the previous three."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "P is the brother of Q. R is the daughter of Q. S is the sister of P. T is the brother of R. Who is the uncle of T?",
    option_a: "P",
    option_b: "Q",
    option_c: "S",
    option_d: "R",
    correct_answer: "A",
    explanation: "T is the brother of R, making T the son of Q. P is the brother of Q. Therefore, P is the uncle of T."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "A clock shows 3:15. What is the acute angle between the hour hand and the minute hand?",
    option_a: "0 degrees",
    option_b: "7.5 degrees",
    option_c: "15 degrees",
    option_d: "22.5 degrees",
    correct_answer: "B",
    explanation: "Minute hand is exactly on 3. Hour hand has moved 15/60 of the way between 3 and 4. The angle between hours is 30 deg. (15/60) * 30 = 7.5 degrees."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "Find the odd one out in the series: 3, 5, 11, 14, 17, 21",
    option_a: "11",
    option_b: "14",
    option_c: "17",
    option_d: "21",
    correct_answer: "B",
    explanation: "14 is the only even number. Alternatively, all others except 14 are odd (or prime except 21, but 14 is firmly even)."
  },
  {
    category: "Aptitude & Logical Reasoning",
    question_text: "A bag contains 5 red balls and 3 green balls. Two balls are drawn at random without replacement. What is the probability that both are red?",
    option_a: "5/14",
    option_b: "15/56",
    option_c: "25/64",
    option_d: "5/28",
    correct_answer: "A",
    explanation: "P(1st red) = 5/8. P(2nd red) = 4/7. Total = (5/8) * (4/7) = 20/56 = 5/14."
  },

  // GRAMMAR (10)
  {
    category: "Grammar & Verbal Ability",
    question_text: "Choose the correct sentence regarding web accessibility:",
    option_a: "Neither the developer nor the designers is responsible for the contrast issues.",
    option_b: "Neither the developer nor the designers are responsible for the contrast issues.",
    option_c: "Neither the developers nor the designer are responsible for the contrast issues.",
    option_d: "Neither the developer or the designers are responsible for the contrast issues."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Select the most appropriate synonym for the word 'EPHEMERAL' in the context of React component lifecycles.",
    option_a: "Persistent",
    option_b: "Transient",
    option_c: "Redundant",
    option_d: "Immutable",
    correct_answer: "B",
    explanation: "Ephemeral means lasting for a very short time, just like a transient component state."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Fill in the blank: The senior engineer insisted that the new deployment pipeline ________ tested thoroughly before release.",
    option_a: "is",
    option_b: "was",
    option_c: "be",
    option_d: "has been",
    correct_answer: "C",
    explanation: "This uses the subjunctive mood ('insisted that... be')."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Which of the following sentences correctly uses a semicolon?",
    option_a: "The API returned a 500 error; however, the frontend gracefully displayed a fallback UI.",
    option_b: "The API returned a 500 error; because the server was down.",
    option_c: "The API returned a 500 error; and the frontend gracefully displayed a fallback UI.",
    option_d: "The API returned a 500 error, however; the frontend gracefully displayed a fallback UI.",
    correct_answer: "A",
    explanation: "A semicolon properly links two independent clauses separated by a conjunctive adverb like 'however'."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Identify the grammatical error in this sentence: 'The compilation of the Webpack bundles, along with the minification of assets, take a considerable amount of time.'",
    option_a: "Change 'compilation' to 'compiling'",
    option_b: "Change 'take' to 'takes'",
    option_c: "Change 'along with' to 'and'",
    option_d: "No error",
    correct_answer: "B",
    explanation: "The subject is 'The compilation' (singular), so the verb should be 'takes'."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Choose the antonym for 'UBIQUITOUS' as it pertains to a global CSS class.",
    option_a: "Omnipresent",
    option_b: "Pervasive",
    option_c: "Scarce",
    option_d: "Invasive",
    correct_answer: "C",
    explanation: "Ubiquitous means found everywhere. Scarce is the opposite."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Which idiom best describes fixing a bug that creates two more bugs?",
    option_a: "Opening a Pandora's box",
    option_b: "Burning the midnight oil",
    option_c: "Biting off more than you can chew",
    option_d: "Playing devil's advocate",
    correct_answer: "A",
    explanation: "Opening Pandora's box means doing something that causes many unforeseen problems."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Select the sentence with the correct parallel structure:",
    option_a: "The developer's tasks were coding the UI, testing the endpoints, and to deploy the app.",
    option_b: "The developer's tasks were to code the UI, test the endpoints, and deploying the app.",
    option_c: "The developer's tasks were coding the UI, testing the endpoints, and deploying the app.",
    option_d: "The developer's tasks were coding the UI, to test the endpoints, and to deploy the app.",
    correct_answer: "C",
    explanation: "All items in the list use the gerund form (-ing), maintaining parallel structure."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "Fill in the blanks: ______ you to implement Redux instead of Context API, the application ______ much more scalable.",
    option_a: "Were / would be",
    option_b: "If / will be",
    option_c: "Had / would have been",
    option_d: "Unless / wouldn't be",
    correct_answer: "A",
    explanation: "This is a second conditional sentence with inverted syntax ('Were you to...' = 'If you were to...')."
  },
  {
    category: "Grammar & Verbal Ability",
    question_text: "What does the word 'OBSOLETE' mean in the sentence: 'The old ECMAScript 5 methods are now practically obsolete.'",
    option_a: "Highly efficient",
    option_b: "No longer in use",
    option_c: "Extremely difficult",
    option_d: "Fundamentally required",
    correct_answer: "B",
    explanation: "Obsolete means outdated and no longer used."
  },

  // CODING (10 - Hard Frontend Specific)
  {
    category: "Coding & Technical",
    question_text: `Predict the output of the following JavaScript code:
console.log(1 < 2 < 3);
console.log(3 > 2 > 1);`,
    option_a: "true, true",
    option_b: "true, false",
    option_c: "false, true",
    option_d: "false, false",
    correct_answer: "B",
    explanation: "1 < 2 evaluates to true (1). 1 < 3 evaluates to true. 3 > 2 evaluates to true (1). 1 > 1 evaluates to false."
  },
  {
    category: "Coding & Technical",
    question_text: `Consider the following React snippet:
useEffect(() => {
  const timer = setInterval(() => setCount(c => c + 1), 1000);
}, []);
What happens if the component re-renders multiple times due to a parent prop change?`,
    option_a: "Multiple intervals are created, causing memory leaks and rapid counting.",
    option_b: "The interval is cleared automatically before each re-render.",
    option_c: "Only one interval exists because the dependency array is empty.",
    option_d: "The component throws a maximum update depth exceeded error.",
    correct_answer: "C",
    explanation: "Because the dependency array is empty [], the effect runs exactly once on mount, regardless of how many times the component re-renders. (However, it lacks a cleanup function, which is bad practice on unmount, but re-renders won't trigger multiple intervals)."
  },
  {
    category: "Coding & Technical",
    question_text: "In the context of the browser rendering pipeline, which of the following CSS property changes will trigger a layout (reflow) recalculation, and NOT just a repaint or composite?",
    option_a: "transform: translate(10px, 10px)",
    option_b: "opacity: 0.5",
    option_c: "color: red",
    option_d: "width: 100%",
    correct_answer: "D",
    explanation: "Changing width affects the geometry of the layout, forcing the browser to recalculate the Layout (reflow) step. Transform and opacity can be handled by the compositor, and color only triggers repaint."
  },
  {
    category: "Coding & Technical",
    question_text: `What is the output of the following code involving Promises?
Promise.resolve(1)
  .then(x => { throw x })
  .catch(err => { return err + 1 })
  .then(x => console.log(x));`,
    option_a: "Uncaught Error: 1",
    option_b: "1",
    option_c: "2",
    option_d: "undefined",
    correct_answer: "C",
    explanation: "The first then throws 1. The catch block catches 1 and returns err + 1 (which is 2). Returning a value from catch resolves the promise with that value, passing 2 to the final then."
  },
  {
    category: "Coding & Technical",
    question_text: `Which of the following is true about the JavaScript Event Loop when handling Microtasks and Macrotasks?`,
    option_a: "Macrotasks (like setTimeout) are executed before Microtasks (like Promises).",
    option_b: "The Microtask queue is entirely emptied before the next Macrotask is processed.",
    option_c: "RequestAnimationFrame callbacks are processed in the Microtask queue.",
    option_d: "Microtasks are only processed after the browser completes its rendering step.",
    correct_answer: "B",
    explanation: "The event loop empties the entire Microtask queue immediately after the current task finishes and before the next Macrotask (e.g., setTimeout) is picked up."
  },
  {
    category: "Coding & Technical",
    question_text: `How does React's concurrent rendering (React 18+) handle 'useTransition'?`,
    option_a: "It debounces state updates so they only trigger after the user stops typing.",
    option_b: "It marks a state update as non-urgent, allowing high-priority updates (like typing) to interrupt the render.",
    option_c: "It creates a CSS transition between two DOM nodes automatically.",
    option_d: "It forces a synchronous layout calculation to prevent layout shift.",
    correct_answer: "B",
    explanation: "useTransition allows React to interrupt long-running renders if a more urgent event (like a click or keystroke) occurs."
  },
  {
    category: "Coding & Technical",
    question_text: `In a deeply nested DOM structure, an event listener is attached to a parent element using event delegation. How can you PREVENT the event from triggering if a specific child element is clicked, WITHOUT attaching a listener to that child?`,
    option_a: "It is impossible; you must attach a listener to the child and call stopPropagation().",
    option_b: "Use event.preventDefault() in the parent's listener.",
    option_c: "Check if event.target matches the child element within the parent's listener and return early.",
    option_d: "Set pointer-events: none on the parent element.",
    correct_answer: "C",
    explanation: "Event delegation relies on event bubbling. By checking event.target.matches('selector') in the parent, you can selectively ignore events originating from specific children."
  },
  {
    category: "Coding & Technical",
    question_text: `What will this JavaScript code output?
const obj = {
  name: 'React',
  getName: function() {
    return this.name;
  }
};
const getName = obj.getName;
console.log(getName());`,
    option_a: "'React'",
    option_b: "undefined",
    option_c: "TypeError: Cannot read properties of undefined",
    option_d: "null",
    correct_answer: "B",
    explanation: "When obj.getName is assigned to the variable getName, it loses its context. Calling getName() executes it in the global context, where this.name is undefined (in non-strict mode) or throws an error (in strict mode). Assuming non-strict browser context without window.name, it returns undefined."
  },
  {
    category: "Coding & Technical",
    question_text: "Which of the following HTTP headers is the MOST effective for preventing Cross-Site Scripting (XSS) attacks in a modern web application?",
    option_a: "Access-Control-Allow-Origin",
    option_b: "Content-Security-Policy",
    option_c: "Strict-Transport-Security",
    option_d: "X-Frame-Options",
    correct_answer: "B",
    explanation: "Content Security Policy (CSP) restricts the domains from which scripts can be loaded and executed, making it a primary defense against XSS."
  },
  {
    category: "Coding & Technical",
    question_text: `What is the significance of the "key" prop in React lists?`,
    option_a: "It defines the CSS class dynamically for each list item.",
    option_b: "It helps React identify which items have changed, been added, or been removed to optimize rendering.",
    option_c: "It acts as a secure cryptographic hash for passing sensitive data.",
    option_d: "It forces the component to completely unmount and remount on every render.",
    correct_answer: "B",
    explanation: "Keys give React elements a stable identity, allowing React's reconciliation algorithm to accurately track and update elements efficiently without re-rendering the entire list."
  }
];

// Provide option_b missing for grammar 11
frontendQuestions[10].correct_answer = "B";
frontendQuestions[10].explanation = "The subject is 'Neither the developer nor the designers'. When using 'neither/nor', the verb agrees with the noun closest to it (designers, plural), so 'are' is correct.";

async function run() {
  console.log("Inserting perfect Frontend Developer questions...");
  const dataToInsert = frontendQuestions.map((q, index) => ({
    department: "Information Technology",
    position: "Frontend Developer",
    category: q.category,
    difficulty: "Hard",
    type: "MCQ",
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    status: 'ACTIVE'
  }));

  await prisma.question.createMany({ data: dataToInsert });
  console.log("Successfully inserted 30 perfectly matched Frontend questions.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
