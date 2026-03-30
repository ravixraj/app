<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { MailCheck, RefreshCw } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	const { enhance, submitting } = superForm(data.resendForm);
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<div class="flex items-center gap-2">
			<MailCheck class="h-5 w-5 text-sidebar-primary" />
			<h2 class="font-mono text-sm tracking-widest uppercase">verify email</h2>
		</div>

		<Separator class="opacity-20" />

		<p class="font-mono text-xs leading-relaxed text-muted-foreground">
			a verification link has been sent to your email address. please check your inbox and click the
			link to activate your account.
		</p>

		{#if data.isEmailVerified}
			<p class="font-mono text-xs text-sidebar-primary">
				✓ your email is verified. you can now sign in.
			</p>
		{/if}

		<form method="post" use:enhance class="flex flex-col gap-3">
			<Button
				type="submit"
				variant="outline"
				disabled={$submitting}
				class="w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<RefreshCw class="h-4 w-4" />
				{$submitting ? 'sending...' : 'resend verification email'}
			</Button>
		</form>

		<div class="flex justify-end">
			<a
				href="/auth"
				class="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-sidebar-primary"
			>
				back to login
			</a>
		</div>
	</div>
</div>
