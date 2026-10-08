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
                {isScheduleOn ? "Select the date and time for publication." : "Publish immediately or set a schedule."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                {isScheduleOn ? "Scheduled" : "Publish now"}
              </span>
              <Switch checked={isScheduleOn} onCheckedChange={onToggleSchedule} />
            </div>
          </div>

          {/* Inline Expanded Schedule Form (When ON) */}
          {isScheduleOn && (
            <div className="space-y-3 pt-3 border-t border-gray-100 animate-in fade-in duration-150">
              {/* Date & Time Picker Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => onChangeDate(e.target.value)}
                      className="w-full h-8.5 pl-9 pr-3 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A7CFF] focus:ring-2 focus:ring-[#0A7CFF]/15 text-slate-900 bg-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => onChangeTime(e.target.value)}
                      className="w-full h-8.5 pl-9 pr-3 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A7CFF] focus:ring-2 focus:ring-[#0A7CFF]/15 text-slate-900 bg-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Suggested Times */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Sparkles className="w-3 h-3 text-[#0A7CFF]" />
                  <span>Suggested times</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {BEST_TIMES.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyBestTime(chip.offsetDays, chip.timeVal)}
                      className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50/80 hover:text-[#0A7CFF] border border-slate-200 hover:border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
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
