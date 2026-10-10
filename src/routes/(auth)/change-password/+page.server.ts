import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Protect this route — redirect if not logged in
	if (!locals.user) throw redirect(303, '/auth');

	return {};
};
