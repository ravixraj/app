import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { api } from '#lib/api.js';
import { createPageMetaTags } from '#lib/const.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/auth');

	const res = await api.get('social-media/posts');
	const data = await res.json();

	return {
		posts: data.data ?? [],
		currentUserId: locals.user._id,
		accessToken: locals.accessToken,
		metaTags: createPageMetaTags({
			title: 'Social Feed',
			description: 'Browse and share posts, connect with others on FreeAPI social feed.',
			canonical: '/social'
		})
	};
};
