import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
// Theme picker — uncomment this import and the mount below to audition the
// alternate palettes in src/styles/globals.css. Dev-only; never ships.
// import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher.jsx'
import Home from './pages/Home/Home.jsx'
import About from './pages/About/About.jsx'
import Research from './pages/Research/Research.jsx'
import ProjectDetail from './pages/ProjectDetail/ProjectDetail.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          {/* <Route path="/projects/:slug" element={<ProjectDetail />} /> */}
        </Routes>
      </main>
      <Footer />
      {/* {import.meta.env.DEV && <ThemeSwitcher />} */}
    </>
  )
}
