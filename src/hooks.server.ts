import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/tools')) {
    // Skip authentication in development mode
    if (dev) {
      return resolve(event);
    }

    const session = event.cookies.get('session');
    if (session !== 'loggedIn') {
      throw redirect(303, '/login');
    }
  }

  return resolve(event);
};
