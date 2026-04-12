import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Modified: schema and types now imported from shared lib instead of defined inline
import { SignUpFormData, signUpSchema } from "@/lib/schemas";
// Added: centralized friendly error messages for Supabase auth errors
import { friendlyAuthError } from "@/lib/authErrors";

// Added: props interface so AuthContext can be injected when Member 1 merges
// onSignUp and onNavigateSignIn are optional so the form still works standalone
interface Props {
  onSignUp?: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: { message: string } | null }>;
  onNavigateSignIn?: () => void;
}

export default function SignUpForm({ onSignUp, onNavigateSignIn }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Added: auth error from Supabase response (separate from Zod validation errors)
  const [authError, setAuthError] = useState<string | null>(null);
  // Added: tracks in-flight request to show spinner and block double-submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Added: shown after successful sign-up to prompt email confirmation
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange", // Validate on change for immediate feedback
  });

  const password = watch("password");

  // Modified: onSubmit is now async and calls onSignUp prop instead of showing a local alert
  const onSubmit = async (data: SignUpFormData) => {
    setAuthError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      if (onSignUp) {
        const { error } = await onSignUp(
          data.email,
          data.password,
          data.fullName,
        );
        if (error) {
          // Added: map raw Supabase error to readable message
          setAuthError(friendlyAuthError(error.message));
        } else {
          // Added: Supabase sends a confirmation email by default — inform the user
          setSuccessMessage(
            "Account created! Check your email to confirm your address, then sign in.",
          );
        }
      }
    } catch {
      // Added: catch unexpected errors (e.g. network failure outside Supabase)
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: "None", color: "#ccc", width: 0 };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[@$!%*?&#]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: "Weak", color: "#e74c3c", width: 33 };
    if (strength <= 3)
      return { strength: "Medium", color: "#f39c12", width: 66 };
    return { strength: "Strong", color: "#27ae60", width: 100 };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join us today! Please fill in the details below.
      </Text>

      {/* Added: error banner for auth failures (email taken, weak password, etc.) */}
      {authError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{authError}</Text>
        </View>
      )}

      {/* Added: success banner shown after account creation — prompts email confirmation */}
      {successMessage && (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMessage}</Text>
          {/* Added: shortcut to sign-in screen after successful registration */}
          <TouchableOpacity onPress={onNavigateSignIn}>
            <Text style={styles.successBannerLink}>Go to Sign In →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Full Name *</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="John Doe"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!isSubmitting} // Added: disable input while request is in flight
            />
          )}
        />
        {errors.fullName && (
          <Text style={styles.errorText}>{errors.fullName.message}</Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email Address *</Text>
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

      {/* Password */}
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
                placeholder="Create a strong password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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

        {/* Password Strength Indicator */}
        {password && password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarBackground}>
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    width: `${passwordStrength.width}%`, // Modified: was a plain number (px), now a percentage string so the bar scales correctly on all screen sizes
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.strengthText, { color: passwordStrength.color }]}
            >
              {passwordStrength.strength}
            </Text>
          </View>
        )}

        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      {/* Confirm Password */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Re-enter your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isSubmitting} // Added: disable input while request is in flight
              />
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.eyeIconText}>
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}
      </View>

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
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        {/* Modified: onPress now calls onNavigateSignIn prop instead of doing nothing */}
        <TouchableOpacity onPress={onNavigateSignIn}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 20,
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
  // Added: green banner shown after successful account creation
  successBanner: {
    backgroundColor: "#d4edda",
    borderWidth: 1,
    borderColor: "#27ae60",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: "#155724",
    fontSize: 14,
    marginBottom: 6,
  },
  successBannerLink: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  strengthBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    width: 60,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
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
    marginBottom: 30,
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
