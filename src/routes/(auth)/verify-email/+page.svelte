<script lang="ts">
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { MailCheck, RefreshCw, MailIcon } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '#lib/const.js';
	import { resendVerification } from './remote';

	let { data } = $props();

	const metaTags = createPageMetaTags({
		title: 'Verify Email',
		description: 'Verify your email address to activate your FreeAPI account.',
		canonical: '/verify-email'
	});
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

		{#if resendVerification.result}
			{#if resendVerification.result.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">✓ {resendVerification.result.text}</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {resendVerification.result.text}</p>
			{/if}
		{/if}

		<form {...resendVerification} class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={resendVerification.fields.email.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input {...resendVerification.fields.email.as('email')} placeholder="email" />
					<InputGroup.Addon><MailIcon class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each resendVerification.fields.email.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>
			<Button
				type="submit"
				variant="outline"
				disabled={resendVerification.pending > 0}
				class="w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<RefreshCw class="h-4 w-4" />
				{resendVerification.pending > 0 ? 'sending...' : 'resend verification email'}
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

<MetaTags {...metaTags} />
