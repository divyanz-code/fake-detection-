import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useApp } from "../../context/AppContext";

export const LoginScreen: React.FC = () => {
  const { loginUser, navigateTo, error, clearError } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }
    setLocalError(null);
    clearError();
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (err: any) {
      // Error is caught by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {/* Header */}
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {/* Error Notification */}
        {(localError || error) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        )}

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setLocalError(null); }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secureText}
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => { setPassword(text); setLocalError(null); }}
            />
            <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{secureText ? "👁️" : "🙈"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Forgot Password */}
        <Pressable style={styles.forgotBtn} onPress={() => alert("Forgot Password feature under development")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        {/* Social Authentication Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <Pressable style={styles.socialBtn} onPress={() => alert("Social Login is a demo mock")}>
          <Text style={styles.socialBtnText}> G  Sign in with Google</Text>
        </Pressable>
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Pressable onPress={() => navigateTo("register")}>
          <Text style={styles.footerLink}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#9CA3AF",
    paddingHorizontal: 12,
    fontSize: 13,
  },
  socialBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 36,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  footerLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
  },
});
