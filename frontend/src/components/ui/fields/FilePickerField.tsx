import { useState } from "react";
import { FolderOpen, File } from "lucide-react";
import { SelectFile } from "../../../../wailsjs/go/main/App";

interface FilePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mode?: "open" | "save";
  filters?: string;
}

export function FilePickerField({
  value,
  onChange,
  placeholder,
  mode = "open",
}: FilePickerFieldProps) {
  const [error, setError] = useState("");

  const handleBrowse = async () => {
    try {
      const result = await SelectFile("Select File", []);

      if (result) {
        onChange(result);
        setError("");
      }
    } catch (e: any) {
      setError(e.message || "Failed to select file");
    }
  };

  const getFileName = (path: string) => {
    if (!path) return "";
    const parts = path.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (mode === "save" ? "Select save location..." : "Select file...")}
          className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="button"
          onClick={handleBrowse}
          className="px-3 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          title={mode === "save" ? "Choose save location" : "Browse files"}
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>

      {value && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <File className="w-3 h-3" />
          <span>{getFileName(value)}</span>
        </div>
      )}

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
