# Task: Implement "Tools" Section with a Simple To-Do List

## Description
Create a new section on the website at `/tools` to host various small, daily-use tools. The data for these tools will be stored in files on the server. The first tool to be implemented is a simple to-do list.

## Proposed Solution

We will create a new route for the tools section and a sub-route for the to-do list. The to-do list data will be stored in a JSON file.

#### 1. Tools Section (`/tools`)
*   Create a new route `src/routes/tools/+page.svelte`.
*   This page will serve as a directory or dashboard for all available tools.

#### 2. To-Do List Tool (`/tools/todolist`)
*   Create a new route `src/routes/tools/todolist/+page.svelte`.
*   This page will display the to-do list and allow for adding and removing items.

#### 3. Data Storage
*   To-do list items will be stored in a JSON file (e.g., `src/lib/data/todolist.json`).
*   We will use SvelteKit's server-side capabilities (`+page.server.ts`) to read and write to this JSON file. This will involve using Node.js `fs` module.

## Steps

1.  **Create Tools Route (`/tools`):**
    *   Create `src/routes/tools/+page.svelte`.
    *   Add a simple title and a link to the to-do list tool.
2.  **Create To-Do List Route (`/tools/todolist`):**
    *   Create `src/routes/tools/todolist/+page.svelte`.
    *   This page will display the to-do list items.
3.  **Create To-Do List Data File:**
    *   Create `src/lib/data/todolist.json` with an initial empty array of to-do items.
4.  **Implement To-Do List Server-Side Logic:**
    *   Create `src/routes/tools/todolist/+page.server.ts`.
    *   Implement a `load` function to read `todolist.json` and pass the to-do items to the page.
    *   Implement `actions` for adding and deleting to-do items. These actions will read the JSON file, modify the data, and write it back.
5.  **Implement To-Do List UI:**
    *   In `src/routes/tools/todolist/+page.svelte`, create a form to add new to-do items.
    *   Display the list of to-do items with a delete button for each.
    *   Use SvelteKit's `enhance` for progressive enhancement of the form.
6.  **Update Navigation:**
    *   Add a link to the `/tools` route in the main navigation bar (`src/lib/components/Nav/Nav.svelte`).
7.  **Test Locally:**
    *   Run `pnpm run check` and `pnpm run dev` locally.
    *   Verify that the `/tools` page links to the to-do list.
    *   Verify that the to-do list can be viewed, items can be added, and items can be deleted.
    *   Check that the `todolist.json` file is updated correctly.

## Verification

*   The `/tools` route is accessible and displays a link to the to-do list.
*   The `/tools/todolist` route displays the to-do list.
*   Users can add and delete to-do items.
*   Changes to the to-do list are persisted in `todolist.json`.
*   The UI is consistent with the rest of the website.
