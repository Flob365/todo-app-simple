import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { deleteTask, isDbSupported, loadTasks, upsertTask } from '../data/db'

const TasksContext = createContext(null)

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task_${Date.now()}_${Math.floor(Math.random() * 10000)}`

const initialState = {
  tasks: [],
  activeCategory: 'pro',
  storage: {
    mode: isDbSupported() ? 'indexeddb' : 'memory',
    error: null,
  },
  isLoaded: false,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'set_tasks':
      return { ...state, tasks: action.payload, isLoaded: true }

    case 'set_category':
      return { ...state, activeCategory: action.payload }

    case 'add_task':
      return { ...state, tasks: [action.payload, ...state.tasks] }

    case 'toggle_task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null,
              }
            : task
        ),
      }

    case 'delete_task':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }

    case 'set_storage':
      return {
        ...state,
        storage: { ...state.storage, ...action.payload },
      }

    default:
      return state
  }
}

export const TasksProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Supprime les taches terminees depuis plus de 3 jours
  const cleanupOldCompletedTasks = async (tasks) => {
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
    const now = Date.now()

    const tasksToDelete = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false
      const completedTime = new Date(task.completedAt).getTime()
      return now - completedTime > THREE_DAYS_MS
    })

    // Supprime de la base de donnees
    for (const task of tasksToDelete) {
      try {
        await deleteTask(task.id)
      } catch {
        // Ignore les erreurs de suppression
      }
    }

    // Retourne les taches filtrees
    return tasks.filter((task) => !tasksToDelete.some((t) => t.id === task.id))
  }

  // Charge les taches au demarrage
  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      if (!isDbSupported()) {
        dispatch({ type: 'set_storage', payload: { mode: 'memory', error: null } })
        dispatch({ type: 'set_tasks', payload: [] })
        return
      }

      try {
        const data = await loadTasks()
        if (mounted) {
          // Nettoie les anciennes taches terminees
          const cleanedTasks = await cleanupOldCompletedTasks(data || [])
          dispatch({ type: 'set_tasks', payload: cleanedTasks })
        }
      } catch (error) {
        if (mounted) {
          dispatch({
            type: 'set_storage',
            payload: { mode: 'memory', error: 'Stockage local indisponible.' },
          })
          dispatch({ type: 'set_tasks', payload: [] })
        }
      }
    }

    bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  // Sauvegarde une tache
  const persistTask = async (task) => {
    if (state.storage.mode !== 'indexeddb') return
    try {
      await upsertTask(task)
    } catch {
      dispatch({
        type: 'set_storage',
        payload: { mode: 'memory', error: 'Echec de sauvegarde.' },
      })
    }
  }

  // Ajoute une nouvelle tache
  const addTask = async (title) => {
    const task = {
      id: createId(),
      title: title.trim(),
      completed: false,
      category: state.activeCategory,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'add_task', payload: task })
    await persistTask(task)
  }

  // Bascule l'etat d'une tache
  const toggleTask = async (taskId) => {
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return

    const updated = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    }
    dispatch({ type: 'toggle_task', payload: taskId })
    await persistTask(updated)
  }

  // Supprime une tache
  const removeTask = async (taskId) => {
    dispatch({ type: 'delete_task', payload: taskId })
    if (state.storage.mode === 'indexeddb') {
      try {
        await deleteTask(taskId)
      } catch {
        dispatch({
          type: 'set_storage',
          payload: { mode: 'memory', error: 'Echec de suppression.' },
        })
      }
    }
  }

  // Change la categorie active
  const setCategory = (category) => {
    dispatch({ type: 'set_category', payload: category })
  }

  const value = useMemo(
    () => ({
      tasks: state.tasks,
      activeCategory: state.activeCategory,
      isLoaded: state.isLoaded,
      storage: state.storage,
      addTask,
      toggleTask,
      removeTask,
      setCategory,
    }),
    [state]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider')
  }
  return context
}
