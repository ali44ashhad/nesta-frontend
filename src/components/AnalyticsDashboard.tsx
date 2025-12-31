import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsService from "../services/analytics.service";
import AuthService from "../services/auth.service";
import { colors } from "../config/colors";
import { useToast } from "./ToastManager";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface UserStats {
  totalUsers: number;
  students: number;
  parents: number;
  teachers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

interface ProjectStats {
  totalProjects: number;
  projectsThisWeek: number;
  projectsThisMonth: number;
  averageProjectsPerUser: number;
}

interface LocationData {
  country: string;
  city: string;
  userCount: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

interface RegistrationTrend {
  date: string;
  count: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  roles?: string[];
  country?: string | null;
  city?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  owner?: {
    id: string;
    username: string;
  };
  created?: string;
  lastModified?: string;
}

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [registrationTrends, setRegistrationTrends] = useState<RegistrationTrend[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "analytics">("overview");
  const [trendsFilter, setTrendsFilter] = useState<"7" | "30" | "90" | "custom">("30");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());

  const currentUser = AuthService.getCurrentUser();
  const isAdmin = currentUser?.roles?.some((role: string) => 
    role.toLowerCase().includes("admin") || role === "ROLE_ADMIN"
  ) || false;

  const fetchRegistrationTrends = React.useCallback(async () => {
    try {
      if (trendsFilter === "custom") {
        if (!customStartDate || !customEndDate) {
          return;
        }
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        
        // Validate date range
        if (startDate > endDate) {
          showToast("Start date must be before end date", "error");
          return;
        }
        
        // Calculate days difference to fetch appropriate range
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysToFetch = Math.min(Math.max(daysDiff + 7, 30), 365); // Fetch at least 30 days, max 365
        
        // Fetch data and filter on frontend for custom range
        const allTrendsRes = await AnalyticsService.getRegistrationTrends(daysToFetch);
        if (allTrendsRes.data) {
          const filtered = allTrendsRes.data.filter((trend: RegistrationTrend) => {
            const trendDate = new Date(trend.date);
            return trendDate >= startDate && trendDate <= endDate;
          });
          setRegistrationTrends(filtered);
        }
      } else {
        const days = parseInt(trendsFilter);
        const trendsRes = await AnalyticsService.getRegistrationTrends(days);
        if (trendsRes.data) {
          setRegistrationTrends(trendsRes.data || []);
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching registration trends:", error);
      let errorMessage = "Failed to load registration trends";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    }
  }, [trendsFilter, customStartDate, customEndDate, showToast]);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel (except trends, which is handled separately)
      const [
        userStatsRes,
        projectStatsRes,
        locationRes,
        rolesRes,
        usersRes,
        projectsRes,
      ] = await Promise.allSettled([
        AnalyticsService.getUserStats(),
        AnalyticsService.getProjectStats(),
        AnalyticsService.getLocationAnalytics(),
        AnalyticsService.getRolesDistribution(),
        AnalyticsService.getAllUsers(),
        AnalyticsService.getAllProjects(),
      ]);

      if (userStatsRes.status === "fulfilled") {
        setUserStats(userStatsRes.value.data);
      }
      if (projectStatsRes.status === "fulfilled") {
        setProjectStats(projectStatsRes.value.data);
      }
      if (locationRes.status === "fulfilled") {
        setLocationData(locationRes.value.data || []);
      }
      if (rolesRes.status === "fulfilled") {
        setRoleDistribution(rolesRes.value.data || []);
      }
      if (usersRes.status === "fulfilled") {
        setAllUsers(usersRes.value.data || []);
      }
      if (projectsRes.status === "fulfilled") {
        setAllProjects(projectsRes.value.data || []);
      }
    } catch (error: unknown) {
      console.error("Error fetching analytics:", error);
      let errorMessage = "Failed to load analytics data";
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
    fetchRegistrationTrends();
  }, [fetchDashboardData, fetchRegistrationTrends]);

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    if (!isAdmin) {
      showToast("Only admins can change user access", "error");
      return;
    }

    setUpdatingRoles(prev => new Set(prev).add(userId));
    try {
      const roles = newRole === "admin" ? ["ROLE_ADMIN", "ROLE_USER"] : ["ROLE_USER"];
      await AnalyticsService.updateUserRoles(userId, roles);
      
      // Update local state
      setAllUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, roles } 
            : user
        )
      );
      
      showToast(`User access updated to ${newRole}`, "success");
    } catch (error: unknown) {
      console.error("Error updating user roles:", error);
      let errorMessage = "Failed to update user access";
      
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setUpdatingRoles(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getUserAccessType = (user: User): "admin" | "user" => {
    if (!user.roles || user.roles.length === 0) return "user";
    const hasAdmin = user.roles.some(role => 
      role.toLowerCase().includes("admin") || role === "ROLE_ADMIN"
    );
    return hasAdmin ? "admin" : "user";
  };

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon: React.ReactNode }) => (
    <div
      className="rounded-lg p-6 shadow-lg"
      style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium" style={{ color: colors.lightGray }}>
          {title}
        </h3>
        <div style={{ color: colors.limeGreen }}>{icon}</div>
      </div>
      <p className="text-3xl font-bold" style={{ color: colors.limeGreen }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: colors.darkGray }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.veryDarkGray }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.limeGreen }}></div>
          <p style={{ color: colors.lightGray }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.veryDarkGray }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: colors.mediumDarkGray, borderColor: colors.darkGray }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "saiba", color: colors.lightGray }}>
                Analytics Dashboard
              </h1>
              {/* <p className="text-sm mt-1" style={{ color: colors.darkGray }}>
                Comprehensive insights into users, projects, and platform activity
              </p> */}
            </div>
            <button
              onClick={() => navigate("/app")}
              className="px-4 py-2 rounded-md text-sm transition"
              style={{
                backgroundColor: colors.darkerGray,
                color: colors.lightGray,
                border: `1px solid ${colors.darkGray}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.darkGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.darkerGray;
              }}
            >
              Back to App
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 border-b" style={{ borderColor: colors.darkGray }}>
          {(["overview", "users", "projects", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-medium transition capitalize"
              style={{
                color: activeTab === tab ? colors.limeGreen : colors.darkGray,
                borderBottom: activeTab === tab ? `2px solid ${colors.limeGreen}` : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={userStats?.totalUsers || 0}
                subtitle="All registered users"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatCard
                title="Total Projects"
                value={projectStats?.totalProjects || 0}
                subtitle={`${typeof projectStats?.averageProjectsPerUser === 'number' 
                  ? projectStats.averageProjectsPerUser.toFixed(1) 
                  : (projectStats?.averageProjectsPerUser || 0)} per user`}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Active Users"
                value={userStats?.activeUsers || 0}
                subtitle="Last 30 days"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <StatCard
                title="New This Month"
                value={userStats?.newUsersThisMonth || 0}
                subtitle="New registrations"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
              />
            </div>

            {/* Role Distribution */}
            <div
              className="rounded-lg p-6 shadow-lg"
              style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.lightGray }}>
                User Roles Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleDistribution.map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: colors.darkerGray }}>
                    <span className="capitalize" style={{ color: colors.lightGray }}>{role.role}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: colors.limeGreen }}>{role.count}</span>
                      <span className="text-xs" style={{ color: colors.darkGray }}>({role.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            {locationData.length > 0 && (
              <div
                className="rounded-lg p-6 shadow-lg"
                style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
              >
                <h2 className="text-xl font-semibold mb-4" style={{ color: colors.lightGray }}>
                  Top Locations
                </h2>
                <div className="space-y-2">
                  {locationData.slice(0, 10).map((loc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: colors.darkerGray }}>
                      <div>
                        <span className="font-medium" style={{ color: colors.lightGray }}>{loc.city || "Unknown"}</span>
                        {loc.country && (
                          <span className="text-xs ml-2" style={{ color: colors.darkGray }}>, {loc.country}</span>
                        )}
                      </div>
                      <span className="font-semibold" style={{ color: colors.limeGreen }}>{loc.userCount} users</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div
            className="rounded-lg shadow-lg overflow-hidden"
            style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
          >
            <div className="p-4 border-b" style={{ borderColor: colors.darkGray }}>
              <h2 className="text-xl font-semibold" style={{ color: colors.lightGray }}>
                All Users ({allUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: colors.darkerGray }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Access</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user, index) => (
                    <tr key={user.id || index} className="border-b" style={{ borderColor: colors.darkGray }}>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.lightGray }}>{user.username || "N/A"}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.lightGray }}>{user.email || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs capitalize" style={{ backgroundColor: colors.darkerGray, color: colors.limeGreen }}>
                          {user.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <select
                            value={getUserAccessType(user)}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "user")}
                            disabled={updatingRoles.has(user.id)}
                            className="px-3 py-1.5 text-sm rounded transition-all"
                            style={{
                              backgroundColor: colors.darkerGray,
                              background: getUserAccessType(user) === "admin" ? colors.limeGreen : colors.darkGray,
                              border: `1px solid ${getUserAccessType(user) === "admin" ? colors.limeGreen : colors.darkGray}`,
                              cursor: updatingRoles.has(user.id) ? "not-allowed" : "pointer",
                              opacity: updatingRoles.has(user.id) ? 0.6 : 1,
                            }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span 
                            className="text-xs capitalize" 
                            style={{ 
                              color: getUserAccessType(user) === "admin" ? colors.limeGreen : colors.darkGray 
                            }}
                          >
                            {getUserAccessType(user)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.lightGray }}>
                        {user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.darkGray }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div
            className="rounded-lg shadow-lg overflow-hidden"
            style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
          >
            <div className="p-4 border-b" style={{ borderColor: colors.darkGray }}>
              <h2 className="text-xl font-semibold" style={{ color: colors.lightGray }}>
                All Projects ({allProjects.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: colors.darkerGray }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Project Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: colors.lightGray }}>Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {allProjects.map((project, index) => (
                    <tr key={project.id || index} className="border-b" style={{ borderColor: colors.darkGray }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: colors.lightGray }}>{project.name || "Unnamed Project"}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.lightGray }}>{project.owner?.username || "N/A"}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.darkGray }}>{project.description || "No description"}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.darkGray }}>
                        {project.created ? new Date(project.created).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: colors.darkGray }}>
                        {project.lastModified ? new Date(project.lastModified).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Registration Trends */}
            {registrationTrends.length > 0 && (
              <div
                className="rounded-lg p-6 shadow-lg"
                style={{ backgroundColor: colors.mediumDarkGray, border: `1px solid ${colors.limeGreen}30` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold" style={{ color: colors.lightGray }}>
                    Registration Trends
                    {trendsFilter === "7" && " (Last 7 Days)"}
                    {trendsFilter === "30" && " (Last 30 Days)"}
                    {trendsFilter === "90" && " (Last 90 Days)"}
                    {trendsFilter === "custom" && customStartDate && customEndDate && 
                      ` (${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()})`}
                  </h2>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Preset Filters */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTrendsFilter("7")}
                        className={`px-3 py-1.5 text-sm rounded transition-all ${
                          trendsFilter === "7"
                            ? "font-semibold"
                            : "hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor: trendsFilter === "7" ? colors.limeGreen : colors.darkerGray,
                          color: trendsFilter === "7" ? colors.veryDarkGray : colors.lightGray,
                          border: `1px solid ${trendsFilter === "7" ? colors.limeGreen : colors.darkGray}`,
                        }}
                      >
                        Last Week
                      </button>
                      <button
                        onClick={() => setTrendsFilter("30")}
                        className={`px-3 py-1.5 text-sm rounded transition-all ${
                          trendsFilter === "30"
                            ? "font-semibold"
                            : "hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor: trendsFilter === "30" ? colors.limeGreen : colors.darkerGray,
                          color: trendsFilter === "30" ? colors.veryDarkGray : colors.lightGray,
                          border: `1px solid ${trendsFilter === "30" ? colors.limeGreen : colors.darkGray}`,
                        }}
                      >
                        Last Month
                      </button>
                      <button
                        onClick={() => setTrendsFilter("90")}
                        className={`px-3 py-1.5 text-sm rounded transition-all ${
                          trendsFilter === "90"
                            ? "font-semibold"
                            : "hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor: trendsFilter === "90" ? colors.limeGreen : colors.darkerGray,
                          color: trendsFilter === "90" ? colors.veryDarkGray : colors.lightGray,
                          border: `1px solid ${trendsFilter === "90" ? colors.limeGreen : colors.darkGray}`,
                        }}
                      >
                        Last 3 Months
                      </button>
                      <button
                        onClick={() => setTrendsFilter("custom")}
                        className={`px-3 py-1.5 text-sm rounded transition-all ${
                          trendsFilter === "custom"
                            ? "font-semibold"
                            : "hover:opacity-80"
                        }`}
                        style={{
                          backgroundColor: trendsFilter === "custom" ? colors.limeGreen : colors.darkerGray,
                          color: trendsFilter === "custom" ? colors.veryDarkGray : colors.lightGray,
                          border: `1px solid ${trendsFilter === "custom" ? colors.limeGreen : colors.darkGray}`,
                        }}
                      >
                        Custom
                      </button>
                    </div>
                    
                    {/* Custom Date Range Inputs */}
                    {trendsFilter === "custom" && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-3 py-1.5 text-sm rounded"
                          style={{
                            backgroundColor: colors.darkerGray,
                            color: colors.lightGray,
                            border: `1px solid ${colors.darkGray}`,
                          }}
                        />
                        <span style={{ color: colors.darkGray }}>to</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="px-3 py-1.5 text-sm rounded"
                          style={{
                            backgroundColor: colors.darkerGray,
                            color: colors.lightGray,
                            border: `1px solid ${colors.darkGray}`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full" style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={registrationTrends.map(trend => ({
                        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        fullDate: trend.date,
                        registrations: trend.count,
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.limeGreen} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={colors.limeGreen} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.darkGray} opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke={colors.darkGray}
                        style={{ fontSize: "12px" }}
                        tick={{ fill: colors.darkGray }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke={colors.darkGray}
                        style={{ fontSize: "12px" }}
                        tick={{ fill: colors.darkGray }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.mediumDarkGray,
                          border: `1px solid ${colors.limeGreen}50`,
                          borderRadius: "8px",
                          color: colors.lightGray,
                        }}
                        labelStyle={{ color: colors.limeGreen, fontWeight: "bold" }}
                        formatter={(value: number) => [value, "Registrations"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="registrations"
                        stroke={colors.limeGreen}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRegistrations)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="New Users Today"
                value={userStats?.newUsersToday || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                title="New Users This Week"
                value={userStats?.newUsersThisWeek || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Projects This Week"
                value={projectStats?.projectsThisWeek || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Projects This Month"
                value={projectStats?.projectsThisMonth || 0}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

