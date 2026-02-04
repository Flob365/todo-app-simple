import { useState, useMemo } from 'react'
import { Mic, Loader2 } from 'lucide-react'
import { TasksProvider, useTasks } from './state/TasksContext'
import { useVoiceRecorder } from './hooks/useVoiceRecorder'
import { cn } from './lib/utils'

// Toggle Pro / Perso
const CategoryToggle = () => {
  const { activeCategory, setCategory } = useTasks()

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-full bg-muted p-1">
        <button
          onClick={() => setCategory('pro')}
          className={cn(
            'rounded-full px-6 py-2 text-sm font-medium transition-all duration-200',
            activeCategory === 'pro'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Pro
        </button>
        <button
          onClick={() => setCategory('perso')}
          className={cn(
            'rounded-full px-6 py-2 text-sm font-medium transition-all duration-200',
            activeCategory === 'perso'
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Perso
        </button>
      </div>
    </div>
  )
}

// Messages d'erreur pour le microphone
const voiceErrorMessages = {
  NO_API_KEY: 'Cle API OpenAI non configuree (VITE_OPENAI_API_KEY).',
  PERMISSION_DENIED: 'Acces au microphone refuse.',
  MICROPHONE_ERROR: 'Erreur d\'acces au microphone.',
  INVALID_API_KEY: 'Cle API OpenAI invalide.',
  RATE_LIMITED: 'Trop de requetes. Reessayez plus tard.',
  NETWORK_ERROR: 'Erreur de connexion.',
  TRANSCRIPTION_FAILED: 'Erreur de transcription. Reessayez.',
}

// Champ pour ajouter une tache
const AddTaskInput = () => {
  const [value, setValue] = useState('')
  const { addTask } = useTasks()
  const {
    isRecording,
    isTranscribing,
    error: voiceError,
    startRecording,
    stopRecording,
    clearError,
  } = useVoiceRecorder()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    addTask(value)
    setValue('')
  }

  const handleMicClick = async () => {
    clearError()
    if (isRecording) {
      const transcribedText = await stopRecording()
      if (transcribedText) {
        setValue((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText))
      }
    } else {
      await startRecording()
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ajouter une tache..."
          className="w-full rounded-xl border border-border bg-white px-4 py-3.5 pr-24 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
        />

        {/* Bouton ajouter */}
        <button
          type="submit"
          disabled={!value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-30 transition-opacity hover:opacity-80"
        >
          Ajouter
        </button>
      </form>

      {/* Message d'erreur */}
      {voiceError && (
        <p className="text-sm text-destructive px-1">
          {voiceErrorMessages[voiceError] || 'Une erreur est survenue.'}
        </p>
      )}

      {/* Bouton microphone flottant en bas */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isTranscribing}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all',
          isRecording
            ? 'bg-red-500 text-white recording-pulse shadow-red-500/30'
            : 'bg-foreground text-background hover:opacity-90',
          isTranscribing && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={isRecording ? "Arreter l'enregistrement" : 'Enregistrer une tache'}
      >
        {isTranscribing ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </button>
    </div>
  )
}

// Element de tache
const TaskItem = ({ task }) => {
  const { toggleTask, removeTask } = useTasks()

  return (
    <div className="task-enter group flex items-center gap-3 rounded-xl bg-white border border-border px-4 py-3.5 transition-all hover:border-ring/30">
      <button
        onClick={() => toggleTask(task.id)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
          task.completed
            ? 'border-foreground bg-foreground checkbox-pop'
            : 'border-border hover:border-muted-foreground'
        )}
      >
        {task.completed && (
          <svg
            className="h-3 w-3 text-background"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-base transition-all duration-200',
          task.completed && 'text-muted-foreground line-through'
        )}
      >
        {task.title}
      </span>

      <button
        onClick={() => removeTask(task.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 md:opacity-0"
        aria-label="Supprimer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Liste des taches
const TaskList = () => {
  const { tasks, activeCategory, isLoaded } = useTasks()

  const { activeTasks, completedTasks } = useMemo(() => {
    const categoryTasks = tasks.filter((t) => t.category === activeCategory)
    return {
      activeTasks: categoryTasks.filter((t) => !t.completed),
      completedTasks: categoryTasks.filter((t) => t.completed),
    }
  }, [tasks, activeCategory])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    )
  }

  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune tache pour le moment.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Ajoutez votre premiere tache ci-dessus.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Taches actives */}
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Taches terminees */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-1">
            Terminees ({completedTasks.length})
          </p>
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

// Layout principal
const AppShell = () => {
  const { storage } = useTasks()

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Mes Taches</h1>
          <p className="text-sm text-muted-foreground mt-1">Simple et efficace</p>
        </header>

        {/* Toggle Pro / Perso */}
        <div className="mb-6">
          <CategoryToggle />
        </div>

        {/* Erreur de stockage */}
        {storage.error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {storage.error}
          </div>
        )}

        {/* Champ d'ajout */}
        <div className="mb-6">
          <AddTaskInput />
        </div>

        {/* Liste des taches */}
        <TaskList />

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Donnees stockees localement
        </footer>
      </div>
    </div>
  )
}

// App avec Provider
const App = () => (
  <TasksProvider>
    <AppShell />
  </TasksProvider>
)

export default App
