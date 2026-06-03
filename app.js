/* ==============================================
   F1 Monaco 2026 — App Logic
   ============================================== */

// ---- THEME TOGGLE ----
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = 'dark'; // default dark for racing dashboard
  root.setAttribute('data-theme', theme);
  updateToggleIcon(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon(theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }

  function updateToggleIcon(t) {
    if (!toggle) return;
    toggle.innerHTML = t === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

// ---- TAB NAVIGATION ----
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');
    // Load weather on first visit
    if (target === 'weather' && !weatherLoaded) loadWeather();
  });
});

// ---- COUNTDOWN TIMER ----
// Race: Sunday 7 June 2026, 15:00 CEST = UTC+2 → 13:00 UTC
const RACE_DATE = new Date('2026-06-07T13:00:00Z');

function updateCountdown() {
  const now = new Date();
  const diff = RACE_DATE - now;

  if (diff <= 0) {
    document.getElementById('cd-d').textContent = '00';
    document.getElementById('cd-h').textContent = '00';
    document.getElementById('cd-m').textContent = '00';
    document.getElementById('cd-s').textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-d').textContent = String(days).padStart(2, '0');
  document.getElementById('cd-h').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-m').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-s').textContent = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---- HIGHLIGHT CURRENT / NEXT SESSION ----
function highlightCurrentSession() {
  const now = new Date();
  // Sessions in UTC (Monaco is CEST = UTC+2)
  const sessions = [
    { id: 'fp1',    start: new Date('2026-06-05T11:30:00Z'), end: new Date('2026-06-05T12:30:00Z') },
    { id: 'fp2',    start: new Date('2026-06-05T15:00:00Z'), end: new Date('2026-06-05T16:00:00Z') },
    { id: 'fp3',    start: new Date('2026-06-06T10:30:00Z'), end: new Date('2026-06-06T11:30:00Z') },
    { id: 'quali',  start: new Date('2026-06-06T14:00:00Z'), end: new Date('2026-06-06T15:00:00Z') },
    { id: 'parade', start: new Date('2026-06-07T11:00:00Z'), end: new Date('2026-06-07T11:30:00Z') },
    { id: 'race',   start: new Date('2026-06-07T13:00:00Z'), end: new Date('2026-06-07T15:00:00Z') },
  ];

  sessions.forEach(s => {
    const el = document.querySelector(`[data-session="${s.id}"]`);
    if (!el) return;
    if (now >= s.start && now <= s.end) {
      el.classList.add('session-live');
      el.style.setProperty('border-left', '3px solid var(--color-green)');
    } else if (now < s.start) {
      // next session
      el.style.setProperty('opacity', '1');
    } else {
      el.style.setProperty('opacity', '0.5');
    }
  });
}

highlightCurrentSession();

// ---- WEATHER (Open-Meteo API) ----
let weatherLoaded = false;

async function loadWeather() {
  const loading = document.getElementById('weatherLoading');
  const content = document.getElementById('weatherContent');
  const errorEl = document.getElementById('weatherError');
  const updateEl = document.getElementById('weatherUpdate');

  loading.style.display = 'flex';
  content.style.display = 'none';
  errorEl.style.display = 'none';

  // Monaco: lat=43.7384, lon=7.4246
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=43.7384&longitude=7.4246' +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,windspeed_10m_max' +
    '&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m' +
    '&timezone=Europe%2FBerlin' +
    '&start_date=2026-06-05&end_date=2026-06-07' +
    '&forecast_days=16';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderWeather(data);
    weatherLoaded = true;
    const now = new Date();
    updateEl.textContent = 'Stand: ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.error('Weather error:', err);
    // Show fallback / climatological data
    renderWeatherFallback();
    updateEl.textContent = 'Klimanorm-Daten';
  }

  loading.style.display = 'none';
  content.style.display = 'block';
}

function wmoToEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

function wmoToDesc(code) {
  if (code === 0) return 'Klar';
  if (code <= 2) return 'Teils bewölkt';
  if (code <= 3) return 'Bewölkt';
  if (code <= 48) return 'Nebel';
  if (code <= 57) return 'Nieselregen';
  if (code <= 67) return 'Regen';
  if (code <= 77) return 'Schnee';
  if (code <= 82) return 'Regenschauer';
  if (code <= 99) return 'Gewitter';
  return 'Wechselhaft';
}

