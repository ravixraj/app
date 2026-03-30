<script lang="ts">
	const { children } = $props();
</script>

<div class="h-screen overflow-y-auto bg-background text-foreground">
	{@render children()}
</div>
