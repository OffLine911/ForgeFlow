import { create } from 'zustand';
import type { AppSettings } from '@/types/settings';
import { defaultSettings } from '@/types/settings';
import { SaveSettings, LoadSettings } from '../../wailsjs/go/main/Storage';
import { toast } from '@/stores/dialogStore';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  isDirty: boolean;
  
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  updateSettings: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => Promise<void>;
  applyTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  isDirty: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settingsJSON = await LoadSettings();
      const loadedSettings = JSON.parse(settingsJSON);
      const mergedSettings = { ...defaultSettings, ...loadedSettings };
      set({ settings: mergedSettings, isDirty: false });
      get().applyTheme();
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.warning('Settings load failed', 'Using default settings');
      set({ settings: defaultSettings });
    } finally {
      set({ isLoading: false });
    }
  },

  saveSettings: async () => {
    const { settings } = get();
    try {
      await SaveSettings(JSON.stringify(settings));
      set({ isDirty: false });
      toast.success('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  updateSettings: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
      isDirty: true,
    }));
    
    // Auto-apply visual settings immediately
    if (['theme', 'isDarkMode', 'accentColor', 'fontSize', 'reduceMotion'].includes(key)) {
      get().applyTheme();
    }
    
    // Auto-save after a short delay
    const { settings } = get();
    if (settings.autoSave) {
      setTimeout(() => {
        get().saveSettings();
      }, 500);
    }
  },

  resetSettings: async () => {
    set({ settings: defaultSettings, isDirty: true });
    get().applyTheme();
    await get().saveSettings();
  },

  applyTheme: () => {
    const { settings } = get();
    const root = document.documentElement;
    
    // Apply dark mode
    root.classList.toggle('dark', settings.isDarkMode);
    
    // Apply theme
    root.setAttribute('data-theme', settings.theme === 'vscode' ? '' : settings.theme);
    
    // Apply accent color as CSS variable
    root.style.setProperty('--accent-color', settings.accentColor);
    
    // Apply font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    
    // Apply reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Apply UI density
    root.setAttribute('data-density', settings.uiDensity);
  },
}));
