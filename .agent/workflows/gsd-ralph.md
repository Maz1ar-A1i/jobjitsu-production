---
description: Combined GSD and Ralph methodology workflow for high-quality development
---
// turbo-all

# GSD-Ralph Workflow

This workflow combines the "Get Shit Done" (GSD) planning rigor with "Ralph" atomic execution loops.

## 1. Context Initialization
   - [ ] Check/Create `AGENTS.md` in relevant directories (root, src, etc.) for project-specific patterns.
   - [ ] Check/Create `progress.txt` in root for logging learnings and context.

## 2. Planning Phase (GSD Mode)
   - [ ] **Goal-Backward Planning**: Ask "What must be TRUE for this to be done?".
   - [ ] **Atomic Breakdown**: Break features into small, testable tasks (< 1 hour execution).
   - [ ] **Update Plan**: Structure `task.md` or `implementation_plan.md` with these atomic tasks.

## 3. Execution Loop (Ralph Mode)
   - **Loop for each task**:
     1. **Context**: Read `AGENTS.md` and `progress.txt` patterns.
     2. **Implement**: Write code for the single task.
     3. **Verify**: Run typechecks, tests, and validat in browser (if UI).
     4. **Commit**: Create an atomic git commit (`feat: ...`).
     5. **Log**: Append key learnings/decisions to `progress.txt`.
     6. **Refine**: Update `AGENTS.md` if a reusable pattern is discovered.

## 4. Verification Phase (GSD Mode)
   - [ ] **Truth Verification**: Verify each "Truth" defined in planning.
   - [ ] **Documentation**: Update `walkthrough.md` with proof of completion.
