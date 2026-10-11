'use strict';
/* Tamoio Pet Shop — progressive enhancement; no collection of personal data */
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const PHONE='5511976399068';
const ADDRESS='Rua Jardim Tamoio, 560, Conjunto Residencial José Bonifácio, São Paulo, SP, 08255-010';
const DEST={lat:-23.55396,lng:-46.43595}; /* CEP-level approximation, not door number */
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const mobileWidth=matchMedia('(max-width: 700px)');
const whats=(message)=>'https://wa.me/'+PHONE+'?text='+encodeURIComponent(message);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let toastTimer;
function toast(msg){
  const el=$('#toast');if(!el)return;el.textContent=msg;
  el.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),3200);
}
const year=$('#year');if(year)year.textContent=String(new Date().getFullYear());
const menuToggle=$('#menuToggle'),mobileNav=$('#mobileNav');
function setMenu(open){
  if(!menuToggle||!mobileNav)return;
  menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  menuToggle.innerHTML=open?'<svg><use href="#i-x"/></svg>':'<svg><use href="#i-menu"/></svg>';
  mobileNav.hidden=!open;
  document.body.classList.toggle('menu-open',open);
}
menuToggle?.addEventListener('click',()=>setMenu(menuNavHidden()));
function menuNavHidden(){return mobileNav?.hidden??true;}
$$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);closeChat();}});
window.addEventListener('resize',()=>{if(innerWidth>950 && !menuNavHidden())setMenu(false)},{passive:true});
document.addEventListener('click',e=>{
 if(!mobileNav?.hidden && !e.composedPath().includes(mobileNav) && !e.composedPath().includes(menuToggle))setMenu(false);
});
/* In-view entrance — immediately render all elements without IntersectionObserver */
if('IntersectionObserver' in window && !reducedMotion.matches){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});
  },{threshold:.08,rootMargin:'0px 0px -16px 0px'});
  $$('.reveal').forEach(el=>io.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('visible'));
/* Active navigation: location headings, no extra work on every scroll */
if('IntersectionObserver' in window){
  const navLinks=$$('.desktop-nav a');
  const navSections=['inicio','servicos','sobre','avaliacoes','localizacao','faq'].map(id=>document.getElementById(id)).filter(Boolean);
  const spy=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));
      }
    });
  },{rootMargin:'-24% 0px -65% 0px',threshold:0});
  navSections.forEach(section=>spy.observe(section));
}
/* Native smooth horizontal carousel: keyboard, arrows, swipe and pause */
const slider=$('#serviceSlider');
const sliderCards=slider?$$('.service-card',slider):[];
const prev=$('#servicesPrev'),next=$('#servicesNext'),pause=$('#servicesPause'),dots=$('#serviceDots');
let sliderIndex=0,sliderStopped=false,sliderInView=true,sliderTimer;
function maxIndex(){
  if(!slider)return 0;
  const span=sliderCards[1]?sliderCards[1].offsetLeft-sliderCards[0].offsetLeft:0;
  return span?Math.max(0,Math.ceil((slider.scrollWidth-slider.clientWidth)/span)):0;
}
function setIndex(i,{animate=true}={}){
  if(!slider||!sliderCards.length)return;
  sliderIndex=Math.max(0,Math.min(maxIndex(),i));
  let target=sliderCards[sliderIndex];
  slider.scrollTo({left:target?.offsetLeft-sliderCards[0].offsetLeft||0,behavior:animate&&!reducedMotion.matches?'smooth':'instant'});
  renderDots();
}
function renderDots(){
  if(!dots)return;
  const count=maxIndex()+1;
  if(dots.children.length!==count){
    dots.replaceChildren();
    for(let i=0;i<count;i++){
      const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Ir ao conjunto de serviços '+(i+1));b.addEventListener('click',()=>setIndex(i));dots.append(b);
    }
  }
  [...dots.children].forEach((d,i)=>d.setAttribute('aria-current',String(i===sliderIndex)));
}
prev?.addEventListener('click',()=>setIndex(sliderIndex<=0?maxIndex():sliderIndex-1));
next?.addEventListener('click',()=>setIndex(sliderIndex>=maxIndex()?0:sliderIndex+1));
pause?.addEventListener('click',()=>{
 sliderStopped=!sliderStopped;pause.setAttribute('aria-pressed',String(sliderStopped));
 pause.textContent=sliderStopped?'▶':'Ⅱ';
 pause.setAttribute('aria-label',sliderStopped?'Retomar carrossel':'Pausar carrossel');
});
slider?.addEventListener('keydown',e=>{
 if(e.key==='ArrowRight'){e.preventDefault();setIndex(sliderIndex+1);}
 if(e.key==='ArrowLeft'){e.preventDefault();setIndex(sliderIndex-1);}
});
slider?.addEventListener('scroll',()=>{
 const span=sliderCards[1]?sliderCards[1].offsetLeft-sliderCards[0].offsetLeft:0;
 if(span){sliderIndex=Math.min(maxIndex(),Math.max(0,Math.round(slider.scrollLeft/span)));renderDots();}
},{passive:true});
let interacting=false;
slider?.addEventListener('pointerenter',()=>interacting=true);
slider?.addEventListener('pointerleave',()=>interacting=false);
slider?.addEventListener('focusin',()=>interacting=true);
slider?.addEventListener('focusout',e=>{if(!slider.contains(e.relatedTarget))interacting=false;});
if(slider && 'IntersectionObserver' in window)new IntersectionObserver(es=>{sliderInView=!!es[0]?.isIntersecting;},{threshold:.15}).observe(slider);
sliderTimer=setInterval(()=>{
 if(!slider||sliderStopped||interacting||reducedMotion.matches||!sliderInView||document.hidden)return;
 const max=maxIndex();if(max>0)setIndex(sliderIndex>=max?0:sliderIndex+1);
},5300);
window.addEventListener('resize',()=>{sliderIndex=Math.min(sliderIndex,maxIndex());renderDots();},{passive:true});
renderDots();
/* Share */
async function shareBusiness(){
 const data={title:'Tamoio Pet Shop',text:'Conheça os serviços do Tamoio Pet Shop em Itaquera 🐾',url:location.href};
 try{
  if(navigator.share){await navigator.share(data);return;}
  if(navigator.clipboard){await navigator.clipboard.writeText(location.href);toast('Link copiado!');return;}
  window.prompt('Copie o endereço do site:',location.href);
 }catch(e){if(e.name!=='AbortError')toast('Não foi possível compartilhar.');}
}
$('#shareBusiness')?.addEventListener('click',shareBusiness);
$('#footerShare')?.addEventListener('click',shareBusiness);
/* Mobile dock appears ONLY after the hero exits the top of the viewport.
   Chat modal wins, and input/keyboard focus never competes with the dock. */
