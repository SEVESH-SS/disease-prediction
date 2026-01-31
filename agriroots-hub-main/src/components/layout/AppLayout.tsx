import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { VoiceAssistantFAB } from "../VoiceAssistantFAB";
import { MarketTicker } from "../dashboard/MarketTicker";

interface AppLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Market Ticker - Desktop */}
        <div className="hidden lg:block sticky top-0 z-40 bg-primary text-primary-foreground">
          <MarketTicker />
        </div>

        {/* Market Ticker - Mobile */}
        <div className="lg:hidden sticky top-0 z-40 bg-primary text-primary-foreground">
          <MarketTicker />
        </div>

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 lg:p-6 pb-24 lg:pb-6"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <BottomNav />
      <VoiceAssistantFAB />
    </div>
  );
}
