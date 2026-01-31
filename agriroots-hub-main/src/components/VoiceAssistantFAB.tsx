import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

export function VoiceAssistantFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden"
            onClick={handleToggle}
          />
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isOpen
            ? "bg-foreground text-background"
            : "bg-accent text-accent-foreground neon-glow"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Mic className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Voice Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-36 lg:bottom-24 right-4 lg:right-6 z-50 w-72 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-center mb-4">
                Voice Assistant
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Speak in Tamil, English, or Thanglish
              </p>

              {/* Waveform Animation */}
              <div className="flex items-end justify-center gap-1 h-16 mb-4">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-accent rounded-full"
                    animate={
                      isListening
                        ? {
                            height: ["20%", "100%", "20%"],
                          }
                        : { height: "20%" }
                    }
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                    style={{ height: "20%" }}
                  />
                ))}
              </div>

              <p className="text-sm text-center text-muted-foreground">
                {isListening ? "Listening..." : "Tap mic to start"}
              </p>

              {/* Sample Commands */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-muted-foreground">Try saying:</p>
                <div className="flex flex-wrap gap-2">
                  {["What's the weather?", "Tomato price", "Pest alert"].map(
                    (cmd) => (
                      <span
                        key={cmd}
                        className="text-xs px-2 py-1 bg-secondary rounded-full"
                      >
                        "{cmd}"
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