const dock=$('#mobileDock'),hero=$('#inicio'),chatPanel=$('#chatPanel');
let rafPending=false;
function syncDock(){
 rafPending=false;
 if(!dock||!hero)return;
 const heroBottom=hero.getBoundingClientRect().bottom;
 const editing=!!document.activeElement?.closest('input,textarea,select,[contenteditable="true"]');
 const visible=mobileWidth.matches && heroBottom<65 && window.scrollY>230 && !editing && chatPanel?.hidden!==false;
 dock.hidden=!visible;
 document.body.classList.toggle('has-dock',visible);
}
function requestDock(){if(rafPending)return;rafPending=true;requestAnimationFrame(syncDock);}
window.addEventListener('scroll',requestDock,{passive:true});
window.addEventListener('resize',requestDock,{passive:true});
document.addEventListener('focusin',requestDock);
document.addEventListener('focusout',requestDock);
window.addEventListener('pageshow',requestDock);
requestDock();
/* Local, rule-based quick chat. Never pretends to be a human or hosted AI. */
const chatLaunch=$('#chatLaunch'),chatClose=$('#chatClose'),chatMessages=$('#chatMessages'),chatInput=$('#chatInput'),chatForm=$('#chatForm'),chatHuman=$('#chatHuman');
function openChat(){
 if(!chatPanel)return;
 chatPanel.hidden=false;chatLaunch?.setAttribute('aria-expanded','true');
 requestDock();setTimeout(()=>chatInput?.focus(),30);
}
function closeChat(){
 if(!chatPanel||chatPanel.hidden)return;
 chatPanel.hidden=true;chatLaunch?.setAttribute('aria-expanded','false');
 chatLaunch?.focus();requestDock();
}
chatLaunch?.addEventListener('click',()=>chatPanel?.hidden?openChat():closeChat());
chatClose?.addEventListener('click',closeChat);
const answers=[
 {words:['banho','tosa','estetica','pelo','higiene'],value:'O Tamoio oferece banho e tosa. Para consultar valores, porte do animal, disponibilidade e agendamento, fale com a equipe pelo WhatsApp.'},
 {words:['hospedagem','hotel','dormir','pernoite','viagem'],value:'A hospedagem é um dos serviços divulgados. Consulte vagas, regras, alimentação e período desejado diretamente com o Tamoio.'},
 {words:['creche','day care','daycare','dia','brincar'],value:'O Tamoio divulga creche / day care. Informe idade, porte e sua necessidade pelo WhatsApp para receber orientações.'},
 {words:['taxi','transporte','buscar','levar','carro'],value:'O Táxi Pet é um serviço divulgado pela empresa. Consulte disponibilidade, área atendida e valores por WhatsApp.'},
 {words:['endereco','localizacao','onde fica','como chegar','mapa','rua'],value:'Estamos na Rua Jardim Tamoio, 560 — Conj. Res. José Bonifácio, São Paulo/SP, CEP 08255-010. Use a seção Como chegar para abrir a rota.'},
 {words:['horario','aberto','fecha','funcionamento','sabado','domingo'],value:'Ainda não temos os horários oficiais confirmados para esta demonstração. Consulte o funcionamento diretamente pelo WhatsApp antes de ir.'},
 {words:['valor','preco','quanto custa','orcamento','pagamento','pix','cartao'],value:'Os valores e meios de pagamento dependem de confirmação com a equipe. Informe o serviço e o porte do pet pelo WhatsApp para solicitar orçamento.'},
 {words:['veterinario','vacina','emergencia','clinica'],value:'Não há confirmação de serviço veterinário nesta apresentação. Para uma necessidade de saúde, procure atendimento veterinário qualificado; a equipe pode confirmar quais serviços oferece.'},
 {words:['instagram','facebook','rede'],value:'O Instagram divulgado é @tamoiopetshop. Você também encontra links oficiais na página linktr.ee/tamoiopet.'},
];
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function answer(text){
 const q=normalize(text);
 const item=answers.find(a=>a.words.some(w=>q.includes(normalize(w))));
 return item?item.value:'Posso ajudar com os serviços, endereço, horários ou valores. Para orientações específicas, clique em “Continuar com uma pessoa no WhatsApp”.';
}
function addBubble(text,who){
 const el=document.createElement('p');el.className='chat-bubble '+who;el.textContent=text;chatMessages?.append(el);
 if(chatMessages)chatMessages.scrollTop=chatMessages.scrollHeight;
}
function chatAsk(question){
 const q=String(question||'').trim().slice(0,240);
 if(!q)return;
 addBubble(q,'user');addBubble(answer(q),'bot');
 if(chatHuman)chatHuman.href=whats('Olá! Vim pelo site do Tamoio Pet Shop e gostaria de falar com a equipe sobre: '+q);
}
$$('[data-intent]').forEach(btn=>btn.addEventListener('click',()=>chatAsk(btn.textContent)));
chatForm?.addEventListener('submit',e=>{
 e.preventDefault();const value=chatInput.value;chatInput.value='';chatAsk(value);chatInput.focus();
});
/* Real routing: route API only for car profile.
   Walking/cycling open authoritative map directions instead of inventing an ETA. */
