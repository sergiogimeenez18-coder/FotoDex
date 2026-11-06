const demoObservations = [
  { id: 1, name: 'Petirrojo europeo', scientific: 'Erithacus rubecula', emoji: '🐦', place: 'Parque del Retiro', ago: 'hace 12 min', user: 'Lucía R.', initial: 'L', kind: 'aves', palette: 'linear-gradient(145deg,#dce9d7,#799477)', likes: 24, liked: false },
  { id: 2, name: 'Mariposa macaón', scientific: 'Papilio machaon', emoji: '🦋', place: 'Casa de Campo', ago: 'hace 38 min', user: 'Pablo N.', initial: 'P', kind: 'insectos', palette: 'linear-gradient(145deg,#efe5bd,#a2ad70)', likes: 18, liked: true },
  { id: 3, name: 'Lagartija ibérica', scientific: 'Podarcis hispanicus', emoji: '🦎', place: 'Sierra de Guadarrama', ago: 'hace 1 h', user: 'Marta V.', initial: 'M', kind: 'reptiles', palette: 'linear-gradient(145deg,#d9e2bf,#819572)', likes: 31, liked: false },
  { id: 4, name: 'Abejaruco europeo', scientific: 'Merops apiaster', emoji: '🐤', place: 'Alcalá de Henares', ago: 'hace 2 h', user: 'Diego F.', initial: 'D', kind: 'aves', palette: 'linear-gradient(145deg,#e8dcae,#9ab0a2)', likes: 12, liked: false }
];

const catalog = [
  ['Petirrojo europeo','Erithacus rubecula','🐦','aves','Bosque y jardines','Ave pequeña reconocible por la mancha anaranjada de la cara y el pecho.'],
  ['Mariposa macaón','Papilio machaon','🦋','insectos','Praderas y huertos','Mariposa grande de alas amarillas y negras.'],
  ['Lagartija ibérica','Podarcis hispanicus','🦎','reptiles','Roquedos y muros','Pequeño reptil diurno que se refugia en grietas y toma el sol.'],
  ['Erizo europeo','Erinaceus europaeus','🦔','mamiferos','Setos y jardines','Mamífero nocturno que busca alimento entre la hojarasca.'],
  ['Zorro rojo','Vulpes vulpes','🦊','mamiferos','Bosques y campos','Carnívoro adaptable que vive en muchos paisajes.'],
  ['Salamandra común','Salamandra salamandra','🦎','anfibios','Bosques húmedos','Anfibio nocturno de coloración negra y amarilla.'],
  ['Ciervo rojo','Cervus elaphus','🦌','mamiferos','Bosques y montes','Gran herbívoro que vive en grupos.'],
  ['Búho real','Bubo bubo','🦉','aves','Cortados y bosques','Rapaz nocturna grande, con penachos y ojos anaranjados.'],
  ['Salamanquesa común','Tarentola mauritanica','🦎','reptiles','Paredes y roquedos','Gecko nocturno que suele cazar insectos cerca de luces.'],
  ['Libélula emperador','Anax imperator','🪰','insectos','Lagunas y riberas','Libélula grande que patrulla aguas quietas en meses cálidos.'],
  ['Abejaruco europeo','Merops apiaster','🐤','aves','Campos y taludes','Ave de colores vivos que captura insectos al vuelo.'],
  ['Mariposa monarca','Danaus plexippus','🦋','insectos','Praderas y jardines','Mariposa anaranjada y negra conocida por sus migraciones.']
].map(([name, scientific, emoji, kind, habitat, description], index) => ({
  name, scientific, emoji, kind, habitat, description,
  palette: ['linear-gradient(145deg,#dce9d7,#799477)','linear-gradient(145deg,#efe5bd,#a2ad70)','linear-gradient(145deg,#d9e2bf,#819572)','linear-gradient(145deg,#e6d8c1,#a78f73)'][index % 4]
}));

