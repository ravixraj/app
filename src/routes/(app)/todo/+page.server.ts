import { api } from '#lib/api.js';
import type { PageServerLoad } from './$types.js';
import { createPageMetaTags } from '#lib/const.js';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('query') ?? '';
	const complete = url.searchParams.get('complete') ?? '';

	const params = new URLSearchParams();

	if (query) {
		params.set('query', query);
	}
	if (complete) {
		params.set('complete', complete);
	}

	const res = await api.get(`todos?${params}`);
	const json = await res.json();

	return {
		todos: json.data ?? [],
		metaTags: createPageMetaTags({
			title: 'Todos',
			description: 'Manage your tasks with FreeAPI todo application.',
			canonical: '/todo'
		})
	};
};
