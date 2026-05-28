import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/auth';
import '@/global.css';

export default function RootLayout() {
	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="bookmarks" options={{ presentation: 'modal' }} />
				<Stack.Screen name="user/[username]" options={{ presentation: 'card' }} />
				<Stack.Screen name="change-password" options={{ presentation: 'modal' }} />
			</Stack>
		</AuthProvider>
	);
}
