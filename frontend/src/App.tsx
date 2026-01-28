import { ReactFlowProvider } from "@xyflow/react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatusBar from "@/components/layout/StatusBar";
import NodeSettings from "@/components/layout/NodeSettings";
import Settings from "@/components/layout/Settings";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { useFlowStore } from "@/stores/flowStore";
import { useEffect, useState } from "react";

function SplashScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#1e1e1e]">
      <div className="text-center animate-in fade-in duration-500">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0">
              <div className="w-10 h-2 bg-white rounded-sm absolute top-3 left-3" />
              <div className="w-10 h-2 bg-white rounded-sm absolute top-7 left-3" />
              <div className="w-10 h-2 bg-white rounded-sm absolute top-11 left-3" />
              <div className="w-2 h-10 bg-white rounded-sm absolute top-3 right-3" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          ForgeFlow
        </h1>

        {/* Tagline */}
        <p className="text-[#858585] text-base font-medium mb-12">
          Local automation. Zero cloud. Full control.
        </p>

        {/* Loading Bar */}
        <div className="w-52 h-1 bg-[#2d2d30] rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Version */}
        <p className="text-[#858585] text-xs font-medium mt-6">v0.1.0</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isDarkMode, selectedNodeId, setSelectedNodeId, settingsOpen, setSettingsOpen } = useFlowStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    
    // Show splash for minimum 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isDarkMode]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden select-none">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <FlowCanvas />
          {selectedNodeId && (
            <NodeSettings
              selectedNodeId={selectedNodeId}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </div>
        <StatusBar />
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      </div>
    </ReactFlowProvider>
  );
}
