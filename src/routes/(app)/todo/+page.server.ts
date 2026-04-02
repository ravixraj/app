import { api } from '$lib/api';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import z from 'zod';
import type { PageServerLoad } from './$types.js';
import type { Actions } from '@sveltejs/kit';
import { createPageMetaTags } from '$lib/const.js';

const todoSchema = z.object({
	title: z.string().min(1, 'Title is required').max(50, 'Title must be less than 50 characters'),
	description: z.string().optional()
});

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') ?? '';
	const complete = url.searchParams.get('complete') ?? '';

	const params = new URLSearchParams();

	if (query) {
		params.set('query', query);
	}
	if (complete) {
		params.set('complete', complete);
	}

	const res = await api.get(`todos?${params}`);
	const json = await res.json();

	return {
		todos: json.data ?? [],
		form: await superValidate(zod4(todoSchema)),
		metaTags: createPageMetaTags({
			title: 'Todos',
			description: 'Manage your tasks with FreeAPI todo application.',
			canonical: '/todo'
		})
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(todoSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const res = await api.post('todos', form.data);

		if (!res.ok) {
			const json = await res.json().catch(() => null);
			const errMsg = json?.message ?? 'Todo creation failed. Please try again.';

			return message(form, { type: 'error', text: errMsg });
		}
		const json = await res.json();

		return message(form, { type: 'success', text: 'Todo created!', data: { todo: json.data } });
	}
};
