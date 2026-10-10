import { form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { api } from '#lib/api.js';
import { loginSchema, registerSchema, type FormResult } from '#lib/schemas.js';

export const register = form(registerSchema, async (data): Promise<FormResult> => {
	const res = await api.post('users/register', data);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Registration failed. Please try again.' };
	}

	return { type: 'success', text: 'Account created! Please login.' };
});

export const login = form(loginSchema, async (data): Promise<FormResult> => {
	const { cookies } = getRequestEvent();
	const res = await api.post('/users/login', data);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Login failed. Please try again.' };
	}

	const json = await res.json();

	const opts = { path: '/', httpOnly: true, sameSite: 'lax' as const };
	cookies.set('accessToken', json.data.accessToken, opts);
	cookies.set('refreshToken', json.data.refreshToken, opts);

	redirect(303, '/social');
});
