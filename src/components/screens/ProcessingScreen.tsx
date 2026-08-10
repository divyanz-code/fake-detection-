import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Pressable, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

export const ProcessingScreen: React.FC = () => {
  const { currentAnalysis, loadAnalysisDetail, navigateTo, error } = useApp();
  const [pollCount, setPollCount] = useState(0);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Polling effect
  useEffect(() => {
    if (!currentAnalysis?.id) return;
    
    // Poll every 1 second
    const timer = setInterval(() => {
      loadAnalysisDetail(currentAnalysis.id);
      setPollCount((prev) => prev + 1);
    }, 1200);

    return () => clearInterval(timer);
  }, [currentAnalysis?.id, pollCount]);

  // Handle completion state redirection
  useEffect(() => {
    if (currentAnalysis?.status === "completed") {
      navigateTo("results");
    }
  }, [currentAnalysis?.status]);

  const backendStatus = currentAnalysis?.status || "queued";

  // Get state for each step based on the actual backend status
  const getStepState = (stepIndex: number) => {
    // Steps mapping:
    // 0: Uploading
    // 1: Preprocessing & Alignment
    // 2: Region Crop & Face Detection
    // 3: Keras Model Inference
    // 4: Majority Voting Engine
    
    const statusSequence = [
      ["queued", "uploading"],
      ["preprocessing", "processing"],
      ["face_detection"],
      ["model_inference"],
      ["voting"],
    ];

    let activeIndex = -1;
    for (let i = 0; i < statusSequence.length; i++) {
      if (statusSequence[i].includes(backendStatus)) {
        activeIndex = i;
        break;
      }
    }

    if (backendStatus === "completed") {
      return "completed";
    }
    if (backendStatus === "failed") {
      return "failed";
    }

    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "pending";
  };

  const renderStep = (title: string, index: number) => {
    const state = getStepState(index);
    let dotStyle = styles.dotPending;
    let dotText = "○";
    let titleStyle = styles.stepTitlePending;

    if (state === "completed") {
      dotStyle = styles.dotCompleted;
      dotText = "✓";
      titleStyle = isDark ? styles.stepTitleCompletedDark : styles.stepTitleCompletedLight;
    } else if (state === "active") {
      dotStyle = styles.dotActive;
      dotText = "●";
      titleStyle = isDark ? styles.stepTitleActiveDark : styles.stepTitleActiveLight;
    }

    return (
      <View key={index} style={styles.stepRow}>
        <View style={[styles.dotContainer, dotStyle]}>
          {state === "active" && index !== 4 ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.dotText}>{dotText}</Text>
          )}
        </View>
        <Text style={[styles.stepTitle, titleStyle]}>{title}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textWhite : styles.textDark]}>Analyzing Face</Text>
      </View>

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {backendStatus === "failed" || error ? (
          <View style={styles.failedCard}>
            <Text style={styles.failedIcon}>⚠️</Text>
            <Text style={styles.failedTitle}>Analysis Failed</Text>
            <Text style={styles.failedText}>
              {error || "An error occurred during facial extraction or model inference. Please try another image with a clear face."}
            </Text>
            <Pressable style={styles.backBtn} onPress={() => navigateTo("upload")}>
              <Text style={styles.backBtnText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stepsList}>
            {renderStep("Uploading Media", 0)}
            {renderStep("Facial Alignment & CLAHE Enhancer", 1)}
            {renderStep("Facial Region Cropping", 2)}
            {renderStep("Deep Learning Inference (CNN & ViT)", 3)}
            {renderStep("Voting Engine Consensus", 4)}
          </View>
        )}
      </View>

      {/* Info Footer */}
      {backendStatus !== "failed" && !error && (
        <View style={styles.footer}>
          <ActivityIndicator color="#6366F1" style={{ marginBottom: 12 }} />
          <Text style={[styles.footerText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Processing image... this usually takes less than 5 seconds.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: "space-between",
  },
  bgLight: {
    backgroundColor: "#F8FAFC",
  },
  bgDark: {
    backgroundColor: "#0F172A",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  textWhite: {
    color: "#ffffff",
  },
  textDark: {
    color: "#0F172A",
  },
  textSecondaryLight: {
    color: "#64748B",
  },
  textSecondaryDark: {
    color: "#94A3B8",
  },
  stepsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepsList: {
    gap: 28,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dotContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dotPending: {
    borderWidth: 2,
    borderColor: "#94A3B8",
    backgroundColor: "transparent",
  },
  dotActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
    borderWidth: 2,
  },
  dotCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
    borderWidth: 2,
  },
  dotText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  stepTitlePending: {
    color: "#94A3B8",
  },
  stepTitleActiveLight: {
    color: "#0F172A",
    fontWeight: "700",
  },
  stepTitleActiveDark: {
    color: "#ffffff",
    fontWeight: "700",
  },
  stepTitleCompletedLight: {
    color: "#475569",
  },
  stepTitleCompletedDark: {
    color: "#CBD5E1",
  },
  failedCard: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  failedIcon: {
    fontSize: 48,
  },
  failedTitle: {
    color: "#991B1B",
    fontSize: 18,
    fontWeight: "700",
  },
  failedText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  backBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 48,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
});
