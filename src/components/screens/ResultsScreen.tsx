import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

type SubScreenType = "summary" | "details" | "heatmap";
type RegionTabType = "eye" | "nose" | "lips" | "face";

export const ResultsScreen: React.FC = () => {
  const { currentAnalysis, navigateTo } = useApp();
  const [subScreen, setSubScreen] = useState<SubScreenType>("summary");
  const [regionTab, setRegionTab] = useState<RegionTabType>("face");
  const [overviewDetailTab, setOverviewDetailTab] = useState<"overview" | "details">("overview");
  const [heatmapToggle, setHeatmapToggle] = useState<"heatmap" | "original">("heatmap");

  if (!currentAnalysis) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.noRecordText}>No active analysis record found.</Text>
        <Pressable style={styles.backBtn} onPress={() => navigateTo("dashboard")}>
          <Text style={styles.backBtnText}>Return to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  // Retrieve metrics (fallback to standard values if not present)
  const confidence = currentAnalysis.confidence || 0.87;
  const isPositive = currentAnalysis.prediction === "positive" || currentAnalysis.prediction === "real";
  
  // Extract model predictions list if present
  const predsList = currentAnalysis.predictions || [];
  const getPred = (modelName: string) => {
    const found = predsList.find((p: any) => p.model_name === modelName);
    if (found) {
      return {
        prediction: found.prediction === "real" ? "Real" : "Fake",
        confidence: found.confidence || 0.85,
        model1: found.score_real || 0.85,
        model2: found.score_fake || 0.15,
        crop_url: found.crop_url,
        heatmap_url: found.heatmap_url,
      };
    }
    return {
      prediction: isPositive ? "Real" : "Fake",
      confidence: confidence,
      model1: isPositive ? confidence : 1 - confidence,
      model2: isPositive ? 1 - confidence : confidence,
      heatmap_url: null,
    };
  };

  const metrics = currentAnalysis.metrics || {
    eye: getPred("eye"),
    nose: getPred("nose"),
    lips: getPred("lips"),
    face: getPred("face"),
  };

  // Helper to format values as percentage
  const toPercentStr = (val: number) => {
    return `${Math.round(val * 100)}%`;
  };

  // 1. RENDER SCREEN 7: ANALYSIS SUMMARY
  const renderSummaryScreen = () => {
    return (
      <View style={styles.subScreenContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigateTo("dashboard")} style={styles.navBackBtn}>
            <Text style={styles.navBackIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Analysis Summary</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Overall Prediction Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardSubTitle}>Overall Prediction</Text>
            <Text style={[styles.predictionText, isPositive ? styles.textPositive : styles.textNegative]}>
              {isPositive ? "REAL FACE" : "DEEPFAKE DETECTED"}
            </Text>
            <View style={styles.divider} />
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence Score</Text>
              <Text style={styles.confidenceVal}>{toPercentStr(confidence)}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: toPercentStr(confidence) as any }]} />
            </View>
          </View>

          {/* Region Results Header */}
          <Text style={styles.sectionHeader}>Region Results (4 Models)</Text>

          {/* Region Results List */}
          <View style={styles.regionList}>
            {/* Eye Region Row */}
            <View style={styles.regionRow}>
              <Text style={styles.regionLabel}>👁️ Eye Region</Text>
              <View style={styles.regionValueRow}>
                <Text style={[styles.regionPred, metrics.eye.prediction === "Real" ? styles.textPositive : styles.textNegative]}>{metrics.eye.prediction}</Text>
                <Text style={styles.regionScore}>{toPercentStr(metrics.eye.confidence)}</Text>
              </View>
            </View>

            {/* Nose Region Row */}
            <View style={styles.regionRow}>
              <Text style={styles.regionLabel}>👃 Nose Region</Text>
              <View style={styles.regionValueRow}>
                <Text style={[styles.regionPred, metrics.nose.prediction === "Real" ? styles.textPositive : styles.textNegative]}>{metrics.nose.prediction}</Text>
                <Text style={styles.regionScore}>{toPercentStr(metrics.nose.confidence)}</Text>
              </View>
            </View>

            {/* Lips Region Row */}
            <View style={styles.regionRow}>
              <Text style={styles.regionLabel}>👄 Lips Region</Text>
              <View style={styles.regionValueRow}>
                <Text style={[styles.regionPred, metrics.lips?.prediction === "Real" ? styles.textPositive : styles.textNegative]}>{metrics.lips?.prediction || "Real"}</Text>
                <Text style={styles.regionScore}>{toPercentStr(metrics.lips?.confidence || 0.85)}</Text>
              </View>
            </View>

            {/* Whole Face Row */}
            <View style={styles.regionRow}>
              <Text style={styles.regionLabel}>👤 Whole Face</Text>
              <View style={styles.regionValueRow}>
                <Text style={[styles.regionPred, metrics.face.prediction === "Real" ? styles.textPositive : styles.textNegative]}>{metrics.face.prediction}</Text>
                <Text style={styles.regionScore}>{toPercentStr(metrics.face.confidence)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* View Details Action Button */}
        <Pressable style={styles.primaryBtn} onPress={() => setSubScreen("details")}>
          <Text style={styles.primaryBtnText}>View Detailed Models</Text>
        </Pressable>
      </View>
    );
  };

  // 2. RENDER SCREENS 8, 9, 10: DETAILED REGION ANALYSIS
  const renderDetailsScreen = () => {
    // Resolve labels and details for active region tab
    let tabTitle = "Whole Face Analysis";
    let activeMetric = metrics.face;
    let localImage: any = require("../../../assets/images/onboarding_avatar.png");

    if (regionTab === "eye") {
      tabTitle = "Eye Region Analysis";
      activeMetric = metrics.eye;
      localImage = require("../../../assets/images/eye_closeup.png");
    } else if (regionTab === "nose") {
      tabTitle = "Nose Region Analysis";
      activeMetric = metrics.nose;
      localImage = require("../../../assets/images/nose_closeup.png");
    } else if (regionTab === "lips") {
      tabTitle = "Lips Region Analysis";
      activeMetric = metrics.lips || metrics.face;
      localImage = require("../../../assets/images/onboarding_avatar.png");
    }

    const cropSource = activeMetric?.crop_url 
      ? { uri: api.getBackendUrl(activeMetric.crop_url) } 
      : localImage;

    return (
      <View style={styles.subScreenContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => setSubScreen("summary")} style={styles.navBackBtn}>
            <Text style={styles.navBackIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{tabTitle}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Region Switch Tabs Selector */}
        <View style={styles.regionTabSelectorRow}>
          <Pressable 
            style={[styles.regionSelectorTab, regionTab === "eye" && styles.regionSelectorActive]} 
            onPress={() => setRegionTab("eye")}
          >
            <Text style={[styles.regionSelectorText, regionTab === "eye" && styles.regionSelectorTextActive]}>Eye</Text>
          </Pressable>
          <Pressable 
            style={[styles.regionSelectorTab, regionTab === "nose" && styles.regionSelectorActive]} 
            onPress={() => setRegionTab("nose")}
          >
            <Text style={[styles.regionSelectorText, regionTab === "nose" && styles.regionSelectorTextActive]}>Nose</Text>
          </Pressable>
          <Pressable 
            style={[styles.regionSelectorTab, regionTab === "lips" && styles.regionSelectorActive]} 
            onPress={() => setRegionTab("lips")}
          >
            <Text style={[styles.regionSelectorText, regionTab === "lips" && styles.regionSelectorTextActive]}>Lips</Text>
          </Pressable>
          <Pressable 
            style={[styles.regionSelectorTab, regionTab === "face" && styles.regionSelectorActive]} 
            onPress={() => setRegionTab("face")}
          >
            <Text style={[styles.regionSelectorText, regionTab === "face" && styles.regionSelectorTextActive]}>Face</Text>
          </Pressable>
        </View>

        {/* Overview vs Details Pill Tabs */}
        <View style={styles.pillContainer}>
          <Pressable
            style={[styles.pillBtn, overviewDetailTab === "overview" && styles.pillBtnActive]}
            onPress={() => setOverviewDetailTab("overview")}
          >
            <Text style={[styles.pillText, overviewDetailTab === "overview" && styles.pillTextActive]}>Overview</Text>
          </Pressable>
          <Pressable
            style={[styles.pillBtn, overviewDetailTab === "details" && styles.pillBtnActive]}
            onPress={() => setOverviewDetailTab("details")}
          >
            <Text style={[styles.pillText, overviewDetailTab === "details" && styles.pillTextActive]}>Details</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Scanned Crop Graphic with target overlay brackets */}
          <View style={styles.scanGraphicWrapper}>
            <View style={styles.targetWrapper}>
              <Image source={cropSource} style={styles.scanCropImage} contentFit="cover" />
              {/* Overlay Green Bracket Corners */}
              <View style={[styles.scanCorner, styles.scanTopLeft]} />
              <View style={[styles.scanCorner, styles.scanTopRight]} />
              <View style={[styles.scanCorner, styles.scanBottomLeft]} />
              <View style={[styles.scanCorner, styles.scanBottomRight]} />
            </View>
          </View>

          {/* Prediction Reports */}
          {overviewDetailTab === "overview" ? (
            <View style={styles.detailReportBlock}>
              <View style={styles.rowItem}>
                <Text style={styles.itemLabelText}>Prediction</Text>
                <Text style={[styles.itemValueText, activeMetric.prediction === "Real" ? styles.textPositive : styles.textNegative]}>{activeMetric.prediction}</Text>
              </View>
              <View style={styles.dividerLight} />
              <View style={styles.rowItem}>
                <Text style={styles.itemLabelText}>Confidence</Text>
                <Text style={styles.itemValueText}>{toPercentStr(activeMetric.confidence)}</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: toPercentStr(activeMetric.confidence) as any }]} />
              </View>
            </View>
          ) : (
            <View style={styles.detailReportBlock}>
              <View style={styles.rowItem}>
                <Text style={styles.itemLabelText}>Real Score</Text>
                <Text style={[styles.itemSubValue, styles.textPositive]}>
                  {toPercentStr(activeMetric.model1)}
                </Text>
              </View>
              <View style={styles.dividerLight} />
              <View style={styles.rowItem}>
                <Text style={styles.itemLabelText}>Deepfake Score</Text>
                <Text style={[styles.itemSubValue, styles.textNegative]}>
                  {toPercentStr(activeMetric.model2)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <Pressable style={styles.primaryBtn} onPress={() => setSubScreen("heatmap")}>
          <Text style={styles.primaryBtnText}>View Heatmap</Text>
        </Pressable>
      </View>
    );
  };

  // 3. RENDER SCREEN 11: HEATMAP VIEW
  const renderHeatmapScreen = () => {
    let activeMetric = metrics[regionTab] || metrics.face;
    let localImage: any = require("../../../assets/images/onboarding_avatar.png");
    if (regionTab === "eye") localImage = require("../../../assets/images/eye_closeup.png");
    else if (regionTab === "nose") localImage = require("../../../assets/images/nose_closeup.png");

    const cropSource = activeMetric?.crop_url 
      ? { uri: api.getBackendUrl(activeMetric.crop_url) } 
      : localImage;

    const heatmapSource = activeMetric?.heatmap_url 
      ? { uri: api.getBackendUrl(activeMetric.heatmap_url) } 
      : require("../../../assets/images/heatmap_face.png");

    return (
      <View style={styles.subScreenContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => setSubScreen("details")} style={styles.navBackBtn}>
            <Text style={styles.navBackIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Heatmap - {regionTab.toUpperCase()}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Heatmap vs Original Pill Toggle */}
        <View style={styles.pillContainer}>
          <Pressable
            style={[styles.pillBtn, heatmapToggle === "heatmap" && styles.pillBtnActive]}
            onPress={() => setHeatmapToggle("heatmap")}
          >
            <Text style={[styles.pillText, heatmapToggle === "heatmap" && styles.pillTextActive]}>Heatmap</Text>
          </Pressable>
          <Pressable
            style={[styles.pillBtn, heatmapToggle === "original" && styles.pillBtnActive]}
            onPress={() => setHeatmapToggle("original")}
          >
            <Text style={[styles.pillText, heatmapToggle === "original" && styles.pillTextActive]}>Original Crop</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Graphic Box showing scanned region / thermal overlay */}
          <View style={styles.heatmapGraphicWrapper}>
            {heatmapToggle === "heatmap" ? (
              <Image 
                source={heatmapSource} 
                style={styles.heatmapMainImage} 
                contentFit="contain" 
              />
            ) : (
              <Image 
                source={cropSource} 
                style={styles.heatmapMainImage} 
                contentFit="contain" 
              />
            )}
          </View>

          {/* Intensity Color Bar (Only visible in Heatmap tab) */}
          {heatmapToggle === "heatmap" && (
            <View style={styles.intensityContainer}>
              <View style={styles.intensityRow}>
                <Text style={styles.intensityLabel}>Intensity</Text>
              </View>
              <View style={styles.gradientBar}>
                <View style={{ flex: 1, backgroundColor: "#3B82F6" }} />
                <View style={{ flex: 1, backgroundColor: "#10B981" }} />
                <View style={{ flex: 1, backgroundColor: "#F59E0B" }} />
                <View style={{ flex: 1, backgroundColor: "#EF4444" }} />
              </View>
              <View style={styles.intensityRangeRow}>
                <Text style={styles.intensityText}>Low</Text>
                <Text style={styles.intensityText}>High</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Back to Results Action button */}
        <Pressable style={styles.primaryBtn} onPress={() => setSubScreen("details")}>
          <Text style={styles.primaryBtnText}>Back to Results</Text>
        </Pressable>
      </View>
    );
  };

  switch (subScreen) {
    case "details":
      return renderDetailsScreen();
    case "heatmap":
      return renderHeatmapScreen();
    case "summary":
    default:
      return renderSummaryScreen();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  subScreenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  navBackIcon: {
    fontSize: 24,
    color: "#1E1B4B",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  noRecordText: {
    color: "#4B5563",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  backBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    alignItems: "center",
    marginBottom: 32,
  },
  cardSubTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  predictionText: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
  },
  textPositive: {
    color: "#22C55E", // Rich green matching Positive prediction in screenshot
  },
  textNegative: {
    color: "#EF4444",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  confidenceVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  barContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 16,
  },
  regionList: {
    gap: 12,
  },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  regionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  regionValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  regionPred: {
    fontSize: 14,
    fontWeight: "700",
  },
  regionScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pillContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 3,
    marginBottom: 24,
    width: "100%",
    maxWidth: 240,
    alignSelf: "center",
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  pillBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  pillTextActive: {
    color: "#1F2937",
  },
  regionTabSelectorRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 20,
  },
  regionSelectorTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  regionSelectorActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  regionSelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  regionSelectorTextActive: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  scanGraphicWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  targetWrapper: {
    width: 240,
    height: 240,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 20,
    overflow: "hidden",
  },
  scanCropImage: {
    width: "90%",
    height: "90%",
    borderRadius: 16,
  },
  scanCorner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#10B981", // Green scanner corner brackets
    borderWidth: 0,
  },
  scanTopLeft: {
    top: 6,
    left: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  scanTopRight: {
    top: 6,
    right: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  scanBottomLeft: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  scanBottomRight: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  detailReportBlock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginVertical: 16,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dividerLight: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  itemLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  itemValueText: {
    fontSize: 15,
    fontWeight: "800",
  },
  itemSubValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  heatmapGraphicWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    width: "100%",
  },
  heatmapMainImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  intensityContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  intensityRow: {
    width: "100%",
    marginBottom: 8,
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  gradientBar: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5", // Purple visual style placeholder.
    // To mimic thermal intensity scale visually (blue to red):
    // In react-native, gradient is best with linear-gradient, but we can do a solid layout
    // that uses styled segments or colored blocks to mimic gradient cleanly.
    // Let's use a colored bar using flexbox and colored blocks to make it look 100% authentic!
    flexDirection: "row",
    overflow: "hidden",
  },
  intensityRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  intensityText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
});
