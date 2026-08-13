import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Pressable } from "react-native";
import { useApp } from "../../context/AppContext";

export const ProcessingScreen: React.FC = () => {
  const { currentAnalysis, loadAnalysisDetail, navigateTo, error } = useApp();
  const [percent, setPercent] = useState(10);
  const [pollCount, setPollCount] = useState(0);

  // Polling hook to query backend
  useEffect(() => {
    if (!currentAnalysis?.id) return;
    const timer = setInterval(() => {
      loadAnalysisDetail(currentAnalysis.id);
      setPollCount((prev) => prev + 1);
    }, 1200);

    return () => clearInterval(timer);
  }, [currentAnalysis?.id, pollCount]);

  // Handle completion routing
  useEffect(() => {
    if (currentAnalysis?.status === "completed") {
      setPercent(100);
      const delay = setTimeout(() => {
        navigateTo("results");
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [currentAnalysis?.status]);

  // Simulate smooth percentage progress up to 95%
  useEffect(() => {
    if (percent >= 95) return;
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 95) return 95;
        // Increment faster in the beginning, slower as we approach 95%
        const inc = prev < 50 ? 5 : prev < 80 ? 2 : 1;
        return prev + inc;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [percent]);

  const backendStatus = currentAnalysis?.status || "queued";

  // Map backend status to processing steps (0 to 4)
  const getStepState = (stepIndex: number) => {
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

    if (backendStatus === "completed") return "completed";
    if (backendStatus === "failed") return "failed";

    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "pending";
  };

  const renderStepRow = (title: string, index: number) => {
    const state = getStepState(index);

    let iconComponent;
    let labelStyle: any = styles.stepTextPending;

    if (state === "completed") {
      iconComponent = (
        <View style={styles.checkWrapper}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      );
      labelStyle = styles.stepTextCompleted;
    } else if (state === "active") {
      iconComponent = (
        <View style={styles.activeDotWrapper}>
          <View style={styles.activeDotInner} />
        </View>
      );
      labelStyle = styles.stepTextActive;
    } else {
      iconComponent = <View style={styles.pendingDot} />;
    }

    return (
      <View key={index} style={styles.stepRow}>
        {iconComponent}
        <Text style={labelStyle}>{title}</Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <Pressable style={styles.backBtn} onPress={() => navigateTo("dashboard")}>
          <Text style={styles.backBtnText}>Return to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Processing Video</Text>
        <Text style={styles.subtitle}>Our AI is analyzing your video</Text>
      </View>

      {/* Circular Progress Ring */}
      <View style={styles.progressContainer}>
        <View style={styles.circleBg}>
          {/* Inner Text */}
          <Text style={styles.percentageText}>{percent}%</Text>
        </View>
      </View>

      {/* Checklist Steps */}
      <View style={styles.stepsList}>
        {renderStepRow("Preprocessing", 0)}
        {renderStepRow("Eye Analysis", 1)}
        {renderStepRow("Nose Analysis", 2)}
        {renderStepRow("Face Analysis", 3)}
        {renderStepRow("Combining Results", 4)}
      </View>

      {/* Disclaimer */}
      <Text style={styles.footerText}>Please don't close the app</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: "center",
    justifyContent: "space-between",
  },
  center: {
    justifyContent: "center",
    gap: 16,
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
  progressContainer: {
    marginVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  circleBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: "#EEF2F6", // Outer ring track
    borderLeftColor: "#4F46E5", // Simulating progress on the border
    borderTopColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  percentageText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  stepsList: {
    width: "100%",
    maxWidth: 280,
    gap: 18,
    marginVertical: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#22C55E", // Green check wrapper
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  activeDotWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5", // Purple active center
  },
  pendingDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E5E7EB", // Empty pending track
    backgroundColor: "#FFFFFF",
  },
  stepTextCompleted: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  stepTextActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5", // Purple highlighted active step
  },
  stepTextPending: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#EF4444",
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  backBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
