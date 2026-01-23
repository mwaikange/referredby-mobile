import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function TermLoans() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          TERM LOANS
        </h1>

        <div className="text-sm text-gray-800 leading-relaxed space-y-4 mb-8">
          <p>Term loans differ from Nano Loans in the following ways:</p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>They are repayable over a period of 6 to 12 months.</li>
            <li>The maximum loan amount is determined by the Lending Society.</li>
          </ul>

          <p>
            However, due to the longer repayment period, traditional loan requirements apply, 
            and the following documentation must be submitted:
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li>A teller-printed 3-month bank statement, reflecting all three salary deposits, and not older than 3 days.</li>
            <li>The latest payslip.</li>
            <li>A signed bank debit authorization form.</li>
          </ul>

          <p>
            All submitted documents will remain valid for the duration of the loan period 
            and must be updated once they expire.
          </p>

          <p>
            Bank debit authorization is mandatory, as loan instalments will be deducted 
            directly from a salaried bank account.
          </p>

          <p>
            Loan disbursement will be made to the verified bank account as per Bank Statement.
          </p>

          <p>
            A credit bureau enquiry, together with the Net Disposable Income (NDI), 
            will be used to assess loan affordability.
          </p>

          <p>Once you have:</p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Updated your bank details,</li>
            <li>Submitted your Net Disposable Income, and</li>
            <li>Completed the bank authorization with all required documentation,</li>
          </ul>

          <p>
            the "Request Term Loan" button will become available, 
            allowing you to submit a term loan request.
          </p>
        </div>

        <div className="space-y-4 pb-10">
          <Button 
            onClick={() => setLocation("/banking-details")}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Enter Bank Details
          </Button>
          
          <Button 
            onClick={() => setLocation("/net-disposable-income")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Net Disposable Income
          </Button>
          
          <Button 
            onClick={() => setLocation("/bank-authorization")}
            className="w-full bg-white hover:bg-gray-50 text-black font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg border-2 border-gray-300"
          >
            Bank Authorization
          </Button>
          
          <Button 
            onClick={() => setLocation("/term-interest-confirmation")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Request Term Loan
          </Button>
          
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
