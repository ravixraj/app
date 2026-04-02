import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/auth');

	return {
		metaTags: {
			title: 'Shop',
			description: 'Browse products and shop on FreeAPI.',
			canonical: '/shop'
		}
	};
};
