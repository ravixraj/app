<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { AlertTriangle, Home, RotateCcw } from '@lucide/svelte';
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<!-- Header -->
		<div class="flex items-center gap-2">
			<AlertTriangle class="h-5 w-5 text-destructive" />
			<h2 class="font-mono text-sm tracking-widest uppercase">something went wrong</h2>
		</div>

		<Separator class="opacity-20" />

		<!-- Error Code + Message -->
		<div class="flex flex-col gap-2">
			<p class="font-mono text-4xl font-bold tracking-widest text-sidebar-primary">
				{$page.status}
			</p>
			<p class="font-mono text-xs text-muted-foreground">
				{$page.error?.message ?? 'An unexpected error occurred.'}
			</p>
		</div>

		<Separator class="opacity-10" />

		<!-- Actions -->
		<div class="flex flex-col gap-2">
			<Button
				href="/"
				variant="outline"
				class="w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<Home class="h-4 w-4" />
				go home
			</Button>

			<Button
				onclick={() => history.back()}
				variant="ghost"
				class="w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<RotateCcw class="h-4 w-4" />
				go back
			</Button>
		</div>
	</div>
</div>
