// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				_id: string;
				username: string;
				email: string;
				avatar: { url: string };
				isEmailVerified: boolean;
				role: string;
			} | null;
			accessToken: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
