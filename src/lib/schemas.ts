import { z } from 'zod';

export type FormResult = { type: 'success' | 'error'; text: string };

export const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters long' })
	.max(16, { message: 'Password must be at most 16 characters long' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message:
			'Password must contain at least one uppercase letter, one lowercase letter, number and one special character.'
	});

export const registerSchema = z.object({
	username: z
		.string()
		.min(1, { message: 'Username must be at least 1 characters long' })
		.max(12, { message: 'Username must be at most 12 characters long' }),
	email: z.string().nonempty().email({ message: 'Invalid email address' }),
	password: strongPassword,
	role: z.enum(['USER', 'ADMIN']).default('USER')
});

export const loginSchema = z.object({
	email: z.string().nonempty().email({ message: 'Invalid email address' }),
	password: z.string().min(1, { message: 'Password is required' })
});

export const todoSchema = z.object({
	title: z.string().min(1, 'Title is required').max(50, 'Title must be less than 50 characters'),
	description: z.string().optional()
});

export const createPostSchema = z.object({
	content: z
		.string()
		.min(1, 'Post content is required')
		.max(500, 'Post content must be less than 500 characters'),
	images: z.array(z.instanceof(File)).optional().default([])
});

export const forgotSchema = z.object({
	email: z.string().nonempty().email({ message: 'Invalid email address' })
});

export const changeSchema = z
	.object({
		oldPassword: strongPassword,
		newPassword: strongPassword,
		confirmNewPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Confirm password must match the new password',
		path: ['confirmNewPassword']
	});

export const resetSchema = z
	.object({
		token: z.string().min(1, 'Missing reset token'),
		newPassword: strongPassword,
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Confirm password must match the new password',
		path: ['confirmPassword']
	});

export const resendSchema = z.object({
	email: z.string().nonempty().email({ message: 'Invalid email address' })
});
