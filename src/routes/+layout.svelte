<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import AnimatedThemeToggler from '$lib/components/magic/animated-theme-toggler/animated-theme-toggler.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createBaseMetaTags } from '$lib/const.js';

	let { children } = $props();

	const baseMetaTags = createBaseMetaTags();
</script>

<ModeWatcher defaultMode="system" />
<MetaTags {...baseMetaTags} />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<main class="h-full w-full antialiased">
	{@render children()}
	<div class="absolute top-2 right-2 z-50 md:top-2 md:right-2">
		<AnimatedThemeToggler class="rounded-full" />
	</div>
</main>
