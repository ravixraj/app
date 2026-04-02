import { superValidate, fail, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { api, BASE } from '$lib/api';
import { createPageMetaTags } from '$lib/const.js';

const createPostSchema = z.object({
	content: z
		.string()
		.min(1, 'Post content is required')
		.max(500, 'Post content must be less than 500 characters')
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/auth');

	const res = await api.get('social-media/posts');
	const data = await res.json();

	return {
		posts: data.data ?? [],
		currentUserId: locals.user._id,
		form: await superValidate(zod4(createPostSchema)),
		metaTags: createPageMetaTags({
			title: 'Social Feed',
			description: 'Browse and share posts, connect with others on FreeAPI social feed.',
			canonical: '/social'
		})
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(createPostSchema));

		if (!form.valid) return fail(400, { form });

		const body = new FormData();
		body.append('content', form.data.content);

		const images = formData.getAll('images') as File[];

		images.forEach((img) => {
			if (img.size > 0) {
				body.append('images', img);
			}
		});

		const res = await fetch(`${BASE}/social-media/posts`, {
			method: 'POST',
			body,
			headers: {
				Authorization: `Bearer ${locals.accessToken}`
			}
		});

		const data = await res.json();

		if (!res.ok) {
			return message(
				form,
				{ type: 'error', text: data?.message || 'failed to create post.' },
				{ status: 400 }
			);
		}

		return message(form, { type: 'success', text: 'post created!' });
	}
};
