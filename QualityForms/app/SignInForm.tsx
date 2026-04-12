import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // Added: spinner for loading state
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Modified: schema and types now imported from shared lib instead of defined inline
import { signInSchema, SignInFormData } from "@/lib/schemas";
// Added: centralized friendly error messages for Supabase auth errors
import { friendlyAuthError } from "@/lib/authErrors";

// Added: props interface so AuthContext can be injected when Member 1 merges
// onSignIn and onNavigateSignUp are optional so the form still works standalone
interface Props {
  onSignIn?: (
    email: string,
    password: string,
  ) => Promise<{ error: { message: string } | null }>;
  onNavigateSignUp?: () => void;
}

export default function SignInForm({ onSignIn, onNavigateSignUp }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  // Added: auth error from Supabase response (separate from Zod validation errors)
  const [authError, setAuthError] = useState<string | null>(null);
  // Added: tracks in-flight request to show spinner and block double-submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue, // Added: used to clear password field on failed sign-in
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange", // Modified: was "onBlur" — changed to "onChange" so isValid updates immediately
  });

  // Modified: onSubmit is now async and calls onSignIn prop instead of showing a local alert
  const onSubmit = async (data: SignInFormData) => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      if (onSignIn) {
        const { error } = await onSignIn(data.email, data.password);
        if (error) {
          // Added: map raw Supabase error to readable message, clear password for security
          setAuthError(friendlyAuthError(error.message));
          setValue("password", "");
        }
        // On success, _layout.tsx handles redirect automatically via session listener
      }
    } catch {
      // Added: catch unexpected errors (e.g. network failure outside Supabase)
      setAuthError("An unexpected error occurred. Please try again.");
      setValue("password", "");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>
        Welcome back! Please sign in to continue.
      </Text>

      {/* Added: error banner for auth failures (wrong password, network error, etc.) */}
      {authError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{authError}</Text>
        </View>
      )}

      {/* Email Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email *</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting} // Added: disable input while request is in flight
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
      </View>

      {/* Password Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isSubmitting} // Added: disable input while request is in flight
              />
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIconText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      {/* Modified: also disabled while isSubmitting to prevent double-submit */}
      <TouchableOpacity
        style={[
          styles.button,
          (!isValid || isSubmitting) && styles.buttonDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || isSubmitting}
      >
        {/* Added: show spinner while request is in flight, button text otherwise */}
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        {/* Modified: onPress now calls onNavigateSignUp prop instead of doing nothing */}
        <TouchableOpacity onPress={onNavigateSignUp}>
          <Text style={styles.footerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#065F46",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  // Added: red banner for Supabase auth errors
  errorBanner: {
    backgroundColor: "#ffe6e6",
    borderWidth: 1,
    borderColor: "#e74c3c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#c0392b",
    fontSize: 14,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#e74c3c",
    backgroundColor: "#ffe6e6",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 14,
  },
  eyeIconText: {
    fontSize: 20,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#10B981",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  footerLink: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
});
