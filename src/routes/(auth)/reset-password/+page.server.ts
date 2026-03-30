import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { api } from '$lib/api';

const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters long' })
	.max(16, { message: 'Password must be at most 16 characters long' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message:
			'Password must contain at least one uppercase letter, one lowercase letter, number and one special character.'
	});

const resetSchema = z
	.object({
		newPassword: strongPassword,
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Confirm password must match the new password',
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(resetSchema)) };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await superValidate(request, zod4(resetSchema));

		if (!form.valid) return fail(400, { form });

		// token comes from the URL: /reset-password?token=xxx
		const token = url.searchParams.get('token');

		if (!token) return fail(400, { form });

		const res = await api.post(`users/reset-password/${token}`, form.data);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Password Reset failed. Please try again.';

			return message(form, { type: 'error', text: errMsg });
		}

		return message(form, 'Password reset successfully');
	}
};
