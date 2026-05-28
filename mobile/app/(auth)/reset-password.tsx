import {
	Text,
	TextInput,
	View,
	Alert,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Pressable,
	ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { z } from 'zod';
import { api } from '@/api';

const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters' })
	.max(16, { message: 'Password must be at most 16 characters' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message: 'Password must contain uppercase, lowercase, number & special character'
	});

const resetSchema = z
	.object({
		newPassword: strongPassword,
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

type Field = 'newPassword' | 'confirmPassword';

export default function ResetPasswordScreen() {
	const router = useRouter();
	const { token } = useLocalSearchParams<{ token?: string }>();

	const [newPassword, setNewPassword] = React.useState('');
	const [confirmPassword, setConfirmPassword] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [showNewPassword, setShowNewPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [focused, setFocused] = React.useState<Field | null>(null);
	const [success, setSuccess] = React.useState(false);

	async function handleReset() {
		if (!token) {
			Alert.alert('Invalid Link', 'Missing reset token. Please request a new password reset link.');
			return;
		}

		try {
			resetSchema.parse({ newPassword, confirmPassword });
		} catch (err) {
			if (err instanceof z.ZodError) {
				Alert.alert('Validation Error', err.issues[0].message);
				return;
			}
		}

		setLoading(true);
		try {
			const res = await api.post(`users/reset-password/${token}`, {
				newPassword,
				confirmPassword
			});
			const json = await res.json();

			if (res.ok) {
				setSuccess(true);
			} else if (res.status === 400) {
				Alert.alert(
					'Invalid or expired link',
					json.message || 'This reset link is invalid or has expired. Please request a new one.'
				);
			} else {
				Alert.alert('Error', json.message || 'Password reset failed. Please try again.');
			}
		} catch {
			Alert.alert('Network Error', 'Please check your connection and try again.');
		} finally {
			setLoading(false);
		}
	}

	if (!token) {
		return (
			<KeyboardAvoidingView
				className="flex-1 bg-white"
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center px-6 py-12"
					keyboardShouldPersistTaps="handled"
				>
					<View className="mb-8 items-center">
						<View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
							<Text className="text-3xl font-bold text-red-500">!</Text>
						</View>
						<Text className="text-center text-2xl font-bold tracking-tight text-gray-900">
							Invalid reset link
						</Text>
						<Text className="mt-2 text-center text-base leading-relaxed text-gray-500">
							Missing reset token. Please request a new password reset link.
						</Text>
					</View>
					<TouchableOpacity
						className="w-full items-center rounded-xl bg-blue-500 py-3.5"
						onPress={() => router.push('/(auth)/forgot-password')}
						activeOpacity={0.85}
					>
						<Text className="text-base font-semibold text-white">Request new link</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}

	if (success) {
		return (
			<KeyboardAvoidingView
				className="flex-1 bg-white"
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center px-6 py-12"
					keyboardShouldPersistTaps="handled"
				>
					<View className="mb-8 items-center">
						<View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
							<Text className="text-3xl font-bold text-emerald-500">✓</Text>
						</View>
						<Text className="text-center text-2xl font-bold tracking-tight text-gray-900">
							Password changed
						</Text>
						<Text className="mt-2 text-center text-base leading-relaxed text-gray-500">
							Your password has been reset successfully. You can now sign in with your new password.
						</Text>
					</View>
					<TouchableOpacity
						className="w-full items-center rounded-xl bg-blue-500 py-3.5"
						onPress={() => router.replace('/(auth)/login')}
						activeOpacity={0.85}
					>
						<Text className="text-base font-semibold text-white">Sign in</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-white"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerClassName="flex-grow justify-center px-6 py-12"
				keyboardShouldPersistTaps="handled"
			>
				<View className="mb-8 items-center">
					<View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
						<Text className="text-3xl font-bold text-blue-500">⌂</Text>
					</View>
					<Text className="text-3xl font-bold tracking-tight text-gray-900">Reset password</Text>
					<Text className="mt-1.5 text-center text-base text-gray-500">
						Enter your new password below.
					</Text>
				</View>

				<View className="mb-1">
					<Text className="mb-1.5 ml-0.5 text-sm font-medium text-gray-700">New password</Text>
					<View className="relative">
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 pr-14 text-base ${
								focused === 'newPassword' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Create a strong password"
							placeholderTextColor="#9ca3af"
							value={newPassword}
							onChangeText={setNewPassword}
							onFocus={() => setFocused('newPassword')}
							onBlur={() => setFocused(null)}
							secureTextEntry={!showNewPassword}
						/>
						<Pressable
							className="absolute top-3.5 right-3.5"
							onPress={() => setShowNewPassword((v) => !v)}
							hitSlop={8}
						>
							<Text className="text-sm font-medium text-blue-500">
								{showNewPassword ? 'Hide' : 'Show'}
							</Text>
						</Pressable>
					</View>
				</View>

				<View className="mt-4">
					<Text className="mb-1.5 ml-0.5 text-sm font-medium text-gray-700">Confirm password</Text>
					<View className="relative">
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 pr-14 text-base ${
								focused === 'confirmPassword' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Re-enter your new password"
							placeholderTextColor="#9ca3af"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							onFocus={() => setFocused('confirmPassword')}
							onBlur={() => setFocused(null)}
							secureTextEntry={!showConfirmPassword}
						/>
						<Pressable
							className="absolute top-3.5 right-3.5"
							onPress={() => setShowConfirmPassword((v) => !v)}
							hitSlop={8}
						>
							<Text className="text-sm font-medium text-blue-500">
								{showConfirmPassword ? 'Hide' : 'Show'}
							</Text>
						</Pressable>
					</View>
				</View>

				<Text className="mt-3 ml-0.5 text-xs leading-relaxed text-gray-400">
					Min 6 chars · Uppercase · Lowercase · Number · Special character
				</Text>

				<TouchableOpacity
					className={`mt-6 w-full items-center rounded-xl py-3.5 ${
						loading ? 'bg-blue-300' : 'bg-blue-500'
					}`}
					onPress={handleReset}
					disabled={loading}
					activeOpacity={0.85}
					style={
						!loading
							? {
									shadowColor: '#3b82f6',
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 0.3,
									shadowRadius: 8,
									elevation: 4
								}
							: {}
					}
				>
					{loading ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text className="text-base font-semibold text-white">Reset password</Text>
					)}
				</TouchableOpacity>

				<View className="mt-8 flex-row justify-center">
					<Pressable onPress={() => router.back()}>
						<Text className="text-sm font-semibold text-blue-500">← Back to login</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
