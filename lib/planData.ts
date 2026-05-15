export interface PlanTask {
  id: string;
  text: string;
  days: number[];
}

export interface TrackPlan {
  name: string;
  tasks: PlanTask[];
}

export interface WeekPlan {
  week: number;
  title: string;
  tracks: {
    DSA: TrackPlan;
    Development: TrackPlan;
    DevOps: TrackPlan;
  };
}

export const planData: WeekPlan[] = [
  {
    week: 1,
    title: "Foundations",
    tracks: {
      DSA: {
        name: "Arrays & Sorting (Striver A2Z Steps 1-3)",
        tasks: [
          { id: "w1-dsa-1", text: "Day 1: Time/Space complexity, basic math problems", days: [1] },
          { id: "w1-dsa-2", text: "Day 2: Arrays - easy (largest element, second largest, check sorted)", days: [2] },
          { id: "w1-dsa-3", text: "Day 3: Arrays - medium (2-sum, sort 0s/1s/2s, majority element)", days: [3] },
          { id: "w1-dsa-4", text: "Day 4: Arrays - medium (Kadane's algorithm, stock buy/sell, rearrange)", days: [4] },
          { id: "w1-dsa-5", text: "Day 5: Arrays - hard (3-sum, merge overlapping intervals, missing/repeating)", days: [5] },
          { id: "w1-dsa-6", text: "Day 6: Hashing basics (frequency count, highest/lowest frequency)", days: [6] },
          { id: "w1-dsa-7", text: "Codeforces: Div 3/4 A and B problems (800-1000 rating)", days: [1, 2, 3, 4, 5, 6] },
        ]
      },
      Development: {
        name: "Python/JS refresher, Git, IDE setup",
        tasks: [
          { id: "w1-dev-1", text: "Days 1-3: Python or C++ refresher (OOP, file I/O, std library)", days: [1, 2, 3] },
          { id: "w1-dev-2", text: "Days 4-6: JavaScript fundamentals (DOM, async/await)", days: [4, 5, 6] },
          { id: "w1-dev-3", text: "Setup: VS Code, Git, GitHub account, Node.js", days: [1, 2, 3] },
        ]
      },
      DevOps: {
        name: "Linux CLI, file system, permissions",
        tasks: [
          { id: "w1-ops-1", text: "Days 1-3: Linux basics (ls, cd, cat, grep, chmod, pipes)", days: [1, 2, 3] },
          { id: "w1-ops-2", text: "Days 4-6: File permissions, process management (ps, top, kill)", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 2,
    title: "Core Data Structures",
    tracks: {
      DSA: {
        name: "Strings & Linked Lists (Striver A2Z Steps 4-5)",
        tasks: [
          { id: "w2-dsa-1", text: "Day 1: String basics (reverse, palindrome, isomorphic)", days: [1] },
          { id: "w2-dsa-2", text: "Day 2: String medium (LPS, anagram grouping)", days: [2] },
          { id: "w2-dsa-3", text: "Day 3: Linked List basics (insertion, deletion, traversal)", days: [3] },
          { id: "w2-dsa-4", text: "Day 4: Singly LL (reverse, detect cycle, find middle)", days: [4] },
          { id: "w2-dsa-5", text: "Day 5: Doubly LL + LL medium (add two numbers, intersection)", days: [5] },
          { id: "w2-dsa-6", text: "Day 6: LL hard (reverse in groups of K, flattening)", days: [6] },
          { id: "w2-dsa-7", text: "Codeforces: Try 1100 rated problems", days: [1, 2, 3, 4, 5, 6] },
        ]
      },
      Development: {
        name: "HTML/CSS fundamentals, start React",
        tasks: [
          { id: "w2-dev-1", text: "Days 1-2: HTML5 semantic elements, Flexbox and Grid", days: [1, 2] },
          { id: "w2-dev-2", text: "Days 3-4: Responsive design, CSS animations", days: [3, 4] },
          { id: "w2-dev-3", text: "Days 5-6: React intro - components, props, JSX", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "Git advanced workflows, Shell scripting",
        tasks: [
          { id: "w2-ops-1", text: "Days 1-3: Git deep dive (branching, merging, rebasing, conflicts)", days: [1, 2, 3] },
          { id: "w2-ops-2", text: "Days 4-6: Shell scripting - variables, loops, automation", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 3,
    title: "Stacks, Queues, Recursion",
    tracks: {
      DSA: {
        name: "Stacks, Queues, Recursion (Striver A2Z Steps 6-7)",
        tasks: [
          { id: "w3-dsa-1", text: "Day 1: Stack fundamentals (implementations, balanced parens)", days: [1] },
          { id: "w3-dsa-2", text: "Day 2: Stack problems (next greater element, stock span)", days: [2] },
          { id: "w3-dsa-3", text: "Day 3: Queue fundamentals + monotonic stack/queue", days: [3] },
          { id: "w3-dsa-4", text: "Day 4: Recursion basics (factorial, Fibonacci, subsequences)", days: [4] },
          { id: "w3-dsa-5", text: "Day 5: Recursion medium (combination sum, permutations)", days: [5] },
          { id: "w3-dsa-6", text: "Day 6: Recursion hard (N-Queens, Sudoku solver)", days: [6] },
          { id: "w3-dsa-7", text: "Codeforces: 900-1200 rated problems", days: [1, 2, 3, 4, 5, 6] },
        ]
      },
      Development: {
        name: "React (hooks, state, routing)",
        tasks: [
          { id: "w3-dev-1", text: "Days 1-2: React hooks (useState, useEffect, useContext)", days: [1, 2] },
          { id: "w3-dev-2", text: "Days 3-4: React Router, API calls with axios", days: [3, 4] },
          { id: "w3-dev-3", text: "Days 5-6: State management basics, form handling", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "Docker: images, containers, volumes",
        tasks: [
          { id: "w3-ops-1", text: "Days 1-3: Docker basics, first image, Dockerfile syntax", days: [1, 2, 3] },
          { id: "w3-ops-2", text: "Days 4-6: Running containers, port mapping, volumes", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 4,
    title: "Binary Search + Project 1",
    tracks: {
      DSA: {
        name: "Binary Search & Bit Manipulation (Striver A2Z Steps 8-9)",
        tasks: [
          { id: "w4-dsa-1", text: "Day 1: Binary search on 1D arrays", days: [1] },
          { id: "w4-dsa-2", text: "Day 2: BS on answers (square root, minimum days)", days: [2] },
          { id: "w4-dsa-3", text: "Day 3: BS on 2D arrays (search in matrix)", days: [3] },
          { id: "w4-dsa-4", text: "Day 4: Bit manipulation basics (set/unset, count bits)", days: [4] },
          { id: "w4-dsa-5", text: "Day 5: Bit manipulation problems (single number, XOR)", days: [5] },
          { id: "w4-dsa-6", text: "Day 6: Mixed practice & weak topics revision", days: [6] },
        ]
      },
      Development: {
        name: "Project 1: Task Management App (Full-Stack)",
        tasks: [
          { id: "w4-dev-1", text: "Days 1-2: Backend setup (Express, MongoDB, REST APIs)", days: [1, 2] },
          { id: "w4-dev-2", text: "Days 3-4: Frontend components & API connection", days: [3, 4] },
          { id: "w4-dev-3", text: "Days 5-6: JWT Auth, styling, deployment", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "Docker Compose, basic networking",
        tasks: [
          { id: "w4-ops-1", text: "Days 1-3: Docker Compose - multi-container apps", days: [1, 2, 3] },
          { id: "w4-ops-2", text: "Days 4-6: Containerize Project 1 with Docker", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 5,
    title: "Trees + Backend Deep Dive",
    tracks: {
      DSA: {
        name: "Trees (Striver A2Z Step 10)",
        tasks: [
          { id: "w5-dsa-1", text: "Day 1: Binary tree traversals (iterative + recursive)", days: [1] },
          { id: "w5-dsa-2", text: "Day 2: BT problems (height, diameter, LCA)", days: [2] },
          { id: "w5-dsa-3", text: "Day 3: BT hard (zigzag, boundary, vertical order)", days: [3] },
          { id: "w5-dsa-4", text: "Day 4: BST basics (search, insert, delete, validate)", days: [4] },
          { id: "w5-dsa-5", text: "Day 5: BST problems (floor/ceil, Kth smallest)", days: [5] },
          { id: "w5-dsa-6", text: "Day 6: Mixed tree problems revision", days: [6] },
        ]
      },
      Development: {
        name: "Node.js, Express, databases",
        tasks: [
          { id: "w5-dev-1", text: "Days 1-3: Node.js deep dive - middleware, error handling", days: [1, 2, 3] },
          { id: "w5-dev-2", text: "Days 4-6: DB design (SQL vs NoSQL), schema, indexing", days: [4, 5, 6] },
        ]
      },
      DevOps: {
        name: "CI/CD with GitHub Actions",
        tasks: [
          { id: "w5-ops-1", text: "Days 1-3: CI/CD concepts, first GitHub Action workflow", days: [1, 2, 3] },
          { id: "w5-ops-2", text: "Days 4-6: Add CI/CD pipeline to Project 1", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 6,
    title: "Graphs + Project 2",
    tracks: {
      DSA: {
        name: "Graphs (Striver A2Z Step 11)",
        tasks: [
          { id: "w6-dsa-1", text: "Day 1: Graph representation, BFS, DFS", days: [1] },
          { id: "w6-dsa-2", text: "Day 2: Connected components, cycle detection", days: [2] },
          { id: "w6-dsa-3", text: "Day 3: Topological sort (Kahn's + DFS)", days: [3] },
          { id: "w6-dsa-4", text: "Day 4: Shortest path (Dijkstra, Bellman-Ford)", days: [4] },
          { id: "w6-dsa-5", text: "Day 5: MST (Prim's, Kruskal's), Union-Find", days: [5] },
          { id: "w6-dsa-6", text: "Day 6: Graph hard (SCC, bridges)", days: [6] },
        ]
      },
      Development: {
        name: "Project 2: Real-Time Collaborative App",
        tasks: [
          { id: "w6-dev-1", text: "Days 1-2: WebSocket setup with Socket.io", days: [1, 2] },
          { id: "w6-dev-2", text: "Days 3-4: Frontend UI & presence indicators", days: [3, 4] },
          { id: "w6-dev-3", text: "Days 5-6: Polish, documentation, deployment", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "Kubernetes fundamentals, AWS intro",
        tasks: [
          { id: "w6-ops-1", text: "Days 1-3: Kubernetes intro - pods, deployments, services", days: [1, 2, 3] },
          { id: "w6-ops-2", text: "Days 4-6: AWS intro - EC2, S3, IAM basics", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 7,
    title: "Dynamic Programming + Project 3",
    tracks: {
      DSA: {
        name: "DP (Striver A2Z Step 12)",
        tasks: [
          { id: "w7-dsa-1", text: "Day 1: DP intro, memoization vs tabulation", days: [1] },
          { id: "w7-dsa-2", text: "Day 2: 1D DP (climbing stairs, house robber)", days: [2] },
          { id: "w7-dsa-3", text: "Day 3: 2D DP (grid paths, minimum path sum)", days: [3] },
          { id: "w7-dsa-4", text: "Day 4: Subsequence DP (LCS, LIS, edit distance)", days: [4] },
          { id: "w7-dsa-5", text: "Day 5: Knapsack patterns (0/1, coin change)", days: [5] },
          { id: "w7-dsa-6", text: "Day 6: DP on strings + partition DP", days: [6] },
        ]
      },
      Development: {
        name: "Project 3: AI-Powered Developer Dashboard",
        tasks: [
          { id: "w7-dev-1", text: "Days 1-2: Next.js setup, OpenAI API integration", days: [1, 2] },
          { id: "w7-dev-2", text: "Days 3-4: Core features & DB schema", days: [3, 4] },
          { id: "w7-dev-3", text: "Days 5-6: Animations, responsive design, deployment", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "AWS services, Terraform basics",
        tasks: [
          { id: "w7-ops-1", text: "Days 1-3: AWS hands-on (EC2, S3 static hosting)", days: [1, 2, 3] },
          { id: "w7-ops-2", text: "Days 4-6: Terraform - infrastructure as code", days: [4, 5, 6] },
        ]
      }
    }
  },
  {
    week: 8,
    title: "Revision, Mock Interviews, Portfolio",
    tracks: {
      DSA: {
        name: "Greedy, Tries, revision + mocks",
        tasks: [
          { id: "w8-dsa-1", text: "Day 1: Greedy algorithms (activity selection)", days: [1] },
          { id: "w8-dsa-2", text: "Day 2: Tries & Sliding Window review", days: [2] },
          { id: "w8-dsa-3", text: "Day 3: Hard problems deep revision", days: [3] },
          { id: "w8-dsa-4", text: "Day 4: Mock interview #1 (2 medium)", days: [4] },
          { id: "w8-dsa-5", text: "Day 5: Mock interview #2 (1 medium, 1 hard)", days: [5] },
          { id: "w8-dsa-6", text: "Day 6: Final weak-area review", days: [6] },
        ]
      },
      Development: {
        name: "Portfolio polish, resume, applications",
        tasks: [
          { id: "w8-dev-1", text: "Days 1-2: Polish all projects & fix bugs", days: [1, 2] },
          { id: "w8-dev-2", text: "Days 3-4: Write professional READMEs", days: [3, 4] },
          { id: "w8-dev-3", text: "Days 5-6: Build personal portfolio website", days: [5, 6] },
        ]
      },
      DevOps: {
        name: "Deploy everything, documentation",
        tasks: [
          { id: "w8-ops-1", text: "Days 1-3: Infrastructure documentation", days: [1, 2, 3] },
          { id: "w8-ops-2", text: "Days 4-6: Blog posts about DevOps journey", days: [4, 5, 6] },
        ]
      }
    }
  }
];
