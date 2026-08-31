const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const clock=()=>{const t=new Date().toLocaleTimeString('pt-BR');$('#clock').textContent=t;$('#vclock').textContent=t};setInterval(clock,1000);clock();

const state={selected:'Sala 01',light:{'Sala 01':true,'Sala 03':false,'Corredor':true},temp:22.5,door:false};
let events=[['19:00:12','Sistema iniciado','ok'],['19:00:18','Todos os módulos online','ok'],['19:01:04','Climatização em operação','ok'],['19:01:29','Sala 01 iluminação ligada','ok']];
function add(text,type='ok'){events.push([new Date().toLocaleTimeString('pt-BR'),text,type]);renderEvents()}
function renderEvents(){$('#events').innerHTML=events.slice(-7).reverse().map(e=>`<div class="event ${e[2]}"><time>${e[0]}</time><b>${e[1]}</b></div>`).join('');$('#count').textContent=String(events.length).padStart(2,'0')}
function details(){
 const n=state.selected,box=$('#details');$('#selected').textContent=n;
 if(n==='Sala 01'||n==='Sala 03'||n==='Corredor'){
   const on=state.light[n];box.innerHTML=`<div class="device-row"><small>ESTADO</small><div class="toggle ${on?'on':''}" id="toggle"></div></div><div class="device-row"><small>CIRCUITO</small><b>IL-${n==='Sala 01'?'01':n==='Sala 03'?'03':'05'}</b></div><div class="device-row"><small>POTÊNCIA</small><b>${on?'420 W':'0 W'}</b></div>`;
 } else if(n==='Sala 02'){
   box.innerHTML=`<div class="device-row"><small>ESTADO</small><div class="toggle on" id="toggle"></div></div><div class="control"><small>TEMPERATURA</small><div class="temp"><button id="minus">−</button><b>${state.temp.toFixed(1)}°</b><button id="plus">+</button></div></div><div class="device-row"><small>CONSUMO</small><b>3.8 kW</b></div>`;
 } else if(n==='Sala Técnica'){
   box.innerHTML=`<div class="device-row"><small>ESTADO</small><b style="color:#00c7a4">MONITORADO</b></div><div class="device-row"><small>CARGA ATUAL</small><b>3.8 kW</b></div><div class="device-row"><small>TENSÃO</small><b>220 V</b></div>`;
 } else {
   box.innerHTML=`<div class="device-row"><small>ESTADO</small><b>${state.door?'ABERTA':'FECHADA'}</b></div><div class="device-row"><small>SENSOR</small><b>MAGNÉTICO</b></div>`;
 }
 const t=$('#toggle');if(t)t.onclick=()=>{if(n==='Sala 02')return;state.light[n]=!state.light[n];updatePlant();details();add(`${n}: ${state.light[n]?'ligado':'desligado'}`)};
 if($('#minus'))$('#minus').onclick=()=>{state.temp=Math.max(16,state.temp-.5);details();updatePlant();add(`Sala 02: temperatura ${state.temp.toFixed(1)}°C`)};
 if($('#plus'))$('#plus').onclick=()=>{state.temp=Math.min(30,state.temp+.5);details();updatePlant();add(`Sala 02: temperatura ${state.temp.toFixed(1)}°C`)};
}
function updatePlant(){ $$('.room').forEach(r=>{const n=r.dataset.name;if(state.light[n]!==undefined)r.querySelector('.state').classList.toggle('on',state.light[n]);if(n==='Sala 02')r.querySelector('strong').textContent=state.temp.toFixed(1)+'°C';if(n==='Acesso')r.querySelector('strong').textContent=state.door?'ABERTA':'FECHADA'})}
$$('.room').forEach(r=>r.onclick=()=>{$$('.room').forEach(x=>x.classList.remove('selected'));r.classList.add('selected');state.selected=r.dataset.name;details()});
$$('.floor').forEach(b=>b.onclick=()=>{$$('.floor').forEach(x=>x.classList.remove('active'));b.classList.add('active');add('Pavimento selecionado: '+b.textContent)});
$('#scene').onclick=()=>{state.light['Sala 01']=true;state.light['Sala 03']=true;state.light['Corredor']=true;updatePlant();details();add('Cena CONFORTO ativada')};
$('#fault').onclick=()=>{state.selected='Sala 02';$$('.room').forEach(x=>x.classList.toggle('selected',x.dataset.name==='Sala 02'));details();add('ALERTA: AR 02 desempenho insuficiente','warn');setTimeout(()=>add('KRONIX: equipamento reserva acionado'),1000)};
$('#restore').onclick=()=>{state.light['Sala 01']=true;state.light['Sala 03']=false;state.light['Corredor']=true;state.temp=22.5;updatePlant();details();add('Sistema restaurado')};
renderEvents();$('.room').classList.add('selected');details();

