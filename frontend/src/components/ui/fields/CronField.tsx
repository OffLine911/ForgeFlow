import { useState } from "react";
import { Clock } from "lucide-react";

interface CronFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at 9 AM", value: "0 9 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
  { label: "First of month", value: "0 0 1 * *" },
];

function describeCron(cron: string): string {
  const preset = PRESETS.find((p) => p.value === cron);
  if (preset) return preset.label;

  const parts = cron.split(" ");
  if (parts.length !== 5) return "Invalid cron expression";

  const [minute, hour] = parts;

  if (cron === "* * * * *") return "Every minute";
  if (minute.startsWith("*/")) return `Every ${minute.slice(2)} minutes`;
  if (hour === "*" && minute !== "*") return `At minute ${minute} of every hour`;
  if (hour !== "*" && minute !== "*") {
    const h = parseInt(hour);
    const m = parseInt(minute);
    const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    return `Daily at ${time}`;
  }

  return "Custom schedule";
}

export function CronField({ value, onChange, placeholder }: CronFieldProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "* * * * *"}
          className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
        />
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className={`px-3 py-2 rounded-md border transition-colors ${
            showPresets
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted"
          }`}
          title="Show presets"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {value && (
        <div className="text-xs text-primary">📅 {describeCron(value)}</div>
      )}

      {showPresets && (
        <div className="max-h-48 overflow-y-auto border border-border rounded-md bg-background">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${
                value === preset.value ? "bg-primary/10 text-primary" : ""
              }`}
              onClick={() => {
                onChange(preset.value);
                setShowPresets(false);
              }}
            >
              <span>{preset.label}</span>
              <span className="font-mono text-muted-foreground">{preset.value}</span>
            </button>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <code className="bg-muted px-1.5 py-0.5 rounded">minute hour day month weekday</code>
      </div>
    </div>
  );
}
