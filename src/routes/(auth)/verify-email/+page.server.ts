import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

const resendSchema = z.object({
	email: z.string().email()
});

export const load: PageServerLoad = async ({ url }) => {
	// Handle click from email link: /verify-email?token=xxx
	const token = url.searchParams.get('token');
	let isEmailVerified = false;

	if (token) {
		const res = await api.get(`users/verify-email/${token}`);
		isEmailVerified = res.ok;
	}

	return {
		isEmailVerified,
		resendForm: await superValidate(zod4(resendSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(resendSchema));

		const res = await api.post(`users/resend-email-verification`, form.data, locals.accessToken);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Could not resend verification email.';

			return message(form, { type: 'error', text: errMsg });
		}

		return { form };
	}
};
