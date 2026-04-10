
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ── AuthGuard ─────────────────────────────────────────────────────────────────

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // wait until we know if a session exists

    const currentScreen = segments[0]; // e.g. "index", "employee", "signin", "signup"

    const isProtected = currentScreen === "index" || currentScreen === "employee";
    const isAuthScreen = currentScreen === "signin" || currentScreen === "signup";

    if (!session && isProtected) {
      // Not signed in, trying to access a protected screen → kick to sign in
      router.replace("/signin");
    } else if (session && isAuthScreen) {
      // Already signed in, sitting on signin/signup → go to home
      router.replace("/");
    }
  }, [session, isLoading, segments]);

  // Don't render any screen until auth state is known.
  // Prevents the home screen from flashing before the redirect fires.
  if (isLoading) return null;

  return <>{children}</>;
};

// ── Root Layout ───────────────────────────────────────────────────────────────

const RootLayout = () => {
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#10B981",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="employee" options={{ title: "Employee Form" }} />
          <Stack.Screen name="signin" options={{ title: "Sign In" }} />
          <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
};

export default RootLayout;