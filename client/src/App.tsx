import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.jsx";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import { ThemeProvider } from "./components/ui/theme-provider.jsx";
import NotFound from "./pages/not-found.jsx";
import Home from "./pages/home.jsx";
import Questionnaire from "./pages/questionnaire.jsx";
import Location from "./pages/location.jsx";
import Loading from "./pages/loading.jsx";
import Results from "./pages/results.jsx";
import Header from "./components/layout/header.jsx";
import Footer from "./components/layout/footer.jsx";
import { Analytics } from "@vercel/analytics/next"

function Router() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/questionnaire" component={Questionnaire} />
          <Route path="/location" component={Location} />
          <Route path="/loading" component={Loading} />
          <Route path="/results" component={Results} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {location !== "/loading" && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