let vehicleSpeed=85, vEvents=[['19:00:21','Veículo conectado','ok'],['19:01:02','Telemetria recebida','ok'],['19:01:44','Parâmetros normais','ok']];
function vEvent(text,type='ok'){vEvents.push([new Date().toLocaleTimeString('pt-BR'),text,type]);$('#vevents').innerHTML=vEvents.slice(-6).reverse().map(e=>`<div class="event ${e[2]}"><time>${e[0]}</time><b>${e[1]}</b></div>`).join('');$('#veCount').textContent=String(vEvents.length).padStart(2,'0')}
function updateVehicle(){
  vehicleSpeed=+$('#speed').value;
  const rpm=Math.max(.7,vehicleSpeed/40);
  const temp=Math.round(78+vehicleSpeed*.165);
  const range=Math.max(60,302-Math.round(vehicleSpeed*.35));
  $('#vSpeed').textContent=vehicleSpeed;
  $('#speedVal').textContent=vehicleSpeed;
  $('#rpm').textContent=rpm.toFixed(1)+' x1000';
  $('#temp').textContent=temp+' °C';
  $('#range').textContent=range+' km';
  $('#speedGauge').textContent=vehicleSpeed;
  $('#rpmGauge').textContent=rpm.toFixed(1);
  const sp=Math.min(330,Math.round((vehicleSpeed/140)*330));
  const rp=Math.min(330,Math.round((rpm/3.5)*330));
  $('.speed-progress').style.strokeDasharray=sp+' 440';
  $('.rpm-progress').style.strokeDasharray=rp+' 440';
  $('#speedNeedle').style.transform='rotate('+(vehicleSpeed/140*270-135)+'deg)';
  $('#rpmNeedle').style.transform='rotate('+(rpm/3.5*270-135)+'deg)';
}
$('#speed').oninput=updateVehicle;$('#slower').onclick=()=>{$('#speed').value=Math.max(0,vehicleSpeed-10);updateVehicle();vEvent('Velocidade reduzida')};$('#faster').onclick=()=>{$('#speed').value=Math.min(140,vehicleSpeed+10);updateVehicle();vEvent('Velocidade aumentada')};
$$('.hotspot').forEach(b=>b.onclick=()=>vEvent('Painel: '+b.dataset.target+' selecionado'));
$('#vehicleFault').onclick=()=>{$('#vStatus').textContent='⚠ TEMPERATURA ELEVADA';$('#temp').textContent='108 °C';document.getElementById('alertMetric').textContent='1';vEvent('ALERTA: temperatura do motor elevada','warn');setTimeout(()=>vEvent('KRONIX: condição registrada'),900)};
$('#vehicleReset').onclick=()=>{$('#vStatus').textContent='OPERAÇÃO NORMAL';$('#speed').value=85;updateVehicle();document.getElementById('alertMetric').textContent='0';vEvent('Sistema restaurado')};
vEvent('Demonstração veicular pronta');

$$('.experience-tab').forEach(b=>b.onclick=()=>{ $$('.experience-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#buildingView').classList.toggle('active',b.dataset.mode==='building');$('#vehicleView').classList.toggle('active',b.dataset.mode==='vehicle')});

function syncHud(){const r=document.getElementById('rpm'),t=document.getElementById('temp');if(r&&document.getElementById('gRpm'))document.getElementById('gRpm').textContent=r.textContent.replace(' x1000','');if(t&&document.getElementById('gTemp'))document.getElementById('gTemp').textContent=t.textContent.replace(' °C','')}
const oldUpdateVehicle=window.updateVehicle; // existing function remains authoritative
setInterval(syncHud,300);

updateVehicle();

