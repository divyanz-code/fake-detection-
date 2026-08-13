import React from "react";
import { View, StyleSheet, Text, Pressable, SafeAreaView, useColorScheme } from "react-native";
import { AppProvider, useApp } from "../context/AppContext";

// Import Screens
import { SplashScreen } from "../components/screens/SplashScreen";
import { OnboardingScreen } from "../components/screens/OnboardingScreen";
import { LoginScreen } from "../components/screens/LoginScreen";
import { RegisterScreen } from "../components/screens/RegisterScreen";
import { DashboardScreen } from "../components/screens/DashboardScreen";
import { UploadScreen } from "../components/screens/UploadScreen";
import { ProcessingScreen } from "../components/screens/ProcessingScreen";
import { ResultsScreen } from "../components/screens/ResultsScreen";
import { HistoryScreen } from "../components/screens/HistoryScreen";
import { ProfileScreen } from "../components/screens/ProfileScreen";

const AppContent: React.FC = () => {
  const { activeScreen, userToken, navigateTo } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // 1. Render Authentication / Guest Stack
  if (!userToken) {
    switch (activeScreen) {
      case "splash":
        return <SplashScreen />;
      case "onboarding":
        return <OnboardingScreen />;
      case "register":
        return <RegisterScreen />;
      case "login":
      default:
        return <LoginScreen />;
    }
  }

  // 2. Render Main Application Screens
  const renderScreen = () => {
    switch (activeScreen) {
      case "upload":
        return <UploadScreen />;
      case "processing":
        return <ProcessingScreen />;
      case "results":
        return <ResultsScreen />;
      case "history":
        return <HistoryScreen />;
      case "profile":
        return <ProfileScreen />;
      case "dashboard":
      default:
        return <DashboardScreen />;
    }
  };

  // Determine which tab is active (Dashboard, Upload, Results represent Home)
  const isHomeActive = ["dashboard", "upload", "processing", "results"].includes(activeScreen);
  const isHistoryActive = activeScreen === "history";
  const isProfileActive = activeScreen === "profile";

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeDark : styles.safeLight]}>
      {/* Screen Wrapper */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Modern Floating Navigation Tab Bar */}
      <View style={[styles.tabBarContainer, isDark ? styles.tabBarDark : styles.tabBarLight]}>
        <Pressable
          style={styles.tabItem}
          onPress={() => navigateTo("dashboard")}
        >
          <Text style={[styles.tabIcon, isHomeActive ? styles.tabTextActive : styles.tabTextInactive]}>
            {isHomeActive ? "●" : "○"}
          </Text>
          <Text style={[styles.tabLabel, isHomeActive ? styles.tabTextActive : styles.tabTextInactive]}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => navigateTo("history")}
        >
          <Text style={[styles.tabIcon, isHistoryActive ? styles.tabTextActive : styles.tabTextInactive]}>
            {isHistoryActive ? "●" : "○"}
          </Text>
          <Text style={[styles.tabLabel, isHistoryActive ? styles.tabTextActive : styles.tabTextInactive]}>
            History
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => navigateTo("profile")}
        >
          <Text style={[styles.tabIcon, isProfileActive ? styles.tabTextActive : styles.tabTextInactive]}>
            {isProfileActive ? "●" : "○"}
          </Text>
          <Text style={[styles.tabLabel, isProfileActive ? styles.tabTextActive : styles.tabTextInactive]}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default function HomeScreen() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeLight: {
    backgroundColor: "#F8FAFC",
  },
  safeDark: {
    backgroundColor: "#0F172A",
  },
  screenContainer: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 72,
    borderTopWidth: 1,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabBarLight: {
    backgroundColor: "#ffffff",
    borderTopColor: "#E2E8F0",
  },
  tabBarDark: {
    backgroundColor: "#1E293B",
    borderTopColor: "#334155",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 4,
  },
  tabIcon: {
    fontSize: 16,
    lineHeight: 16,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#6366F1",
  },
  tabTextInactive: {
    color: "#94A3B8",
  },
});