const photoInput = document.querySelector('#photo-input');
const captureModal = document.querySelector('#capture-modal');
const choicePanel = document.querySelector('#capture-choice');
const editorPanel = document.querySelector('#capture-editor');
const form = document.querySelector('#capture-form');
const detailModal = document.querySelector('#species-modal');
const urls = new Map();
let captures = [];
let activePhoto = null;
let coordinates = null;
let editingId = null;
let previewURL = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const kindLabel = kind => ({ aves:'Ave', mamiferos:'Mamífero', reptiles:'Reptil', anfibios:'Anfibio', insectos:'Insecto', peces:'Pez', otros:'Otro' })[kind] || 'Animal';
const norm = value => String(value || '').trim().toLocaleLowerCase('es');
const matchesSpecies = (a, b) => (a.scientific && b.scientific && norm(a.scientific) === norm(b.scientific)) || norm(a.name) === norm(b.name);

function db() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fotodex-local', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('captures')) request.result.createObjectStore('captures', { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function readCaptures() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction('captures', 'readonly').objectStore('captures').getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.capturedOn.localeCompare(a.capturedOn)));
    request.onerror = () => reject(request.error);
  });
}
async function writeCapture(item) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('captures', 'readwrite');
    transaction.objectStore('captures').put(item);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
async function deleteCapture(id) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('captures', 'readwrite');
    transaction.objectStore('captures').delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}
