'use strict';
const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const el = (tag, cls, value) => { const node = document.createElement(tag); if (cls) node.className = cls; if (value != null) node.textContent = value; return node; };
const pieces = (window.CATALOG || []).filter(p => p.images?.length);
const ranges = ['Dep Thaiñ', 'Full Khor', 'Mukhla', 'Mukhli', 'Premium'];
const filters = one('#filters'), grid = one('#grid'), quick = one('#quick'), wishlist = one('#wishlist');
const priceText = p => p.price == null ? 'Price on enquiry' : new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(p.price);
const whatsapp = text => 'https://wa.me/917005366288?text=' + encodeURIComponent(text);
const reference = p => p.name + ' — ' + p.url;
const enquire = p => whatsapp('Hello Lynette, could you confirm the availability and price of ' + p.name + '?\n\n' + p.url);
const imageFor = (p, index = 0, size = 'small') => {
  const source = p.images[index], img = el('img','photo'); img.alt = source.alt || p.name; img.loading = 'lazy'; img.decoding = 'async';
  img.src = size === 'small' ? source.small || source.src : source.src;
  if (source.small && source.width>480) { img.srcset = source.small + ' 480w, ' + source.src + ' '+source.width+'w'; img.sizes = size === 'small' ? '(max-width:760px) 45vw, 30vw' : '(max-width:760px) 90vw, 50vw'; }
  return img;
};
let selection;
try { selection = new Set(JSON.parse(localStorage.getItem('lynette-wishlist-v1') || '[]')); } catch { selection = new Set(); }
selection = new Set([...selection].filter(id => pieces.some(p => p.id === id)));
let active, frame = 0, shown = 9, zoomed = false, returnFocus;
function syncSaved() {
  try { localStorage.setItem('lynette-wishlist-v1',JSON.stringify([...selection])); } catch {}
  one('#saved-count').textContent = selection.size || '';
  one('#saved').setAttribute('aria-label','Open wishlist, ' + selection.size + ' saved');
  for (const btn of all('.save-piece')) {
    const saved = selection.has(btn.dataset.key); btn.textContent = saved ? '♥' : '♡';
    btn.setAttribute('aria-pressed',String(saved)); btn.setAttribute('aria-label',(saved ? 'Remove from' : 'Add to') + ' wishlist: ' + btn.dataset.name);
  }
  if (active) {one('#quick-save').textContent = selection.has(active.id) ? 'Remove from wishlist' : 'Save to wishlist';one('#quick-save').setAttribute('aria-pressed',String(selection.has(active.id)));}
}
function toggle(p) { if (selection.has(p.id)) selection.delete(p.id); else selection.add(p.id); syncSaved(); }
function productCard(p) {
  const card = el('article','piece'), pic = el('button','picture'), save = el('button','save-piece'), info = el('div','card-info'), title = el('button','card-open',p.name), bottom = el('div','card-bottom'), link = el('a','','Enquire ↗');
  card.dataset.flipId = p.id; pic.setAttribute('aria-label','View ' + p.name); pic.append(imageFor(p)); pic.onclick = title.onclick = () => openPiece(p);
  save.dataset.key = p.id; save.dataset.name = p.name; save.onclick = () => toggle(p);
  link.href = enquire(p); link.setAttribute('aria-label','Enquire about ' + p.name + ' on WhatsApp');
  bottom.append(el('span','',priceText(p)),link);info.append(title,bottom);card.append(pic,save,info);return card;
}
function addOption(select,value,label=value) {select.add(new Option(label,value));}
for (const r of ranges) {
  const matched = pieces.some(p => p.range === r);
  const row = el('a','range-row'), img=el('img'); img.src='assets/ranges/'+({'Dep Thaiñ':'dep-thain','Full Khor':'full-khor'}[r]||r.toLowerCase())+'.webp';img.alt='';img.width=50;img.height=50;img.loading='lazy';
  row.append(img,el('span','range-name',r),el('span','range-action',matched?'Browse ↓':'Enquire ↗')); row.href = matched ? '#collection' : whatsapp('Hello Lynette, could you show me the available pieces in the ' + r + ' range?');
  row.setAttribute('aria-label',matched ? 'View '+r+' pieces' : 'Enquire on WhatsApp about '+r);
  if (matched) row.onclick = () => {filters.reset();filters.elements.range.value=r;shown=9;renderGrid();};
  one('#range-list').append(row);
}
for (const r of [...new Set(pieces.map(p => p.range).filter(Boolean))].sort()) addOption(filters.elements.range,r);
for (const f of [...new Set(pieces.map(p => p.fabric).filter(Boolean))].sort()) addOption(filters.elements.fabric,f);
if (pieces.some(p => !p.fabric)) addOption(filters.elements.fabric,'unspecified','Fabric on enquiry');
const colorLabel=el('label','','Colour'), colorSelect=el('select');colorSelect.name='color';addOption(colorSelect,'','All colours');colorLabel.append(colorSelect);filters.prepend(colorLabel);
for(const color of [...new Set(pieces.flatMap(p=>p.colors||[]))].sort())addOption(colorSelect,color);
if(!pieces.some(p=>p.price!=null)){filters.elements.price.replaceChildren(new Option('Price on enquiry',''));filters.elements.price.disabled=true;}
if(filters.elements.range.options.length===1)filters.elements.range.parentElement.hidden=true;
function renderGrid(animate=false) {
  const {range,fabric,price,color} = Object.fromEntries(new FormData(filters));
  const filtered = pieces.filter(p => (!color||p.colors.includes(color)) && (!range || p.range===range) && (!fabric || (fabric==='unspecified' ? !p.fabric : p.fabric===fabric)) && (!price || (price==='ask' ? p.price==null : p.price!=null && (price==='low'?p.price<4000:price==='high'?p.price>=7000:p.price>=4000&&p.price<7000))));
  const state = animate && window.Flip && !document.documentElement.classList.contains('reduced') ? Flip.getState('.piece') : null;
  grid.replaceChildren(...filtered.slice(0,shown).map(productCard));
  if (state) Flip.from(state,{duration:.45,absolute:false,stagger:.018,onEnter:items=>gsap.fromTo(items,{opacity:.3,y:8},{opacity:1,y:0,duration:.3})});
  one('#total').textContent=filtered.length+' '+(filtered.length===1?'piece':'pieces');
  one('#more').hidden=filtered.length<=shown;one('#no-pieces').hidden=!!filtered.length;
  one('#range-enquire').href=whatsapp('Hello Lynette, could you help me find '+(range ? 'a piece from the '+range+' range' : 'a piece from your collection')+'?');
  syncSaved();window.ScrollTrigger?.refresh();
}
filters.onchange=()=>{shown=9;renderGrid(true);};
filters.onreset=()=>requestAnimationFrame(()=>{shown=9;renderGrid(true);});
one('#more').onclick=()=>{const old=shown;shown+=12;renderGrid();grid.children[old]?.querySelector('button')?.focus({preventScroll:true});};
function openDialog(dialog) {returnFocus=document.activeElement;window.__lenis?.stop();dialog.showModal();dialog.scrollTop=0;}
for (const dialog of [quick,wishlist]) {
  one('[data-close]',dialog).onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{const box=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom))dialog.close();});
  dialog.addEventListener('close',()=>{window.__lenis?.start();returnFocus?.focus?.({preventScroll:true});});
}
function setZoom(value) {
  zoomed=value;one('#zoom-window').classList.toggle('zoomed',value);one('#quick-img').style.transformOrigin='50% 50%';one('#zoom').setAttribute('aria-pressed',String(value));one('#zoom').textContent=value?'Zoom out −':'Zoom in +';
}
function gallery(i, transition=false) {
  const img=one('#quick-img'), previous=img.currentSrc||img.src;
  frame=(i+active.images.length)%active.images.length;setZoom(false);
  img.src=active.images[frame].src;img.alt=active.images[frame].alt||active.name;
  if (transition && !document.documentElement.classList.contains('reduced') && previous) import('./ripple.js').then(mod=>mod.ripple(previous,img.src)).catch(()=>{});
  one('#gallery-count').textContent='Photo '+(frame+1)+' / '+active.images.length;
  one('#gallery-prev').disabled=one('#gallery-next').disabled=active.images.length<2;
}
function openPiece(p, zoom=false) {
  active=p;one('#quick-title').textContent=p.name;one('#quick-range').textContent=p.range||'Lynette’s collection';one('#quick-price').textContent=priceText(p);
  const colour=one('#quick-colors');colour.replaceChildren();colour.hidden=!p.colors?.length;
  if (p.colors?.length) {colour.append('Colour · ');p.colors.forEach((name,i)=>{const sw=el('i','swatch');if(CSS.supports('color',name)) {sw.style.backgroundColor=name;colour.append(sw);}colour.append(name+(i<p.colors.length-1?', ':''));});}
  one('#quick-fabric').textContent=p.fabric?'Fabric · '+p.fabric:'';one('#quick-fabric').hidden=!p.fabric;
  one('#quick-wa').href=enquire(p);mobileWa.href=enquire(p);one('#quick-source').href=p.url;
  one('#quick-save').onclick=()=>toggle(p);syncSaved();gallery(0);openDialog(quick);if(zoom)setZoom(true);
}
const mobileWa=el('a','mobile-quick-wa button dark','Enquire on WhatsApp ↗');quick.prepend(mobileWa);
one('#gallery-prev').onclick=()=>gallery(frame-1,true);one('#gallery-next').onclick=()=>gallery(frame+1,true);one('#zoom').onclick=()=>setZoom(!zoomed);
one('#zoom-window').onpointermove=e=>{if(!zoomed)return;const box=e.currentTarget.getBoundingClientRect();one('#quick-img').style.transformOrigin=Math.max(0,Math.min(100,(e.clientX-box.left)/box.width*100))+'% '+Math.max(0,Math.min(100,(e.clientY-box.top)/box.height*100))+'%';};
one('#zoom-window').onpointerdown=e=>{if(zoomed)e.currentTarget.setPointerCapture(e.pointerId);};
one('#zoom-window').ondblclick=()=>setZoom(!zoomed);
function renderWishlist(){
  const selected=pieces.filter(p=>selection.has(p.id)), container=one('#wishlist-items');container.replaceChildren();
  if(!selected.length)container.append(el('p','','Save a piece using the heart in the collection. Your favourites will appear here.'));
  for(const p of selected){const row=el('div','wish-row'),remove=el('button','','Remove');remove.setAttribute('aria-label','Remove '+p.name);remove.onclick=()=>{toggle(p);renderWishlist();(one('.wish-row button')||one('[data-close]',wishlist)).focus();};row.append(imageFor(p),el('span','',p.name),remove);container.append(row);}
  const link=one('#wishlist-wa');link.hidden=!selected.length;link.href=whatsapp('Hello Lynette, could you confirm the price and availability of these pieces?\n\n'+selected.map(reference).join('\n\n'));
}
one('#saved').onclick=()=>{renderWishlist();openDialog(wishlist);};
const firstOfRange = [...new Set(pieces.map(p=>p.range).filter(Boolean))].map(range=>({name:range,items:pieces.filter(p=>p.range===range)}));
const railGroups = firstOfRange.length?firstOfRange:pieces.length?[{name:'Selected pieces',items:pieces.slice(0,7)}]:[];
for(const {name,items} of railGroups) {
  const rail=el('div','rail'),head=el('h3','',name),track=el('div','rail-track');
  for(const p of items.slice(0,15)){const b=el('button');b.append(imageFor(p),el('span','',p.name));b.onclick=()=>openPiece(p);track.append(b);}
  if(items.length===1){rail.classList.add('single');const description=el('div','rail-description');description.append(el('p','eyebrow','From the '+name+' range'),head,el('p','',items[0].notes));const view=el('button','textlink','View this piece ↗');view.onclick=()=>openPiece(items[0]);description.append(view);rail.append(description,track);}
  else {rail.append(head,track);}
  one('#range-rails').append(rail);
}
const looks=pieces.length?Array.from({length:Math.min(8,pieces.length)},(_,i)=>pieces[Math.floor(i*pieces.length/Math.min(8,pieces.length))]):[];
if(looks.length){
  one('#lookbook').hidden=false;const stage=one('#stage'),ring=one('#ring');let turn=0,drag=null,ignoreClick=false;
  for(const [i,p] of looks.entries()){const tile=el('button','look-tile');tile.append(imageFor(p));tile.setAttribute('aria-label','View '+p.name);tile.onclick=()=>{if(ignoreClick)return;if(current()===i)openPiece(p);else{const offset=(i-current()+looks.length)%looks.length;turn+=offset>looks.length/2?offset-looks.length:offset;paint();}};ring.append(tile);}
  function current(){return ((Math.round(turn)%looks.length)+looks.length)%looks.length;}
  function paint(dragging=false){
    const radius=stage.clientWidth < 640 ? stage.clientWidth*.69 : Math.min(stage.clientWidth*.42,520);
    [...ring.children].forEach((node,i)=>{const angle=(i-turn)*2*Math.PI/looks.length,cos=Math.cos(angle);node.style.transition=dragging||document.documentElement.classList.contains('reduced')?'none':'transform .55s cubic-bezier(.2,.7,.2,1), opacity .55s';node.style.transform='translate(-50%,-50%) translate3d('+Math.sin(angle)*radius+'px,0,'+((cos-1)*radius*.6)+'px) rotateY('+angle+'rad)';node.style.opacity=Math.max(.25,.56+.44*cos);node.tabIndex=i===current()?0:-1;});
    one('#look-open').textContent=looks[current()].name;
  }
  one('#look-open').onclick=()=>openPiece(looks[current()]);one('#previous').onclick=()=>{turn=Math.round(turn)-1;paint();};one('#next').onclick=()=>{turn=Math.round(turn)+1;paint();};
  stage.addEventListener('dragstart',e=>e.preventDefault());stage.onpointerdown=e=>{drag={x:e.clientX,start:turn};ignoreClick=false;};stage.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>7){ignoreClick=true;stage.setPointerCapture(e.pointerId);turn=drag.start-dx/Math.min(220,stage.clientWidth*.43);paint(true);}};
  function finish(){if(!drag)return;drag=null;turn=Math.round(turn);paint();setTimeout(()=>ignoreClick=false,0);}
  stage.onpointerup=stage.onpointercancel=finish;stage.onpointerleave=e=>{if(drag&&!stage.hasPointerCapture(e.pointerId))finish();};new ResizeObserver(()=>paint(true)).observe(stage);paint();
  const studies=[['Gold border',pieces[0]],['Printed pad',pieces.find(p=>p.id==='DfhS11kmEnP-02')],['Zari pad',pieces.find(p=>p.id==='DfpJqH9GMYd-01')]].filter(([,p])=>p);
  const choices=el('div','detail-choices');one('#detail-caption').before(choices);one('#details').hidden=false;
  function selectStudy(index){const p=studies[index][1];one('#detail-photo').src=p.images[0].src;one('#detail-photo').alt='Enlarged detail of '+p.name;one('#detail-caption').textContent=p.name+'. Open the photograph to examine the weave and border.';one('#detail-open').onclick=()=>openPiece(p,true);[...choices.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  studies.forEach(([label],i)=>{const b=el('button','',label);b.onclick=()=>selectStudy(i);choices.append(b);});selectStudy(0);
  const sourcePiece=pieces.find(p=>p.id==='DfzonKjmInI-10');if(sourcePiece){const artButton=el('button','','View the crimson fabric ↗');artButton.onclick=()=>openPiece(sourcePiece);one('.art-credit').replaceChildren(document.createTextNode('Drape study'),el('i'),artButton);}
}else{all('[data-look-link]').forEach(a=>a.hidden=true);}
const menuToggle=one('#menu-toggle'),mobileMenu=one('#mobile-menu');
function showMenu(open){mobileMenu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'Close':'Menu';}
menuToggle.onclick=()=>showMenu(mobileMenu.hidden);
mobileMenu.addEventListener('click',()=>showMenu(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileMenu.hidden){showMenu(false);menuToggle.focus();}});
renderGrid();

