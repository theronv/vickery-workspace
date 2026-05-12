import { AuthProvider, useAuth } from './context/AuthContext'
import { PipelineProvider, usePipeline } from './context/PipelineContext'
import { WorkspaceToolsProvider, useTools } from './context/WorkspaceToolsContext'
import LoginScreen from './components/LoginScreen'
import StatusBar from './components/StatusBar'
import ToolLinksBar from './components/ToolLinksBar'
import RightSidebar from './components/RightSidebar'
import Toast from './components/Toast'
import VetPanel from './panels/VetPanel'
import BuildPanel from './panels/BuildPanel'
import ExecutePanel from './panels/ExecutePanel'
import CliPanel from './panels/CliPanel'
import AngelTeamPanel from './panels/AngelTeamPanel'
import AngelTeamWebPanel from './panels/AngelTeamWebPanel'

function WorkspaceContent() {
  const { activePanel } = usePipeline()
  const { tools } = useTools()

  const activeTool = tools.find(t => t.id === activePanel) ?? tools[0]

  if (!activeTool) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-vd-text-dim">
        No tools configured — click ⚙ in the toolbar to add one
      </div>
    )
  }

  if (activeTool.type === 'iframe' && activeTool.url) {
    return (
      <div className="flex flex-col h-full">
        <iframe
          src={activeTool.url}
          className="flex-1 w-full border-none"
          title={activeTool.label}
          allow="clipboard-write"
        />
      </div>
    )
  }

  switch (activeTool.panelComponent) {
    case 'vet':       return <VetPanel />
    case 'build':     return <BuildPanel />
    case 'execute':   return <ExecutePanel />
    case 'cli':       return <CliPanel />
    case 'angel':     return <AngelTeamPanel />
    case 'angel-web': return <AngelTeamWebPanel />
    default:          return null
  }
}

function Dashboard() {
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-screen bg-vd-bg">
      <StatusBar />
      <ToolLinksBar />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden min-w-0">
          <WorkspaceContent />
        </main>
        <RightSidebar />
      </div>

      {/* Sign-out — hidden corner affordance */}
      <button
        onClick={logout}
        className="fixed bottom-2 left-2 text-[10px] text-vd-text-dim hover:text-vd-text-secondary transition-colors opacity-40 hover:opacity-100"
        title="Sign out"
      >
        sign out
      </button>

      <Toast />
    </div>
  )
}

function AuthGate() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <LoginScreen />
  return (
    <PipelineProvider>
      <WorkspaceToolsProvider>
        <Dashboard />
      </WorkspaceToolsProvider>
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
