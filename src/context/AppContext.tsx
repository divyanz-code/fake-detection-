import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "../services/api";

export type ScreenType =
  | "onboarding"
  | "login"
  | "register"
  | "dashboard"
  | "upload"
  | "processing"
  | "results"
  | "history"
  | "profile";

interface AppContextType {
  userToken: string | null;
  userData: any | null;
  activeScreen: ScreenType;
  analysesList: any[];
  currentAnalysis: any | null;
  selectedImage: string | null;
  loading: boolean;
  error: string | null;
  
  // Navigation actions
  navigateTo: (screen: ScreenType) => void;
  setSelectedImage: (uri: string | null) => void;
  
  // Auth actions
  loginUser: (email: string, password_raw: string) => Promise<void>;
  registerUser: (email: string, password_raw: string) => Promise<void>;
  logoutUser: () => void;
  clearError: () => void;

  // Analysis actions
  loadAnalyses: () => Promise<void>;
  startImageAnalysis: (fileUri: string, fileName: string) => Promise<void>;
  loadAnalysisDetail: (id: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenType>("onboarding");
  const [analysesList, setAnalysesList] = useState<any[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<any | null>(null);
  const [selectedImage, setSelectedImageState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear errors when navigating between screens
  const navigateTo = (screen: ScreenType) => {
    setError(null);
    setActiveScreen(screen);
  };

  const setSelectedImage = (uri: string | null) => {
    setSelectedImageState(uri);
  };

  const clearError = () => setError(null);

  // Authenticate user
  const loginUser = async (email: string, password_raw: string) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await api.login(email, password_raw);
      setUserToken(authData.access_token);
      
      const profile = await api.fetchProfile(authData.access_token);
      setUserData(profile);
      
      setActiveScreen("dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const registerUser = async (email: string, password_raw: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.register(email, password_raw);
      // Auto login after successful registration
      await loginUser(email, password_raw);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logoutUser = () => {
    setUserToken(null);
    setUserData(null);
    setAnalysesList([]);
    setCurrentAnalysis(null);
    setSelectedImageState(null);
    setActiveScreen("login");
  };

  // Load analysis history list
  const loadAnalyses = async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const data = await api.fetchAnalyses(userToken);
      setAnalysesList(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analyses.");
    } finally {
      setLoading(false);
    }
  };

  // Starts analysis by uploading image, then navigate to processing screen
  const startImageAnalysis = async (fileUri: string, fileName: string) => {
    if (!userToken) return;
    setLoading(true);
    setError(null);
    navigateTo("processing");
    try {
      const analysis = await api.uploadImage(userToken, fileUri, fileName);
      setCurrentAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
      navigateTo("upload");
    } finally {
      setLoading(false);
    }
  };

  // Poll details of a specific analysis record
  const loadAnalysisDetail = async (id: number) => {
    if (!userToken) return;
    try {
      const data = await api.fetchAnalysisDetail(userToken, id);
      setCurrentAnalysis(data);
      if (data.status === "completed") {
        // Refresh history list too
        loadAnalyses();
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch details.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        userToken,
        userData,
        activeScreen,
        analysesList,
        currentAnalysis,
        selectedImage,
        loading,
        error,
        navigateTo,
        setSelectedImage,
        loginUser,
        registerUser,
        logoutUser,
        clearError,
        loadAnalyses,
        startImageAnalysis,
        loadAnalysisDetail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
