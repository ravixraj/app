import {
	Text,
	TextInput,
	View,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Pressable,
	ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { api } from '@/api';
import { useAuth } from '@/context/auth';

type Todo = {
	_id: string;
	title: string;
	description?: string;
	isComplete: boolean;
	updatedAt: string;
};

export default function TodoScreen() {
	const { token } = useAuth();

	const [todos, setTodos] = React.useState<Todo[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(false);

	// Create form
	const [title, setTitle] = React.useState('');
	const [description, setDescription] = React.useState('');
	const [creating, setCreating] = React.useState(false);

	// Search & filter
	const [search, setSearch] = React.useState('');
	const [filter, setFilter] = React.useState<'all' | 'pending' | 'done'>('all');

	// Edit state
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [editTitle, setEditTitle] = React.useState('');
	const [editDesc, setEditDesc] = React.useState('');

	const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

	React.useEffect(() => {
		fetchTodos();
	}, [filter]);

	React.useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			fetchTodos();
		}, 400);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [search]);

	async function fetchTodos() {
		try {
			const params = new URLSearchParams();
			if (search.trim()) params.set('query', search.trim());
			if (filter === 'done') params.set('complete', 'true');
			if (filter === 'pending') params.set('complete', 'false');

			const res = await api.get(`todos?${params}`, token);
			const json = await res.json();
			if (res.ok) {
				setTodos(json.data ?? []);
			}
		} catch {
			Alert.alert('Error', 'Failed to load todos');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}

	async function createTodo() {
		if (!title.trim()) {
			Alert.alert('Error', 'Title is required');
			return;
		}
		setCreating(true);
		try {
			const res = await api.post(
				'todos',
				{ title: title.trim(), description: description.trim() || undefined },
				token
			);
			if (res.ok) {
				const json = await res.json();
				setTodos((prev) => [json.data, ...prev]);
				setTitle('');
				setDescription('');
			} else {
				const json = await res.json();
				Alert.alert('Error', json.message || 'Failed to create todo');
			}
		} catch {
			Alert.alert('Error', 'Failed to create todo');
		} finally {
			setCreating(false);
		}
	}

	async function toggleTodo(id: string) {
		try {
			const res = await api.patch(`todos/toggle/status/${id}`, {}, token);
			const json = await res.json();
			if (res.ok) {
				setTodos((prev) => prev.map((t) => (t._id === id ? json.data : t)));
			}
		} catch {
			Alert.alert('Error', 'Failed to toggle todo');
		}
	}

	async function deleteTodo(id: string) {
		Alert.alert('Delete Todo', 'Are you sure?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					try {
						await api.del(`todos/${id}`, token);
						setTodos((prev) => prev.filter((t) => t._id !== id));
					} catch {
						Alert.alert('Error', 'Failed to delete todo');
					}
				}
			}
		]);
	}

	function startEdit(todo: Todo) {
		setEditingId(todo._id);
		setEditTitle(todo.title);
		setEditDesc(todo.description ?? '');
	}

	async function saveEdit(id: string) {
		try {
			const res = await api.patch(
				`todos/${id}`,
				{ title: editTitle, description: editDesc || undefined },
				token
			);
			const json = await res.json();
			if (res.ok) {
				setTodos((prev) => prev.map((t) => (t._id === id ? json.data : t)));
				setEditingId(null);
			}
		} catch {
			Alert.alert('Error', 'Failed to update todo');
		}
	}

	const doneCount = todos.filter((t) => t.isComplete).length;
	const pendingCount = todos.filter((t) => !t.isComplete).length;

	function renderTodo({ item: todo }: { item: Todo }) {
		if (editingId === todo._id) {
			return (
				<View className="mb-2 rounded-2xl border border-gray-100 bg-white p-4">
					<TextInput
						className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
						value={editTitle}
						onChangeText={setEditTitle}
						placeholder="Title"
						placeholderTextColor="#9ca3af"
					/>
					<TextInput
						className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
						value={editDesc}
						onChangeText={setEditDesc}
						placeholder="Description"
						placeholderTextColor="#9ca3af"
					/>
					<View className="flex-row gap-2">
						<TouchableOpacity
							onPress={() => saveEdit(todo._id)}
							className="flex-1 items-center rounded-xl bg-blue-500 py-2"
						>
							<Text className="text-sm font-semibold text-white">Save</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setEditingId(null)}
							className="flex-1 items-center rounded-xl bg-gray-200 py-2"
						>
							<Text className="text-sm font-semibold text-gray-700">Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		return (
			<View
				className={`mb-2 rounded-2xl border border-gray-100 bg-white p-4 ${
					todo.isComplete ? 'opacity-50' : ''
				}`}
			>
				<View className="flex-row items-start">
					{/* Checkbox */}
					<Pressable onPress={() => toggleTodo(todo._id)} className="mt-0.5 mr-3">
						<View
							className={`h-5 w-5 items-center justify-center rounded-md border-2 ${
								todo.isComplete ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
							}`}
						>
							{todo.isComplete && <Text className="text-xs text-white">✓</Text>}
						</View>
					</Pressable>

					{/* Content */}
					<View className="flex-1">
						<Text
							className={`text-sm font-medium ${
								todo.isComplete ? 'text-gray-400 line-through' : 'text-gray-900'
							}`}
						>
							{todo.title}
						</Text>
						{todo.description ? (
							<Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
								{todo.description}
							</Text>
						) : null}
					</View>

					{/* Actions */}
					<View className="ml-2 flex-row gap-3">
						<Pressable onPress={() => startEdit(todo)} hitSlop={8}>
							<Text className="text-xs text-gray-400">Edit</Text>
						</Pressable>
						<Pressable onPress={() => deleteTodo(todo._id)} hitSlop={8}>
							<Text className="text-xs text-red-400">Delete</Text>
						</Pressable>
					</View>
				</View>
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="border-b border-gray-100 bg-white px-4 pt-4 pb-3">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="text-lg font-bold text-gray-900">Todos</Text>
					<Text className="text-xs text-gray-400">
						{doneCount}/{todos.length} done
					</Text>
				</View>

				{/* Create */}
				<TextInput
					className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm"
					placeholder="Todo title"
					placeholderTextColor="#9ca3af"
					value={title}
					onChangeText={setTitle}
				/>
				<TextInput
					className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm"
					placeholder="Description (optional)"
					placeholderTextColor="#9ca3af"
					value={description}
					onChangeText={setDescription}
				/>
				<TouchableOpacity
					onPress={createTodo}
					disabled={creating || !title.trim()}
					className={`mb-3 items-center rounded-xl py-2.5 ${
						creating || !title.trim() ? 'bg-blue-200' : 'bg-blue-500'
					}`}
				>
					<Text className="text-sm font-semibold text-white">
						{creating ? 'Adding...' : 'Add Todo'}
					</Text>
				</TouchableOpacity>

				{/* Search */}
				<TextInput
					className="mb-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm"
					placeholder="Search todos..."
					placeholderTextColor="#9ca3af"
					value={search}
					onChangeText={setSearch}
				/>

				{/* Filter */}
				<View className="flex-row gap-2">
					{(['all', 'pending', 'done'] as const).map((f) => (
						<TouchableOpacity
							key={f}
							onPress={() => setFilter(f)}
							className={`flex-1 items-center rounded-xl py-2 ${
								filter === f ? 'bg-blue-500' : 'bg-gray-100'
							}`}
						>
							<Text
								className={`text-xs font-semibold capitalize ${
									filter === f ? 'text-white' : 'text-gray-600'
								}`}
							>
								{f}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Todo list */}
			<FlatList
				data={todos}
				keyExtractor={(item) => item._id}
				renderItem={renderTodo}
				contentContainerClassName="px-4 pt-3 pb-4"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => {
							setRefreshing(true);
							fetchTodos();
						}}
					/>
				}
				ListEmptyComponent={
					loading ? (
						<Text className="py-8 text-center text-gray-400">Loading...</Text>
					) : (
						<Text className="py-8 text-center text-gray-400">No todos found.</Text>
					)
				}
				ListFooterComponent={
					todos.length > 0 ? (
						<View className="flex-row justify-between px-1 py-2">
							<Text className="text-xs text-gray-400">{pendingCount} pending</Text>
							<Text className="text-xs text-gray-400">{doneCount} completed</Text>
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
