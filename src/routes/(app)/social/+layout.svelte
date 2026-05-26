<script lang="ts">
	import { Rss, Bookmark, UserCircle, LogOut, UserPlus, Users } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/stores';
	import { api, BASE } from '$lib/api.js';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';

	let { data, children } = $props();

	// ── Nav links ─────────────────────────────────────────
	const navLinks = [
		{ href: '/social/bookmarks', icon: Bookmark, label: 'bookmarks' },
		{ href: `/social/${data.currentUser?.account?.username}`, icon: UserCircle, label: 'profile' }
	];

	// ── Active link helper ────────────────────────────────
	function isActive(href: string) {
		return $page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen">
	<!-- ── Left Sidebar ───────────────────────────────────── -->
	<aside
		class="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-6 border-r border-border px-4 py-8 md:flex"
	>
		<!-- Brand -->
		<a href="/social" class="flex items-center gap-2 px-2">
			<Rss class="h-4 w-4 text-sidebar-primary" />
			<span class="font-mono text-sm tracking-widest uppercase">social</span>
		</a>

		<Separator class="opacity-20" />

		<!-- Nav -->
		<nav class="flex flex-col gap-1">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs tracking-widest uppercase transition-colors"
					class:text-sidebar-primary={isActive(link.href)}
					class:bg-accent={isActive(link.href)}
					class:text-muted-foreground={!isActive(link.href)}
					class:hover:text-foreground={!isActive(link.href)}
					class:hover:bg-accent={!isActive(link.href)}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<Separator class="opacity-20" />

		<!-- Current user -->
		{#if data.currentUser}
			<div class="mt-auto flex items-center gap-3 px-2">
				<Avatar class="h-7 w-7">
					<AvatarImage
						src={data.currentUser.account?.avatar?.url}
						alt={data.currentUser.account?.username}
					/>
					<AvatarFallback class="text-xs">
						{data.currentUser.account?.username?.slice(0, 1).toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>

				<div class="flex min-w-0 flex-col">
					<span class="truncate font-mono text-xs text-sidebar-primary">
						@{data.currentUser.account?.username}
					</span>

					<span class="truncate font-mono text-xs text-muted-foreground opacity-60">
						{data.currentUser.account?.email}
					</span>
				</div>
			</div>
			<Button
				variant="outline"
				onclick={async () => {
					try {
						await api.post('users/logout', {});
					} catch {
					} finally {
						window.location.href = '/auth';
					}
				}}
				class="gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<LogOut class="h-4 w-4" />
				logout
			</Button>
		{/if}
	</aside>

	<!-- ── Main content (slot) ────────────────────────────── -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
