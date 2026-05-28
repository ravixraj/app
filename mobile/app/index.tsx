import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/auth';
import '@/global.css';

export default function Index() {
	const { token, loading } = useAuth();

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator size="large" color="#3b82f6" />
			</View>
		);
	}

	if (token) {
		return <Redirect href="/(tabs)" />;
	}

	return <Redirect href="/(auth)/login" />;
}
