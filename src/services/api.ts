import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = (): string => {
  if (Platform.OS === "web") {
    return "http://127.0.0.1:8000";
  }

  // Get Metro bundler IP address when running in Expo Go on mobile
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://127.0.0.1:8000";
};

export const BASE_URL = getBaseUrl();
const API_PREFIX = `${BASE_URL}/api/v1`;

export const api = {
  /**
   * Registers a new user.
   */
  async register(email: string, password_raw: string) {
    const response = await fetch(`${API_PREFIX}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: password_raw }),
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: "Registration failed." }));
      throw new Error(errData.detail || "Registration failed.");
    }
    return response.json();
  },

  /**
   * Logs in a user and returns access token.
   */
  async login(email: string, password_raw: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password_raw);

    const response = await fetch(`${API_PREFIX}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: "Login failed." }));
      throw new Error(errData.detail || "Incorrect email or password.");
    }
    return response.json(); // returns { access_token, token_type }
  },

  /**
   * Retrieves profile of current authenticated user.
   */
  async fetchProfile(token: string) {
    const response = await fetch(`${API_PREFIX}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile.");
    }
    return response.json();
  },

  /**
   * Uploads an image file to trigger facial detection & inference.
   */
  async uploadImage(token: string, fileUri: string, fileName: string) {
    const formData = new FormData();
    const ext = (fileName || fileUri).split('.').pop()?.toLowerCase() || 'png';
    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext);
    const mimeType = isVideo ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png'}`;
    const targetName = fileName || (isVideo ? `upload_${Date.now()}.mp4` : `upload_${Date.now()}.png`);

    if (Platform.OS === "web" && (fileUri.startsWith("blob:") || fileUri.startsWith("data:"))) {
      const res = await fetch(fileUri);
      const blob = await res.blob();
      formData.append("file", blob, targetName);
    } else {
      formData.append("file", {
        uri: fileUri,
        name: targetName,
        type: mimeType,
      } as any);
    }

    const response = await fetch(`${API_PREFIX}/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: "Failed to upload image." }));
      throw new Error(errData.detail || "Failed to upload image.");
    }
    return response.json(); // returns AnalysisOut
  },

  /**
   * Fetches recent analyses for user.
   */
  async fetchAnalyses(token: string) {
    const response = await fetch(`${API_PREFIX}/analyses?limit=20`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recent analyses.");
    }
    return response.json();
  },

  /**
   * Fetches details of a specific analysis, including regional prediction scores.
   */
  async fetchAnalysisDetail(token: string, analysisId: number) {
    const response = await fetch(`${API_PREFIX}/analyses/${analysisId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analysis details for ID ${analysisId}.`);
    }
    return response.json();
  },
  
  /**
   * Utility to format backend URLs (e.g. crop URLs, static serving URLs).
   */
  getBackendUrl(relativeUrl: string): string {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
      return relativeUrl;
    }
    return `${BASE_URL}${relativeUrl}`;
  }
};
