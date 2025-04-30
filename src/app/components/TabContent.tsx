import { motion, AnimatePresence } from "framer-motion";

export default function TabContent({ tabKey, activeTab, children }: {
  tabKey: string;
  activeTab: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === tabKey && (
        <motion.div
          key={tabKey}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
