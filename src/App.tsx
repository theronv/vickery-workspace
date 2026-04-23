import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PipelineProvider, usePipeline } from './context/PipelineContext'
import LoginScreen from './components/LoginScreen'
import TopNav from './components/TopNav'
import ProcessSidebar from './components/ProcessSidebar'
import StackSidebar from './components/StackSidebar'
import Toast from './components/Toast'
import VetPanel from './panels/VetPanel'
import BuildPanel from './panels/BuildPanel'
import ExecutePanel from './panels/ExecutePanel'
import CliPanel from './panels/CliPanel'
import AngelTeamPanel from './panels/AngelTeamPanel'

function Dashboard() {
  const { activePanel } = usePipeline()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-vd-bg">
      <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <StackSidebar />
        <main className="flex-1 overflow-hidden min-w-0">
          {activePanel === 'vet' && <VetPanel />}
          {activePanel === 'build' && <BuildPanel />}
          {activePanel === 'execute' && <ExecutePanel />}
          {activePanel === 'cli' && <CliPanel />}
          {activePanel === 'angel' && <AngelTeamPanel />}
        </main>
      </div>

      <ProcessSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toast />
    </div>
  )
}

function AuthGate() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <LoginScreen />

  return (
    <PipelineProvider>
      <Dashboard />
    </PipelineProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
