import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { api } from '$lib/api';
import { message, superValidate } from 'sveltekit-superforms';

const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters long' })
	.max(16, { message: 'Password must be at most 16 characters long' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message:
			'Password must contain at least one uppercase letter, one lowercase letter, number and one special character.'
	});

const registerSchema = z.object({
	username: z
		.string()
		.min(1, { message: 'Password must be at least 1 characters long' })
		.max(12, { message: 'Username must be at most 12 characters long' }),
	email: z.string().nonempty().email({ message: 'Invalid email address' }),
	password: strongPassword,
	role: z.enum(['USER', 'ADMIN']).default('USER')
});

const loginSchema = registerSchema.pick({
	email: true,
	password: true
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) throw redirect(303, '/social');

	return {
		registerForm: await superValidate(zod4(registerSchema)),
		loginForm: await superValidate(zod4(loginSchema))
	};
};

export const actions: Actions = {
	register: async ({ request }) => {
		const form = await superValidate(request, zod4(registerSchema));

		if (!form.valid)
			return fail(400, {
				registerForm: form,
				loginForm: await superValidate(zod4(loginSchema))
			});

		const res = await api.post('users/register', form.data);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Registration failed. Please try again.';

			const loginForm = await superValidate(zod4(loginSchema));
			return message(form, { type: 'error', text: errMsg });
		}

		const loginForm = await superValidate(zod4(loginSchema));
		return message(form, { type: 'success', text: 'Account created! Please login.' });
	},
	login: async ({ request, cookies }) => {
		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid)
			return fail(400, {
				loginForm: form,
				registerForm: await superValidate(zod4(registerSchema))
			});

		const res = await api.post('/users/login', form.data);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Login failed. Please try again.';

			const registerForm = await superValidate(zod4(registerSchema));
			return message(form, { type: 'error', text: errMsg });
		}

		const json = await res.json();

		const opts = { path: '/', httpOnly: true, sameSite: 'lax' as const };
		cookies.set('accessToken', json.data.accessToken, opts);
		cookies.set('refreshToken', json.data.refreshToken, opts);

		throw redirect(301, '/social');
	}
};
