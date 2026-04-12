import { bioParagraphs, galleryImages } from '../../data/bio.js'
import { languages, technicalSkills } from '../../data/skills.js'
import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles.container}>
      <section className={styles.aboutHeader}>
        <h2>About</h2>
      </section>

      <section className={styles.profile}>
        <div className={styles.profileContent}>
          <div className={styles.profileImageContainer}>
            <img
              src="/assets/IMG_0281.JPEG"
              alt="Luke Meyers with large tripod"
              className={styles.profileImage}
            />
            <p className={styles.imageCaption}>
              Using a large tripod to record wild pollinators visiting mango flowers at UPRRP using a basler video camera and Nvidia Jetson Orin. 
            </p>
          </div>
          <div className={styles.profileText}>
            {bioParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gallery}>
        <h3>Gallery</h3>
        <div className={styles.imageGrid}>
          {galleryImages.map((img, i) => (
            <div key={i} className={styles.imageCard}>
              <img
                src={img.src}
                alt={img.alt}
                className={styles.galleryImage}
              />
              <p className={styles.imageCaption}>{img.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.skills}>
        <h3>Skills &amp; Expertise</h3>
        <div className={styles.skillsContent}>
          <h4>Languages</h4>
          <ul>
            {languages.map((lang) => (
              <li key={lang.name}>
                {lang.name}: {lang.level}
              </li>
            ))}
          </ul>
          <h4>Skills</h4>
          <ul>
            {technicalSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
