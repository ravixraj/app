import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { api } from '$lib/api';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	// if (!locals.user) redirect(303, '/auth');

	// Load current user profile + suggestions once for the whole layout
	const [profileRes, suggestionsRes] = await Promise.all([
		api.get(`social-media/profile`, locals.accessToken),
		api.get(`social-media/profile/suggested`)
	]);

	const profile = await profileRes.json();
	const suggestions = await suggestionsRes.json();

	return {
		currentUser: profile.data ?? null,
		suggestions: suggestions.data ?? []
	};
};
