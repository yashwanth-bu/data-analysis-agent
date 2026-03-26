import { useState } from 'react'
import LandingPage  from './pages/LandingPage.jsx'
import UploadPage   from './pages/UploadPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

// Simple client-side "router" — no react-router needed
// view: 'landing' | 'upload' | 'dashboard'
export default function App() {
  const [view, setView]           = useState('landing')
  const [datasetName, setDatasetName] = useState('')

  function handleDatasetReady(name) {
    setDatasetName(name)
    setView('dashboard')
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="vignette" />

      {view === 'landing' && (
        <LandingPage onStart={() => setView('upload')} />
      )}

      {view === 'upload' && (
        <UploadPage onSuccess={handleDatasetReady} />
      )}

      {view === 'dashboard' && (
        <DashboardPage datasetName={datasetName} onReset={() => setView('upload')} />
      )}
    </>
  )
}
