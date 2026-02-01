import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Module from "@/pages/Module";
import Lesson from "@/pages/Lesson";
import ContentIdeas from "@/pages/ContentIdeas";
import ScriptEditor from "@/pages/ScriptEditor";
import ContentMatrix from "@/pages/ContentMatrix";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/modulo/:slug" component={Module} />
      <Route path="/licao/:id" component={Lesson} />
      <Route path="/ideias" component={ContentIdeas} />
      <Route path="/roteiro/:ideaId" component={ScriptEditor} />
      <Route path="/matriz" component={ContentMatrix} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
