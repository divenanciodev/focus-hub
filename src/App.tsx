import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Estudos from "./pages/Estudos";
import DisciplineDetail from "./pages/DisciplineDetail";
import Treinos from "./pages/Treinos";
import TrainingSession from "./pages/TrainingSession";
import Concursos from "./pages/Concursos";
import Cursinhos from "./pages/Cursinhos";
import Financeiro from "./pages/Financeiro";
import Objetivos from "./pages/Objetivos";
import Banco from "./pages/Banco";
import Planos from "./pages/Planos";
import Perfil from "./pages/Perfil";
import Habitos from "./pages/Habitos";
import Cronograma from "./pages/Cronograma";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/estudos" element={<Estudos />} />
            <Route path="/estudos/:id" element={<DisciplineDetail />} />
            <Route path="/treinos" element={<Treinos />} />
            <Route path="/treinos/:id" element={<TrainingSession />} />
            <Route path="/concursos" element={<Concursos />} />
            <Route path="/cursinhos" element={<Cursinhos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/objetivos" element={<Objetivos />} />
            <Route path="/banco" element={<Banco />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/cronograma" element={<Cronograma />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
