import {
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Pressable,
	ActivityIndicator,
	Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { api } from '@/api';
import { useAuth } from '@/context/auth';

type Profile = {
	_id: string;
	firstName: string;
	lastName: string;
	bio?: string;
	followersCount: number;
	followingCount: number;
	isFollowing: boolean;
	account: {
		_id: string;
		username: string;
		email: string;
		avatar?: { url: string };
	};
};

type Post = {
	_id: string;
	content: string;
	images: { url: string }[];
	author: {
		_id: string;
		firstName: string;
		lastName: string;
		account: { username: string; avatar?: { url: string } };
	};
	likes: number;
	isLiked: boolean;
	isBookmarked: boolean;
	comments: number;
	createdAt: string;
};

function timeAgo(date: string) {
	const diff = Date.now() - new Date(date).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d}d`;
	return `${Math.floor(d / 7)}w`;
}

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

export default function UserProfileScreen() {
	const { username } = useLocalSearchParams<{ username: string }>();
	const { token, user } = useAuth();
	const router = useRouter();

	const [profile, setProfile] = React.useState<Profile | null>(null);
	const [posts, setPosts] = React.useState<Post[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(false);
	const [followLoading, setFollowLoading] = React.useState(false);

	const isOwnProfile = user?.username === username;

	React.useEffect(() => {
		fetchProfile();
	}, [username]);

	async function fetchProfile() {
		try {
			const profileRes = isOwnProfile
				? await api.get('social-media/profile', token)
				: await api.get(`social-media/profile/u/${username}`, token);
			const profileJson = await profileRes.json();
			if (profileRes.ok) {
				setProfile(profileJson.data ?? null);
			}

			const postsRes = await api.get(`social-media/posts/get/u/${username}`, token);
			const postsJson = await postsRes.json();
			if (postsRes.ok) {
				setPosts(postsJson.data?.posts ?? []);
			}
		} catch {
			//
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}

	async function toggleFollow() {
		if (!profile) return;
		setFollowLoading(true);
		try {
			if (profile.isFollowing) {
				await api.del(`social-media/follow/${profile.account._id}`, token);
			} else {
				await api.post(`social-media/follow/${profile.account._id}`, {}, token);
			}
			setProfile((prev) =>
				prev
					? {
							...prev,
							isFollowing: !prev.isFollowing,
							followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
						}
					: prev
			);
		} catch {
			Alert.alert('Error', 'Failed to update follow status');
		} finally {
			setFollowLoading(false);
		}
	}

	async function toggleLike(post: Post) {
		try {
			if (post.isLiked) {
				await api.del(`social-media/like/post/${post._id}`, token);
			} else {
				await api.post(`social-media/like/post/${post._id}`, {}, token);
			}
			setPosts((prev) =>
				prev.map((p) =>
					p._id === post._id
						? {
								...p,
								isLiked: !p.isLiked,
								likes: p.isLiked ? p.likes - 1 : p.likes + 1
							}
						: p
				)
			);
		} catch {}
	}

	async function toggleBookmark(post: Post) {
		try {
			if (post.isBookmarked) {
				await api.del(`social-media/bookmarks/${post._id}`, token);
			} else {
				await api.post(`social-media/bookmarks/${post._id}`, {}, token);
			}
			setPosts((prev) =>
				prev.map((p) => (p._id === post._id ? { ...p, isBookmarked: !p.isBookmarked } : p))
			);
		} catch {}
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
			<FlatList
				data={posts}
				keyExtractor={(item) => item._id}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							setRefreshing(true);
							fetchProfile();
						}}
						tintColor="#3b82f6"
					/>
				}
				ListHeaderComponent={
					<View>
						<Pressable onPress={() => router.back()} className="px-4 py-3">
							<Text className="text-lg font-medium text-blue-500">‹ Back</Text>
						</Pressable>

						<View className="mx-4 mb-4 items-center rounded-2xl border border-gray-100 bg-white p-6">
							<Avatar username={username} avatarUrl={profile?.account?.avatar?.url} size={88} />

							<Text className="mt-4 text-xl font-bold text-gray-900">
								{profile
									? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || username
									: username}
							</Text>

							<Text className="mt-0.5 text-sm text-gray-500">@{username}</Text>

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

							{!isOwnProfile && profile && (
								<TouchableOpacity
									onPress={toggleFollow}
									disabled={followLoading}
									className={`mt-4 w-full items-center rounded-xl py-2.5 ${
										profile.isFollowing ? 'bg-gray-200' : 'bg-blue-500'
									}`}
									activeOpacity={0.8}
								>
									{followLoading ? (
										<ActivityIndicator
											size="small"
											color={profile.isFollowing ? '#374151' : 'white'}
										/>
									) : (
										<Text
											className={`text-sm font-semibold ${
												profile.isFollowing ? 'text-gray-700' : 'text-white'
											}`}
										>
											{profile.isFollowing ? 'Following' : 'Follow'}
										</Text>
									)}
								</TouchableOpacity>
							)}
						</View>

						<Text className="mb-3 px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
							Posts
						</Text>
					</View>
				}
				renderItem={({ item: post }) => (
					<View className="mx-4 mb-2 rounded-2xl border border-gray-100 bg-white p-4">
						<Text className="mb-3 text-sm leading-6 text-gray-800">{post.content}</Text>
						<View className="flex-row items-center border-t border-gray-100 pt-3">
							<Pressable onPress={() => toggleLike(post)} className="mr-4 flex-row items-center">
								<Text className={post.isLiked ? 'text-red-500' : 'text-gray-400'}>
									{post.isLiked ? '♥' : '♡'} <Text className="text-xs">{post.likes}</Text>
								</Text>
							</Pressable>
							<Text className="text-gray-400">
								✦ <Text className="text-xs">{post.comments}</Text>
							</Text>
							<Pressable onPress={() => toggleBookmark(post)} className="ml-auto">
								<Text className={post.isBookmarked ? 'text-blue-500' : 'text-gray-400'}>
									{post.isBookmarked ? '★' : '☆'}
								</Text>
							</Pressable>
						</View>
						<Text className="mt-2 text-xs text-gray-400">{timeAgo(post.createdAt)}</Text>
					</View>
				)}
				ListEmptyComponent={
					<View className="items-center py-10">
						<Text className="mb-3 text-4xl opacity-30">◉</Text>
						<Text className="text-base font-medium text-gray-400">No posts yet</Text>
					</View>
				}
				contentContainerClassName="pb-4"
			/>
		</SafeAreaView>
	);
}
