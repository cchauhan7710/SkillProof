import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Upload } from './pages/Upload'
import { Profile } from './pages/Profile'
import { AnalysisResult } from './pages/AnalysisResult'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login"    element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        <Route path="/dashboard" element={
          <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/upload" element={
          <ProtectedRoute><PageWrapper><Upload /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>
        } />

        <Route path="/analysis/:id" element={
          <ProtectedRoute><PageWrapper><AnalysisResult /></PageWrapper></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/*
           * ── SITE FRAME ──────────────────────────────────────
           * fixed inset-0 locks the outer shell to the viewport.
           * The inner div is the scrollable content area.
           * ────────────────────────────────────────────────────
           */}
          <div className="fixed inset-0 bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-500">
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scroll-smooth">
              <AnimatedRoutes />
            </div>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
