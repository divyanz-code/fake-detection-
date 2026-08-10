import React, { useEffect } from "react";
import { View, StyleSheet, Text, Pressable, ScrollView, ActivityIndicator, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

export const HistoryScreen: React.FC = () => {
  const { analysesList, loadAnalyses, navigateTo, setCurrentAnalysis, loading } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleSelectItem = (analysis: any) => {
    setCurrentAnalysis(analysis);
    navigateTo("results");
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.textWhite : styles.textDark]}>Scan History</Text>
        <Text style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          List of all media analyses performed by this account.
        </Text>
      </View>

      {/* List Container */}
      {loading && analysesList.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#6366F1" size="large" />
      ) : analysesList.length === 0 ? (
        <View style={[styles.emptyCard, isDark ? styles.cardDark : styles.cardLight]}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={[styles.emptyTitle, isDark ? styles.textWhite : styles.textDark]}>No scans found</Text>
          <Text style={[styles.emptyDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Run an analysis from the dashboard.
          </Text>
          <Pressable style={styles.newScanBtn} onPress={() => navigateTo("upload")}>
            <Text style={styles.newScanBtnText}>Analyze Image</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {analysesList.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.itemCard, isDark ? styles.cardDark : styles.cardLight]}
              onPress={() => handleSelectItem(item)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemFileIcon}>🖼️</Text>
                <View style={{ flex: 1 }}>
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
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  loader: {
    marginTop: 80,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 40,
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
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
  newScanBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  newScanBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
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
