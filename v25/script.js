// Category colours (match existing CSS palette)
const CAT_COLOR = {
  log:  '#E24B4A', cult: '#378ADD', art:  '#7F77DD',
  food: '#EF9F27', nat:  '#639922', exp:  '#D85A30',
  rest: '#888780', vg:   '#1D9E75',
};

const mapInstances = {};

function makeIcon(cat) {
  const color = CAT_COLOR[cat] || '#888780';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18C24 5.37 18.63 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 30],
    iconAnchor: [12, 30],
    popupAnchor: [0, -30],
  });
}

function initMap(dayId) {
  if (mapInstances[dayId]) return;
  const data = DAY_POIS[dayId];
  if (!data) return;
  const el = document.getElementById('lmap-' + dayId);
  if (!el) return;

  const map = L.map(el, { zoomControl: true, scrollWheelZoom: false })
               .setView(data.center, data.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  data.pois.forEach(p => {
    L.marker([p.lat, p.lng], { icon: makeIcon(p.cat) })
     .addTo(map)
     .bindPopup(`<strong style="font-size:12px">${p.name}</strong>`);
  });

  mapInstances[dayId] = map;
}

function toggleMap(dayId) {
  const panel = document.getElementById('map-' + dayId);
  const btn   = panel.previousElementSibling;
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  if (!isOpen) {
    initMap(dayId);
    setTimeout(() => mapInstances[dayId]?.invalidateSize(), 50);
  }
}

function showPhase(id){
  document.querySelectorAll('.phase').forEach(p=>p.classList.remove('visible'));
  document.getElementById('phase-'+id).classList.add('visible');
  document.querySelectorAll('.phase-tab').forEach(t=>
    t.classList.toggle('active', t.getAttribute('onclick')==="showPhase('"+id+"')")
  );
}

function showDay(ph,idx){
  document.querySelectorAll('#phase-'+ph+' .day-card').forEach((c,i)=>c.classList.toggle('visible',i===idx));
  document.querySelectorAll('#phase-'+ph+' .day-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
}

function showCity(id){
  document.querySelectorAll('#phase-via .city-section').forEach(s=>s.classList.remove('visible'));
  document.getElementById('city-'+id).classList.add('visible');
  document.querySelectorAll('.city-tab').forEach(t=>t.classList.toggle('active',t.getAttribute('onclick')==="showCity('"+id+"')"));
}

function showDayInCity(city,idx){
  const sec=document.getElementById('city-'+city);
  sec.querySelectorAll('.day-card').forEach((c,i)=>c.classList.toggle('visible',i===idx));
  sec.querySelectorAll('.day-tab').forEach((t,i)=>t.classList.toggle('active',i===idx));
}

// ── localStorage persistence ──────────────────────────────────────
function storageKey(el){
  const text = (el.querySelector('.check-label, .wish-item, .food-name') || el).textContent.trim().slice(0,80);
  return 'jp26_' + text.replace(/\s+/g,'_').replace(/[^\w]/g,'');
}

function saveState(el){
  try { localStorage.setItem(storageKey(el), el.classList.contains('done') ? '1' : '0'); } catch(e){}
}

function restoreAll(){
  document.querySelectorAll('.check-item, .wish-item').forEach(el => {
    try {
      const v = localStorage.getItem(storageKey(el));
      if(v === '1') el.classList.add('done');
      else if(v === '0') el.classList.remove('done');
    } catch(e){}
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreAll();

  document.querySelectorAll('.check-item').forEach(el => {
    el.onclick = () => { el.classList.toggle('done'); saveState(el); };
  });

  document.querySelectorAll('.wish-item').forEach(el => {
    el.onclick = () => { el.classList.toggle('done'); saveState(el); };
  });
});
// ─────────────────────────────────────────────────────────────────
