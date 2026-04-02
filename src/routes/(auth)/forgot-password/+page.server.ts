import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { api } from '$lib/api';

const forgotSchema = z.object({
	email: z.string().nonempty().email({ message: 'Invalid email address' })
});

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(forgotSchema)) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(forgotSchema));

		if (!form.valid) return fail(400, { form });

		const res = await api.post('users/forgot-password', form.data);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Forgot Password failed. Please try again.';

			return message(form, { type: 'error', text: errMsg });
		}

		return message(form, 'Password reset link sent. check your inbox.');
	}
};
