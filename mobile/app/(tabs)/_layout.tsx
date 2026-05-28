import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
	const icons: Record<string, string> = {
		Feed: '◉',
		Todos: '☐',
		Profile: '◎'
	};
	return (
		<View className="items-center justify-center">
			<Text
				style={{
					fontSize: 22,
					color: focused ? '#3b82f6' : '#9ca3af',
					fontWeight: focused ? '700' : '400'
				}}
			>
				{icons[label] || '•'}
			</Text>
		</View>
	);
}

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#ffffff',
					borderTopColor: '#f0f0f0',
					borderTopWidth: 1,
					paddingBottom: 8,
					paddingTop: 8,
					height: 60,
					elevation: 8,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.06,
					shadowRadius: 8
				},
				tabBarActiveTintColor: '#3b82f6',
				tabBarInactiveTintColor: '#9ca3af',
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '600',
					marginTop: 2
				}
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Feed',
					tabBarIcon: ({ focused }) => <TabIcon label="Feed" focused={focused} />
				}}
			/>
			<Tabs.Screen
				name="todo"
				options={{
					title: 'Todos',
					tabBarIcon: ({ focused }) => <TabIcon label="Todos" focused={focused} />
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />
				}}
			/>
		</Tabs>
	);
}
