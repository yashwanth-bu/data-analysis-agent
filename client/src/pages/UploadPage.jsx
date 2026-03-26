import { useState, useRef, useCallback } from 'react'
import { uploadDataset } from '../utils/api.js'
import styles from './UploadPage.module.css'

const ACCEPTED = '.csv,.xlsx,.xls,.json,.parquet'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function UploadPage({ onSuccess }) {
  const [dragging, setDragging]   = useState(false)
  const [file, setFile]           = useState(null)
  const [progress, setProgress]   = useState(0)
  const [status, setStatus]       = useState('idle')
  const [errorMsg, setErrorMsg]   = useState('')
  const inputRef                  = useRef()

  const pickFile = (f) => {
    if (!f) return
    setFile(f); setStatus('idle'); setProgress(0); setErrorMsg('')
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  async function handleUpload() {
    if (!file || status === 'uploading') return
    setStatus('uploading'); setProgress(0); setErrorMsg('')
    try {
      await uploadDataset(file, (pct) => setProgress(pct))
      setStatus('done')
      setTimeout(() => onSuccess(file.name), 800)
    } catch (err) {
      setStatus('error'); setErrorMsg(err.message || 'Upload failed')
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.panel}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>Step 01</span>
          <h2 className={styles.title}>Upload your dataset</h2>
          <p className={styles.sub}>Drop a file below to begin analysis</p>
        </div>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            style={{ display: 'none' }}
            onChange={e => pickFile(e.target.files[0])}
          />

          {!file ? (
            <div className={styles.dropContent}>
              <div className={styles.dropIcon}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 3v14M5 9l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className={styles.dropText}>Drop file here or <span className={styles.link}>browse</span></p>
              <p className={styles.dropSub}>Supports CSV, Excel, JSON, Parquet</p>
              <div className={styles.formats}>
                {['.csv','.xlsx','.json','.parquet'].map(f => (
                  <span key={f} className={styles.fmt}>{f}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="2" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M7 10h10M7 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{formatBytes(file.size)}</p>
              </div>
              <button
                className={styles.removeBtn}
                onClick={e => { e.stopPropagation(); setFile(null); setStatus('idle'); setProgress(0) }}
              >✕</button>
            </div>
          )}
        </div>

        {status === 'uploading' && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressLabel}>{progress}%</span>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.errorBox}>⚠ {errorMsg}</div>
        )}

        {status === 'done' && (
          <div className={styles.successBox}>✓ Uploaded — opening dashboard…</div>
        )}

        <button
          className={`${styles.btn} ${!file || status === 'uploading' || status === 'done' ? styles.btnDisabled : ''}`}
          onClick={handleUpload}
          disabled={!file || status === 'uploading' || status === 'done'}
        >
          {status === 'uploading' ? (
            <><span className={styles.spinner} /> Uploading…</>
          ) : status === 'done' ? '✓ Done' : 'Upload & Continue'}
        </button>

      </div>
    </div>
  )
}
