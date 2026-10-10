import { form, getRequestEvent } from '$app/server';
import { api, BASE } from '#lib/api.js';
import { createPostSchema, type FormResult } from '#lib/schemas.js';

export const createPost = form(createPostSchema, async (data): Promise<FormResult> => {
	const { cookies } = getRequestEvent();
	const token = cookies.get('accessToken');

	const body = new FormData();
	body.append('content', data.content);

	for (const img of data.images ?? []) {
		if (img.size > 0) body.append('images', img);
	}

	const res = await fetch(`${BASE}/social-media/posts`, {
		method: 'POST',
		body,
		headers: token ? { Authorization: `Bearer ${token}` } : {}
	});

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'failed to create post.' };
	}

	return { type: 'success', text: 'post created!' };
});
