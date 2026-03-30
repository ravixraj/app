const BASE = 'https://api.freeapi.app/api/v1';

// Generic API response & Request config type
type RequestConfig<T = unknown> = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	path: string;
	data?: T;
	token?: string | null;
};

async function send<T = unknown>({
	method,
	path,
	data,
	token
}: RequestConfig<T>): Promise<Response> {
	const headers: Record<string, string> = {};

	if (data) headers['Content-Type'] = 'application/json';
	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${BASE}/${path.replace(/^\/+/, '')}`, {
		method,
		headers,
		body: data ? JSON.stringify(data) : undefined
	});

	return res;
}

export const api = {
	get: (path: string, token?: string) => send({ method: 'GET', path, token }),

	post: <T>(path: string, data: T, token?: string | null) =>
		send({ method: 'POST', path, data, token }),

	put: <T>(path: string, data: T, token?: string | null) =>
		send({ method: 'PUT', path, data, token }),

	del: (path: string, token?: string | null) => send({ method: 'DELETE', path, token })
};
