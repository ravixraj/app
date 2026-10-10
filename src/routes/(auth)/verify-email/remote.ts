import { form, getRequestEvent } from '$app/server';
import { api } from '#lib/api.js';
import { resendSchema, type FormResult } from '#lib/schemas.js';

export const resendVerification = form(resendSchema, async (data): Promise<FormResult> => {
	const { cookies } = getRequestEvent();
	const token = cookies.get('accessToken');

	const res = await api.post('users/resend-email-verification', data, token);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Could not resend verification email.' };
	}

	return { type: 'success', text: 'Verification email sent. check your inbox.' };
});
