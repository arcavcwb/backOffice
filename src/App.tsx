import { Outlet } from '@tanstack/react-router'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Outlet />
    </div>
  )
}

export default App
