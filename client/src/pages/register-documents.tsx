import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function RegisterDocuments() {
  const [, setLocation] = useLocation();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const idInputRef = useRef<HTMLInputElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIncomeFile(file);
    }
  };

  const handleProceed = () => {
    if (!idFile || !incomeFile) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/register-success");
    }, 500);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-xl font-bold text-center mb-6" data-testid="text-title">
          UPLOAD REQUIRED<br />DOCUMENTS
        </h1>

        <div className="space-y-4 flex-1">
          {/* National ID Section */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              National Identification Card
            </label>
            <div 
              className="bg-gray-100 rounded-lg px-4 py-3 cursor-pointer border border-gray-200"
              onClick={() => idInputRef.current?.click()}
              data-testid="button-choose-id"
            >
              <span className="text-sm text-gray-600" data-testid="text-id-file">
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

          {/* Proof of Income Section */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Payslip
            </label>
            <div 
              className="bg-gray-100 rounded-lg px-4 py-3 cursor-pointer border border-gray-200"
              onClick={() => incomeInputRef.current?.click()}
              data-testid="button-choose-income"
            >
              <span className="text-sm text-gray-600" data-testid="text-income-file">
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
        </div>

        {/* Dark blue panel for bottom section */}
        <div className="bg-[#0B0B3B] rounded-lg p-4 mt-4">
          <p className="text-xs text-white/80 text-center mb-4">
            All these form will be valid for 6 months only, afterwhich they must be renewed and re-uploaded.
          </p>

          <Button
            onClick={handleProceed}
            disabled={!idFile || !incomeFile || isLoading}
            className="w-full bg-[#00736e] hover:bg-[#005c58] text-white font-bold py-3 rounded-lg disabled:opacity-50"
            data-testid="button-proceed"
          >
            {isLoading ? "UPLOADING..." : "PROCEED"}
          </Button>

          <p className="text-xs text-white/70 text-center mt-3">
            Please make sure all required documents are uploaded for immediate approval.
          </p>
        </div>
      </div>
    </Layout>
  );
}
