import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ComplaintPage from './pages/ComplaintPage'
import FIRRecords from './pages/FIRRecords'
import CreateFIR from './pages/CreateFIR'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AISummary from './pages/AISummary'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-fir" element={<CreateFIR />} />
          <Route path="/fir-records" element={<FIRRecords />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-summary" element={<AISummary />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
