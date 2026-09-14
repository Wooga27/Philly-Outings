// ============================================================
// PHILLY POUR — site script
//
// To go live with real texts/emails from the signup form, this is
// a static site (GitHub Pages has no backend), so wire the form to
// a free form-handling service. Formspree is the easiest:
//   1. Create a form at https://formspree.io (free tier is fine)
//   2. Paste your form endpoint below into FORM_ENDPOINT
// Until you do, the form just shows a confirmation message locally
// and logs the submission to the console.
// ============================================================
const FORM_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"

const HOOD_COLORS = {
  fishtown: '#EF8B2C',
  nolibs: '#1C4E9E',
  rittenhouse: '#E5402A',
  southphilly: '#F2C230',
  fairmount: '#1C4E9E',
  universitycity: '#EF8B2C',
};
const HOOD_LABELS = {
  fishtown: 'Fishtown',
  nolibs: 'Northern Libs',
  rittenhouse: 'Rittenhouse',
  southphilly: 'South Philly',
  fairmount: 'Fairmount',
  universitycity: 'University City',
};

let deals = [];
let events = [];

// ---------- Header height -> keeps the filter bar pinned right below the nav ----------
function updateHeaderOffset(){
  const header = document.querySelector('header');
  if(header){
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
}
window.addEventListener('resize', updateHeaderOffset);

// ---------- Data loading ----------
async function loadData(){
  const board = document.getElementById('boardGrid');
  const lineup = document.getElementById('lineupScroll');
  try{
    const [dealsRes, eventsRes] = await Promise.all([
      fetch('data/deals.json'),
      fetch('data/events.json'),
    ]);
    if(!dealsRes.ok || !eventsRes.ok) throw new Error('Data files did not load');
    deals = await dealsRes.json();
    events = await eventsRes.json();
    renderLineup();
    renderBoard();
  }catch(err){
    console.error('Philly Pour: could not load data/*.json —', err);
    board.innerHTML = '<div class="no-results">Couldn\'t load the deals right now. If you\'re opening this file directly, run a local server instead (see README) — browsers block fetch() over file://.</div>';
    lineup.innerHTML = '<div class="lineup-empty">Couldn\'t load tonight\'s lineup. See the console for details.</div>';
  }
}

// ---------- Render: Tonight's Lineup ----------
function renderLineup(){
  const lineup = document.getElementById('lineupScroll');
  lineup.innerHTML = '';
  if(!events.length){
    lineup.innerHTML = '<div class="lineup-empty">Nothing posted yet — check back soon.</div>';
    return;
  }
  events.forEach(ev => {
    const stub = document.createElement('div');
    stub.className = 'stub';
    stub.innerHTML = `
      <div class="stub-main">
        <div class="stub-day">${escapeHtml(ev.day)}</div>
        <h4>${escapeHtml(ev.title)}</h4>
        <p class="venue">${escapeHtml(ev.venue)}</p>
        <span class="tag">${escapeHtml(ev.tag)}</span>
      </div>
      <div class="stub-tab" style="background:${ev.color}">${escapeHtml(ev.kind)}</div>
    `;
    lineup.appendChild(stub);
  });
}

// ---------- Render: The Board ----------
function renderBoard(){
  const board = document.getElementById('boardGrid');
  const activeHood = document.querySelector('[data-filter="hood"].active')?.dataset.value || 'all';
  const activeVibe = document.querySelector('[data-filter="vibe"].active')?.dataset.value || 'all';

  const filtered = deals.filter(d => {
    const hoodOk = activeHood === 'all' || d.hood === activeHood;
    const vibeOk = activeVibe === 'all' || d.vibe.includes(activeVibe);
    return hoodOk && vibeOk;
  });

  board.innerHTML = '';
  if(filtered.length === 0){
    board.innerHTML = '<div class="no-results">Nothing matches that combo yet — try Reset or check back tomorrow.</div>';
    return;
  }

  filtered.forEach(d => {
    const card = document.createElement('div');
    card.className = 'deal-card';
    const hhLive = d.hh === 'live';
    card.innerHTML = `
      <div class="pin"></div>
      <div class="deal-top">
        <span class="hood-tag" style="background:${HOOD_COLORS[d.hood] || '#999'}">${escapeHtml(HOOD_LABELS[d.hood] || d.hood)}</span>
        <span class="hh-badge ${hhLive ? 'live' : ''}">${hhLive ? 'Happy hour live' : 'HH later today'}</span>
      </div>
      <h4>${escapeHtml(d.name)}</h4>
      <p class="vibe">${escapeHtml(d.note)}</p>
      <div class="deal-price">
        <span class="from">From</span>
        <span class="price">$${Number(d.price).toFixed(2)}</span>
      </div>
      <div class="deal-tags">
        ${d.vibe.map(v => `<span>${escapeHtml(v)}</span>`).join('')}
      </div>
    `;
    board.appendChild(card);
  });
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ---------- Filters ----------
function wireFilters(){
  document.querySelectorAll('.pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.filter;
      document.querySelectorAll(`[data-filter="${group}"]`).forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      renderBoard();
    });
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    document.querySelectorAll('[data-filter="hood"]').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    document.querySelector('[data-filter="hood"][data-value="all"]').classList.add('active');
    document.querySelector('[data-filter="hood"][data-value="all"]').setAttribute('aria-pressed', 'true');

    document.querySelectorAll('[data-filter="vibe"]').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    document.querySelector('[data-filter="vibe"][data-value="all"]').classList.add('active');
    document.querySelector('[data-filter="vibe"][data-value="all"]').setAttribute('aria-pressed', 'true');

    renderBoard();
  });
}

// ---------- Signup form ----------
function wireSignupForm(){
  const form = document.getElementById('dropForm');
  const confirmMsg = document.getElementById('confirmMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    confirmMsg.className = '';
    confirmMsg.style.display = 'none';

    const input = document.getElementById('dropInput');
    const value = input.value.trim();

    if(!FORM_ENDPOINT){
      // Demo mode: no backend configured yet.
      console.info('Philly Pour signup (demo mode, not sent anywhere):', value);
      confirmMsg.textContent = "✓ You're in. (Demo mode — connect FORM_ENDPOINT in js/script.js to actually collect signups.)";
      confirmMsg.className = 'confirm-msg';
      confirmMsg.style.display = 'inline-block';
      form.reset();
      return;
    }

    try{
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value }),
      });
      if(!res.ok) throw new Error('Form endpoint returned an error');
      confirmMsg.textContent = "✓ You're in. Watch for a text Thursday.";
      confirmMsg.className = 'confirm-msg';
      confirmMsg.style.display = 'inline-block';
      form.reset();
    }catch(err){
      console.error('Philly Pour signup failed:', err);
      confirmMsg.textContent = "Something went wrong — try again in a minute.";
      confirmMsg.className = 'error-msg';
      confirmMsg.style.display = 'inline-block';
    }
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderOffset();
  wireFilters();
  wireSignupForm();
  loadData();
});
