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
import { useAuth } from '@/context/auth';

const loginSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

type Field = 'email' | 'password';

export default function LoginScreen() {
	const router = useRouter();
	const { login } = useAuth();

	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [showPassword, setShowPassword] = React.useState(false);
	const [focused, setFocused] = React.useState<Field | null>(null);

	async function handleLogin() {
		try {
			loginSchema.parse({ email, password });
		} catch (err) {
			if (err instanceof z.ZodError) {
				Alert.alert('Validation Error', err.issues[0].message);
				return;
			}
		}

		setLoading(true);
		try {
			await login(email, password);
			router.replace('/(tabs)');
		} catch (e: any) {
			Alert.alert('Error', e.message || 'Login failed. Please try again.');
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
				<View className="mb-10 items-center">
					<Text className="text-3xl font-bold tracking-tight text-gray-900">Sign in</Text>
				</View>

				<View className="mb-1">
					<Text className="mb-1.5 ml-0.5 text-sm font-medium text-gray-700">Email</Text>
					<TextInput
						className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 text-base ${
							focused === 'email' ? 'border-blue-500' : 'border-gray-200'
						}`}
						placeholder="name@example.com"
						placeholderTextColor="#9ca3af"
						value={email}
						onChangeText={setEmail}
						onFocus={() => setFocused('email')}
						onBlur={() => setFocused(null)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
					/>
				</View>

				<View className="mt-4">
					<Text className="mb-1.5 ml-0.5 text-sm font-medium text-gray-700">Password</Text>
					<View className="relative">
						<TextInput
							className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 pr-14 text-base ${
								focused === 'password' ? 'border-blue-500' : 'border-gray-200'
							}`}
							placeholder="Enter your password"
							placeholderTextColor="#9ca3af"
							value={password}
							onChangeText={setPassword}
							onFocus={() => setFocused('password')}
							onBlur={() => setFocused(null)}
							secureTextEntry={!showPassword}
						/>
						<Pressable
							className="absolute top-3.5 right-3.5"
							onPress={() => setShowPassword((v) => !v)}
							hitSlop={8}
						>
							<Text className="text-sm font-medium text-blue-500">
								{showPassword ? 'Hide' : 'Show'}
							</Text>
						</Pressable>
					</View>
				</View>

				<View className="mt-2 flex-row justify-end">
					<Pressable onPress={() => router.push('/(auth)/forgot-password')}>
						<Text className="text-sm font-medium text-blue-500">Forgot password?</Text>
					</Pressable>
				</View>

				<TouchableOpacity
					className={`mt-6 w-full items-center rounded-xl py-3.5 ${
						loading ? 'bg-blue-300' : 'bg-blue-500'
					}`}
					onPress={handleLogin}
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
						<Text className="text-base font-semibold text-white">Sign in</Text>
					)}
				</TouchableOpacity>

				<View className="mt-8 flex-row justify-center">
					<Text className="text-sm text-gray-500">Don't have an account? </Text>
					<Pressable onPress={() => router.push('/(auth)/register')}>
						<Text className="text-sm font-semibold text-blue-500">Sign up</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
