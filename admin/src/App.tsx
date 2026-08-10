import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Database, 
  Cpu, 
  LogOut, 
  ShieldAlert, 
  Users, 
  Image as ImageIcon, 
  RefreshCw,
  Server,
  Layers
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const BASE_URL = "http://127.0.0.1:8000";
const API_PREFIX = `${BASE_URL}/api/v1`;

type TabType = "dashboard" | "logs" | "system";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App states
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [overTimeRange, setOverTimeRange] = useState<string>("7d");
  const [overTimeData, setOverTimeData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [recentMedia, setRecentMedia] = useState<any[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [modelsStatus, setModelsStatus] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all admin data
  const fetchAllData = async (activeToken: string) => {
    setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };

      // 1. Dashboard summary
      const statsRes = await fetch(`${API_PREFIX}/admin/dashboard`, { headers });
      if (statsRes.status === 403) {
        handleLogout();
        throw new Error("Forbidden: Admin privileges required.");
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Daily scans chart
      const chartRes = await fetch(`${API_PREFIX}/admin/analytics/analyses-over-time?range=${overTimeRange}`, { headers });
      const chartData = await chartRes.json();
      setOverTimeData(chartData.points);

      // 3. Distribution chart
      const distRes = await fetch(`${API_PREFIX}/admin/analytics/prediction-distribution`, { headers });
      const distData = await distRes.json();
      setDistributionData([
        { name: "Authentic (Real)", value: distData.real, color: "#10B981" },
        { name: "Manipulated (Fake)", value: distData.fake, color: "#EF4444" }
      ]);

      // 4. Recent Media
      const mediaRes = await fetch(`${API_PREFIX}/admin/media/recent`, { headers });
      const mediaData = await mediaRes.json();
      setRecentMedia(mediaData);

      // 5. Recent Analyses
      const analysesRes = await fetch(`${API_PREFIX}/admin/analyses/recent`, { headers });
      const analysesData = await analysesRes.json();
      setRecentAnalyses(analysesData);

      // 6. System health
      const systemRes = await fetch(`${API_PREFIX}/admin/system-status`, { headers });
      const systemData = await systemRes.json();
      setSystemStatus(systemData);

      // 7. Models status
      const modelsRes = await fetch(`${API_PREFIX}/admin/models`, { headers });
      const modelsData = await modelsRes.json();
      setModelsStatus(modelsData);

    } catch (e: any) {
      console.error("Failed to load admin data:", e);
    } finally {
      setRefreshing(false);
    }
  };

  // Re-fetch chart when range toggles
  useEffect(() => {
    if (token) {
      fetchChartOnly();
    }
  }, [overTimeRange]);

  const fetchChartOnly = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const chartRes = await fetch(`${API_PREFIX}/admin/analytics/analyses-over-time?range=${overTimeRange}`, { headers });
      const chartData = await chartRes.json();
      setOverTimeData(chartData.points);
    } catch (e) {
      console.error(e);
    }
  };

  // Load everything on token set
  useEffect(() => {
    if (token) {
      fetchAllData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${API_PREFIX}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error("Invalid username/password or access denied.");
      }

      const data = await res.json();
      
      // Verify user is an admin by calling me endpoint
      const meRes = await fetch(`${API_PREFIX}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const meData = await meRes.json();

      if (!meData.is_admin) {
        throw new Error("Access Denied: Administrative privileges required.");
      }

      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setStats(null);
    setRecentMedia([]);
    setRecentAnalyses([]);
  };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center px-4">
        <div className="bg-darkCard p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-800">
          <div className="flex justify-center mb-6">
            <span className="text-3xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">AegisFace Admin</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Sign in to access system metrics and analytics.</p>

          {authError && (
            <div className="bg-red-950 border border-red-500 text-red-200 text-sm rounded-lg p-3 mb-5">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Admin Email</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brandPrimary"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-brandPrimary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-brandPrimary hover:bg-brandPrimary/90 transition text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
            >
              {authLoading ? "Authenticating..." : "Sign In Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-darkCard border-b md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="font-extrabold text-white leading-none">AegisFace</h1>
              <span className="text-[10px] text-brandPrimary font-bold uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "dashboard" ? "bg-brandPrimary text-white shadow-md shadow-brandPrimary/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BarChart3 size={18} />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "logs" ? "bg-brandPrimary text-white shadow-md shadow-brandPrimary/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ImageIcon size={18} />
              Media & Scans Log
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === "system" ? "bg-brandPrimary text-white shadow-md shadow-brandPrimary/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Server size={18} />
              System & Keras Models
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut size={18} />
            Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header Bar */}
        <header className="flex justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
              {activeTab === "dashboard" && "Overview Analytics"}
              {activeTab === "logs" && "Media Scans Database"}
              {activeTab === "system" && "Engine Health Monitor"}
            </h2>
            <p className="text-slate-400 text-sm">Real-time stats from database and models.</p>
          </div>

          <button
            onClick={() => token && fetchAllData(token)}
            disabled={refreshing}
            className="bg-slate-800 hover:bg-slate-700 transition p-3 rounded-xl text-slate-300 flex items-center gap-2 border border-slate-700"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-brandPrimary" : ""} />
            <span className="hidden sm:inline text-xs font-semibold">Sync</span>
          </button>
        </header>

        {/* Tab 1: Dashboard overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-brandPrimary/10 rounded-xl text-brandPrimary"><ImageIcon size={24} /></div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Total Uploads</span>
                  <span className="text-2xl font-bold text-white">{stats?.total_media || 0}</span>
                </div>
              </div>

              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-brandDanger/10 rounded-xl text-brandDanger"><ShieldAlert size={24} /></div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Flagged Fake</span>
                  <span className="text-2xl font-bold text-red-500">{stats?.fake_scans || 0}</span>
                </div>
              </div>

              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-brandSuccess/10 rounded-xl text-brandSuccess"><Layers size={24} /></div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Verified Real</span>
                  <span className="text-2xl font-bold text-emerald-500">{stats?.real_scans || 0}</span>
                </div>
              </div>

              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-yellow-500/10 rounded-xl text-yellow-500"><Users size={24} /></div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Registered Users</span>
                  <span className="text-2xl font-bold text-white">{stats?.total_users || 0}</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line Chart */}
              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-base">Analyses Activity Over Time</h3>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setOverTimeRange("7d")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        overTimeRange === "7d" ? "bg-brandPrimary text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setOverTimeRange("30d")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        overTimeRange === "30d" ? "bg-brandPrimary text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1E293B", borderColor: "#334155", color: "#fff" }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <h3 className="font-bold text-white text-base mb-4">Detection Outcomes Ratio</h3>
                
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4">
                  {distributionData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 font-semibold">{item.name}</span>
                      </div>
                      <span className="font-bold text-white">{item.value} runs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Uploads Table */}
            <div className="bg-darkCard rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Recent Media Uploads</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                      <th className="p-4 pl-6">Filename</th>
                      <th className="p-4">Media Type</th>
                      <th className="p-4">File Size</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4 pr-6">Upload Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {recentMedia.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/20 text-slate-300">
                        <td className="p-4 pl-6 font-semibold text-white max-w-xs truncate">{m.filename}</td>
                        <td className="p-4"><span className="bg-blue-900/30 text-blue-400 text-xs font-bold px-2 py-1 rounded-md uppercase">{m.file_type}</span></td>
                        <td className="p-4">{m.size_bytes ? `${(m.size_bytes / 1024).toFixed(1)} KB` : "N/A"}</td>
                        <td className="p-4 font-mono text-slate-400">#00{m.user_id}</td>
                        <td className="p-4 pr-6 text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentMedia.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">No media files registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Logs list */}
        {activeTab === "logs" && (
          <div className="bg-darkCard rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">System Scans Database Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                    <th className="p-4 pl-6">Scan ID</th>
                    <th className="p-4">Filename</th>
                    <th className="p-4">Outcome</th>
                    <th className="p-4">Certainty</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {recentAnalyses.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/20 text-slate-300">
                      <td className="p-4 pl-6 font-mono text-slate-400">#AN-{a.id.toString().padStart(4, "0")}</td>
                      <td className="p-4 font-semibold text-white max-w-xs truncate">{a.media?.filename || "Loading..."}</td>
                      <td className="p-4">
                        {a.status === "completed" ? (
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                            a.prediction === "fake" ? "bg-red-900/30 text-red-400" : "bg-emerald-900/30 text-emerald-400"
                          }`}>
                            {a.prediction?.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">{a.confidence ? `${(a.confidence * 100).toFixed(1)}%` : "-"}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          a.status === "completed" ? "bg-emerald-950 text-emerald-500" : a.status === "failed" ? "bg-red-950 text-red-500" : "bg-blue-950 text-blue-500 animate-pulse"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {recentAnalyses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">No analysis records located.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: System Status & Keras Model Status */}
        {activeTab === "system" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU & Memory metrics */}
              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 space-y-6">
                <h3 className="font-bold text-white text-base flex items-center gap-2"><Cpu size={18} className="text-brandPrimary" /> Host Server Performance</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="text-slate-300 font-semibold">CPU Usage</span>
                      <span className="text-white font-bold">{systemStatus?.cpu_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-brandPrimary h-2.5 rounded-full" style={{ width: `${systemStatus?.cpu_percent || 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="text-slate-300 font-semibold">RAM Usage</span>
                      <span className="text-white font-bold">{systemStatus?.memory_percent || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-brandAccent h-2.5 rounded-full" style={{ width: `${systemStatus?.memory_percent || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Database & Storage Status */}
              <div className="bg-darkCard p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2"><Database size={18} className="text-brandPrimary" /> Database & Storage Health</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-300 font-semibold">SQLite Connection</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1.5">● Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-300 font-semibold">Storage Reserved</span>
                    <span className="text-white font-semibold">150.0 MB</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-300 font-semibold">Storage Available</span>
                    <span className="text-white font-semibold">500.0 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model health grid */}
            <div className="bg-darkCard p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white text-base mb-6 flex items-center gap-2"><Layers size={18} className="text-brandPrimary" /> AI Model Adapters Compilation Status</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {modelsStatus.map((m, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-32">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Keras Adapter</span>
                      <h4 className="text-sm font-extrabold text-white uppercase mt-0.5">{m.model_name} Model</h4>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${m.loaded ? "text-emerald-500" : "text-red-500"}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${m.loaded ? "bg-emerald-500" : "bg-red-500"}`} />
                        {m.loaded ? "Loaded" : "Offline"}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-1 rounded">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
