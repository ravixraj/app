<script lang="ts">
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { MailIcon, KeyRound } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '#lib/const.js';
	import { forgotPassword } from './remote';

	const metaTags = createPageMetaTags({
		title: 'Forgot Password',
		description: 'Reset your FreeAPI account password. Enter your email to receive a reset link.',
		canonical: '/forgot-password'
	});
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<div class="flex items-center gap-2">
			<KeyRound class="h-5 w-5 text-sidebar-primary" />
			<h2 class="font-mono text-sm tracking-widest uppercase">forgot password</h2>
		</div>

		<Separator class="opacity-20" />

		<p class="font-mono text-xs leading-relaxed text-muted-foreground">
			enter your email and we'll send you a link to reset your password.
		</p>

		{#if forgotPassword.result}
			{#if forgotPassword.result.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">✓ {forgotPassword.result.text}</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {forgotPassword.result.text}</p>
			{/if}
		{/if}

		<form {...forgotPassword} class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={forgotPassword.fields.email.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input {...forgotPassword.fields.email.as('email')} placeholder="email" />
					<InputGroup.Addon><MailIcon class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each forgotPassword.fields.email.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<Button
				type="submit"
				variant="outline"
				disabled={forgotPassword.pending > 0}
				class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<KeyRound class="h-4 w-4" />
				{forgotPassword.pending > 0 ? 'sending...' : 'send reset link'}
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
