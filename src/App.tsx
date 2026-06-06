import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { MainLayout } from "@/components/layout/MainLayout";
import { DisciplinesProvider } from "@/contexts/DisciplinesContext";
import Index from "./pages/Index";
import Estudos from "./pages/Estudos";
import DisciplineDetail from "./pages/DisciplineDetail";
import Treinos from "./pages/Treinos";
import TrainingSession from "./pages/TrainingSession";
import Concursos from "./pages/Concursos";
import Cursinhos from "./pages/Cursinhos";
import CursinhoDetail from "./pages/CursinhoDetail";
import Financeiro from "./pages/Financeiro";
import Objetivos from "./pages/Objetivos";
import Banco from "./pages/Banco";
import Perfil from "./pages/Perfil";
import Habitos from "./pages/Habitos";
import Cronograma from "./pages/Cronograma";
import Idiomas from "./pages/Idiomas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Index />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estudos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Estudos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estudos/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DisciplineDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/treinos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Treinos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/treinos/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TrainingSession />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/concursos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Concursos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursinhos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Cursinhos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursinhos/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CursinhoDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Financeiro />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/objetivos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Objetivos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/banco"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Banco />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Perfil />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/habitos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Habitos />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cronograma"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Cronograma />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/idiomas"
        element={
          <ProtectedRoute>
            <Idiomas />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DisciplinesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DisciplinesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
