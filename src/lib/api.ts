import { error } from '@sveltejs/kit';

const BASE = 'https://api.freeapi.app/api/v1';

// Generic API response & Request config type
type ApiResponse<T = unknown> = T;
type RequestConfig<T = unknown> = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	path: string;
	data?: T;
	token?: string;
};

// Send function with generics
async function send<TResponse = unknown, TRequest = unknown>({
	method,
	path,
	data,
	token
}: RequestConfig<TRequest>): Promise<ApiResponse<TResponse>> {
	const opts: RequestInit = {
		method,
		headers: {}
	};

	if (data) {
		(opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		(opts.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${BASE}/${path}`, opts);

	if (res.ok || res.status === 422) {
		const text = await res.text();
		return text ? (JSON.parse(text) as TResponse) : ({} as TResponse);
	}

	throw error(res.status);
}

// API helpers
export function get<T = unknown>(path: string, token?: string): Promise<T> {
	return send<T>({ method: 'GET', path, token });
}

export function del<T = unknown>(path: string, token?: string): Promise<T> {
	return send<T>({ method: 'DELETE', path, token });
}

export function post<T = unknown, B = unknown>(path: string, data: B, token?: string): Promise<T> {
	return send<T, B>({ method: 'POST', path, data, token });
}

export function put<T = unknown, B = unknown>(path: string, data: B, token?: string): Promise<T> {
	return send<T, B>({ method: 'PUT', path, data, token });
}
