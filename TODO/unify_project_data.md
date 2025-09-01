# Task: Unify Project Data Source for Homepage and Projects Page

## Description
Currently, the "Featured Projects" section on the homepage and the "Projects" page (`/projects`) use separate, hardcoded data. This task aims to unify these into a single, easily updatable data source. The data source should include a `featured` flag to control which projects appear on the homepage.

## Proposed Solution

We will create a centralized data file for projects. This file will be a JavaScript/TypeScript array of objects, allowing for easy updates. We will then modify both the homepage and the projects page to consume this single source of truth.

#### 1. Centralized Project Data
*   Create a new file (e.g., `src/lib/data/projects.ts`) that exports an array of project objects.
*   Each project object will have properties like `name`, `description`, `link`, and a new `featured: boolean` property.

#### 2. Homepage Integration
*   Modify `src/routes/+page.svelte` to import the project data.
*   Filter the projects to display only those with `featured: true` in the "Featured Projects" section.

#### 3. Projects Page Integration
*   Modify `src/routes/projects/+page.svelte` to import the project data.
*   Display all projects from the data source on this page.

## Steps

1.  **Create Project Data File:**
    *   Create `src/lib/data/projects.ts`.
    *   Define an array of project objects, including the `featured` boolean flag. Populate it with the existing projects from both the homepage and the projects page, setting `featured: true` for those intended for the homepage.
2.  **Update Homepage (`src/routes/+page.svelte`):**
    *   Import the project data.
    *   Modify the "Featured Projects" section to iterate over the filtered data (where `featured` is true).
3.  **Update Projects Page (`src/routes/projects/+page.svelte`):**
    *   Import the project data.
    *   Modify the page to iterate over all projects from the data source.
4.  **Test Locally:**
    *   Run `pnpm run check` and `pnpm run dev` locally.
    *   Verify that the "Featured Projects" section on the homepage displays only featured projects.
    *   Verify that the "Projects" page displays all projects.
    *   Ensure all links and content are correct.

## Verification

*   The "Featured Projects" section on the homepage displays only projects marked as `featured: true`.
*   The "Projects" page (`/projects`) displays all projects from the unified data source.
*   Updating `src/lib/data/projects.ts` correctly reflects changes on both pages.
*   No duplicate content or missing projects.
