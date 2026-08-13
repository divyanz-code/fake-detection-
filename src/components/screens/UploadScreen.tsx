import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../../context/AppContext";

export const UploadScreen: React.FC = () => {
  const { startImageAnalysis, navigateTo } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  const pickImage = async () => {
    setPickError(null);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setPickError("Permission to access media library was denied.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        const typeIsVideo = asset.type === "video" || (asset.fileName && /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(asset.fileName));
        setIsVideo(!!typeIsVideo);

        const name = asset.fileName || (typeIsVideo ? `video_${Date.now()}.mp4` : `image_${Date.now()}.png`);
        setFileName(name);
        
        if (asset.fileSize) {
          const sizeMb = (asset.fileSize / (1024 * 1024)).toFixed(1);
          setFileSize(`${sizeMb} MB`);
        } else {
          setFileSize("12.4 MB");
        }
      }
    } catch (err: any) {
      setPickError("Failed to select media: " + err.message);
    }
  };

  const handleStartAnalysis = async () => {
    if (!imageUri) return;
    setUploading(true);
    try {
      await startImageAnalysis(imageUri, fileName);
    } catch (err) {
      // Error handled by app context
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigateTo("dashboard")} style={styles.backBtn}>
          <Text style={styles.backBtnIcon}>←</Text>
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Upload Media</Text>
          <Text style={styles.subtitle}>Upload image or video of a face</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Main Upload Box */}
      <View style={styles.uploadArea}>
        {imageUri ? (
          <View style={styles.previewContainer}>
            {!isVideo ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={[styles.previewImage, { backgroundColor: "#1E1B4B", alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ fontSize: 48 }}>🎥</Text>
                <Text style={{ color: "#FFFFFF", marginTop: 8, fontWeight: "600" }}>Video Ready to Scan</Text>
              </View>
            )}
            <View style={styles.fileMeta}>
              <Text style={styles.filenameText} numberOfLines={1}>{fileName}</Text>
              <Text style={styles.filesizeText}>{fileSize} • {isVideo ? "Video File" : "Image File"}</Text>
            </View>
            <Pressable style={styles.changeBtn} onPress={pickImage}>
              <Text style={styles.changeBtnText}>Change Media</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.dashedBox} onPress={pickImage}>
            <View style={styles.uploadIconBg}>
              <Text style={styles.uploadIcon}>⬆️</Text>
            </View>
            <Text style={styles.uploadPrompt}>Tap to upload Image / Video</Text>
            <Text style={styles.uploadSubPrompt}>Supports JPG, PNG, WEBP, MP4, MOV</Text>
            {pickError && <Text style={styles.errorText}>{pickError}</Text>}
          </Pressable>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Video should be clear</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Face should be visible</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Max file size: 200MB</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>Recommended: &lt; 60 sec</Text>
        </View>
      </View>

      {/* Bottom Button */}
      <Pressable
        style={[styles.nextBtn, !imageUri && styles.nextBtnDisabled]}
        onPress={handleStartAnalysis}
        disabled={!imageUri || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.nextBtnText}>Next</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnIcon: {
    fontSize: 24,
    color: "#1E1B4B",
    fontWeight: "600",
  },
  headerTitles: {
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1B4B",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  uploadArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  dashedBox: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  uploadIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadIcon: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  uploadPrompt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  uploadSubPrompt: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 1.1,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  previewImage: {
    width: "100%",
    flex: 1,
    borderRadius: 12,
  },
  fileMeta: {
    marginVertical: 12,
    alignItems: "center",
  },
  filenameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    maxWidth: 240,
  },
  filesizeText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  changeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#EEF2F6",
  },
  changeBtnText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    marginBottom: 32,
    alignSelf: "stretch",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1B4B",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  tipBullet: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  tipText: {
    fontSize: 14,
    color: "#4B5563",
  },
  nextBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: "stretch",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  nextBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
