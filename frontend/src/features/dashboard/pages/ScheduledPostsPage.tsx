import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/fetcher";
import { PLATFORM_COLORS, STATUS_CONFIG } from "@/constants/platforms";
import { queryKeys } from "../hooks/queryKeys";
import { PlatformIcon } from "../components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Filter,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";

interface Post {
  _id: string;
  content: string;
  publishDate: string;
  state: "QUEUE" | "PUBLISHED" | "DRAFT" | "ERROR";
  integrationId: any;
  image?: string;
  releaseURL?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduledPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState<Date | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"draft" | "quick">("draft");
  const [selectedDraftId, setSelectedDraftId] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState("10");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
  const [quickContent, setQuickContent] = useState("");
  const [quickIntegrationId, setQuickIntegrationId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // React Query hooks
  const { data: postsData } = useQuery({
    queryKey: queryKeys.posts,
    queryFn: () => apiGet("/posts"),
  });

  const { data: draftsData } = useQuery({
    queryKey: [...queryKeys.posts, { state: "DRAFT" }],
    queryFn: () => apiGet("/posts?state=DRAFT"),
  });

  const { data: intData } = useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => apiGet("/integrations/list"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      showToast("Post deleted successfully", "success");
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ targetDate, mode }: { targetDate: Date; mode: "draft" | "quick" }) => {
      if (mode === "draft") {
        if (!selectedDraftId) throw new Error("Please select a draft post to schedule.");
        await apiPut(`/posts/${selectedDraftId}`, {
          state: "QUEUE",
          date: targetDate.toISOString(),
        });
      } else {
        if (!quickContent.trim()) throw new Error("Please enter post content.");
        await apiPost("/posts", {
          type: "schedule",
          date: targetDate.toISOString(),
          posts: [
            {
              integrationId: effectiveQuickIntegrationId,
              content: quickContent,
              media: [],
            },
          ],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      setIsModalOpen(false);
      setQuickContent("");
      showToast("Post scheduled successfully!", "success");
    },
    onError: (err: Error) => {
      showToast(err.message || "Failed to schedule post", "error");
    },
  });

  const posts = postsData?.posts || [];
  const drafts = draftsData?.posts || [];
  const integrations = intData?.integrations || [];

  // Derive default integration from loaded data
  const defaultIntegrationId = integrations.length > 0 ? integrations[0]._id : "";
  const effectiveQuickIntegrationId = quickIntegrationId || defaultIntegrationId;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (postId: string) => {
    setDeleteConfirmId(postId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Calendar Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Week Navigation
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const weekRangeLabel = `${weekDays[0].toLocaleDateString([], { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  const handleDayClick = (date: Date, presetHour?: number) => {
    setSelectedDateForSchedule(date);
    setSelectedDraftId(drafts.length > 0 ? drafts[0]._id : "");
    if (presetHour !== undefined) {
      const h = presetHour % 12 || 12;
      setSelectedHour(String(h).padStart(2, "0"));
      setSelectedMinute("00");
      setSelectedPeriod(presetHour < 12 ? "AM" : "PM");
    }
    setIsModalOpen(true);
  };

  const get24HourTime = () => {
    let h = parseInt(selectedHour, 10);
    if (selectedPeriod === "PM" && h < 12) h += 12;
    if (selectedPeriod === "AM" && h === 12) h = 0;
    return { hours: h, minutes: parseInt(selectedMinute, 10) };
  };

  const handleSchedulePost = async () => {
    if (!selectedDateForSchedule) return;
    const { hours, minutes } = get24HourTime();
    const targetDate = new Date(selectedDateForSchedule);
    targetDate.setHours(hours, minutes, 0, 0);
    scheduleMutation.mutate({ targetDate, mode: scheduleMode });
  };

  // Filter posts
  const filteredPosts = posts.filter((post: Post) => {
    const integration = typeof post.integrationId === "object" ? post.integrationId : integrations.find((i: any) => i._id === post.integrationId);
    const platform = integration?.providerIdentifier || "x";
    if (selectedPlatform !== "all" && platform !== selectedPlatform) return false;
    if (selectedStatus !== "all" && post.state !== selectedStatus) return false;
    return true;
  });

  // Calendar Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells: { date: Date; isCurrentMonth: boolean; dayNum: number }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarCells.push({ date: new Date(year, month - 1, dayNum), isCurrentMonth: false, dayNum });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ date: new Date(year, month, d), isCurrentMonth: true, dayNum: d });
  }
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, dayNum: i });
  }

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getPostsForDate = (date: Date) =>
    filteredPosts.filter((p: Post) => {
      const pDate = new Date(p.publishDate);
      return pDate.getDate() === date.getDate() &&
        pDate.getMonth() === date.getMonth() &&
        pDate.getFullYear() === date.getFullYear();
    });

  // Stats
  const scheduledCount = posts.filter((p: Post) => p.state === "QUEUE").length;
  const publishedCount = posts.filter((p: Post) => p.state === "PUBLISHED").length;
  const pendingCount = drafts.length;
  const failedCount = posts.filter((p: Post) => p.state === "ERROR").length;

  const upcomingPosts = posts
    .filter((p: Post) => p.state === "QUEUE" && new Date(p.publishDate) >= new Date())
    .sort((a: Post, b: Post) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
    .slice(0, 4);

  const recentPublished = posts
    .filter((p: Post) => p.state === "PUBLISHED")
    .sort((a: Post, b: Post) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 4);

  const getPlatformFromPost = (post: Post) => {
    const integration = typeof post.integrationId === "object" ? post.integrationId : integrations.find((i: any) => i._id === post.integrationId);
    return (integration?.providerIdentifier || "x") as keyof typeof PLATFORM_COLORS;
  };

  const renderCalendarView = () => {
    if (viewMode === "month") {
      return (
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/70">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 bg-gray-50/30">
            {calendarCells.map((cell, idx) => {
              const cellPosts = getPostsForDate(cell.date);
              const currentDay = isToday(cell.date);
              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(cell.date)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-indigo-50/30 ${
                    !cell.isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center rounded-full ${
                        currentDay
                          ? "w-6 h-6 bg-[#243746] text-white shadow-xs"
                          : cell.isCurrentMonth
                          ? "text-[#1c2b36]"
                          : "text-gray-400"
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 space-y-1.5 flex-1 overflow-y-auto max-h-[80px] scrollbar-none">
                    {cellPosts.map((post: Post) => {
                      const platform = getPlatformFromPost(post);
                      const postTime = new Date(post.publishDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      const statusConf = STATUS_CONFIG[post.state] || STATUS_CONFIG.DRAFT;
                      return (
                        <div
                          key={post._id}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 shadow-2xs truncate ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PlatformIcon platform={platform} size={11} />
                          <span className="font-semibold shrink-0">{postTime}</span>
                          <span className="truncate opacity-90">{post.content || "Untitled"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      );
    }

    if (viewMode === "week") {
      return (
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="flex border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10">
            <div className="w-14 shrink-0" />
            {weekDays.map((day) => {
              const currentDay = isToday(day);
              return (
                <div key={day.toISOString()} className="flex-1 py-3 text-center border-l border-gray-100">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {DAYS_OF_WEEK[day.getDay()]}
                  </div>
                  <div
                    className={`text-sm font-bold mt-0.5 mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
                      currentDay ? "bg-[#243746] text-white" : "text-[#1c2b36]"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
            {Array.from({ length: 24 }, (_, hourIndex) => {
              const hour = hourIndex;
              const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
              return (
                <div key={hour} className="flex border-b border-gray-100 last:border-b-0">
                  <div className="w-14 shrink-0 py-2 pr-2 text-right text-[10px] font-semibold text-gray-400 leading-none pt-2.5">
                    {label}
                  </div>
                  {weekDays.map((day) => {
                    const currentDay = isToday(day);
                    const slotPosts = filteredPosts.filter((p: Post) => {
                      const d = new Date(p.publishDate);
                      return (
                        d.getFullYear() === day.getFullYear() &&
                        d.getMonth() === day.getMonth() &&
                        d.getDate() === day.getDate() &&
                        d.getHours() === hour
                      );
                    });
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day, hour)}
                        className={`flex-1 min-h-[48px] border-l border-gray-100 px-1 py-1 cursor-pointer group transition-colors hover:bg-[#243746]/5 ${
                          currentDay ? "bg-indigo-50/10" : ""
                        }`}
                      >
                        {slotPosts.length > 0 ? (
                          <div className="space-y-1">
                            {slotPosts.map((post: Post) => {
                              const platform = getPlatformFromPost(post);
                              const statusConf = STATUS_CONFIG[post.state] || STATUS_CONFIG.DRAFT;
                              const postTime = new Date(post.publishDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                              return (
                                <div
                                  key={post._id}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`px-1.5 py-1 rounded-md text-[10px] font-medium border truncate flex items-center gap-1 ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                                >
                                  <PlatformIcon platform={platform} size={9} />
                                  <span className="font-semibold shrink-0">{postTime}</span>
                                  <span className="truncate opacity-80">{post.content || "Post"}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in ${
          toast.type === "success" ? "bg-[#243746]" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c2b36] tracking-tight">Calendar</h1>
          <p className="text-gray-500 text-sm mt-0.5">Plan, schedule and manage your content calendar.</p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/create-post")}
          className="bg-[#243746] hover:bg-[#1c2b36] text-white gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={viewMode === "week" ? prevWeek : prevMonth}
              className="rounded-none border-r border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={viewMode === "week" ? nextWeek : nextMonth}
              className="rounded-none"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday} className="font-medium">
            Today
          </Button>
          <span className="text-lg font-bold text-[#1c2b36] ml-2">
            {viewMode === "week" ? weekRangeLabel : `${MONTH_NAMES[month]} ${year}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <ToggleGroup
            value={[viewMode]}
            onValueChange={(values) => {
              if (values && values.length > 0) {
                setViewMode(values[values.length - 1] as "month" | "week");
              }
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="month" title="Month View">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-xs">Month</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="week" title="Week View">
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="text-xs">Week</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Calendar View */}
        <div className="lg:col-span-3">
          {renderCalendarView()}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Monthly Overview */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1c2b36] text-sm">Monthly Overview</h3>
              <span className="text-xs font-semibold text-[#243746] cursor-pointer hover:underline">View Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-blue-900">{scheduledCount}</div>
                  <div className="text-[11px] font-medium text-blue-600 mt-0.5">Scheduled</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-emerald-900">{publishedCount}</div>
                  <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Published</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-amber-900">{pendingCount}</div>
                  <div className="text-[11px] font-medium text-amber-600 mt-0.5">Pending</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-rose-50/60 border border-rose-100 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xl font-extrabold text-rose-900">{failedCount}</div>
                  <div className="text-[11px] font-medium text-rose-600 mt-0.5">Failed</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Card>

          {/* Upcoming Posts */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1c2b36] text-sm">Upcoming Posts</h3>
              <span className="text-xs font-semibold text-gray-400">
                View all
              </span>
            </div>
            {upcomingPosts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No upcoming posts scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.map((post: Post) => {
                  const platform = getPlatformFromPost(post);
                  const pubDate = new Date(post.publishDate);
                  const mediaItems = JSON.parse(post.image || "[]");
                  const firstMedia = mediaItems[0];
                  const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.path;

                  return (
                    <div key={post._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                        {mediaUrl ? (
                          <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <PlatformIcon platform={platform} size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1c2b36] truncate">{post.content || "Scheduled Post"}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                          <PlatformIcon platform={platform} size={10} />
                          <span>
                            {pubDate.toLocaleDateString([], { month: "short", day: "numeric" })} • {pubDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(post._id)}>
                        <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Published */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1c2b36] text-sm">Recent Published</h3>
              <span className="text-xs font-semibold text-gray-400">
                {publishedCount} total
              </span>
            </div>
            {recentPublished.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No published posts yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPublished.map((post: Post) => {
                  const platform = getPlatformFromPost(post);
                  const pubDate = new Date(post.publishDate);
                  const mediaItems = JSON.parse(post.image || "[]");
                  const firstMedia = mediaItems[0];
                  const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.path;

                  return (
                    <div key={post._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                        {mediaUrl ? (
                          <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <PlatformIcon platform={platform} size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1c2b36] truncate">{post.content || "Published Post"}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                          <PlatformIcon platform={platform} size={10} />
                          <span>
                            {pubDate.toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      {post.releaseURL && (
                        <a
                          href={post.releaseURL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                        >
                          View ↗
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Filters */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1c2b36] text-sm">Filters</h3>
              <button
                onClick={() => { setSelectedPlatform("all"); setSelectedStatus("all"); }}
                className="text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Accounts</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="x">X (Twitter)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="QUEUE">Scheduled</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ERROR">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Legend */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white p-5">
            <h3 className="font-bold text-[#1c2b36] text-sm mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Post Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Schedule Post for {selectedDateForSchedule?.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </DialogTitle>
            <DialogDescription>
              Choose an existing draft or compose a quick post to schedule on this date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Mode Switcher */}
            <ToggleGroup
              type="single"
              value={scheduleMode}
              onValueChange={(value) => value && setScheduleMode(value as "draft" | "quick")}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ToggleGroupItem value="draft" className="flex-1 text-xs">
                Select from Drafts ({drafts.length})
              </ToggleGroupItem>
              <ToggleGroupItem value="quick" className="flex-1 text-xs">
                Quick Create Post
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Time Picker */}
            <div>
              <label className="text-xs font-semibold text-[#1c2b36] block mb-1.5">Time of Day</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {/* Hour Select */}
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="w-full text-xs font-semibold">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Minute Select */}
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="w-full text-xs font-semibold">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Period Select */}
                  <Select value={selectedPeriod} onValueChange={(val) => setSelectedPeriod(val as "AM" | "PM")}>
                    <SelectTrigger className="w-full text-xs font-semibold">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {scheduleMode === "draft" ? (
              <div>
                <label className="text-xs font-semibold text-[#1c2b36] block mb-1">Select Draft</label>
                {drafts.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                    No drafts available. Switch to "Quick Create Post" to compose a new post.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {drafts.map((draft: Post) => {
                      const platform = getPlatformFromPost(draft);
                      const isSelected = selectedDraftId === draft._id;

                      return (
                        <div
                          key={draft._id}
                          onClick={() => setSelectedDraftId(draft._id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-[#243746] bg-indigo-50/40 ring-2 ring-[#243746]/20"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PlatformIcon platform={platform} size={16} />
                            <span className="text-xs font-medium text-[#1c2b36] truncate">{draft.content || "Draft Content"}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#243746] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#1c2b36] block mb-1">Account / Platform</label>
                  <Select value={effectiveQuickIntegrationId} onValueChange={setQuickIntegrationId}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrations.map((int: any) => (
                        <SelectItem key={int._id} value={int._id}>
                          {int.name || int.providerIdentifier} ({int.providerIdentifier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1c2b36] block mb-1">Post Content</label>
                  <Textarea
                    rows={3}
                    value={quickContent}
                    onChange={(e) => setQuickContent(e.target.value)}
                    placeholder="What would you like to share?"
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedulePost}
              disabled={scheduleMutation.isPending}
              className="bg-[#243746] hover:bg-[#1c2b36] text-white font-semibold"
            >
              {scheduleMutation.isPending ? "Scheduling..." : "Schedule Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
