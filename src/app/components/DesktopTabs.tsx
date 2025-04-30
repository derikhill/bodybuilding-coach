import { Dumbbell, History, Apple } from "lucide-react";

export default function DesktopTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { key: "log", label: "Log", icon: Dumbbell },
    { key: "history", label: "History", icon: History },
    { key: 'nutrition-history', label: 'Nutrition', icon: Apple }
  ];

  return (
    <div className="hidden sm:flex space-x-4 border-b mb-4">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 relative
            ${activeTab === key ? "text-blue-600 font-semibold glow-tab" : "text-gray-500 hover:text-blue-500"}
          `}
        >
          <Icon size={18} />
          {label}
          {activeTab === key && (
            <span className="absolute inset-0 rounded-md pointer-events-none tab-glow" />
          )}
        </button>
      ))}
    </div>
  );
}