function imageURL(item) {
  if (!item?.photo) return '';
  if (!urls.has(item.id)) urls.set(item.id, URL.createObjectURL(item.photo));
  return urls.get(item.id);
}
function clearURLs() { urls.forEach(URL.revokeObjectURL); urls.clear(); }
function notify(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => el.classList.remove('show'), 2800);
}
function modal(el, open) { el.classList.toggle('open', open); el.setAttribute('aria-hidden', String(!open)); }
function isoToday() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10); }
function niceDate(date) { return date ? new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00')) : 'Fecha sin indicar'; }

function entries() {
  const result = catalog.map(species => {
    const capture = captures.find(item => matchesSpecies(species, item));
    return { ...species, capture, seen: Boolean(capture) };
  });
  captures.forEach(capture => {
    if (!result.some(item => matchesSpecies(item, capture))) result.push({
      name: capture.name, scientific: capture.scientific || 'Nombre científico pendiente', emoji:'🐾',
      kind:capture.kind, habitat:capture.habitat || 'Hábitat pendiente',
      description:capture.notes || 'Ficha creada a partir de tu observación.',
      palette:'linear-gradient(145deg,#dce9d7,#799477)', capture, seen:true
    });
  });
  return result;
}

function communityCard(item) {
  return `<article class="capture-card">
    <div class="capture-photo" style="background:${item.palette}"><span class="photo-sky"></span><span class="animal">${item.emoji}</span></div>
    <div class="capture-info"><h3 class="common">${esc(item.name)}</h3><p class="scientific">${esc(item.scientific)}</p>
      <div class="capture-meta"><span>⌖ ${esc(item.place)}</span><span>◷ ${esc(item.ago)}</span></div>
      <div class="capture-user"><span class="mini-avatar">${esc(item.initial)}</span>${esc(item.user)} · ejemplo</div>
    </div><button class="heart ${item.liked?'liked':''}" data-like="${item.id}" aria-label="Me gusta">${item.liked?'♥':'♡'}<small>${item.likes}</small></button>
  </article>`;
}
function localCard(item) {
  const src = imageURL(item);
  return `<article class="capture-card">
    <button class="capture-photo photo-button" data-open-capture="${esc(item.id)}" aria-label="Abrir ficha de ${esc(item.name)}">${src ? `<img src="${src}" alt="${esc(item.name)}"/>` : '<span class="animal">🐾</span>'}</button>
    <div class="capture-info"><h3 class="common">${esc(item.name)}</h3><p class="scientific">${esc(item.scientific || 'Nombre científico pendiente')}</p>
      <div class="capture-meta"><span>⌖ ${esc(item.place || item.country || 'Ubicación no indicada')}</span><span>◷ ${esc(niceDate(item.capturedOn))}</span></div>
      <div class="capture-user"><span class="mini-avatar local-mini">T</span>Tu captura · solo en este dispositivo</div>
    </div><button class="heart" data-open-capture="${esc(item.id)}" aria-label="Abrir captura">↗</button>
  </article>`;
}
function speciesCard(item) {
  const src = item.capture ? imageURL(item.capture) : '';
  return `<button type="button" class="species-card" data-species="${esc(item.name)}">
    <span class="species-art ${src?'has-photo':''}" style="background:${item.palette}">${src ? `<img src="${src}" alt="${esc(item.name)}"/>` : `<span class="creature">${item.emoji}</span>`}</span>
    <span class="species-copy"><span class="species-title">${esc(item.name)}</span><span class="species-scientific">${esc(item.scientific)}</span>
      <span class="species-foot"><span>⌖ ${esc(item.capture?.place || item.capture?.habitat || item.habitat)}</span><span class="badge ${item.seen?'':'badge-muted'}">${item.seen?'Capturada':'Por descubrir'}</span></span>
    </span>
  </button>`;
}

function updateCounts() {
  const all = entries(), collected = all.filter(item => item.seen).length;
  const habitats = new Set(captures.map(item => item.habitat).filter(Boolean)).size;
  const percent = Math.min(100, Math.round(collected / 40 * 100));
  document.querySelector('#capture-count').textContent = captures.length;
  document.querySelector('#species-count').textContent = collected;
  document.querySelector('#habitat-count').textContent = habitats;
  document.querySelector('#profile-capture-count').textContent = captures.length;
  document.querySelector('#profile-species-count').textContent = collected;
  document.querySelector('#progress-count').textContent = collected;
  document.querySelector('#progress-bar').style.width = percent + '%';
  document.querySelector('#progress-percent').textContent = percent + '%';
  document.querySelector('#progress-message').textContent = collected ? '¡Tu colección está creciendo!' : 'Tu primera especie te espera.';
  document.querySelector('#catalog-count').textContent = all.length;
}
function setOptions() {
  const habitatSelect = document.querySelector('#habitat-filter');
  const oldHabitat = habitatSelect.value;
  const habitats = [...new Set(entries().map(item => item.capture?.habitat || item.habitat).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  habitatSelect.innerHTML = '<option value="todos">Todos los hábitats</option>' + habitats.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if (habitats.includes(oldHabitat)) habitatSelect.value = oldHabitat;
  const countries = [...new Set(captures.map(x=>x.country).filter(Boolean))];
  document.querySelector('#country-filter-options').innerHTML = countries.map(x=>`<option value="${esc(x)}"></option>`).join('');
}
function renderSpecies() {
  const type = document.querySelector('.chip.selected[data-filter]')?.dataset.filter || 'todas';
  const status = document.querySelector('#status-filter').value;
  const habitat = document.querySelector('#habitat-filter').value;
  const country = norm(document.querySelector('#country-filter').value);
  const term = norm(document.querySelector('#search-input').value);
  const filtered = entries().filter(item => {
    const h = item.capture?.habitat || item.habitat || '';
    const c = item.capture?.country || '';
    const text = norm([item.name,item.scientific,item.kind,h,c].join(' '));
    return (type==='todas'||type===item.kind) && (status==='todas'||(status==='capturadas'?item.seen:!item.seen))
      && (habitat==='todos'||h===habitat) && (!country||norm(c).includes(country)) && text.includes(term);
  });
  document.querySelector('#species-grid').innerHTML = filtered.length ? filtered.map(speciesCard).join('') : '<div class="empty-state"><strong>No encontramos especies</strong>Prueba con otro nombre o cambia los filtros.</div>';
}
function renderExplore() {
  const term = norm(document.querySelector('#explore-search').value);
  const visible = demoObservations.filter(item=>norm([item.name,item.scientific,item.place,item.user].join(' ')).includes(term));
  document.querySelector('#explore-list').innerHTML = visible.length ? visible.map(communityCard).join('') : '<div class="empty-state"><strong>No encontramos esa observación</strong>Prueba con otro término.</div>';
}
function renderAll() {
  clearURLs(); updateCounts(); setOptions();
  const feed = [...captures.slice(0,3).map(item=>({ ...item, local:true })), ...demoObservations].slice(0,4);
  document.querySelector('#feed-list').innerHTML = feed.length ? feed.map(item=>item.local?localCard(item):communityCard(item)).join('') : '<div class="empty-state"><strong>Aún no hay capturas</strong>Haz tu primera foto para empezar.</div>';
  renderSpecies(); renderExplore();
  const ownSpecies = entries().filter(item=>item.seen).slice(0,4);
  document.querySelector('#profile-grid').innerHTML = ownSpecies.length ? ownSpecies.map(speciesCard).join('') : '<div class="empty-state"><strong>Tu actividad aparecerá aquí</strong>Guarda tu primera captura para empezar.</div>';
}
async function refresh() { captures = await readCaptures(); renderAll(); }

function resetEditor() {
  form.reset(); activePhoto = null; coordinates = null; editingId = null;
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = null; document.querySelector('#photo-size').textContent = '';
  document.querySelector('#use-location').textContent = 'Añadir ubicación';
}
function showChoice() {
  resetEditor(); choicePanel.classList.remove('hidden'); editorPanel.classList.add('hidden'); modal(captureModal,true);
}
function showEditor(photo, existing=null) {
  activePhoto=photo; editingId=existing?.id||null; coordinates=existing?.coordinates||null;
  choicePanel.classList.add('hidden'); editorPanel.classList.remove('hidden');
  if(previewURL) URL.revokeObjectURL(previewURL);
  previewURL=URL.createObjectURL(photo.blob); document.querySelector('#photo-preview').src=previewURL;
  document.querySelector('#photo-size').textContent='Foto optimizada · '+Math.max(1,Math.round(photo.blob.size/1024)).toLocaleString('es-ES')+' KB';
  form.elements.name.value=existing?.name||''; form.elements.scientific.value=existing?.scientific||'';
  form.elements.kind.value=existing?.kind||''; form.elements.habitat.value=existing?.habitat||'';
  form.elements.country.value=existing?.country||''; form.elements.place.value=existing?.place||'';
  form.elements.notes.value=existing?.notes||''; form.elements.date.value=existing?.capturedOn||isoToday();
  document.querySelector('#use-location').textContent=coordinates?'Ubicación añadida ✓':'Añadir ubicación';
  modal(captureModal,true);
}
function pickPhoto(camera) {
  if(camera) photoInput.setAttribute('capture','environment'); else photoInput.removeAttribute('capture');
  photoInput.click();
}
function compressPhoto(file) {
  return new Promise((resolve,reject)=>{
    const img=new Image(), source=URL.createObjectURL(file);
    img.onload=()=>{
      const max=1920, scale=Math.min(1,max/Math.max(img.width,img.height));
      const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext('2d',{alpha:false});
      if(!ctx){URL.revokeObjectURL(source);reject(new Error('Canvas unavailable'));return}
      ctx.drawImage(img,0,0,canvas.width,canvas.height); URL.revokeObjectURL(source);
      canvas.toBlob(blob=>blob?resolve({blob,width:canvas.width,height:canvas.height}):reject(new Error('Compression failed')),'image/jpeg',0.82);
    };
    img.onerror=()=>{URL.revokeObjectURL(source);reject(new Error('Image failed'))}; img.src=source;
  });
}
async function saveCapture(event) {
  event.preventDefault();
  if(!activePhoto){notify('Elige una foto antes de guardar.');return}
  if(!form.reportValidity()) return;
  const data=new FormData(form), previous=editingId?captures.find(x=>x.id===editingId):null;
  const item={
    id:editingId||(crypto.randomUUID?crypto.randomUUID():String(Date.now())),
    name:String(data.get('name')).trim(), scientific:String(data.get('scientific')).trim(),
    kind:String(data.get('kind')), habitat:String(data.get('habitat')).trim(),
    country:String(data.get('country')).trim(), place:String(data.get('place')).trim(),
    notes:String(data.get('notes')).trim(), capturedOn:String(data.get('date')),
    photo:activePhoto.blob, photoWidth:activePhoto.width, photoHeight:activePhoto.height,
    coordinates, createdAt:previous?.createdAt||new Date().toISOString(), updatedAt:new Date().toISOString()
  };
  const button=document.querySelector('.save-capture'); button.disabled=true; button.textContent='Guardando…';
  try { await writeCapture(item); modal(captureModal,false); resetEditor(); await refresh(); notify('Captura guardada en este dispositivo.'); }
  catch { notify('No se pudo guardar. Revisa el espacio disponible en el dispositivo.'); }
  finally { button.disabled=false; button.textContent='Guardar captura'; }
}
function showCaptureDetails(id) {
  const item=captures.find(x=>x.id===id); if(!item)return;
  const src=imageURL(item), place=[item.place,item.country].filter(Boolean).join(', ')||'Ubicación no indicada';
  document.querySelector('#species-detail-content').innerHTML=`
    <div class="detail-photo">${src?`<img src="${src}" alt="${esc(item.name)}"/>`:'🐾'}</div>
    <p class="eyebrow">TU OBSERVACIÓN · ${esc(niceDate(item.capturedOn))}</p><h2>${esc(item.name)}</h2><p class="detail-scientific">${esc(item.scientific||'Nombre científico pendiente')}</p>
    <div class="detail-grid"><div><small>GRUPO</small><strong>${esc(kindLabel(item.kind))}</strong></div><div><small>HÁBITAT</small><strong>${esc(item.habitat||'Pendiente')}</strong></div><div><small>UBICACIÓN</small><strong>${esc(place)}</strong></div><div><small>FOTO</small><strong>${item.photoWidth} × ${item.photoHeight} px</strong></div></div>
    ${item.notes?`<p class="detail-notes">${esc(item.notes)}</p>`:''}<p class="privacy-note">Guardada solo en este dispositivo; aún no se sincroniza ni se comparte.</p>
    <div class="detail-actions"><button class="edit-button" data-edit-capture="${esc(item.id)}">Editar ficha</button><button class="delete-button" data-delete-capture="${esc(item.id)}">Eliminar</button></div>`;
  modal(detailModal,true);
}
function showSpeciesDetails(name) {
  const item=entries().find(x=>x.name===name); if(!item)return;
  const src=item.capture?imageURL(item.capture):'';
  document.querySelector('#species-detail-content').innerHTML=`
    <div class="detail-photo" style="background:${item.palette}">${src?`<img src="${src}" alt="${esc(item.name)}"/>`:item.emoji}</div>
    <p class="eyebrow">FICHA DE ESPECIE · ${item.seen?'YA CAPTURADA':'POR DESCUBRIR'}</p><h2>${esc(item.name)}</h2><p class="detail-scientific">${esc(item.scientific)}</p><p class="species-description">${esc(item.description)}</p>
    <div class="detail-grid"><div><small>GRUPO</small><strong>${esc(kindLabel(item.kind))}</strong></div><div><small>HÁBITAT</small><strong>${esc(item.capture?.habitat||item.habitat)}</strong></div><div><small>ESTADO</small><strong>${item.seen?'Capturada':'Aún no capturada'}</strong></div><div><small>UBICACIÓN</small><strong>${esc(item.capture?.place||item.capture?.country||'Pendiente')}</strong></div></div>
    <p class="privacy-note">Ficha introductoria; revisaremos los datos científicos al conectar una fuente de referencia.</p>
    ${item.capture?`<div class="detail-actions"><button class="edit-button" data-open-capture="${esc(item.capture.id)}">Ver mi captura</button></div>`:''}`;
  modal(detailModal,true);
}
function useLocation() {
  if(!navigator.geolocation){notify('Este navegador no ofrece ubicación.');return}
  const button=document.querySelector('#use-location'); button.disabled=true; button.textContent='Buscando…';
  navigator.geolocation.getCurrentPosition(position=>{
    coordinates={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:Math.round(position.coords.accuracy)};
    button.disabled=false; button.textContent='Ubicación añadida ✓'; notify('Ubicación guardada localmente en la ficha.');
  },()=>{
    button.disabled=false; button.textContent='Añadir ubicación'; notify('No se concedió acceso. Puedes escribir el lugar manualmente.');
  },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
function goToView(name) {
  document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===name+'-view'));
  document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelector('#today-label').textContent=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toLocaleUpperCase('es');
document.querySelector('#search-input').addEventListener('input',renderSpecies);
document.querySelector('#explore-search').addEventListener('input',renderExplore);
['status-filter','habitat-filter','country-filter'].forEach(id=>document.querySelector('#'+id).addEventListener('input',renderSpecies));
document.querySelectorAll('.chip[data-filter]').forEach(chip=>chip.addEventListener('click',()=>{
  document.querySelectorAll('.chip[data-filter]').forEach(item=>item.classList.remove('selected')); chip.classList.add('selected'); renderSpecies();
}));
document.querySelector('#filter-button').addEventListener('click',()=>document.querySelector('#advanced-filters').classList.toggle('filters-open'));
document.querySelector('#take-photo').addEventListener('click',()=>pickPhoto(true));
document.querySelector('#choose-photo').addEventListener('click',()=>pickPhoto(false));
document.querySelector('#back-to-choice').addEventListener('click',()=>{choicePanel.classList.remove('hidden');editorPanel.classList.add('hidden');resetEditor()});
document.querySelector('#use-location').addEventListener('click',useLocation);
form.addEventListener('submit',saveCapture);
photoInput.addEventListener('change',async event=>{
  const file=event.target.files?.[0]; if(!file)return;
  try{showEditor(await compressPhoto(file))}catch{notify('No se pudo procesar esa foto. Prueba con otra imagen.')}
  finally{event.target.value=''}
});
document.addEventListener('click',async event=>{
  const view=event.target.closest('[data-view]'); if(view){goToView(view.dataset.view);return}
  if(event.target.closest('[data-action="camera"]')){showChoice();return}
  if(event.target.closest('.modal-close')){if(detailModal.classList.contains('open'))modal(detailModal,false);else{modal(captureModal,false);resetEditor()}return}
  if(event.target===captureModal){modal(captureModal,false);resetEditor();return}
  if(event.target===detailModal){modal(detailModal,false);return}
  const edit=event.target.closest('[data-edit-capture]');
  if(edit){const item=captures.find(x=>x.id===edit.dataset.editCapture);if(!item)return;modal(detailModal,false);showEditor({blob:item.photo,width:item.photoWidth,height:item.photoHeight},item);return}
  const open=event.target.closest('[data-open-capture]');
  if(open){modal(detailModal,false);showCaptureDetails(open.dataset.openCapture);return}
  const remove=event.target.closest('[data-delete-capture]');
  if(remove){if(!confirm('¿Eliminar esta captura de este dispositivo? No se puede deshacer.'))return;try{await deleteCapture(remove.dataset.deleteCapture);modal(detailModal,false);await refresh();notify('Captura eliminada.')}catch{notify('No se pudo eliminar la captura.')}return}
  const species=event.target.closest('[data-species]');
  if(species){showSpeciesDetails(species.dataset.species);return}
  const like=event.target.closest('[data-like]');
  if(like){const item=demoObservations.find(x=>x.id===Number(like.dataset.like));if(item){item.liked=!item.liked;item.likes+=item.liked?1:-1;renderExplore()}}
});

refresh().catch(()=>{renderAll();notify('Abre FotoDex desde su dirección web segura para guardar capturas.')});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
