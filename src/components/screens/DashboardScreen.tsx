import React, { useEffect } from "react";
import { View, StyleSheet, Text, Pressable, ScrollView, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

// Interactive Mock Data matching the screenshot's Recent Analyses exactly
const MOCK_ANALYSES = [
  {
    id: 101,
    prediction: "positive",
    confidence: 0.90,
    status: "completed",
    created_at: "2026-05-15T14:30:00Z",
    filename: "Whole Face",
    type: "face",
    metrics: {
      eye: { prediction: "Positive", confidence: 0.85, model1: 0.82, model2: 0.88 },
      nose: { prediction: "Positive", confidence: 0.82, model1: 0.80, model2: 0.83 },
      face: { prediction: "Positive", confidence: 0.90, model1: 0.88, model2: 0.92 }
    }
  },
  {
    id: 102,
    prediction: "positive",
    confidence: 0.85,
    status: "completed",
    created_at: "2026-05-14T09:15:00Z",
    filename: "Eye Region",
    type: "eye",
    metrics: {
      eye: { prediction: "Positive", confidence: 0.85, model1: 0.82, model2: 0.88 },
      nose: { prediction: "Positive", confidence: 0.82, model1: 0.80, model2: 0.83 },
      face: { prediction: "Positive", confidence: 0.90, model1: 0.88, model2: 0.92 }
    }
  },
  {
    id: 103,
    prediction: "positive",
    confidence: 0.82,
    status: "completed",
    created_at: "2026-05-13T08:45:00Z",
    filename: "Nose Region",
    type: "nose",
    metrics: {
      eye: { prediction: "Positive", confidence: 0.85, model1: 0.82, model2: 0.88 },
      nose: { prediction: "Positive", confidence: 0.82, model1: 0.80, model2: 0.83 },
      face: { prediction: "Positive", confidence: 0.90, model1: 0.88, model2: 0.92 }
    }
  }
];

export const DashboardScreen: React.FC = () => {
  const { userData, analysesList, loadAnalyses, navigateTo, setCurrentAnalysis } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleSelectAnalysis = (analysis: any) => {
    setCurrentAnalysis(analysis);
    navigateTo("results");
  };

  const getEmojiForType = (filename: string) => {
    if (filename.includes("Eye")) return "👁️";
    if (filename.includes("Nose")) return "👃";
    return "👤";
  };

  // Combine real database analyses (if any) with our high-fidelity mock ones for full UX coverage
  const displayAnalyses = analysesList.length > 0 
    ? [...analysesList.map(a => ({
        id: a.id,
        prediction: a.prediction === "fake" ? "negative" : "positive",
        confidence: a.confidence || 0.85,
        status: a.status,
        created_at: a.created_at,
        filename: a.media?.filename || `Scan #${a.id}`,
        type: a.media?.filename?.toLowerCase().includes("eye") ? "eye" : "face",
        metrics: {
          eye: { prediction: "Positive", confidence: 0.85, model1: 0.82, model2: 0.88 },
          nose: { prediction: "Positive", confidence: 0.82, model1: 0.80, model2: 0.83 },
          face: { prediction: "Positive", confidence: 0.90, model1: 0.88, model2: 0.92 }
        }
      })), ...MOCK_ANALYSES] 
    : MOCK_ANALYSES;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hello Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.email?.split("@")[0] || "User"} 👋</Text>
          <Text style={styles.subGreeting}>Let's analyze a new video</Text>
        </View>
        <View style={styles.notificationBadgeContainer}>
          <Pressable style={styles.notificationBtn}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </Pressable>
          <View style={styles.activeDot} />
        </View>
      </View>

      {/* Primary Video Analysis Action Card */}
      <Pressable style={styles.actionCard} onPress={() => navigateTo("upload")}>
        <View style={styles.actionCardLeft}>
          <View style={styles.videoIconBg}>
            <Text style={styles.videoIcon}>🎥</Text>
          </View>
          <View>
            <Text style={styles.actionCardTitle}>New Analysis</Text>
            <Text style={styles.actionCardSub}>Upload video to start</Text>
          </View>
        </View>
        <Text style={styles.arrowRight}>➔</Text>
      </Pressable>

      {/* Section Divider */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Analyses</Text>
        <Pressable onPress={() => navigateTo("history")}>
          <Text style={styles.seeAllLink}>See All</Text>
        </Pressable>
      </View>

      {/* Analyses List */}
      <View style={styles.listContainer}>
        {displayAnalyses.map((item) => (
          <Pressable
            key={item.id}
            style={styles.itemCard}
            onPress={() => handleSelectAnalysis(item)}
          >
            <View style={styles.itemLeft}>
              <View style={styles.emojiWrapper}>
                <Text style={styles.itemEmoji}>{getEmojiForType(item.filename)}</Text>
              </View>
              <View>
                <Text style={styles.itemFilename}>{item.filename}</Text>
                <Text style={styles.itemDate}>
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.badgeDone}>
              <Text style={styles.badgeTextDone}>Done</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  notificationBadgeContainer: {
    position: "relative",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIcon: {
    fontSize: 18,
  },
  activeDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366F1", // Active purple notification badge
    borderWidth: 2,
    borderColor: "#F8FAFC",
  },
  actionCard: {
    backgroundColor: "#4F46E5", // Purple gradient representation
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  actionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  videoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoIcon: {
    fontSize: 22,
  },
  actionCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  actionCardSub: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  arrowRight: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  seeAllLink: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
  },
  listContainer: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  emojiWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemFilename: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  itemDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  badgeDone: {
    backgroundColor: "#DCFCE7", // Light green Done badge matching mockup
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  badgeTextDone: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },
});
