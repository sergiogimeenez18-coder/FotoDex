const observations = [
  {id:1,name:'Petirrojo europeo',scientific:'Erithacus rubecula',emoji:'🐦',place:'Parque del Retiro',ago:'hace 12 min',user:'Lucía R.',initial:'L',kind:'aves',palette:'linear-gradient(145deg,#dce9d7,#799477)',likes:24,liked:false},
  {id:2,name:'Mariposa macaón',scientific:'Papilio machaon',emoji:'🦋',place:'Casa de Campo',ago:'hace 38 min',user:'Pablo N.',initial:'P',kind:'insectos',palette:'linear-gradient(145deg,#efe5bd,#a2ad70)',likes:18,liked:true},
  {id:3,name:'Lagartija ibérica',scientific:'Podarcis hispanicus',emoji:'🦎',place:'Sierra de Guadarrama',ago:'hace 1 h',user:'Marta V.',initial:'M',kind:'reptiles',palette:'linear-gradient(145deg,#d9e2bf,#819572)',likes:31,liked:false},
  {id:4,name:'Abejaruco europeo',scientific:'Merops apiaster',emoji:'🐤',place:'Alcalá de Henares',ago:'hace 2 h',user:'Diego F.',initial:'D',kind:'aves',palette:'linear-gradient(145deg,#e8dcae,#9ab0a2)',likes:12,liked:false}
];
const species = [
  ...observations.slice(0,3).map(x=>({...x,seen:true})),
  {id:5,name:'Erizo europeo',scientific:'Erinaceus europaeus',emoji:'🦔',place:'Jardín de casa',kind:'mamiferos',palette:'linear-gradient(145deg,#e6d8c1,#a78f73)',seen:true},
  {id:6,name:'Zorro rojo',scientific:'Vulpes vulpes',emoji:'🦊',place:'Monte del Pardo',kind:'mamiferos',palette:'linear-gradient(145deg,#ead8b7,#bc8663)',seen:true},
  {id:7,name:'Salamandra común',scientific:'Salamandra salamandra',emoji:'🦎',place:'Sierra de Guadarrama',kind:'reptiles',palette:'linear-gradient(145deg,#d5ddcb,#697e69)',seen:true},
  {id:8,name:'Mariposa monarca',scientific:'Danaus plexippus',emoji:'🦋',place:'Jardín botánico',kind:'insectos',palette:'linear-gradient(145deg,#ecd6ac,#b7845c)',seen:true},
  {id:9,name:'Ciervo rojo',scientific:'Cervus elaphus',emoji:'🦌',place:'—',kind:'mamiferos',palette:'linear-gradient(145deg,#dde5d5,#93a58d)',seen:false},
  {id:10,name:'Búho real',scientific:'Bubo bubo',emoji:'🦉',place:'—',kind:'aves',palette:'linear-gradient(145deg,#dfd9ca,#8e8871)',seen:false},
  {id:11,name:'Salamanquesa',scientific:'Tarentola mauritanica',emoji:'🦎',place:'—',kind:'reptiles',palette:'linear-gradient(145deg,#d8e5cf,#91a183)',seen:false},
  {id:12,name:'Libélula emperador',scientific:'Anax imperator',emoji:'🪰',place:'—',kind:'insectos',palette:'linear-gradient(145deg,#d2e6dd,#78a18c)',seen:false}
];

