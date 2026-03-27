import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AppShell from "./components/AppShell";
import CreatePage from "./pages/create/Index";
import LibraryPage from "./pages/library/Index";
import HistoryPage from "./pages/history/Index";
import CompanyPage from "./pages/admin/Company";
import ProductsPage from "./pages/admin/Products";
import CopywritersPage from "./pages/admin/Copywriters";
import EditorialLinesPage from "./pages/admin/EditorialLines";
import NotFound from "./pages/NotFound";
import ControlePage from "./pages/controle/Index";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/create" element={<CreatePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/controle" element={<ControlePage />} />
              <Route path="/admin/company" element={<CompanyPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/copywriters" element={<CopywritersPage />} />
              <Route path="/admin/editorial-lines" element={<EditorialLinesPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/create" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