function renderWeather(data) {
  const days = data.daily;
  const hours = data.hourly;
  const dayNames = ['Freitag', 'Samstag', 'Sonntag'];
  const dayDates = ['5. Juni', '6. Juni', '7. Juni'];
  const sessionLabels = ['Training', 'Qualifying-Tag', '🏁 RENNEN'];

  const daysEl = document.getElementById('weatherDays');
  daysEl.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const maxT = Math.round(days.temperature_2m_max[i]);
    const minT = Math.round(days.temperature_2m_min[i]);
    const precip = days.precipitation_probability_max[i];
    const wmo = days.weathercode[i];
    const wind = Math.round(days.windspeed_10m_max[i]);

    const rainClass = precip > 50 ? 'style="border-color:rgba(59,130,246,0.5);background:rgba(59,130,246,0.06)"' : '';

    daysEl.innerHTML += `
      <div class="weather-day-card" ${rainClass}>
        <div class="weather-day-header">
          <div>
            <div class="weather-day-name">${dayNames[i]} <span style="font-size:var(--text-xs);font-weight:400;color:var(--color-text-muted)">${sessionLabels[i]}</span></div>
            <div class="weather-day-date">${dayDates[i]}</div>
          </div>
          <div class="weather-icon">${wmoToEmoji(wmo)}</div>
        </div>
        <div class="weather-main">
          <div class="weather-temps">
            <div>
              <span class="temp-high">${maxT}°C</span>
              <span class="temp-low">/ ${minT}°C</span>
            </div>
            <div class="weather-desc">${wmoToDesc(wmo)}</div>
          </div>
        </div>
        <div class="weather-meta">
          <div class="weather-meta-item">🌧️ <span class="weather-meta-val">${precip}%</span> Regen</div>
          <div class="weather-meta-item">💨 <span class="weather-meta-val">${wind} km/h</span></div>
          ${precip > 40 ? '<div class="weather-meta-item" style="color:var(--color-blue)">⚠️ Regen möglich</div>' : ''}
        </div>
      </div>
    `;
  }

  // Hourly for race day (Sunday 7 June) – 12:00–18:00 local
  const hourlyEl = document.getElementById('hourlyContainer');
  hourlyEl.innerHTML = '';
  
  // Find indices for June 7 hours 12-18 CEST
  const raceDayPrefix = '2026-06-07T';
  const targetHours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  targetHours.forEach(h => {
    const searchStr = raceDayPrefix + h;
    const idx = hours.time.findIndex(t => t.startsWith(searchStr));
    if (idx < 0) return;
    
    const isRaceStart = h === '15:00';
    const isFormation = h === '14:00';
    const style = isRaceStart ? 'border-color:var(--color-accent);background:var(--color-accent-dim)' : '';
    const label = isRaceStart ? '<div style="font-size:9px;color:var(--color-accent);font-weight:800;margin-top:2px">START</div>' : 
                  isFormation ? '<div style="font-size:9px;color:var(--color-warn);margin-top:2px">Formation</div>' : '';
    
    hourlyEl.innerHTML += `
      <div class="hourly-item" style="${style}">
        <div class="hourly-time">${h}</div>
        <div class="hourly-icon">${wmoToEmoji(hours.weathercode[idx])}</div>
        <div class="hourly-temp">${Math.round(hours.temperature_2m[idx])}°</div>
        <div class="hourly-rain">${hours.precipitation_probability[idx]}%💧</div>
        ${label}
      </div>
    `;
  });

  // Rain risk text
  const sundayPrecip = days.precipitation_probability_max[2];
  const riskEl = document.getElementById('rainRiskText');
  if (sundayPrecip >= 60) {
    riskEl.textContent = `Hohe Regenwahrscheinlichkeit am Sonntag (${sundayPrecip}%). Intermediate/Fullwet-Reifen könnten entscheidend sein. SC-Einsatz sehr wahrscheinlich.`;
    document.getElementById('rainRiskCard').style.cssText = 'background:rgba(59,130,246,0.1);border-color:rgba(59,130,246,0.3)';
  } else if (sundayPrecip >= 30) {
    riskEl.textContent = `Mittleres Regenrisiko am Sonntag (${sundayPrecip}%). Strategie-Flexibilität wichtig. Teams werden Regenreifen bereithalten.`;
  } else {
    riskEl.textContent = `Geringe Regenwahrscheinlichkeit am Sonntag (${sundayPrecip}%). Trockene Bedingungen erwartet – Standard-Slick-Strategie.`;
    document.getElementById('rainRiskCard').style.cssText = 'background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.25)';
    document.querySelector('.risk-icon').textContent = '☀️';
    document.querySelector('.risk-title').textContent = 'Wetter-Risiko-Analyse';
    document.querySelector('.risk-title').style.color = 'var(--color-green)';
  }
}

