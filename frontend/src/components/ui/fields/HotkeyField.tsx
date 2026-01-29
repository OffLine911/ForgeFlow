import { useState, useRef } from "react";
import { Keyboard, X } from "lucide-react";

interface HotkeyFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HotkeyField({ value, onChange, placeholder }: HotkeyFieldProps) {
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recording) return;

    e.preventDefault();
    e.stopPropagation();

    const parts: string[] = [];

    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey) parts.push("Meta");

    let key = e.key;

    if (key === " ") key = "Space";
    else if (key === "Control" || key === "Alt" || key === "Shift" || key === "Meta") {
      return;
    } else if (key.length === 1) key = key.toUpperCase();
    else if (key === "ArrowUp") key = "Up";
    else if (key === "ArrowDown") key = "Down";
    else if (key === "ArrowLeft") key = "Left";
    else if (key === "ArrowRight") key = "Right";

    parts.push(key);

    const hotkey = parts.join("+");
    onChange(hotkey);
    setRecording(false);
    inputRef.current?.blur();
  };

  const startRecording = () => {
    setRecording(true);
    inputRef.current?.focus();
  };

  const clearHotkey = () => {
    onChange("");
    setRecording(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={recording ? "Press keys..." : value || ""}
          readOnly
          placeholder={placeholder || "Click to record..."}
          className={`flex-1 px-3 py-2 text-sm text-center bg-background border rounded-md cursor-pointer focus:outline-none focus:ring-2 ${
            recording
              ? "border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/50 animate-pulse"
              : "border-border focus:ring-primary/50"
          }`}
          onKeyDown={handleKeyDown}
          onBlur={() => setRecording(false)}
          onClick={startRecording}
        />
        {value && (
          <button
            type="button"
            onClick={clearHotkey}
            className="px-3 py-2 rounded-md border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            title="Clear hotkey"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {value && (
        <div className="flex gap-2 flex-wrap">
          {value.split("+").map((key, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded"
            >
              {key}
            </span>
          ))}
        </div>
      )}

      {recording && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
          <Keyboard className="w-3 h-3" />
          Recording... Press any key combination
        </div>
      )}
    </div>
  );
}
