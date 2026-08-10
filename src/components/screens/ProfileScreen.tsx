import React from "react";
import { View, StyleSheet, Text, Pressable, ScrollView, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";

export const ProfileScreen: React.FC = () => {
  const { userData, analysesList, logoutUser } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Compute metrics
  const totalScans = analysesList.length;
  const fakeScans = analysesList.filter((a) => a.prediction === "fake").length;
  const realScans = analysesList.filter((a) => a.prediction === "real").length;

  const fakePercentage = totalScans > 0 ? ((fakeScans / totalScans) * 100).toFixed(0) : "0";
  const realPercentage = totalScans > 0 ? ((realScans / totalScans) * 100).toFixed(0) : "0";

  return (
    <ScrollView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header Profile Circle */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.email ? userData.email[0].toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={[styles.email, isDark ? styles.textWhite : styles.textDark]}>{userData?.email || "user@example.com"}</Text>
        <Text style={[styles.uid, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          Account ID: #00{userData?.id || "N/A"}
        </Text>
      </View>

      {/* Analytics Card */}
      <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textDark]}>Account Analytics</Text>
      <View style={[styles.analyticsCard, isDark ? styles.cardDark : styles.cardLight]}>
        
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={[styles.statTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Scanned Files</Text>
            <Text style={[styles.statValue, isDark ? styles.textWhite : styles.textDark]}>{totalScans}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Fake Rate</Text>
            <Text style={styles.statValueFake}>{fakePercentage}%</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={[styles.statTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Real Rate</Text>
            <Text style={styles.statValueReal}>{realPercentage}%</Text>
          </View>
        </View>

        {/* Progress ratio visualization */}
        {totalScans > 0 && (
          <View style={styles.ratioBarContainer}>
            <View style={styles.ratioBarBg}>
              <View style={[styles.ratioBarFake, { width: `${fakePercentage}%` }]} />
              <View style={[styles.ratioBarReal, { width: `${realPercentage}%` }]} />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                <Text style={[styles.legendText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Fake ({fakeScans})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.legendText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Real ({realScans})</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Settings Options */}
      <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textDark]}>App Information</Text>
      <View style={[styles.infoList, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, isDark ? styles.textWhite : styles.textDark]}>System Version</Text>
          <Text style={[styles.infoVal, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>v1.2.0 (Stable)</Text>
        </View>
        <View style={[styles.infoItem, styles.borderTop]}>
          <Text style={[styles.infoLabel, isDark ? styles.textWhite : styles.textDark]}>AI Preprocessor</Text>
          <Text style={[styles.infoVal, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>MediaPipe Landmarks</Text>
        </View>
        <View style={[styles.infoItem, styles.borderTop]}>
          <Text style={[styles.infoLabel, isDark ? styles.textWhite : styles.textDark]}>Consensus Engine</Text>
          <Text style={[styles.infoVal, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Majority Vote (4 models)</Text>
        </View>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutBtn} onPress={logoutUser}>
        <Text style={styles.logoutBtnText}>Sign Out Account</Text>
      </Pressable>
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
    alignItems: "center",
    marginVertical: 32,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  email: {
    fontSize: 20,
    fontWeight: "700",
  },
  uid: {
    fontSize: 13,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  analyticsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: "600",
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
  ratioBarContainer: {
    marginTop: 16,
    gap: 12,
  },
  ratioBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    flexDirection: "row",
    overflow: "hidden",
  },
  ratioBarFake: {
    height: 10,
    backgroundColor: "#EF4444",
  },
  ratioBarReal: {
    height: 10,
    backgroundColor: "#10B981",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoList: {
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 36,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoVal: {
    fontSize: 14,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
