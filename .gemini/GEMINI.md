# Project-Specific Gemini Instructions

This document outlines the specific operational guidelines for the Gemini agent within this project.

## 1. Task Management Workflow

All tasks within this project will follow a strict planning and implementation workflow:

- **Planning Phase:** Before any implementation begins, a detailed plan for the task must be created.
  - Plans are stored in the `TODO/` directory.
  - Each task's plan will have its own Markdown file (e.g., `TODO/task_name.md`).
  - An `index.md` file within the `TODO/` directory will serve as a central index, listing all planned and implemented tasks with their respective statuses.

- **Implementation Phase:** Implementation will only commence after the plan has been explicitly approved by the user.

## 2. Git Workflow

To maintain a clean and organized Git history, the following branching strategy will be adhered to:

- **Feature Branches:** For each new task or feature, a dedicated branch will be created from the `main` branch.
  - Branch names should be descriptive and follow a convention (e.g., `feat/task-description`, `fix/bug-description`).

- **Task Completion:** A task is considered complete only when its corresponding feature branch has been successfully merged into the `main` branch.
  - All changes related to a task, including planning documents, code modifications, and tests, must be part of the task's branch.

## 3. Communication and Approval

- The Gemini agent will always present a plan for approval before proceeding with implementation.
- The Gemini agent will inform the user about the creation of new branches and the completion of merges.
