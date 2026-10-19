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

    // In modern Expo / React Native (WinterCG compliant), FormData requires Blob/File,
    // not legacy `{ uri, name, type }` objects which throw "Unsupported FormDataPart implementation".
    try {
      const res = await fetch(fileUri);
      if (!res.ok) {
        throw new Error(`fetch returned HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (!blob || blob.size < 50) {
        throw new Error(`Blob is empty or too small (${blob?.size || 0} bytes)`);
      }
      if (typeof File !== "undefined") {
        try {
          const file = new File([blob], targetName, { type: mimeType });
          formData.append("file", file);
        } catch {
          formData.append("file", blob, targetName);
        }
      } else {
        formData.append("file", blob, targetName);
      }
    } catch (fetchErr) {
      console.warn("fetch(fileUri) failed, attempting XHR blob conversion:", fetchErr);
      try {
        const blob: Blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            if (xhr.response) {
              resolve(xhr.response);
            } else {
              reject(new Error(`XHR returned empty response`));
            }
          };
          xhr.onerror = () => reject(new Error("XHR failed to convert file to blob"));
          xhr.responseType = "blob";
          xhr.open("GET", fileUri, true);
          xhr.send(null);
        });
        if (!blob || blob.size < 50) {
          throw new Error(`File is empty or invalid (${blob?.size || 0} bytes)`);
        }
        formData.append("file", blob, targetName);
      } catch (xhrErr: any) {
        console.error("Failed to convert fileUri to Blob:", xhrErr);
        throw new Error(`Failed to load selected media: ${xhrErr?.message || xhrErr}`);
      }
    }

    const response = await fetch(`${API_PREFIX}/uploads/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let detailMsg = "Failed to upload image.";
      try {
        const errData = await response.json();
        if (typeof errData.detail === "string") {
          detailMsg = errData.detail;
        } else if (Array.isArray(errData.detail)) {
          detailMsg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
        } else if (errData.detail) {
          detailMsg = JSON.stringify(errData.detail);
        } else if (errData.message) {
          detailMsg = errData.message;
        }
      } catch {
        detailMsg = `Upload failed with status ${response.status}`;
      }
      console.error(`[Upload error ${response.status}]:`, detailMsg);
      throw new Error(detailMsg);
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
