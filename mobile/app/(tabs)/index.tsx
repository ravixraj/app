import {
	Text,
	TextInput,
	View,
	FlatList,
	TouchableOpacity,
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

type Author = {
	_id: string;
	firstName: string;
	lastName: string;
	account: { username: string; avatar?: { url: string } };
};

type Comment = {
	_id: string;
	content: string;
	author: Author;
	createdAt: string;
};

type Post = {
	_id: string;
	content: string;
	images: { url: string }[];
	author: Author;
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
	size = 36
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

export default function FeedScreen() {
	const { token, user } = useAuth();
	const router = useRouter();

	const [posts, setPosts] = React.useState<Post[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(false);
	const [newPostContent, setNewPostContent] = React.useState('');
	const [posting, setPosting] = React.useState(false);

	const [openComments, setOpenComments] = React.useState<Record<string, boolean>>({});
	const [commentsMap, setCommentsMap] = React.useState<Record<string, Comment[]>>({});
	const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});

	React.useEffect(() => {
		fetchPosts();
	}, []);

	async function fetchPosts() {
		try {
			const res = await api.get('social-media/posts', token);
			const json = await res.json();
			if (res.ok) {
				setPosts(json.data?.posts ?? []);
			}
		} catch {
			Alert.alert('Error', 'Failed to load posts');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}

	async function createPost() {
		if (!newPostContent.trim()) return;
		setPosting(true);
		try {
			const res = await api.post('social-media/posts', { content: newPostContent }, token);
			if (res.ok) {
				setNewPostContent('');
				fetchPosts();
			} else {
				const json = await res.json();
				Alert.alert('Error', json.message || 'Failed to create post');
			}
		} catch {
			Alert.alert('Error', 'Failed to create post');
		} finally {
			setPosting(false);
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
		} catch {
			Alert.alert('Error', 'Failed to update like');
		}
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
		} catch {
			Alert.alert('Error', 'Failed to update bookmark');
		}
	}

	async function deletePost(id: string) {
		Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await api.del(`social-media/posts/${id}`, token);
						setPosts((prev) => prev.filter((p) => p._id !== id));
					} catch {
						Alert.alert('Error', 'Failed to delete post');
					}
				}
			}
		]);
	}

	async function toggleComments(postId: string) {
		const isOpen = openComments[postId];
		setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }));

		if (!isOpen && !commentsMap[postId]) {
			try {
				const res = await api.get(`social-media/comments/post/${postId}`, token);
				const json = await res.json();
				if (res.ok) {
					setCommentsMap((prev) => ({ ...prev, [postId]: json.data ?? [] }));
				}
			} catch {
				Alert.alert('Error', 'Failed to load comments');
			}
		}
	}

	async function addComment(postId: string) {
		const content = commentInput[postId]?.trim();
		if (!content) return;
		try {
			const res = await api.post(`social-media/comments/${postId}`, { content }, token);
			const json = await res.json();
			if (res.ok) {
				setCommentsMap((prev) => ({
					...prev,
					[postId]: [json.data, ...(prev[postId] ?? [])]
				}));
				setPosts((prev) =>
					prev.map((p) => (p._id === postId ? { ...p, comments: p.comments + 1 } : p))
				);
				setCommentInput((prev) => ({ ...prev, [postId]: '' }));
			}
		} catch {
			Alert.alert('Error', 'Failed to add comment');
		}
	}

	async function deleteComment(postId: string, commentId: string) {
		try {
			await api.del(`social-media/comments/${commentId}`, token);
			setCommentsMap((prev) => ({
				...prev,
				[postId]: prev[postId].filter((c) => c._id !== commentId)
			}));
			setPosts((prev) =>
				prev.map((p) => (p._id === postId ? { ...p, comments: p.comments - 1 } : p))
			);
		} catch {
			Alert.alert('Error', 'Failed to delete comment');
		}
	}

	function renderPost({ item: post }: { item: Post }) {
		const isOwner = post.author._id === user?._id;

		return (
			<View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4">
				<View className="mb-3 flex-row items-center justify-between">
					<Pressable
						onPress={() => router.push(`/user/${post.author.account?.username}`)}
						className="flex-1 flex-row items-center"
					>
						<Avatar
							username={post.author.account?.username}
							avatarUrl={post.author.account?.avatar?.url}
							size={36}
						/>
						<View className="ml-2.5 flex-1">
							<Text className="text-sm font-semibold text-gray-900">
								{post.author.firstName || post.author.account?.username}
							</Text>
							<Text className="text-xs text-gray-400">
								@{post.author.account?.username} · {timeAgo(post.createdAt)}
							</Text>
						</View>
					</Pressable>
					{isOwner && (
						<Pressable onPress={() => deletePost(post._id)} hitSlop={8} className="p-1">
							<Text className="text-xs font-medium text-red-400">Delete</Text>
						</Pressable>
					)}
				</View>

				<Text className="mb-3 text-sm leading-6 text-gray-800">{post.content}</Text>

				<View className="flex-row items-center border-t border-gray-100 pt-3">
					<Pressable onPress={() => toggleLike(post)} className="mr-5 flex-row items-center">
						<Text className={post.isLiked ? 'text-red-500' : 'text-gray-400'}>
							{post.isLiked ? '♥' : '♡'} <Text className="text-xs">{post.likes}</Text>
						</Text>
					</Pressable>

					<Pressable
						onPress={() => toggleComments(post._id)}
						className="mr-5 flex-row items-center"
					>
						<Text className="text-gray-400">
							✦ <Text className="text-xs">{post.comments}</Text>
						</Text>
					</Pressable>

					<Pressable onPress={() => toggleBookmark(post)} className="ml-auto">
						<Text className={`text-sm ${post.isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}>
							{post.isBookmarked ? '★' : '☆'}
						</Text>
					</Pressable>
				</View>

				{openComments[post._id] && (
					<View className="mt-3 border-t border-gray-100 pt-3">
						<View className="mb-3 flex-row gap-2">
							<TextInput
								className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm"
								placeholder="Write a comment..."
								placeholderTextColor="#9ca3af"
								value={commentInput[post._id] || ''}
								onChangeText={(text) =>
									setCommentInput((prev) => ({
										...prev,
										[post._id]: text
									}))
								}
								onSubmitEditing={() => addComment(post._id)}
							/>
							<TouchableOpacity
								onPress={() => addComment(post._id)}
								className="items-center justify-center rounded-xl bg-blue-500 px-4"
							>
								<Text className="text-sm font-semibold text-white">Send</Text>
							</TouchableOpacity>
						</View>

						{(commentsMap[post._id] ?? []).map((comment) => (
							<View key={comment._id} className="mb-2.5 flex-row items-start justify-between">
								<View className="flex-1 flex-row items-start">
									<Avatar username={comment.author.account?.username} size={24} />
									<View className="ml-2 flex-1">
										<Text className="text-xs font-semibold text-gray-700">
											@{comment.author.account?.username}
										</Text>
										<Text className="mt-0.5 text-xs leading-4 text-gray-600">
											{comment.content}
										</Text>
									</View>
								</View>
								{comment.author._id === user?._id && (
									<Pressable
										onPress={() => deleteComment(post._id, comment._id)}
										hitSlop={8}
										className="ml-2"
									>
										<Text className="text-xs text-red-400">✕</Text>
									</Pressable>
								)}
							</View>
						))}

						{(commentsMap[post._id] ?? []).length === 0 && (
							<Text className="py-2 text-center text-xs text-gray-400">
								No comments yet. Be the first!
							</Text>
						)}
					</View>
				)}
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="border-b border-gray-100 bg-white px-4 pt-4 pb-3">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="text-xl font-bold text-gray-900">Feed</Text>
					<Pressable onPress={() => router.push('/bookmarks')}>
						<Text className="text-sm font-semibold text-blue-500">★ Bookmarks</Text>
					</Pressable>
				</View>
				<View className="flex-row gap-2">
					<Avatar username={user?.username} avatarUrl={user?.avatar?.url} size={36} />
					<View className="flex-1">
						<TextInput
							className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm"
							placeholder="What's on your mind?"
							placeholderTextColor="#9ca3af"
							value={newPostContent}
							onChangeText={setNewPostContent}
							multiline
							numberOfLines={2}
							textAlignVertical="top"
						/>
						<TouchableOpacity
							onPress={createPost}
							disabled={posting || !newPostContent.trim()}
							className={`items-center rounded-xl py-2 ${
								posting || !newPostContent.trim() ? 'bg-blue-200' : 'bg-blue-500'
							}`}
						>
							{posting ? (
								<ActivityIndicator color="white" size="small" />
							) : (
								<Text className="text-sm font-semibold text-white">Post</Text>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#3b82f6" />
				</View>
			) : (
				<FlatList
					data={posts}
					keyExtractor={(item) => item._id}
					renderItem={renderPost}
					contentContainerClassName="px-4 pt-3 pb-4"
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => {
								setRefreshing(true);
								fetchPosts();
							}}
							tintColor="#3b82f6"
						/>
					}
					ListEmptyComponent={
						<View className="items-center py-16">
							<Text className="mb-3 text-4xl opacity-30">◉</Text>
							<Text className="text-base font-medium text-gray-400">No posts yet</Text>
							<Text className="mt-1 text-sm text-gray-400">Be the first to share something!</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
}
