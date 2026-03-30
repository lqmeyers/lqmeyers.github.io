import { useParams, Link } from 'react-router-dom'
import { projects } from '../../data/projects.js'
import { peerReviewed } from '../../data/publications.js'
import styles from './ProjectDetail.module.css'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <div className={styles.container}>
        <h2>Project not found</h2>
        <Link to="/research">← Back to Research</Link>
      </div>
    )
  }

  const relatedPubs = peerReviewed.filter((pub) =>
    project.publicationIds?.includes(pub.id)
  )

  return (
    <div className={styles.container}>
      <Link to="/research" className={styles.backLink}>← Back to Research</Link>

      <header className={styles.header}>
        <h2>{project.title}</h2>
        <p className={styles.shortDescription}>{project.shortDescription}</p>
      </header>

      {project.images.length > 0 && (
        <section className={styles.gallery}>
          <div className={styles.imageGrid}>
            {project.images.map((src, i) => (
              <img key={i} src={src} alt={`${project.title} ${i + 1}`} className={styles.galleryImage} />
            ))}
          </div>
        </section>
      )}

      {project.overview && (
        <section className={styles.section}>
          <h3>Overview</h3>
          <p>{project.overview}</p>
        </section>
      )}

      {project.methodology && (
        <section className={styles.section}>
          <h3>Methodology</h3>
          <p>{project.methodology}</p>
        </section>
      )}

      {project.findings && (
        <section className={styles.section}>
          <h3>Key Findings</h3>
          <p>{project.findings}</p>
        </section>
      )}

      {project.links?.length > 0 && (
        <section className={styles.section}>
          <h3>Links</h3>
          <ul className={styles.pubList}>
            {project.links.map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedPubs.length > 0 && (
        <section className={styles.section}>
          <h3>Related Publications</h3>
          <ul className={styles.pubList}>
            {relatedPubs.map((pub) => (
              <li key={pub.id}>{pub.citation}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
