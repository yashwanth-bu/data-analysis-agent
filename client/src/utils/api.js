// ── src/utils/api.js ──────────────────────────────────────
// All FastAPI communication lives here.
// Vite proxy forwards /api  →  http://localhost:8000/api
// ──────────────────────────────────────────────────────────

const BASE = '';

export async function checkHealth() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}

export async function uploadDataset(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error || 'Upload failed'));
      } catch { reject(new Error('Invalid server response')); }
    });
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.open('POST', `${BASE}/api/upload-dataset`);
    xhr.send(formData);
  });
}

export async function visualize(prompt) {
  const res = await fetch(`${BASE}/api/visualize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Visualization failed');
  return data;
}

// Fetch column-aware suggestions from backend after dataset upload
export async function fetchSuggestions() {
  try {
    const res = await fetch(`${BASE}/api/suggestions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}
