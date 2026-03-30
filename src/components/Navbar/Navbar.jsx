import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <h1 className={styles.siteTitle}>Luke Meyers</h1>
        <ul className={styles.navLinks}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>
              About Me
            </NavLink>
          </li>
          <li>
            <NavLink to="/research" className={({ isActive }) => isActive ? styles.active : ''}>
              Research
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}
