import {
	Text,
	View,
	TouchableOpacity,
	Alert,
	ScrollView,
	ActivityIndicator,
	Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useRouter } from 'expo-router';
import { api } from '@/api';
import { useAuth } from '@/context/auth';

type Profile = {
	_id: string;
	firstName: string;
	lastName: string;
	bio?: string;
	followersCount: number;
	followingCount: number;
	account: {
		_id: string;
		username: string;
		email: string;
		avatar?: { url: string };
	};
};

function Avatar({
	username,
	avatarUrl,
	size = 80
}: {
	username?: string;
	avatarUrl?: string;
	size?: number;
}) {
	if (avatarUrl) {
		return (
			<Image
				source={{ uri: avatarUrl }}
				style={{ width: size, height: size, borderRadius: size / 2 }}
				className="bg-gray-100"
			/>
		);
	}
	return (
		<View
			className="items-center justify-center bg-blue-100"
			style={{
				width: size,
				height: size,
				borderRadius: size / 2
			}}
		>
			<Text className="font-bold text-blue-600" style={{ fontSize: size * 0.4 }}>
				{username?.slice(0, 1).toUpperCase() || 'U'}
			</Text>
		</View>
	);
}

export default function ProfileScreen() {
	const { user, token, logout } = useAuth();
	const router = useRouter();

	const [profile, setProfile] = React.useState<Profile | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		fetchProfile();
	}, []);

	async function fetchProfile() {
		try {
			const res = await api.get('social-media/profile', token);
			const json = await res.json();
			if (res.ok) {
				setProfile(json.data ?? null);
			}
		} catch {
			// Profile might not exist yet
		} finally {
			setLoading(false);
		}
	}

	async function handleLogout() {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				style: 'destructive',
				onPress: async () => {
					await logout();
					router.replace('/');
				}
			}
		]);
	}

	if (loading) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
				<ActivityIndicator size="large" color="#3b82f6" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<ScrollView contentContainerClassName="px-4 pt-4 pb-8">
				<Text className="mb-4 text-xl font-bold text-gray-900">Profile</Text>

				<View className="mb-4 items-center rounded-2xl border border-gray-100 bg-white p-6">
					<Avatar username={user?.username} avatarUrl={profile?.account?.avatar?.url} size={88} />

					<Text className="mt-4 text-xl font-bold text-gray-900">
						{profile
							? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user?.username
							: user?.username}
					</Text>

					<Text className="mt-0.5 text-sm text-gray-500">@{user?.username}</Text>

					{profile?.bio && (
						<Text className="mt-3 px-4 text-center text-sm leading-5 text-gray-600">
							{profile.bio}
						</Text>
					)}

					<View className="mt-5 w-full flex-row justify-center gap-10 border-t border-gray-100 pt-5">
						<View className="items-center">
							<Text className="text-xl font-bold text-gray-900">
								{profile?.followersCount ?? 0}
							</Text>
							<Text className="mt-0.5 text-xs text-gray-400">Followers</Text>
						</View>
						<View className="items-center">
							<Text className="text-xl font-bold text-gray-900">
								{profile?.followingCount ?? 0}
							</Text>
							<Text className="mt-0.5 text-xs text-gray-400">Following</Text>
						</View>
					</View>
				</View>

				<View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
					<Text className="mb-3 text-sm font-semibold text-gray-900">Account</Text>

					<View className="flex-row justify-between border-b border-gray-50 py-3">
						<Text className="text-sm text-gray-500">Email</Text>
						<Text className="text-sm font-medium text-gray-900">{user?.email}</Text>
					</View>

					<View className="flex-row justify-between border-b border-gray-50 py-3">
						<Text className="text-sm text-gray-500">Email Verified</Text>
						<View className="flex-row items-center">
							<View
								className={`mr-1.5 h-2 w-2 rounded-full ${
									user?.isEmailVerified ? 'bg-green-500' : 'bg-orange-400'
								}`}
							/>
							<Text
								className={`text-sm font-medium ${
									user?.isEmailVerified ? 'text-green-600' : 'text-orange-500'
								}`}
							>
								{user?.isEmailVerified ? 'Verified' : 'Not verified'}
							</Text>
						</View>
					</View>

					<View className="flex-row justify-between py-3">
						<Text className="text-sm text-gray-500">Role</Text>
						<Text className="text-sm font-medium text-gray-900 capitalize">
							{user?.role?.toLowerCase()}
						</Text>
					</View>
				</View>

				<View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
					<Text className="mb-1 text-sm font-semibold text-gray-900">Quick Links</Text>

					<TouchableOpacity
						onPress={() => router.push('/bookmarks')}
						className="flex-row items-center justify-between border-b border-gray-50 py-3.5"
						activeOpacity={0.6}
					>
						<View className="flex-row items-center">
							<Text className="mr-2 text-base">★</Text>
							<Text className="text-sm text-gray-700">Bookmarks</Text>
						</View>
						<Text className="text-lg text-gray-400">›</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => router.push('/change-password')}
						className="flex-row items-center justify-between py-3.5"
						activeOpacity={0.6}
					>
						<View className="flex-row items-center">
							<Text className="mr-2 text-base">◉</Text>
							<Text className="text-sm text-gray-700">Change Password</Text>
						</View>
						<Text className="text-lg text-gray-400">›</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					onPress={handleLogout}
					className="items-center rounded-2xl border border-red-100 bg-red-50 py-3.5"
					activeOpacity={0.7}
				>
					<Text className="text-sm font-semibold text-red-600">Logout</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
