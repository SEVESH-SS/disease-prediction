import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Leaf, AlertCircle, CheckCircle, ShoppingCart, Calendar, Droplets, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatment: string;
  product: string;
  productPrice: string;
  harvestDays: number;
  healthScore: number;
}

const mockDiagnosis: DiagnosisResult = {
  disease: "Early Blight",
  confidence: 98,
  severity: "medium",
  treatment: "Apply Mancozeb 75 WP fungicide. Remove affected leaves and ensure proper spacing for air circulation.",
  product: "Mancozeb 75 WP (500g)",
  productPrice: "₹450",
  harvestDays: 25,
  healthScore: 72,
};

const CropDoctor = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      startScanning(file);
    }
  };

  const startScanning = async (file: File) => {
    setIsScanning(true);
    setDiagnosis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/diagnose", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to analyze image");
      }

      const data = await response.json();
      setDiagnosis(data);
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      toast.error(error.message || "Error analyzing crop image. Make sure the backend is running.");
      resetScan();
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setUploadedImage(null);
    setDiagnosis(null);
    setIsScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-accent" />
          </div>
          Crop Doctor
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered disease detection & treatment recommendations
        </p>
      </motion.div>

      {/* Upload Zone */}
      <AnimatePresence mode="wait">
        {!uploadedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="block cursor-pointer">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="border-2 border-dashed border-accent/50 rounded-2xl p-12 bg-accent/5 hover:bg-accent/10 transition-colors"
                onClick={onUploadClick}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6"
                  >
                    <Upload className="w-10 h-10 text-accent" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">Upload Crop Image</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Take a clear photo of the affected leaf or plant part for accurate diagnosis
                  </p>
                  <div className="flex gap-3">
                    <Button variant="accent" size="touch" onClick={onUploadClick}>
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" size="touch" onClick={onUploadClick}>
                      <Upload className="w-5 h-5 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Image Preview with Scan Effect */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
              <img
                src={uploadedImage}
                alt="Uploaded crop"
                className="w-full h-64 lg:h-80 object-cover"
              />

              {/* Scanning Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    {/* Scan Line */}
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-accent shadow-neon"
                    />

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-primary-foreground font-semibold text-lg">Analyzing...</p>
                    <p className="text-primary-foreground/70 text-sm mt-1">Detecting diseases & pests</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Diagnosis Results */}
            <AnimatePresence>
              {diagnosis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Diagnosis Header */}
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-bento">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{diagnosis.disease}</h2>
                          <p className="text-sm text-muted-foreground">Fungal Infection</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">{diagnosis.confidence}%</div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${diagnosis.severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : diagnosis.severity === "medium"
                          ? "bg-terra-warning/10 text-terra-warning"
                          : "bg-accent/10 text-accent"
                        }`}>
                        {diagnosis.severity.charAt(0).toUpperCase() + diagnosis.severity.slice(1)} Severity
                      </span>
                    </div>

                    {/* Treatment */}
                    <div className="p-4 bg-secondary/50 rounded-xl">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        Recommended Treatment
                      </h3>
                      <p className="text-sm text-muted-foreground">{diagnosis.treatment}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Health Score */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-card rounded-2xl p-5 border border-border shadow-bento"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-terra-info" />
                        <span className="text-sm font-medium">Health Score</span>
                      </div>
                      <div className="text-3xl font-bold text-terra-warning mb-2">{diagnosis.healthScore}%</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${diagnosis.healthScore}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-terra-warning to-accent rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Harvest Prediction */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card rounded-2xl p-5 border border-border shadow-bento"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium">Harvest In</span>
                      </div>
                      <div className="text-3xl font-bold">{diagnosis.harvestDays}</div>
                      <p className="text-sm text-muted-foreground">days (if treated)</p>
                    </motion.div>
                  </div>

                  {/* Product Recommendation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-accent to-terra-neon-glow rounded-2xl p-5 text-accent-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-80 mb-1">Recommended Product</p>
                        <h3 className="text-lg font-bold">{diagnosis.product}</h3>
                        <p className="text-2xl font-bold mt-1">{diagnosis.productPrice}</p>
                      </div>
                      <Button variant="glass" size="touch" className="bg-card/20 hover:bg-card/30 text-accent-foreground border-card/30">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </motion.div>

                  {/* Reset Button */}
                  <Button variant="outline" size="lg" onClick={resetScan} className="w-full">
                    Scan Another Image
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropDoctor;
