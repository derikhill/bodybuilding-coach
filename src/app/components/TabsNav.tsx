import { Dumbbell, History, Apple } from 'lucide-react';

export default function TabsNav({ activeTab, setActiveTab }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { key: 'log', label: 'Log', icon: Dumbbell },
    { key: 'history', label: 'History', icon: History },
    { key: 'nutrition-history', label: 'Nutrition', icon: Apple },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around sm:hidden z-50">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex flex-col items-center justify-center px-4 py-2 text-xs ${
            activeTab === key ? 'text-blue-600 font-bold' : 'text-gray-500'
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
