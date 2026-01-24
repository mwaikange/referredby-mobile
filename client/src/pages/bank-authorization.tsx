import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function BankAuthorization() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#00736e] rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Logo</span>
          </div>
          <h2 className="font-bold text-sm">DESTINY GROUP PTY LTD</h2>
          <p className="text-[10px] text-gray-500">CC Reg: Pty/09/20094</p>
          <p className="text-[10px] text-gray-500">Namibia Reg: NPL200_bf</p>
          <p className="text-[10px] text-gray-500">info@destinygroup.com.na | +26461200698</p>
          <p className="text-[10px] text-gray-500">Erf 567 / Unit 686-A Kolinger Street Windhoek Namibia</p>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xs font-bold uppercase mb-3">CLIENT DETAILS</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span>OAKAFOR JOHN</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Surname</span><span>JOHN</span></div>
            <div className="flex justify-between"><span className="text-gray-500">ID Number</span><span>8629360009</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile Number</span><span>+264857384666</span></div>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xs font-bold uppercase mb-3">BANKING DETAILS</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Bank Name</span><span>Standard Bank Namibia</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Branch Code</span><span>70098</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Branch Town</span><span>Katutura Branch</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Account Number</span><span>60008292656</span></div>
            <div className="flex justify-between"><span className="text-gray-500">UPI/PP Address</span><span>@264857384666</span></div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 border-2 border-[#00736e] text-[#00736e] font-bold uppercase text-xs mb-6 rounded-lg"
        >
          Download Consent PDF
        </Button>

        <div className="mb-6 text-xs">
          <p className="mb-2">Download authorization form:</p>
          <ul className="list-disc pl-4 text-gray-500 space-y-1">
            <li>Sign and upload it with :</li>
            <li>Latest Payslip</li>
            <li>3 Months teller printed Bankstatement</li>
            <li className="text-red-500">(stamp not older than 3 days – must reflect all 3 salaries)</li>
            <li className="text-red-500">Maximum 4MB per file</li>
          </ul>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-xs">Bank Account Debit Consent</span>
            <Button size="sm" className="bg-[#00736e] text-white text-[10px] h-8 px-4 rounded">
              CHOOSE FILE
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-xs">Latest Payslip</span>
            <Button size="sm" className="bg-[#00736e] text-white text-[10px] h-8 px-4 rounded">
              CHOOSE FILE
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-xs">Bank Statement (3 Months)</span>
            <Button size="sm" className="bg-[#00736e] text-white text-[10px] h-8 px-4 rounded">
              CHOOSE FILE
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-xs">Affordability Assessment</span>
            <Button size="sm" className="bg-[#00736e] text-white text-[10px] h-8 px-4 rounded">
              CHOOSE FILE
            </Button>
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg">
            Submit
          </Button>
          
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
