<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { LockKeyhole, UserIcon, MailIcon, LogIn, UserPlus } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '$lib/const.js';

	let { data } = $props();

	const metaTags = createPageMetaTags({
		title: 'Login & Register',
		description:
			'Sign in to your FreeAPI account or create a new account to access todos, social media, and e-commerce features.',
		canonical: '/auth'
	});

	const {
		form: registerForm,
		errors: registerErrors,
		enhance: registerEnhance,
		submitting: registerSubmitting,
		message: registerMessage,
		constraints: registerConstrains
	} = superForm(data.registerForm, {
		resetForm: true,
		invalidateAll: false
	});

	const {
		form: loginForm,
		errors: loginErrors,
		enhance: loginEnhance,
		message: loginMessage,
		submitting: loginSubmitting,
		constraints: loginConstrains
	} = superForm(data.loginForm, {
		resetForm: true,
		invalidateAll: false
	});
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="flex w-full max-w-3xl flex-col gap-8 md:flex-row md:gap-12">
		<!-- Register -->
		<div class="flex w-full flex-col gap-5 md:w-80">
			<div class="flex items-center gap-2">
				<UserPlus class="h-5 w-5 text-sidebar-primary" />
				<h2 class="font-mono text-sm tracking-widest text-foreground uppercase">register</h2>
			</div>

			<Separator class="opacity-20" />

			{#if $registerMessage}
				{@const message = $registerMessage}
				{#if message.type === 'success'}
					<p class="font-mono text-xs text-sidebar-primary">✓ {message.text}</p>
				{:else}
					<p class="font-mono text-xs text-destructive">✗ {message.text}</p>
				{/if}
			{/if}

			<form method="post" action="?/register" use:registerEnhance class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<InputGroup.Root class={$registerErrors.username ? 'border-destructive' : ''}>
						<InputGroup.Input
							type="text"
							name="username"
							placeholder="username"
							autocomplete="username"
							bind:value={$registerForm.username}
							{...$registerConstrains.username}
						/>
						<InputGroup.Addon>
							<UserIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if $registerErrors.username}
						<p class="font-mono text-xs text-destructive">{$registerErrors.username}</p>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root class={$registerErrors.email ? 'border-destructive' : ''}>
						<InputGroup.Input
							type="email"
							name="email"
							placeholder="email"
							autocomplete="email"
							bind:value={$registerForm.email}
							{...$registerConstrains.email}
						/>
						<InputGroup.Addon>
							<MailIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if $registerErrors.email}
						<p class="font-mono text-xs text-destructive">{$registerErrors.email}</p>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root class={$registerErrors.password ? 'border-destructive' : ''}>
						<InputGroup.Input
							type="password"
							name="password"
							placeholder="password"
							autocomplete="new-password"
							bind:value={$registerForm.password}
							{...$registerConstrains.password}
						/>
						<InputGroup.Addon>
							<LockKeyhole class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if $registerErrors.password}
						<p class="font-mono text-xs text-destructive">{$registerErrors.password}</p>
					{/if}
				</div>

				<Button
					type="submit"
					variant="outline"
					disabled={$registerSubmitting}
					class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
				>
					<UserPlus class="h-4 w-4" />
					{$registerSubmitting ? 'creating...' : 'sign up'}
				</Button>
			</form>
		</div>

		<!-- Vertical divider on md+ -->
		<div class="hidden md:flex md:items-stretch">
			<Separator orientation="vertical" class="opacity-20" />
		</div>
		<!-- Horizontal divider on mobile -->
		<Separator class="opacity-20 md:hidden" />

		<!-- Login -->
		<div class="flex w-full flex-col gap-5 md:w-80">
			<div class="flex items-center gap-2">
				<LogIn class="h-5 w-5 text-sidebar-primary" />
				<h2 class="font-mono text-sm tracking-widest text-foreground uppercase">login</h2>
			</div>

			<Separator class="opacity-20" />

			{#if $loginMessage}
				{@const message = $loginMessage}
				{#if message.type === 'success'}
					<p class="font-mono text-xs text-sidebar-primary">✓ {message.text}</p>
				{:else}
					<p class="font-mono text-xs text-destructive">✗ {message.text}</p>
				{/if}
			{/if}

			<form method="post" action="?/login" use:loginEnhance class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<InputGroup.Root class={$loginErrors.email ? 'border-destructive' : ''}>
						<InputGroup.Input
							type="email"
							name="email"
							placeholder="email"
							autocomplete="email"
							bind:value={$loginForm.email}
							{...$loginConstrains.email}
						/>
						<InputGroup.Addon>
							<MailIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if $loginErrors.email}
						<p class="font-mono text-xs text-destructive">{$loginErrors.email}</p>
					{/if}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root class={$loginErrors.password ? 'border-destructive' : ''}>
						<InputGroup.Input
							type="password"
							name="password"
							placeholder="password"
							autocomplete="current-password"
							bind:value={$loginForm.password}
							{...$loginConstrains.password}
						/>
						<InputGroup.Addon>
							<LockKeyhole class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#if $loginErrors.password}
						<p class="font-mono text-xs text-destructive">{$loginErrors.password}</p>
					{/if}
				</div>

				<Button
					type="submit"
					variant="outline"
					disabled={$loginSubmitting}
					class="mt-1 w-full gap-2 font-mono text-xs tracking-widest uppercase"
				>
					<LogIn class="h-4 w-4" />
					{$loginSubmitting ? 'signing in...' : 'sign in'}
				</Button>

				<div class="flex justify-end">
					<a
						href="/forgot-password"
						class="font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-sidebar-primary"
					>
						forgot password?
					</a>
				</div>
			</form>
		</div>
	</div>
</div>

<MetaTags {...metaTags} />
