import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { api } from '$lib/api';

const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters long' })
	.max(16, { message: 'Password must be at most 16 characters long' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message:
			'Password must contain at least one uppercase letter, one lowercase letter, number and one special character.'
	});

const changeSchema = z
	.object({
		oldPassword: strongPassword,
		newPassword: strongPassword,
		confirmNewPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Confirm password must match the new password',
		path: ['confirmNewPassword']
	});

export const load: PageServerLoad = async ({ locals }) => {
	// Protect this route — redirect if not logged in
	if (!locals.user) throw redirect(303, '/auth');

	return { form: await superValidate(zod4(changeSchema)) };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(changeSchema));

		if (!form.valid) return fail(400, { form });

		const res = await api.post('users/change-password', form.data, locals.accessToken);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Change Password failed. Please try again.';

			return message(form, { type: 'error', text: errMsg });
		}

		return message(form, { type: 'success', text: 'Password updated successfully' });
	}
};
