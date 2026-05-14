<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Shield, Users, SquareCheck, Code, Server, ArrowRight } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '$lib/const.js';

	const metaTags = createPageMetaTags({
		title: 'Home',
		description:
			'FreeAPI Client - A full-featured application with authentication, todo management, social media, built on SvelteKit and FreeAPI.',
		canonical: '/'
	});

	const features = [
		{
			href: '/auth',
			icon: Shield,
			label: 'authentication',
			sub: 'JWT · OAuth · Sessions',
			color: 'text-emerald-400',
			bg: 'bg-emerald-500/10',
			border: 'hover:border-emerald-500/40'
		},
		{
			href: '/todo',
			icon: SquareCheck,
			label: 'todo app',
			sub: 'CRUD · Filters · Search',
			color: 'text-violet-400',
			bg: 'bg-violet-500/10',
			border: 'hover:border-violet-500/40'
		},
		{
			href: '/social',
			icon: Users,
			label: 'social media',
			sub: 'Posts · Likes · Follows',
			color: 'text-sky-400',
			bg: 'bg-sky-500/10',
			border: 'hover:border-sky-500/40'
		}
	];
</script>

<!-- ── Navbar ──────────────────────────────────────────── -->
<nav class="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
	<div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
		<div class="flex items-center gap-2">
			<span class="font-mono text-sm tracking-widest uppercase">freeapi</span>
			<span class="hidden font-mono text-xs text-muted-foreground opacity-40 sm:block">
				· apihub client
			</span>
		</div>

		<div class="flex items-center gap-2">
			<Button
				href="https://github.com/hiteshchoudhary/apihub"
				variant="outline"
				class="gap-1.5 font-mono text-xs tracking-widest uppercase"
			>
				<Server class="h-3.5 w-3.5" />
				api
			</Button>
			<Button
				href="https://github.com/ravirajbhardwaj/app"
				variant="outline"
				class="gap-1.5 font-mono text-xs tracking-widest uppercase"
			>
				<Code class="h-3.5 w-3.5" />
				client
			</Button>
			<Button href="/auth" class="gap-1.5 font-mono text-xs tracking-widest uppercase">
				get started
				<ArrowRight class="h-3.5 w-3.5" />
			</Button>
		</div>
	</div>
</nav>

<!-- ── Page ───────────────────────────────────────────── -->
<div class="relative mx-auto max-w-5xl px-6 py-20">
	<!-- Background grid -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	<!-- Glow -->
	<div
		class="pointer-events-none absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
		style="background: oklch(0.666 0.179 58.318 / 0.07);"
	></div>

	<!-- ── Hero ──────────────────────────────────────────── -->
	<div class="relative mb-14 text-center">
		<div class="mb-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
			<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-sidebar-primary"></span>
			<span class="font-mono text-xs tracking-widest text-muted-foreground uppercase">
				built on apihub · open source
			</span>
		</div>

		<h1 class="mb-3 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
			build real apps.<br />
			<span class="text-sidebar-primary">master api integration.</span>
		</h1>

		<div class="relative mb-14">
			<p class="mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase">
				what's inside
			</p>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each features as f}
					<a
						href={f.href}
						class="group flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200 {f.border} hover:bg-accent"
					>
						<div class="flex h-9 w-9 items-center justify-center rounded-md {f.bg}">
							<f.icon class="{f.color} h-4 w-4" />
						</div>
						<div class="flex flex-col gap-0.5">
							<span class="font-mono text-xs tracking-widest uppercase {f.color}">
								{f.label}
							</span>
							<span class="font-mono text-xs text-muted-foreground opacity-60">
								{f.sub}
							</span>
						</div>
						<ArrowRight
							class="mt-auto h-3.5 w-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-60"
						/>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

<MetaTags {...metaTags} />
