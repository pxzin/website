# Task: Implement Application Versioning and Changelog

## Description
Implement a system to display the application's current version and provide a changelog detailing changes between versions. The current version should be visible in the footer, and a dedicated route should display the changelog.

## Proposed Solution

#### 1. Version Management
*   The application version will be managed in `package.json`. We will use `package.json`'s `version` field as the single source of truth for the application version.
*   We will create a utility function to read this version at build time or runtime for display.

#### 2. Changelog
*   The changelog will be a Markdown file, `CHANGELOG.md`, located in the project root.
*   It will follow a simplified Keep a Changelog format (or similar, depending on existing content).
*   We will create a SvelteKit route (`/changelog`) to read and display the content of `CHANGELOG.md`.

#### 3. Display Version in Footer
*   The current version will be displayed in the footer of the site. This will likely involve modifying `src/routes/+layout.svelte` or creating a new `Footer.svelte` component.

## Steps

1.  **Create `CHANGELOG.md`:**
    *   Create an initial `CHANGELOG.md` file in the project root with a basic structure and an entry for the current version (0.0.1).
2.  **Read Version from `package.json`:**
    *   Create a utility file (e.g., `src/lib/utils/version.ts`) to read the `version` from `package.json`. This should be done in a way that's compatible with SvelteKit's SSR and client-side rendering.
3.  **Implement Changelog Route (`/changelog`):**
    *   Create a new SvelteKit route `src/routes/changelog/+page.svelte`.
    *   This page will read the content of `CHANGELOG.md` and render it as HTML. We might need a Markdown renderer (e.g., `marked` or `svelte-markdown`).
4.  **Display Version in Footer:**
    *   Modify `src/routes/+layout.svelte` to include a footer section.
    *   Display the application version (read from `package.json`) in this footer.
    *   Add a link to the `/changelog` route in the footer.
5.  **Update `package.json` version:**
    *   Increment the version in `package.json` to `0.0.2` to reflect the changes made in this task.

## Verification

*   The application version (e.g., 0.0.2) is visible in the site's footer.
*   Clicking the version in the footer (or navigating to `/changelog`) displays the `CHANGELOG.md` content correctly formatted.
*   The changelog content is readable and accurate.
