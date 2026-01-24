import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/splash";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import InterestConfirmation from "@/pages/interest-confirmation";
import TermLoans from "@/pages/term-loans";
import BankingDetails from "@/pages/banking-details";
import NetDisposableIncome from "@/pages/net-disposable-income";
import BankAuthorization from "@/pages/bank-authorization";
import TermInterestConfirmation from "@/pages/term-interest-confirmation";
import CreditScoreHistory from "@/pages/credit-score-history";
import Statement from "@/pages/statement";
import PaymentRecord from "@/pages/payment-record";
import LoanHistory from "@/pages/loan-history";
import NanoLoanApply from "@/pages/nano-loan-apply";
import TermLoanApply from "@/pages/term-loan-apply";
import ForgotPassword from "@/pages/forgot-password";
import ForgotPasswordOtp from "@/pages/forgot-password-otp";
import ForgotPasswordNewPin from "@/pages/forgot-password-new-pin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/interest-confirmation" component={InterestConfirmation} />
      <Route path="/term-loans" component={TermLoans} />
      <Route path="/banking-details" component={BankingDetails} />
      <Route path="/net-disposable-income" component={NetDisposableIncome} />
      <Route path="/bank-authorization" component={BankAuthorization} />
      <Route path="/term-interest-confirmation" component={TermInterestConfirmation} />
      <Route path="/credit-score-history" component={CreditScoreHistory} />
      <Route path="/statement" component={Statement} />
      <Route path="/payment-record" component={PaymentRecord} />
      <Route path="/loan-history" component={LoanHistory} />
      <Route path="/nano-loan-apply" component={NanoLoanApply} />
      <Route path="/term-loan-apply" component={TermLoanApply} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/forgot-password-otp" component={ForgotPasswordOtp} />
      <Route path="/forgot-password-new-pin" component={ForgotPasswordNewPin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