let map,marker,routeLine,originMarker,originCoords,transport='driving';
let directionsLink='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(ADDRESS)+'&travelmode=driving';
const status=$('#routeStatus'),originInput=$('#routeOrigin'),routeAction=$('#calculateRoute'),routeExternal=$('.route-link');
function setStatus(text){if(status)status.textContent=text;}
function updateMapLink(){
 let s='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(ADDRESS)+'&travelmode='+transport;
 if(originCoords)s+='&origin='+encodeURIComponent(originCoords.lat+','+originCoords.lng);
 else if(originInput?.value.trim())s+='&origin='+encodeURIComponent(originInput.value.trim());
 directionsLink=s;
 if(routeExternal)routeExternal.href=s;
 if($('#googleRouteTop'))$('#googleRouteTop').href=s;
}
function initMap(){
 const el=$('#tamoioMap');if(!el)return;
 if(!window.L){
   el.innerHTML='<div style="padding:55px 25px;text-align:center;color:#143d65;background:#e5f3ff;height:100%"><p>Mapa indisponível neste momento.</p><a target="_blank" rel="noopener noreferrer" href="'+directionsLink+'">Abrir Google Maps ↗</a></div>';return;
 }
 map=L.map(el,{scrollWheelZoom:false,zoomControl:true}).setView([DEST.lat,DEST.lng],15);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',maxZoom:19}).addTo(map);
 const pin=L.divIcon({className:'pet-map-pin',html:'🐾',iconSize:[36,36],iconAnchor:[18,18]});
 marker=L.marker([DEST.lat,DEST.lng],{icon:pin}).addTo(map).bindPopup('<strong>Tamoio Pet Shop</strong><br>Rua Jardim Tamoio, 560<br><small>Marcador aproximado pelo CEP.</small>');
 setTimeout(()=>map.invalidateSize(),300);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap,{once:true});