/* V4 — sistema de missões */
const missions=[
 {title:'MISSÃO 01 • EXPLORE O SISTEMA',text:'Clique em um ambiente e descubra como o Kronix responde.',mode:'building',goal:'click'},
 {title:'MISSÃO 02 • CONTROLE DE ILUMINAÇÃO',text:'Selecione uma sala e altere o estado da iluminação.',mode:'building',goal:'light'},
 {title:'MISSÃO 03 • RECUPERE A CLIMATIZAÇÃO',text:'Simule uma falha e observe a resposta do Kronix.',mode:'building',goal:'fault'},
 {title:'MISSÃO 04 • PILOTE A TELEMETRIA',text:'Entre no Veicular e altere a velocidade do veículo.',mode:'vehicle',goal:'drive'},
 {title:'MISSÃO 05 • DETECTE UMA ANOMALIA',text:'Provoque uma condição de temperatura elevada.',mode:'vehicle',goal:'vehiclefault'}
];
let missionIndex=0, missionDone=false, missionStart=0;
function missionRender(){
 const m=missions[missionIndex];
 $('#missionTitle').textContent=m.title;$('#missionText').textContent=m.text;
 $('#missionProgress').style.width=((missionIndex+1)/missions.length*100)+'%';
 missionDone=false;missionStart=Date.now();
}
function completeMission(title,text){
 if(missionDone)return; missionDone=true;
 $('#toastTitle').textContent=title;$('#toastText').textContent=text;
 $('#missionToast').classList.add('show');$('#missionShade').classList.add('show');
 add && add('Missão concluída: '+missions[missionIndex].title);
}
$('#missionNext').onclick=()=>{
 missionIndex=(missionIndex+1)%missions.length;missionRender();
 const m=missions[missionIndex];
 $$('.experience-tab').forEach(x=>x.classList.toggle('active',x.dataset.mode===m.mode));
 $('#buildingView').classList.toggle('active',m.mode==='building');$('#vehicleView').classList.toggle('active',m.mode==='vehicle');
};
$('#toastClose').onclick=()=>{$('#missionToast').classList.remove('show');$('#missionShade').classList.remove('show')};

$$('.room').forEach(r=>r.addEventListener('click',()=>{if(missions[missionIndex].goal==='click')completeMission('Sistema explorado.','Você encontrou um ponto de controle do Kronix e abriu seus dados de operação.')}));
$('#scene').addEventListener('click',()=>{if(missions[missionIndex].goal==='light')completeMission('Iluminação sob controle.','Uma única ação pode alterar vários circuitos através de uma cena.')});
$('#fault').addEventListener('click',()=>{if(missions[missionIndex].goal==='fault')completeMission('Falha identificada.','O Kronix detectou a condição e registrou a ocorrência na supervisão.')});
$('#speed').addEventListener('input',()=>{if(missions[missionIndex].goal==='drive' && Math.abs(+$('#speed').value-85)>8)completeMission('Telemetria em movimento.','Velocidade, RPM, temperatura e autonomia responderam juntos.')});
$('#vehicleFault').addEventListener('click',()=>{if(missions[missionIndex].goal==='vehiclefault')completeMission('Anomalia detectada.','O evento foi identificado e registrado pelo Kronix Veicular.')});
missionRender();

/* V5 — progresso do operador e encerramento da experiência */
let operatorXP=0, completedSet=new Set();
function awardMission(){
 const key=missions[missionIndex].goal;
 if(completedSet.has(key)) return;
 completedSet.add(key); operatorXP+=100;
 $('#score').textContent=operatorXP;
}
const oldCompleteMission=completeMission;
completeMission=function(title,text){awardMission();oldCompleteMission(title,text)};
const oldNext=$('#missionNext').onclick;
$('#missionNext').onclick=function(){
 if(missionIndex===missions.length-1 && completedSet.size>=missions.length-1){showFinal();}
 else oldNext();
};
function showFinal(){
 $('#finalScore').textContent=operatorXP;
 $('#finalPanel').classList.add('show');$('#finalShade').classList.add('show');
}
$('#replay').onclick=()=>{
 $('#finalPanel').classList.remove('show');$('#finalShade').classList.remove('show');
 missionIndex=0;operatorXP=0;completedSet.clear();$('#score').textContent='0';missionRender();
 $$('.experience-tab').forEach(x=>x.classList.toggle('active',x.dataset.mode==='building'));
 $('#buildingView').classList.add('active');$('#vehicleView').classList.remove('active');
};

(function(){
 const hash=location.hash;
 if(hash==='#vehicleView'){
   setTimeout(()=>{const b=document.querySelector('.experience-tab[data-mode="vehicle"]');if(b)b.click()},50);
 }
})();

/* Correção definitiva do modo inicial */
function openKronixModeFromHash(){
  if(location.hash === '#vehicleView'){
    const tab=document.querySelector('.experience-tab[data-mode="vehicle"]');
    const b=document.getElementById('buildingView'), v=document.getElementById('vehicleView');
    if(tab) document.querySelectorAll('.experience-tab').forEach(x=>x.classList.remove('active'));
    if(tab) tab.classList.add('active');
    if(b) b.classList.remove('active');
    if(v) v.classList.add('active');
  } else {
    const tab=document.querySelector('.experience-tab[data-mode="building"]');
    if(tab) document.querySelectorAll('.experience-tab').forEach(x=>x.classList.toggle('active',x===tab));
    document.getElementById('buildingView')?.classList.add('active');
    document.getElementById('vehicleView')?.classList.remove('active');
  }
}
window.addEventListener('DOMContentLoaded',openKronixModeFromHash);
window.addEventListener('hashchange',openKronixModeFromHash);
