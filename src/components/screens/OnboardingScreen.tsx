import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, Dimensions, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "AI Face Analysis",
    description: "Deep learning models inspect visual cues in facial regions to determine real vs manipulated content.",
    icon: "🔬",
  },
  {
    title: "Multi-Region Inspection",
    description: "We extract and analyze the eyes, nose, lips, and whole face individually for targeted abnormalities.",
    icon: "🎯",
  },
  {
    title: "Majority Voting Engine",
    description: "Our system combines regional predictions using a voting model to yield high-certainty classifications.",
    icon: "⚖️",
  },
];

export const OnboardingScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      navigateTo("login");
    }
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={[styles.brandText, isDark ? styles.textWhite : styles.textDark]}>
          Aegis<Text style={styles.brandAccent}>Face</Text>
        </Text>
      </View>

      {/* Slide Content */}
      <View style={styles.slideContainer}>
        <Text style={styles.slideIcon}>{slides[activeSlide].icon}</Text>
        <Text style={[styles.slideTitle, isDark ? styles.textWhite : styles.textDark]}>
          {slides[activeSlide].title}
        </Text>
        <Text style={[styles.slideDescription, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          {slides[activeSlide].description}
        </Text>
      </View>

      {/* Slide Indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicator,
              activeSlide === i ? styles.indicatorActive : styles.indicatorInactive,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <Pressable style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {activeSlide === slides.length - 1 ? "Get Started" : "Continue"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
  },
  bgLight: {
    backgroundColor: "#ffffff",
  },
  bgDark: {
    backgroundColor: "#0F172A",
  },
  header: {
    marginTop: 48,
  },
  brandText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: "#6366F1",
  },
  textWhite: {
    color: "#ffffff",
  },
  textDark: {
    color: "#0F172A",
  },
  slideContainer: {
    alignItems: "center",
    maxWidth: 320,
    gap: 16,
  },
  slideIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  slideDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  textSecondaryLight: {
    color: "#4B5563",
  },
  textSecondaryDark: {
    color: "#9CA3AF",
  },
  indicatorContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginVertical: 24,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: "#6366F1",
  },
  indicatorInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: "stretch",
    alignItems: "center",
    marginBottom: 36,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
