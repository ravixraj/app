import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { api } from '$lib/api';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	const profileRes = await api.get(`social-media/profile`, locals.accessToken);
	const profile = await profileRes.json();

	return {
		currentUser: profile.data ?? null
	};
};
