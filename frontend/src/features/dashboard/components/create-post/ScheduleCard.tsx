import { Calendar, Clock, Globe, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface ScheduleCardProps {
  isScheduleOn: boolean;
  onToggleSchedule: (val: boolean) => void;
  date: string;
  onChangeDate: (date: string) => void;
  time: string;
  onChangeTime: (time: string) => void;
  timezone: string;
  onChangeTimezone: (tz: string) => void;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const BEST_TIMES = [
  { label: "Tomorrow 9:00 AM", offsetDays: 1, timeVal: "09:00" },
  { label: "Tomorrow 6:00 PM", offsetDays: 1, timeVal: "18:00" },
  { label: "Friday 3:00 PM", offsetDays: 2, timeVal: "15:00" },
];

export function ScheduleCard({
  isScheduleOn,
  onToggleSchedule,
  date,
  onChangeDate,
  time,
  onChangeTime,
  timezone,
  onChangeTimezone,
  error,
  cardRef,
}: ScheduleCardProps) {
  const handleApplyBestTime = (offsetDays: number, timeVal: string) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + offsetDays);
    const dateStr = targetDate.toISOString().split("T")[0];
    onChangeDate(dateStr);
    onChangeTime(timeVal);
  };

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-gray-200 bg-white shadow-xs">
        <CardContent className="p-4 space-y-3">
          {/* Card Header & Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Schedule</h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isScheduleOn ? "Choose when your post goes live." : "Publish immediately or schedule for later."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="schedule-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Set date and time
              </label>
              <Switch id="schedule-toggle" checked={isScheduleOn} onCheckedChange={onToggleSchedule} />
            </div>
          </div>

          {/* Inline Expanded Schedule Form (When ON) */}
          {isScheduleOn && (
            <div className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in duration-200">
              {/* Date & Time Picker Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => onChangeDate(e.target.value)}
                      className="w-full h-8.5 p-2 pl-9 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A7CFF] focus:ring-2 focus:ring-[#0A7CFF]/15 text-slate-900 bg-white"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => onChangeTime(e.target.value)}
                      className="w-full h-8.5 p-2 pl-9 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A7CFF] focus:ring-2 focus:ring-[#0A7CFF]/15 text-slate-900 bg-white"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Best Time Suggestion Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#0A7CFF]" />
                  <span>Recommended Best Times</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {BEST_TIMES.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyBestTime(chip.offsetDays, chip.timeVal)}
                      className="text-xs font-semibold text-[#0A7CFF] bg-blue-50/80 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 font-medium pt-0.5">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