const feedList=document.querySelector('#feed-list'), exploreList=document.querySelector('#explore-list'), grid=document.querySelector('#species-grid'), profileGrid=document.querySelector('#profile-grid');
const photoInput=document.querySelector('#photo-input');
function card(item){return `<article class="capture-card"><div class="capture-photo" style="background:${item.palette||'linear-gradient(145deg,#d9e5d3,#84977a)'}"><span class="photo-sky"></span><span class="animal">${item.emoji}</span></div><div class="capture-info"><h3 class="common">${item.name}</h3><p class="scientific">${item.scientific}</p><div class="capture-meta"><span>⌖ ${item.place}</span><span>◷ ${item.ago}</span></div><div class="capture-user"><span class="mini-avatar">${item.initial}</span>${item.user}</div></div><button class="heart ${item.liked?'liked':''}" data-like="${item.id}" aria-label="Me gusta">${item.liked?'♥':'♡'}<small>${item.likes}</small></button></article>`}
function speciesCard(item){return `<article class="species-card"><div class="species-art" style="background:${item.palette}"><span class="creature">${item.emoji}</span></div><div class="species-copy"><h3>${item.name}</h3><p>${item.scientific}</p><div class="species-foot"><span>⌖ ${item.place}</span><span class="badge">${item.seen?'Capturada':'Por descubrir'}</span></div></div></article>`}
function paint(){feedList.innerHTML=observations.slice(0,3).map(card).join('');exploreList.innerHTML=observations.map(card).join('');renderSpecies();profileGrid.innerHTML=species.filter(x=>x.seen).slice(0,4).map(speciesCard).join('')}
function renderSpecies(){const selected=document.querySelector('.chip.selected')?.dataset.filter||'todas';const term=(document.querySelector('#search-input')?.value||'').toLowerCase();const filtered=species.filter(s=>(selected==='todas'||s.kind===selected)&&`${s.name} ${s.scientific}`.toLowerCase().includes(term));grid.innerHTML=filtered.length?filtered.map(speciesCard).join(''):'<div class="empty-state"><strong>No encontramos esa especie</strong>Prueba con otro nombre o filtro.</div>'}
paint();

document.addEventListener('click',e=>{
 const viewBtn=e.target.closest('[data-view]');if(viewBtn){const v=viewBtn.dataset.view;document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.querySelector(`#${v}-view`)?.classList.add('active');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===v));window.scrollTo({top:0,behavior:'smooth'});return}
 if(e.target.closest('[data-action="camera"]')){document.querySelector('#capture-modal').classList.add('open');return}
 const like=e.target.closest('[data-like]');if(like){const o=observations.find(x=>x.id===Number(like.dataset.like));if(o){o.liked=!o.liked;o.likes+=o.liked?1:-1;paint()}return}
 const chip=e.target.closest('.chip[data-filter]');if(chip){document.querySelectorAll('.chip[data-filter]').forEach(x=>x.classList.remove('selected'));chip.classList.add('selected');renderSpecies();return}
 if(e.target.closest('#filter-button')){document.querySelector('#toast').textContent='Más filtros estarán disponibles pronto';document.querySelector('#toast').classList.add('show');setTimeout(()=>document.querySelector('#toast').classList.remove('show'),2200)}
 if(e.target.closest('.modal-close')||e.target.id==='capture-modal')document.querySelector('#capture-modal').classList.remove('open');
});
document.querySelector('#search-input').addEventListener('input',renderSpecies);
document.querySelector('#take-photo').addEventListener('click',()=>{photoInput.setAttribute('capture','environment');photoInput.click()});
document.querySelector('#choose-photo').addEventListener('click',()=>{photoInput.removeAttribute('capture');photoInput.click()});
photoInput.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;document.querySelector('#capture-modal').classList.remove('open');try{const optimized=await compressImage(file);localStorage.setItem('fotodex-last-photo',optimized);document.querySelector('#toast').textContent='Foto optimizada. La identificación con IA se conectará al configurar el servicio.';document.querySelector('#toast').classList.add('show');setTimeout(()=>document.querySelector('#toast').classList.remove('show'),3400)}catch{document.querySelector('#toast').textContent='No se pudo procesar la foto';document.querySelector('#toast').classList.add('show');setTimeout(()=>document.querySelector('#toast').classList.remove('show'),2400)}e.target.value=''});
function compressImage(file){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d',{alpha:false}).drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(!blob){reject();return}const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)},'image/jpeg',.84)};img.onerror=reject;img.src=url})}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
