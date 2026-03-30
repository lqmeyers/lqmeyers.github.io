import { peerReviewed, presentations } from '../../data/publications.js'
import { projects } from '../../data/projects.js'
import { Link } from 'react-router-dom'
import styles from './Research.module.css'

export default function Research() {
  return (
    <div className={styles.container}>
       <section className={styles.projectsSection}>
        <h2>Projects</h2>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className={styles.projectCard}
            >
              {project.images[0] && (
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className={styles.projectImage}
                />
              )}
              <div className={styles.projectInfo}>
                <h3>{project.title}</h3>
                <p>{project.shortDescription}</p>
                <span className={styles.projectLink}>Learn More →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.publications}>
        <h2>Publications</h2>

        <h3>Peer-Reviewed Publications</h3>
        <ul className={styles.publicationList}>
          {peerReviewed.map((pub) => (
            <li key={pub.id}>{pub.citation}</li>
          ))}
        </ul>

        <h3>Presentations and Workshops</h3>
        <ul className={styles.publicationList}>
          {presentations.map((pres) => (
            <li key={pres.id}>{pres.citation}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
