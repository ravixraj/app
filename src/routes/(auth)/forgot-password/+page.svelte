<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { MailIcon, KeyRound } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '$lib/const.js';

	let { data } = $props();

	const metaTags = createPageMetaTags({
		title: 'Forgot Password',
		description: 'Reset your FreeAPI account password. Enter your email to receive a reset link.',
		canonical: '/forgot-password'
	});

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		resetForm: true
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

		{#if $message}
			{#if $message.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">✓ {$message.text}</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {$message.text}</p>
			{/if}
		{/if}

		<form method="post" use:enhance class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputGroup.Root class={$errors.email ? 'border-destructive' : ''}>
					<InputGroup.Input
						type="email"
						name="email"
						placeholder="email"
						bind:value={$form.email}
					/>
					<InputGroup.Addon><MailIcon class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#if $errors.email}
					<p class="font-mono text-xs text-destructive">{$errors.email}</p>
				{/if}
			</div>

			<Button
				type="submit"
				variant="outline"
				disabled={$submitting}
				class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<KeyRound class="h-4 w-4" />
				{$submitting ? 'sending...' : 'send reset link'}
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
