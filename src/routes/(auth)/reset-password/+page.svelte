<script lang="ts">
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { LockKeyhole, ShieldCheck } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '#lib/const.js';
	import { page } from '$app/state';
	import { resetPassword } from './remote';

	const metaTags = createPageMetaTags({
		title: 'Reset Password',
		description: 'Set a new password for your FreeAPI account.',
		canonical: '/reset-password'
	});

	const token = $derived(page.url.searchParams.get('token') ?? '');
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<div class="flex items-center gap-2">
			<ShieldCheck class="h-5 w-5 text-sidebar-primary" />
			<h2 class="font-mono text-sm tracking-widest uppercase">reset password</h2>
		</div>

		<Separator class="opacity-20" />

		{#if resetPassword.result}
			{#if resetPassword.result.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">
					✓ {resetPassword.result.text}. <a href="/auth" class="underline">sign in</a>
				</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {resetPassword.result.text}</p>
			{/if}
		{/if}

		{#if !token}
			<p class="font-mono text-xs text-destructive">
				missing reset token. please use the link from your email.
			</p>
		{/if}

		<form {...resetPassword} class="flex flex-col gap-3">
			<input {...resetPassword.fields.token.as('hidden', token)} />
			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={resetPassword.fields.newPassword.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input
						{...resetPassword.fields.newPassword.as('password')}
						placeholder="new password"
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each resetPassword.fields.newPassword.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={resetPassword.fields.confirmPassword.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input
						{...resetPassword.fields.confirmPassword.as('password')}
						placeholder="confirm password"
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each resetPassword.fields.confirmPassword.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<Button
				type="submit"
				variant="outline"
				disabled={resetPassword.pending > 0 || !token}
				class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<ShieldCheck class="h-4 w-4" />
				{resetPassword.pending > 0 ? 'resetting...' : 'reset password'}
			</Button>
		</form>
	</div>
</div>

<MetaTags {...metaTags} />
