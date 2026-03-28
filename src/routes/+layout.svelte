<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import AnimatedThemeToggler from '$lib/components/magic/animated-theme-toggler/animated-theme-toggler.svelte';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="system" />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<main class="h-full w-full">
	{@render children()}
	<div class="absolute top-4 right-4 z-50 md:top-6 md:right-6">
		<AnimatedThemeToggler class="rounded-full" />
	</div>
</main>
