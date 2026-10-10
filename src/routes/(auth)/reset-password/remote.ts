import { form } from '$app/server';
import { api } from '#lib/api.js';
import { resetSchema, type FormResult } from '#lib/schemas.js';

export const resetPassword = form(resetSchema, async (data): Promise<FormResult> => {
	const res = await api.post(`users/reset-password/${data.token}`, {
		newPassword: data.newPassword,
		confirmPassword: data.confirmPassword
	});

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Password Reset failed. Please try again.' };
	}

	return { type: 'success', text: 'Password reset successfully' };
});
