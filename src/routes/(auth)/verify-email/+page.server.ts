import type { PageServerLoad } from './$types';
import { api } from '#lib/api.js';

export const load: PageServerLoad = async ({ url }) => {
	// Handle click from email link: /verify-email?token=xxx
	const token = url.searchParams.get('token');
	let isEmailVerified = false;

	if (token) {
		const res = await api.get(`users/verify-email/${token}`);
		isEmailVerified = res.ok;
	}

	return {
		isEmailVerified
	};
};
