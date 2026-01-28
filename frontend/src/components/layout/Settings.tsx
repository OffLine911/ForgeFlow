import { X, Moon, Sun, Palette, Zap, Database, Bell, Shield, Code } from "lucide-react";
import { useFlowStore } from "@/stores/flowStore";
import { cn } from "@/lib/utils";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { isDarkMode, toggleDarkMode, theme, setTheme } = useFlowStore();

  const themes = [
    { id: 'vscode', name: 'VS Code Dark', preview: 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)' },
    { id: 'raycast', name: 'Raycast', preview: 'linear-gradient(135deg, #1c1c1e 0%, #28282a 100%)' },
    { id: 'github', name: 'GitHub Dark', preview: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' },
    { id: 'nord', name: 'Nord', preview: 'linear-gradient(135deg, #2e3440 0%, #3b4252 100%)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[600px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Compact Sidebar */}
        <div className="w-16 bg-gradient-to-b from-muted/40 to-muted/20 border-r border-border/50 p-2 flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 mt-1">
            <span className="text-primary font-bold text-sm">FF</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-1 w-full">
            <button 
              className="group relative w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center transition-all hover:scale-105"
              title="Appearance"
            >
              <Palette className="w-5 h-5 text-primary" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Appearance
              </div>
            </button>
            
            <button 
              className="group relative w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Performance"
            >
              <Zap className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Performance
              </div>
            </button>
            
            <button 
              className="group relative w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Storage"
            >
              <Database className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Storage
              </div>
            </button>
            
            <button 
              className="group relative w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Notifications
              </div>
            </button>
            
            <button 
              className="group relative w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Security"
            >
              <Shield className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Security
              </div>
            </button>
            
            <button 
              className="group relative w-12 h-12 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-all hover:scale-105"
              title="Advanced"
            >
              <Code className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Advanced
              </div>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all hover:scale-105 mb-1"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Appearance</h3>
                  <p className="text-xs text-muted-foreground">Customize your workspace</p>
                </div>
              </div>

              {/* Theme Section */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-3 block">Color Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                          theme === t.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            theme === t.id ? "bg-primary/20" : "bg-muted"
                          )}>
                            <Palette className={cn("w-4 h-4", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <span className="font-semibold text-sm">{t.name}</span>
                        </div>
                        <div 
                          className="h-20 rounded-lg border border-border shadow-inner"
                          style={{ background: t.preview }}
                        />
                        {theme === t.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-3 block">Theme Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => !isDarkMode && toggleDarkMode()}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        isDarkMode
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isDarkMode ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Moon className={cn("w-4 h-4", isDarkMode ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <span className="font-semibold text-sm">Dark</span>
                      </div>
                      <div className="h-20 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-inner" />
                      {isDarkMode && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => isDarkMode && toggleDarkMode()}
                      className={cn(
                        "group relative p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                        !isDarkMode
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          !isDarkMode ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Sun className={cn("w-4 h-4", !isDarkMode ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <span className="font-semibold text-sm">Light</span>
                      </div>
                      <div className="h-20 rounded-lg bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border border-slate-300 shadow-inner" />
                      {!isDarkMode && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Accent Color</label>
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      { name: "Blue", color: "oklch(0.65 0.2 250)" },
                      { name: "Purple", color: "oklch(0.6 0.2 300)" },
                      { name: "Pink", color: "oklch(0.6 0.2 340)" },
                      { name: "Red", color: "oklch(0.55 0.22 25)" },
                      { name: "Orange", color: "oklch(0.65 0.2 50)" },
                      { name: "Yellow", color: "oklch(0.7 0.18 80)" },
                      { name: "Green", color: "oklch(0.6 0.18 145)" },
                      { name: "Teal", color: "oklch(0.6 0.18 180)" },
                    ].map((accent, i) => (
                      <button
                        key={accent.name}
                        className={cn(
                          "w-11 h-11 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg relative",
                          i === 0 ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: accent.color }}
                        title={accent.name}
                      >
                        {i === 0 && (
                          <div className="absolute inset-0 rounded-lg bg-white/20" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UI Density */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">Interface Density</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="px-4 py-3 rounded-lg border border-border hover:border-primary/50 text-sm transition-all hover:scale-[1.02]">
                      <div className="font-medium mb-1">Compact</div>
                      <div className="text-xs text-muted-foreground">Dense</div>
                    </button>
                    <button className="px-4 py-3 rounded-lg border-2 border-primary bg-primary/5 text-sm shadow-lg shadow-primary/10">
                      <div className="font-semibold mb-1">Default</div>
                      <div className="text-xs text-muted-foreground">Balanced</div>
                    </button>
                    <button className="px-4 py-3 rounded-lg border border-border hover:border-primary/50 text-sm transition-all hover:scale-[1.02]">
                      <div className="font-medium mb-1">Spacious</div>
                      <div className="text-xs text-muted-foreground">Relaxed</div>
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Smooth Animations</div>
                        <div className="text-xs text-muted-foreground">Enable transitions</div>
                      </div>
                    </div>
                    <button className="relative w-11 h-6 bg-primary rounded-full transition-all hover:shadow-lg hover:shadow-primary/30">
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-primary-foreground rounded-full shadow-md transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Reduce Motion</div>
                        <div className="text-xs text-muted-foreground">Accessibility mode</div>
                      </div>
                    </div>
                    <button className="relative w-11 h-6 bg-muted rounded-full transition-all hover:shadow-lg">
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-background rounded-full shadow-md transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <label className="text-sm font-semibold mb-3 block">Font Scale</label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-medium">A</span>
                    <input
                      type="range"
                      min="12"
                      max="18"
                      defaultValue="14"
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground font-medium">A</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Small</span>
                    <span className="text-xs text-primary font-medium">14px</span>
                    <span className="text-xs text-muted-foreground">Large</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
