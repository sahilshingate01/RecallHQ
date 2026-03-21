export interface FullstackNode {
  id: string;
  label: string;
  phase: number;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  resources: string[];
}

export interface FullstackEdge {
  from: string;
  to: string;
}

export const fullstackNodes: FullstackNode[] = [
  // --- PHASE 1: Foundations ---
  { id: "internet", label: "How the Internet Works", phase: 1, category: "Internet/Basics", difficulty: "Beginner", description: "DNS, HTTP/HTTPS, browsers, hosting basics", resources: ["MDN", "CS50"] },
  { id: "html", label: "HTML5", phase: 1, category: "Frontend", difficulty: "Beginner", description: "Semantic tags, forms, accessibility (a11y)", resources: ["MDN", "FreeCodeCamp"] },
  { id: "css", label: "CSS3 & Responsive Design", phase: 1, category: "Frontend", difficulty: "Beginner", description: "Flexbox, Grid, media queries, animations", resources: ["CSS-Tricks", "Kevin Powell YT"] },
  { id: "git", label: "Git & GitHub", phase: 1, category: "DevOps/Tools", difficulty: "Beginner", description: "Commits, branches, PRs, merge conflicts", resources: ["Pro Git Book", "GitHub Docs"] },
  { id: "terminal", label: "Terminal & Linux Basics", phase: 1, category: "DevOps/Tools", difficulty: "Beginner", description: "File navigation, permissions, bash scripting basics", resources: ["The Odin Project"] },

  // --- PHASE 2: Core Programming ---
  { id: "js_basics", label: "JavaScript Fundamentals", phase: 2, category: "Frontend", difficulty: "Beginner", description: "Variables, loops, functions, DOM manipulation", resources: ["javascript.info", "Eloquent JS"] },
  { id: "js_advanced", label: "Advanced JavaScript", phase: 2, category: "Frontend", difficulty: "Intermediate", description: "Closures, promises, async/await, event loop, prototypes", resources: ["javascript.info", "You Don't Know JS"] },
  { id: "ts", label: "TypeScript", phase: 2, category: "Frontend", difficulty: "Intermediate", description: "Types, interfaces, generics, type narrowing", resources: ["TypeScript Docs", "Matt Pocock"] },
  { id: "dsa_basics", label: "DSA Fundamentals", phase: 2, category: "DSA/CS Fundamentals", difficulty: "Intermediate", description: "Arrays, strings, hashmaps, two pointers, sliding window, recursion", resources: ["Striver A2Z", "LeetCode"] },

  // --- PHASE 3: Frontend Development ---
  { id: "react", label: "React.js", phase: 3, category: "Frontend", difficulty: "Intermediate", description: "Components, hooks, state management, lifecycle", resources: ["React Docs", "Scrimba"] },
  { id: "react_router", label: "React Router", phase: 3, category: "Frontend", difficulty: "Intermediate", description: "SPA routing, nested routes, protected routes", resources: ["React Router Docs"] },
  { id: "state_mgmt", label: "State Management", phase: 3, category: "Frontend", difficulty: "Intermediate", description: "Context API, Zustand or Redux Toolkit", resources: ["Redux Docs", "Zustand GitHub"] },
  { id: "tailwind", label: "Tailwind CSS", phase: 3, category: "Frontend", difficulty: "Beginner", description: "Utility classes, responsive design, dark mode", resources: ["Tailwind Docs"] },
  { id: "api_calls", label: "REST API & Fetch/Axios", phase: 3, category: "Frontend", difficulty: "Intermediate", description: "GET/POST/PUT/DELETE, error handling, loading states", resources: ["Axios Docs", "MDN Fetch"] },
  { id: "react_query", label: "React Query / SWR", phase: 3, category: "Frontend", difficulty: "Intermediate", description: "Server state, caching, background refetching", resources: ["TanStack Query Docs"] },

  // --- PHASE 4: Backend Development ---
  { id: "nodejs", label: "Node.js", phase: 4, category: "Backend", difficulty: "Intermediate", description: "Event loop, modules, streams, file system", resources: ["Node.js Docs", "The Odin Project"] },
  { id: "express", label: "Express.js", phase: 4, category: "Backend", difficulty: "Intermediate", description: "REST APIs, middleware, routing, error handling", resources: ["Express Docs", "Traversy Media"] },
  { id: "auth", label: "Authentication & Authorization", phase: 4, category: "Backend", difficulty: "Intermediate", description: "JWT, sessions, OAuth2, bcrypt, role-based access", resources: ["Auth0 Docs", "Fireship YT"] },
  { id: "rest_design", label: "REST API Design", phase: 4, category: "Backend", difficulty: "Intermediate", description: "CRUD, status codes, versioning, rate limiting", resources: ["RESTful Web APIs Book"] },
  { id: "validation", label: "Input Validation & Security", phase: 4, category: "Backend", difficulty: "Intermediate", description: "Zod/Joi, SQL injection, XSS, CORS, helmet.js", resources: ["OWASP Top 10", "Zod Docs"] },
  { id: "websockets", label: "WebSockets & Real-time", phase: 4, category: "Backend", difficulty: "Advanced", description: "Socket.io, long polling vs websockets, pub/sub basics", resources: ["Socket.io Docs"] },

  // --- PHASE 4 (parallel): Databases ---
  { id: "sql", label: "SQL & Relational DBs", phase: 4, category: "Database", difficulty: "Intermediate", description: "Joins, indexes, transactions, normalization (PostgreSQL)", resources: ["PostgreSQL Docs", "SQLZoo"] },
  { id: "nosql", label: "NoSQL - MongoDB", phase: 4, category: "Database", difficulty: "Intermediate", description: "Documents, collections, aggregation pipeline", resources: ["MongoDB University"] },
  { id: "orm", label: "ORM - Prisma / Mongoose", phase: 4, category: "Database", difficulty: "Intermediate", description: "Schema definition, migrations, relations, queries", resources: ["Prisma Docs", "Mongoose Docs"] },
  { id: "redis", label: "Redis & Caching", phase: 4, category: "Database", difficulty: "Advanced", description: "Key-value store, caching strategies, session storage", resources: ["Redis Docs", "Redis University"] },

  // --- PHASE 5: DevOps & Deployment ---
  { id: "docker", label: "Docker", phase: 5, category: "DevOps/Tools", difficulty: "Intermediate", description: "Images, containers, Dockerfile, docker-compose", resources: ["Docker Docs", "TechWorld with Nana YT"] },
  { id: "cicd", label: "CI/CD Pipelines", phase: 5, category: "DevOps/Tools", difficulty: "Intermediate", description: "GitHub Actions, automated testing & deployment", resources: ["GitHub Actions Docs"] },
  { id: "deployment", label: "Cloud Deployment", phase: 5, category: "DevOps/Tools", difficulty: "Intermediate", description: "Vercel/Netlify (frontend), Railway/Render/AWS EC2 (backend)", resources: ["Vercel Docs", "AWS Free Tier"] },
  { id: "env_config", label: "Environment Config & Secrets", phase: 5, category: "DevOps/Tools", difficulty: "Beginner", description: ".env files, secrets management, config per environment", resources: ["12factor.net"] },
  { id: "monitoring", label: "Logging & Monitoring", phase: 5, category: "DevOps/Tools", difficulty: "Advanced", description: "Winston/Morgan, Sentry for error tracking, uptime monitoring", resources: ["Sentry Docs"] },

  // --- PHASE 6: Advanced & Interview Prep ---
  { id: "system_design_basics", label: "System Design Basics", phase: 6, category: "System Design", difficulty: "Advanced", description: "Load balancing, CAP theorem, horizontal vs vertical scaling", resources: ["ByteByteGo", "Grokking System Design"] },
  { id: "dsa_medium", label: "DSA - Trees, Graphs, DP", phase: 6, category: "DSA/CS Fundamentals", difficulty: "Advanced", description: "Binary trees, BFS/DFS, dynamic programming patterns", resources: ["Striver A2Z", "NeetCode"] },
  { id: "testing", label: "Testing (Unit + Integration)", phase: 6, category: "Backend", difficulty: "Intermediate", description: "Jest, Vitest, Supertest, React Testing Library", resources: ["Jest Docs", "Testing Library"] },
  { id: "graphql", label: "GraphQL (Bonus)", phase: 6, category: "Backend", difficulty: "Advanced", description: "Schema, resolvers, queries, mutations, Apollo", resources: ["GraphQL Docs", "Apollo Docs"] },
  { id: "nextjs", label: "Next.js", phase: 6, category: "Frontend", difficulty: "Intermediate", description: "SSR, SSG, ISR, App Router, API routes, middleware", resources: ["Next.js Docs", "Lee Robinson YT"] },
  { id: "project1", label: "Project: Full Stack CRUD App", phase: 6, category: "Projects", difficulty: "Intermediate", description: "Auth + DB + REST API + React frontend deployed live", resources: [] },
  { id: "project2", label: "Project: Real-time App", phase: 6, category: "Projects", difficulty: "Advanced", description: "Chat app or live collaboration using WebSockets", resources: [] },
  { id: "project3", label: "Project: SaaS Clone", phase: 6, category: "Projects", difficulty: "Advanced", description: "Clone of Notion/Trello/Twitter with full auth, DB, deploy", resources: [] },
];

