import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/context/AuthContext";
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030304]">
        <div className="label-eyebrow">Initializing EvaOne…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  const { user, loading } = useAuth();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  if (loading && location.pathname === "/") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030304]">
        <div className="label-eyebrow">Loading EvaOne…</div>
      </div>
    );
  }
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Layout /> : <Landing />}>
        {user && <Route index element={<CommandCenter />} />}
        {user && <Route path="chat" element={<EvaChat />} />}
        {user && <Route path="chat/:sessionId" element={<EvaChat />} />}
        {user && <Route path="boardroom" element={<Boardroom />} />}
        {user && <Route path="boardroom/:sessionId" element={<Boardroom />} />}
        {user && <Route path="approvals" element={<Approvals />} />}
        {user && <Route path="memory" element={<Memory />} />}
        {user && <Route path="vault" element={<Vault />} />}
        {user && <Route path="files" element={<Files />} />}
        {user && <Route path="team" element={<Team />} />}
        {user && <Route path="health" element={<Health />} />}
        {user && <Route path="settings" element={<Settings />} />}
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/invite/:token" element={<InviteAccept />} />
      <Route path="/showcase" element={<PublicShowcase />} />
      <Route path="/showcase/:sid" element={<PublicShowcaseDetail />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App eva-grain">
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
    </div>
  );
}

export default App;
