import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/hooks/use-auth';
import { AchievementsProvider } from '@/hooks/use-achievements-context';

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <BrowserRouter>
      <AuthProvider>
        <AchievementsProvider>
          <App />
          <Toaster 
            position="bottom-center"
            closeButton
            richColors
            expand={false}
            duration={4000}
          />
        </AchievementsProvider>
      </AuthProvider>
    </BrowserRouter>
   </ErrorBoundary>
)
