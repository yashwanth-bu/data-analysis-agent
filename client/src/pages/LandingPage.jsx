import { useState, useEffect } from 'react'
import styles from './LandingPage.module.css'

const TAGLINES = [
  'Analyze data with natural language.',
  'Charts, insights & answers — instantly.',
  'Your AI-powered data analyst.',
]

export default function LandingPage({ onStart }) {
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setTaglineIdx(i => (i + 1) % TAGLINES.length); setVisible(true) }, 350)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.root}>
      <div className={styles.center}>

        <div className={styles.logoWrap}>
          <div className={styles.logo}>◈</div>
        </div>

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          AI Data Agent · Online
        </div>

        <h1 className={styles.title}>
          Talk to your<br />
          <span className={styles.titleAccent}>data.</span>
        </h1>

        <p
          className={styles.subtitle}
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
          {TAGLINES[taglineIdx]}
        </p>

        <button className={styles.cta} onClick={onStart}>
          Get started
          <span className={styles.ctaArrow}>→</span>
        </button>

        <div className={styles.formats}>
          {['.csv', '.xlsx', '.json', '.parquet'].map(f => (
            <span key={f} className={styles.fmt}>{f}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
