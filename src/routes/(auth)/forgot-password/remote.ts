import { form } from '$app/server';
import { api } from '#lib/api.js';
import { forgotSchema, type FormResult } from '#lib/schemas.js';

export const forgotPassword = form(forgotSchema, async (data): Promise<FormResult> => {
	const res = await api.post('users/forgot-password', data);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Forgot Password failed. Please try again.' };
	}

	return { type: 'success', text: 'Password reset link sent. check your inbox.' };
});
