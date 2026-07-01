import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Login } from "@/pages/Login";
import { AuthCallback } from "@/pages/AuthCallback";
import { Layout } from "@/components/Layout";
import { CommandCenter } from "@/pages/CommandCenter";
import { EvaChat } from "@/pages/EvaChat";
import { Vault } from "@/pages/Vault";
import { Files } from "@/pages/Files";
import { Settings } from "@/pages/Settings";
import { Boardroom } from "@/pages/Boardroom";
import { Approvals } from "@/pages/Approvals";
import { Memory } from "@/pages/Memory";
import { Landing } from "@/pages/Landing";
import { Pricing } from "@/pages/Pricing";
import { BillingSuccess } from "@/pages/BillingSuccess";
import { Team } from "@/pages/Team";
import { InviteAccept } from "@/pages/InviteAccept";
import { Health } from "@/pages/Health";
import { PublicShowcase, PublicShowcaseDetail } from "@/pages/PublicShowcase";

function FullScreenLoader({ label = "Loading EvaOne…" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030304]">
      <div className="label-eyebrow">{label}</div>
    </div>
  );
}

/** Root route: shows Landing for guests/anonymous, Layout for authenticated. */
function RootEntry() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Landing />;
  return <Layout />;
}

/** Routes that require auth — redirects to landing if not signed in. */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  // Process Emergent OAuth callback synchronously (BEFORE any other route renders)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="/showcase" element={<PublicShowcase />} />
      <Route path="/showcase/:sid" element={<PublicShowcaseDetail />} />

      {/* Root: Landing (public) or Layout (authed) */}
      <Route path="/" element={<RootEntry />}>
        <Route index element={<RequireAuth><CommandCenter /></RequireAuth>} />
        <Route path="chat" element={<RequireAuth><EvaChat /></RequireAuth>} />
        <Route path="chat/:sessionId" element={<RequireAuth><EvaChat /></RequireAuth>} />
        <Route path="boardroom" element={<RequireAuth><Boardroom /></RequireAuth>} />
        <Route path="boardroom/:sessionId" element={<RequireAuth><Boardroom /></RequireAuth>} />
        <Route path="approvals" element={<RequireAuth><Approvals /></RequireAuth>} />
        <Route path="memory" element={<RequireAuth><Memory /></RequireAuth>} />
        <Route path="vault" element={<RequireAuth><Vault /></RequireAuth>} />
        <Route path="files" element={<RequireAuth><Files /></RequireAuth>} />
        <Route path="team" element={<RequireAuth><Team /></RequireAuth>} />
        <Route path="health" element={<RequireAuth><Health /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App eva-grain">
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "rgba(8,8,10,0.95)",
                  border: "1px solid rgba(0,240,255,0.2)",
                  color: "#fff",
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
