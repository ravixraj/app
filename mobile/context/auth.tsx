import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';

type User = {
	_id: string;
	username: string;
	email: string;
	avatar?: { url: string };
	isEmailVerified: boolean;
	role: string;
};

type AuthContextType = {
	user: User | null;
	token: string | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (username: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	loading: true,
	login: async () => {},
	register: async () => {},
	logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStoredAuth();
	}, []);

	async function loadStoredAuth() {
		try {
			const storedToken = await SecureStore.getItemAsync('accessToken');
			if (!storedToken) return;

			const res = await api.get('users/current-user', storedToken);
			if (res.ok) {
				const json = await res.json();
				setUser(json.data);
				setToken(storedToken);
			} else {
				// Try refresh
				const refreshToken = await SecureStore.getItemAsync('refreshToken');
				if (refreshToken) {
					const refreshRes = await api.post('users/refresh-token', {
						refreshToken
					});
					if (refreshRes.ok) {
						const refreshJson = await refreshRes.json();
						await SecureStore.setItemAsync('accessToken', refreshJson.data.accessToken);
						await SecureStore.setItemAsync('refreshToken', refreshJson.data.refreshToken);
						setToken(refreshJson.data.accessToken);

						const userRes = await api.get('users/current-user', refreshJson.data.accessToken);
						if (userRes.ok) {
							setUser((await userRes.json()).data);
						}
					} else {
						await clearAuth();
					}
				}
			}
		} catch {
			await clearAuth();
		} finally {
			setLoading(false);
		}
	}

	async function clearAuth() {
		await SecureStore.deleteItemAsync('accessToken');
		await SecureStore.deleteItemAsync('refreshToken');
		setUser(null);
		setToken(null);
	}

	async function login(email: string, password: string) {
		const res = await api.post('users/login', { email, password });
		const json = await res.json();
		if (!res.ok) throw new Error(json.message || 'Login failed');

		await SecureStore.setItemAsync('accessToken', json.data.accessToken);
		await SecureStore.setItemAsync('refreshToken', json.data.refreshToken);
		setToken(json.data.accessToken);

		const userRes = await api.get('users/current-user', json.data.accessToken);
		if (userRes.ok) {
			setUser((await userRes.json()).data);
		}
	}

	async function register(username: string, email: string, password: string) {
		const res = await api.post('users/register', {
			username,
			email,
			password
		});
		const json = await res.json();
		if (!res.ok) throw new Error(json.message || 'Registration failed');
	}

	async function logout() {
		try {
			await api.post('users/logout', {}, token);
		} catch {}
		await clearAuth();
	}

	return (
		<AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
