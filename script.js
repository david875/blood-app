const form = document.getElementById('bpForm');
const recordsList = document.getElementById('recordsList');
const themeToggle = document.getElementById('themeToggle');
const storageKey = 'blood-pressure-records';
const themeKey = 'blood-pressure-theme';

function loadRecords() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('Unable to parse blood pressure records:', error);
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(themeKey);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  } catch (error) {
    console.error('Unable to read theme preference:', error);
    return 'light';
  }
}

function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', normalizedTheme);

  try {
    localStorage.setItem(themeKey, normalizedTheme);
  } catch (error) {
    console.error('Unable to save theme preference:', error);
  }

  if (themeToggle) {
    themeToggle.textContent = normalizedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute(
      'aria-label',
      normalizedTheme === 'dark' ? '切換到淺色主題' : '切換到深色主題'
    );
  }
}

function formatMedication(value) {
  const labels = {
    none: '無',
    taken: '已服藥',
    missed: '未服藥'
  };

  return labels[value] || '無';
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

function renderRecords() {
  const records = loadRecords();

  if (!records.length) {
    recordsList.innerHTML = '<li class="empty-state">目前尚無血壓紀錄。</li>';
    return;
  }

  recordsList.innerHTML = records
    .map(
      (record) => `
        <li class="record-item" data-id="${record.id}">
          <div class="record-top">
            <strong>${record.systolic} / ${record.diastolic} mmHg</strong>
            <div class="record-time">${formatDateTime(record.createdAt)}</div>
          </div>
          <div class="record-main">
            <span class="badge">脈搏: ${record.pulse} bpm</span>
            <span class="badge medication-tag">藥物治療: ${formatMedication(record.medication)}</span>
            <button class="record-action" type="button" data-delete-id="${record.id}">刪除</button>
          </div>
          <p class="record-notes">${record.notes ? `備註：${record.notes}` : '備註：無'}</p>
        </li>
      `
    )
    .join('');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const systolic = Number(document.getElementById('systolic').value);
  const diastolic = Number(document.getElementById('diastolic').value);
  const pulse = Number(document.getElementById('pulse').value);
  const medication = document.getElementById('medication').value;
  const notes = document.getElementById('notes').value.trim();

  if (!systolic || !diastolic || !pulse) {
    alert('請填寫收縮壓、舒張壓與脈搏。');
    return;
  }

  const records = loadRecords();
  const newRecord = {
    id: `bp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    systolic,
    diastolic,
    pulse,
    medication,
    notes,
    createdAt: new Date().toISOString()
  };

  records.unshift(newRecord);
  saveRecords(records);
  renderRecords();
  form.reset();
});

recordsList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const deleteId = target.dataset.deleteId;
  if (!deleteId) return;

  const records = loadRecords().filter((record) => record.id !== deleteId);
  saveRecords(records);
  renderRecords();
});

applyTheme(getSavedTheme());
renderRecords();
