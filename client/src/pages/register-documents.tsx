import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { api } from "@/lib/api";

export default function RegisterDocuments() {
  const [, setLocation] = useLocation();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const idInputRef = useRef<HTMLInputElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setIdFile(file);
      setError("");
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setIncomeFile(file);
      setError("");
    }
  };

  const handleProceed = async () => {
    if (!idFile || !incomeFile) {
      setError("Please upload all required documents");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const userId = sessionStorage.getItem("registration_user_id");
      if (userId) {
        const uploadResult = await api.upload.documents(userId, idFile, incomeFile);
        
        if (uploadResult.national_id_url && uploadResult.payslip_url) {
          await api.users.updateDocuments(userId, {
            national_id_url: uploadResult.national_id_url,
            payslip_url: uploadResult.payslip_url,
          });
        }
      }
      setLocation("/register-success");
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-xl font-bold text-center mb-6" data-testid="text-title">
          UPLOAD REQUIRED<br />DOCUMENTS
        </h1>

        <div className="space-y-5 flex-1">
          {/* National ID Section with gray background accent */}
          <div className="bg-gray-100 rounded-lg p-4">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              National Identification Card
            </label>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => idInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded"
                data-testid="button-choose-id"
              >
                CHOOSE FILE
              </Button>
              <span className="text-sm text-gray-500" data-testid="text-id-file">
                {idFile ? idFile.name : "No file chosen"}
              </span>
            </div>
            <input
              ref={idInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleIdChange}
              className="hidden"
              data-testid="input-id-file"
            />
          </div>

          {/* Proof of Income Section with gray background accent */}
          <div className="bg-gray-100 rounded-lg p-4">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              Proof of Income
            </label>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => incomeInputRef.current?.click()}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded"
                data-testid="button-choose-income"
              >
                CHOOSE FILE
              </Button>
              <span className="text-sm text-gray-500" data-testid="text-income-file">
                {incomeFile ? incomeFile.name : "No file chosen"}
              </span>
            </div>
            <input
              ref={incomeInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleIncomeChange}
              className="hidden"
              data-testid="input-income-file"
            />
          </div>

          <p className="text-xs text-gray-500 text-center px-4">
            All these form will be valid for 6 months only, afterwhich they must be renewed and re-uploaded.
          </p>

          {error && (
            <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
          )}
        </div>

        <div className="mt-auto space-y-4 pt-4">
          <Button
            onClick={handleProceed}
            disabled={!idFile || !incomeFile || isLoading}
            className="w-full bg-[#0B0B3B] hover:bg-[#1a1a5c] text-white font-bold py-3 rounded-lg disabled:opacity-50"
            data-testid="button-proceed"
          >
            {isLoading ? "UPLOADING..." : "PROCEED"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Please make sure all required documents are uploaded for immediate approval.
          </p>
        </div>
      </div>
    </Layout>
  );
}
