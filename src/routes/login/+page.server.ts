import { TODO_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		if (password !== TODO_PASSWORD) {
			return fail(401, { error: 'Invalid password. Please try again.' });
		}

		cookies.set('session', 'loggedIn', {
			httpOnly: true,
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 1 week
			secure: process.env.NODE_ENV === 'production',
		});

		throw redirect(303, '/tools/todolist');
	},

	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/login');
	},
};
