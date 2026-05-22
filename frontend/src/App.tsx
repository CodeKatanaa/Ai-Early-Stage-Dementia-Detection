import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import VoiceAssistant from "@/components/VoiceAssistant";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import HistoryPage from "./pages/dashboard/HistoryPage";
import ExercisePage from "./pages/dashboard/ExercisePage";
import GamesPage from "./pages/dashboard/GamesPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import DuckGame from "./pages/games/DuckGame";
import ChessGame from "./pages/games/ChessGame";
import SudokuGame from "./pages/games/SudokuGame";
import ScreeningTest from "./pages/ScreeningTest";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="exercise" element={<ExercisePage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/duck" element={<DuckGame />} />
              <Route path="games/chess" element={<ChessGame />} />
              <Route path="games/sudoku" element={<SudokuGame />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="/screening" element={<ProtectedRoute><ScreeningTest /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <VoiceAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
