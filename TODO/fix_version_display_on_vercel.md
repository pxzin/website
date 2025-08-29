# Task: Fix Version Display on Vercel Production

## Description
The application version is not being displayed in the footer when deployed to Vercel production. This bug needs to be identified and fixed to ensure the correct version is always visible.

## Proposed Solution

The most likely cause for the version not being displayed in production is that the `package.json` file is not accessible or readable during the Vercel build process, or that the `fs` and `path` modules are not available in the Vercel serverless environment in the way we are using them.

SvelteKit's Vercel adapter might optimize the build in a way that `process.cwd()` or `fs.readFileSync` behave differently in the serverless function environment compared to local development.

A more robust approach for Vercel deployments is to leverage environment variables or to ensure the `package.json` is bundled correctly.

#### Investigation Steps:

1.  **Verify Vercel Build Logs:** Check Vercel build logs for any errors or warnings related to file access or `package.json`.
2.  **Understand Vercel Environment:** Research how `fs` and `path` modules behave in Vercel's serverless functions and how to correctly access files in the deployed environment.
3.  **Alternative Version Loading:** Explore alternative ways to get the `package.json` version in a Vercel-compatible manner.

#### Potential Solutions:

1.  **Vercel Environment Variable:**
    *   Pass the `package.json` version as an environment variable during the Vercel build. This can be done by setting a build command that reads the version and sets an environment variable.
    *   Access this environment variable in `+layout.server.ts`.
2.  **SvelteKit Adapter Configuration:**
    *   Check if the SvelteKit Vercel adapter has specific configurations for bundling static assets or `package.json`.
3.  **Direct Import (Re-evaluation):**
    *   Re-evaluate if directly importing `package.json` in `+layout.server.ts` is the intended way for Vercel, or if there's a specific SvelteKit/Vercel pattern for this.

## Steps

1.  **Investigate Vercel Build Logs:**
    *   Access the Vercel dashboard for the project.
    *   Review the build logs for the latest deployment to identify any errors or warnings related to `package.json` or file system access.
2.  **Test Environment Variable Approach (Local Simulation):**
    *   Modify `package.json` to include a script that sets an environment variable with the version.
    *   Modify `src/routes/+layout.server.ts` to read the version from `process.env`.
    *   Test locally to ensure it works.
3.  **Deploy to Vercel (Test Environment Variable):**
    *   Commit the changes and push to a new branch.
    *   Deploy this branch to Vercel to see if the version is displayed.
4.  **If Environment Variable Fails, Explore SvelteKit/Vercel Specifics:**
    *   If the environment variable approach doesn't work, research official SvelteKit documentation or Vercel deployment guides for best practices on accessing `package.json` version in serverless functions.

## Verification

*   The application version is correctly displayed in the footer on the Vercel production site.
