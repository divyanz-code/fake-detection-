import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, Image, ScrollView, useColorScheme } from "react-native";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export const ResultsScreen: React.FC = () => {
  const { currentAnalysis, navigateTo } = useApp();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight, styles.center]}>
        <Text style={isDark ? styles.textWhite : styles.textDark}>No active analysis record found.</Text>
        <Pressable style={styles.backBtn} onPress={() => navigateTo("dashboard")}>
          <Text style={styles.backBtnText}>Return to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  const { id, prediction, confidence, predictions } = currentAnalysis;
  const isFake = prediction === "fake";
  
  // Format percentage helper
  const toPercentage = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  // Helper to resolve sub-model predictions
  const getSubModel = (name: string) => {
    return predictions?.find((p: any) => p.model_name === name) || {
      prediction: "unknown",
      confidence: 0,
      score_real: 0.5,
      score_fake: 0.5
    };
  };

  const renderRegionCard = (name: string, title: string) => {
    const sub = getSubModel(name);
    const subIsFake = sub.prediction === "fake";
    
    // Resolve static crop file URL from backend
    const cropUrl = api.getBackendUrl(`/static/crops/crop_${name}_${id}.png`);

    return (
      <Pressable 
        key={name}
        style={[styles.regionCard, isDark ? styles.cardDark : styles.cardLight]}
        onPress={() => setSelectedRegion(selectedRegion === name ? null : name)}
      >
        <View style={styles.regionRow}>
          <Image source={{ uri: cropUrl }} style={styles.cropThumb} />
          
          <View style={styles.regionMeta}>
            <Text style={[styles.regionTitle, isDark ? styles.textWhite : styles.textDark]}>{title}</Text>
            <View style={subIsFake ? styles.miniBadgeFake : styles.miniBadgeReal}>
              <Text style={subIsFake ? styles.miniBadgeTextFake : styles.miniBadgeTextReal}>
                {sub.prediction?.toUpperCase()} ({toPercentage(sub.confidence)})
              </Text>
            </View>
          </View>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                subIsFake ? styles.barFake : styles.barReal,
                { width: toPercentage(sub.confidence) }
              ]} 
            />
          </View>
        </View>

        {/* Expanded View detailing specific probabilities */}
        {selectedRegion === name && (
          <View style={styles.expandedContent}>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Authentic Score</Text>
              <Text style={styles.scoreValReal}>{toPercentage(sub.score_real)}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>Manipulated Score</Text>
              <Text style={styles.scoreValFake}>{toPercentage(sub.score_fake)}</Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigateTo("dashboard")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </Pressable>
        <Text style={[styles.title, isDark ? styles.textWhite : styles.textDark]}>Scan Results</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Main Consensus Result Banner */}
      <View style={[styles.banner, isFake ? styles.bannerFake : styles.bannerReal]}>
        <Text style={styles.bannerEmoji}>{isFake ? "🚨" : "🛡️"}</Text>
        <Text style={styles.bannerTitle}>{isFake ? "MODIFIED FACE DETECTED" : "AUTHENTIC FACE VERIFIED"}</Text>
        <Text style={styles.bannerSubtitle}>
          Voting consensus confidence: {toPercentage(confidence)}
        </Text>
      </View>

      {/* Region Grid Header */}
      <Text style={[styles.sectionTitle, isDark ? styles.textWhite : styles.textDark]}>Regional Model Reports</Text>
      <Text style={[styles.sectionSubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
        Click on any region below to see detailed classification scores.
      </Text>

      {/* Crops List */}
      <View style={styles.regionsList}>
        {renderRegionCard("face", "Whole Face (ViT Model)")}
        {renderRegionCard("eye", "Eye Features (CNN Model)")}
        {renderRegionCard("nose", "Nose Features (CNN Model)")}
        {renderRegionCard("lips", "Lips Features (CNN Model)")}
      </View>

      {/* Action Footer */}
      <Pressable style={styles.primaryBtn} onPress={() => navigateTo("upload")}>
        <Text style={styles.primaryBtnText}>Analyze Another Media</Text>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
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
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: "#6366F1",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
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
  banner: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  bannerReal: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  bannerFake: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  bannerEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  regionsList: {
    gap: 16,
    marginBottom: 32,
  },
  regionCard: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardDark: {
    backgroundColor: "#1E293B",
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cropThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  regionMeta: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
  },
  regionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  miniBadgeFake: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  miniBadgeTextFake: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
  },
  miniBadgeReal: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  miniBadgeTextReal: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  progressContainer: {
    height: 6,
    width: "100%",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  barReal: {
    backgroundColor: "#10B981",
  },
  barFake: {
    backgroundColor: "#EF4444",
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
    marginTop: 4,
    gap: 8,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  scoreValReal: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },
  scoreValFake: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
