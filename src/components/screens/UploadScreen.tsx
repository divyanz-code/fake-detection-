import React, { useState } from "react";
import { View, StyleSheet, Text, Pressable, Image, ActivityIndicator, useColorScheme } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../../context/AppContext";

export const UploadScreen: React.FC = () => {
  const { startImageAnalysis, navigateTo } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const pickImage = async () => {
    setPickError(null);
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setPickError("Permission to access media library was denied.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        
        // Extract filename and size if available
        const name = asset.fileName || `image_${Date.now()}.png`;
        setFileName(name);
        
        if (asset.fileSize) {
          const sizeKb = (asset.fileSize / 1024).toFixed(1);
          setFileSize(`${sizeKb} KB`);
        } else {
          setFileSize("Unknown size");
        }
      }
    } catch (err: any) {
      setPickError("Failed to select image: " + err.message);
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
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigateTo("dashboard")} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, isDark ? styles.textWhite : styles.textDark]}>Upload Media</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Main Upload Box */}
      <View style={styles.content}>
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            
            <View style={[styles.fileMetaCard, isDark ? styles.cardDark : styles.cardLight]}>
              <Text style={[styles.metaLabel, isDark ? styles.textWhite : styles.textDark]} numberOfLines={1}>
                📄 {fileName}
              </Text>
              <Text style={[styles.metaSub, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                Size: {fileSize}
              </Text>
            </View>
            
            <Pressable style={styles.changeBtn} onPress={pickImage}>
              <Text style={styles.changeBtnText}>Choose Different Image</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.uploadBox, isDark ? styles.uploadBoxDark : styles.uploadBoxLight]} onPress={pickImage}>
            <Text style={styles.uploadIcon}>📥</Text>
            <Text style={[styles.uploadTitle, isDark ? styles.textWhite : styles.textDark]}>Select Face Image</Text>
            <Text style={[styles.uploadDesc, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
              Supports PNG, JPG, or JPEG formats.
            </Text>
            {pickError && <Text style={styles.errorText}>{pickError}</Text>}
          </Pressable>
        )}
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.submitBtn, !imageUri && styles.submitBtnDisabled]}
          onPress={handleStartAnalysis}
          disabled={!imageUri || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Upload & Analyze</Text>
          )}
        </Pressable>
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  content: {
    flex: 1,
    justifyContent: "center",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 280,
  },
  uploadBoxLight: {
    borderColor: "#CBD5E1",
    backgroundColor: "#ffffff",
  },
  uploadBoxDark: {
    borderColor: "#334155",
    backgroundColor: "#1E293B",
  },
  uploadIcon: {
    fontSize: 54,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  uploadDesc: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
  previewContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  previewImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#000",
  },
  fileMetaCard: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
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
  metaLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  metaSub: {
    fontSize: 13,
  },
  changeBtn: {
    paddingVertical: 10,
  },
  changeBtnText: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 36,
  },
  submitBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
