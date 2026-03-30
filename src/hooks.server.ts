import { redirect, type Handle } from '@sveltejs/kit';
import { api } from '$lib/api';

export const handle: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('accessToken');
	const refreshToken = event.cookies.get('refreshToken');

	if (accessToken) {
		try {
			const res = await api.get('users/current-user', accessToken);

			if (res.ok) {
				const json = await res.json();
				event.locals.user = json.data;
				event.locals.accessToken = accessToken;
			} else {
				throw new Error('expired token');
			}
		} catch {
			// try refresh
			if (refreshToken) {
				try {
					const refresh = await api.post('users/refresh-token', refreshToken);

					if (refresh.ok) {
						const json = await refresh.json();
						const newAccess = json.data.accessToken;
						const newRefresh = json.data.refreshToken;

						event.cookies.set('accessToken', newAccess, {
							path: '/',
							httpOnly: true,
							sameSite: 'lax'
						});
						event.cookies.set('refreshToken', newRefresh, {
							path: '/',
							httpOnly: true,
							sameSite: 'lax'
						});

						event.locals.accessToken = newAccess;

						const userRes = await api.get('users/current-user', newAccess);
						if (userRes.ok) {
							event.locals.user = (await userRes.json()).data;
						}
					}
				} catch {
					event.locals.user = null;
				}
			}
		}
	}

	return resolve(event);
};
