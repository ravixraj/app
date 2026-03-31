import { api } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
	const { username } = params;

	const res = locals.accessToken
		? await api.get('social-media/profile', locals.accessToken)
		: await api.get(`social-media/profile/${username}`);

	const profileData = await res.json();

	return {
		profile: profileData.data ?? null
	};
};
