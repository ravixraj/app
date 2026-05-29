<script lang="ts">
	import {
		ListTodo,
		Plus,
		Trash2,
		Pencil,
		Search,
		X,
		Check,
		Filter,
		FileText
	} from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';
	import { superForm } from 'sveltekit-superforms';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();

	type Todo = {
		_id: string;
		title: string;
		description?: string;
		isComplete: boolean;
		updatedAt: string;
	};

	const { form, errors, enhance, submitting, message, constraints } = superForm(data.form, {
		resetForm: true,
		invalidateAll: false
	});

	// ── State ─────────────────────────────────────────────
	let todos = $state<Todo[]>(data.todos);
	let loading = $state(false);
	let error = $state('');

	// filters
	let searchQuery = $state($page.url.searchParams.get('query') ?? '');
	let filterComplete = $state($page.url.searchParams.get('complete') ?? 'all');

	// edit state
	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let editDescription = $state('');

	// ── Sync todos when load() returns new data ───────────
	$effect(() => {
		todos = data.todos;
	});

	// ── Search/filter → update URL → re-runs load() ───────
	$effect(() => {
		const params = new URLSearchParams();
		if (searchQuery.trim()) params.set('query', searchQuery.trim());
		if (filterComplete !== 'all')
			params.set('complete', filterComplete === 'done' ? 'true' : 'false');

		goto(`?${params}`, { keepFocus: true, noScroll: true });
	});

	// ── Derived counts ────────────────────────────────────
	const doneCount = $derived(todos.filter((t) => t.isComplete).length);
	const pendingCount = $derived(todos.filter((t) => !t.isComplete).length);

	// Toggle complete status
	async function toggleTodo(id: string) {
		try {
			const res = await api.patch(`todos/toggle/status/${id}`, {});
			const json = await res.json();
			todos = todos.map((t) => (t._id === id ? json.data : t));
		} catch {
			error = 'failed to toggle todo.';
		}
	}

	// Delete a todo
	async function deleteTodo(id: string) {
		try {
			await api.del(`todos/${id}`);
			todos = todos.filter((t) => t._id !== id);
		} catch {
			error = 'failed to delete todo.';
		}
	}

	function startEdit(todo: Todo) {
		editingId = todo._id;
		editTitle = todo.title;
		editDescription = todo.description ?? '';
	}

	async function saveEdit(id: string) {
		try {
			const res = await api.patch(`todos/${id}`, {
				title: editTitle,
				description: editDescription
			});
			const json = await res.json();
			todos = todos.map((t) => (t._id === id ? json.data : t));
			editingId = null;
		} catch {
			error = 'failed to update todo.';
		}
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<div class="flex min-h-screen flex-col items-center px-4 py-12">
	<div class="flex w-full max-w-xl flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center gap-2">
			<ListTodo class="h-5 w-5 text-sidebar-primary" />
			<h1 class="font-mono text-sm tracking-widest uppercase">todos</h1>
			<span class="ml-auto font-mono text-xs text-muted-foreground">
				{doneCount}/{todos.length} done
			</span>
		</div>

		<Separator class="opacity-20" />

		<!-- Create -->
		<form method="POST" use:enhance class="flex flex-col gap-2">
			<p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">new</p>

			<div class="flex flex-col gap-1">
				<InputGroup.Root class={$errors.title ? 'border-destructive' : ''}>
					<InputGroup.Input
						type="text"
						name="title"
						placeholder="todo title"
						bind:value={$form.title}
					/>
					<InputGroup.Addon><FileText class="h-4 w-4" /></InputGroup.Addon>
				</InputGroup.Root>
				{#if $errors.title}
					<p class="font-mono text-xs text-destructive">{$errors.title}</p>
					<!-- ← here -->
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputGroup.Root>
					<InputGroup.Textarea
						name="description"
						placeholder="description (optional)"
						bind:value={$form.description}
					/>
				</InputGroup.Root>
				{#if $errors.description}
					<p class="font-mono text-xs text-destructive">{$errors.description}</p>
					<!-- ← here -->
				{/if}
			</div>

			{#if $message}
				<p
					class="font-mono text-xs"
					class:text-sidebar-primary={$message.type === 'success'}
					class:text-destructive={$message.type === 'error'}
				>
					{$message.text}
				</p>
			{/if}

			<Button
                type="submit"
				variant="outline"
				disabled={$submitting}
				class="w-full gap-2 font-mono text-xs tracking-widest uppercase"
			>
				<Plus class="h-4 w-4" />
				{$submitting ? 'adding...' : 'add todo'}
			</Button>
		</form>

		<Separator class="opacity-20" />

		<!-- Search + Filter -->
		<div class="flex flex-col gap-2">
			<InputGroup.Root>
				<InputGroup.Input type="text" placeholder="search todos..." bind:value={searchQuery} />
				<InputGroup.Addon>
					{#if searchQuery}
						<button onclick={() => (searchQuery = '')}><X class="h-4 w-4" /></button>
					{:else}
						<Search class="h-4 w-4" />
					{/if}
				</InputGroup.Addon>
			</InputGroup.Root>

			<div class="flex gap-2">
				{#each ['all', 'pending', 'done'] as f}
					<Button
						variant={filterComplete === f ? 'default' : 'outline'}
						onclick={() => (filterComplete = f as typeof filterComplete)}
						class="flex-1 gap-1 font-mono text-xs tracking-widest uppercase"
					>
						<Filter class="h-3 w-3" />
						{f}
					</Button>
				{/each}
			</div>
		</div>

		<Separator class="opacity-20" />

		<!-- List -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">
					{filterComplete === 'all' ? 'all' : filterComplete} · {todos.length} items
				</p>
				{#if loading}
					<span class="animate-pulse font-mono text-xs text-muted-foreground">loading...</span>
				{/if}
			</div>

			{#if error}
				<p class="font-mono text-xs text-destructive">{error}</p>
			{/if}

			{#if todos.length === 0 && !loading}
				<p class="py-4 text-center font-mono text-xs text-muted-foreground opacity-50">
					no todos found.
				</p>
			{/if}

			{#each todos as todo (todo._id)}
				<div
					class="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-opacity"
					class:opacity-50={todo.isComplete}
				>
					{#if editingId === todo._id}
						<!-- Edit mode -->
						<div class="flex flex-col gap-2">
							<InputGroup.Root>
								<InputGroup.Input type="text" bind:value={editTitle} placeholder="title" />
								<InputGroup.Addon><FileText class="h-4 w-4" /></InputGroup.Addon>
							</InputGroup.Root>
							<InputGroup.Root>
								<InputGroup.Input
									type="text"
									bind:value={editDescription}
									placeholder="description"
								/>
								<InputGroup.Addon><FileText class="h-4 w-4" /></InputGroup.Addon>
							</InputGroup.Root>
							<div class="flex gap-2">
								<Button
									variant="outline"
									onclick={() => saveEdit(todo._id)}
									class="flex-1 gap-1 font-mono text-xs tracking-widest uppercase"
								>
									<Check class="h-3 w-3" /> save
								</Button>
								<Button
									variant="outline"
									onclick={cancelEdit}
									class="flex-1 gap-1 font-mono text-xs tracking-widest uppercase"
								>
									<X class="h-3 w-3" /> cancel
								</Button>
							</div>
						</div>
					{:else}
						<!-- View mode -->
						<div class="flex items-start gap-3">
							<Checkbox
								checked={todo.isComplete}
								onCheckedChange={() => toggleTodo(todo._id)}
								class="mt-0.5"
							/>
							<div class="flex min-w-0 flex-1 flex-col gap-0.5">
								<p
									class="font-mono text-xs leading-relaxed"
									class:line-through={todo.isComplete}
									class:text-muted-foreground={todo.isComplete}
								>
									{todo.title}
								</p>
								{#if todo.description}
									<p class="truncate font-mono text-xs text-muted-foreground opacity-60">
										{todo.description}
									</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-1">
								<Button variant="ghost" size="icon" onclick={() => startEdit(todo)} class="h-6 w-6">
									<Pencil class="h-3 w-3" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => deleteTodo(todo._id)}
									class="h-6 w-6 text-destructive hover:text-destructive"
								>
									<Trash2 class="h-3 w-3" />
								</Button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Footer stats -->
		{#if todos.length > 0}
			<Separator class="opacity-20" />
			<div class="flex justify-between font-mono text-xs text-muted-foreground">
				<span>{pendingCount} pending</span>
				<span>{doneCount} completed</span>
			</div>
		{/if}
	</div>
</div>

<MetaTags {...data.metaTags} />
