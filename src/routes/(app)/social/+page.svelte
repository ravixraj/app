<script lang="ts">
	import {
		Heart,
		MessageCircle,
		Bookmark,
		Trash2,
		ImagePlus,
		Send,
		X,
		ChevronDown,
		ChevronUp
	} from '@lucide/svelte';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { api } from '#lib/api.js';
	import { invalidateAll } from '$app/navigation';
	import Avatar from '#lib/components/ui/avatar/avatar.svelte';
	import AvatarImage from '#lib/components/ui/avatar/avatar-image.svelte';
	import AvatarFallback from '#lib/components/ui/avatar/avatar-fallback.svelte';
	import { createPost } from './remote';
	import { onDestroy } from 'svelte';

	let { data } = $props();

	type Author = {
		_id: string;
		firstName: string;
		lastName: string;
		account: {
			username: string;
			avatar?: { url: string };
		};
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

	// ── Posts come straight from the server ─────────────
	let posts: Post[] = $derived(data.posts?.posts ?? []);

	let error = $state('');

	// image preview
	let imageFiles = $state<File[]>([]);
	let imagePreviews = $state<string[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);

	function clearPreviews() {
		for (const url of imagePreviews) URL.revokeObjectURL(url);
		imageFiles = [];
		imagePreviews = [];
	}

	onDestroy(clearPreviews);

	// Clear previews after a successful post (the form element resets itself)
	$effect(() => {
		if (createPost.result?.type === 'success' && imagePreviews.length > 0) clearPreviews();
	});

	// comments per post
	let openComments = $state<Record<string, boolean>>({});
	let commentsMap = $state<Record<string, Comment[]>>({});
	let commentInput = $state<Record<string, string>>({});
	let loadingComments = $state<Record<string, boolean>>({});
	let editingCommentByPost = $state<Record<string, string | null>>({});
	let editCommentInput = $state<Record<string, string>>({});

	// ── Image handling ────────────────────────────────────
	function onImageChange(e: Event) {
		const input = e.target as HTMLInputElement;
		clearPreviews();
		imageFiles = Array.from(input.files ?? []).slice(0, 4); // max 4
		imagePreviews = imageFiles.map((f) => URL.createObjectURL(f));
	}

	function removeImage(i: number) {
		URL.revokeObjectURL(imagePreviews[i]);
		imageFiles = imageFiles.filter((_, idx) => idx !== i);
		imagePreviews = imagePreviews.filter((_, idx) => idx !== i);
		// Sync the actual file input — otherwise the removed file is still submitted
		if (fileInput) {
			const dt = new DataTransfer();
			for (const f of imageFiles) dt.items.add(f);
			fileInput.files = dt.files;
			fileInput.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}

	// ── Like ──────────────────────────────────────────────
	async function toggleLike(post: Post) {
		try {
			const res = post.isLiked
				? await api.del(`social-media/like/post/${post._id}`, data.accessToken)
				: await api.post(`social-media/like/post/${post._id}`, {}, data.accessToken);
			if (!res.ok) {
				error = 'failed to update like.';
				return;
			}
			await invalidateAll();
		} catch {
			error = 'failed to update like.';
		}
	}

	// ── Bookmark ──────────────────────────────────────────
	async function toggleBookmark(post: Post) {
		try {
			const res = post.isBookmarked
				? await api.del(`social-media/bookmarks/${post._id}`, data.accessToken)
				: await api.post(`social-media/bookmarks/${post._id}`, {}, data.accessToken);
			if (!res.ok) {
				error = 'failed to update bookmark.';
				return;
			}
			await invalidateAll();
		} catch {
			error = 'failed to update bookmark.';
		}
	}

	// ── Delete post ───────────────────────────────────────
	async function deletePost(id: string) {
		try {
			const res = await api.del(`social-media/posts/${id}`, data.accessToken);
			if (!res.ok) {
				error = 'failed to delete post.';
				return;
			}
			await invalidateAll();
		} catch {
			error = 'failed to delete post.';
		}
	}

	// ── Comments ──────────────────────────────────────────
	async function toggleComments(postId: string) {
		openComments[postId] = !openComments[postId];
		if (openComments[postId] && !commentsMap[postId]) {
			loadingComments[postId] = true;
			try {
				const res = await api.get(`social-media/comments/post/${postId}`);
				const json = await res.json();
				if (!res.ok) {
					error = json?.message || 'failed to load comments.';
					return;
				}
				commentsMap[postId] = Array.isArray(json.data) ? json.data : (json.data?.comments ?? []);
			} catch {
				error = 'failed to load comments.';
			} finally {
				loadingComments[postId] = false;
			}
		}
	}

	async function addComment(postId: string) {
		const content = commentInput[postId]?.trim();
		if (!content) return;
		try {
			const res = await api.post(
				`social-media/comments/post/${postId}`,
				{ content },
				data.accessToken
			);
			const json = await res.json();
			if (!res.ok) {
				error = json?.message || 'failed to add comment.';
				return;
			}
			commentsMap[postId] = [json.data, ...(commentsMap[postId] ?? [])];
			commentInput[postId] = '';
			await invalidateAll();
		} catch {
			error = 'failed to add comment.';
		}
	}

	async function deleteComment(postId: string, commentId: string) {
		try {
			const res = await api.del(`social-media/comments/${commentId}`, data.accessToken);
			if (!res.ok) {
				const json = await res.json().catch(() => null);
				error = json?.message || 'failed to delete comment.';
				return;
			}
			commentsMap[postId] = commentsMap[postId].filter((c) => c._id !== commentId);
			if (editingCommentByPost[postId] === commentId) {
				editingCommentByPost[postId] = null;
				delete editCommentInput[commentId];
			}
			await invalidateAll();
		} catch {
			error = 'failed to delete comment.';
		}
	}

	function startEditComment(postId: string, comment: Comment) {
		editingCommentByPost[postId] = comment._id;
		editCommentInput[comment._id] = comment.content;
	}

	function cancelEditComment(postId: string, commentId: string) {
		editingCommentByPost[postId] = null;
		delete editCommentInput[commentId];
	}

	async function updateComment(postId: string, commentId: string) {
		const content = editCommentInput[commentId]?.trim();
		if (!content) return;
		try {
			const res = await api.patch(
				`social-media/comments/${commentId}`,
				{ content },
				data.accessToken
			);
			const json = await res.json();
			if (!res.ok) {
				error = json?.message || 'failed to update comment.';
				return;
			}

			commentsMap[postId] = commentsMap[postId].map((comment) =>
				comment._id === commentId ? { ...comment, content: json.data?.content ?? content } : comment
			);
			editingCommentByPost[postId] = null;
			delete editCommentInput[commentId];
		} catch {
			error = 'failed to update comment.';
		}
	}

	// ── Helpers ───────────────────────────────────────────
	function timeAgo(date: string) {
		const diff = Date.now() - new Date(date).getTime();
		const m = Math.floor(diff / 60000);
		if (m < 1) return 'just now';
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.floor(h / 24)}d ago`;
	}
</script>

<div class="flex min-h-screen flex-col items-center px-4 py-12">
	<div class="flex w-full max-w-xl flex-col gap-6">
		<!-- Create Post -->
		<form {...createPost} enctype="multipart/form-data" class="flex flex-col gap-2">
			<p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">new post</p>

			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={createPost.fields.content.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Textarea
						{...createPost.fields.content.as('text')}
						placeholder="what's on your mind..."
						rows={3}
					/>
				</InputGroup.Root>
				{#each createPost.fields.content.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<!-- Image previews -->
			{#if imagePreviews.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each imagePreviews as src, i}
						<div class="relative h-16 w-16">
							<img {src} alt="preview" class="h-full w-full rounded object-cover" />
							<button
								type="button"
								onclick={() => removeImage(i)}
								class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white"
							>
								<X class="h-2.5 w-2.5" />
							</button>
						</div>
					{/each}
				</div>
			{/if}

			{#if createPost.result}
				<p
					class="font-mono text-xs"
					class:text-sidebar-primary={createPost.result.type === 'success'}
					class:text-destructive={createPost.result.type === 'error'}
				>
					{createPost.result.text}
				</p>
			{/if}

			<div class="flex gap-2">
				<!-- Image upload trigger -->
				<label
					class="flex cursor-pointer items-center gap-1 rounded-md border border-border px-3 py-2 font-mono text-xs tracking-widest uppercase transition-colors hover:bg-accent"
				>
					<ImagePlus class="h-3.5 w-3.5" />
					images
					<input
						{...createPost.fields.images.as('file multiple')}
						accept="image/*"
						class="hidden"
						bind:this={fileInput}
						onchange={onImageChange}
					/>
				</label>

				<Button
					type="submit"
					variant="outline"
					disabled={createPost.pending > 0}
					class="flex-1 gap-2 font-mono text-xs tracking-widest uppercase"
				>
					<Send class="h-4 w-4" />
					{createPost.pending > 0 ? 'posting...' : 'post'}
				</Button>
			</div>
		</form>

		<Separator class="opacity-20" />

		<!-- Error -->
		{#if error}
			<p class="font-mono text-xs text-destructive">{error}</p>
		{/if}

		<!-- Posts list -->
		{#if posts.length === 0}
			<p class="py-4 text-center font-mono text-xs text-muted-foreground opacity-50">
				no posts yet. be the first!
			</p>
		{/if}

		{#each posts as post (post._id)}
			<div class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
				<!-- Post header -->
				<div class="flex items-center justify-between">
					<a
						href={`/social/profile/${post.author.account?.username}`}
						class="flex items-center gap-2 transition-opacity hover:opacity-80"
					>
						<Avatar class="h-7 w-7">
							<AvatarImage
								src={post.author.account?.avatar?.url}
								alt={post.author.account?.username}
							/>
							<AvatarFallback class="text-xs">
								{post.author.account?.username?.slice(0, 1).toUpperCase() || 'U'}
							</AvatarFallback>
						</Avatar>
						<span class="font-mono text-xs text-sidebar-primary">
							@{post.author.account?.username}
						</span>
					</a>
					<div class="flex items-center gap-2">
						<span class="font-mono text-xs text-muted-foreground opacity-60">
							{timeAgo(post.createdAt)}
						</span>
						{#if post.author._id === data.currentUserId}
							<Button
								variant="ghost"
								size="icon"
								onclick={() => deletePost(post._id)}
								class="h-6 w-6 text-destructive hover:text-destructive"
							>
								<Trash2 class="h-3 w-3" />
							</Button>
						{/if}
					</div>
				</div>

				<!-- Content -->
				<p class="font-mono text-xs leading-relaxed">{post.content}</p>

				<!-- Images -->
				{#if post.images?.length > 0}
					<div class="grid gap-1" class:grid-cols-2={post.images.length > 1}>
						{#each post.images as img}
							<img src={img.url} alt="post" class="max-h-64 w-full rounded object-cover" />
						{/each}
					</div>
				{/if}

				<Separator class="opacity-10" />

				<!-- Actions -->
				<div class="flex items-center gap-3">
					<!-- Like -->
					<button
						onclick={() => toggleLike(post)}
						class="flex items-center gap-1 font-mono text-xs transition-colors"
						class:text-destructive={post.isLiked}
						class:text-muted-foreground={!post.isLiked}
					>
						<Heart class="h-3.5 w-3.5" fill={post.isLiked ? 'currentColor' : 'none'} />
						{post.likes}
					</button>

					<!-- Comment toggle -->
					<button
						onclick={() => {
							toggleComments(post._id);
						}}
						class="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
					>
						<MessageCircle class="h-3.5 w-3.5" />
						{post.comments}
						{#if openComments[post._id]}
							<ChevronUp class="h-3 w-3" />
						{:else}
							<ChevronDown class="h-3 w-3" />
						{/if}
					</button>

					<!-- Bookmark -->
					<button
						onclick={() => toggleBookmark(post)}
						class="ml-auto flex items-center gap-1 font-mono text-xs transition-colors"
						class:text-sidebar-primary={post.isBookmarked}
						class:text-muted-foreground={!post.isBookmarked}
					>
						<Bookmark class="h-3.5 w-3.5" fill={post.isBookmarked ? 'currentColor' : 'none'} />
					</button>
				</div>

				<!-- Comments section -->
				{#if openComments[post._id]}
					<div class="flex flex-col gap-2 pt-1">
						<Separator class="opacity-10" />

						<!-- Add comment -->
						<div class="flex gap-2">
							<InputGroup.Root class="flex-1">
								<InputGroup.Input
									type="text"
									placeholder="add a comment..."
									bind:value={commentInput[post._id]}
									onkeydown={(e) => e.key === 'Enter' && addComment(post._id)}
								/>
							</InputGroup.Root>
							<Button
								variant="outline"
								size="icon"
								onclick={() => addComment(post._id)}
								class="h-9 w-9 shrink-0"
							>
								<Send class="h-3.5 w-3.5" />
							</Button>
						</div>

						<!-- Comments list -->
						{#if loadingComments[post._id]}
							<p class="animate-pulse font-mono text-xs text-muted-foreground">loading...</p>
						{/if}

						{#each commentsMap[post._id] ?? [] as comment (comment._id)}
							<div class="flex items-start justify-between gap-2">
								<div class="flex flex-col gap-0.5">
									<span class="font-mono text-xs text-sidebar-primary">
										@{comment.author.account?.username}
									</span>
									{#if editingCommentByPost[post._id] === comment._id}
										<div class="flex gap-2">
											<InputGroup.Root class="flex-1">
												<InputGroup.Input
													type="text"
													bind:value={editCommentInput[comment._id]}
													onkeydown={(e) =>
														e.key === 'Enter' && updateComment(post._id, comment._id)}
												/>
											</InputGroup.Root>
										</div>
									{:else}
										<p class="font-mono text-xs leading-relaxed text-muted-foreground">
											{comment.content}
										</p>
									{/if}
								</div>
								{#if comment.author._id === data.currentUserId}
									<div class="flex items-center gap-1">
										{#if editingCommentByPost[post._id] === comment._id}
											<Button
												variant="ghost"
												onclick={() => cancelEditComment(post._id, comment._id)}
												class="h-6 px-2 font-mono text-[10px] tracking-widest uppercase"
											>
												cancel
											</Button>
											<Button
												variant="ghost"
												onclick={() => updateComment(post._id, comment._id)}
												class="h-6 px-2 font-mono text-[10px] tracking-widest text-sidebar-primary uppercase"
											>
												save
											</Button>
										{:else}
											<Button
												variant="ghost"
												onclick={() => startEditComment(post._id, comment)}
												class="h-6 px-2 font-mono text-[10px] tracking-widest uppercase"
											>
												edit
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onclick={() => deleteComment(post._id, comment._id)}
												class="h-5 w-5 shrink-0 text-destructive hover:text-destructive"
											>
												<Trash2 class="h-3 w-3" />
											</Button>
										{/if}
									</div>
								{/if}
							</div>
						{/each}

						{#if (commentsMap[post._id] ?? []).length === 0 && !loadingComments[post._id]}
							<p class="font-mono text-xs text-muted-foreground opacity-50">no comments yet.</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
