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

const forgotSchema = z.object({
	email: z.email({ message: 'Invalid email address' })
});

export default function ForgotPasswordScreen() {
	const router = useRouter();

	const [email, setEmail] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [focused, setFocused] = React.useState(false);

	async function handleSubmit() {
		try {
			forgotSchema.parse({ email });
		} catch (err) {
			if (err instanceof z.ZodError) {
				Alert.alert('Validation Error', err.issues[0].message);
				return;
			}
		}

		setLoading(true);
		try {
			const res = await api.post('users/forgot-password', { email });
			const json = await res.json();

			if (res.ok) {
				Alert.alert('Email sent', 'Password reset link sent. Check your inbox.', [
					{ text: 'OK', onPress: () => router.back() }
				]);
			} else {
				Alert.alert('Error', json.message || 'Failed to send reset link. Please try again.');
			}
		} catch {
			Alert.alert('Error', 'Network error. Please try again.');
		} finally {
			setLoading(false);
		}
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
					<Text className="text-3xl font-bold tracking-tight text-gray-900">Forgot password?</Text>
					<Text className="mt-1.5 text-center text-base text-gray-500">
						Enter your email and we'll send you a link to reset your password.
					</Text>
				</View>

				<View className="mb-1">
					<Text className="mb-1.5 ml-0.5 text-sm font-medium text-gray-700">Email</Text>
					<TextInput
						className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base ${
							focused ? 'border-blue-500' : 'border-gray-200'
						}`}
						placeholder="name@example.com"
						placeholderTextColor="#9ca3af"
						value={email}
						onChangeText={setEmail}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				<TouchableOpacity
					className={`mt-6 w-full items-center rounded-xl py-3.5 ${
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
						<Text className="text-base font-semibold text-white">Send reset link</Text>
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