function renderWeatherFallback() {
  const daysEl = document.getElementById('weatherDays');
  const dayNames = ['Freitag', 'Samstag', 'Sonntag'];
  const dayDates = ['5. Juni', '6. Juni', '7. Juni'];
  const sessionLabels = ['Training', 'Qualifying-Tag', '🏁 RENNEN'];

  daysEl.innerHTML = '';
  const fallbackData = [
    { maxT: 22, minT: 17, precip: 10, wmo: 1, wind: 12 },
    { maxT: 22, minT: 17, precip: 15, wmo: 2, wind: 14 },
    { maxT: 23, minT: 18, precip: 15, wmo: 1, wind: 11 },
  ];

  fallbackData.forEach((d, i) => {
    daysEl.innerHTML += `
      <div class="weather-day-card">
        <div class="weather-day-header">
          <div>
            <div class="weather-day-name">${dayNames[i]} <span style="font-size:var(--text-xs);font-weight:400;color:var(--color-text-muted)">${sessionLabels[i]}</span></div>
            <div class="weather-day-date">${dayDates[i]}</div>
          </div>
          <div class="weather-icon">${wmoToEmoji(d.wmo)}</div>
        </div>
        <div class="weather-main">
          <div class="weather-temps">
            <div>
              <span class="temp-high">${d.maxT}°C</span>
              <span class="temp-low">/ ${d.minT}°C</span>
            </div>
            <div class="weather-desc">${wmoToDesc(d.wmo)}</div>
          </div>
        </div>
        <div class="weather-meta">
          <div class="weather-meta-item">🌧️ <span class="weather-meta-val">${d.precip}%</span> Regen</div>
          <div class="weather-meta-item">💨 <span class="weather-meta-val">${d.wind} km/h</span></div>
        </div>
      </div>
    `;
  });

  const hourlyEl = document.getElementById('hourlyContainer');
  hourlyEl.innerHTML = '';
  const hours = ['12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  const temps = [21, 21, 22, 23, 23, 22, 21];
  hours.forEach((h, i) => {
    const isRaceStart = h === '15:00';
    const style = isRaceStart ? 'border-color:var(--color-accent);background:var(--color-accent-dim)' : '';
    const label = isRaceStart ? '<div style="font-size:9px;color:var(--color-accent);font-weight:800;margin-top:2px">START</div>' : '';
    hourlyEl.innerHTML += `
      <div class="hourly-item" style="${style}">
        <div class="hourly-time">${h}</div>
        <div class="hourly-icon">☀️</div>
        <div class="hourly-temp">${temps[i]}°</div>
        <div class="hourly-rain">15%💧</div>
        ${label}
      </div>
    `;
  });

  document.getElementById('rainRiskText').textContent = 
    'Basierend auf Klimanorm: Sehr geringe Regenwahrscheinlichkeit (15%). Warmes, sonniges Wetter erwartet. Live-Daten werden beim nächsten Laden verfügbar.';
  document.querySelector('.risk-icon').textContent = '☀️';
  document.querySelector('.risk-title').style.color = 'var(--color-green)';
  document.getElementById('rainRiskCard').style.cssText = 'background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.25)';
}

// ---- REFRESH BUTTON ----
document.getElementById('refreshBtn').addEventListener('click', () => {
  const btn = document.getElementById('refreshBtn');
  btn.querySelector('svg').classList.add('spinning');
  setTimeout(() => btn.querySelector('svg').classList.remove('spinning'), 700);
  weatherLoaded = false;
  loadWeather();
});

// Load weather immediately since it's the main feature
// but only if Weather tab is visible (it's not on load)
// Auto-load for background readiness
setTimeout(() => {
  if (!weatherLoaded) loadWeather();
}, 800);