else initMap();
let geolocationBusy=false;
function useCurrentLocation(){
 if(!navigator.geolocation){setStatus('Este navegador não disponibiliza localização. Digite sua origem ou abra o Google Maps.');return;}
 if(geolocationBusy)return;
 geolocationBusy=true;setStatus('Solicitando permissão de localização...');
 navigator.geolocation.getCurrentPosition(pos=>{
  geolocationBusy=false;
  originCoords={lat:pos.coords.latitude,lng:pos.coords.longitude};
  if(originInput)originInput.value='Minha localização atual';
  if(map){
   if(originMarker)map.removeLayer(originMarker);
   originMarker=L.circleMarker([originCoords.lat,originCoords.lng],{radius:8,color:'#006ab6',weight:3,fillColor:'#8dd8ff',fillOpacity:.95}).addTo(map).bindPopup('Sua localização aproximada');
   map.fitBounds([[DEST.lat,DEST.lng],[originCoords.lat,originCoords.lng]],{padding:[42,42],maxZoom:15});
  }
  updateMapLink();setStatus('Localização recebida. Agora você pode calcular a rota de carro.');
 },err=>{
  geolocationBusy=false;
  const msg=err.code===1?'Permissão negada.':'Localização indisponível.';
  setStatus(msg+' Digite um endereço ou abra a rota no Google Maps.');
 },{enableHighAccuracy:false,timeout:11000,maximumAge:60000});
}
$('#useLocation')?.addEventListener('click',useCurrentLocation);
originInput?.addEventListener('input',()=>{originCoords=null;updateMapLink();});
$$('[data-route-mode]').forEach(btn=>btn.addEventListener('click',()=>{
 transport=btn.dataset.routeMode;
 $$('[data-route-mode]').forEach(b=>{let active=b===btn;b.classList.toggle('mode-active',active);b.setAttribute('aria-pressed',String(active));});
 updateMapLink();
 if(transport!=='driving')setStatus('Para '+(transport==='walking'?'caminhada':'bicicleta')+', abra as direções no Google Maps; não exibiremos tempos não verificados.');
 else setStatus('Rota de carro selecionada. Use sua localização ou informe um endereço.');
}));
function withTimeout(url,ms=10000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
 return fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error('Serviço indisponível');return r.json();}).finally(()=>clearTimeout(timer));
}
async function geocodeOrigin(query){
 const q=encodeURIComponent(query);
 const url='https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q='+q;
 const data=await withTimeout(url,8500);
 if(!Array.isArray(data)||!data[0])throw Error('Endereço não encontrado');
 return {lat:Number(data[0].lat),lng:Number(data[0].lon)};
}
async function calculateRoute(){
 updateMapLink();
 if(transport!=='driving'){
  setStatus('Abrindo o Google Maps para direções de '+(transport==='walking'?'caminhada':'bicicleta')+'.');
  window.open(directionsLink,'_blank','noopener,noreferrer');return;
 }
 if(!originCoords&&!originInput?.value.trim()){
  setStatus('Informe um ponto de partida ou toque em “Usar minha localização”.');originInput?.focus();return;
 }
 routeAction.disabled=true;routeAction.textContent='Calculando percurso…';
 try{
  const start=originCoords || await geocodeOrigin(originInput.value.trim()+', São Paulo, Brasil');
  originCoords=start;
  updateMapLink();
  const url='https://router.project-osrm.org/route/v1/driving/'+start.lng+','+start.lat+';'+DEST.lng+','+DEST.lat+'?overview=full&geometries=geojson&steps=false';
  const data=await withTimeout(url,13000);
  if(data.code!=='Ok'||!data.routes?.[0]?.geometry)throw Error('Sem rota disponível');
  const route=data.routes[0];
  if(map){
    if(routeLine)map.removeLayer(routeLine);
    if(originMarker)map.removeLayer(originMarker);
    originMarker=L.circleMarker([start.lat,start.lng],{radius:8,color:'#0b80be',weight:3,fillColor:'#bfe9ff',fillOpacity:1}).addTo(map);
    routeLine=L.geoJSON(route.geometry,{style:{color:'#ffc600',weight:6,opacity:.94}}).addTo(map);
    map.fitBounds(routeLine.getBounds(),{padding:[30,30]});
  }
  const km=(route.distance/1000).toLocaleString('pt-BR',{maximumFractionDigits:1});
  const minutes=Math.max(1,Math.round(route.duration/60));
  setStatus('Rota estimada: '+km+' km e cerca de '+minutes+' min de carro, sem trânsito em tempo real. Confirme no Google Maps.');
 }catch(err){setStatus('Não foi possível calcular a rota aqui. Use “Ver rotas no Google Maps” para continuar.');}
 finally{routeAction.disabled=false;routeAction.innerHTML='Calcular rota <svg><use href="#i-arrow"/></svg>';}
}
routeAction?.addEventListener('click',calculateRoute);
updateMapLink();
/* Lazy map resize when scrolled into viewport */
if(map && 'IntersectionObserver' in window){
 new IntersectionObserver(es=>{if(es[0].isIntersecting)map.invalidateSize();},{threshold:.1}).observe($('#tamoioMap'));
}
