import { form, getRequestEvent } from '$app/server';
import { api } from '#lib/api.js';
import { changeSchema, type FormResult } from '#lib/schemas.js';

export const changePassword = form(changeSchema, async (data): Promise<FormResult> => {
	const { cookies } = getRequestEvent();
	const token = cookies.get('accessToken');

	const res = await api.post('users/change-password', data, token);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Change Password failed. Please try again.' };
	}

	return { type: 'success', text: 'Password updated successfully' };
});
