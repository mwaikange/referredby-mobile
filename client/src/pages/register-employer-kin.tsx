import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INCOME_SOURCES = [
  "Salary",
  "Self Employed",
  "Pension",
  "Business Income",
  "Rental Income",
  "Other"
];

export default function RegisterEmployerKin() {
  const [, setLocation] = useLocation();
  const [employerName, setEmployerName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employerOfficeNumber, setEmployerOfficeNumber] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [sourceOfIncome, setSourceOfIncome] = useState("");
  const [nextOfKinFullName, setNextOfKinFullName] = useState("");
  const [nextOfKinSurname, setNextOfKinSurname] = useState("");
  const [relationship, setRelationship] = useState("");
  const [nextOfKinMobile, setNextOfKinMobile] = useState("");
  const [poBox, setPoBox] = useState("");
  const [showIncomeDropdown, setShowIncomeDropdown] = useState(false);
  const [error, setError] = useState("");

  const handleProceed = () => {
    if (!employerName || !occupation || !sourceOfIncome || !nextOfKinFullName || !nextOfKinSurname || !relationship || !nextOfKinMobile) {
      setError("Please fill in all required fields");
      return;
    }

    sessionStorage.setItem("registration_employer", employerName);
    sessionStorage.setItem("registration_occupation", occupation);
    sessionStorage.setItem("registration_office_number", employerOfficeNumber);
    sessionStorage.setItem("registration_employee_code", employeeCode);
    sessionStorage.setItem("registration_source_income", sourceOfIncome);
    sessionStorage.setItem("registration_source_funds", sourceOfIncome);
    sessionStorage.setItem("registration_nok_name", nextOfKinFullName);
    sessionStorage.setItem("registration_nok_surname", nextOfKinSurname);
    sessionStorage.setItem("registration_nok_relationship", relationship);
    sessionStorage.setItem("registration_nok_mobile", nextOfKinMobile);
    sessionStorage.setItem("registration_po_box", poBox);

    setLocation("/register-set-pin");
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-xl font-bold text-center mb-6" data-testid="text-title">
          EMPLOYER & NEXT OF KIN
        </h1>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Employer Name</label>
            <Input
              type="text"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-employer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Occupation</label>
            <Input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-occupation"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Employer Office Number</label>
            <Input
              type="tel"
              value={employerOfficeNumber}
              onChange={(e) => setEmployerOfficeNumber(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-office-number"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Employee Code</label>
            <Input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="E.G. EMP001"
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-employee-code"
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Source of Income/Funds</label>
            <div
              className="h-10 bg-gray-100 border border-gray-200 rounded px-3 flex items-center justify-between cursor-pointer text-sm"
              onClick={() => setShowIncomeDropdown(!showIncomeDropdown)}
              data-testid="dropdown-income"
            >
              <span className={sourceOfIncome ? "text-gray-900" : "text-gray-400"}>
                {sourceOfIncome || "Select source of income"}
              </span>
              <span className="text-gray-400">▼</span>
            </div>
            {showIncomeDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto">
                {INCOME_SOURCES.map((source) => (
                  <div
                    key={source}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setSourceOfIncome(source);
                      setShowIncomeDropdown(false);
                    }}
                    data-testid={`option-income-${source}`}
                  >
                    {source}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Next of Kin : Full Name</label>
            <Input
              type="text"
              value={nextOfKinFullName}
              onChange={(e) => setNextOfKinFullName(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-kin-fullname"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Next of Kin : Surname</label>
            <Input
              type="text"
              value={nextOfKinSurname}
              onChange={(e) => setNextOfKinSurname(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-kin-surname"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Relationship</label>
            <Input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-relationship"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Next of Kin : Mobile Number</label>
            <Input
              type="tel"
              value={nextOfKinMobile}
              onChange={(e) => setNextOfKinMobile(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-kin-mobile"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">P.O. Box (Optional)</label>
            <Input
              type="text"
              value={poBox}
              onChange={(e) => setPoBox(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-pobox"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
          )}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleProceed}
            className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
            data-testid="button-proceed"
          >
            PROCEED
          </Button>
        </div>
      </div>
    </Layout>
  );
}
