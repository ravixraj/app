<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Shield,
		Users,
		ShoppingCart,
		SquareCheck,
		MessageSquare,
		Code,
		Server
	} from '@lucide/svelte';
</script>

<nav class="border-b bg-background/80 backdrop-blur">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<div class="text-lg font-semibold">FreeAPI</div>

		<div class="flex gap-3">
			<Button href="/auth">Try Now</Button>
			<Button href="https://github.com/hiteshchoudhary/apihub" variant="outline">
				<Server /><span>API</span>
			</Button>
			<Button href="https://github.com/ravirajbhardwaj/app" variant="outline">
				<Code /><span>CLIENT</span>
			</Button>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="px-6 py-8">
	<div
		class="glass-card group flex cursor-default flex-wrap items-center justify-center gap-4 rounded-xl p-5"
	>
		<a href="/auth" class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
				<Shield />
			</div>
			<div class="min-w-0">
				<h4 class="font-display text-sm font-semibold">Authentication</h4>
				<span class="text-xs text-slate-500">JWT, OAuth, Sessions</span>
			</div>
		</a>

		<a href="/todo" class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
				<SquareCheck />
			</div>
			<div class="min-w-0">
				<h4 class="font-display text-sm font-semibold">Todo App</h4>
				<span class="text-xs text-slate-500">CRUD Operations</span>
			</div>
		</a>

		<a href="/social" class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/20">
				<Users />
			</div>
			<div class="min-w-0">
				<h4 class="font-display text-sm font-semibold">Social Media</h4>
				<span class="text-xs text-slate-500">Posts, Likes, Follows</span>
			</div>
		</a>

		<a href="/shop" class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
				<ShoppingCart />
			</div>
			<div class="min-w-0">
				<h4 class="font-display text-sm font-semibold">E-Commerce</h4>
				<span class="text-xs text-slate-500">Products, Cart, Orders</span>
			</div>
		</a>

		<a href="/chat" class="flex items-center gap-3">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20">
				<MessageSquare />
			</div>
			<div class="min-w-0">
				<h4 class="font-display text-sm font-semibold">Chat App</h4>
				<span class="text-xs text-slate-500">Real-time, WebSocket</span>
			</div>
		</a>
	</div>
</section>

<!-- Video Showcase Section -->
<section class="pb- px-6">
	<div class="mx-auto max-w-5xl">
		<div class="overflow-hidden rounded-2xl border bg-card shadow-lg">
			<!-- <video class="h-full w-full" controls autoplay muted loop playsinline>
				<source src="/videos/demo.mp4" type="video/mp4" />
			</video> -->
		</div>
	</div>
</section>
