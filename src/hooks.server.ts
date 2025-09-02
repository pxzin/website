import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/tools')) {
		const session = event.cookies.get('session');
		if (session !== 'loggedIn') {
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
};
