import {
	Text,
	View,
	FlatList,
	Alert,
	RefreshControl,
	Pressable,
	Image,
	ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import React from 'react';
import { api } from '@/api';
import { useAuth } from '@/context/auth';

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
	size = 28
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

export default function BookmarksScreen() {
	const { token } = useAuth();
	const router = useRouter();

	const [posts, setPosts] = React.useState<Post[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(false);

	React.useEffect(() => {
		fetchBookmarks();
	}, []);

	async function fetchBookmarks() {
		try {
			const res = await api.get('social-media/bookmarks', token);
			const json = await res.json();
			if (res.ok) {
				const data = json.data;
				setPosts(data?.posts ?? data ?? []);
			}
		} catch {
			Alert.alert('Error', 'Failed to load bookmarks');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}

	async function removeBookmark(postId: string) {
		try {
			await api.del(`social-media/bookmarks/${postId}`, token);
			setPosts((prev) => prev.filter((p) => p._id !== postId));
		} catch {
			Alert.alert('Error', 'Failed to remove bookmark');
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

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3.5">
				<Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
					<Text className="text-lg font-medium text-blue-500">‹</Text>
				</Pressable>
				<Text className="text-lg font-bold text-gray-900">Bookmarks</Text>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#3b82f6" />
				</View>
			) : (
				<FlatList
					data={posts}
					keyExtractor={(item) => item._id}
					contentContainerClassName="px-4 pt-3 pb-4"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								setRefreshing(true);
								fetchBookmarks();
							}}
							tintColor="#3b82f6"
						/>
					}
					renderItem={({ item: post }) => (
						<View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
							<Pressable
								onPress={() => router.push(`/user/${post.author.account?.username}`)}
								className="mb-3 flex-row items-center gap-2"
							>
								<Avatar
									username={post.author.account?.username}
									avatarUrl={post.author.account?.avatar?.url}
									size={28}
								/>
								<View className="flex-1">
									<Text className="text-sm font-semibold text-gray-900">
										{post.author.firstName || post.author.account?.username}
									</Text>
									<Text className="text-xs text-gray-400">
										@{post.author.account?.username} · {timeAgo(post.createdAt)}
									</Text>
								</View>
							</Pressable>

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

								<Pressable
									onPress={() => removeBookmark(post._id)}
									className="ml-auto rounded-lg bg-red-50 px-3 py-1.5"
								>
									<Text className="text-xs font-medium text-red-500">Remove</Text>
								</Pressable>
							</View>
						</View>
					)}
					ListEmptyComponent={
						<View className="items-center py-16">
							<Text className="mb-3 text-4xl opacity-30">★</Text>
							<Text className="text-base font-medium text-gray-400">No bookmarks yet</Text>
							<Text className="mt-1 text-sm text-gray-400">
								Save posts you love by tapping the star icon
							</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}
