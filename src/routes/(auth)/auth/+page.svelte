<script lang="ts">
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { LockKeyhole, UserIcon, MailIcon, LogIn, UserPlus } from '@lucide/svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { createPageMetaTags } from '#lib/const.js';
	import { register, login } from './remote';

	const metaTags = createPageMetaTags({
		title: 'Login & Register',
		description:
			'Sign in to your FreeAPI account or create a new account to access todos, social media, and e-commerce features.',
		canonical: '/auth'
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

			{#if register.result}
				{#if register.result.type === 'success'}
					<p class="font-mono text-xs text-sidebar-primary">✓ {register.result.text}</p>
				{:else}
					<p class="font-mono text-xs text-destructive">✗ {register.result.text}</p>
				{/if}
			{/if}

			<form {...register} class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<InputGroup.Root
						class={register.fields.username.issues()?.length ? 'border-destructive' : ''}
					>
						<InputGroup.Input
							{...register.fields.username.as('text')}
							placeholder="username"
							autocomplete="username"
						/>
						<InputGroup.Addon>
							<UserIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#each register.fields.username.issues() ?? [] as issue}
						<p class="font-mono text-xs text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root
						class={register.fields.email.issues()?.length ? 'border-destructive' : ''}
					>
						<InputGroup.Input
							{...register.fields.email.as('email')}
							placeholder="email"
							autocomplete="email"
						/>
						<InputGroup.Addon>
							<MailIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#each register.fields.email.issues() ?? [] as issue}
						<p class="font-mono text-xs text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root
						class={register.fields.password.issues()?.length ? 'border-destructive' : ''}
					>
						<InputGroup.Input
							{...register.fields.password.as('password')}
							placeholder="password"
							autocomplete="new-password"
						/>
						<InputGroup.Addon>
							<LockKeyhole class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#each register.fields.password.issues() ?? [] as issue}
						<p class="font-mono text-xs text-destructive">{issue.message}</p>
					{/each}
				</div>

				<Button
					type="submit"
					variant="outline"
					disabled={register.pending > 0}
					class="mt-2 w-full gap-2 font-mono text-xs tracking-widest uppercase"
				>
					<UserPlus class="h-4 w-4" />
					{register.pending > 0 ? 'creating...' : 'sign up'}
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

			{#if login.result}
				{#if login.result.type === 'success'}
					<p class="font-mono text-xs text-sidebar-primary">✓ {login.result.text}</p>
				{:else}
					<p class="font-mono text-xs text-destructive">✗ {login.result.text}</p>
				{/if}
			{/if}

			<form {...login} class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<InputGroup.Root class={login.fields.email.issues()?.length ? 'border-destructive' : ''}>
						<InputGroup.Input
							{...login.fields.email.as('email')}
							placeholder="email"
							autocomplete="email"
						/>
						<InputGroup.Addon>
							<MailIcon class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#each login.fields.email.issues() ?? [] as issue}
						<p class="font-mono text-xs text-destructive">{issue.message}</p>
					{/each}
				</div>

				<div class="flex flex-col gap-1">
					<InputGroup.Root
						class={login.fields.password.issues()?.length ? 'border-destructive' : ''}
					>
						<InputGroup.Input
							{...login.fields.password.as('password')}
							placeholder="password"
							autocomplete="current-password"
						/>
						<InputGroup.Addon>
							<LockKeyhole class="h-4 w-4" />
						</InputGroup.Addon>
					</InputGroup.Root>
					{#each login.fields.password.issues() ?? [] as issue}
						<p class="font-mono text-xs text-destructive">{issue.message}</p>
					{/each}
				</div>

				<Button
					type="submit"
					variant="outline"
					disabled={login.pending > 0}
					class="mt-1 w-full gap-2 font-mono text-xs tracking-widest uppercase"
				>
					<LogIn class="h-4 w-4" />
					{login.pending > 0 ? 'signing in...' : 'sign in'}
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