export const fullstackEdges: FullstackEdge[] = [
  { from: "internet", to: "html" },
  { from: "internet", to: "git" },
  { from: "html", to: "css" },
  { from: "css", to: "js_basics" },
  { from: "git", to: "js_basics" },
  { from: "terminal", to: "git" },
  { from: "js_basics", to: "js_advanced" },
  { from: "js_advanced", to: "ts" },
  { from: "js_advanced", to: "react" },
  { from: "js_advanced", to: "nodejs" },
  { from: "js_advanced", to: "dsa_basics" },
  { from: "ts", to: "react" },
  { from: "react", to: "react_router" },
  { from: "react", to: "state_mgmt" },
  { from: "react", to: "tailwind" },
  { from: "react", to: "api_calls" },
  { from: "api_calls", to: "react_query" },
  { from: "nodejs", to: "express" },
  { from: "express", to: "auth" },
  { from: "express", to: "rest_design" },
  { from: "express", to: "validation" },
  { from: "express", to: "websockets" },
  { from: "sql", to: "orm" },
  { from: "nosql", to: "orm" },
  { from: "orm", to: "express" },
  { from: "express", to: "redis" },
  { from: "auth", to: "project1" },
  { from: "react", to: "project1" },
  { from: "orm", to: "project1" },
  { from: "docker", to: "deployment" },
  { from: "deployment", to: "cicd" },
  { from: "env_config", to: "deployment" },
  { from: "project1", to: "monitoring" },
  { from: "dsa_basics", to: "dsa_medium" },
  { from: "react", to: "nextjs" },
  { from: "express", to: "testing" },
  { from: "dsa_medium", to: "system_design_basics" },
  { from: "nextjs", to: "project3" },
  { from: "websockets", to: "project2" },
  { from: "project1", to: "project2" },
  { from: "project2", to: "project3" },
  { from: "system_design_basics", to: "project3" },
];
