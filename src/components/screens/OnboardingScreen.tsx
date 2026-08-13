import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useApp } from "../../context/AppContext";

export const OnboardingScreen: React.FC = () => {
  const { navigateTo } = useApp();

  const handleNext = () => {
    navigateTo("login");
  };

  return (
    <View style={styles.container}>
      {/* Title & Subtitle */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>AI Face Analysis</Text>
        <Text style={styles.subtitle}>
          We analyze key facial regions for accurate predictions.
        </Text>
      </View>

      {/* Centered Avatar with Scan Corners Overlay */}
      <View style={styles.illustrationContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require("../../../assets/images/onboarding_avatar.png")}
            style={styles.avatar}
            contentFit="cover"
          />
          {/* Target Scanning Corners */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Next Button */}
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  title: {
    color: "#1E1B4B", // Dark navy/indigo
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#6B7280", // Slate gray
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  avatarWrapper: {
    width: 200,
    height: 200,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#4F46E5", // Purple scanning brackets
    borderWidth: 0,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  indicatorContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB", // Inactive gray dot
  },
  dotActive: {
    width: 18,
    backgroundColor: "#4F46E5", // Active purple pill
  },
  button: {
    backgroundColor: "#4F46E5", // Solid primary purple
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: "stretch",
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
});
