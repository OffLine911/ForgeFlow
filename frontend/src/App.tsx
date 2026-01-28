import { ReactFlowProvider } from "@xyflow/react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatusBar from "@/components/layout/StatusBar";
import NodeSettings from "@/components/layout/NodeSettings";
import Settings from "@/components/layout/Settings";
import FlowCanvas from "@/components/flow/FlowCanvas";
import { useFlowStore } from "@/stores/flowStore";
import { useEffect } from "react";

export default function App() {
  const { isDarkMode, selectedNodeId, setSelectedNodeId, settingsOpen, setSettingsOpen } = useFlowStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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
