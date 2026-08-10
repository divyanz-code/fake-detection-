import React, { useEffect } from "react";
import { View, StyleSheet, Text, Pressable, ScrollView, ActivityIndicator, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

export const DashboardScreen: React.FC = () => {
  const { userData, analysesList, loadAnalyses, navigateTo, setCurrentAnalysis, loading } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Load history list on render
  useEffect(() => {
    loadAnalyses();
  }, []);

  // Compute local metrics from the list
  const totalScans = analysesList.length;
  const fakeScans = analysesList.filter((a) => a.prediction === "fake").length;
  const realScans = analysesList.filter((a) => a.prediction === "real").length;

  const handleSelectRecent = (analysis: any) => {
    setCurrentAnalysis(analysis);
    navigateTo("results");
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingSub, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Welcome Back</Text>
          <Text style={[styles.greeting, isDark ? styles.textWhite : styles.textDark]}>
            {userData?.email?.split("@")[0] || "User"}
          </Text>
        </View>
        <Text style={styles.headerIcon}>🛡️</Text>
      </View>

      {/* Main Action Banner */}
      <Pressable style={styles.actionCard} onPress={() => navigateTo("upload")}>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Scan New Media</Text>
          <Text style={styles.actionCardDesc}>Analyze image files for deepfake or AI face manipulations.</Text>
          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Start Analysis</Text>
          </View>
        </View>
      </Pressable>

      {/* Stats Counter Section */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.statEmoji}>📊</Text>
          <Text style={[styles.statValue, isDark ? styles.textWhite : styles.textDark]}>{totalScans}</Text>
          <Text style={[styles.statLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Total Scans</Text>
        </View>
        
        <View style={[styles.statCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.statEmoji}>🔴</Text>
          <Text style={styles.statValueFake}>{fakeScans}</Text>
          <Text style={[styles.statLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Fake Detected</Text>
        </View>

        <View style={[styles.statCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.statEmoji}>🟢</Text>
          <Text style={styles.statValueReal}>{realScans}</Text>
          <Text style={[styles.statLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Real Verified</Text>
        </View>
      </View>

      {/* Recent Analyses Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textDark]}>Recent Analyses</Text>
        <Pressable onPress={() => navigateTo("history")}>
          <Text style={styles.seeAllLink}>See All</Text>
        </Pressable>
      </View>

      {/* Analyses List */}
      {loading && analysesList.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#6366F1" size="large" />
      ) : analysesList.length === 0 ? (
        <View style={[styles.emptyCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textDark]}>No analyses yet</Text>
          <Text style={[styles.emptyDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Upload an image to start face detection.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {analysesList.slice(0, 5).map((item) => (
            <Pressable
              key={item.id}
              style={[styles.itemCard, isDark ? styles.cardDark : styles.cardLight]}
              onPress={() => handleSelectRecent(item)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemFileIcon}>🖼️</Text>
                <View>
                  <Text style={[styles.itemFilename, isDark ? styles.textWhite : styles.textDark]} numberOfLines={1}>
                    {item.media?.filename || `Scan #${item.id}`}
                  </Text>
                  <Text style={[styles.itemDate, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemRight}>
                {item.status === "completed" ? (
                  <View style={item.prediction === "fake" ? styles.badgeFake : styles.badgeReal}>
                    <Text style={item.prediction === "fake" ? styles.badgeTextFake : styles.badgeTextReal}>
                      {item.prediction ? item.prediction.toUpperCase() : "UNKNOWN"}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.badgeProgress}>
                    <Text style={styles.badgeTextProgress}>RUNNING</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  bgLight: {
    backgroundColor: "#F8FAFC",
  },
  bgDark: {
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: "500",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  headerIcon: {
    fontSize: 32,
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
  actionCard: {
    backgroundColor: "#6366F1",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionCardContent: {
    gap: 8,
  },
  actionCardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  actionCardDesc: {
    color: "#E0E7FF",
    fontSize: 14,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  actionBtnText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 4,
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statValueFake: {
    fontSize: 22,
    fontWeight: "700",
    color: "#EF4444",
  },
  statValueReal: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllLink: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemFileIcon: {
    fontSize: 24,
  },
  itemFilename: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 180,
  },
  itemDate: {
    fontSize: 12,
    marginTop: 2,
  },
  itemRight: {
    marginLeft: 12,
  },
  badgeFake: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeTextFake: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeReal: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeTextReal: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeProgress: {
    backgroundColor: "#DBEAFE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeTextProgress: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
  },
});
