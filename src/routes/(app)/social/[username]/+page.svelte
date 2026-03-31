<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';

	let { data } = $props();
</script>

<div class="flex min-h-screen flex-col items-center px-4 py-12">
	<div class="flex w-full max-w-xl flex-col gap-6">
		<!-- Cover -->
		<div class="relative h-40 w-full overflow-hidden">
			<Avatar class="h-full w-full object-cover">
				<!-- <AvatarImage src={data.profile.coverImage?.url} alt="cover" /> -->
				<AvatarFallback class="text-md">
					{`Welcome to ${data.profile.account.username}'s profile`}
				</AvatarFallback>
			</Avatar>
		</div>

		<!-- Profile Info -->
		<div class="flex items-start gap-4">
			<!-- Avatar -->
			<div class="shrink-0 overflow-hidden rounded-full border border-border">
				<Avatar class="h-16 w-16">
					<AvatarImage src={data.profile.account.avatar.url} alt={data.profile.account.username} />
					<AvatarFallback class="text-lg">
						{data.profile.account.username?.slice(0, 1).toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
			</div>

			<!-- Text Info -->
			<div class="flex flex-1 flex-col gap-1">
				<div class="flex items-center gap-2">
					<h2 class="font-mono text-sm tracking-widest">
						{data.profile.firstName}
						{data.profile.lastName}
					</h2>
				</div>

				<p class="font-mono text-xs text-muted-foreground">
					@{data.profile.account?.username}
				</p>

				<div class="flex gap-4 py-3">
					<span class="font-mono text-xs text-muted-foreground"
						>followers <span class="font-mono text-sm">{data.profile.followersCount}</span></span
					>
					<span class="font-mono text-xs text-muted-foreground"
						>following <span class="font-mono text-sm">{data.profile.followingCount}</span></span
					>
				</div>

				{#if data.profile.bio}
					<p class="font-mono text-xs leading-relaxed text-muted-foreground">
						{data.profile.bio}{'this is bio'}
					</p>
				{/if}
			</div>

			<!-- Follow / Edit -->
			<div>
				{#if data.currentUser.account.username === data.profile.account.username}
					<Button>Edit profile</Button>
				{:else}
					<Button>
						{data.profile.isFollowing ? 'following' : 'follow'}
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
