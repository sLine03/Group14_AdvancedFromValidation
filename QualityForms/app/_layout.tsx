import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#10B981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="employee" options={{ title: 'Employee Form' }} />
      <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
    </Stack>
  );
}