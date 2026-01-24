import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { api } from "@/lib/api";

export default function RegisterKyc() {
  const [, setLocation] = useLocation();
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelfieFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleProceed = async () => {
    if (!selfieFile) {
      setError("Please upload a selfie");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const userId = sessionStorage.getItem("registration_user_id");
      if (userId) {
        await api.upload.selfie(userId, selfieFile);
      }
      setLocation("/register-documents");
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-xl font-bold text-center mb-2" data-testid="text-title">
          KNOW YOUR CUSTOMER (KYC)
        </h1>
        
        <h2 className="text-lg font-semibold text-center mb-3" data-testid="text-subtitle">
          Upload a Selfie
        </h2>

        <p className="text-xs text-gray-500 text-center mb-4 px-2">
          Click the camera icon below and upload a selfie with you holding your ID just below your chin and today's date written on a white paper as indicated on the photo below.
        </p>

        {/* Dark blue camera area */}
        <div 
          className="bg-[#0B0B3B] rounded-lg mx-auto w-full h-64 flex items-center justify-center cursor-pointer mb-8"
          onClick={handleCameraClick}
          data-testid="button-camera-area"
        >
          {selfiePreview ? (
            <img 
              src={selfiePreview} 
              alt="Selfie preview" 
              className="w-full h-full object-cover rounded-lg"
              data-testid="img-selfie-preview"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Upload section with gray background accent */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <label className="text-sm text-gray-700 mb-2 block">Upload selfie with ID</label>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded"
              data-testid="button-choose-file"
            >
              CHOOSE FILE
            </Button>
            <span className="text-sm text-gray-500" data-testid="text-file-name">
              {selfieFile ? selfieFile.name : "No file chosen"}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4" data-testid="text-error">{error}</p>
        )}

        <div className="mt-auto pt-4">
          <Button
            onClick={handleProceed}
            disabled={!selfieFile || isLoading}
            className="w-full bg-[#6B7280] hover:bg-[#4B5563] text-white font-bold py-3 rounded-lg disabled:opacity-50"
            data-testid="button-proceed"
          >
            {isLoading ? "UPLOADING..." : "PROCEED"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
