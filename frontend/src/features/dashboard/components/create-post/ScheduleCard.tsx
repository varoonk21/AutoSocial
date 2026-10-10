import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface ScheduleCardProps {
  isScheduleOn: boolean;
  onToggleSchedule: (val: boolean) => void;
  date: string;
  onChangeDate: (date: string) => void;
  time: string;
  onChangeTime: (time: string) => void;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function ScheduleCard({
  isScheduleOn,
  onToggleSchedule,
  date,
  onChangeDate,
  time,
  onChangeTime,
  error,
  cardRef,
}: ScheduleCardProps) {

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
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
            <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
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
                      className="w-full h-9 pl-9 pr-3 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-slate-900 bg-white cursor-pointer"
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
                      className="w-full h-9 pl-9 pr-3 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 text-slate-900 bg-white cursor-pointer"
                    />
                  </div>
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
