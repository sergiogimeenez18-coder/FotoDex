const demoObservations = [
  { id: 1, name: 'Petirrojo europeo', scientific: 'Erithacus rubecula', emoji: '🐦', place: 'Parque del Retiro', ago: 'hace 12 min', user: 'Lucía R.', initial: 'L', kind: 'aves', palette: 'linear-gradient(145deg,#dce9d7,#799477)', likes: 24, liked: false },
  { id: 2, name: 'Mariposa macaón', scientific: 'Papilio machaon', emoji: '🦋', place: 'Casa de Campo', ago: 'hace 38 min', user: 'Pablo N.', initial: 'P', kind: 'insectos', palette: 'linear-gradient(145deg,#efe5bd,#a2ad70)', likes: 18, liked: true },
  { id: 3, name: 'Lagartija ibérica', scientific: 'Podarcis hispanicus', emoji: '🦎', place: 'Sierra de Guadarrama', ago: 'hace 1 h', user: 'Marta V.', initial: 'M', kind: 'reptiles', palette: 'linear-gradient(145deg,#d9e2bf,#819572)', likes: 31, liked: false },
  { id: 4, name: 'Abejaruco europeo', scientific: 'Merops apiaster', emoji: '🐤', place: 'Alcalá de Henares', ago: 'hace 2 h', user: 'Diego F.', initial: 'D', kind: 'aves', palette: 'linear-gradient(145deg,#e8dcae,#9ab0a2)', likes: 12, liked: false }
];

