import { lazy, Suspense } from 'react'
import styles from './Home.module.css'

const EmbeddingViewer = lazy(() => import('../../components/EmbeddingViewer/EmbeddingViewer.jsx'))

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.welcome}>
        <div className={styles.profileImageContainer}>
          <img
            src="/assets/headshot.JPG"
            alt="headshot of Luke Meyers"
            className={styles.profileImage}
          />
          <p className={styles.imageCaption}>
            Happy to be in the field at Hakalau Forest, Hawai'i, <br />
            researching pollinating honey-creepers with the Imageomics Institute.
          </p>
        </div>
        <div className={styles.welcomeText}>
          <h1>Luke Meyers</h1>
          <p>Computer Vision researcher with a special passion for biology and ecology. Field conditions and long tailed distributions of biological applications provide unique
            challenges for machine learning, but unique opportunities to utilize the rich research history of the field to inform model design and training. I’m particularly interested in how we can leverage the structure of biological data to build more
            efficient and effective models, and how we can use machine learning to gain new insights into the natural world.
          </p>
        </div>
      </section>

      <section className={styles.embeddingSection}>
        <h3>How can Representation Learning Aid your Biological Research?</h3>
        <p className={styles.sectionSubtitle}>
          The rise of transformer models has given us unique power to learn and combine multimodal data. From genomic sequences, tabular data, images, or audio files
          foundational models can learn powerful representations of the data that can be used for a wide range of downstream tasks. 
          These representations not only can be used to improve model performance, interpretability, and generalization, but discover structure and new signals in
          complex biological data.
        </p>
        <p className={styles.sectionSubtitle}>
          Below is a demo visualization of image features from DINOv3 for a recent project classifying bat observations on Inaturalist, where citizen science information relevant for public health monitoring is mixed in with scientific research expedition observations. 
          I built a mixture of experts style inference pipeline for multitask classification. See the repo <a href="https://github.com/lqmeyers/bat_bot" target="_blank" rel="noopener noreferrer">here</a> for more details on the project and the agentic system for 
          reasoning over both image and metadata embeddings.
        </p>
        <Suspense fallback={<div className={styles.viewerLoading}>Loading viewer…</div>}>
          <EmbeddingViewer />
        </Suspense>
      </section>

      <section className={styles.recentUpdates}>
        <h3>Recent Updates</h3>
        <div className={styles.imageGrid}>
          <div className={styles.imageCard}>
            <div className={styles.imageWrapper}>
              <img src="/assets/SIDIM-2026-action_shot.jpeg" alt="SIDIM 2026 Poster" className={styles.highlightImage} />
              <div className={styles.imageOverlay}>
                <p className={styles.overlayCaption}>"On the Generalization of Deep Feature Learning of Honey Bee Reidentification"</p>
              </div>
               <div className={styles.imageCaption}>
                <p>SIDIM 2026 Oral</p>
              </div>
            </div>
          </div>
          <div className={styles.imageCard}>
            <div className={styles.imageWrapper}>
              <img src="/assets/IMG_2899.JPEG" alt="WACV 2026 Poster" className={styles.highlightImage} />
              <div className={styles.imageOverlay}>
                <p className={styles.overlayCaption}>"One-Shot Fine-Grained Re-Identification of Paint 
                                                      Marked Honey Bees using Vision Foundation Models" </p>
              </div>
              <div className={styles.imageCaption}>
                <p>WACV 2026 Poster</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
