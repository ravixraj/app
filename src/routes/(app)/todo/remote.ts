import { form } from '$app/server';
import { api } from '#lib/api.js';
import { todoSchema, type FormResult } from '#lib/schemas.js';

export const createTodo = form(todoSchema, async (data): Promise<FormResult> => {
	const res = await api.post('todos', data);

	if (!res.ok) {
		const json = await res.json().catch(() => null);
		return { type: 'error', text: json?.message ?? 'Todo creation failed. Please try again.' };
	}

	return { type: 'success', text: 'Todo created!' };
});
