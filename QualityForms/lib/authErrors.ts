export function friendlyAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password. Please try again.";
  if (message.includes("User already registered"))
    return "An account with this email already exists. Please sign in instead.";
  if (message.includes("Email not confirmed"))
    return "Please confirm your email before signing in.";
  if (message.includes("Password should be"))
    return "Password is too weak — please choose a stronger one.";
  if (message.includes("rate limit") || message.includes("too many requests"))
    return "Too many attempts — please wait a few minutes before trying again.";
  if (message.includes("network") || message.includes("fetch"))
    return "Network error — check your connection and try again.";
  return message;
}
