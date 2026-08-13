import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import { Image } from "expo-image";
import { useApp } from "../../context/AppContext";

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar from 0 to 1 over 2500ms
    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        navigateTo("onboarding");
      }
    });
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Centered Graphic */}
      <View style={styles.graphicContainer}>
        <Image
          source={require("../../../assets/images/splash_face_wireframe.png")}
          style={styles.image}
          contentFit="contain"
        />
      </View>

      {/* Brand & Subtitle */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Face Analysis</Text>
        <Text style={styles.subtitle}>AI-Powered Face Region Analysis</Text>
      </View>

      {/* Progress/Loading Bar */}
      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#120B38", // Deep dark purple background matching screenshot 1
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  graphicContainer: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: 260,
    height: 260,
    opacity: 0.95,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    gap: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#A29DBE", // Soft light purple
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  loaderContainer: {
    width: "70%",
    maxWidth: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8F7CFF", // Glowing purple progress indicator
    borderRadius: 3,
  },
});
