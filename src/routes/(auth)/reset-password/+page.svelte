<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { LockKeyhole, ShieldCheck } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '$lib/const.js';

	let { data } = $props();

	const metaTags = createPageMetaTags({
		title: 'Reset Password',
		description: 'Set a new password for your FreeAPI account.',
		canonical: '/reset-password'
	});

	const { form, errors, enhance, submitting, message } = superForm(data.form);
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<div class="flex items-center gap-2">
			<ShieldCheck class="h-5 w-5 text-sidebar-primary" />
			<h2 class="font-mono text-sm tracking-widest uppercase">reset password</h2>
		</div>

		<Separator class="opacity-20" />

		{#if $message}
			{@const msg = $message}
			{#if msg.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">
					✓ {msg.text}. <a href="/auth" class="underline">sign in</a>
				</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {msg.text}</p>
			{/if}
		{/if}

		<form method="post" use:enhance class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputGroup.Root class={$errors.newPassword ? 'border-destructive' : ''}>
					<InputGroup.Input
						type="password"
						name="newPassword"
						placeholder="new password"
						bind:value={$form.newPassword}
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#if $errors.newPassword}
					<p class="font-mono text-xs text-destructive">{$errors.newPassword[0]}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputGroup.Root class={$errors.confirmPassword ? 'border-destructive' : ''}>
					<InputGroup.Input
						type="password"
						name="confirmPassword"
						placeholder="confirm password"
						bind:value={$form.confirmPassword}
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#if $errors.confirmPassword}
					<p class="font-mono text-xs text-destructive">{$errors.confirmPassword}</p>
				{/if}
			</div>

			<Button
				type="submit"
				variant="outline"
				disabled={$submitting}
				class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<ShieldCheck class="h-4 w-4" />
				{$submitting ? 'resetting...' : 'reset password'}
			</Button>
		</form>
	</div>
</div>

<MetaTags {...metaTags} />
