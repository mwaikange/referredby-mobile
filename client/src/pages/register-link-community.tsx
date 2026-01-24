import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function RegisterLinkCommunity() {
  const [, setLocation] = useLocation();
  const [referralPartner, setReferralPartner] = useState("");
  const [lendingSociety, setLendingSociety] = useState("");
  const [portfolioHolder, setPortfolioHolder] = useState("");

  useEffect(() => {
    const partner = sessionStorage.getItem("registration_referral_partner") || "Niksman Groot";
    const society = sessionStorage.getItem("registration_lending_society") || "kayla Industries";
    const holder = sessionStorage.getItem("registration_portfolio_holder") || "Destiny Group Pty LTD";
    setReferralPartner(partner);
    setLendingSociety(society);
    setPortfolioHolder(holder);
  }, []);

  const handleProceed = () => {
    setLocation("/register-personal-info");
  };

  const handleBack = () => {
    setLocation("/register-referral");
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4" data-testid="text-title">
          LINK TO COMMUNITY
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          The referral link used is associated with the following lending society:
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-700">Referral Partner :</p>
            <p className="text-sm text-gray-600" data-testid="text-referral-partner">{referralPartner}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Lending Society :</p>
            <p className="text-sm text-gray-600" data-testid="text-lending-society">{lendingSociety}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Portfolio Holder:</p>
            <p className="text-sm text-gray-600" data-testid="text-portfolio-holder">{portfolioHolder}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-center mb-3">You are currently linking to:</p>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-700" data-testid="text-linking-to">{lendingSociety}</p>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleProceed}
            className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
            data-testid="button-proceed"
          >
            Proceed
          </Button>
          <Button
            onClick={handleBack}
            className="w-full h-12 bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold tracking-wide rounded-lg"
            data-testid="button-back"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
