import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Leaf, AlertCircle, CheckCircle, ShoppingCart, Calendar, Droplets, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DiagnosisResult {
  disease: string;
  crop: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical" | "none";
  symptoms: string[];
  treatment: string;
  affected_area: string;
  additional_notes: string;
  // Optional legacy fields (for backward compatibility)
  product?: string;
  productPrice?: string;
  harvestDays?: number;
  healthScore?: number;
  recovery_plan?: {
    day: number;
    action: string;
    expectation: string;
  }[];
}

const mockDiagnosis: DiagnosisResult = {
  disease: "Early Blight",
  crop: "Tomato",
  confidence: 92,
  severity: "medium",
  symptoms: ["Dark brown spots with concentric rings", "Yellowing of surrounding tissue", "Lower leaves affected first"],
  treatment: "Apply copper-based fungicide weekly. Remove and destroy infected leaves. Improve air circulation and avoid overhead watering.",
  affected_area: "25-30%",
  additional_notes: "Disease is in early stage and can be controlled with proper treatment",
  product: "Copper-based Fungicide (500ml)",
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
        throw new Error(errorData.error || errorData.message || errorData.detail || "Failed to analyze image");
      }

      const data = await response.json();

      // Validate the response has required fields
      if (!data.disease || !data.crop) {
        throw new Error("Invalid response from AI model");
      }

      setDiagnosis(data);
      toast.success(`✅ Disease detected: ${data.disease}`);
    } catch (error: any) {
      console.error("Diagnosis error:", error);

      // Provide specific error messages
      if (error.message.includes("fetch")) {
        toast.error("❌ Cannot connect to backend server. Make sure it's running on port 8000.");
      } else if (error.message.includes("GROQ_API_KEY")) {
        toast.error("❌ AI service not configured. Please check GROQ_API_KEY.");
      } else {
        toast.error(error.message || "Error analyzing crop image.");
      }

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
                  {/* Diagnosis Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${diagnosis.severity === "none"
                        ? "bg-accent/20 text-accent"
                        : "bg-destructive/20 text-destructive"
                        }`}>
                        {diagnosis.severity === "none" ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <AlertCircle className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{diagnosis.crop}</p>
                        <h2 className="text-2xl font-bold leading-tight">{diagnosis.disease}</h2>
                      </div>
                    </div>
                    <div className="bg-accent/10 px-6 py-3 rounded-2xl border border-accent/20 text-center">
                      <div className="text-3xl font-black text-accent">{diagnosis.confidence}%</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent/70">Confidence</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${diagnosis.severity === "critical" || diagnosis.severity === "high"
                      ? "bg-destructive text-destructive-foreground"
                      : diagnosis.severity === "medium"
                        ? "bg-terra-warning text-terra-warning-foreground"
                        : diagnosis.severity === "low"
                          ? "bg-terra-info text-terra-info-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}>
                      {diagnosis.severity} Severity
                    </span>
                    {diagnosis.affected_area && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground shadow-sm">
                        Affected: {diagnosis.affected_area}
                      </span>
                    )}
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Symptoms Card */}
                    {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                      <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/10">
                        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          Visible Symptoms
                        </h3>
                        <ul className="space-y-3">
                          {diagnosis.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start gap-3 group">
                              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-destructive/20 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                              </div>
                              <span className="text-sm text-foreground/80 leading-relaxed font-medium">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Treatment Card */}
                    <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 text-accent">
                        <CheckCircle className="w-4 h-4" />
                        Recommended Treatment
                      </h3>
                      <div className="prose prose-sm prose-accent dark:prose-invert">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                          {diagnosis.treatment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes Card */}
                  {diagnosis.additional_notes && (
                    <div className="bg-secondary/30 rounded-2xl p-6 border border-border/50">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 text-muted-foreground">
                        <Leaf className="w-4 h-4" />
                        Expert Observations
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{typeof diagnosis.additional_notes === 'string'
                          ? diagnosis.additional_notes
                          : JSON.stringify(diagnosis.additional_notes)}"
                      </p>
                    </div>
                  )}

                  {/* Recovery Timeline Section */}
                  {diagnosis.recovery_plan && diagnosis.recovery_plan.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2 text-accent">
                        <Calendar className="w-4 h-4" />
                        Recovery Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {diagnosis.recovery_plan.map((step, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className="bg-card border border-border rounded-xl p-4 relative overflow-hidden group hover:border-accent/40 transition-colors"
                          >
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                              <span className="text-4xl font-black italic">D{step.day}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                Day {step.day}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold italic">Action</p>
                                <p className="text-xs font-semibold leading-tight">{step.action}</p>
                              </div>
                              <div className="pt-2 border-t border-border/50">
                                <p className="text-[10px] uppercase tracking-tighter text-terra-info font-bold italic">Expected Result</p>
                                <p className="text-[11px] text-muted-foreground leading-tight italic">{step.expectation}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  {(diagnosis.healthScore || diagnosis.harvestDays) && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Health Score */}
                      {diagnosis.healthScore && (
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
                      )}

                      {/* Harvest Prediction */}
                      {diagnosis.harvestDays && (
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
                      )}
                    </div>
                  )}

                  {/* Product Recommendation */}
                  {diagnosis.product && diagnosis.productPrice && (
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
                  )}

                  {/* Reset Button */}
                  <Button variant="outline" size="lg" onClick={resetScan} className="w-full">
                    <RefreshCw className="w-5 h-5 mr-2" />
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
