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
import { useRouter } from 'expo-router';
import React from 'react';
import { z } from 'zod';
import { api } from '@/api';
import { useAuth } from '@/context/auth';

const strongPassword = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters' })
	.max(16, { message: 'Password must be at most 16 characters' })
	.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, {
		message: 'Password must contain uppercase, lowercase, number & special character'
	});

const changeSchema = z
	.object({
		oldPassword: strongPassword,
		newPassword: strongPassword,
		confirmNewPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword']
	});

type Field = 'old' | 'new' | 'confirm';

export default function ChangePasswordScreen() {
	const router = useRouter();
	const { token } = useAuth();

	const [oldPassword, setOldPassword] = React.useState('');
	const [newPassword, setNewPassword] = React.useState('');
	const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [focused, setFocused] = React.useState<Field | null>(null);

	async function handleSubmit() {
		try {
			changeSchema.parse({ oldPassword, newPassword, confirmNewPassword });
		} catch (err) {
			if (err instanceof z.ZodError) {
				Alert.alert('Validation Error', err.issues[0].message);
				return;
			}
		}

		setLoading(true);
		try {
			const res = await api.post(
				'users/change-password',
				{ oldPassword, newPassword, confirmNewPassword },
				token
			);
			const json = await res.json();

			if (res.ok) {
				Alert.alert('Success', 'Password updated successfully', [
					{ text: 'OK', onPress: () => router.back() }
				]);
			} else {
				Alert.alert('Error', json.message || 'Failed to update password.');
			}
		} catch {
			Alert.alert('Error', 'Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-gray-50"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View
				className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3.5"
				style={{ paddingTop: Platform.OS === 'ios' ? 50 : 12 }}
			>
				<Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
					<Text className="text-lg font-medium text-blue-500">‹</Text>
				</Pressable>
				<Text className="text-lg font-bold text-gray-900">Change Password</Text>
			</View>

			<ScrollView contentContainerClassName="px-6 py-6" keyboardShouldPersistTaps="handled">
				<View className="rounded-2xl border border-gray-100 bg-white p-5">
					<View className="mb-5">
						<Text className="mb-1.5 text-sm font-medium text-gray-700">Current Password</Text>
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base ${
								focused === 'old' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Enter current password"
							placeholderTextColor="#9ca3af"
							value={oldPassword}
							onChangeText={setOldPassword}
							onFocus={() => setFocused('old')}
							onBlur={() => setFocused(null)}
							secureTextEntry
						/>
					</View>

					<View className="mb-5">
						<Text className="mb-1.5 text-sm font-medium text-gray-700">New Password</Text>
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base ${
								focused === 'new' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Enter new password"
							placeholderTextColor="#9ca3af"
							value={newPassword}
							onChangeText={setNewPassword}
							onFocus={() => setFocused('new')}
							onBlur={() => setFocused(null)}
							secureTextEntry
						/>
					</View>

					<View className="mb-6">
						<Text className="mb-1.5 text-sm font-medium text-gray-700">Confirm New Password</Text>
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base ${
								focused === 'confirm' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Confirm new password"
							placeholderTextColor="#9ca3af"
							value={confirmNewPassword}
							onChangeText={setConfirmNewPassword}
							onFocus={() => setFocused('confirm')}
							onBlur={() => setFocused(null)}
							secureTextEntry
						/>
					</View>

					<TouchableOpacity
						className={`w-full items-center rounded-xl py-3.5 ${
							loading ? 'bg-blue-300' : 'bg-blue-500'
						}`}
						onPress={handleSubmit}
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
							<Text className="text-base font-semibold text-white">Update Password</Text>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
