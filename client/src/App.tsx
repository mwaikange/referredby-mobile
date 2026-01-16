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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/interest-confirmation" component={InterestConfirmation} />
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
