import { Routes, Route } from 'react-router-dom'
import MapSelectionPage from './pages/MapSelectionPage'
import EditorPage from './pages/EditorPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapSelectionPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}

export default App
