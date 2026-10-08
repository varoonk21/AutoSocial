import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CTA_OPTIONS } from "./constants";
import type { CtaButton } from "./types";

interface ButtonCardProps {
  ctaButton: CtaButton;
  onCtaChange: (value: CtaButton) => void;
}

export function ButtonCard({ ctaButton, onCtaChange }: ButtonCardProps) {
  const enabled = ctaButton !== "";

  return (
    <Card className="py-0">
      <CardContent className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-[#1c2b36]">Add a button</label>
            <p className="text-[10px] text-gray-400">Send viewers to a landing page.</p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => onCtaChange(checked ? "learn_more" : "")}
          />
        </div>

        {enabled && (
          <Select
            value={ctaButton}
            onValueChange={(value) => value && onCtaChange(value as CtaButton)}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Choose a button" />
            </SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.filter((option) => option.value !== "").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