const starterCatalog = [
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
const targetKinds={aves:{emoji:'🐦',palette:'linear-gradient(145deg,#dce9d7,#799477)'},mamiferos:{emoji:'🐾',palette:'linear-gradient(145deg,#e6d8c1,#a78f73)'},reptiles:{emoji:'🦎',palette:'linear-gradient(145deg,#d9e2bf,#819572)'},anfibios:{emoji:'🐸',palette:'linear-gradient(145deg,#d9e8d1,#839c76)'},insectos:{emoji:'🦋',palette:'linear-gradient(145deg,#efe5bd,#a2ad70)'},peces:{emoji:'🐟',palette:'linear-gradient(145deg,#dce8ed,#789aa2)'},otros:{emoji:'🌊',palette:'linear-gradient(145deg,#dce8ed,#789aa2)'}};
const starterByName=new Map(starterCatalog.map(item=>[item.name.toLocaleLowerCase('es'),item]));
let customSpecies=[];
try{const saved=JSON.parse(localStorage.getItem('fotodex-custom-species-v1')||'[]');if(Array.isArray(saved))customSpecies=saved.filter(item=>item&&typeof item.name==='string'&&typeof item.kind==='string').slice(0,500)}catch{}
const baseCatalog=Array.isArray(window.FOTODEX_SPECIES_TARGETS)&&window.FOTODEX_SPECIES_TARGETS.length
  ? window.FOTODEX_SPECIES_TARGETS.map((item,index)=>{const known=starterByName.get(item.name.toLocaleLowerCase('es'));return {name:item.name,scientific:known?.scientific||'',emoji:known?.emoji||targetKinds[item.kind]?.emoji||'🐾',kind:item.kind,habitat:known?.habitat||'',description:known?.description||'Especie incluida en la lista principal de FotoDex. Los datos científicos y de hábitat se completarán con fuentes fiables.',palette:known?.palette||targetKinds[item.kind]?.palette||['linear-gradient(145deg,#dce9d7,#799477)','linear-gradient(145deg,#efe5bd,#a2ad70)','linear-gradient(145deg,#d9e2bf,#819572)','linear-gradient(145deg,#e6d8c1,#a78f73)'][index%4]}})
  : starterCatalog;
const customCatalogItem=item=>({name:item.name,scientific:item.scientific||'',emoji:targetKinds[item.kind]?.emoji||'🐾',kind:item.kind,habitat:item.habitat||'',description:'Añadida por ti a tu lista de especies.',palette:targetKinds[item.kind]?.palette||'linear-gradient(145deg,#dce9d7,#799477)',isCustom:true});
const catalog=[...baseCatalog,...customSpecies.map(customCatalogItem)];

const photoInput = document.querySelector('#photo-input');
const captureModal = document.querySelector('#capture-modal');
const choicePanel = document.querySelector('#capture-choice');
const editorPanel = document.querySelector('#capture-editor');
const form = document.querySelector('#capture-form');
const detailModal = document.querySelector('#species-modal');
const urls = new Map();
let captures = [];
const COLLECTION_PAGE_SIZE = 48;
let collectionVisibleCount = COLLECTION_PAGE_SIZE;
let activePhoto = null;
let coordinates = null;
let editingId = null;
let previewURL = null;
let supabaseClient = null;
let authUser = null;
let pendingSyncPromise = null;
let activeProfile = null;
let cloudCaptures = [];
let profileCloudCaptures = [];
let activePublicProfileId = null;
let notifications = [];
let authMode = 'signin';
let followedIds = new Set();
let exploreMode = 'captures';
let peopleSearchRun = 0;
let peopleSearchTimer = null;
let deferredInstallPrompt = null;
let aiCandidates = [];
let identificationSource = 'manual';
let identificationConfidence = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const kindLabel = kind => ({ aves:'Ave', mamiferos:'Mamífero', reptiles:'Reptil', anfibios:'Anfibio', insectos:'Insecto', peces:'Pez', otros:'Otro' })[kind] || 'Animal';
const norm = value => String(value || '').trim().toLocaleLowerCase('es');
const taxonKey = value => norm(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
let taxonomyCache={};
try{taxonomyCache=JSON.parse(localStorage.getItem('fotodex-taxonomy-cache-v1')||'{}')||{}}catch{}
let activeTaxonomyName='';
let activeTaxonomyCandidates=[];
let taxonomyLookupRun=0;
function scientificFor(item){return item?.capture?.scientific||item?.scientific||taxonomyCache[taxonKey(item?.name)]?.canonicalName||''}
const matchesSpecies = (a, b) => (a.scientific && b.scientific && norm(a.scientific) === norm(b.scientific)) || norm(a.name) === norm(b.name);
function identificationInfo(item) {
  if(item?.identificationSource==='ai'){
    const raw=Number(item.identificationConfidence),score=Number.isFinite(raw)?Math.round(Math.max(0,Math.min(1,raw))*100):null;
    return `<p class="identification-note"><strong>✳ Sugerencia asistida por IA</strong>${score===null?'':` · Coincidencia orientativa: ${score}%`}<br/><span>La estimación no está calibrada y puede equivocarse. Revisa la identificación.</span></p>`;
  }
  return '<p class="identification-note"><strong>Identificación manual</strong><br/><span>Nombre añadido por la persona que hizo la captura.</span></p>';
}

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
function formatStorageSize(bytes){
  if(!Number.isFinite(bytes)||bytes<0)return '—';
  const units=['B','KB','MB','GB'];let size=bytes,unit=0;
  while(size>=1024&&unit<units.length-1){size/=1024;unit++}
  return `${size.toLocaleString('es-ES',{maximumFractionDigits:unit?1:0})} ${units[unit]}`;
}
async function updateStorageStatus(){
  const status=document.querySelector('#storage-status'),note=document.querySelector('#storage-note'),button=document.querySelector('#storage-persist');
  if(!status||!note||!button)return;
  const storage=navigator.storage;
  if(!storage?.estimate){status.textContent='Este navegador no informa del espacio utilizado.';button.classList.add('hidden');return}
  try{
    const estimate=await storage.estimate(),usage=Number(estimate.usage),quota=Number(estimate.quota);
    status.textContent=Number.isFinite(usage)&&Number.isFinite(quota)?`FotoDex utiliza aproximadamente ${formatStorageSize(usage)} de ${formatStorageSize(quota)} disponibles para este sitio.`:'No se pudo calcular el espacio disponible.';
    const persisted=typeof storage.persisted==='function'?await storage.persisted():false;
    if(persisted){button.textContent='Almacenamiento protegido';button.disabled=true;note.textContent='El navegador conservará estos datos frente a limpiezas automáticas. Una copia de seguridad sigue siendo recomendable.'}
    else if(typeof storage.persist==='function'){button.classList.remove('hidden');button.disabled=false;button.textContent='Pedir al navegador que conserve los datos';note.textContent='El navegador puede aceptar o rechazar la solicitud. Descarga copias de seguridad para conservar tus capturas.'}
    else{button.classList.add('hidden');note.textContent='Este navegador no permite solicitar protección del almacenamiento. Descarga copias de seguridad para conservar tus capturas.'}
  }catch(error){console.warn('FotoDex storage estimate:',error);status.textContent='No se pudo consultar el espacio del navegador.';button.classList.add('hidden');note.textContent='Descarga copias de seguridad para conservar tus capturas.'}
}
async function requestStoragePersistence(){
  const button=document.querySelector('#storage-persist'),note=document.querySelector('#storage-note');
  if(typeof navigator.storage?.persist!=='function'){note.textContent='Este navegador no permite solicitar protección del almacenamiento.';button.classList.add('hidden');return}
  button.disabled=true;button.textContent='Consultando al navegador…';
  try{
    const granted=await navigator.storage.persist();
    if(granted){notify('El navegador aceptó conservar los datos de FotoDex.');await updateStorageStatus()}
    else{button.disabled=false;button.textContent='Pedir al navegador que conserve los datos';note.textContent='El navegador no ha aceptado la solicitud. Descarga copias de seguridad para conservar tus capturas.'}
  }catch(error){console.warn('FotoDex persistent storage:',error);button.disabled=false;button.textContent='Pedir al navegador que conserve los datos';note.textContent='No se pudo solicitar protección. Descarga copias de seguridad para conservar tus capturas.'}
}
function imageURL(item) {
  if (item?.imageUrl) return item.imageUrl;
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
let lightboxReturnFocus=null;
function openPhotoLightbox(src,name){
  if(!src)return;
  const viewer=document.querySelector('#photo-lightbox'),image=document.querySelector('#photo-lightbox-image');
  lightboxReturnFocus=document.activeElement;image.src=src;image.alt=`Fotografía ampliada de ${name||'la captura'}`;modal(viewer,true);document.querySelector('#photo-lightbox-close').focus();
}
function closePhotoLightbox(){
  const viewer=document.querySelector('#photo-lightbox');if(!viewer.classList.contains('open'))return;
  modal(viewer,false);document.querySelector('#photo-lightbox-image').removeAttribute('src');
  if(lightboxReturnFocus?.isConnected)lightboxReturnFocus.focus();lightboxReturnFocus=null;
}
function setupAppInstall(){
  const button=document.querySelector('#install-app'),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(standalone)return;
  const userAgent=navigator.userAgent||'',isIOS=/iPhone|iPad|iPod/i.test(userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  button.classList.remove('hidden');
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;button.classList.remove('hidden')});
  button.addEventListener('click',async()=>{
    if(deferredInstallPrompt){const promptEvent=deferredInstallPrompt;deferredInstallPrompt=null;try{await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice?.outcome==='accepted')button.classList.add('hidden')}catch{notify('No se pudo abrir la instalación. Usa el menú del navegador.')}return}
    notify(isIOS?'En Safari: Compartir → Añadir a pantalla de inicio.':'Abre el menú del navegador y elige «Instalar» o «Añadir a pantalla de inicio».');
  });
  window.addEventListener('appinstalled',()=>button.classList.add('hidden'));
}
function isoToday() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10); }
function niceDate(date) { return date ? new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00')) : 'Fecha sin indicar'; }

function entries() {
  const ownCloud = authUser ? cloudCaptures.filter(item => item.userId === authUser.id) : [];
  const allCaptures = [...captures, ...ownCloud];
  const result = catalog.map(species => {
    const enriched={...species,scientific:species.scientific||taxonomyCache[taxonKey(species.name)]?.canonicalName||''};
    const capture = allCaptures.find(item => matchesSpecies(enriched, item));
    return { ...enriched, capture, seen: Boolean(capture) };
  });
  allCaptures.forEach(capture => {
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
    <button type="button" class="capture-photo community-photo" style="background:${item.palette}" ${item.cloudId?`data-cloud-capture="${esc(item.cloudId)}"`:''} aria-label="Abrir captura de ${esc(item.name)}">${item.imageUrl?`<img src="${esc(item.imageUrl)}" alt="${esc(item.name)}" loading="lazy" decoding="async"/>`:`<span class="photo-sky"></span><span class="animal">${item.emoji}</span>`}</button>
    <div class="capture-info"><h3 class="common">${esc(item.name)}</h3><p class="scientific">${esc(item.scientific)}</p>
      <div class="capture-meta"><span>⌖ ${esc(item.place)}</span><span>◷ ${esc(item.ago)}</span></div>
      <div class="capture-user"><span class="mini-avatar">${esc(item.initial)}</span>${item.cloudId&&item.userId?`<button type="button" class="person-name" data-open-profile="${esc(item.userId)}">${esc(item.user)}</button>`:esc(item.user)}${item.demo===false?'':' · ejemplo'}${item.cloudId&&item.userId!==authUser?.id?`<button class="follow-button" data-follow-user="${esc(item.userId)}">${item.following?'Siguiendo':'Seguir'}</button>`:''}</div>
    </div><div class="capture-actions"><button class="heart ${item.liked?'liked':''}" ${item.cloudId?`data-cloud-like="${esc(item.cloudId)}"`:`data-like="${item.id}"`} aria-label="Me gusta">${item.liked?'♥':'♡'}<small>${item.likes}</small></button>${item.cloudId?`<button class="comment-action" data-open-comments="${esc(item.cloudId)}" aria-label="Ver comentarios">▢<small>${item.comments||0}</small></button>`:''}</div>
  </article>`;
}
function localCard(item) {
  const src = imageURL(item);
  return `<article class="capture-card">
    <button class="capture-photo photo-button" data-open-capture="${esc(item.id)}" aria-label="Abrir ficha de ${esc(item.name)}">${src ? `<img src="${src}" alt="${esc(item.name)}" loading="lazy" decoding="async"/>` : '<span class="animal">🐾</span>'}</button>
    <div class="capture-info"><h3 class="common">${esc(item.name)}</h3><p class="scientific">${esc(item.scientific || 'Nombre científico pendiente')}</p>
      <div class="capture-meta"><span>⌖ ${esc(item.place || item.country || 'Ubicación no indicada')}</span><span>◷ ${esc(niceDate(item.capturedOn))}</span></div>
      <div class="capture-user"><span class="mini-avatar local-mini">T</span>${item.cloudSynced?'Tu captura · sincronizada con tu cuenta':'Tu captura · solo en este dispositivo'}</div>
    </div><button class="heart" data-open-capture="${esc(item.id)}" aria-label="Abrir captura">↗</button>
  </article>`;
}
function speciesCard(item) {
  const src = item.capture ? imageURL(item.capture) : '';
  const needsScientific=Boolean(item.capture&&!String(item.capture.scientific||scientificFor(item)||'').trim());
  return `<button type="button" class="species-card" data-species="${esc(item.name)}">
    <span class="species-art ${src?'has-photo':''}" style="background:${item.palette}">${src ? `<img src="${src}" alt="${esc(item.name)}" loading="lazy" decoding="async"/>` : `<span class="creature">${item.emoji}</span>`}</span>
    <span class="species-copy"><span class="species-title">${esc(item.name)}</span><span class="species-scientific">${esc(scientificFor(item)||'Nombre científico pendiente')}</span>
      <span class="species-foot"><span>⌖ ${esc(item.capture?.place || item.capture?.habitat || item.habitat || 'Hábitat pendiente')}</span><span class="badge ${needsScientific?'badge-review':item.seen?'':'badge-muted'}">${needsScientific?'Completar ficha':item.seen?'Capturada':'Por descubrir'}</span></span>
    </span>
  </button>`;
}

function updateCounts() {
  const all = entries(), collected = all.filter(item => item.seen).length;
  const ownCloud = authUser ? cloudCaptures.filter(item => item.userId === authUser.id) : [];
  const ownCaptures = [...new Map([...captures, ...ownCloud].map(item=>[item.id,item])).values()];
  const habitats = new Set(ownCaptures.map(item => item.habitat).filter(Boolean)).size;
  const percent = Math.min(100, Math.round(collected / Math.max(1, all.length) * 100));
  document.querySelector('#capture-count').textContent = ownCaptures.length;
  document.querySelector('#species-count').textContent = collected;
  document.querySelector('#habitat-count').textContent = habitats;
  document.querySelector('#profile-capture-count').textContent = ownCaptures.length;
  document.querySelector('#profile-species-count').textContent = collected;
  document.querySelector('#progress-count').textContent = collected;
  document.querySelector('#progress-total').textContent = all.length;
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
function renderSpecies(resetPage=true) {
  if(resetPage)collectionVisibleCount=COLLECTION_PAGE_SIZE;
  const type = document.querySelector('.chip.selected[data-filter]')?.dataset.filter || 'todas';
  const status = document.querySelector('#status-filter').value;
  const habitat = document.querySelector('#habitat-filter').value;
  const country = norm(document.querySelector('#country-filter').value);
  const sort = document.querySelector('#species-sort').value;
  const term = norm(document.querySelector('#search-input').value);
  const filtered = entries().filter(item => {
    const h = item.capture?.habitat || item.habitat || '';
    const c = item.capture?.country || '';
    const missingScientific=Boolean(item.capture&&!String(item.capture.scientific||'').trim());
    const text = norm([item.name,item.scientific,item.kind,h,c].join(' '));
    const statusMatch=status==='todas'||(status==='capturadas'?item.seen:status==='pendientes'?!item.seen:missingScientific);
    return (type==='todas'||type===item.kind) && statusMatch
      && (habitat==='todos'||h===habitat) && (!country||norm(c).includes(country)) && text.includes(term);
  });
  filtered.sort((a,b)=>{
    if(sort==='name')return a.name.localeCompare(b.name,'es',{sensitivity:'base'});
    const da=Date.parse(a.capture?.capturedOn||''),db=Date.parse(b.capture?.capturedOn||''),hasA=Number.isFinite(da),hasB=Number.isFinite(db);
    if(hasA!==hasB)return hasA?-1:1;
    if(hasA&&da!==db)return sort==='oldest'?da-db:db-da;
    return a.name.localeCompare(b.name,'es',{sensitivity:'base'});
  });
  const visible=filtered.slice(0,collectionVisibleCount);
  document.querySelector('#species-grid').innerHTML = visible.length ? visible.map(speciesCard).join('') : '<div class="empty-state"><strong>No encontramos especies</strong>Prueba con otro nombre o cambia los filtros.</div>';
  document.querySelector('#collection-results-count').textContent=filtered.length?`Mostrando ${visible.length} de ${filtered.length} especies`:'';
  const moreButton=document.querySelector('#show-more-species');
  moreButton.classList.toggle('hidden',visible.length>=filtered.length);
  moreButton.textContent=`Mostrar ${Math.min(COLLECTION_PAGE_SIZE,filtered.length-visible.length)} más`;
}
function renderExplore() {
  const peopleMode=exploreMode==='people';
  document.querySelector('#explore-captures-panel').classList.toggle('hidden',peopleMode);
  document.querySelector('#explore-people-panel').classList.toggle('hidden',!peopleMode);
  document.querySelector('#explore-filter-button').classList.toggle('hidden',peopleMode);
  document.querySelectorAll('[data-explore-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.exploreMode===exploreMode));
  if(peopleMode){renderPeople();return}
  const term = norm(document.querySelector('#explore-search').value);
  const sharedCloud=cloudCaptures.filter(item=>item.visibility==='public'||item.visibility==='followers');
  const all=sharedCloud.length?sharedCloud:demoObservations;updateExploreFilterOptions(all);
  const group=document.querySelector('#explore-group-filter').value,habitat=document.querySelector('#explore-habitat-filter').value,country=document.querySelector('#explore-country-filter').value;
  const visible = all.filter(item=>norm([item.name,item.scientific,item.place,item.user].join(' ')).includes(term)
    &&(group==='todos'||item.kind===group)&&(habitat==='todos'||norm(item.habitat)===norm(habitat))&&(country==='todos'||norm(item.country)===norm(country)));
  document.querySelector('#explore-list').innerHTML = visible.length ? visible.map(communityCard).join('') : '<div class="empty-state"><strong>No encontramos esa observación</strong>Prueba con otro término.</div>';
}
function updateExploreFilterOptions(items){
  const set=(id,values,defaultText)=>{const select=document.querySelector(id),old=select.value,unique=[...new Map(values.filter(Boolean).map(value=>[norm(value),value])).values()].sort((a,b)=>a.localeCompare(b,'es'));select.innerHTML=`<option value="todos">${defaultText}</option>`+unique.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');if(unique.some(value=>norm(value)===norm(old)))select.value=unique.find(value=>norm(value)===norm(old));else select.value='todos'};
  set('#explore-group-filter',items.map(item=>item.kind),'Todos los grupos');
  set('#explore-habitat-filter',items.map(item=>item.habitat),'Todos los hábitats');
  set('#explore-country-filter',items.map(item=>item.country),'Todos los países');
}
async function renderPeople() {
  const list=document.querySelector('#people-list'),run=++peopleSearchRun;
  if(!authUser){list.innerHTML='<div class="empty-state"><strong>Explora la comunidad</strong>Inicia sesión para buscar y seguir a otros exploradores.<br/><button class="edit-button" data-action="open-auth">Iniciar sesión</button></div>';return}
  const term=String(document.querySelector('#explore-search').value||'').trim().replace(/[%_*(),]/g,' ').replace(/\s+/g,' ');
  if(term.length<2){list.innerHTML='<div class="empty-state"><strong>Busca exploradores</strong>Escribe al menos dos letras de su nombre o usuario.</div>';return}
  list.innerHTML='<div class="empty-state">Buscando exploradores…</div>';
  await new Promise(resolve=>{clearTimeout(peopleSearchTimer);peopleSearchTimer=setTimeout(resolve,220)});
  if(run!==peopleSearchRun)return;
  const pattern=`%${term}%`;
  const [usernames,names]=await Promise.all([
    supabaseClient.from('profiles').select('id,username,display_name,bio').ilike('username',pattern).limit(20),
    supabaseClient.from('profiles').select('id,username,display_name,bio').ilike('display_name',pattern).limit(20)
  ]);
  if(run!==peopleSearchRun)return;
  if(usernames.error||names.error){list.innerHTML='<div class="empty-state"><strong>No se pudo buscar</strong>Comprueba la conexión e inténtalo otra vez.</div>';return}
  const people=[...new Map([...(usernames.data||[]),...(names.data||[])].filter(person=>person.id!==authUser.id).map(person=>[person.id,person])).values()];
  list.innerHTML=people.length?people.map(person=>`<article class="person-result"><span class="person-avatar">${esc((person.display_name||person.username||'F').slice(0,1).toUpperCase())}</span><button type="button" class="person-copy person-open" data-open-profile="${esc(person.id)}"><strong>${esc(person.display_name||'Explorador FotoDex')}</strong><small>@${esc(person.username)}</small>${person.bio?`<p>${esc(person.bio)}</p>`:''}<span class="person-open-hint">Ver perfil y capturas →</span></button><button class="follow-button" data-follow-user="${esc(person.id)}">${followedIds.has(person.id)?'Siguiendo':'Seguir'}</button></article>`).join(''):'<div class="empty-state"><strong>No encontramos exploradores</strong>Prueba con otro nombre o usuario.</div>';
}
async function openExplorerProfile(id){
  if(!authUser||!supabaseClient){setAuthMode('signin');modal(document.querySelector('#auth-modal'),true);setAuthMessage('Inicia sesión para ver los perfiles de la comunidad.');return}
  activePublicProfileId=id;profileCloudCaptures=[];
  const content=document.querySelector('#explorer-profile-content');content.innerHTML='<div class="empty-state">Cargando perfil y capturas compartidas…</div>';modal(document.querySelector('#explorer-profile-modal'),true);
  const [profileResult,capturesResult,followersResult]=await Promise.all([
    supabaseClient.from('profiles').select('id,username,display_name,bio').eq('id',id).maybeSingle(),
    supabaseClient.from('captures').select('id,user_id,common_name,scientific_name,animal_group,habitat,country,place,captured_on,notes,image_path,image_width,image_height,identification_source,identification_confidence,visibility,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(24),
    supabaseClient.from('follows').select('follower_id',{count:'exact',head:true}).eq('followed_id',id)
  ]);
  if(activePublicProfileId!==id)return;
  if(profileResult.error||!profileResult.data||capturesResult.error){content.innerHTML='<div class="empty-state"><strong>No se pudo abrir este perfil</strong>Prueba de nuevo dentro de un momento.</div>';return}
  const profile=profileResult.data,rows=capturesResult.data||[];
  const paths=rows.map(row=>row.image_path);
  const signed=paths.length?await supabaseClient.storage.from('captures').createSignedUrls(paths,3600):{data:[]};
  const imageFor=path=>signed.data?.find(entry=>entry.path===path)?.signedUrl||'';
  profileCloudCaptures=rows.map(row=>({id:row.id,cloudId:row.id,userId:row.user_id,name:row.common_name,scientific:row.scientific_name,kind:row.animal_group,habitat:row.habitat,country:row.country,place:[row.place,row.country].filter(Boolean).join(', ')||'Ubicación no indicada',capturedOn:row.captured_on,notes:row.notes,imagePath:row.image_path,imageUrl:imageFor(row.image_path),photoWidth:row.image_width,photoHeight:row.image_height,identificationSource:row.identification_source||'manual',identificationConfidence:row.identification_confidence,visibility:row.visibility,createdAt:row.created_at,user:profile.display_name||profile.username,initial:(profile.display_name||profile.username||'F').slice(0,1).toUpperCase(),ago:niceDate(row.captured_on),likes:0,comments:0,liked:false,following:followedIds.has(id),demo:false,palette:'linear-gradient(145deg,#dce9d7,#799477)'}));
  content.innerHTML=`<div class="explorer-profile-heading"><span class="person-avatar">${esc((profile.display_name||profile.username||'F').slice(0,1).toUpperCase())}</span><div><p class="eyebrow">PERFIL DE EXPLORADOR</p><h2>${esc(profile.display_name||'Explorador FotoDex')}</h2><p class="profile-handle">@${esc(profile.username)}</p></div></div><p class="explorer-profile-bio">${esc(profile.bio||'Este explorador todavía no ha añadido una biografía.')}</p><div class="explorer-profile-stats"><strong>${followersResult.count??0}</strong> seguidores <span>·</span><strong>${profileCloudCaptures.length}</strong> capturas visibles</div>${id!==authUser.id?`<button class="follow-button explorer-profile-follow" id="explorer-profile-follow" data-follow-user="${esc(id)}">${followedIds.has(id)?'Siguiendo':'Seguir'}</button>`:''}<div class="section-heading"><div><p class="eyebrow">CAPTURAS</p><h3>Lo que comparte contigo</h3></div></div><div class="capture-list">${profileCloudCaptures.length?profileCloudCaptures.map(communityCard).join(''):'<div class="empty-state">No hay capturas visibles para ti por ahora.</div>'}</div>`;
}
function renderAll() {
  clearURLs(); updateCounts(); setOptions();
  const sharedCloud=cloudCaptures.filter(item=>item.visibility==='public'||item.visibility==='followers');
  const cloudIds = new Set(cloudCaptures.map(item=>item.id));
  const localOnly = captures.filter(item=>!cloudIds.has(item.id)).slice(0,3);
  const sampleFeed=sharedCloud.length||localOnly.length?[]:demoObservations;
  const feed = [...sharedCloud.slice(0,4), ...localOnly.map(item=>({ ...item, local:true })), ...sampleFeed].slice(0,5);
  document.querySelector('#feed-list').innerHTML = feed.length ? feed.map(item=>item.local?localCard(item):communityCard(item)).join('') : '<div class="empty-state"><strong>Aún no hay capturas</strong>Haz tu primera foto para empezar.</div>';
  renderSpecies(); renderExplore();
  const ownSpecies = entries().filter(item=>item.seen).slice(0,4);
  document.querySelector('#profile-grid').innerHTML = ownSpecies.length ? ownSpecies.map(speciesCard).join('') : '<div class="empty-state"><strong>Tu actividad aparecerá aquí</strong>Guarda tu primera captura para empezar.</div>';
}
async function refresh() { captures = await readCaptures(); updateLocalSyncButton(); renderAll(); }
function openAddSpecies(){document.querySelector('#species-add-form').reset();modal(document.querySelector('#species-add-modal'),true)}
function submitCustomSpecies(event){
  event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
  if(customSpecies.length>=500){notify('Has alcanzado el límite de 500 especies personalizadas en este navegador.');return}
  const data=new FormData(form),name=String(data.get('name')||'').trim(),key=taxonKey(name),kind=String(data.get('kind')||'');
  if(catalog.some(item=>taxonKey(item.name)===key)||captures.some(item=>taxonKey(item.name)===key)){notify('Esta especie ya está en tu lista o en tus capturas.');return}
  const item={name,kind,scientific:String(data.get('scientific')||'').trim(),habitat:String(data.get('habitat')||'').trim()};
  const next=[...customSpecies,item];
  try{localStorage.setItem('fotodex-custom-species-v1',JSON.stringify(next))}catch{notify('No se pudo guardar la especie en este navegador.');return}
  customSpecies=next;catalog.push(customCatalogItem(item));form.reset();modal(document.querySelector('#species-add-modal'),false);
  document.querySelector('#search-input').value=name;document.querySelector('#status-filter').value='todas';document.querySelector('#habitat-filter').value='todos';document.querySelector('#country-filter').value='';document.querySelector('#species-sort').value='name';document.querySelectorAll('.chip[data-filter]').forEach(chip=>chip.classList.toggle('selected',chip.dataset.filter==='todas'));
  collectionVisibleCount=COLLECTION_PAGE_SIZE;renderAll();notify(`${name} añadida a tu lista.`);
}
async function exportBackup(){
  const button=document.querySelector('#backup-export');button.disabled=true;button.textContent='Preparando…';
  try{
    const items=await readCaptures();if(!items.length&&!customSpecies.length&&!Object.keys(taxonomyCache).length){notify('Todavía no hay capturas ni especies añadidas para guardar.');return}
    const includePreciseLocations=document.querySelector('#backup-include-location').checked;
    const backup={format:'fotodex-backup',version:2,exportedAt:new Date().toISOString(),includesPreciseLocations:includePreciseLocations,customSpecies,taxonomyCache,captures:await Promise.all(items.map(async item=>({
      name:item.name,scientific:item.scientific||'',kind:item.kind,habitat:item.habitat||'',country:item.country||'',place:item.place||'',notes:item.notes||'',capturedOn:item.capturedOn,
      photoDataUrl:await blobDataURL(item.photo),photoWidth:item.photoWidth,photoHeight:item.photoHeight,coordinates:includePreciseLocations?(item.coordinates||null):null,
      identificationSource:item.identificationSource||'manual',identificationConfidence:item.identificationConfidence??null,createdAt:item.createdAt||new Date().toISOString()
    })))};
    const file=new Blob([JSON.stringify(backup)],{type:'application/json'}),url=URL.createObjectURL(file),anchor=document.createElement('a');
    anchor.href=url;anchor.download=`fotodex-copia-${new Date().toISOString().slice(0,10)}.json`;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(`Copia descargada · ${items.length} capturas y ${customSpecies.length} especies añadidas.`);
  }catch(error){console.warn('FotoDex backup export:',error);notify('No se pudo preparar la copia. Prueba con menos capturas.')}
  finally{button.disabled=false;button.textContent='Descargar copia'}
}
async function importBackupFile(file){
  if(!file)return;
  if(file.size>100*1024*1024){notify('La copia supera el límite de 100 MB.');return}
  let imported=0;
  try{
    const backup=JSON.parse(await file.text());
    if(backup?.format!=='fotodex-backup'||![1,2].includes(backup.version)||!Array.isArray(backup.captures)||backup.captures.length>300)throw new Error('Formato no válido');
    const speciesRows=backup.version===2&&Array.isArray(backup.customSpecies)?backup.customSpecies.filter(row=>row&&typeof row.name==='string'&&row.name.trim()&&row.name.length<=90&&['aves','mamiferos','reptiles','anfibios','insectos','peces','otros'].includes(row.kind)).slice(0,500):[];
    const taxonRows=backup.version===2&&backup.taxonomyCache&&typeof backup.taxonomyCache==='object'&&!Array.isArray(backup.taxonomyCache)?Object.entries(backup.taxonomyCache).slice(0,1000):[];
    const includesPreciseLocations=backup.includesPreciseLocations===true||backup.captures.some(row=>row?.coordinates);
    if(!confirm(`La copia contiene ${backup.captures.length} capturas y ${speciesRows.length} especies añadidas${taxonRows.length?' con datos científicos consultados':''}${includesPreciseLocations?' e incluye ubicaciones precisas':''}. Las capturas se añadirán como privadas y no se subirán a la nube. ¿Continuar?`))return;
    let speciesImported=0,taxaImported=0;
    for(const row of speciesRows){
      const name=row.name.trim(),key=taxonKey(name);if(catalog.some(item=>taxonKey(item.name)===key)||customSpecies.length>=500)continue;
      const item={name,kind:row.kind,scientific:typeof row.scientific==='string'?row.scientific.slice(0,120):'',habitat:typeof row.habitat==='string'?row.habitat.slice(0,80):''};
      customSpecies.push(item);catalog.push(customCatalogItem(item));speciesImported++;
    }
    if(speciesImported)try{localStorage.setItem('fotodex-custom-species-v1',JSON.stringify(customSpecies))}catch(error){console.warn('FotoDex custom species backup:',error)}
    for(const [key,row] of taxonRows){
      if(typeof row?.canonicalName!=='string'||!row.canonicalName.trim()||String(key).length>120)continue;
      taxonomyCache[String(key)]={key:Number.isSafeInteger(Number(row.key))?Number(row.key):null,canonicalName:row.canonicalName.slice(0,120),className:typeof row.className==='string'?row.className.slice(0,80):'',order:typeof row.order==='string'?row.order.slice(0,80):'',family:typeof row.family==='string'?row.family.slice(0,80):''};taxaImported++;
    }
    if(taxaImported)try{localStorage.setItem('fotodex-taxonomy-cache-v1',JSON.stringify(taxonomyCache))}catch(error){console.warn('FotoDex taxonomy backup:',error)}
    for(const row of backup.captures){
      if(typeof row.name!=='string'||!row.name.trim()||row.name.length>90||!['aves','mamiferos','reptiles','anfibios','insectos','peces','otros'].includes(row.kind))continue;
      const match=typeof row.photoDataUrl==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.exec(row.photoDataUrl);if(!match)continue;
      const bytes=atob(row.photoDataUrl.slice('data:image/jpeg;base64,'.length));if(bytes.length>10*1024*1024)continue;
      const photo=new Blob([Uint8Array.from(bytes,char=>char.charCodeAt(0))],{type:'image/jpeg'});
      const capturedOn=/^\d{4}-\d{2}-\d{2}$/.test(row.capturedOn||'')?row.capturedOn:isoToday();
      const coords=row.coordinates&&Number.isFinite(Number(row.coordinates.latitude))&&Number.isFinite(Number(row.coordinates.longitude))&&Math.abs(Number(row.coordinates.latitude))<=90&&Math.abs(Number(row.coordinates.longitude))<=180
        ?{latitude:Number(row.coordinates.latitude),longitude:Number(row.coordinates.longitude),accuracy:row.coordinates.accuracy!=null&&Number.isFinite(Number(row.coordinates.accuracy))?Math.max(0,Number(row.coordinates.accuracy)):null}:null;
      const identificationSource=row.identificationSource==='ai'?'ai':'manual',rawConfidence=Number(row.identificationConfidence);
      await writeCapture({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+imported),name:row.name.trim(),scientific:typeof row.scientific==='string'?row.scientific.slice(0,120):'',kind:row.kind,
        habitat:typeof row.habitat==='string'?row.habitat.slice(0,80):'',country:typeof row.country==='string'?row.country.slice(0,80):'',place:typeof row.place==='string'?row.place.slice(0,100):'',notes:typeof row.notes==='string'?row.notes.slice(0,500):'',capturedOn,
        photo,photoWidth:Number.isInteger(row.photoWidth)&&row.photoWidth>0?row.photoWidth:1,photoHeight:Number.isInteger(row.photoHeight)&&row.photoHeight>0?row.photoHeight:1,coordinates,visibility:'private',
        identificationSource,identificationConfidence:identificationSource==='ai'&&row.identificationConfidence!=null&&Number.isFinite(rawConfidence)?Math.max(0,Math.min(1,rawConfidence)):null,
        cloudSynced:false,cloudUserId:null,createdAt:typeof row.createdAt==='string'?row.createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
      imported++;
    }
    await refresh();notify(`Copia restaurada: ${imported} capturas y ${speciesImported} especies añadidas.`);
  }catch(error){console.warn('FotoDex backup import:',error);notify(imported?`Se restauraron ${imported} capturas antes de un error.`:'No se pudo leer esa copia de FotoDex.')}
}

function setAuthMessage(message, error=false) {
  const el=document.querySelector('#auth-message'); el.textContent=message; el.classList.toggle('error',error);
}
function setAuthMode(mode) {
  authMode=mode;
  const signup=mode==='signup';
  const recoveryRequest=mode==='recovery-request',recoveryUpdate=mode==='recovery-update',recovery=recoveryRequest||recoveryUpdate;
  document.querySelector('#auth-title').textContent=signup?'Crea tu cuenta':recoveryRequest?'Restablece tu contraseña':recoveryUpdate?'Elige una nueva contraseña':'Inicia sesión';
  document.querySelector('#auth-description').textContent=signup?'Guarda tus capturas en la nube y comparte las que quieras.':recoveryRequest?'Te enviaremos un enlace para restablecerla.':recoveryUpdate?'Tu nueva contraseña debe tener al menos 8 caracteres.':'Accede a tus capturas desde tus dispositivos.';
  document.querySelector('#auth-submit').textContent=signup?'Crear cuenta':recoveryRequest?'Enviar enlace':recoveryUpdate?'Guardar contraseña':'Entrar';
  document.querySelector('#auth-tabs').classList.toggle('hidden',recovery);
  document.querySelector('#auth-forgot-password').classList.toggle('hidden',mode!=='signin');
  document.querySelector('#auth-username-wrap').classList.toggle('hidden',!signup);
  document.querySelector('#auth-display-wrap').classList.toggle('hidden',!signup);
  document.querySelector('#auth-form').elements.username.required=signup;
  document.querySelector('#auth-email-wrap').classList.toggle('hidden',recoveryUpdate);
  document.querySelector('#auth-form').elements.email.required=!recoveryUpdate;
  document.querySelector('#auth-password-wrap').classList.toggle('hidden',recoveryRequest||recoveryUpdate);
  document.querySelector('#auth-form').elements.password.required=!recovery;
  document.querySelector('#auth-new-password-wrap').classList.toggle('hidden',!recoveryUpdate);
  document.querySelector('#auth-form').elements.new_password.required=recoveryUpdate;
  document.querySelector('#auth-form').elements.password.value='';
  document.querySelector('#auth-form').elements.new_password.value='';
  document.querySelectorAll('[data-auth-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.authMode===mode));
  setAuthMessage('');
}
function authErrorMessage(error) {
  const message=String(error?.message||'');
  if(/invalid login credentials/i.test(message))return 'Correo o contraseña incorrectos.';
  if(/already registered|already been registered/i.test(message))return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if(/password should be at least/i.test(message))return 'La contraseña debe tener al menos 8 caracteres.';
  if(/username/i.test(message))return 'Ese nombre de usuario ya está en uso o no tiene un formato válido.';
  return message||'No se pudo completar la operación. Prueba de nuevo.';
}
async function ensureProfile(user) {
  const {data:existing,error:readError}=await supabaseClient.from('profiles').select('id,username,display_name,bio,avatar_path').eq('id',user.id).maybeSingle();
  if(readError)throw readError;
  if(existing)return existing;
  const meta=user.user_metadata||{};
  const fallback=String(user.email||'explorador').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,18)||'explorador';
  const profile={id:user.id,username:String(meta.username||`${fallback}_${user.id.slice(0,4)}`).toLowerCase(),display_name:String(meta.display_name||'Explorador FotoDex').slice(0,60)};
  const {data,error}=await supabaseClient.from('profiles').insert(profile).select('id,username,display_name,bio,avatar_path').single();
  if(error)throw error;
  return data;
}
async function loadCloudCaptures() {
  if(!authUser)return;
  const fields='id,user_id,common_name,scientific_name,animal_group,habitat,country,place,captured_on,notes,image_path,image_width,image_height,identification_source,identification_confidence,visibility,created_at';
  const {data,error}=await supabaseClient.from('captures').select(fields).order('created_at',{ascending:false}).limit(40);
  if(error)throw error;
  const {data:followRows,error:followError}=await supabaseClient.from('follows').select('followed_id').eq('follower_id',authUser.id);
  if(followError)throw followError;
  followedIds=new Set((followRows||[]).map(row=>row.followed_id));
  if(!data.length){cloudCaptures=[];return}
  const paths=data.map(row=>row.image_path);
  const {data:signed,error:signedError}=await supabaseClient.storage.from('captures').createSignedUrls(paths,3600);
  if(signedError)throw signedError;
  const {data:profiles}=await supabaseClient.from('profiles').select('id,username,display_name').in('id',[...new Set(data.map(row=>row.user_id))]);
  const authors=new Map((profiles||[]).map(profile=>[profile.id,profile]));
  const ids=data.map(row=>row.id);
  const [likeResult,commentResult]=await Promise.all([
    supabaseClient.from('capture_likes').select('capture_id,user_id').in('capture_id',ids),
    supabaseClient.from('capture_comments').select('capture_id').in('capture_id',ids)
  ]);
  if(likeResult.error)throw likeResult.error;
  if(commentResult.error)throw commentResult.error;
  const likeRows=likeResult.data||[],commentRows=commentResult.data||[];
  cloudCaptures=data.map((row,index)=>{
    const author=authors.get(row.user_id)||{};
    const liked=likeRows.some(like=>like.capture_id===row.id&&like.user_id===authUser.id);
    const photo=signed?.find(item=>item.path===row.image_path)?.signedUrl||'';
    return {id:row.id,cloudId:row.id,userId:row.user_id,name:row.common_name,scientific:row.scientific_name,kind:row.animal_group,habitat:row.habitat,country:row.country,place:[row.place,row.country].filter(Boolean).join(', ')||'Ubicación no indicada',capturedOn:row.captured_on,notes:row.notes,imagePath:row.image_path,imageUrl:photo,photoWidth:row.image_width,photoHeight:row.image_height,identificationSource:row.identification_source||'manual',identificationConfidence:row.identification_confidence,visibility:row.visibility,createdAt:row.created_at,user:author.display_name||author.username||'Explorador',initial:(author.display_name||author.username||'F').slice(0,1).toUpperCase(),ago:niceDate(row.captured_on),likes:likeRows.filter(like=>like.capture_id===row.id).length,comments:commentRows.filter(comment=>comment.capture_id===row.id).length,liked,following:followedIds.has(row.user_id),demo:false,palette:'linear-gradient(145deg,#dce9d7,#799477)'};
  });
}
async function refreshSocialCounts() {
  if(!authUser)return;
  const [followers,following]=await Promise.all([
    supabaseClient.from('follows').select('follower_id',{count:'exact',head:true}).eq('followed_id',authUser.id),
    supabaseClient.from('follows').select('followed_id',{count:'exact',head:true}).eq('follower_id',authUser.id)
  ]);
  document.querySelector('#profile-follower-count').textContent=followers.count??0;
  document.querySelector('#profile-following-count').textContent=following.count??0;
}
function notificationSeenKey(){return authUser?`fotodex-notifications-seen-${authUser.id}`:''}
function updateNotificationBadge(){
  const dot=document.querySelector('#notification-dot'),button=document.querySelector('#notification-open');if(!dot||!button)return;
  if(!authUser){dot.classList.add('hidden');button.setAttribute('aria-label','Notificaciones');return}
  let seenTime=0;try{seenTime=Date.parse(localStorage.getItem(notificationSeenKey())||'')||0}catch{}
  const unread=notifications.filter(item=>Date.parse(item.createdAt)>seenTime).length;
  dot.classList.toggle('hidden',!unread);button.setAttribute('aria-label',unread?`Notificaciones, ${unread} nuevas`:'Notificaciones');
}
async function loadNotifications(){
  const list=document.querySelector('#notification-list');
  if(!authUser||!supabaseClient){notifications=[];updateNotificationBadge();list.innerHTML='<div class="empty-state"><strong>Inicia sesión para ver notificaciones</strong>Los nuevos seguidores, me gusta y comentarios aparecerán aquí.</div>';return false}
  const ownResult=await supabaseClient.from('captures').select('id,common_name').eq('user_id',authUser.id).order('created_at',{ascending:false}).limit(100);
  if(ownResult.error){list.innerHTML='<div class="empty-state">No se pudieron cargar las notificaciones.</div>';return false}
  const ownRows=ownResult.data||[],ids=ownRows.map(row=>row.id),captureNames=new Map(ownRows.map(row=>[row.id,row.common_name]));
  const empty={data:[],error:null};
  const [likes,comments,follows]=await Promise.all([
    ids.length?supabaseClient.from('capture_likes').select('capture_id,user_id,created_at').in('capture_id',ids).neq('user_id',authUser.id).order('created_at',{ascending:false}).limit(25):empty,
    ids.length?supabaseClient.from('capture_comments').select('capture_id,user_id,body,created_at').in('capture_id',ids).neq('user_id',authUser.id).order('created_at',{ascending:false}).limit(25):empty,
    supabaseClient.from('follows').select('follower_id,created_at').eq('followed_id',authUser.id).order('created_at',{ascending:false}).limit(25)
  ]);
  if(likes.error||comments.error||follows.error){list.innerHTML='<div class="empty-state">No se pudieron cargar las notificaciones.</div>';return false}
  const actorIds=[...new Set([...(likes.data||[]).map(row=>row.user_id),...(comments.data||[]).map(row=>row.user_id),...(follows.data||[]).map(row=>row.follower_id)])];
  const profilesResult=actorIds.length?await supabaseClient.from('profiles').select('id,username,display_name').in('id',actorIds):{data:[],error:null};
  const actors=new Map((profilesResult.data||[]).map(row=>[row.id,row.display_name||row.username||'Explorador']));
  notifications=[
    ...(likes.data||[]).map(row=>({id:`like-${row.capture_id}-${row.user_id}-${row.created_at}`,type:'like',actor:actors.get(row.user_id)||'Un explorador',capture:captureNames.get(row.capture_id)||'tu captura',createdAt:row.created_at})),
    ...(comments.data||[]).map(row=>({id:`comment-${row.capture_id}-${row.user_id}-${row.created_at}`,type:'comment',actor:actors.get(row.user_id)||'Un explorador',capture:captureNames.get(row.capture_id)||'tu captura',body:row.body,createdAt:row.created_at})),
    ...(follows.data||[]).map(row=>({id:`follow-${row.follower_id}-${row.created_at}`,type:'follow',actor:actors.get(row.follower_id)||'Un explorador',createdAt:row.created_at}))
  ].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
  list.innerHTML=notifications.length?notifications.map(item=>{
    const verb=item.type==='like'?`le gusta tu captura «${esc(item.capture)}»`:item.type==='comment'?`comentó en tu captura «${esc(item.capture)}»`:'empezó a seguirte';
    const icon=item.type==='like'?'♥':item.type==='comment'?'▢':'＋';
    const time=Number.isFinite(Date.parse(item.createdAt))?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(item.createdAt)):'';
    return `<article class="notification-row"><span class="notification-icon">${icon}</span><div><p><strong>${esc(item.actor)}</strong> ${verb}.</p>${item.body?`<span class="notification-comment">${esc(item.body)}</span>`:''}<time>${esc(time)}</time></div></article>`
  }).join(''):'<div class="empty-state"><strong>Aún no hay actividad nueva</strong>Cuando alguien siga tu perfil o interactúe con tus capturas, lo verás aquí.</div>';
  updateNotificationBadge();return true;
}
async function openNotifications(){
  const list=document.querySelector('#notification-list');modal(document.querySelector('#notifications-modal'),true);
  if(!authUser){await loadNotifications();return}
  list.innerHTML='<div class="empty-state">Cargando actividad…</div>';
  if(await loadNotifications()){try{localStorage.setItem(notificationSeenKey(),notifications[0]?.createdAt||new Date().toISOString())}catch{}updateNotificationBadge()}
}
function updateAccountUI(profile=null) {
  const signedIn=Boolean(authUser);
  if(profile)activeProfile=profile;else if(!signedIn)activeProfile=null;
  document.querySelector('#account-status').textContent=signedIn?'CUENTA EN LA NUBE':'MODO LOCAL';
  document.querySelector('#profile-avatar').textContent=(profile?.display_name||'Explorador FotoDex').trim().slice(0,1).toLocaleUpperCase('es');
  document.querySelector('#profile-name').textContent=profile?.display_name||'Explorador FotoDex';
  document.querySelector('#profile-handle').textContent=signedIn?`@${profile?.username||'explorador'} · ${authUser.email||''}`:'Tus observaciones se guardan en este dispositivo.';
  document.querySelector('#profile-bio').innerHTML=signedIn?esc(profile?.bio||'🌿 Explorando la naturaleza con FotoDex.'):'🌿 Tus capturas son privadas en este dispositivo.<br/>☁️ Al iniciar sesión, podrás guardarlas en tu cuenta.';
  document.querySelector('#account-open').classList.toggle('hidden',signedIn);
  document.querySelector('#profile-edit').classList.toggle('hidden',!signedIn);
  document.querySelector('#account-signout').classList.toggle('hidden',!signedIn);
  updateLocalSyncButton();
  if(profile){document.querySelector('#profile-form').elements.display_name.value=profile.display_name||'';document.querySelector('#profile-form').elements.bio.value=profile.bio||'';updateBioCounter()}
  if(!signedIn){document.querySelector('#profile-follower-count').textContent='—';document.querySelector('#profile-following-count').textContent='—';}
  updateLocationUI();
}
function updateLocalSyncButton(){
  const panel=document.querySelector('#local-sync-panel'),button=document.querySelector('#sync-local-captures');if(!panel||!button)return;
  const count=captures.filter(item=>!item.cloudSynced&&!item.cloudSyncPending&&!item.cloudUserId).length;
  panel.classList.toggle('hidden',!authUser||!count);
  button.textContent=`Sincronizar ${count} captura${count===1?'':'s'} antiguas`;
}
async function handleAuthSession(session) {
  const nextUser=session?.user||null;
  const changed=authUser?.id!==nextUser?.id;
  if(changed){cloudCaptures=[];followedIds=new Set();renderAll();}
  authUser=nextUser;
  if(!authUser){cloudCaptures=[];followedIds=new Set();notifications=[];updateNotificationBadge();updateAccountUI();renderAll();return}
  try {
    const profile=await ensureProfile(authUser);
    updateAccountUI(profile);
    const syncedPending=await syncPendingCaptures();
    await loadCloudCaptures();
    await refreshSocialCounts();
    await loadNotifications();
    if(syncedPending)notify(`${syncedPending} captura${syncedPending===1?'':'s'} pendiente${syncedPending===1?'':'s'} sincronizada${syncedPending===1?'':'s'}.`);
  } catch(error) {
    console.warn('FotoDex cloud sync:',error);
    updateAccountUI();
    notify('Sesión activa, pero no se pudo cargar la nube.');
  }
  if(changed)notify('Sesión iniciada. Tus capturas en la nube están disponibles.');
  renderAll();
}
async function initCloud() {
  const config=window.FOTODEX_SUPABASE;
  if(!config?.url||!config?.publishableKey){updateAccountUI();return}
  try {
    const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.95.0');
    supabaseClient=createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    supabaseClient.auth.onAuthStateChange((event,session)=>setTimeout(()=>{
      if(event==='PASSWORD_RECOVERY'){
        setAuthMode('recovery-update');modal(document.querySelector('#auth-modal'),true);
        setAuthMessage('Enlace verificado. Escribe tu nueva contraseña.');
      }
      void handleAuthSession(session);
    },0));
    const {data,error}=await supabaseClient.auth.getSession();
    if(error)throw error;
    if(data.session)await handleAuthSession(data.session);else updateAccountUI();
  } catch(error) {
    console.warn('FotoDex cloud unavailable:',error);
    document.querySelector('#account-status').textContent='NUBE NO DISPONIBLE';
    notify('No se pudo conectar con la nube. Puedes seguir guardando localmente.');
  }
}
async function submitAuth(event) {
  event.preventDefault();
  if(!supabaseClient){setAuthMessage('La conexión a la nube aún no está disponible.',true);return}
  if(!event.currentTarget.reportValidity())return;
  const data=new FormData(event.currentTarget),email=String(data.get('email')).trim(),password=String(data.get('password'));
  const button=document.querySelector('#auth-submit');button.disabled=true;button.textContent='Conectando…';setAuthMessage('');
  try {
    if(authMode==='recovery-request'){
      const redirectTo=window.location.origin+window.location.pathname;
      const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
      if(error)throw error;
      setAuthMessage('Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.');
    } else if(authMode==='recovery-update'){
      const newPassword=String(data.get('new_password')||'');
      if(newPassword.length<8){setAuthMessage('La nueva contraseña debe tener al menos 8 caracteres.',true);return}
      const {error}=await supabaseClient.auth.updateUser({password:newPassword});
      if(error)throw error;
      event.currentTarget.reset();setAuthMode('signin');modal(document.querySelector('#auth-modal'),false);notify('Contraseña actualizada correctamente.');
    } else if(authMode==='signup'){
      const username=String(data.get('username')).trim().toLowerCase();
      const {data:result,error}=await supabaseClient.auth.signUp({email,password,options:{data:{username,display_name:String(data.get('display_name')).trim()||'Explorador FotoDex'},emailRedirectTo:window.location.href}});
      if(error)throw error;
      if(result.session){await handleAuthSession(result.session);modal(document.querySelector('#auth-modal'),false);event.currentTarget.reset();notify('Cuenta creada.');}
      else setAuthMessage('Revisa tu correo para confirmar la cuenta y después vuelve a iniciar sesión.');
    } else {
      const {data:result,error}=await supabaseClient.auth.signInWithPassword({email,password});
      if(error)throw error;
      await handleAuthSession(result.session);modal(document.querySelector('#auth-modal'),false);event.currentTarget.reset();
    }
  } catch(error) {setAuthMessage(authErrorMessage(error),true)}
  finally {button.disabled=false;button.textContent=authMode==='signup'?'Crear cuenta':authMode==='recovery-request'?'Enviar enlace':authMode==='recovery-update'?'Guardar contraseña':'Entrar'}
}
function updateBioCounter(){const bio=document.querySelector('#profile-form').elements.bio.value;document.querySelector('#bio-counter').textContent=`${bio.length} / 240`}
async function submitProfile(event){
  event.preventDefault();if(!authUser||!supabaseClient)return;
  const form=event.currentTarget;if(!form.reportValidity())return;
  const display_name=String(form.elements.display_name.value).trim(),bio=String(form.elements.bio.value).trim();
  const button=form.querySelector('button[type="submit"]'),message=document.querySelector('#profile-message');
  if(!display_name){message.textContent='Escribe un nombre visible.';message.classList.add('error');return}
  button.disabled=true;button.textContent='Guardando…';message.textContent='';message.classList.remove('error');
  try{
    const {data,error}=await supabaseClient.from('profiles').update({display_name,bio}).eq('id',authUser.id).select('id,username,display_name,bio,avatar_path').single();
    if(error)throw error;
    activeProfile=data;updateAccountUI(data);modal(document.querySelector('#profile-modal'),false);
    try{await loadCloudCaptures()}catch(refreshError){console.warn('FotoDex profile refresh:',refreshError)}
    renderAll();notify('Perfil actualizado.');
  }catch(error){console.warn('FotoDex profile update:',error);message.textContent='No se pudo guardar. Revisa la conexión e inténtalo de nuevo.';message.classList.add('error')}
  finally{button.disabled=false;button.textContent='Guardar perfil'}
}
async function signOut() {
  if(!supabaseClient)return;
  const {error}=await supabaseClient.auth.signOut();
  if(error){notify('No se pudo cerrar sesión.');return}
  authUser=null;cloudCaptures=[];followedIds=new Set();notifications=[];updateNotificationBadge();updateAccountUI();await refresh();notify('Sesión cerrada. Las capturas locales siguen en este dispositivo.');
}

function resetEditor() {
  form.reset(); activePhoto = null; coordinates = null; editingId = null;
  aiCandidates=[]; identificationSource='manual'; identificationConfidence=null;
  document.querySelector('#ai-results').replaceChildren();document.querySelector('#identify-photo').disabled=false;
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = null; document.querySelector('#photo-size').textContent = '';
  updateLocationUI();
}
function showChoice() {
  resetEditor(); choicePanel.classList.remove('hidden'); editorPanel.classList.add('hidden'); modal(captureModal,true);
}
function showEditor(photo, existing=null) {
  activePhoto=photo; editingId=existing?.id||null; coordinates=existing?.coordinates||null;
  identificationSource=existing?.identificationSource||'manual';identificationConfidence=existing?.identificationConfidence??null;aiCandidates=[];document.querySelector('#ai-results').replaceChildren();
  choicePanel.classList.add('hidden'); editorPanel.classList.remove('hidden');
  if(previewURL) URL.revokeObjectURL(previewURL);
  previewURL=URL.createObjectURL(photo.blob); document.querySelector('#photo-preview').src=previewURL;
  document.querySelector('#photo-size').textContent='Foto optimizada · '+Math.max(1,Math.round(photo.blob.size/1024)).toLocaleString('es-ES')+' KB · '+photo.width+' × '+photo.height+' px';
  form.elements.name.value=existing?.name||''; form.elements.scientific.value=existing?.scientific||'';
  form.elements.kind.value=existing?.kind||''; form.elements.habitat.value=existing?.habitat||'';
  form.elements.country.value=existing?.country||''; form.elements.place.value=existing?.place||'';
  form.elements.notes.value=existing?.notes||''; form.elements.date.value=existing?.capturedOn||isoToday();
  form.elements.visibility.value=existing?.visibility||'private';
  updateLocationUI();
  modal(captureModal,true);
}
function resizedIdentificationImage(blob) {
  return new Promise((resolve,reject)=>{
    const img=new Image(),url=URL.createObjectURL(blob);
    img.onload=()=>{const scale=Math.min(1,1200/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){URL.revokeObjectURL(url);reject(new Error('No se pudo preparar la foto.'));return}ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(result=>result?resolve(result):reject(new Error('No se pudo preparar la foto.')),'image/jpeg',.68)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo abrir la foto.'))};img.src=url;
  });
}
function blobDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('No se pudo leer la foto.'));reader.readAsDataURL(blob)})}
async function identifyAnimal(){
  const button=document.querySelector('#identify-photo'),results=document.querySelector('#ai-results');
  if(!activePhoto){results.innerHTML='<span class="ai-status">Primero elige una foto.</span>';return}
  if(!authUser||!supabaseClient){results.innerHTML='<span class="ai-status">Inicia sesión para usar la identificación. Tus fichas manuales siguen disponibles.</span>';modal(document.querySelector('#auth-modal'),true);return}
  button.disabled=true;results.innerHTML='<span class="ai-status">Preparando una copia reducida y consultando…</span>';
  try{
    const smallImage=await resizedIdentificationImage(activePhoto.blob),image_data_url=await blobDataURL(smallImage);
    const {data,error}=await supabaseClient.functions.invoke('identify-animal',{body:{image_data_url,language:'es'}});
    if(error){if(error.context?.status===503){results.innerHTML='<span class="ai-status">No se pudo verificar el servicio o su límite diario. No se envió la foto al modelo.</span>';return}if(error.context?.status===429){results.innerHTML='<span class="ai-status">Has alcanzado el máximo de 25 identificaciones de hoy. Vuelve a intentarlo mañana.</span>';return}throw error}
    aiCandidates=Array.isArray(data?.observations)?data.observations:[];
    if(!data?.is_animal||!aiCandidates.length){results.innerHTML='<span class="ai-status">No pude reconocer un animal con suficiente seguridad. Prueba otra foto o completa la ficha manualmente.</span>';return}
    results.innerHTML='<span class="ai-status">Elige la sugerencia que mejor encaja. La IA puede equivocarse.</span>'+aiCandidates.map((candidate,index)=>`<button type="button" class="ai-candidate" data-ai-candidate="${index}"><strong>${esc(candidate.common_name)}</strong><em>${esc(candidate.scientific_name)}</em><small>${esc(kindLabel(candidate.animal_group))} · Coincidencia orientativa: ${Math.round(candidate.confidence*100)}%${candidate.rationale?' · '+esc(candidate.rationale):''}</small></button>`).join('');
  }catch(error){console.warn('FotoDex identification:',error);results.innerHTML='<span class="ai-status">No se pudo identificar. Comprueba la conexión y que el servicio de IA esté configurado en FotoDex.</span>'}
  finally{button.disabled=false}
}
function applyAiCandidate(index){const candidate=aiCandidates[index];if(!candidate)return;form.elements.name.value=candidate.common_name;form.elements.scientific.value=candidate.scientific_name;form.elements.kind.value=candidate.animal_group;identificationSource='ai';identificationConfidence=candidate.confidence;document.querySelector('#ai-results').innerHTML='<span class="ai-status">Sugerencia aplicada. Comprueba los datos antes de guardar; hábitat y ubicación se completan por separado.</span>'}
function pickPhoto(camera) {
  if(camera) photoInput.setAttribute('capture','environment'); else photoInput.removeAttribute('capture');
  photoInput.click();
}
function compressPhoto(file) {
  return new Promise((resolve,reject)=>{
    const img=new Image(), source=URL.createObjectURL(file);
    img.onload=async()=>{
      const maxEdge=1920,maxBytes=1_500_000,qualities=[0.82,0.76,0.70],canvas=document.createElement('canvas');
      let scale=Math.min(1,maxEdge/Math.max(img.width,img.height)),blob=null;
      try{
        for(let pass=0;pass<5;pass++){
          canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
          const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable');
          ctx.fillStyle='#f5f7f2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
          for(const quality of qualities){
            blob=await new Promise(done=>canvas.toBlob(done,'image/jpeg',quality));
            if(!blob)throw new Error('Compression failed');
            if(blob.size<=maxBytes||(pass===4&&quality===0.70))break;
          }
          if(blob.size<=maxBytes||pass===4)break;
          scale*=0.88;
        }
        URL.revokeObjectURL(source);resolve({blob,width:canvas.width,height:canvas.height});
      }catch(error){URL.revokeObjectURL(source);reject(error)}
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
    coordinates, visibility:String(data.get('visibility')||'private'),
    identificationSource,identificationConfidence,
    cloudSynced:Boolean(previous?.cloudSynced),cloudSyncPending:Boolean(previous?.cloudSyncPending),cloudUserId:previous?.cloudUserId||null,createdAt:previous?.createdAt||new Date().toISOString(), updatedAt:new Date().toISOString()
  };
  const locationRemovalPending=Boolean(previous?.cloudSynced&&previous.cloudUserId===authUser?.id&&previous.coordinates&&!coordinates);
  const button=document.querySelector('.save-capture'); button.disabled=true; button.textContent='Guardando…';
  try {
    let cloudSaved=false;
    if(authUser&&supabaseClient&&(!previous?.cloudSynced||previous.cloudUserId===authUser.id)){
      try{await uploadCaptureToCloud(item,previous);item.cloudSynced=true;item.cloudSyncPending=false;item.cloudUserId=authUser.id;cloudSaved=true}
      catch(error){console.warn('FotoDex capture upload:',error);item.cloudSynced=Boolean(previous?.cloudSynced);item.cloudUserId=previous?.cloudUserId||authUser.id;item.cloudSyncPending=true}
    }
    await writeCapture(item); modal(captureModal,false); resetEditor(); await refresh();
    if(cloudSaved){await loadCloudCaptures();renderAll();notify('Captura guardada en tu cuenta.');}
    else if(authUser&&locationRemovalPending)notify('Se guardó aquí, pero no se pudo quitar la ubicación de la nube. Vuelve a guardar con conexión para completar el borrado.');
    else if(authUser&&item.cloudSyncPending)notify('Guardada aquí; falta sincronizar. Abre la ficha y pulsa «Reintentar sincronización».');
    else if(authUser)notify('Guardada en este dispositivo; no se pudo sincronizar.');
    else notify('Captura guardada en este dispositivo.');
  }
  catch { notify('No se pudo guardar. Revisa el espacio disponible en el dispositivo.'); }
  finally { button.disabled=false; button.textContent='Guardar captura'; }
}
async function uploadCaptureToCloud(item,previous=null){
  await ensureProfile(authUser);
  const path=`${authUser.id}/${item.id}.jpg`;
  const uploaded=await supabaseClient.storage.from('captures').upload(path,item.photo,{contentType:'image/jpeg',cacheControl:'31536000',upsert:true});
  if(uploaded.error)throw uploaded.error;
  const row={id:item.id,user_id:authUser.id,common_name:item.name,scientific_name:item.scientific,animal_group:item.kind,habitat:item.habitat,country:item.country,place:item.place,captured_on:item.capturedOn,notes:item.notes,image_path:path,image_width:item.photoWidth,image_height:item.photoHeight,identification_source:item.identificationSource||'manual',identification_confidence:item.identificationConfidence??null,visibility:item.visibility||'private'};
  const result=await supabaseClient.from('captures').upsert(row,{onConflict:'id'}).select('id').single();
  if(result.error)throw result.error;
  if(item.coordinates){
    const location={capture_id:item.id,user_id:authUser.id,latitude:item.coordinates.latitude,longitude:item.coordinates.longitude};
    const saved=await supabaseClient.from('capture_private_locations').upsert(location,{onConflict:'capture_id'});
    if(saved.error)throw saved.error;
  }else{
    const removed=await supabaseClient.from('capture_private_locations').delete().eq('capture_id',item.id).eq('user_id',authUser.id);
    if(removed.error)throw removed.error;
  }
}
async function syncPendingCaptures(){
  if(!authUser||!supabaseClient||!navigator.onLine)return 0;
  if(pendingSyncPromise)return pendingSyncPromise;
  const ownerId=authUser.id;
  pendingSyncPromise=(async()=>{
    const local=await readCaptures();let synced=0;
    for(const item of local.filter(capture=>capture.cloudSyncPending&&capture.cloudUserId===ownerId)){
      if(authUser?.id!==ownerId)break;
      try{await uploadCaptureToCloud(item,item);item.cloudSynced=true;item.cloudSyncPending=false;await writeCapture(item);synced++}
      catch(error){console.warn('FotoDex pending sync:',error)}
    }
    if(synced)captures=await readCaptures();
    return synced;
  })();
  try{return await pendingSyncPromise}finally{pendingSyncPromise=null}
}
async function retryCaptureSync(id){
  const item=captures.find(capture=>capture.id===id);if(!item||!item.cloudSyncPending||item.cloudUserId!==authUser?.id||!supabaseClient)return;
  const button=document.querySelector('[data-retry-sync]');if(button){button.disabled=true;button.textContent='Sincronizando…'}
  try{await uploadCaptureToCloud(item,item);item.cloudSynced=true;item.cloudSyncPending=false;item.cloudUserId=authUser.id;await writeCapture(item);await loadCloudCaptures();renderAll();showCaptureDetails(id);notify('Captura sincronizada con tu cuenta.')}
  catch(error){console.warn('FotoDex capture retry:',error);notify('Sigue sin poder sincronizarse. Revisa la conexión e inténtalo de nuevo.')}
}
async function syncLocalCaptures(){
  if(!authUser||!supabaseClient)return;
  if(!navigator.onLine){notify('Conéctate a internet para subir tus capturas.');return}
  const ownerId=authUser.id,local=captures.filter(item=>!item.cloudSynced&&!item.cloudSyncPending&&!item.cloudUserId);
  if(!local.length){updateLocalSyncButton();return}
  if(!confirm(`Vas a subir ${local.length} captura${local.length===1?'':'s'} a tu cuenta. Se guardarán como privadas y la ubicación precisa solo será visible para ti. ¿Continuar?`))return;
  const button=document.querySelector('#sync-local-captures');button.disabled=true;let synced=0;
  try{
    for(let index=0;index<local.length;index++){
      if(authUser?.id!==ownerId)break;
      const item=local[index];item.visibility='private';item.cloudUserId=ownerId;button.textContent=`Subiendo ${index+1} de ${local.length}…`;
      try{await uploadCaptureToCloud(item,item);item.cloudSynced=true;item.cloudSyncPending=false;await writeCapture(item);synced++}
      catch(error){console.warn('FotoDex local migration:',error);item.cloudSynced=false;item.cloudSyncPending=true;await writeCapture(item)}
    }
    captures=await readCaptures();renderAll();
    try{await loadCloudCaptures();renderAll()}catch(error){console.warn('FotoDex migrated captures refresh:',error)}
    notify(synced===local.length?`${synced} captura${synced===1?'':'s'} añadida${synced===1?'':'s'} a tu cuenta como privada.`:`Se subieron ${synced} de ${local.length}. El resto se reintentará cuando vuelva la conexión.`);
  }catch(error){console.warn('FotoDex local migration:',error);notify('No se pudo completar la subida. Tus capturas originales siguen guardadas en este dispositivo.')}
  finally{button.disabled=false;updateLocalSyncButton()}
}
function detailPhotoMarkup(src,name){
  if(!src)return '🐾';
  const label=esc(name);
  return `<button type="button" class="detail-photo-zoom" data-open-photo="${esc(src)}" data-photo-name="${label}" aria-label="Ampliar foto de ${label}"><img src="${esc(src)}" alt="${label}"/></button>`;
}
function showCaptureDetails(id) {
  const item=captures.find(x=>x.id===id); if(!item)return;
  const src=imageURL(item), place=[item.place,item.country].filter(Boolean).join(', ')||'Ubicación no indicada';
  document.querySelector('#species-detail-content').innerHTML=`
    <div class="detail-photo">${detailPhotoMarkup(src,item.name)}</div>
    <p class="eyebrow">TU OBSERVACIÓN · ${esc(niceDate(item.capturedOn))}</p><h2>${esc(item.name)}</h2><p class="detail-scientific">${esc(scientificFor(item)||'Nombre científico pendiente')}</p>${identificationInfo(item)}
    <div class="detail-grid"><div><small>GRUPO</small><strong>${esc(kindLabel(item.kind))}</strong></div><div><small>HÁBITAT</small><strong>${esc(item.habitat||'Pendiente')}</strong></div><div><small>UBICACIÓN</small><strong>${esc(place)}</strong></div><div><small>FOTO</small><strong>${item.photoWidth} × ${item.photoHeight} px</strong></div></div>
    ${item.notes?`<p class="detail-notes">${esc(item.notes)}</p>`:''}<p class="privacy-note">${item.cloudSyncPending?'Hay cambios pendientes de sincronizar; la copia de tu cuenta podría estar desactualizada.':item.cloudSynced?'Sincronizada con tu cuenta; la ubicación exacta solo la ves tú.':'Guardada solo en este dispositivo; aún no se sincroniza ni se comparte.'}</p>
    <div class="detail-actions">${item.cloudSyncPending&&item.cloudUserId===authUser?.id?`<button class="edit-button" data-retry-sync="${esc(item.id)}">Reintentar sincronización</button>`:''}<button class="edit-button" data-edit-capture="${esc(item.id)}">Editar ficha</button><button class="delete-button" data-delete-capture="${esc(item.id)}">Eliminar</button></div>`;
  modal(detailModal,true);
}
function showCloudCaptureDetails(id,profileCapture=null) {
  const item=profileCapture||[...cloudCaptures,...profileCloudCaptures].find(capture=>capture.id===id);if(!item)return;
  const src=imageURL(item),place=[item.place,item.country].filter(Boolean).join(', ')||'Ubicación no indicada';
  document.querySelector('#species-detail-content').innerHTML=`
    <div class="detail-photo">${detailPhotoMarkup(src,item.name)}</div>
    <p class="eyebrow">CAPTURA COMPARTIDA · ${esc(niceDate(item.capturedOn))}</p><h2>${esc(item.name)}</h2><p class="detail-scientific">${esc(item.scientific||'Nombre científico pendiente')}</p>${identificationInfo(item)}
    <p class="capture-user"><span class="mini-avatar">${esc(item.initial)}</span>${esc(item.user)}</p>
    <div class="detail-grid"><div><small>GRUPO</small><strong>${esc(kindLabel(item.kind))}</strong></div><div><small>HÁBITAT</small><strong>${esc(item.habitat||'Pendiente')}</strong></div><div><small>UBICACIÓN</small><strong>${esc(place)}</strong></div><div><small>FOTO</small><strong>${item.photoWidth||'—'} × ${item.photoHeight||'—'} px</strong></div></div>
    ${item.notes?`<p class="detail-notes">${esc(item.notes)}</p>`:''}<p class="privacy-note">La ubicación exacta no se comparte; solo el propietario puede verla.</p>`;
  modal(detailModal,true);
}
function showSpeciesDetails(name) {
  const item=entries().find(x=>x.name===name); if(!item)return;
  taxonomyLookupRun++;activeTaxonomyName=name;activeTaxonomyCandidates=[];
  const src=item.capture?imageURL(item.capture):'';
  document.querySelector('#species-detail-content').innerHTML=`
    <div class="detail-photo" style="background:${item.palette}">${src?detailPhotoMarkup(src,item.name):item.emoji}</div>
    <p class="eyebrow">FICHA DE ESPECIE · ${item.seen?'YA CAPTURADA':'POR DESCUBRIR'}</p><h2>${esc(item.name)}</h2><p class="detail-scientific">${esc(scientificFor(item)||'Nombre científico pendiente')}</p>${taxonomyDetailsMarkup(item)}<p class="species-description">${esc(item.description)}</p>
    <div class="detail-grid"><div><small>GRUPO</small><strong>${esc(kindLabel(item.kind))}</strong></div><div><small>HÁBITAT</small><strong>${esc(item.capture?.habitat||item.habitat||'Pendiente')}</strong></div><div><small>ESTADO</small><strong>${item.seen?'Capturada':'Aún no capturada'}</strong></div><div><small>UBICACIÓN</small><strong>${esc(item.capture?.place||item.capture?.country||'Pendiente')}</strong></div></div>
    <div class="taxonomy-lookup"><button type="button" class="identify-button" data-lookup-taxonomy="${esc(item.name)}">${scientificFor(item)?'Consultar otra coincidencia':'Buscar nombre científico en GBIF'}</button><div id="taxonomy-lookup-results" aria-live="polite"></div></div>
    <p class="privacy-note">Las coincidencias taxonómicas son sugerencias de GBIF y conviene revisarlas.</p>
    ${item.capture&&!String(item.capture.scientific||'').trim()?'<p class="privacy-note">Tu captura aún no tiene nombre científico. Puedes completarlo en la ficha.</p>':''}
    ${item.capture||item.isCustom?`<div class="detail-actions">${item.capture?`<button class="edit-button" data-open-capture="${esc(item.capture.id)}">${!String(item.capture.scientific||'').trim()?'Completar ficha':'Ver mi captura'}</button>`:''}${item.isCustom?`<button class="delete-button" data-remove-custom-species="${esc(item.name)}">Quitar de mi lista</button>`:''}</div>`:''}`;
  modal(detailModal,true);
}
function taxonomyDetailsMarkup(item){
  const taxon=taxonomyCache[taxonKey(item.name)];if(!taxon)return '';
  const levels=[['CLASE',taxon.className],['ORDEN',taxon.order],['FAMILIA',taxon.family]].filter(([,value])=>value).map(([label,value])=>`<span><small>${label}</small><strong>${esc(value)}</strong></span>`).join('');
  const key=Number(taxon.key),link=Number.isFinite(key)?`https://www.gbif.org/species/${key}`:'https://www.gbif.org/';
  return `<div class="taxonomy-source">${levels?`<div class="taxonomy-levels">${levels}</div>`:''}<a href="${link}" target="_blank" rel="noopener">Fuente: GBIF · Ver ficha taxonómica ↗</a></div>`;
}
function commonNameSimilarity(left,right){
  const a=new Set(taxonKey(left).split(/[^\p{L}\p{N}]+/u).filter(token=>token.length>2));
  const b=new Set(taxonKey(right).split(/[^\p{L}\p{N}]+/u).filter(token=>token.length>2));
  if(!a.size||!b.size)return 0;
  let shared=0;for(const token of a)if(b.has(token))shared++;
  return 2*shared/(a.size+b.size);
}
async function lookupTaxonomy(name){
  const results=document.querySelector('#taxonomy-lookup-results');if(!results)return;
  const run=++taxonomyLookupRun;activeTaxonomyName=name;activeTaxonomyCandidates=[];results.innerHTML='<p class="ai-status">Buscando nombres comunes en español…</p>';
  try{
    const params=new URLSearchParams({q:name,language:'es',rank:'SPECIES',status:'ACCEPTED',limit:'100'});
    const response=await fetch(`https://api.gbif.org/v1/species/search?${params}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
    if(run!==taxonomyLookupRun)return;
    if(!response.ok){results.innerHTML=response.status===429?'<p class="ai-status">GBIF está limitando consultas temporalmente. Inténtalo más tarde.</p>':'<p class="ai-status">No se pudo consultar GBIF ahora.</p>';return}
    const data=await response.json(),rows=(Array.isArray(data.results)?data.results:[]).filter(row=>row.rank==='SPECIES'&&(!row.status||row.status==='ACCEPTED')&&(row.canonicalName||row.scientificName));
    const exact=rows.filter(row=>taxonKey(row.vernacularName)===taxonKey(name)).map(row=>({...row,commonNameMatch:'exacta'}));
    const candidates=exact.length?exact:rows.map(row=>({...row,nameScore:commonNameSimilarity(name,row.vernacularName||'')})).filter(row=>row.vernacularName&&row.nameScore>=0.66).sort((a,b)=>b.nameScore-a.nameScore).slice(0,5).map(row=>({...row,commonNameMatch:'aproximada'}));
    activeTaxonomyCandidates=[...new Map(candidates.map(row=>[row.key,{key:row.key,canonicalName:row.canonicalName||row.scientificName,className:row.class,order:row.order,family:row.family,vernacularName:row.vernacularName,commonNameMatch:row.commonNameMatch}])).values()];
    if(!activeTaxonomyCandidates.length){results.innerHTML='<p class="ai-status">GBIF no encontró nombres comunes cercanos en español. No se ha cambiado la ficha.</p>';return}
    results.innerHTML=activeTaxonomyCandidates.map((row,index)=>`<article class="taxonomy-candidate"><strong>${esc(row.canonicalName||'Nombre científico no disponible')}</strong><small>${row.commonNameMatch==='aproximada'?`Nombre común en GBIF: «${esc(row.vernacularName)}». Coincidencia aproximada; comprueba que sea tu especie. `:''}${esc([row.className,row.order,row.family].filter(Boolean).join(' · ')||'Clasificación pendiente')}</small><button type="button" class="edit-button" data-apply-taxonomy="${index}">Aplicar sugerencia</button></article>`).join('');
  }catch(error){if(run!==taxonomyLookupRun)return;console.warn('FotoDex GBIF lookup:',error);results.innerHTML='<p class="ai-status">No se pudo conectar con GBIF. Comprueba la conexión e inténtalo de nuevo.</p>'}
}
async function applyTaxonomySuggestion(index){
  const candidate=activeTaxonomyCandidates[index],name=activeTaxonomyName;if(!candidate?.canonicalName||!name)return;
  taxonomyCache[taxonKey(name)]=candidate;try{localStorage.setItem('fotodex-taxonomy-cache-v1',JSON.stringify(taxonomyCache))}catch{}
  const capture=captures.find(item=>taxonKey(item.name)===taxonKey(name));
  if(capture&&!String(capture.scientific||'').trim()){
    capture.scientific=candidate.canonicalName;capture.updatedAt=new Date().toISOString();
    if(capture.cloudSynced)capture.cloudSyncPending=true;
    try{await writeCapture(capture);captures=await readCaptures()}catch(error){console.warn('FotoDex taxonomy save:',error);notify('No se pudo guardar el cambio en tu captura. La sugerencia sigue disponible en esta ficha.');renderAll();showSpeciesDetails(name);return}
    if(capture.cloudSyncPending&&authUser?.id===capture.cloudUserId&&navigator.onLine)await retryCaptureSync(capture.id);
  }
  renderAll();showSpeciesDetails(name);notify('Sugerencia científica guardada. Revisa la ficha antes de compartirla.');
}
function useLocation() {
  if(coordinates){coordinates=null;updateLocationUI();notify('Ubicación precisa quitada de esta ficha.');return}
  if(!navigator.geolocation){notify('Este navegador no ofrece ubicación.');return}
  const button=document.querySelector('#use-location'); button.disabled=true; button.textContent='Buscando…';
  navigator.geolocation.getCurrentPosition(position=>{
    coordinates={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:Math.round(position.coords.accuracy)};
    updateLocationUI(); notify('Ubicación precisa añadida a la ficha. Se guardará de forma privada al sincronizar.');
  },()=>{
    updateLocationUI(); notify('No se concedió acceso. Puedes escribir el lugar manualmente.');
  },{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
}
function updateLocationUI(){
  const button=document.querySelector('#use-location');if(!button)return;
  button.disabled=false;button.textContent=coordinates?'Quitar ubicación':'Añadir ubicación';
  document.querySelector('#location-help').textContent=authUser
    ?'Si añades una ubicación precisa, se sincroniza en un registro privado que solo tú puedes consultar. El país y el lugar aproximado siguen la visibilidad elegida.'
    :'Si añades ubicación precisa, queda en esta ficha. Si sincronizas después, seguirá en un registro privado que solo tú puedes consultar.';
}
function goToView(name) {
  document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===name+'-view'));
  document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
  if(name==='profile')void updateStorageStatus();
  window.scrollTo({top:0,behavior:'smooth'});
}

async function toggleCloudLike(id) {
  if(!authUser){modal(document.querySelector('#auth-modal'),true);setAuthMode('signin');setAuthMessage('Inicia sesión para dar me gusta.');return}
  const item=cloudCaptures.find(capture=>capture.id===id);if(!item)return;
  const button=document.querySelector(`[data-cloud-like="${CSS.escape(id)}"]`);if(button)button.disabled=true;
  const result=item.liked
    ? await supabaseClient.from('capture_likes').delete().eq('capture_id',id).eq('user_id',authUser.id)
    : await supabaseClient.from('capture_likes').insert({capture_id:id,user_id:authUser.id});
  if(result.error){notify('No se pudo actualizar el me gusta.');if(button)button.disabled=false;return}
  await loadCloudCaptures();renderAll();
}
async function toggleFollowUser(id) {
  if(!authUser){modal(document.querySelector('#auth-modal'),true);setAuthMode('signin');setAuthMessage('Inicia sesión para seguir a otros exploradores.');return}
  if(id===authUser.id)return;
  const following=followedIds.has(id);
  const result=following
    ? await supabaseClient.from('follows').delete().eq('follower_id',authUser.id).eq('followed_id',id)
    : await supabaseClient.from('follows').insert({follower_id:authUser.id,followed_id:id});
  if(result.error){notify('No se pudo actualizar el seguimiento.');return}
  if(following)followedIds.delete(id);else followedIds.add(id);
  await loadCloudCaptures();await refreshSocialCounts();renderAll();
  if(activePublicProfileId===id)await openExplorerProfile(id);
}
let activeCommentsCapture=null;
async function openComments(id) {
  if(!authUser){modal(document.querySelector('#auth-modal'),true);setAuthMode('signin');setAuthMessage('Inicia sesión para participar en los comentarios.');return}
  activeCommentsCapture=id;document.querySelector('#comment-body').value='';modal(document.querySelector('#comments-modal'),true);
  await loadComments();
}
async function loadComments() {
  const list=document.querySelector('#comments-list');list.innerHTML='<div class="empty-state">Cargando comentarios…</div>';
  const {data,error}=await supabaseClient.from('capture_comments').select('id,user_id,body,created_at').eq('capture_id',activeCommentsCapture).order('created_at',{ascending:true}).limit(100);
  if(error){list.innerHTML='<div class="empty-state">No se pudieron cargar los comentarios.</div>';return}
  if(!data.length){list.innerHTML='<div class="empty-state">Sé la primera persona en comentar.</div>';return}
  const {data:profiles}=await supabaseClient.from('profiles').select('id,display_name,username').in('id',[...new Set(data.map(row=>row.user_id))]);
  const names=new Map((profiles||[]).map(profile=>[profile.id,profile.display_name||profile.username||'Explorador']));
  list.innerHTML=data.map(comment=>`<article class="comment-row"><div class="comment-top"><strong>${esc(names.get(comment.user_id)||'Explorador')}</strong><time>${esc(new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(comment.created_at)))}</time>${comment.user_id===authUser.id?`<button type="button" data-delete-comment="${esc(comment.id)}" aria-label="Eliminar comentario">Eliminar</button>`:''}</div><p>${esc(comment.body)}</p></article>`).join('');
}
async function submitComment(event) {
  event.preventDefault();if(!authUser||!activeCommentsCapture)return;
  const body=String(new FormData(event.currentTarget).get('body')||'').trim();if(!body)return;
  const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
  const {error}=await supabaseClient.from('capture_comments').insert({capture_id:activeCommentsCapture,user_id:authUser.id,body});
  button.disabled=false;
  if(error){notify('No se pudo publicar el comentario.');return}
  event.currentTarget.reset();await loadComments();await loadCloudCaptures();renderAll();
}

document.querySelector('#today-label').textContent=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toLocaleUpperCase('es');
document.querySelector('#search-input').addEventListener('input',renderSpecies);
document.querySelector('#show-more-species').addEventListener('click',()=>{collectionVisibleCount+=COLLECTION_PAGE_SIZE;renderSpecies(false)});
document.querySelector('#add-species').addEventListener('click',openAddSpecies);
document.querySelector('#species-add-form').addEventListener('submit',submitCustomSpecies);
document.querySelector('#explore-search').addEventListener('input',renderExplore);
document.querySelector('#explore-filter-button').addEventListener('click',()=>document.querySelector('#explore-filters').classList.toggle('filters-open'));
['explore-group-filter','explore-habitat-filter','explore-country-filter'].forEach(id=>document.querySelector('#'+id).addEventListener('change',renderExplore));
['status-filter','habitat-filter','species-sort'].forEach(id=>document.querySelector('#'+id).addEventListener('change',renderSpecies));
document.querySelector('#country-filter').addEventListener('input',renderSpecies);
document.querySelectorAll('.chip[data-filter]').forEach(chip=>chip.addEventListener('click',()=>{
  document.querySelectorAll('.chip[data-filter]').forEach(item=>item.classList.remove('selected')); chip.classList.add('selected'); renderSpecies();
}));
document.querySelectorAll('[data-explore-mode]').forEach(button=>button.addEventListener('click',()=>{exploreMode=button.dataset.exploreMode;renderExplore()}));
document.querySelector('#filter-button').addEventListener('click',()=>document.querySelector('#advanced-filters').classList.toggle('filters-open'));
document.querySelector('#reset-filters').addEventListener('click',()=>{
  document.querySelector('#search-input').value='';
  document.querySelector('#status-filter').value='todas';
  document.querySelector('#habitat-filter').value='todos';
  document.querySelector('#country-filter').value='';
  document.querySelector('#species-sort').value='recent';
  document.querySelectorAll('.chip[data-filter]').forEach(chip=>chip.classList.toggle('selected',chip.dataset.filter==='todas'));
  renderSpecies();
});
document.querySelector('#take-photo').addEventListener('click',()=>pickPhoto(true));
document.querySelector('#choose-photo').addEventListener('click',()=>pickPhoto(false));
document.querySelector('#back-to-choice').addEventListener('click',()=>{choicePanel.classList.remove('hidden');editorPanel.classList.add('hidden');resetEditor()});
document.querySelector('#use-location').addEventListener('click',useLocation);
document.querySelector('#identify-photo').addEventListener('click',identifyAnimal);
form.addEventListener('submit',saveCapture);
document.querySelector('#account-open').addEventListener('click',()=>{setAuthMode('signin');modal(document.querySelector('#auth-modal'),true)});
document.querySelector('#profile-edit').addEventListener('click',()=>{if(!activeProfile)return;const form=document.querySelector('#profile-form');form.elements.display_name.value=activeProfile.display_name||'';form.elements.bio.value=activeProfile.bio||'';updateBioCounter();document.querySelector('#profile-message').textContent='';document.querySelector('#profile-message').classList.remove('error');modal(document.querySelector('#profile-modal'),true)});
document.querySelector('#profile-form').addEventListener('submit',submitProfile);
document.querySelector('#profile-form').elements.bio.addEventListener('input',updateBioCounter);
document.querySelector('#backup-export').addEventListener('click',exportBackup);
document.querySelector('#storage-persist').addEventListener('click',requestStoragePersistence);
document.querySelector('#sync-local-captures').addEventListener('click',syncLocalCaptures);
document.querySelector('#backup-import').addEventListener('click',()=>document.querySelector('#backup-file').click());
document.querySelector('#backup-file').addEventListener('change',async event=>{const file=event.target.files?.[0];await importBackupFile(file);event.target.value=''});
document.querySelector('#account-signout').addEventListener('click',signOut);
document.querySelector('#auth-form').addEventListener('submit',submitAuth);
document.querySelector('#auth-forgot-password').addEventListener('click',()=>setAuthMode('recovery-request'));
document.querySelector('#comment-form').addEventListener('submit',submitComment);
document.querySelector('#notification-open').addEventListener('click',openNotifications);
document.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>setAuthMode(button.dataset.authMode)));
photoInput.addEventListener('change',async event=>{
  const file=event.target.files?.[0]; if(!file)return;
  try{showEditor(await compressPhoto(file))}catch{notify('No se pudo procesar esa foto. Prueba con otra imagen.')}
  finally{event.target.value=''}
});
document.addEventListener('click',async event=>{
  const photoOpen=event.target.closest('[data-open-photo]');
  if(photoOpen){openPhotoLightbox(photoOpen.dataset.openPhoto,photoOpen.dataset.photoName);return}
  const photoViewer=document.querySelector('#photo-lightbox');
  if(event.target.closest('#photo-lightbox-close')||event.target===photoViewer){closePhotoLightbox();return}
  if(event.target.closest('[data-close-species-add]')){modal(document.querySelector('#species-add-modal'),false);return}
  if(event.target.closest('.modal-close')&&document.querySelector('#species-add-modal').classList.contains('open')){modal(document.querySelector('#species-add-modal'),false);return}
  if(event.target===document.querySelector('#species-add-modal')){modal(document.querySelector('#species-add-modal'),false);return}
  const taxonomyLookup=event.target.closest('[data-lookup-taxonomy]');
  if(taxonomyLookup){await lookupTaxonomy(taxonomyLookup.dataset.lookupTaxonomy);return}
  const applyTaxonomy=event.target.closest('[data-apply-taxonomy]');
  if(applyTaxonomy){await applyTaxonomySuggestion(Number(applyTaxonomy.dataset.applyTaxonomy));return}
  const retrySync=event.target.closest('[data-retry-sync]');
  if(retrySync){await retryCaptureSync(retrySync.dataset.retrySync);return}
  const aiCandidate=event.target.closest('[data-ai-candidate]');if(aiCandidate){applyAiCandidate(Number(aiCandidate.dataset.aiCandidate));return}
  const view=event.target.closest('[data-view]'); if(view){goToView(view.dataset.view);return}
  if(event.target.closest('[data-action="camera"]')){showChoice();return}
  if(event.target.closest('[data-action="open-auth"]')){setAuthMode('signin');modal(document.querySelector('#auth-modal'),true);return}
  if(event.target.closest('.modal-close')){if(detailModal.classList.contains('open'))modal(detailModal,false);else if(document.querySelector('#notifications-modal').classList.contains('open'))modal(document.querySelector('#notifications-modal'),false);else if(document.querySelector('#explorer-profile-modal').classList.contains('open')){modal(document.querySelector('#explorer-profile-modal'),false);activePublicProfileId=null;profileCloudCaptures=[]}else if(document.querySelector('#profile-modal').classList.contains('open'))modal(document.querySelector('#profile-modal'),false);else if(document.querySelector('#auth-modal').classList.contains('open'))modal(document.querySelector('#auth-modal'),false);else if(document.querySelector('#comments-modal').classList.contains('open'))modal(document.querySelector('#comments-modal'),false);else{modal(captureModal,false);resetEditor()}return}
  if(event.target===captureModal){modal(captureModal,false);resetEditor();return}
  if(event.target===document.querySelector('#auth-modal')){modal(document.querySelector('#auth-modal'),false);return}
  if(event.target===document.querySelector('#profile-modal')){modal(document.querySelector('#profile-modal'),false);return}
  if(event.target===document.querySelector('#explorer-profile-modal')){modal(document.querySelector('#explorer-profile-modal'),false);activePublicProfileId=null;profileCloudCaptures=[];return}
  if(event.target===document.querySelector('#notifications-modal')){modal(document.querySelector('#notifications-modal'),false);return}
  if(event.target===document.querySelector('#comments-modal')){modal(document.querySelector('#comments-modal'),false);return}
  if(event.target===detailModal){modal(detailModal,false);return}
  const edit=event.target.closest('[data-edit-capture]');
  if(edit){const item=captures.find(x=>x.id===edit.dataset.editCapture);if(!item)return;modal(detailModal,false);showEditor({blob:item.photo,width:item.photoWidth,height:item.photoHeight},item);return}
  const open=event.target.closest('[data-open-capture]');
  if(open){modal(detailModal,false);showCaptureDetails(open.dataset.openCapture);return}
  const cloudOpen=event.target.closest('[data-cloud-capture]');
  if(cloudOpen){const id=cloudOpen.dataset.cloudCapture,profileCapture=profileCloudCaptures.find(item=>item.id===id);if(profileCapture){modal(document.querySelector('#explorer-profile-modal'),false);activePublicProfileId=null;profileCloudCaptures=[]}showCloudCaptureDetails(id,profileCapture);return}
  const remove=event.target.closest('[data-delete-capture]');
  if(remove){if(!confirm('¿Eliminar esta captura de este dispositivo y de tu cuenta? No se puede deshacer.'))return;try{const item=captures.find(x=>x.id===remove.dataset.deleteCapture);if(item?.cloudSynced&&authUser?.id===item.cloudUserId){const result=await supabaseClient.from('captures').delete().eq('id',item.id);if(result.error)throw result.error;await supabaseClient.storage.from('captures').remove([`${authUser.id}/${item.id}.jpg`]);}await deleteCapture(remove.dataset.deleteCapture);modal(detailModal,false);await refresh();await loadCloudCaptures();renderAll();notify('Captura eliminada.')}catch{notify('No se pudo eliminar la captura.')}return}
  const species=event.target.closest('[data-species]');
  if(species){showSpeciesDetails(species.dataset.species);return}
  const removeCustom=event.target.closest('[data-remove-custom-species]');
  if(removeCustom){
    const name=removeCustom.dataset.removeCustomSpecies,key=taxonKey(name),ownedCloud=cloudCaptures.filter(item=>item.userId===authUser?.id);
    const customItem=customSpecies.find(item=>taxonKey(item.name)===key),scientific=norm(customItem?.scientific||taxonomyCache[key]?.canonicalName);
    if([...captures,...ownedCloud].some(item=>taxonKey(item.name)===key||(scientific&&norm(item.scientific)===scientific))){notify('Esta especie tiene capturas guardadas. Elimínalas primero si también quieres quitarla de la lista.');return}
    if(!confirm(`¿Quitar «${name}» de tu lista de especies?`))return;
    const next=customSpecies.filter(item=>taxonKey(item.name)!==key);
    try{localStorage.setItem('fotodex-custom-species-v1',JSON.stringify(next))}catch{notify('No se pudo actualizar la lista en este navegador.');return}
    customSpecies=next;const catalogIndex=catalog.findIndex(item=>item.isCustom&&taxonKey(item.name)===key);if(catalogIndex>=0)catalog.splice(catalogIndex,1);
    delete taxonomyCache[key];try{localStorage.setItem('fotodex-taxonomy-cache-v1',JSON.stringify(taxonomyCache))}catch{}
    modal(detailModal,false);renderAll();notify('Especie quitada de tu lista.');return;
  }
  const like=event.target.closest('[data-like]');
  if(like){const item=demoObservations.find(x=>x.id===Number(like.dataset.like));if(item){item.liked=!item.liked;item.likes+=item.liked?1:-1;renderAll()}}
  const cloudLike=event.target.closest('[data-cloud-like]');
  if(cloudLike){await toggleCloudLike(cloudLike.dataset.cloudLike)}
  const follow=event.target.closest('[data-follow-user]');
  if(follow){await toggleFollowUser(follow.dataset.followUser);return}
  const openProfile=event.target.closest('[data-open-profile]');
  if(openProfile){await openExplorerProfile(openProfile.dataset.openProfile);return}
  const comments=event.target.closest('[data-open-comments]');
  if(comments){await openComments(comments.dataset.openComments);return}
  const removeComment=event.target.closest('[data-delete-comment]');
  if(removeComment){if(!confirm('¿Eliminar este comentario?'))return;const {error}=await supabaseClient.from('capture_comments').delete().eq('id',removeComment.dataset.deleteComment).eq('user_id',authUser.id);if(error){notify('No se pudo eliminar el comentario.');return}await loadComments();await loadCloudCaptures();renderAll();}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePhotoLightbox()});

refresh().catch(()=>{renderAll();notify('Abre FotoDex desde su dirección web segura para guardar capturas.')});
window.addEventListener('online',async()=>{try{const synced=await syncPendingCaptures();if(synced){await loadCloudCaptures();renderAll();notify(`${synced} captura${synced===1?'':'s'} pendiente${synced===1?'':'s'} sincronizada${synced===1?'':'s'}.`)}}catch(error){console.warn('FotoDex online sync:',error)}});
setAuthMode('signin');initCloud();setupAppInstall();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
