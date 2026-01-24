import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const REGIONS = [
  "ERONGO",
  "HARDAP",
  "KARAS",
  "KAVANGO EAST",
  "KAVANGO WEST",
  "KHOMAS",
  "KUNENE",
  "OHANGWENA",
  "OMAHEKE",
  "OMUSATI",
  "OSHANA",
  "OSHIKOTO",
  "OTJOZONDJUPA",
  "ZAMBEZI"
];

export default function RegisterPersonalInfo() {
  const [, setLocation] = useLocation();
  const [surname, setSurname] = useState("");
  const [fullNames, setFullNames] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [town, setTown] = useState("");
  const [streetName, setStreetName] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [error, setError] = useState("");

  const filteredRegions = REGIONS.filter(r => 
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleProceed = async () => {
    if (!surname || !fullNames || !idNumber || !mobileNumber || !email || !region) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const uniqueCheck = await api.auth.checkUniqueness(idNumber, mobileNumber, email);
      
      if (uniqueCheck.id_number_exists) {
        setError("This ID number is already registered");
        setIsLoading(false);
        return;
      }
      if (uniqueCheck.mobile_exists) {
        setError("This mobile number is already registered");
        setIsLoading(false);
        return;
      }
      if (uniqueCheck.email_exists) {
        setError("This email is already registered");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("registration_surname", surname);
      sessionStorage.setItem("registration_fullnames", fullNames);
      sessionStorage.setItem("registration_id_number", idNumber);
      sessionStorage.setItem("registration_mobile", mobileNumber);
      sessionStorage.setItem("registration_email", email);
      sessionStorage.setItem("registration_region", region);
      sessionStorage.setItem("registration_town", town);
      sessionStorage.setItem("registration_street", streetName);
      sessionStorage.setItem("registration_address", physicalAddress);
      sessionStorage.setItem("registration_gender", gender);

      setLocation("/register-employer-kin");
    } catch (err: any) {
      setError(err.message || "Validation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <h1 className="text-xl font-bold text-center mb-6" data-testid="text-title">
          PERSONAL INFORMATION
        </h1>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Surname</label>
            <Input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-surname"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Full Names</label>
            <Input
              type="text"
              value={fullNames}
              onChange={(e) => setFullNames(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-fullnames"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">ID Number</label>
            <Input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-id-number"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Mobile Number</label>
            <Input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="085XXXXXXXX or +264XXXXXXXXX"
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-mobile"
            />
            <p className="text-[9px] text-gray-400 mt-1">Format: 085, 081, or 083 (will be converted to +264)</p>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-email"
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Region</label>
            <Input
              type="text"
              value={region || regionSearch}
              onChange={(e) => {
                setRegionSearch(e.target.value);
                setRegion("");
                setShowRegionDropdown(true);
              }}
              onFocus={() => setShowRegionDropdown(true)}
              placeholder="START TYPING TO SEARCH..."
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-region"
            />
            {showRegionDropdown && filteredRegions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto">
                {filteredRegions.map((r) => (
                  <div
                    key={r}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setRegion(r);
                      setRegionSearch("");
                      setShowRegionDropdown(false);
                    }}
                    data-testid={`option-region-${r}`}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Town</label>
            <Input
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-town"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Street Name</label>
            <Input
              type="text"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-street"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Physical Address</label>
            <Input
              type="text"
              value={physicalAddress}
              onChange={(e) => setPhysicalAddress(e.target.value)}
              className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
              data-testid="input-address"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Gender</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div 
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center ${gender === "male" ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                  onClick={() => setGender("male")}
                  data-testid="checkbox-male"
                >
                  {gender === "male" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div 
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center ${gender === "female" ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                  onClick={() => setGender("female")}
                  data-testid="checkbox-female"
                >
                  {gender === "female" && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm">Female</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
          )}
        </div>

        <div className="mt-6">
          <Button
            onClick={handleProceed}
            disabled={isLoading}
            className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
            data-testid="button-proceed"
          >
            {isLoading ? "CHECKING..." : "PROCEED"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
