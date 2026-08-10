import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, ActivityIndicator, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

export const LoginScreen: React.FC = () => {
  const { loginUser, navigateTo, error, clearError } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

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
      // Error handled by context state
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <View style={styles.formContainer}>
        {/* Brand */}
        <Text style={[styles.brandText, isDark ? styles.textWhite : styles.textDark]}>
          Sign <Text style={styles.brandAccent}>In</Text>
        </Text>
        <Text style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          Access AegisFace deepfake classification services.
        </Text>

        {/* Error Messages */}
        {(localError || error) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        )}

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textDark]}>Email Address</Text>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="name@example.com"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setLocalError(null); }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, isDark ? styles.textWhite : styles.textDark]}>Password</Text>
          <TextInput
            style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
            placeholder="••••••••"
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={(text) => { setPassword(text); setLocalError(null); }}
          />
        </View>

        {/* Login Button */}
        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          Don't have an account?{" "}
        </Text>
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
    padding: 24,
    justifyContent: "space-between",
  },
  bgLight: {
    backgroundColor: "#ffffff",
  },
  bgDark: {
    backgroundColor: "#0F172A",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 360,
    alignSelf: "center",
    width: "100%",
  },
  brandText: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  brandAccent: {
    color: "#6366F1",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  textWhite: {
    color: "#ffffff",
  },
  textDark: {
    color: "#0F172A",
  },
  textSecondaryLight: {
    color: "#4B5563",
  },
  textSecondaryDark: {
    color: "#9CA3AF",
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputLight: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    color: "#0F172A",
  },
  inputDark: {
    borderColor: "#374151",
    backgroundColor: "#1E293B",
    color: "#ffffff",
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "600",
  },
});
