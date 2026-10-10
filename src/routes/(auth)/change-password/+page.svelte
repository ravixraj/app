<script lang="ts">
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { LockKeyhole, KeySquare } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '#lib/const.js';
	import { changePassword } from './remote';

	const metaTags = createPageMetaTags({
		title: 'Change Password',
		description: 'Update your account password securely.',
		canonical: '/change-password'
	});
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-sm flex-col gap-5">
		<div class="flex items-center gap-2">
			<KeySquare class="h-5 w-5 text-sidebar-primary" />
			<h2 class="font-mono text-sm tracking-widest uppercase">change password</h2>
		</div>

		<Separator class="opacity-20" />

		{#if changePassword.result}
			{#if changePassword.result.type === 'success'}
				<p class="font-mono text-xs text-sidebar-primary">✓ {changePassword.result.text}</p>
			{:else}
				<p class="font-mono text-xs text-destructive">✗ {changePassword.result.text}</p>
			{/if}
		{/if}

		<form {...changePassword} class="flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={changePassword.fields.oldPassword.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input
						{...changePassword.fields.oldPassword.as('password')}
						placeholder="current password"
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each changePassword.fields.oldPassword.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<Separator class="opacity-10" />

			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={changePassword.fields.newPassword.issues()?.length ? 'border-destructive' : ''}
				>
					<InputGroup.Input
						{...changePassword.fields.newPassword.as('password')}
						placeholder="new password"
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each changePassword.fields.newPassword.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<div class="flex flex-col gap-1">
				<InputGroup.Root
					class={changePassword.fields.confirmNewPassword.issues()?.length
						? 'border-destructive'
						: ''}
				>
					<InputGroup.Input
						{...changePassword.fields.confirmNewPassword.as('password')}
						placeholder="confirm new password"
					/>
					<InputGroup.Addon><LockKeyhole class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#each changePassword.fields.confirmNewPassword.issues() ?? [] as issue}
					<p class="font-mono text-xs text-destructive">{issue.message}</p>
				{/each}
			</div>

			<Button
				type="submit"
				variant="outline"
				disabled={changePassword.pending > 0}
				class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<KeySquare class="h-4 w-4" />
				{changePassword.pending > 0 ? 'updating...' : 'update password'}
			</Button>
		</form>
	</div>
</div>

<MetaTags {...metaTags} />
