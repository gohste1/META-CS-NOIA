/* nucleo.js · lógica do site (perfis, mapas, desenho, timing, replay, demos). Só correções. */
/* ===== Extras: Timing a partir de Default/Call/Fixo/Demo, jogadores X, escolha dentro de escolha, Comparação, Timing para todos ===== */
var SPD2=215;
/* pontos fixos por mapa (posição no radar 0-1000): spawn TR, spawn CT, bomb A, bomb B. Ajuste em Demo 2D > Marcar pontos fixos */
var FIXREF={dust2:{t:[351,857],ct:[592,250],a:[757,211],b:[242,182]},mirage:{t:[269,688],ct:[879,350],a:[531,765],b:[210,273]},inferno:{t:[116,659],ct:[871,364],a:[788,685],b:[481,245]},ancient:{t:[498,910],ct:[521,116],a:[293,239],b:[791,406]},anubis:{t:[470,930],ct:[420,215],a:[750,250],b:[325,500]},cache:{t:[83,430],ct:[916,564],a:[315,238],b:[352,810]},nuke:{t:[162,540],ct:[892,459]}};
var FV={pct:0,auto:true,ff:-1,iso:true};
function fvLw(){return FV.auto&&FV.ff>=0?(FV.ff===0?1:0):FV.pct/100}
function fvOp(f){var lw=fvLw(),w=f===0?lw:f===1?1-lw:1,mn=FV.iso?0:.15;return+(mn+(1-mn)*w).toFixed(2)}
function fvOps(){var lw=fvLw(),mn=FV.iso?0:.15;return[+(mn+(1-mn)*(1-lw)).toFixed(2),+(mn+(1-mn)*lw).toFixed(2)]}
function bgF(m){if(hasFl(m)&&FLOOR<2){var mn=FV.iso?0:.25;return bg(m,FLOOR===1?1:mn,FLOOR===0?1:mn)}return bg(m)}
function hasFl(m){return!!RADARS_L[(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,"")]}
function fvImg(m,ff){FV.ff=ff;var rd=radarOf(m);if(!rd)return"";if(!hasFl(m))return'<image href="'+rd+'" x="0" y="0" width="1000" height="1000"/>';var o=fvOps();return bg(m,o[0],o[1])}
function d2Bg(m){var f=D2.data&&D2.data.rounds&&D2.data.rounds[D2.r];FV.ff=f&&hasFl(m)?d2focus(m,f,D2.t):-1;var o=fvOps();return bg(m,o[0],o[1])}
function fvBadge(p,f){var c=f===0?"#f59e0b":"#22d3ee";return'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="24" fill="none" stroke="'+c+'" stroke-width="4" stroke-dasharray="6 4" pointer-events="none"/><text x="'+p[0]+'" y="'+(p[1]+42)+'" font-size="15" font-weight="800" text-anchor="middle" fill="'+c+'" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+(f===0?"↓ LOWER":"↑ UPPER")+"</text>"}
function zonesOn(m){return(m.zn||[]).some(function(z){return z.p&&z.p.length>2})}
function tsec(v){v=String(v).trim();if(/^\d+:\d+(\.\d+)?$/.test(v)){var q=v.split(":");return+q[0]*60+ +q[1]}return parseFloat(v)||0}
function fcAt(fc,t){if(!fc||!fc.length)return null;var f=1;fc.slice().sort(function(a,b){return a.t-b.t}).forEach(function(x){if(t>=x.t)f=x.f});return f}
/* editor de mudanças de andar: host[key] = [{t:segundos,f:0|1}], sempre começa no Upper */
function fcEd(host,key,label,cb){var w=el("div",{class:"row"}),sp=el("span");sp.textContent=label+" · começa no Upper";sp.style.minWidth="150px";w.appendChild(sp);
 function dr(){w.querySelectorAll(".fcr").forEach(function(x){x.remove()});(host[key]||[]).forEach(function(c,i){var r=el("span",{class:"fcr"}),ti=el("input",{type:"text",value:fmtSec(c.t),placeholder:"0:12"}),se=el("select");ti.style.width="64px";ti.title="Tempo da mudança (segundos ou m:ss)";
   [[0,"vai pro Lower"],[1,"vai pro Upper"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(c.f===o[0])op.selected=true;se.appendChild(op)});
   ti.onchange=function(){c.t=tsec(ti.value);cb()};se.onchange=function(){c.f=+se.value;cb()};
   var x=el("button",{class:"b danger",type:"button"});x.textContent="X";x.onclick=function(){host[key].splice(i,1);cb();dr()};r.appendChild(document.createTextNode(" aos "));r.appendChild(ti);r.appendChild(se);r.appendChild(x);w.appendChild(r)})}
 var ad=el("button",{class:"b edt",type:"button"});ad.textContent="+ Mudança de andar";ad.onclick=function(){host[key]=host[key]||[];var l=host[key][host[key].length-1];host[key].push({t:l?l.t+5:5,f:l&&l.f===0?1:0});cb();dr()};w.appendChild(ad);dr();return w}
function fmtSec(t){t=+t||0;return t>=60?Math.floor(t/60)+":"+("0"+(t%60).toFixed(0)).slice(-2):String(t)}
function fcPanel(m,d){var w=el("div",{class:"uc edt"}),h=el("strong");h.textContent="Andar dos jogadores (upper/lower)";w.appendChild(h);
 var hp=el("p",{class:"hint"});hp.textContent="Todo jogador começa no Upper. Se ele desce ou sobe, marque o tempo da mudança. Sem isso o replay usa as zonas, se existirem.";w.appendChild(hp);
 d.fc=d.fc||{};d.players.forEach(function(p,i){w.appendChild(fcEd(d.fc,i,pname(i),function(){save()}))});return w}
function fvCtl(m,cb,onlyIso){var o=el("span"),i=el("input",{type:"checkbox"}),l3=el("label",{class:"sl"});i.style.width="auto";i.checked=FV.iso;i.onchange=function(){FV.iso=i.checked;cb()};
 l3.appendChild(i);l3.appendChild(document.createTextNode(" Esconder o outro andar"));l3.title="Ligado: só o andar escolhido aparece. Desligado: o outro fica fraquinho de fundo.";
 if(!onlyIso){var w=el("label",{class:"sl"}),r=el("input",{type:"range",min:0,max:100,value:FV.pct,title:"Esquerda: Upper. Direita: Lower"}),v=el("span"),bt=el("span");r.style.width="130px";
  function t(){var lw=Math.round(fvLw()*100);v.textContent=" Lower "+lw+"% · Upper "+(100-lw)+"%"}
  function dr(){bt.innerHTML="";[["Só Upper",function(){FV.auto=false;FV.pct=0},!FV.auto&&FV.pct===0],["Só Lower",function(){FV.auto=false;FV.pct=100},!FV.auto&&FV.pct===100],["Seguir o jogador",function(){FV.auto=true},FV.auto]].forEach(function(k){var b=el("button",{class:"tool",type:"button","aria-pressed":k[2]});b.textContent=k[0];if(k[0]==="Seguir o jogador")b.title="Escolha o jogador em 'Foco do andar'; o andar dele vira o principal";b.onclick=function(){k[1]();FV.iso=true;i.checked=true;r.value=FV.pct;t();dr();cb()};bt.appendChild(b)})}
  r.oninput=function(){FV.pct=+r.value;FV.auto=false;t();dr();cb()};
  w.appendChild(document.createTextNode("Andar: Upper "));w.appendChild(r);w.appendChild(document.createTextNode(" Lower"));w.appendChild(v);o.appendChild(bt);o.appendChild(w);t();dr()}
 o.appendChild(l3);return o}
var UPIE={smoke:"#d5dbe0",molotov:"#ff9a2e",decoy:"#b58cf0",he:"#5fd07a",flash:"#ffe14d"};
function pieSvg(x,y,f,col,txt,r){r=r||13;f=Math.max(0,Math.min(1,f));var a=f*2*Math.PI,ex=x+r*Math.sin(a),ey=y-r*Math.cos(a),sec=f>=.999?'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+col+'"/>':(f<=0?'':'<path d="M'+x+' '+y+'L'+x+' '+(y-r)+'A'+r+' '+r+' 0 '+(f>.5?1:0)+' 1 '+ex.toFixed(1)+' '+ey.toFixed(1)+'Z" fill="'+col+'"/>');
 return '<circle cx="'+x+'" cy="'+y+'" r="'+(r+2)+'" fill="#10161a" fill-opacity=".85" stroke="#fff" stroke-width="2"/>'+sec+(txt!=null?'<text x="'+x+'" y="'+(y+r+17)+'" font-size="14" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">'+txt+'</text>':'')}
function c4Svg(X,Y,rem,ex){var col=rem>10.5?"#22c55e":rem>4.7?"#facc15":"#ef2d2d";
 if(rem<=0){var k=Math.min(1,-rem/1.5);return ex===false?'':'<circle cx="'+X+'" cy="'+Y+'" r="'+(10+k*60)+'" fill="#ff5a1f" fill-opacity="'+(.55*(1-k)).toFixed(2)+'" stroke="#ffd27a" stroke-width="3" stroke-opacity="'+(1-k).toFixed(2)+'"/>'}
 var blink=Math.sin(rem*(rem>10.5?4:rem>4.7?9:18))>0;
 return pieSvg(X,Y-34,rem/40,col,null,14)+'<text x="'+(X+22)+'" y="'+(Y-29)+'" font-size="15" font-weight="800" fill="'+col+'" stroke="#000" stroke-width="3" paint-order="stroke">'+Math.max(0,rem).toFixed(1)+"s</text>"+'<g transform="translate('+X+' '+Y+')"><rect x="-15" y="-10" width="30" height="20" rx="3" fill="#2a3036" stroke="'+col+'" stroke-width="3"/><rect x="-11" y="-6" width="9" height="12" fill="#11161a"/><rect x="-1" y="-6" width="9" height="5" fill="#8a949c"/><path d="M-15 0H-21M15 0H21" stroke="'+col+'" stroke-width="2"/><circle cx="11" cy="3" r="3.4" fill="'+col+'" opacity="'+(blink?1:.35)+'"/><text x="-6.5" y="3.5" font-size="8" font-weight="800" text-anchor="middle" fill="#fff">C4</text></g>'}

function myId(){return VIEW||"grupo"}
function byName(b){return b==="grupo"?"Grupo":pnameP(b)}
function srcList(m){var o=[];[["defs","Default"],["calls","Call"],["fx","Fixo"],["ab","Abertura"]].forEach(function(k){((m[k[0]]||{})[side]||[]).forEach(function(d,i){if(d&&d.players)o.push({l:k[1]+": "+(d.name||i+1),d:d})})});((m.tm[side]||{}).r||[]).forEach(function(r,i){o.push({l:"Timing: "+(r.nm||i+1),tr:r})});return o}
function srcD(m){return srcList(m).filter(function(x){return x.d})}
function chOpts(d){var o=[["","Desenho principal"]];(d.ch||[]).forEach(function(c,i){(c.o||[]).forEach(function(x,j){o.push([i+":"+j,(c.q||"Escolha "+(i+1))+" → "+(x.nm||"Opção "+(j+1))])})});return o}
function strokesOf(d,ch){if(ch){var q=ch.split(":"),c=(d.ch||[])[q[0]],x=c&&c.o&&c.o[q[1]];return(x&&x.s)||[]}return d.s||[]}
/* caminho do jogador c; se sp>=0 anda do respawn até o início (desviando de paredes) */
function joinFromSp(m,a,pts,T){
  var nearSp=(T.sp||[]).some(function(s){return Math.hypot(s.x-pts[0][0],s.y-pts[0][1])<90}),rem=[],i;
  rem[pts.length-1]=0;for(i=pts.length-2;i>=0;i--)rem[i]=rem[i+1]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);
  var tot=rem[0],cand=[0];
  if(nearSp){for(i=1;i<pts.length-1;i++){if(tot-rem[i]<=tot*0.4)cand.push(i);else break}}
  if(cand.length>6){var st=cand.length/6,c2=[];for(var k=0;k<6;k++)c2.push(cand[Math.floor(k*st)]);cand=c2}
  var best=null;
  cand.forEach(function(j){var seg=fixPath(m,[a,pts[j]],0,null).p,len=0;for(var q=1;q<seg.length;q++)len+=Math.hypot(seg[q][0]-seg[q-1][0],seg[q][1]-seg[q-1][1]);
    var cost=len+rem[j];if(!best||cost<best.cost-1e-6)best={cost:cost,seg:seg,j:j}});
  return best.seg.concat(pts.slice(best.j+1))}
function buildPts(m,d,c,ch,sp){var ss=strokesOf(d,ch).filter(function(q){return q.c===c&&q.p.length>1}).sort(function(a,b){return(a.n||1)-(b.n||1)}),pts=[];
 ss.forEach(function(q){q.p.forEach(function(p,i){var l=pts[pts.length-1];if(l&&i===0&&l[0]===p[0]&&l[1]===p[1])return;pts.push([p[0],p[1]])})});
 if(pts.length<2)return null;var T=m.tm[side];
 if(sp>=0&&T.sp&&T.sp[sp]){var a=[T.sp[sp].x,T.sp[sp].y];if(Math.hypot(a[0]-pts[0][0],a[1]-pts[0][1])>12)pts=joinFromSp(m,a,pts,T)}
 return pts}
/* campo de visão (onde o jogador olha) que vai junto quando a rota é enviada ao Timing */
function vsFromStrokes(d,c,ch){var ss=strokesOf(d,ch).filter(function(q){return q.c===c&&q.vs&&q.vs.vis&&q.vs.vis.length}).sort(function(a,b){return(a.n||1)-(b.n||1)});if(!ss.length)return null;
 var o=JSON.parse(JSON.stringify(ss[0].vs)),seen={};o.vis=[];ss.forEach(function(q){q.vs.vis.forEach(function(k){var j=JSON.stringify(k);if(seen[j])return;seen[j]=1;o.vis.push(JSON.parse(j))})});return o}
function d2vs(m,pl,shift){var f=pl.f||[];if(!f.length)return null;var t0=f[0][0],k=1.024*scaleOf(m),D=0,pp=null,smp=[];
 for(var t=0;t<=115;t+=1){var q=d2at(f,t0+t),p=q&&d2xy(m,q[1],q[2]);if(!p)continue;if(pp)D+=Math.hypot(p[0]-pp[0],p[1]-pp[1]);pp=p;if(q[4]==null)continue;smp.push({te:shift+D*k/SPD2,b:((90-q[4])%360+360)%360})}
 if(!smp.length)return null;function dif(a,b){var d=Math.abs(a-b)%360;return d>180?360-d:d}
 var vis=[{t:smp[0].te.toFixed(2),a:Math.round(smp[0].b),dur:"0.1"}],last=smp[0],prev=smp[0];
 for(var i=1;i<smp.length;i++){var sm=smp[i];if(dif(sm.b,last.b)>=8){vis.push({t:prev.te.toFixed(2),a:Math.round(sm.b),dur:Math.max(.2,sm.te-prev.te).toFixed(2)});last=sm}prev=sm}
 return{r:260,f:70,fl:"",vis:vis}}
function pushTm(m,nm,pts,sp,all,vs,tw){var T=m.tm[side];T.sp=T.sp||[];T.r=T.r||[];sp=Math.max(0,sp);
 var r={id:"t"+Date.now().toString(36)+Math.floor(Math.random()*999),nm:nm,sp:sp,p:pts,n:1};if(vs)r.vs=vs;if(tw>0)r.tw=tw;T.r=T.r.filter(function(x){return x.nm!==nm});T.r.push(r);
 if(all)shareR(m,r);save();return r}
function shareR(m,r){var T=m.tm[side];m.tms=m.tms||{tr:[],ct:[]};var L=m.tms[side]=m.tms[side]||[],sp=cpy(T.sp[r.sp]||{x:r.p[0][0],y:r.p[0][1]});
 for(var i=L.length-1;i>=0;i--)if(L[i].id===r.id)L.splice(i,1);L.push({id:r.id,by:myId(),sp:sp,r:cpy(r)});r.all=true}
/* painel: puxar Default/Call/Fixo (jogador, escolha, respawn) para o Timing */
function toTmUI(m,d0){var w=el("div",{class:"uc edt"}),T=m.tm[side],st={s:0,c:0,ch:"",sp:-1,all:false},h=el("strong"),msg=el("p",{class:"hint"}),box=el("div",{class:"row"});
 h.textContent=d0?"Enviar este para o Timing":"Puxar Default, Call ou Fixo para o Timing";w.appendChild(h);w.appendChild(box);w.appendChild(msg);
 function D(){return d0||(srcD(m)[st.s]||{}).d}
 function draw(){box.innerHTML="";var d=D();if(!d){msg.textContent="Nada para puxar neste lado.";return}
  if(!d0)box.appendChild(pickL("Origem",srcD(m).map(function(x,i){return[i,x.l]}),st.s,function(v){st.s=+v;st.ch="";draw()}));
  box.appendChild(pickL("Jogador",d.players.map(function(p,i){return[i,pname(i)]}),st.c,function(v){st.c=+v;var r=d.rs&&d.rs[st.c];if(r!=null)st.sp=r}));
  var co=chOpts(d);if(co.length>1)box.appendChild(pickL("Escolha",co,st.ch,function(v){st.ch=v}));
  var sp=(T.sp||[]).map(function(s,k){return[k,s.n||"Respawn "+(k+1)]});box.appendChild(pickL("Respawn",[[-1,"Sem (começa no desenho)"]].concat(sp),st.sp,function(v){st.sp=+v}));
  var tl=el("label",{class:"sl"}),ti=el("input",{type:"number",min:0,step:0.1,placeholder:"auto","aria-label":"Tempo da rota em segundos (opcional)"});ti.style.width="84px";ti.value=st.tw||"";ti.oninput=ti.onchange=function(){st.tw=parseFloat(String(ti.value).replace(",","."))||0};tl.appendChild(document.createTextNode("Tempo (s, opcional) "));tl.appendChild(ti);box.appendChild(tl);
  var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.onchange=function(){st.all=cb.checked};lb.appendChild(cb);lb.appendChild(document.createTextNode(" Salvar para todos"));box.appendChild(lb);
  var b=el("button",{class:"b primary",type:"button"});b.textContent="Enviar ao Timing";b.onclick=function(){var dd=D(),p=buildPts(m,dd,st.c,st.ch,st.sp);if(!p){msg.textContent="Esse jogador não tem caminho desenhado.";return}
   var vs0=vsFromStrokes(dd,st.c,st.ch);pushTm(m,(dd.name||"Rota")+" · "+pname(st.c),p,st.sp,st.all,vs0,st.tw);msg.textContent="Enviado"+(st.tw>0?" com tempo fixo de "+st.tw+" s":"")+(vs0?" com o campo de visão":"")+(st.sp>=0?" (o tempo já conta a ida do respawn até o começo)":"")+(st.all?" e salvo para todos":"")+"."};box.appendChild(b)}
 draw();return w}
/* X nos jogadores + voltar ao padrão (Default e Calls) */
function defTools(m,d,sc){var w=el("div");if(hasFl(m))w.appendChild(fcPanel(m,d));if(sc==="open")return w;
 if(d.hid&&d.hid.length){var b=el("button",{class:"b edt",type:"button"});b.textContent="Voltar todos os jogadores (nome padrão)";b.onclick=function(){d.hid.forEach(function(i){if(d.players[i]&&sc==="calls")d.players[i].name=""});d.hid=[];save();render()};w.appendChild(b)}
 var fb=el("button",{class:"b edt",type:"button"});fb.textContent="Focar em 3 jogadores";fb.onclick=function(){ask("Quantos jogadores manter (1 a 5)?",function(v){var k=Math.max(1,Math.min(5,parseInt(v,10)||3));d.hid=[];for(var i=k;i<d.players.length;i++)d.hid.push(i);save();render()},true)};w.appendChild(fb);
 w.appendChild(toTmUI(m,d));return w}
/* escolha dentro de uma opção */
function nestCh(m,d,o){var w=el("div"),host=el("div"),b=el("button",{class:"b edt",type:"button"});
 function n(){return(o.ch||[]).length}function lab(){b.textContent="Escolha dentro desta opção ("+n()+")"}lab();
 b.onclick=function(){if(host.firstChild){host.innerHTML="";return}
  if(!o.players){Object.defineProperty(o,"players",{value:d.players,enumerable:false,writable:true,configurable:true});Object.defineProperty(o,"nn",{get:function(){return d.nn},enumerable:false,configurable:true});Object.defineProperty(o,"rs",{get:function(){return d.rs},enumerable:false,configurable:true})}
  host.appendChild(choiceEd(m,o))};w.appendChild(b);w.appendChild(host);return w}
/* Timing: o que é meu em cima, o que é de outros perfis embaixo */
function tmShare(m){var T=m.tm[side],me=myId(),w=el("div",{class:"def"});m.tms=m.tms||{tr:[],ct:[]};var L=m.tms[side]=m.tms[side]||[];
 var h=el("h2");h.textContent="Timings: meu perfil e dos outros";w.appendChild(h);
 var h1=el("strong");h1.textContent="Do meu perfil ("+byName(me)+")";w.appendChild(h1);
 (T.r||[]).filter(function(r){return!r.cp}).forEach(function(r){var row=el("div",{class:"row"}),s=el("span");s.textContent=r.nm||"rota";s.style.flex="1";row.appendChild(s);
  var lb=el("label",{class:"sl edt"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.checked=!!r.all;cb.onchange=function(){if(cb.checked)shareR(m,r);else{delete r.all;for(var i=L.length-1;i>=0;i--)if(L[i].id===r.id)L.splice(i,1)}save();render()};lb.appendChild(cb);lb.appendChild(document.createTextNode(" Para todos"));row.appendChild(lb);w.appendChild(row)});
 var h2=el("strong");h2.textContent="De outros perfis";h2.style.display="block";h2.style.marginTop="12px";w.appendChild(h2);
 var oth=L.filter(function(e){return e.by!==me});if(!oth.length){var e0=el("p",{class:"hint"});e0.textContent="Nenhum timing compartilhado por outros perfis neste lado.";w.appendChild(e0)}
 oth.forEach(function(e){var row=el("div",{class:"row"}),s=el("span"),have=(T.r||[]).some(function(r){return r.id===e.id+"_c"});s.textContent=(e.r.nm||"rota")+" · por "+byName(e.by);s.style.flex="1";row.appendChild(s);
  var b=el("button",{class:"b edt",type:"button"});b.textContent=have?"Já copiado":"Copiar para o meu Timing";b.disabled=have;b.onclick=function(){var r=cpy(e.r);r.sp=0;mergeTm(T,[e.sp],[r],T.np,[],byName(e.by),e.id);T.r[T.r.length-1].id=e.id+"_c";T.r[T.r.length-1].cp=1;delete T.r[T.r.length-1].all;save();render()};row.appendChild(b);w.appendChild(row)});
 return w}
/* Demo 2D -> Timing */
function d2pts(m,pl){var f=pl.f||[],o=[];if(!f.length)return o;var t0=f[0][0];for(var t=0;t<=115;t+=1){var q=d2at(f,t0+t),p=q&&d2xy(m,q[1],q[2]);if(!p)continue;var l=o[o.length-1];if(!l||Math.hypot(p[0]-l[0],p[1]-l[1])>6)o.push([Math.round(p[0]),Math.round(p[1])])}return o}
function d2SendPanel(m){var w=el("div",{class:"def edt"}),T=m.tm[side],st={p:0,sp:-1,all:false},msg=el("p",{class:"hint"});
 var h=el("strong");h.textContent="Enviar jogador da demo para o Timing";w.appendChild(h);
 var R=D2.data&&(D2.data.rounds||[])[D2.r];if(!R){var e=el("p",{class:"hint"});e.textContent="Abra uma demo para enviar um jogador.";w.appendChild(e);return w}
 var row=el("div",{class:"row"});row.appendChild(pickL("Jogador",R.players.map(function(p,i){return[i,p.name+" ("+p.team+")"]}),0,function(v){st.p=+v}));
 row.appendChild(pickL("Respawn",[[-1,"Sem (começa onde a demo começa)"]].concat((T.sp||[]).map(function(s,k){return[k,s.n||"Respawn "+(k+1)]})),-1,function(v){st.sp=+v}));
 var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.onchange=function(){st.all=cb.checked};lb.appendChild(cb);lb.appendChild(document.createTextNode(" Salvar para todos"));row.appendChild(lb);
 var b=el("button",{class:"b primary",type:"button"});b.textContent="Enviar ao Timing";b.onclick=function(){var pl=R.players[st.p],p=d2pts(m,pl);if(p.length<2){msg.textContent="Sem caminho nessa demo/round.";return}
  var shift=0;if(st.sp>=0&&T.sp[st.sp]){var a=[T.sp[st.sp].x,T.sp[st.sp].y];if(Math.hypot(a[0]-p[0][0],a[1]-p[0][1])>12){var pre=fixPath(m,[a,p[0]],0,null).p;shift=plen2(m,pre)/SPD2;p=pre.concat(p.slice(1))}}
  var vs1=d2vs(m,pl,shift);pushTm(m,"Demo · "+pl.name+" R"+(D2.r+1),p,st.sp,st.all,vs1);msg.textContent="Enviado ao Timing"+(vs1?" com o campo de visão.":".")};row.appendChild(b);w.appendChild(row);w.appendChild(msg);return w}
/* aba Comparação */
function alongAt(p,dist){for(var i=1;i<p.length;i++){var d=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(dist<=d)return[p[i-1][0]+(p[i][0]-p[i-1][0])*dist/Math.max(d,1e-6),p[i-1][1]+(p[i][1]-p[i-1][1])*dist/Math.max(d,1e-6)];dist-=d}return p[p.length-1]}
function cmpView(m){var w=el("div",{class:"mm"}),st={d:null,id:"",r:0,p:0,s:0,c:0,ch:"",sp:-2,ar:-1,t:0,run:0},svg=mksvg(m),cap=el("p",{class:"cap"}),sum=el("p",{class:"hint"}),sel=el("div",{class:"row"}),sc=null,raf=0,A=null,B=null,TT=1;
 sum.style.whiteSpace="pre-line";var k=1.024*scaleOf(m)*0.0254;
 function setup(){A=B=null;var R=st.d&&(st.d.rounds||[])[st.r],pl=R&&R.players[st.p],L=srcList(m)[st.s];
  if(pl){var f=pl.f||[],t0=f.length?f[0][0]:0;A=function(t){var q=d2at(f,t0+t);return q?d2xy(m,q[1],q[2]):null}}
  var P=null,sp=st.sp;st.ar=-1;if(sp===-2){sp=-1;var a0=A&&A(0),T0=m.tm[side],bd=1e9;if(a0)(T0.sp||[]).forEach(function(q,i){var dd=Math.hypot(q.x-a0[0],q.y-a0[1]);if(dd<bd){bd=dd;sp=i}});st.ar=sp}
  if(L&&L.tr)P=L.tr.p.map(function(q){return[q[0],q[1]]});else if(L&&L.d&&L.d.players.length>st.c)P=buildPts(m,L.d,st.c,st.ch,sp);if(P){var tot=plen2(m,P)/SPD2;B={P:P,T:tot,at:function(t){return alongAt(P,Math.min(t,tot)*SPD2/(1.024*scaleOf(m)))}}}
  TT=Math.max(1,Math.min(115,B?B.T+8:30));stats();paint()}
 function stats(){sum.textContent="";if(!A||!B){sum.textContent="Escolha uma demo salva e um Default, Call ou Fixo para comparar.";return}
  var e=B.P[B.P.length-1],tA=null,mx=0,mt=0,still=0;for(var t=0;t<=TT;t+=.5){var a=A(t),b=B.at(t);if(!a)continue;var g=Math.hypot(a[0]-b[0],a[1]-b[1]);if(g>mx){mx=g;mt=t}if(tA==null&&Math.hypot(a[0]-e[0],a[1]-e[1])<30)tA=t;var a2=A(t+.5);if(a2&&Math.hypot(a2[0]-a[0],a2[1]-a[1])*k/.5<1.2)still+=.5}
  var l=["Plano chega ao destino em "+B.T.toFixed(1)+"s."+(tA==null?" Na demo você não chegou ao mesmo ponto final.":" Na demo você chegou em "+tA.toFixed(1)+"s ("+(tA>B.T?"+":"")+(tA-B.T).toFixed(1)+"s).")];
  if(st.ar>=0)l.unshift("Respawn automático (pelo spawn da demo): "+((m.tm[side].sp[st.ar]||{}).n||"Respawn "+(st.ar+1))+".");l.push("Maior distância entre os dois: "+(mx*k).toFixed(0)+" m aos "+mt.toFixed(1)+"s. Tempo parado na demo: "+still.toFixed(1)+"s.");
  l.push(tA==null?"Melhorar: a rota da demo não passa pelo ponto final do plano; revisem o caminho (trecho do maior desvio).":tA-B.T>1.5?"Melhorar: demorou "+(tA-B.T).toFixed(1)+"s a mais"+(still>1.5?"; parte disso foi ficar parado":"; saiam do respawn mais cedo ou cortem o desvio")+".":tA-B.T<-1.5?"Vocês chegaram "+(B.T-tA).toFixed(1)+"s antes do plano: atualizem o timing, o plano está lento.":"Tempo dentro do plano. Confiram só o ponto do maior desvio.");sum.textContent=l.join("\n")}
 function paint(){var h=bg(m);if(B){h+='<polyline points="'+B.P.map(function(q){return q.join(",")}).join(" ")+'" fill="none" stroke="#f0771c" stroke-width="4" stroke-dasharray="8 8" opacity=".7"/>'}
  if(A){var tr=[];for(var t=0;t<=st.t;t+=.5){var a=A(t);if(a)tr.push(a.join(","))}if(tr.length>1)h+='<polyline points="'+tr.join(" ")+'" fill="none" stroke="#3b82f6" stroke-width="4" opacity=".8"/>'}
  var a=A&&A(st.t),b=B&&B.at(st.t);if(a&&b)h+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#fff" stroke-width="2" stroke-dasharray="3 4"/>';
  if(b)h+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="13" fill="#f0771c" stroke="#fff" stroke-width="3"/>';if(a)h+='<circle cx="'+a[0]+'" cy="'+a[1]+'" r="13" fill="#3b82f6" stroke="#fff" stroke-width="3"/>';
  svg.innerHTML=h;cap.textContent=fmtT(st.t)+" · azul = demo (vocês), laranja = plano"+(a&&b?" · distância "+(Math.hypot(a[0]-b[0],a[1]-b[1])*k).toFixed(1)+" m":"");if(sc)sc.set(st.t,TT)}
 function loop(){if(!st.run)return;st.t+=1/60;if(st.t>=TT){st.t=TT;st.run=0;pb.textContent="▶ Tocar"}paint();if(st.run)raf=requestAnimationFrame(loop)}
 var pb=el("button",{class:"b primary",type:"button"});pb.textContent="▶ Tocar";pb.onclick=function(){if(st.run){st.run=0;cancelAnimationFrame(raf);pb.textContent="▶ Tocar";return}if(st.t>=TT)st.t=0;st.run=1;pb.textContent="❚❚ Pausar";raf=requestAnimationFrame(loop)};
 sc=scrub(function(v){st.t=v;paint()});
 function ctl(){sel.innerHTML="";var dl=D2T.map(function(d){return[d.id,d.name]});
  if(!dl.length){sel.appendChild(el("span",{class:"hint"}));sel.firstChild.textContent="Nenhuma demo 2D salva. Salve uma na aba Demo 2D.";return}
  sel.appendChild(pickL("Demo",dl,st.id||dl[0][0],function(v){load(v)}));
  var R=st.d&&st.d.rounds||[];if(R.length){sel.appendChild(pickL("Round",R.map(function(r,i){return[i,"R"+(i+1)]}),st.r,function(v){st.r=+v;ctl();setup()}));
   sel.appendChild(pickL("Jogador",(R[st.r]&&R[st.r].players||[]).map(function(p,i){return[i,p.name+" ("+p.team+")"]}),st.p,function(v){st.p=+v;setup()}))}
  var L=srcList(m);sel.appendChild(pickL("Comparar com",L.map(function(x,i){return[i,x.l]}),st.s,function(v){st.s=+v;st.ch="";ctl();setup()}));
  var d=L[st.s]&&L[st.s].d;if(d){sel.appendChild(pickL("Player do plano",d.players.map(function(p,i){return[i,pname(i)]}),st.c,function(v){st.c=+v;setup()}));
   var co=chOpts(d);if(co.length>1)sel.appendChild(pickL("Escolha",co,st.ch,function(v){st.ch=v;setup()}));
   var T=m.tm[side];sel.appendChild(pickL("Respawn",[[-2,"Automático (pelo spawn da demo)"],[-1,"Sem"]].concat((T.sp||[]).map(function(s,i){return[i,s.n||"Respawn "+(i+1)]})),st.sp,function(v){st.sp=+v;setup()}))}
  sel.appendChild(pb)}
 function load(id){st.id=id;st.t=0;d2get(id).then(function(j){st.d=j;st.r=0;st.p=0;ctl();setup()}).catch(function(e){setSt("Não abriu a demo: "+emsg(e))})}
 w.appendChild(sel);var mw=el("div",{class:"mwrap"});mw.appendChild(svg);w.appendChild(mw);w.appendChild(sc);w.appendChild(cap);w.appendChild(sum);w.xst=st;ctl();if(D2T.length)load(D2T[0].id);return w}
;
/* parte 1 de 5 */

var COLORS=["#3b82f6","#22a55b","#e0b100","#f0771c","#9b5de5"];
var KEY="cs2-defaults-v1";
function newDef(n,k){return{name:(k||"Default")+" "+n,desc:"",players:COLORS.map(function(_,i){return{name:"Jogador "+(i+1),pef:""}})}}
function newMap(n){return{name:n,note:"",defs:{tr:[newDef(1)],ct:[newDef(1)]},calls:{tr:[newDef(1,"Call")],ct:[newDef(1,"Call")]},ut:{tr:{s:[],u:[]},ct:{s:[],u:[]}}}}
var side="tr",LOCK=false,GH={repo:"",tok:""};
var ICON={ct:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 6 10v13c0 11 7.5 19 18 22 10.500-3 18-11 18-22V10z" fill="#3b6fd8"/><path d="M24 7.500 10 13v10c0 8.500 5.500 15 14 18 8.500-3 14-9.500 14-18V13z" fill="#1f3f8f"/><text x="24" y="29" text-anchor="middle" font-family="Arial" font-weight="800" font-size="16" fill="#fff">CT</text></svg>',tr:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 3h18l12 12v18L33 45H15L3 33V15z" fill="#e0952a"/><path d="M16 8h16l10 10v12L32 40H16L6 30V18z" fill="#8a4f0c"/><text x="24" y="29" text-anchor="middle" font-family="Arial" font-weight="800" font-size="16" fill="#fff">TR</text></svg>'};
var SIDENAME={ct:"Lado CT",tr:"Lado TR"},SIDECOL={ct:"#3b6fd8",tr:"#e0952a"};
var S=null,cur=0;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.maps||!S.maps.length){S={maps:["Dust2","Mirage","Ancient","Inferno","Anubis","Nuke","Cache"].map(newMap)}}
function migrate(){var nk=function(n){return(n||"").toLowerCase().replace(/[^a-z0-9]/g,"")};if(!S.maps.some(function(m){return nk(m.name)==="cache"}))S.maps.forEach(function(m){if(nk(m.name)==="overpass")m.name="Cache"});if(!S.ord){var OR=["dust2","mirage","ancient","inferno","anubis","nuke","cache","vertigo","train"],ix=function(m){var k=OR.indexOf((m.name||"").toLowerCase().replace(/[^a-z0-9]/g,""));return k<0?99:k};S.maps=S.maps.map(function(m,i){return[m,i]}).sort(function(a,b){return ix(a[0])-ix(b[0])||a[1]-b[1]}).map(function(x){return x[0]});S.ord=1}if(!S.demos)S.demos=[];if(!S.trs)S.trs=[];if(!S.iglg)S.iglg="";S.maps.forEach(function(m){if(Array.isArray(m.defs))m.defs={tr:m.defs,ct:[newDef(1)]};ensure(m)});if(!S.pn){S.pn=[0,1,2,3,4].map(function(i){var nm="";S.maps.forEach(function(m){["tr","ct"].forEach(function(k){(m.defs[k]||[]).forEach(function(d){var n=d.players&&d.players[i]&&d.players[i].name;if(!nm&&n&&n!=="Jogador "+(i+1))nm=n})})});return nm||"Jogador "+(i+1)})}}
migrate();
/* ---------- perfis: estado ---------- */
var PROF=[{id:"p1",i:0},{id:"p2",i:1},{id:"p3",i:2},{id:"p4",i:3},{id:"p5",i:4},{id:"mx",i:-1}];
var PK=["defs","calls","fx","fxo","tm","ab","ut","dw","ar","igl","note","vzr","co","wl","wu","wm","zn","tms"],CK=["co","wl","wu","wm","zn","tms"],BC={};
try{BC=JSON.parse(localStorage.getItem("cs2-bc")||"{}")}catch(e){}
var BASE=S,PD={},MD={},ACC={},ACP={},FSHA={},CURJ={},DIRTY={},VIEW=null,ME=null,UNL={},CAN=false,CALLOK=false,LOADED=false,ROU=false;
try{PROF.forEach(function(p){if(p.id==="mx")return;var a=localStorage.getItem("cs2-p-"+p.id),b=localStorage.getItem("cs2-m-"+p.id);if(a)PD[p.id]=JSON.parse(a);if(b)MD[p.id]=JSON.parse(b)});ACC=JSON.parse(localStorage.getItem("cs2-ac")||"{}");ACP=JSON.parse(localStorage.getItem("cs2-acp")||"{}");DIRTY=JSON.parse(localStorage.getItem("cs2-dirty2")||"{}");ROU=localStorage.getItem("cs2-ro")==="1"}catch(e){}
function newUid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36)}
BASE.maps.forEach(function(m){if(!m.uid)m.uid=newUid()});
function pkOf(m){var o={};PK.forEach(function(k){if(m[k]!==undefined)o[k]=m[k]});return o}
function cpy(x){return JSON.parse(JSON.stringify(x))}
function pnameP(id){var p=PROF.filter(function(x){return x.id===id})[0];if(!p||p.i<0)return"Misto";return(BASE.pn&&BASE.pn[p.i])||("Player "+(p.i+1))}
function buildS(view){var gl={};Object.keys(BASE).forEach(function(k){if(k!=="maps")gl[k]=BASE[k]});
  var pd=view&&view!=="mx"?PD[view]:null;
  gl.maps=BASE.maps.map(function(bm){var m=Object.assign({},bm),src=null;
    if(view==="mx")src=mistoPK(bm);else if(pd&&pd.maps&&pd.maps[bm.uid])src=pd.maps[bm.uid];
    var t=src||pkOf(bm);PK.forEach(function(k){if(t[k]!==undefined)m[k]=cpy(t[k]);else if(CK.indexOf(k)>=0&&bm[k]!==undefined)m[k]=cpy(bm[k]);else delete m[k]});
    Object.defineProperty(m,"__b",{value:bm,enumerable:false,writable:true,configurable:true});ensure(m);return m});
  return gl}
S=buildS(null);

var DB=null,dirty=false;
function setSt(t){document.getElementById("st").textContent=t}

function el(t,a,k){var e=document.createElement(t);for(var x in a||{}){if(x==="class")e.className=a[x];else e.setAttribute(x,a[x])}(k||[]).forEach(function(c){e.appendChild(c)});return e}
function field(tag,val,ph,cb,cls){var f=el(tag,{placeholder:ph,"aria-label":ph});if(cls)f.className=cls;f.value=val;f.addEventListener("input",function(){cb(f.value);save()});return f}
var ASSETS={upload:function(f,mx){return new Promise(function(ok,no){var r=new FileReader();r.onerror=no;r.onload=function(){var im=new Image();im.onerror=no;im.onload=function(){
  var M=mx||1024,k=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
  var x=c.getContext("2d");if(M>400){x.fillStyle="#1b2228";x.fillRect(0,0,c.width,c.height)}x.drawImage(im,0,0,c.width,c.height);ok({id:M>400?c.toDataURL("image/jpeg",0.82):c.toDataURL("image/png")})};im.src=r.result};r.readAsDataURL(f)})}},tool={k:"draw",i:0};
var ICO={smoke:'<circle r="10" fill="#c9d1d6" stroke="#5b6b76" stroke-width="1.5"/><circle cx="-4" cy="-3" r="4" fill="#eef2f4"/><circle cx="4" cy="2" r="5" fill="#eef2f4"/>',
flash:'<polygon points="0,-11 3,-3 11,0 3,3 0,11 -3,3 -11,0 -3,-3" fill="#f5d000" stroke="#7a6600" stroke-width="1.2"/>',
molotov:'<path d="M0-11C6-4 9 0 9 4a9 9 0 0 1-18 0C-9 0-6-4 0-11z" fill="#f0771c" stroke="#8a3d05" stroke-width="1.2"/><path d="M0-3C3 0 4 2 4 4a4 4 0 0 1-8 0C-4 2-3 0 0-3z" fill="#ffd27a"/>',
he:'<circle cy="2" r="8" fill="#3d9a52" stroke="#1d5a2b" stroke-width="1.2"/><rect x="-3" y="-9" width="6" height="4" fill="#1d5a2b"/>',
decoy:'<circle r="10" fill="#9b5de5" stroke="#4b2a85" stroke-width="1.2"/><path d="M-5 0h10M0-5v10" stroke="#fff" stroke-width="2"/>'};
var UN={smoke:"Smoke",flash:"Flash",molotov:"Molotov",he:"HE",decoy:"Decoy"};
function inPoly(p,P){var c=false,i,j;for(i=0,j=P.length-1;i<P.length;j=i++){if(((P[i][1]>p[1])!==(P[j][1]>p[1]))&&(p[0]<(P[j][0]-P[i][0])*(p[1]-P[i][1])/(P[j][1]-P[i][1])+P[i][0]))c=!c}return c}
function zoneAt(m,p){var z=m.zn||[],i;for(i=z.length-1;i>=0;i--)if(z[i].p&&z[i].p.length>2&&inPoly(p,z[i].p))return z[i].f|0;return null}
function zoneFloor(m,p){var z=zoneAt(m,p);return z==null?0:z}
function trkF(m,pts,f){for(var i=0;i<pts.length;i++){var z=zoneAt(m,pts[i]);if(z!=null)f=z}return f}
function startFloor(m,list,n){var f=0;list.filter(function(r){return(r.n||1)<n&&r.p}).sort(function(a,b){return(a.n||1)-(b.n||1)}).forEach(function(r){f=trkF(m,r.p,f)});return f}
function trackAt(m,pos,t){var f=0,x,st=Math.max(.25,t/60),P;for(x=0;x<=t;x+=st){P=pos(x);if(P){var z=zoneAt(m,P);if(z!=null)f=z}}P=pos(t);if(P){var z2=zoneAt(m,P);if(z2!=null)f=z2}return f}
function routeWin(S0,items,it,idx,np,same){var n=it.n||1;if(n>np||!S0.del[idx])return null;var st=S0.T[n]+S0.del[idx][0],en=Infinity;items.forEach(function(x,j){var nn=x.n||1;if(nn<=n||nn>np||!same(x)||!S0.del[j])return;var s2=S0.T[nn]+S0.del[j][0];if(s2<en)en=s2});return[st,en]}
function whoOf(q){if(q.who)return q.who;var th=q.e&&q.e.th;if(th===""||th==null)return null;if(typeof th==="string"&&th.charAt(0)==="e")return th;return"o"+(+th)}
function plenA(p){var L=0;for(var i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return L}
function trimStart(p,len){if(len<=0)return p;for(var i=1;i<p.length;i++){var d=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(len>=d){len-=d;continue}var f=len/d;return[[p[i-1][0]+(p[i][0]-p[i-1][0])*f,p[i-1][1]+(p[i][1]-p[i-1][1])*f]].concat(p.slice(i))}return null}
function visSvg(m,vs,pf,t,col){var p0=pf(t);if(!p0)return"";var x=visAng(m,vs,pf,t);if(!x)return"";var ff=vs.fl!=null&&vs.fl!==""?+vs.fl:trackAt(m,pf,t),pts=fovPoly(p0,x.a,num(vs.r,260),num(vs.f,70),vclipOn()?wallSegs(m,ff):[]);return'<polygon points="'+pts.map(function(a){return a[0].toFixed(1)+","+a[1].toFixed(1)}).join(" ")+'" fill="'+col+'" fill-opacity=".25" stroke="'+col+'" stroke-opacity=".8" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>'}
function vdOn(){return S.vd!==false}
function veOn(){return S.ve===true}
function tgBtn(txt,get,set,cb){var b=el("button",{class:"tool",type:"button"});function t(){b.textContent=txt+": "+(get()?"ligado":"desligado");b.setAttribute("aria-pressed",String(!!get()))}t();b.onclick=function(){set(!get());save();t();cb()};return b}
function vdBtn(cb){return tgBtn("Campo de visão",vdOn,function(v){S.vd=v},cb)}
function veBtn(cb){return tgBtn("Inimigos com visão (timing do outro lado)",veOn,function(v){S.ve=v},cb)}
function migVz(m){if(!m.vz||!m.vz.length||m.vzm)return;var cp=function(x){return JSON.parse(JSON.stringify(x))};
  m.vz.forEach(function(q){var sd=q.sd==="ct"?"ct":"tr",k=q.k||"tm",ci=q.ci|0,spec={r:q.r,f:q.f,fl:q.fl==null?"":q.fl,vis:cp(q.vis||[])};
    if(k==="tm"){var T=m.tm&&m.tm[sd];((T&&T.r)||[]).forEach(function(r){if(r.sp===ci&&!r.vs)r.vs=cp(spec)})}
    else{var L=k==="calls"?(m.calls||{})[sd]:k==="fx"?(m.fx||{})[sd]:(m.defs||{})[sd],D=L&&L[q.i|0];((D&&D.s)||[]).forEach(function(it){if(it.c===ci&&!it.vs)it.vs=cp(spec)})}});
  m.vz=[];m.vzm=1}

function ufl(m,u){return u.fl!=null&&u.fl!==""?+u.fl:zoneFloor(m,[u.x,u.y])}
function visFor(m,k,sd,i,ci){var L=m.vz||[],j;for(j=0;j<L.length;j++){var q=L[j];if(q.hid)continue;if((q.k||"tm")===k&&(q.sd||"tr")===sd&&(k==="tm"||(q.i|0)===i)&&(q.ci|0)===ci)return q}return null}
function vKfs(q){var a=(q.vis||[]).map(function(k){return{k:k,t:ptE(k.t)}}).filter(function(x){return x.t>=0}).sort(function(x,y){return x.t-y.t});
  return a.map(function(x,i){var h=x.k.h;if(h==null||h==="")return{k:x.k,t:x.t,d:Math.max(0,num(x.k.dur,.5))};
    if(i===0)return{k:x.k,t:x.t,d:0};var pv=a[i-1].k,pe=(pv.h==null||pv.h==="")?a[i-1].t:a[i-1].t+Math.max(0,num(pv.h,0)),st=Math.min(pe,x.t);return{k:x.k,t:st,d:Math.max(0,x.t-pe)}})}
function vCo(m,n){n=(n||"").trim().toLowerCase();return(m.co||[]).filter(function(c){return(c.t||"").trim().toLowerCase()===n})[0]}
function vTg(m,x,P){var c=x.k.cn?vCo(m,x.k.cn):null;if(c)return bear(P,[c.x,c.y]);return num(x.k.a,0)}
function visAng(m,q,pos,t0){var ks=vKfs(q),P0=pos(t0);if(!P0)return null;
  function init(x){var p=pos(x)||P0;if(ks.length)return vTg(m,ks[0],p);var p1=pos(x+.4);return p1&&Math.hypot(p1[0]-p[0],p1[1]-p[1])>1?bear(p,p1):0}
  function fa(j,x){var K=ks[j],p=pos(x)||P0,A=vTg(m,K,p),Pv=j===0?init(K.t):fa(j-1,K.t),u=K.d<=0?1:Math.max(0,Math.min(1,(x-K.t)/K.d));u=u*u*(3-2*u);return Pv+wrap180(A-Pv)*u}
  var j=-1,i;for(i=0;i<ks.length;i++)if(ks[i].t<=t0+1e-9)j=i;var a=j<0?init(t0):fa(j,t0);return{a:(a+360)%360,k:j>=0?ks[j].k:(ks[0]?ks[0].k:null),P:P0}}
function fovPoly(p,a,r,f,W){var n=26,pts=[p],i,k;for(i=0;i<=n;i++){var off=-f/2+f*i/n,an=(a+off)*Math.PI/180,dx=Math.sin(an),dy=-Math.cos(an),b=r/Math.max(.2,Math.cos(off*Math.PI/180));
    for(k=0;k<W.length;k++){var s=W[k],ex=s[2]-s[0],ey=s[3]-s[1],den=dx*ey-dy*ex;if(!den)continue;var tx=s[0]-p[0],ty=s[1]-p[1],tt=(tx*ey-ty*ex)/den,uu=(tx*dy-ty*dx)/den;if(tt>=0&&tt<b&&uu>=0&&uu<=1)b=tt}
    pts.push([p[0]+dx*b,p[1]+dy*b])}return pts}
function fovClip(m,p,a,r,f,col,fl){r=Math.max(r,30);var h=f*Math.PI/360,W=vclipOn()?wallSegs(m,fl==null?0:fl):[],pts=fovPoly(p,a,r*Math.cos(h),f,W);return'<polygon points="'+pts.map(function(q){return q[0].toFixed(1)+","+q[1].toFixed(1)}).join(" ")+'" fill="'+col+'" fill-opacity=".22" stroke="'+col+'" stroke-opacity=".6" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>'}
function visOn(){return S.vv!==false}
function vclipOn(){return S.vclip!==false}
function vvBtn(cb){var b=el("button",{class:"tool",type:"button","aria-pressed":visOn()});function t(){b.textContent="Campo de visão salvo: "+(visOn()?"ligado":"desligado");b.setAttribute("aria-pressed",String(visOn()))}t();b.onclick=function(){S.vv=!visOn();save();t();cb()};return b}
function notice(msg){setSt(msg);var o=document.getElementById("notice");if(o)o.remove();o=el("div",{id:"notice",role:"alert"});o.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom,0px));max-width:min(560px,92vw);z-index:20;background:#7c2d12;color:#fff;padding:12px 16px;border-radius:8px;font:600 14px/1.4 sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.35);cursor:pointer";o.textContent=msg;o.onclick=function(){o.remove()};document.body.appendChild(o);setTimeout(function(){if(o.parentNode)o.remove()},10000)}
function detour(a,b,W,dl){var R=7,tries=[160,420,1e5],ti;dl=dl||Date.now()+500;
  for(ti=0;ti<tries.length;ti++){var mg=tries[ti],x0=Math.min(a[0],b[0])-mg,x1=Math.max(a[0],b[0])+mg,y0=Math.min(a[1],b[1])-mg,y1=Math.max(a[1],b[1])+mg,nodes=[a,b],seen={},Wl=W.filter(function(s){return Math.max(s[0],s[2])>=x0&&Math.min(s[0],s[2])<=x1&&Math.max(s[1],s[3])>=y0&&Math.min(s[1],s[3])<=y1});
    Wl.forEach(function(s){[[s[0],s[1],s[2],s[3]],[s[2],s[3],s[0],s[1]]].forEach(function(e){var vx=e[0],vy=e[1];if(vx<x0||vx>x1||vy<y0||vy>y1)return;var dx=e[2]-vx,dy=e[3]-vy,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;var nx=-dy,ny=dx;
      [[-dx*R+nx*R,-dy*R+ny*R],[-dx*R-nx*R,-dy*R-ny*R]].forEach(function(o){var px=vx+o[0],py=vy+o[1];if(px<0||px>1000||py<0||py>1000)return;var k=Math.round(px/3)+","+Math.round(py/3);if(seen[k])return;seen[k]=1;nodes.push([px,py])})})});
    var n=nodes.length,dist=[],prev=[],done=[],i;if(n>600)continue;for(i=0;i<n;i++)dist[i]=Infinity;dist[0]=0;
    for(;;){if(Date.now()>dl)return null;var u=-1,bd=Infinity;for(i=0;i<n;i++)if(!done[i]&&dist[i]<bd){bd=dist[i];u=i}if(u<0||u===1)break;done[u]=true;
      for(i=0;i<n;i++){if(done[i])continue;var nd=dist[u]+Math.hypot(nodes[u][0]-nodes[i][0],nodes[u][1]-nodes[i][1]);if(nd>=dist[i])continue;if(blocked(nodes[u],nodes[i],Wl))continue;dist[i]=nd;prev[i]=u}}
    if(dist[1]<Infinity){var pth=[],c=1;while(c!=null){pth.unshift(nodes[c]);c=c===0?null:prev[c]}return pth}}
  return null}
function segT(a,b,s){var d1x=b[0]-a[0],d1y=b[1]-a[1],d2x=s[2]-s[0],d2y=s[3]-s[1],den=d1x*d2y-d1y*d2x;if(!den)return-1;var tx=s[0]-a[0],ty=s[1]-a[1],u=(tx*d2y-ty*d2x)/den,v=(tx*d1y-ty*d1x)/den;return(u>=0&&u<=1&&v>=0&&v<=1)?u:-1}
function firstHit(a,b,W){var bt=2,bs=null,i,t;for(i=0;i<W.length;i++){t=segT(a,b,W[i]);if(t>=0&&t<bt){bt=t;bs=W[i]}}return bs?{t:bt,s:bs}:null}
function fixPath(m,p,f0,force){
  var Wf=[wallSegs(m,0),wallSegs(m,1),wallSegs(m,2)];
  if(!Wf[0].length&&!Wf[1].length&&!Wf[2].length)return{p:p,n:0,bad:0,red:[],hits:[]};
  var fo=(force===""||force==null||isNaN(+force))?null:+force,f=f0==null?0:f0;
  if(fo==null){var z0=zoneAt(m,p[0]);if(z0!=null)f=z0}
  var out=[p[0]],n=0,bad=0,red=[],hits=[],dl=Date.now()+700,i;
  function fl(b){if(fo!=null)return fo;var zb=zoneAt(m,b);return zb!=null?zb:f}
  function wf(x){return Wf[x]||Wf[0]}
  for(i=1;i<p.length;i++){
    var a=out[out.length-1],b=p[i],fs=fl(b),w=wf(fs);
    if(!w.length||!blocked(a,b,w)){out.push(b);f=fs;continue}
    var pt=Date.now()>dl?null:detour(a,b,w,dl);
    if(pt){for(var k=1;k<pt.length;k++){out.push(pt[k]);var zk=fo!=null?null:zoneAt(m,pt[k]);if(zk!=null)fs=zk}n++;f=fs;var zb2=fo!=null?null:zoneAt(m,b);if(zb2!=null)f=zb2;continue}
    var ht=firstHit(a,b,w),j=-1,seg=null,rest=p.length-1-i,step=Math.max(1,Math.ceil(rest/8)),jj;
    for(jj=i+step;jj<p.length&&Date.now()<dl;jj+=step){var bb=p[jj],ww=wf(fl(bb));
      if(!blocked(a,bb,ww)){seg=[bb];j=jj;break}
      var d2=detour(a,bb,ww,dl);if(d2){seg=d2.slice(1);j=jj;break}}
    var hp=ht?[a[0]+(b[0]-a[0])*ht.t,a[1]+(b[1]-a[1])*ht.t]:[a[0],a[1]];
    if(ht)hits.push(ht.s);
    if(j>0){red.push([hp].concat(p.slice(i,j+1)));seg.forEach(function(q){out.push(q)});n++;i=j;f=fl(p[j]);continue}
    var L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,tb=Math.max(0,(ht?ht.t:0)-6/L),sp=[Math.round(a[0]+(b[0]-a[0])*tb),Math.round(a[1]+(b[1]-a[1])*tb)];
    if(Math.hypot(sp[0]-a[0],sp[1]-a[1])>2)out.push(sp);
    red.push([hp].concat(p.slice(i)));bad++;break}
  return{p:out,n:n,bad:bad,red:red,hits:hits}}
function warnFix(f){
  if(f.red.length)notice("Aviso: a rota bateu na parede e não achei caminho livre. A parte que passou da parede ficou em vermelho e a rota para antes dela. Se a passagem for estreita e o caminho estiver certo, use o botão 'Considerar o caminho do player certo' na rota."+(f.n>0?" Outros "+f.n+" trecho(s) foram refeitos pelo caminho mais curto.":""));
  else if(f.n>0)notice("Aviso: o desenho passava por parede. Refiz o trecho pelo caminho mais curto ("+f.n+" ajuste"+(f.n>1?"s":"")+").")}
function applyFix(m,o,list,force,fresh){if(fresh)delete o.ok;if(o.ok){if(o.raw){o.p=o.raw;delete o.raw}delete o.red;delete o.hw;return{p:o.p,n:0,bad:0,red:[],hits:[]}}var base=fresh?o.p:(o.raw||o.p),f=fixPath(m,base,startFloor(m,list||[],o.n||1),force);
  if(f.n>0||f.red.length){o.raw=cpy(base);o.p=f.p}else{delete o.raw;o.p=base}
  if(f.red.length){o.red=f.red.map(function(L){return L.map(function(q){return[Math.round(q[0]),Math.round(q[1])]})});o.hw=f.hits}else{delete o.red;delete o.hw}
  warnFix(f);return f}
function okBtn(o,redo){var w=el("div",{class:"row edt"});
  if(o.ok){var t=el("p",{class:"hint"});t.textContent="Caminho marcado como certo: o app não corrige mais esta rota pela parede.";w.appendChild(t);var b=el("button",{class:"b",type:"button"});b.textContent="Voltar a checar as paredes";b.onclick=function(){delete o.ok;redo()};w.appendChild(b)}
  else if((o.red&&o.red.length)||o.raw){var b2=el("button",{class:"b primary",type:"button"});b2.textContent="Considerar o caminho do player certo";b2.onclick=function(){o.ok=true;redo()};w.appendChild(b2)}
  return w}
function redSvg(o){if(!o||!o.red||!o.red.length)return"";var h="";
  (o.hw||[]).forEach(function(s){h+='<line x1="'+s[0]+'" y1="'+s[1]+'" x2="'+s[2]+'" y2="'+s[3]+'" stroke="#ff2a2a" stroke-width="7" stroke-linecap="round" opacity=".9" pointer-events="none"/>'});
  o.red.forEach(function(L){h+='<polyline points="'+L.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="#e11d1d" stroke-width="5" stroke-dasharray="4 8" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/><circle cx="'+L[0][0]+'" cy="'+L[0][1]+'" r="9" fill="#e11d1d" stroke="#fff" stroke-width="2.5" pointer-events="none"/>'});return h}
var UIMG={smoke:"",flash:"",he:"",molotov:"",decoy:""};
function icoImg(t){var u=(S.uimg&&S.uimg[t])||UIMG[t];return u?'<image href="'+u+'" x="-14" y="-14" width="28" height="28" preserveAspectRatio="xMidYMid meet"/>':ICO[t]}
function carryDraw(ents,tt){var cm=S.cm||"auto";if(cm==="off")return"";var g={},h="",k;
  ents.forEach(function(x){var a=ltimeG(x.u,x.e);if(!a)return;var sv=x.e.sh!=null&&String(x.e.sh).trim()!==""?ptE(x.e.sh):NaN,st=cm==="sempre"?0:(sv>=0?sv:Math.max(0,a[0]-1.2));if(tt<st||tt>=a[0])return;(g[x.k]=g[x.k]||{P:x.P,l:[]}).l.push({u:x.u,a:a[0]})});
  for(k in g){var l=g[k].l.sort(function(a,b){return a.a-b.a}).slice(0,4),P=g[k].P,n=l.length;l.forEach(function(o,i){h+='<g transform="translate('+(P[0]+(i-(n-1)/2)*30).toFixed(1)+' '+(P[1]+38).toFixed(1)+') scale('+(0.95*SZ("held")).toFixed(2)+')" pointer-events="none"><circle r="12" fill="#000" fill-opacity=".5"/>'+icoHeld(o.u.t)+"</g>"})}
  return h}
function cmSel(cb){var wr=el("label",{class:"sl"}),s=el("select");wr.appendChild(document.createTextNode("Utilitárias no jogador "));[["auto","Automático (no horário)"],["sempre","Sempre ligado"],["off","Desligado"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===(S.cm||"auto"))op.selected=true;s.appendChild(op)});s.onchange=function(){S.cm=s.value;save();cb()};wr.appendChild(s);return wr}
function SZ(k){var v=S.sz&&+S.sz[k];return v>0?v:1}
function szCtl(cb){var wr=el("span",{class:"row"});
  [["tr","Rastro"],["pl","Jogador"],["held","Utilitária na mão"]].forEach(function(k){var lb=el("label",{class:"sl"}),s=el("select");lb.appendChild(document.createTextNode(k[1]+" "));
    [[.5,"50%"],[.7,"70%"],[.85,"85%"],[1,"100%"],[1.25,"125%"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(Math.abs(o[0]-SZ(k[0]))<.01)op.selected=true;s.appendChild(op)});
    s.onchange=function(){S.sz=S.sz||{};S.sz[k[0]]=parseFloat(s.value);save();cb()};lb.appendChild(s);wr.appendChild(lb)});return wr}
function icoHeld(t){var u=(S.uimg&&S.uimg[t])||UIMG[t];if(u)return'<image href="'+u+'" x="-14" y="-14" width="28" height="28" preserveAspectRatio="xMidYMid meet"/>';
  return'<g transform="scale(.8)">'+ICO[t]+'</g><circle r="14.5" fill="none" stroke="#fff" stroke-width="1.7" stroke-dasharray="3.5 3"/>'}
function icoT(t){var u=S.uimgT&&S.uimgT[t];return u?'<image href="'+u+'" x="-14" y="-14" width="28" height="28" preserveAspectRatio="xMidYMid meet"/>':ICO[t]}
var DROP_NAT=16,DROP_JIT=4;
function fadeOp(age,s){return age<=0?1:age===1?1-.5*s:age===2?.5*(1-s):0}
var UCOL={smoke:"#c9d1d6",flash:"#f5d000",molotov:"#f0771c",he:"#3d9a52",decoy:"#9b5de5"};
function tstrip(get,seek,bounds){var s=el("div",{class:"tstrip"}),key="";
  s.rf=function(tot){var ev=[];(get()||[]).forEach(function(o){var a=ltimeG(o.u,o.e);if(a)ev.push({o:o,a:a})});var bd=bounds?bounds():[];
    var k=Math.round(tot*10)+"|"+bd.map(function(b){return Math.round(b.t*10)}).join(",")+"|"+ev.map(function(x){return x.o.u.t+x.a[0]+"_"+x.a[1]+(x.o.u.nm||"")}).join(",");if(k===key)return;key=k;s.innerHTML="";if(!(tot>0))return;
    function pos(x){return Math.min(100,Math.max(0,x/tot*100))+"%"}
    if(bd.length>1)bd.forEach(function(b){var l=el("i",{class:"pb"});l.style.left=pos(b.t);var t2=el("span",{class:"pbl"});t2.textContent="P"+b.n;l.appendChild(t2);s.appendChild(l)});
    ev.forEach(function(x){[[x.a[0],"th","lança "],[x.a[1],"ld","cai "]].forEach(function(q){
      var d=el("button",{class:"tk "+q[1],type:"button",title:(x.o.u.nm||UN[x.o.u.t])+" · "+q[2]+fmtT(115-q[0]),"aria-label":(x.o.u.nm||UN[x.o.u.t])+" "+q[2]+fmtT(115-q[0])});
      d.style.left=pos(q[0]);d.style.setProperty("--c",UCOL[x.o.u.t]||"#fff");d.onclick=function(){seek(q[0])};s.appendChild(d)})});
    [0,.25,.5,.75,1].forEach(function(f,i){var tl=el("span",{class:"tl"});tl.textContent=fmtT(115-tot*f);tl.style.left=(f*100)+"%";tl.style.transform=i===0?"none":i===4?"translateX(-100%)":"translateX(-50%)";s.appendChild(tl)})};
  return s}
function pEnd(v,t0){v=String(v==null?"":v).trim();if(!v)return NaN;if(v.indexOf(":")>=0){var c=pc(v);return c>=0&&c<=115?115-c:NaN}var n=+v.replace(",",".");return n>0?t0+n:NaN}
function qdur(m,q,spd,t0,c0){var v=String(q.tv==null?"":q.tv).trim(),n=NaN;
  if(v){if(v.indexOf(":")>=0){var c=pc(v);if(c>=0&&c<=115)n=115-c-t0-c0}else{var x=pc(v);if(x>0)n=x-c0}}
  if(n>0)return[n,true];if(q.tw>0)return[q.tw,true];return[plen2(m,q.p)/spd,false]}
function scrub(on){
  var w=el("div",{class:"scrub",role:"slider",tabindex:"0","aria-label":"Tempo","aria-valuemin":"0"}),fl=el("i",{class:"sf"}),hd=el("i",{class:"sh"}),mx=0,v=0,dr=false;
  w.appendChild(el("i",{class:"sk"}));w.appendChild(fl);w.appendChild(hd);
  function at(e){var r=w.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*mx}
  w.set=function(val,max){mx=max>0?max:0;v=Math.max(0,Math.min(mx,val||0));var q=mx>0?v/mx*100:0;fl.style.width=q+"%";hd.style.left=q+"%";w.setAttribute("aria-valuemax",String(mx));w.setAttribute("aria-valuenow",String(v))};
  w.onpointerdown=function(e){if(!(mx>0))return;dr=true;w.setPointerCapture(e.pointerId);on(at(e));e.preventDefault()};
  w.onpointermove=function(e){if(dr)on(at(e))};
  w.onpointerup=w.onpointercancel=function(){dr=false};
  w.onkeydown=function(e){var st=mx/100;if(e.key==="ArrowRight"||e.key==="ArrowUp"){on(Math.min(mx,v+st));e.preventDefault()}else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){on(Math.max(0,v-st));e.preventDefault()}};
  w.set(0,0);return w}
function sched2(m,items,np,pe,laneOf,spd){
  var D=[],T=[],del=[],man=[],t=0;pe=pe||[];
  for(var k=1;k<=np;k++){var cur={},mx=0;
    items.forEach(function(q,i){if((q.n||1)!==k)return;var l=laneOf(q),c0=cur[l]||0,rr=qdur(m,q,spd,t,c0),du=rr[0];del[i]=[c0,du];man[i]=rr[1];cur[l]=c0+du;if(cur[l]>mx)mx=cur[l]});
    var e=pEnd(pe[k-1],t);D[k]=(e>t+.5)?e-t:Math.max(mx,1.5);T[k]=t;t+=D[k]}
  return{D:D,T:T,tot:t,del:del,man:man}}
function ask(msg,yes,inp){
  var o=el("div",{class:"ov"}),b=el("div",{class:"dlg",role:"dialog","aria-modal":"true"}),p=el("p");p.textContent=msg;b.appendChild(p);
  var i=null;if(inp){i=el("input",{"aria-label":msg});i.style.border="1px solid var(--line)";b.appendChild(i)}
  var r=el("div",{class:"row"});r.style.marginTop="12px";
  var ok=el("button",{class:"b primary"}),no=el("button",{class:"b"});ok.textContent=inp?"Criar":"Confirmar";no.textContent="Cancelar";
  function close(){o.remove()}
  ok.onclick=function(){var v=i?i.value.trim():true;close();if(v)yes(v)};no.onclick=close;
  r.appendChild(ok);r.appendChild(no);b.appendChild(r);o.appendChild(b);document.body.appendChild(o);(i||ok).focus()}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ensure(m){if(!m.calls)m.calls={tr:[newDef(1,"Call")],ct:[newDef(1,"Call")]};if(!m.ut)m.ut={tr:{s:[],u:[]},ct:{s:[],u:[]}};if(!m.fx)m.fx={tr:[1,2,3,4,5].map(function(n){return newDef(n,"Round")}),ct:[1,2,3,4,5].map(function(n){return newDef(n,"Round")})};if(!m.tm)m.tm={tr:{sp:[],r:[]},ct:{sp:[],r:[]}};if(!m.co)m.co=[];if(!m.dw)m.dw={tr:{s:[]},ct:{s:[]}};if(!m.igl)m.igl={tr:"",ct:""};if(!m.ar)m.ar={tr:[],ct:[]};if(!m.ab)m.ab={tr:[newDef(1,"Abertura")],ct:[newDef(1,"Abertura")]};if(!m.bd)m.bd={A:[],B:[]};if(!m.wl)m.wl=[];if(!m.wu)m.wu=[];if(!m.wm)m.wm=[];if(!m.zn)m.zn=[];if(!m.vz)m.vz=[];if(!m.vzr)m.vzr=[];migVz(m);if(!m.bp)m.bp={A:null,B:null};if(!m.tms)m.tms={tr:[],ct:[]}}
var SCALE={dust2:4.4,mirage:5,inferno:4.9,nuke:7,ancient:5,anubis:5.22,overpass:5.2,vertigo:4,train:4.082077,cache:5.5};
function scaleOf(m){return m.sc||SCALE[(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,"")]||5}
function pname(i){return(S.pn&&S.pn[i])||("Jogador "+(i+1))}
var FLOOR=0,PCOL={},who=0,sec="defs",SEC={defs:"Default",fixo:"Fixo (R1-5)",calls:"Calls",utils:"Utilitárias",draw:"Desenho",timing:"Timing",open:"Aberturas",callouts:"Callouts",igl:"IGL",demo:"Demo",d2:"Demo 2D",cmp:"Comparação",treino:"Treino",cfg:"Configurações"};
var fxp=["G","G","G","G"],showSp=true;
function spMarks(m,d){if(!showSp)return"";var T=m.tm&&m.tm[side];if(!T||!T.sp)return"";var h="";
  T.sp.forEach(function(s,i){var lb=[];if(d)for(var c=0;c<5;c++){var v=d.rs&&d.rs[c]!=null?d.rs[c]:(c<T.sp.length?c:-1);if(v===i)lb.push("P"+(c+1))}
    if(lb.length)h+='<text x="'+s.x+'" y="'+(s.y-12)+'" font-size="9" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".6" paint-order="stroke" pointer-events="none">'+lb.join(",")+'</text>';h+='<circle cx="'+s.x+'" cy="'+s.y+'" r="8" fill="'+COLORS[i%5]+'" stroke="#fff" stroke-width="1.5" pointer-events="none"/><text x="'+s.x+'" y="'+(s.y+3.5)+'" font-size="10" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".5" paint-order="stroke" pointer-events="none">'+(i+1)+'</text>'});return h}
function callName(p,i){var n=p&&p.name;return n&&!/^Jogador \d+$/.test(n)?n:"Player "+(i+1)}
function fxVar(d,di){if(!di)return d;var key=fxp.slice(0,di).join("");if(/^G*$/.test(key))return d;d.v=d.v||{};if(!d.v[key]){var n=newDef(di+1,"Round");n.name=d.name;d.v[key]=n}return d.v[key]}
function fxBar(){var w=el("div",{class:"def"}),h=el("p",{class:"hint"}),row=el("div",{class:"fld"});
  h.textContent="Escolha como foram os rounds anteriores. Cada combinação de ganhou/perdeu tem o seu próprio conteúdo nos rounds seguintes (economia). O que já estava escrito ficou na combinação em que ganhou todos.";w.appendChild(h);
  [1,2,3,4].forEach(function(r){var wr=el("div",{class:"row"}),lb=el("strong");lb.textContent="Round "+r+":";wr.appendChild(lb);
    [["G","Ganhou"],["P","Perdeu"]].forEach(function(o){var b=el("button",{class:"tool",type:"button","aria-pressed":fxp[r-1]===o[0]});b.textContent=o[1];b.onclick=function(){fxp[r-1]=o[0];render()};wr.appendChild(b)});row.appendChild(wr)});
  w.appendChild(row);return w}
function dseg2(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0,x=a[0]+t*dx-p[0],y=a[1]+t*dy-p[1];return Math.sqrt(x*x+y*y)}
function drawView(m){
  var d=m.dw[side];d.s=d.s||[];
  var w=el("div",{class:"mm"}),tb=el("div",{class:"tb edt"}),svg=mksvg(m),ci=0,wd=5,era=false,er=false,cs=null,hist=[],R=30;
  var ring=document.createElementNS("http://www.w3.org/2000/svg","circle");ring.setAttribute("r",R);ring.setAttribute("fill","rgba(255,255,255,.25)");ring.setAttribute("stroke","#fff");ring.setAttribute("stroke-width","3");ring.style.pointerEvents="none";ring.style.display="none";
  function paint(){var h=bg(m);d.s.forEach(function(q){h+='<polyline points="'+q.p.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="'+COLORS[q.c%5]+'" stroke-width="'+(q.w||5)+'" stroke-linecap="round" stroke-linejoin="round"/>'});svg.innerHTML=h;if(era)svg.appendChild(ring)}
  function bar(){tb.innerHTML="";
    COLORS.forEach(function(c,i){var b=el("button",{class:"tool",type:"button","aria-pressed":!era&&ci===i});b.innerHTML='<i class="sw" style="--c:'+c+'"></i><span>Cor '+(i+1)+'</span>';b.onclick=function(){ci=i;era=false;bar();paint()};tb.appendChild(b)});
    [[3,"Fino"],[5,"Médio"],[9,"Grosso"]].forEach(function(o){var b=el("button",{class:"tool",type:"button","aria-pressed":wd===o[0]});b.textContent=o[1];b.onclick=function(){wd=o[0];bar()};tb.appendChild(b)});
    var eb=el("button",{class:"tool",type:"button","aria-pressed":era});eb.textContent="Borracha";eb.onclick=function(){era=!era;bar();paint()};tb.appendChild(eb);
    var ub=el("button",{class:"tool",type:"button"});ub.textContent="Desfazer";ub.onclick=function(){if(hist.length){d.s=JSON.parse(hist.pop());save();paint()}};tb.appendChild(ub);
    var lb=el("button",{class:"tool",type:"button"});lb.textContent="Limpar";lb.onclick=function(){ask("Apagar todo o desenho?",function(){hist.push(JSON.stringify(d.s));d.s=[];save();paint()})};tb.appendChild(lb)}
  function erase(p){var out=[];
    d.s.forEach(function(q){if(q.p.length<2){if(Math.hypot(q.p[0][0]-p[0],q.p[0][1]-p[1])>R)out.push(q);return}
      var run=[q.p[0]];for(var i=1;i<q.p.length;i++){if(dseg2(p,q.p[i-1],q.p[i])>R){if(!run.length)run=[q.p[i-1]];run.push(q.p[i])}else{if(run.length>1)out.push({c:q.c,w:q.w,p:run});run=[]}}
      if(run.length>1)out.push({c:q.c,w:q.w,p:run})});d.s=out}
  function rg(p){ring.setAttribute("cx",p[0]);ring.setAttribute("cy",p[1]);ring.style.display="block"}
  svg.onpointerdown=function(e){if(RO||LOCK)return;var p=ptr(svg,e);hist.push(JSON.stringify(d.s));if(hist.length>30)hist.shift();
    if(era){er=true;svg.setPointerCapture(e.pointerId);erase(p);paint();rg(p);return}
    cs={c:ci,w:wd,p:[p]};d.s.push(cs);svg.setPointerCapture(e.pointerId);paint()};
  svg.onpointermove=function(e){var p=ptr(svg,e);if(era){if(er){erase(p);paint()}rg(p);return}
    if(!cs)return;var l=cs.p[cs.p.length-1];if(Math.abs(p[0]-l[0])+Math.abs(p[1]-l[1])>5){cs.p.push(p);paint()}};
  svg.onpointerleave=function(){ring.style.display="none"};
  svg.onpointerup=svg.onpointercancel=function(){if(er){er=false;save();paint();return}if(cs){if(cs.p.length<2)d.s.pop();cs=null;save();paint()}};
  bar();paint();w.appendChild(tb);w.appendChild(svg);return w}
function choiceEd(m,d){
  d.ch=d.ch||[];var w=el("div",{class:"uc"}),h=el("strong"),hint=el("p",{class:"hint"}),list=el("div",{class:"ulist"});
  h.textContent="Escolhas durante o replay";hint.textContent="No Replay, ao terminar a parte escolhida, tudo para e aparecem botões em cima do mapa. Cada opção tem o seu próprio desenho (com partes), salvo dentro deste mesmo default.";
  function draw(){list.innerHTML="";
    d.ch.forEach(function(c,ci){var box=el("div",{class:"uc"}),row=el("div",{class:"row"}),ns=[];for(var i=1;i<=Math.max(d.np||1,c.n||1);i++)ns.push([i,String(i)]);
      row.appendChild(pickL("Depois da parte",ns,c.n||1,function(v){c.n=parseInt(v,10);save()}));
      var q=field("input",c.q||"","Pergunta (ex: o que o inimigo fez?)",function(v){c.q=v});q.style.flex="1";row.appendChild(q);
      row.appendChild(rmBtn("Remover escolha","Remover esta escolha e todas as opções dela?",function(){d.ch.splice(ci,1);save();draw()}));box.appendChild(row);
      c.o=c.o||[];c.o.forEach(function(o,oi){var r2=el("div",{class:"row"}),host=el("div"),nm=field("input",o.nm||"","Nome da opção",function(v){o.nm=v});nm.style.flex="1";r2.appendChild(nm);
        var eb=el("button",{class:"b edt",type:"button"});eb.textContent="Editar desenho";
        eb.onclick=function(){if(host.firstChild){host.innerHTML="";eb.textContent="Editar desenho";return}
          Object.defineProperty(o,"players",{value:d.players,enumerable:false,writable:true,configurable:true});Object.defineProperty(o,"nn",{get:function(){return d.nn},enumerable:false,configurable:true});Object.defineProperty(o,"rs",{get:function(){return d.rs},enumerable:false,configurable:true});host.appendChild(minimap(m,o));eb.textContent="Fechar desenho"};
        r2.appendChild(eb);r2.appendChild(rmBtn("Tirar","Tirar esta opção?",function(){c.o.splice(oi,1);save();draw()}));box.appendChild(r2);box.appendChild(host);box.appendChild(nestCh(m,d,o))});
      var ao=el("button",{class:"b edt",type:"button"});ao.textContent="+ Opção";ao.onclick=function(){c.o.push({nm:"Opção "+(c.o.length+1)});save();draw()};box.appendChild(ao);list.appendChild(box)})}
  var ac=el("button",{class:"b edt",type:"button"});ac.textContent="+ Escolha";ac.onclick=function(){d.ch.push({n:d.np||1,q:"",o:[{nm:"Opção 1"},{nm:"Opção 2"}]});save();draw()};
  draw();w.appendChild(h);w.appendChild(hint);w.appendChild(list);w.appendChild(ac);w.style.marginTop="12px";return w}
function radarOf(m){return m.radar||(typeof RADARS!=="undefined"&&RADARS[(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,"")])||""}
function bg(m,ou,ol){if(ou===undefined&&ol===undefined&&hasFl(m)){var o0=fvOps();ou=o0[0];ol=o0[1]}var rd=radarOf(m),kk=(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,""),lw=ol>0&&RADARS_L[kk];if(rd&&lw&&!(ou>0)&&ol>=1&&RADARS_LO[kk])return'<rect width="1000" height="1000" fill="#000"/><image href="'+RADARS_LO[kk]+'" x="0" y="0" width="1000" height="1000"/>';if(rd&&lw)return'<rect width="1000" height="1000" fill="#000"/><image href="'+rd+'" x="0" y="0" width="1000" height="1000" opacity="'+(ou==null?1:ou)+'"/><image href="'+lw+'" x="0" y="0" width="1000" height="1000" opacity="'+ol+'" style="mix-blend-mode:lighten"/>';return rd?'<image href="'+rd+'" x="0" y="0" width="1000" height="1000"/>':'<rect width="1000" height="1000" style="fill:var(--bg)"/><path d="M0 250H1000M0 500H1000M0 750H1000M250 0V1000M500 0V1000M750 0V1000" style="stroke:var(--line)" stroke-width="2"/><text x="500" y="520" text-anchor="middle" font-size="150" font-weight="800" style="fill:var(--line)">'+esc(m.name)+'</text>'}
function zmOf(m){return(m&&m.__b&&m.__b.zm)||(m&&m.zm)||null}
function vbOf(m){var z=zmOf(m);if(!z||!(z.z>1.001))return"0 0 1000 1000";var w=1000/z.z,h=w/2,cx=Math.max(h,Math.min(1000-h,z.cx==null?500:z.cx)),cy=Math.max(h,Math.min(1000-h,z.cy==null?500:z.cy));return(cx-h).toFixed(1)+" "+(cy-h).toFixed(1)+" "+w.toFixed(1)+" "+w.toFixed(1)}
function mksvg(m){var s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox",vbOf(m));s.setAttribute("class","map");s.setAttribute("role","img");s.setAttribute("aria-label","Mapa "+m.name);return s}
function ptr(s,e){var r=s.getBoundingClientRect(),v=(s.getAttribute("viewBox")||"0 0 1000 1000").split(/\s+/).map(Number);return[Math.round(v[0]+(e.clientX-r.left)/r.width*v[2]),Math.round(v[1]+(e.clientY-r.top)/r.height*v[3])]}
function fmtT(x){x=Math.max(0,Math.round(x));var a=Math.floor(x/60),b=x%60;return a+":"+(b<10?"0":"")+b}
function pc(s){s=String(s).trim();if(!s)return NaN;var a=s.split(":");return a.length>1?(+a[0])*60+(+a[1]):+s.replace(",",".")}
function plen2(m,p){var L=0;for(var i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return L*1.024*scaleOf(m)}
function posAtG(p,f){var L=0,i,s;for(i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);var g=f*L;
  for(i=1;i<p.length;i++){s=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(g<=s||i===p.length-1){var k=s?Math.min(1,g/s):1;return[p[i-1][0]+(p[i][0]-p[i-1][0])*k,p[i-1][1]+(p[i][1]-p[i-1][1])*k]}g-=s}return p[0]}
var ULIFE={smoke:20,molotov:7,decoy:15,flash:1,he:1};
function ulife(u,e){if(u.t==="molotov"){var k=(e&&e.kind)||(side==="ct"?"incendiary":"molotov");return k==="incendiary"?5.5:7}return ULIFE[u.t]||1}
function ptE(v){v=String(v==null?"":v).trim();if(!v)return NaN;if(v.indexOf(":")>=0){var c=pc(v);return c>=0&&c<=115?115-c:NaN}var n=+v.replace(",",".");return n>=0?n:NaN}
function r1(x){return String(Math.round(x*10)/10).replace(".",",")}
function flightOf(u,e){
  function n(v){v=v==null?"":String(v).trim().replace(",",".");return v!==""&&+v>0?+v:NaN}
  var a=n(e&&e.ft);if(a>0)return a;
  var L=ulinks(u)||[],b=L[(e&&e.lk)|0]?n(L[(e&&e.lk)|0].ft):NaN;
  if(!(b>0))for(var i=0;i<L.length&&!(b>0);i++)b=n(L[i].ft);
  if(b>0)return b;
  return(u.t==="smoke"||u.t==="decoy")?4.5:1.5}
function ltimeG(u,e){if(!e||typeof e!=="object")return null;var th=ptE(e.tm);if(!(th>=0))return null;var ld=ptE(e.ld),la=ld>=0?Math.max(th,ld):th+flightOf(u,e);return[th,la,la+ulife(u,e)]}
function lstate(a,tt){return!a?1:tt<a[0]?0:tt<a[1]?.4:tt<a[2]?1:0}
function allU(m){return m.ut[side].u.concat(m.ut[side==="tr"?"ct":"tr"].u)}
function findU(m,n){n=(n||"").trim().toLowerCase();return allU(m).filter(function(x){return(x.nm||"").trim().toLowerCase()===n})[0]}
var UL_AUTO=30,UL_FAR=250,UL_REC=40;
function ulSide(m,u){return m.ut.tr.u.indexOf(u)>=0?"tr":"ct"}
function ulSnap(m,u){return{t:u.t,x:u.x,y:u.y,s:ulSide(m,u)}}
function ulEach(o,fn,dp){if(!o||typeof o!=="object"||dp>9)return;if(Array.isArray(o)){o.forEach(function(x){ulEach(x,fn,dp+1)});return}
  Object.keys(o).forEach(function(k){if(k.charAt(0)==="_")return;var v=o[k];if(k==="ul"&&Array.isArray(v))fn(v,o);else if(v&&typeof v==="object")ulEach(v,fn,dp+1)})}
function ulCands(m,e,sameSide,used){if(!e.rf||!m.ut)return[];var o=[];
  ["tr","ct"].forEach(function(sd){if(sameSide&&e.rf.s&&sd!==e.rf.s)return;(m.ut[sd].u||[]).forEach(function(u){if(u.t!==e.rf.t||!(u.nm||"").trim())return;if(used&&used[(u.nm||"").trim().toLowerCase()])return;o.push({u:u,s:sd,d:Math.hypot(u.x-e.rf.x,u.y-e.rf.y)})})});
  return o.sort(function(a,b){return a.d-b.d})}
function ulRelink(m,e,u){e.old=e.n;e.n=u.nm;e.rf=ulSnap(m,u);var L=ulinks(u);if((e.lk|0)>=L.length)e.lk=0}
function ulHeal(m,canFix){var r={fixed:0,dirty:false};if(!m||!m.ut||!m.ut.tr||!m.ut.ct)return r;
  ulEach(m,function(list){var used={};list.forEach(function(e){if(e&&typeof e==="object"&&findU(m,e.n))used[(e.n||"").trim().toLowerCase()]=1});
    list.forEach(function(e){if(!e||typeof e!=="object")return;var u=findU(m,e.n);
      if(u){if(!canFix)return;var sn=ulSnap(m,u),o=e.rf;if(!o||o.t!==sn.t||o.x!==sn.x||o.y!==sn.y||o.s!==sn.s){e.rf=sn;r.dirty=true}return}
      if(!canFix||!e.rf)return;var c=ulCands(m,e,true,used),b=c[0],s2=c[1];
      if(b&&b.d<=UL_AUTO&&(!s2||s2.d>UL_AUTO||b.d<=s2.d*0.7)){ulRelink(m,e,b.u);used[(b.u.nm||"").trim().toLowerCase()]=1;r.fixed++;r.dirty=true}})});
  return r}
function ulFixUI(m,d,e,c,draw,ch){if(RO)return;var bx=el("div",{class:"row edt"}),mp=el("span",{class:"hint"});
  if(!e.rf){mp.textContent="Esta utilitária não existe mais com esse nome e eu não guardei onde ela ficava. Digite o nome certo na caixa abaixo ou tire daqui.";bx.appendChild(mp);c.appendChild(bx);return}
  var cd=ulCands(m,e,false,null);
  if(!cd.length){mp.textContent="A utilitária sumiu e não há outra do mesmo tipo ("+UN[e.rf.t]+") neste mapa, então não tem o que puxar. Tire daqui ou crie de novo na aba Utilitárias. O horário fica guardado aqui.";bx.appendChild(mp);c.appendChild(bx);return}
  mp.textContent="O nome mudou ou sumiu. Mais próximas do mesmo tipo ("+UN[e.rf.t]+"), mantendo o horário:";bx.appendChild(mp);
  var sl=el("select",{class:"sel","aria-label":"Utilitária mais próxima"});
  cd.slice(0,6).forEach(function(k,i){var op=el("option",{value:i});op.textContent=k.u.nm+" ("+(k.s==="ct"?"CT":"TR")+") · a "+Math.round(k.d)+" pts"+(k.d>UL_FAR?" (longe)":"");sl.appendChild(op)});
  var ub=el("button",{class:"b primary",type:"button"});ub.textContent="Colocar a mais próxima";
  ub.onclick=function(){ulRelink(m,e,cd[+sl.value].u);save();draw();ch()};
  bx.appendChild(sl);bx.appendChild(ub);c.appendChild(bx)}
function utilLink(m,d,who){
  d.ul=(d.ul||[]).map(function(x){return typeof x==="string"?{n:x,tm:""}:x});
  var w=el("div",{class:"ulk"}),t0=el("p",{class:"hint"}),l=el("div",{class:"ulist"}),r=el("div",{class:"row edt"}),dl=el("datalist",{id:"dl"+Math.random().toString(36).slice(2)});
  var ia=el("input",{list:dl.id,placeholder:"Nome da utilitária deste mapa (ex: smoke do meio)","aria-label":"Vincular utilitária"});ia.style.flex="1";
  function all(){return allU(m)}
  t0.textContent="Utilitárias (puxadas pelo nome da aba Utilitárias). Hora: 1:50 = relógio; só 5 = segundos desde o Play.";w.appendChild(t0);
  function ch(){if(w.onchg)w.onchg()}
  all().forEach(function(u){if(u.nm)dl.appendChild(el("option",{value:u.nm}))});
  function draw(){l.innerHTML="";d.ul.forEach(function(e,i){
    var nm=e.n||"",u=all().filter(function(x){return(x.nm||"").trim().toLowerCase()===nm.trim().toLowerCase()})[0],c=el("div",{class:"uc"}),h=el("div",{class:"row"});
    h.innerHTML=(u?'<svg viewBox="-12 -12 24 24" width="24" height="24">'+ICO[u.t]+'</svg>':'')+'<strong>'+esc(nm)+'</strong><span class="hint">'+(u?UN[u.t]:"não achei com esse nome neste mapa")+'</span>';
    if(u)ulinks(u).forEach(function(L,li){if(L.u&&String(L.u).trim())h.appendChild(linkBtn(function(){return L.u},{label:L.n||("Link "+(li+1)),title:function(){return L.n||"Link"}}))});
    var hb=el("button",{class:"b edt",type:"button"});hb.textContent=e.hid?"Mostrar no mapa":"Esconder do mapa";hb.onclick=function(){e.hid=!e.hid;save();draw();ch()};h.appendChild(hb);if(e.hid)c.className="uc off";var x=el("button",{class:"b danger"});x.textContent="Tirar";x.onclick=function(){d.ul.splice(i,1);save();draw();ch()};h.appendChild(x);c.appendChild(h);
    if(!u)ulFixUI(m,d,e,c,draw,ch);
    if(u&&u.tx){var p=el("p",{class:"hint"});p.textContent=u.tx;c.appendChild(p)}
    if(u){var tr=el("div",{class:"row"}),inf=el("p",{class:"hint"});
      function up(){var a=ltimeG(u,e);inf.textContent=a?"lança no seg "+r1(a[0])+" (relógio "+fmtT(115-a[0])+") · cai no seg "+r1(a[1])+" ("+fmtT(115-a[1])+") · some no seg "+r1(a[2])+" ("+fmtT(115-a[2])+")":"sem hora de lançamento: aparece o tempo todo";if(who&&a&&(e.th===""||e.th==null||e.th===undefined))inf.textContent+=" · escolha quem lança para ele sobrevoar até o alvo"}
      if(u.t==="molotov"){var ks=el("select",{class:"sel","aria-label":"Molotov ou incendiária"});ks.disabled=RO;
        [["molotov","Molotov (7 s)"],["incendiary","Incendiária (5,5 s)"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===(e.kind||(side==="ct"?"incendiary":"molotov")))op.selected=true;ks.appendChild(op)});
        ks.onchange=function(){e.kind=ks.value;save();up();ch()};tr.appendChild(ks)}
      var lks=ulinks(u);if(lks.length>1){var ls2=el("select",{class:"sel","aria-label":"Lançar de qual lugar"});ls2.disabled=RO;lks.forEach(function(L,li){var op=el("option",{value:li});op.textContent=(L.n||("Link "+(li+1)))+(String(L.ft==null?"":L.ft).trim()?" · cai em "+L.ft+" s":"");if((e.lk|0)===li)op.selected=true;ls2.appendChild(op)});ls2.onchange=function(){e.lk=+ls2.value;save();up();ch()};tr.appendChild(ls2)}
      if(who){var ws=el("select",{class:"sel","aria-label":"Quem lança"});ws.disabled=RO;var o0=el("option",{value:""});o0.textContent="Quem lança?";ws.appendChild(o0);
        [0,1,2,3,4].forEach(function(i){var op=el("option",{value:i});op.textContent=pname(i);if(String(e.th)===String(i))op.selected=true;ws.appendChild(op)});(d.en||[]).forEach(function(en2,i){var op=el("option",{value:"e"+i});op.textContent="Inimigo "+(i+1);if(String(e.th)==="e"+i)op.selected=true;ws.appendChild(op)});
        ws.onchange=function(){e.th=ws.value;save();up();ch()};tr.appendChild(ws)}
      [["tm","Lançada em (1:50 ou 5)"],["ld","Cai em (1:47 ou 8)"],["ft","Tempo até cair em s (vazio = o do link)"],["sh","Aparece no jogador em (vazio = 1,2 s antes)"]].forEach(function(k){var f=field("input",e[k[0]]||"",k[1],function(v){e[k[0]]=v;up();ch()});f.style.flex="1";tr.appendChild(f)});
      up();c.appendChild(tr);c.appendChild(inf)}
    l.appendChild(c)})}
  var ab=el("button",{class:"b"});ab.textContent="Colocar utilitária";ab.onclick=function(){var v=ia.value.trim();if(!v)return;var u0=findU(m,v);d.ul.push(u0?{n:v,tm:"",rf:ulSnap(m,u0)}:{n:v,tm:""});ia.value="";save();draw();ch()};
  r.appendChild(ia);r.appendChild(ab);var ha=el("button",{class:"b edt",type:"button"});ha.textContent="Esconder todas";ha.onclick=function(){d.ul.forEach(function(e){e.hid=true});save();draw();ch()};var sa=el("button",{class:"b edt",type:"button"});sa.textContent="Mostrar todas";sa.onclick=function(){d.ul.forEach(function(e){e.hid=false});save();draw();ch()};var br2=el("div",{class:"row edt"});br2.appendChild(ha);br2.appendChild(sa);w.appendChild(br2);w.rd=draw;w.appendChild(l);w.appendChild(r);w.appendChild(dl);draw();return w}
function lanOn(){return S.lan!==false}
function wallsOn(){return S.wv!==false}
function lanBtn(){var b=el("button",{class:"tool",type:"button","aria-pressed":lanOn()});b.textContent="Lanterna (campo de visão)";b.onclick=function(){S.lan=!lanOn();save();render()};return b}
function wallBtn(){var b=el("button",{class:"tool",type:"button","aria-pressed":wallsOn()});b.textContent="Paredes visíveis";b.onclick=function(){S.wv=!wallsOn();save();render()};return b}
function lkA(d,c,part){var L=d.lk||{};for(var k=part;k>=1;k--){var v=L[c+"_"+k];if(v!=null)return+v}return null}
function cone(d,c){var z=(d.lz||{})[c]||{};return{r:z.r>0?+z.r:160,f:z.f>0?+z.f:70}}
function num(v,df){v=parseFloat(String(v==null?"":v).replace(",","."));return isNaN(v)?df:v}
function lkAt(d,c,S0,np,t){var rp=1,j;for(j=1;j<=np;j++)if(S0.T[j]<=t+1e-9)rp=j;
  var cur=lkA(d,c,rp);if(cur==null)return null;
  if(rp>1&&(d.lk||{})[c+"_"+rp]!=null){var pv=lkA(d,c,rp-1);if(pv!=null){var q=(d.lt||{})[c+"_"+rp]||{},st=Math.max(0,num(q.s,0)),du=Math.max(0,num(q.d,.5)),u=du<=0?1:Math.max(0,Math.min(1,(t-S0.T[rp]-st)/du)),df=((cur-pv+540)%360)-180;return(pv+df*u+360)%360}}
  return cur}
var FLN=["Inferior","Superior","Mista"];
function wlOf(m,f){if(f===2){if(!m.wm)m.wm=[];return m.wm}if(f){if(!m.wu)m.wu=[];return m.wu}return m.wl}
function floorBtn(cb){var b=el("button",{class:"tool",type:"button","aria-pressed":FLOOR>0,title:"Escolhe o tipo de parede que você desenha"});b.textContent="Parede: "+FLN[FLOOR]+" (trocar)";b.onclick=function(){FLOOR=(FLOOR+1)%3;cb()};return b}
function wallSvg(m,f){if(!wallsOn())return"";f=f==null?FLOOR:f;var cols=["#111","#1d4ed8","#9333ea"],L=[m.wl,m.wu,m.wm];
  return[0,1,2].sort(function(a,b){return((f<0||f===a)?1:0)-((f<0||f===b)?1:0)}).map(function(i){var act=f<0||f===i,op=act?1:(FV.iso&&hasFl(m)&&f<2&&i!==2?0:(i===2?.65:.28)),k=act?1:.7;
    return(L[i]||[]).map(function(p){var q=p.map(function(a){return a.join(",")}).join(" ");return'<polyline points="'+q+'" fill="none" stroke="#fff" stroke-width="'+(9*k)+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+(.85*op).toFixed(2)+'" pointer-events="none"/><polyline points="'+q+'" fill="none" stroke="'+cols[i]+'" stroke-width="'+(4*k)+'"'+(i===2?' stroke-dasharray="10 5"':'')+' stroke-linecap="round" stroke-linejoin="round" opacity="'+op+'" pointer-events="none"/>'}).join("")}).join("")}
function dimSvg(m,ff,id){var Z=(m.zn||[]).filter(function(z){return z.p&&z.p.length>2});if(ff==null||ff<0||!Z.length)return"";
  var oth=Z.filter(function(z){return(z.f|0)!==ff}),mine=Z.filter(function(z){return(z.f|0)===ff});if(!oth.length)return"";
  function pg(z,c){return'<polygon points="'+z.p.map(function(a){return a.join(",")}).join(" ")+'" fill="'+c+'"/>'}
  return'<mask id="'+id+'" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="#000"/>'+oth.map(function(z){return pg(z,"#fff")}).join("")+mine.map(function(z){return pg(z,"#000")}).join("")+'</mask><rect width="1000" height="1000" fill="#000" fill-opacity=".5" mask="url(#'+id+')" pointer-events="none"/>'}
function wallSegs(m,f){var o=[];function add(L){(L||[]).forEach(function(p){for(var i=1;i<p.length;i++)o.push([p[i-1][0],p[i-1][1],p[i][0],p[i][1]])})}if(f===2||f==null){add(m.wl);add(m.wu);add(m.wm)}else{add(f?m.wu:m.wl);add(m.wm)}return o}
function segX(a,b,s){var d1x=b[0]-a[0],d1y=b[1]-a[1],d2x=s[2]-s[0],d2y=s[3]-s[1],den=d1x*d2y-d1y*d2x;if(!den)return false;var tx=s[0]-a[0],ty=s[1]-a[1],u=(tx*d2y-ty*d2x)/den,v=(tx*d1y-ty*d1x)/den;return u>=0&&u<=1&&v>=0&&v<=1}
function blocked(a,b,W){for(var i=0;i<W.length;i++)if(segX(a,b,W[i]))return true;return false}
function dSeg(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;return Math.hypot(a[0]+t*dx-p[0],a[1]+t*dy-p[1])}
function nearWall(m,p,f){var best=-1,bd=16;(wlOf(m,f==null?FLOOR:f)||[]).forEach(function(w,wi){for(var i=1;i<w.length;i++){var d=dSeg(p,w[i-1],w[i]);if(d<bd){bd=d;best=wi}}});return best}
function rng(lb,mn,mx,v,set){var l=el("label",{class:"sl"}),s=el("input",{type:"range",min:mn,max:mx,"aria-label":lb});s.value=v;s.disabled=RO;s.oninput=function(){set(+s.value);save()};l.appendChild(document.createTextNode(lb+" "));l.appendChild(s);return l}
function lkEd(d,pi,cb){d.lk=d.lk||{};d.lt=d.lt||{};d.lz=d.lz||{};d.fl=d.fl||{};var r=el("div",{class:"uc"}),pt=1;
  function k(){return pi+"_"+pt}
  function draw(){r.innerHTML="";var row=el("div",{class:"row"}),tx=el("span",{class:"hint"});
    function lab(){var v=d.lk[k()];tx.textContent=v==null?"Lanterna: sem direção nesta parte (mantém a da parte anterior)":"Olhando para "+v+"° (0 = cima, 90 = direita)"}
    row.appendChild(pickL("Parte",[1,2,3,4,5].map(function(n){return[n,"Parte "+n]}),pt,function(v){pt=+v;draw()}));
    row.appendChild(pickL("Andar",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],d.fl[k()]==null?"":d.fl[k()],function(v){if(v==="")delete d.fl[k()];else d.fl[k()]=+v;save();cb()}));
    row.appendChild(rng("Olhando",0,359,d.lk[k()]==null?0:d.lk[k()],function(v){d.lk[k()]=v;if(d.la)delete d.la[k()];lab();cb()}));row.appendChild(tx);
    var x=el("button",{class:"b edt",type:"button"});x.textContent="Sem direção";x.onclick=function(){delete d.lk[k()];save();draw();cb()};row.appendChild(x);r.appendChild(row);lab();
    if(pt>1){var tr=el("div",{class:"row"});
      var f1=field("input",(d.lt[k()]||{}).s==null?"":d.lt[k()].s,"Começa a virar (s após o início da parte, ex: 0)",function(v){(d.lt[k()]=d.lt[k()]||{}).s=v;cb()}),f2=field("input",(d.lt[k()]||{}).d==null?"":d.lt[k()].d,"Leva quantos segundos para virar (ex: 0,5)",function(v){(d.lt[k()]=d.lt[k()]||{}).d=v;cb()});
      f1.style.flex=f2.style.flex="1";tr.appendChild(f1);tr.appendChild(f2);r.appendChild(tr);
      var hh=el("p",{class:"hint"});hh.textContent="Quando a parte "+pt+" começa, a lanterna gira aos poucos da direção da parte anterior até esta. O fim de cada parte você ajusta no minimapa (tempo da parte).";r.appendChild(hh)}
    var z=cone(d,pi),sz=el("div",{class:"row"});
    sz.appendChild(rng("Tamanho",40,400,z.r,function(v){(d.lz[pi]=d.lz[pi]||{}).r=v;cb()}));sz.appendChild(rng("Abertura",20,140,z.f,function(v){(d.lz[pi]=d.lz[pi]||{}).f=v;cb()}));r.appendChild(sz)}
  draw();return r}
function siteRow(d){var r=el("div",{class:"row"});r.appendChild(pickL("Bomb",[["A","Bomb A"],["B","Bomb B"]],d.site||"A",function(v){d.site=v;save()}));r.appendChild(lanBtn());r.appendChild(wallBtn());return r}
function enEd(d,cb){var w=el("div",{class:"uc"}),l=el("div"),h=el("p",{class:"hint"}),c=el("div",{class:"row"}),ep=1;
  h.textContent="Inimigos: ferramenta Inimigo (clique no mapa para colocar, arraste para mover), Mover inimigo (desenha a rota de cada parte), Apagar inimigo (clique nele) ou a Borracha. Eles enxergam de verdade: quem vir primeiro, sem parede, sem smoke no meio e sem estar cego, gira a mira até centralizar e elimina. Direção e andar valem para a parte escolhida e as seguintes. Eles também lançam granadas: escolha 'Inimigo N' em Quem lança, na lista de utilitárias.";
  function parts(n){var o=[];for(var i=1;i<=n;i++)o.push([i,"Parte "+i]);return o}
  function draw(){l.innerHTML="";var np=Math.max(1,d.np||1);if(ep>np)ep=np;
    var pr=el("div",{class:"row"});pr.appendChild(pickL("Editar direção e andar na",parts(np),ep,function(v){ep=parseInt(v,10);draw()}));l.appendChild(pr);
    (d.en||[]).forEach(function(e,i){var row=el("div",{class:"row"}),t=el("strong");t.textContent="Inimigo "+(i+1);t.style.color="#ef4444";row.appendChild(t);
      row.appendChild(rng("Direção",0,359,Math.round(enA(e,ep)),function(v){e.ap=e.ap||{};e.ap[ep]=v;if(ep===1)e.a=v;cb()}));
      row.appendChild(rng("Tamanho",40,400,e.r||160,function(v){e.r=v;cb()}));row.appendChild(rng("Abertura",20,140,e.f||70,function(v){e.f=v;cb()}));
      row.appendChild(pickL("Andar",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],enF(e,ep)==null?"":enF(e,ep),function(v){e.fp=e.fp||{};if(v===""){delete e.fp[ep];if(ep===1)delete e.fl}else{e.fp[ep]=+v;if(ep===1)e.fl=+v}save();cb()}));
      var rr=el("button",{class:"b edt",type:"button"});rr.textContent="Apagar rota da parte "+ep;rr.onclick=function(){e.rt=(e.rt||[]).filter(function(r){return(r.n||1)!==ep});save();draw();cb()};row.appendChild(rr);
      row.appendChild(pickL("Proteção",[["k","Colete"],["n","Sem proteção"]],e.ar||"k",function(v){e.ar=v;save()}));var rm=el("button",{class:"b danger edt",type:"button"});rm.textContent="Remover inimigo";rm.onclick=function(){rmEn(d,i);save();draw();cb()};row.appendChild(rm);l.appendChild(row)})}
  var k1=field("input",d.ks==null?"":d.ks,"Reação ao ver (s, padrão 0,2)",function(v){d.ks=v;cb()}),k2=field("input",d.kv==null?"":d.kv,"Velocidade do giro da mira (graus por segundo, padrão 450)",function(v){d.kv=v;cb()});k1.style.flex=k2.style.flex="1";c.appendChild(k1);c.appendChild(k2);
  w.appendChild(h);w.appendChild(l);w.appendChild(c);w.rd=draw;draw();return w}

function visAllEd(m,d,cb){d.pv=d.pv||{};var w=el("div",{class:"uc"}),h=el("strong"),hint=el("p",{class:"hint"}),l=el("div");
  h.textContent="Campo de visão: olhar para um lugar (jogadores 1 a 5 e inimigos)";
  hint.textContent="Vale na abertura inteira e já fica ajustado e salvo. Em cada um: ‘+ novo campo de visão’ com a hora em que começa, quanto tempo fica e para qual callout ele olha (ou um ângulo). O intervalo entre dois campos é o tempo que a câmera usa para girar. Sem nenhum campo, ele continua com a direção normal (lanterna do jogador ou direção do inimigo).";
  function mk(label,col,host,key){var dt=el("details"),sm=el("summary"),v=host[key],has=v&&v.vis&&v.vis.length;sm.textContent=label+(has?" ✓ ("+v.vis.length+" campo"+(v.vis.length>1?"s":"")+")":"");if(col)sm.style.color=col;dt.appendChild(sm);dt.appendChild(visEditor(m,host,key,function(){cb()},null));l.appendChild(dt);if(has&&dt.open===false&&host.__open===key)dt.open=true}
  function draw(){l.innerHTML="";var c;for(c=0;c<5;c++)mk(pname(c),COLORS[c%5],d.pv,c);(d.en||[]).forEach(function(e,i){mk("Inimigo "+(i+1),"#ef4444",e,"vs")})}
  draw();w.rd=draw;w.appendChild(h);w.appendChild(hint);w.appendChild(l);w.style.marginTop="12px";return w}
function pullEd(m,d,cb){d.pl=d.pl||[];var w=el("div",{class:"uc"}),h=el("strong"),hint=el("p",{class:"hint"}),list=el("div",{class:"ulist"});
  h.textContent="Puxar movimento de um default, call, round ou timing";
  hint.textContent="Os bonecos puxados andam exatamente como na origem (mesmos tempos). Para cada boneco escolha Inimigo ou Aliado ao lado do nome: é isso que define quem mata quem (inimigo mata e é morto pelos seus jogadores da abertura e por aliados; aliado é morto só pelos inimigos). A opção ‘Os bonecos serão’ é o padrão de quem ainda não foi escolhido. Marque também quais jogadores vêm. As utilitárias lançadas por eles também vêm (smoke bloqueia visão, flash cega). O campo de visão de cada boneco vem da visão salva na rota dele (Callouts, Visão automática) ou você cria/ajusta aqui mesmo, no bloco ‘Campo de visão de …’: ‘+ novo campo de visão’ com a hora e quanto tempo fica; o intervalo entre dois campos é o tempo de girar a câmera. Com visão o boneco enxerga e elimina de verdade.";
  function draw(){list.innerHTML="";d.pl.forEach(function(q,qi){var box=el("div",{class:"uc"+(q.hid?" off":"")}),f1=el("div",{class:"fld"});q.no=q.no||{};
    f1.appendChild(pickL("Origem",[["def","Default"],["calls","Call"],["fx","Round (R1-5)"],["tm","Timing"]],q.k||"def",function(v){q.k=v;q.i=0;q.no={};save();draw();cb()}));
    f1.appendChild(pickL("Lado da origem",[["tr","TR"],["ct","CT"]],q.sd||"tr",function(v){q.sd=v;q.i=0;q.no={};save();draw();cb()}));
    var its=pullList(m,q);if((q.k||"def")!=="tm"&&its.length)f1.appendChild(pickL("Qual",its,q.i|0,function(v){q.i=+v;save();draw();cb()}));
    f1.appendChild(pickL("Os bonecos serão",[["e","Time inimigo"],["o","Time aliado"]],q.team||"e",function(v){q.team=v;save();cb()}));
    f1.appendChild(pickL("Andar",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],q.fl==null?"":q.fl,function(v){q.fl=v===""?"":+v;save();cb()}));box.appendChild(f1);
    var sr=pullSrc(m,q),f2=el("div",{class:"row"});
    if(!sr){var x0=el("span",{class:"hint"});x0.textContent="Origem não encontrada (talvez tenha sido apagada).";f2.appendChild(x0)}
    else{for(var ci=0;ci<sr.cnt;ci++)(function(ci){var lb=el("label",{class:"sl"}),cb2=el("input",{type:"checkbox"});cb2.style.width="auto";cb2.disabled=RO;cb2.checked=!q.no[ci];cb2.onchange=function(){if(cb2.checked)delete q.no[ci];else q.no[ci]=true;save();cb()};lb.appendChild(cb2);lb.appendChild(document.createTextNode(" "+sr.nm(ci)));f2.appendChild(lb);var ts=el("select",{"aria-label":"Time de "+sr.nm(ci)});[["e","Inimigo"],["o","Aliado"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===((q.tm&&q.tm[ci])||q.team||"e"))op.selected=true;ts.appendChild(op)});ts.onchange=function(){q.tm=q.tm||{};q.tm[ci]=ts.value;save();cb()};f2.appendChild(ts)})(ci);
      if(!sr.cnt){var x1=el("span",{class:"hint"});x1.textContent="Esta origem ainda não tem jogadores/respawns.";f2.appendChild(x1)}}
    box.appendChild(f2);
    var f2b=el("div",{class:"row"}),tnf=field("input",q.tn||"","Nome do grupo (ex: Aliados, Inimigos, TR fundo)",function(v){q.tn=v;cb()});tnf.style.flex="1";f2b.appendChild(tnf);box.appendChild(f2b);
    if(sr){q.vo=q.vo||{};for(var cj=0;cj<sr.cnt;cj++)(function(cj){if(q.no[cj])return;var dt=el("details"),sm=el("summary");sm.textContent="Campo de visão de "+sr.nm(cj)+((q.vo[cj]&&q.vo[cj].vis&&q.vo[cj].vis.length)?" ✓":"");dt.appendChild(sm);dt.appendChild(visEditor(m,q.vo,cj,function(){cb()},null));box.appendChild(dt)})(cj)}
    var f3=el("div",{class:"row"}),lu2=el("label",{class:"sl"}),cu=el("input",{type:"checkbox"});cu.style.width="auto";cu.disabled=RO;cu.checked=q.ut!==false;cu.onchange=function(){q.ut=cu.checked;save();cb()};lu2.appendChild(cu);lu2.appendChild(document.createTextNode(" Trazer as utilitárias deles"));f3.appendChild(lu2);
    var hb=el("button",{class:"b edt",type:"button"});hb.textContent=q.hid?"Mostrar":"Esconder";hb.onclick=function(){q.hid=!q.hid;save();draw();cb()};f3.appendChild(hb);
    f3.appendChild(rmBtn("Tirar","Tirar este movimento puxado?",function(){d.pl.splice(qi,1);save();draw();cb()}));box.appendChild(f3);list.appendChild(box)})}
  var ad=el("button",{class:"b edt",type:"button"});ad.textContent="+ Puxar movimento";ad.onclick=function(){d.pl.push({k:"def",sd:side==="tr"?"ct":"tr",i:0,team:"e",fl:"",ut:true,no:{}});save();draw();cb()};
  draw();w.appendChild(h);w.appendChild(hint);w.appendChild(list);w.appendChild(ad);w.style.marginTop="12px";return w}
var OPENL={n:"Nome da abertura (ex: Abertura B pelo túnel)",d:"Descrição: o que busca, util usada, como entra no bomb",p:"Pef: por onde vai, para onde olha, o que faz na entrada",r:"Remover abertura",q:"Remover esta abertura?",a:"+ Nova abertura",k:"Abertura"};
function tri(x,y,a,r,f,col){r=Math.max(r,30);var h=f*Math.PI/360,bx=(r*Math.cos(h)).toFixed(1),by=(r*Math.sin(h)).toFixed(1);return'<g transform="translate('+x+" "+y+") rotate("+(a-90).toFixed(1)+')" pointer-events="none"><path d="M18 0L'+bx+" -"+by+"L"+bx+" "+by+'Z" fill="'+col+'" fill-opacity=".22" stroke="'+col+'" stroke-opacity=".6" stroke-width="1.5" stroke-linejoin="round"/></g>'}
function xmk(p){return'<path d="M'+(p[0]-12)+" "+(p[1]-12)+"L"+(p[0]+12)+" "+(p[1]+12)+"M"+(p[0]+12)+" "+(p[1]-12)+"L"+(p[0]-12)+" "+(p[1]+12)+'" stroke="#000" stroke-width="7" pointer-events="none"/><path d="M'+(p[0]-12)+" "+(p[1]-12)+"L"+(p[0]+12)+" "+(p[1]+12)+"M"+(p[0]+12)+" "+(p[1]-12)+"L"+(p[0]-12)+" "+(p[1]+12)+'" stroke="#ef4444" stroke-width="3.5" pointer-events="none"/>'}
var FL={R:1500,max:4.87,hf:.39,front:1,side:.55,back:.27,dmin:.15,dk:.65},SM={r:128,bloom:.7,fade:.6},HEC={max:98,arm:57,R:350},FIRE={dps:40,r:150,int:.2,tick:8,t0:1,up:1},BLT=.4;
function wrap180(x){return((x%360+540)%360)-180}
function bear(a,b){return Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI}
function flashCalc(dist,off){var fac=Math.max(FL.dmin,1-FL.dk*dist/FL.R),af=off<=60?FL.front:off<=120?FL.side:FL.back,tot=FL.max*fac*af,hold=tot*FL.hf;return{hold:hold,fade:tot-hold,tot:tot,until:hold+(tot-hold)*.5}}
function gpos(S,items,np,pred,t0){var last=null;for(var k=1;k<=np;k++){var done=false;items.forEach(function(q,i){if(done||(q.n||1)!==k||!pred(q)||!S.del[i])return;var st=S.T[k]+S.del[i][0],du=S.del[i][1];if(t0<st){done=true;if(!last)last=q.p[0];return}if(t0<st+du){done=true;last=posAtG(q.p,(t0-st)/du);return}last=q.p[q.p.length-1]});if(done)return last}return last}
function floorAtD(d,c,k){var f=d.fl||{};for(var j=k;j>=1;j--)if(f[c+"_"+j]!=null)return+f[c+"_"+j];return null}
function enA(e,k){var a=e.ap||{};for(var j=k;j>=1;j--)if(a[j]!=null)return+a[j];return+e.a||0}
function enF(e,k){var a=e.fp||{};for(var j=k;j>=1;j--)if(a[j]!=null)return+a[j];return e.fl!=null&&e.fl!==""?+e.fl:null}
function enAng(e,S0,np,t){var rp=1,j;for(j=1;j<=np;j++)if(S0.T[j]<=t+1e-9)rp=j;var cur=enA(e,rp);if(rp>1&&e.ap&&e.ap[rp]!=null){var pv=enA(e,rp-1),u=Math.max(0,Math.min(1,(t-S0.T[rp])/.5));return(pv+wrap180(cur-pv)*u+360)%360}return(cur+360)%360}
function rmEn(d,i){if(!d.en||!d.en[i])return;d.en.splice(i,1);(d.ul||[]).forEach(function(e){if(e&&typeof e.th==="string"&&e.th.charAt(0)==="e"){var k=+e.th.slice(1);if(k===i)e.th="";else if(k>i)e.th="e"+(k-1)}})}
function pullSrc(m,q){var sd=q.sd==="ct"?"ct":"tr",k=q.k||"def",i=q.i|0;
  if(k==="tm"){var T=m.tm&&m.tm[sd];if(!T)return null;return{items:T.r||[],np:T.np||1,pe:T.pe||[],lane:function(r){return r.id},key:function(r){return r.sp},nm:function(ci){var s=T.sp[ci];return s?(s.n||("Respawn "+(ci+1))):"Respawn "+(ci+1)},cnt:(T.sp||[]).length,ul:null}}
  var L=k==="calls"?m.calls[sd]:k==="fx"?m.fx[sd]:m.defs[sd],D=L&&L[i];if(!D)return null;
  return{items:D.s||[],np:D.np||1,pe:D.pe||[],lane:function(r){return r.c},key:function(r){return r.c},nm:function(ci){var p=D.players&&D.players[ci];return k==="calls"?callName(p,ci):pname(ci)},cnt:5,ul:D.ul||[]}}
function pullList(m,q){var sd=q.sd==="ct"?"ct":"tr",k=q.k||"def";if(k==="tm")return[[0,"Timing do lado "+sd.toUpperCase()]];
  var L=k==="calls"?m.calls[sd]:k==="fx"?m.fx[sd]:m.defs[sd];return(L||[]).map(function(x,i){return[i,k==="fx"?("Round "+(i+1)):(x.name||("Item "+(i+1)))]})}
function pullRes(m,d,spd){var dolls=[],utils=[],tot=0;
  (d.pl||[]).forEach(function(q,qi){if(q.hid)return;var sr=pullSrc(m,q);if(!sr)return;var S=sched2(m,sr.items,sr.np,sr.pe,sr.lane,spd);if(S.tot>tot)tot=S.tot;
    for(var ci=0;ci<sr.cnt;ci++)(function(ci){if(q.no&&q.no[ci])return;var pred=function(it){return sr.key(it)===ci};if(!sr.items.some(pred))return;
      var wins=[],vo=q.vo&&q.vo[ci]&&q.vo[ci].vis&&q.vo[ci].vis.length?q.vo[ci]:null;if(vo)wins.push({st:0,en:Infinity,vs:vo});else sr.items.forEach(function(it,ii){if(!it.vs||!pred(it))return;var w=routeWin(S,sr.items,it,ii,sr.np,pred);if(w)wins.push({st:w[0],en:w[1],vs:it.vs})});
      var dl={id:"p"+qi+"_"+ci,team:((q.tm&&q.tm[ci])||q.team)==="o"?"o":"e",fl:(q.fl===""||q.fl==null)?null:+q.fl,fc:q.fc||null,lb:(q.tn?q.tn+" · ":"")+sr.nm(ci),sg:JSON.stringify([ci,sr.items.map(function(it){return[it.p,it.n,it.tv,it.tw,it.c,it.sp]}),sr.np,sr.pe,wins]),pos:function(t){return gpos(S,sr.items,sr.np,pred,t)}};
      if(wins.length){dl.hasVis=true;var wf=function(t){return wins.filter(function(w){return t>=w.st&&t<w.en})[0]};dl.coneAt=function(t){var w=wf(t);return w?{r:num(w.vs.r,260),f:num(w.vs.f,70)}:{r:0,f:0}};dl.ang=function(t){var w=wf(t);if(!w)return null;var x=visAng(m,w.vs,dl.pos,t);return x?x.a:null}}dolls.push(dl);
      if(q.ut!==false){
        if((q.k||"def")==="tm"){sr.items.forEach(function(r){if(r.sp!==ci)return;(r.ul||[]).forEach(function(e){if(!e||typeof e==="string"||e.hid)return;var u=findU(m,e.n);if(u)utils.push({u:u,e:e,stf:dl.pos,who:dl.id})})})}
        else(sr.ul||[]).forEach(function(e){if(!e||e.hid||String(e.th)!==String(ci))return;var u=findU(m,e.n);if(u)utils.push({u:u,e:e,stf:dl.pos,who:dl.id})})}
    })(ci)});
  return{dolls:dolls,utils:utils,tot:tot}}
var SIMC={k:"",r:null};
function openSim(m,d,C){var PU=C.pull||{dolls:[],utils:[]},UL=C.utils||[];
  var key=JSON.stringify([d.s,d.np,d.pe,d.lk,d.lt,d.lz,d.fl,d.fc,d.pv,d.en,d.ks,d.kv,m.wl,m.wu,m.wm,m.zn,m.co,scaleOf(m),C.spd,C.T,PU.dolls.map(function(x){return[x.id,x.team,x.fl,x.sg]}),UL.map(function(x){return[x.u.t,x.u.x,x.u.y,ufl(m,x.u),ltimeG(x.u,x.e),x.u.nm]})]);
  if(SIMC.k===key)return SIMC.r;
  var ug=1.024*scaleOf(m),W0=wallSegs(m,0),W1=wallSegs(m,1),WB=W0.concat(W1),ks=Math.max(0,num(d.ks,.2)),kv=Math.max(30,num(d.kv,450)),S0=C.S0,np=C.np;
  var E=[],by={},dead={},pend={},segs={},aims=[],ev=[],blindU={},blinds=[],SMK=[],FLS=[],c;
  for(c=0;c<5;c++)E.push({id:"o"+c,tm:"o",k:"o",i:c,cone:true});
  (d.en||[]).forEach(function(e,i){E.push({id:"e"+i,tm:"e",k:"e",i:i,e:e,cone:true,r:e.r>0?+e.r:160,f:e.f>0?+e.f:70})});
  PU.dolls.forEach(function(x){E.push({id:x.id,tm:x.team,k:"p",x:x,cone:!!x.hasVis,r:0,f:0})});
  E.forEach(function(X){by[X.id]=X;segs[X.id]=[]});E.forEach(function(X){var s=vsOf(X);X.vs=hasVs(s)?s:null});
  var DT=.05,NS=Math.ceil((C.T+1)/DT)+2,ftl={};
  E.forEach(function(X){var f=0,arr=[],k;for(k=0;k<=NS;k++){var P=raw(X,k*DT);if(P){var z=zoneAt(m,P);if(z!=null)f=z}arr.push(f)}ftl[X.id]=arr});
  function tfl(id,t){var a=ftl[id];if(!a)return 0;return a[Math.max(0,Math.min(NS,Math.round(t/DT)))]}
  var hp={},hpLog={},HES=[],FIRS=[],ftk={},burned={};E.forEach(function(X){hp[X.id]=100;hpLog[X.id]=[[0,100]]});
  UL.forEach(function(q){var a=ltimeG(q.u,q.e);if(!a)return;var w0=whoOf(q),za=zoneAt(m,[q.u.x,q.u.y]),f=q.u.fl!=null&&q.u.fl!==""?+q.u.fl:(za!=null?za:(w0&&ftl[w0]?tfl(w0,a[0]):0));
    if(q.u.t==="smoke")SMK.push({x:q.u.x,y:q.u.y,fl:f,t1:a[1]+SM.bloom,t2:Math.max(a[1]+SM.bloom+.1,a[2]-SM.fade),R:SM.r/ug,nm:q.u.nm||"smoke",who:w0,t0:a[0]});
    else if(q.u.t==="flash")FLS.push({x:q.u.x,y:q.u.y,fl:f,t:a[1],nm:q.u.nm||"flash",who:w0,t0:a[0]});
    else if(q.u.t==="he")HES.push({x:q.u.x,y:q.u.y,fl:f,t:a[1],who:w0,t0:a[0]});
    else if(q.u.t==="molotov")FIRS.push({x:q.u.x,y:q.u.y,fl:f,t1:a[1],t2:a[2],R:FIRE.r/ug,who:w0,t0:a[0],hit:{},tk:{},n:{}})});
  FLS.sort(function(a,b){return a.t-b.t});
  function partAt(t){var rp=1,j;for(j=1;j<=np;j++)if(S0.T[j]<=t+1e-9)rp=j;return rp}
  function raw(X,t){if(X.k==="o")return C.pos(X.i,t);if(X.k==="e")return gpos(S0,C.items,np,function(q){return q.c===X.id},t)||[X.e.x,X.e.y];return X.x.pos(t)}
  function pos(X,t){var D=dead[X.id];if(D&&t>=D.t)return D.pos;return raw(X,t)}
  function fl(X,t){var k=partAt(t),v=X.k==="o"?floorAtD(d,X.i,k):X.k==="e"?enF(X.e,k):X.x.fl;if(hasFl(m)){var mv=fcAt(X.k==="o"?(d.fc||{})[X.i]:X.k==="p"?X.x.fc:null,t);if(mv!=null)return mv}if(v!=null&&v!=="")return+v;if(hasFl(m)&&!zonesOn(m))return 1;return tfl(X.id,t)}
  function vsOf(X){return X.k==="o"?(d.pv&&d.pv[X.i]):X.k==="e"?X.e.vs:null}
  function hasVs(s){return!!(s&&s.vis&&s.vis.length&&vKfs(s).length)}
  function base(X,t){if(X.vs){var a=visAng(m,X.vs,function(x){return raw(X,x)},t);if(a)return a.a}
    return X.k==="o"?lkAt(d,X.i,S0,np,t):X.k==="e"?enAng(X.e,S0,np,t):X.x.ang?X.x.ang(t):null}
  function cn(X,t){if(X.vs)return{r:num(X.vs.r,260),f:num(X.vs.f,70)};return X.k==="o"?cone(d,X.i):(X.k==="p"&&X.x.coneAt?X.x.coneAt(t):{r:X.r,f:X.f})}
  function ang(X,t){var b=base(X,t),ss=segs[X.id],s=null,i;for(i=ss.length-1;i>=0;i--)if(ss[i].t0<=t+1e-9){s=ss[i];break}
    if(!s)return b;
    var P=pos(X,t),Pg=pos(by[s.tg],t);if(!P||!Pg)return b;
    if(t<=Math.min(s.tk,s.cut==null?1e9:s.cut)){var u=Math.max(0,Math.min(1,(t-s.t0)/Math.max(1e-6,s.tk-s.t0)));u=u*u*(3-2*u);return(s.a0+wrap180(bear(P,Pg)-s.a0)*u+360)%360}
    var e0=s.cut!=null?s.cut:s.end;
    if(t<e0)return(bear(P,Pg)+360)%360;
    var hv=s.cut!=null?s.hv:bear(pos(X,e0),pos(by[s.tg],e0));
    if(b==null)return(hv+360)%360;
    var u2=Math.max(0,Math.min(1,(t-e0)/BLT));u2=u2*u2*(3-2*u2);return(hv+wrap180(b-hv)*u2+360)%360}
  function smoked(A,B,fa,fb,t){for(var i=0;i<SMK.length;i++){var s=SMK[i];if(t<s.t1||t>=s.t2||(s.fl!==2&&s.fl!==fa&&s.fl!==fb)||(s.who&&dead[s.who]&&dead[s.who].t<=s.t0))continue;if(dSeg([s.x,s.y],A,B)<s.R)return true}return false}
  function armOf(Z){return Z.k==="o"?(d.arp&&d.arp[Z.i]):Z.k==="e"?Z.e.ar:null}
  function wallsFor(fa,fb){return(fa===2||fb===2)?WB:(fa?W1:W0)}
  function seen(A,B,fa,fb,t){if(fa!==2&&fb!==2&&fa!==fb)return false;return!blocked(A,B,wallsFor(fa,fb))&&!smoked(A,B,fa,fb,t)}
  function cancel(X,t){if(!pend[X.id])return;delete pend[X.id];var ss=segs[X.id],s=ss[ss.length-1];if(s&&s.cut==null){s.hv=ang(X,t);s.cut=t}}
  function foe(Z,w){if(!w||!by[w])return false;return Z.id===w||Z.tm!==by[w].tm}
  function hurt(Z,dmg,t,w,how){if(dead[Z.id])return;var h=hp[Z.id]-dmg;if(h<0)h=0;hp[Z.id]=h;hpLog[Z.id].push([t,h]);
    if(h<=0){var P=pos(Z,t);dead[Z.id]={t:t,by:w,pos:P?[P[0],P[1]]:[0,0],how:how};delete pend[Z.id];ev.push({t:t,k:"kill",x:w,tg:Z.id,t0:t,off:0,how:how})}}
  var fi=0,hi=0,t,dt=.05,TT=C.T+1;
  for(t=0;t<=TT;t+=dt){
    while(fi<FLS.length&&FLS[fi].t<=t+1e-9){var F=FLS[fi++];if(F.who&&dead[F.who]&&dead[F.who].t<=F.t0)continue;
      E.forEach(function(Z){if(!Z.cone||(dead[Z.id]&&dead[Z.id].t<=F.t))return;if(F.fl!==2&&fl(Z,F.t)!==F.fl)return;var PZ=pos(Z,F.t);if(!PZ)return;
        var dist=Math.hypot(PZ[0]-F.x,PZ[1]-F.y)*ug;if(dist>FL.R)return;var fz2=fl(Z,F.t);if(blocked([F.x,F.y],PZ,wallsFor(F.fl===2?fz2:F.fl,fz2)))return;
        var a=ang(Z,F.t);if(a==null)return;var off=Math.abs(wrap180(bear(PZ,[F.x,F.y])-a)),q=flashCalc(dist,off),un=F.t+q.until;
        if(un>(blindU[Z.id]||0))blindU[Z.id]=un;
        blinds.push({id:Z.id,t:F.t,hold:q.hold,fade:q.fade,tot:q.tot,until:un,dist:dist,off:off,nm:F.nm});
        ev.push({t:F.t,k:"blind",id:Z.id,tot:q.tot,hold:q.hold,until:q.until,dist:dist,off:off,nm:F.nm});cancel(Z,F.t)})}
    while(hi<HES.length&&HES[hi].t<=t+1e-9){var H=HES[hi++];if(H.who&&dead[H.who]&&dead[H.who].t<=H.t0)continue;
      E.forEach(function(Z){if(dead[Z.id])return;var P=pos(Z,H.t);if(!P)return;var fz=fl(Z,H.t);if(H.fl!==2&&fz!==H.fl)return;var dist=Math.hypot(P[0]-H.x,P[1]-H.y)*ug;if(dist>=HEC.R)return;if(blocked([H.x,H.y],P,wallsFor(H.fl===2?fz:H.fl,fz)))return;if(!foe(Z,H.who))return;
        var dm=(armOf(Z)==="n"?HEC.max:HEC.arm)*(1-dist/HEC.R);ev.push({t:H.t,k:"dmg",id:Z.id,dmg:dm,how:"HE",hp:Math.max(0,hp[Z.id]-dm)});hurt(Z,dm,H.t,H.who,"HE")})}
    FIRS.forEach(function(Fi){if(t<Fi.t1||t>=Fi.t2||(Fi.who&&dead[Fi.who]&&dead[Fi.who].t<=Fi.t0))return;
      E.forEach(function(Z){if(dead[Z.id])return;var P=pos(Z,t);if(!P)return;if(Fi.fl!==2&&fl(Z,t)!==Fi.fl)return;if(Math.hypot(P[0]-Fi.x,P[1]-Fi.y)>Fi.R)return;if(!foe(Z,Fi.who))return;
        if(!Fi.hit[Z.id]){Fi.hit[Z.id]=1;if(!burned[Z.id]){burned[Z.id]=1;ev.push({t:t,k:"burn",id:Z.id})}}
        if(Fi.tk[Z.id]===undefined||t>=Fi.tk[Z.id]-1e-6){Fi.tk[Z.id]=t+FIRE.int;var nt=(Fi.n[Z.id]||0)+1;Fi.n[Z.id]=nt;hurt(Z,Math.min(FIRE.tick,FIRE.t0+(nt-1)*FIRE.up),t,Fi.who,"molotov")}})});
    var due=[];E.forEach(function(X){var P=pend[X.id];if(P&&t>=P.tk-1e-9)due.push([X,P])});due.sort(function(a,b){return a[1].tk-b[1].tk});
    due.forEach(function(q){var X=q[0],P=q[1];if(pend[X.id]!==P)return;delete pend[X.id];var tk=P.tk;
      if(dead[X.id]&&dead[X.id].t<=tk)return;if(dead[P.tg])return;
      var Y=by[P.tg],PX=pos(X,tk),PY=pos(Y,tk);if(!PX||!PY)return;
      if(!seen(PX,PY,fl(X,tk),fl(Y,tk),tk)){var ss=segs[X.id],s=ss[ss.length-1];if(s&&s.cut==null){s.hv=ang(X,tk);s.cut=tk}return}
      dead[P.tg]={t:tk,by:X.id,pos:[PY[0],PY[1]]};delete pend[P.tg];hp[P.tg]=0;hpLog[P.tg].push([tk,0]);
      aims.push({x:X.id,tg:P.tg,t0:P.t0,tk:tk});ev.push({t:tk,k:"kill",x:X.id,tg:P.tg,t0:P.t0,off:P.off})});
    var det=[];
    E.forEach(function(X){if(!X.cone||dead[X.id]||pend[X.id]||(blindU[X.id]||0)>t)return;var PX=pos(X,t),a=ang(X,t);if(!PX||a==null)return;var cc=cn(X,t),fx=fl(X,t),best=null;
      E.forEach(function(Y){if(Y.tm===X.tm||dead[Y.id])return;var PY=pos(Y,t);if(!PY)return;var dx=PY[0]-PX[0],dy=PY[1]-PX[1];if(Math.hypot(dx,dy)>cc.r)return;
        var off=wrap180(Math.atan2(dx,-dy)*180/Math.PI-a);if(Math.abs(off)>cc.f/2)return;if(!seen(PX,PY,fx,fl(Y,t),t))return;
        if(!best||Math.abs(off)<best.o)best={Y:Y,o:Math.abs(off),off:off}});
      if(best)det.push({X:X,b:best,a:a})});
    det.forEach(function(q){var o=det.filter(function(z){return z.X.id===q.b.Y.id&&z.b.Y.id===q.X.id})[0];
      if(o&&(o.b.o<q.b.o||(o.b.o===q.b.o&&o.X.id<q.X.id)))return;
      var X=q.X,tk=t+ks+q.b.o/kv,k=partAt(t),s={t0:t,tk:tk,a0:q.a,tg:q.b.Y.id,end:Math.max(tk,S0.T[k]+S0.D[k]),cut:null,hv:null};
      segs[X.id].push(s);pend[X.id]={tg:q.b.Y.id,t0:t,tk:tk,off:q.b.o}})}
  function bl(id,t){var a=0;blinds.forEach(function(b){if(b.id!==id||t<b.t||t>=b.t+b.tot)return;var v=t<b.t+b.hold?1:1-(t-b.t-b.hold)/Math.max(.01,b.fade);if(v>a)a=v});return a}
  function hpAt(id,t){var a=hpLog[id]||[[0,100]],v=100,i;for(i=0;i<a.length;i++){if(a[i][0]<=t+1e-9)v=a[i][1];else break}return v}
  var res={cone:cn,hpAt:hpAt,dead:dead,aims:aims,ev:ev,blinds:blinds,smokes:SMK,pos:pos,ang:ang,fl:fl,by:by,E:E,bl:bl,ks:ks,kv:kv};SIMC={k:key,r:res};return res}
function openLayer(m,d,C,R){d.lk=d.lk||{};var h=wallSvg(m,-1),on=lanOn(),tt=C.tt,log=[];
  function isD(id){var D=R.dead[id];return D&&tt>=D.t}
  function nm(id){var X=R.by[id];return X.k==="o"?C.pn(X.i):X.k==="e"?"Inimigo "+(X.i+1):X.x.lb}
  function opc(f){return hasFl(m)?fvOp(f):1}
  R.smokes.forEach(function(s){if(tt<s.t1||tt>=s.t2||(s.who&&R.dead[s.who]&&R.dead[s.who].t<=s.t0))return;var fd=Math.min(1,(s.t2-tt)/1.5);h+='<circle cx="'+s.x+'" cy="'+s.y+'" r="'+s.R.toFixed(1)+'" fill="none" stroke="#8795a0" stroke-opacity="'+(.75*fd).toFixed(2)+'" stroke-width="1.5" stroke-dasharray="3 4" pointer-events="none"/>'});
  function ringF(id,p){var X0=R.by[id];if(!hasFl(m)||!X0||!C.focus||C.focus==="all")return"";return(X0.k==="o"&&C.focus==="p"+X0.i)||(X0.k==="e"&&C.focus==="e"+X0.i)?fvBadge(p,R.fl(X0,tt)):""}
  function halo(id,p){return ringF(id,p)+halo0(id,p)}function halo0(id,p){var a=R.bl(id,tt);return a>0?'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="24" fill="#fff" fill-opacity="'+(.85*a).toFixed(2)+'" pointer-events="none"/>':""}
  function lab(p,txt,col,f){return'<text x="'+p[0]+'" y="'+(p[1]-20)+'" font-size="17" font-weight="800" text-anchor="middle" fill="'+col+'" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+esc(txt)+(f===2?" ↕":f?" ↑":(hasFl(m)?" ↓":""))+"</text>"}
  R.E.forEach(function(X){
    if(X.k==="o"&&C.rep&&C.only>=0&&X.i!==C.only)return;
    var p=R.pos(X,tt);if(!p)return;
    if(isD(X.id)){var dp=R.dead[X.id].pos;h+=X.k==="e"?'<g data-en="'+X.i+'" style="cursor:move"><circle cx="'+dp[0]+'" cy="'+dp[1]+'" r="16" fill="transparent"/>'+xmk(dp)+'</g>':xmk(dp);return}
    var f=R.fl(X,tt),o=opc(f),col,a,z;
    if(X.k==="o"){col=COLORS[X.i%5];a=R.ang(X,tt);z=R.cone(X,tt);
      h+='<g opacity="'+o+'">'+(a!=null&&on?fovClip(m,p,a,z.r,z.f,col,f):"")+(C.rep?"":'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#fff" stroke="'+col+'" stroke-width="4" pointer-events="none"/>')+halo(X.id,p)+lab(p,C.pn(X.i),col,f)+"</g>"}
    else if(X.k==="e"){a=R.ang(X,tt);
      h+='<g opacity="'+o+'">'+(on&&a!=null?fovClip(m,p,a,R.cone(X,tt).r,R.cone(X,tt).f,"#ef4444",f):"")+halo(X.id,p)+'<g data-en="'+X.i+'" style="cursor:move"><circle cx="'+p[0]+'" cy="'+p[1]+'" r="11" fill="#ef4444" stroke="#fff" stroke-width="3"/>'+lab(p,"Inimigo "+(X.i+1),"#ef4444",f)+"</g></g>"}
    else{col=X.tm==="e"?"#fb7185":"#38bdf8";
      h+='<g opacity="'+opc(f)+'" pointer-events="none">'+(X.x.hasVis&&on&&R.ang(X,tt)!=null?fovClip(m,p,R.ang(X,tt),X.x.coneAt(tt).r,X.x.coneAt(tt).f,col,f):"")+halo(X.id,p)+'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="9" fill="'+col+'" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3"/>'+lab(p,X.x.lb+(X.tm==="e"?" (inimigo)":" (aliado)"),col,f).replace('font-size="17"','font-size="13"')+"</g>"}});
  R.E.forEach(function(X){if(X.k==="o"&&C.rep&&C.only>=0&&X.i!==C.only)return;if(isD(X.id))return;var p=R.pos(X,tt);if(!p)return;var v=R.hpAt(X.id,tt),w=34;
    h+='<g pointer-events="none"><rect x="'+(p[0]-w/2)+'" y="'+(p[1]+13)+'" width="'+w+'" height="6" rx="2" fill="#000" fill-opacity=".65"/><rect x="'+(p[0]-w/2)+'" y="'+(p[1]+13)+'" width="'+(w*v/100).toFixed(1)+'" height="6" rx="2" fill="'+(v>60?"#22c55e":v>30?"#eab308":"#ef4444")+'"/><text x="'+(p[0]+w/2+4)+'" y="'+(p[1]+20)+'" font-size="12" font-weight="800" fill="#fff" stroke="#000" stroke-width="2.5" paint-order="stroke">'+Math.round(v)+"</text></g>"});
  R.aims.forEach(function(x){if(tt<x.t0||tt>x.tk+.6)return;var A=R.pos(R.by[x.x],tt),B=R.pos(R.by[x.tg],tt);if(A&&B)h+='<line x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" stroke="#ffe14d" stroke-width="3" stroke-dasharray="8 5" pointer-events="none"/>'});
  R.ev.slice().sort(function(a,b){return a.t-b.t}).forEach(function(e){if(e.t>tt||(e.k!=="kill"&&e.k!=="blind"))return;
    log.push(e.k==="kill"?nm(e.x)+" eliminou "+nm(e.tg)+(e.how?" com "+e.how:"")+" ("+fmtT(115-e.t)+")":nm(e.id)+" cego "+r1(e.tot)+" s ("+fmtT(115-e.t)+")")});
  log.slice(-6).forEach(function(s,i){h+='<text x="14" y="'+(30+i*24)+'" font-size="20" font-weight="800" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" pointer-events="none">'+esc(s)+"</text>"});
  return h}
var BC=[[100,"#ef4444","100% (morte)"],[70,"#f97316","70% a 99%"],[50,"#facc15","50% a 69%"],[20,"#a3e635","20% a 49%"],[1,"#16a34a","1% a 19%"],[0,"#3b82f6","0% (sem dano)"]];
function bombDmg(d,R){var s=R/3;return d>=R?0:Math.min(100,500*Math.exp(-d*d/(2*s*s)))}
function bombCol(p){for(var i=0;i<5;i++)if(p>=BC[i][0]-1e-9)return BC[i][1];return BC[5][1]}
var HC={k:"",s:""};
function heatSvg(m,b){var bp=m.bp&&m.bp[b];if(!bp)return"";var R=num(m.br,1750),ug=1.024*scaleOf(m),Rs=R/ug,key=JSON.stringify([bp,R,ug,m.wl,m.wu]);if(HC.k===key)return HC.s;
  var W=wallSegs(m,bp.f|0),st=10,x0=Math.max(0,Math.floor((bp.x-Rs)/st)*st),y0=Math.max(0,Math.floor((bp.y-Rs)/st)*st),x1=Math.min(1000,bp.x+Rs),y1=Math.min(1000,bp.y+Rs),h="",x,y,B=[bp.x,bp.y];
  function rect(r,y){return'<rect x="'+r.x+'" y="'+y+'" width="'+r.w+'" height="'+st+'" fill="'+r.c+'" fill-opacity=".5"/>'}
  for(y=y0;y<y1;y+=st){var run=null;for(x=x0;x<x1;x+=st){var dd=Math.hypot(x+st/2-bp.x,y+st/2-bp.y),col=null;
      if(dd<Rs)col=bombCol(blocked(B,[x+st/2,y+st/2],W)?0:bombDmg(dd*ug,R));
      if(run&&run.c===col)run.w+=st;else{if(run&&run.c)h+=rect(run,y);run={x:x,c:col,w:st}}}
    if(run&&run.c)h+=rect(run,y)}
  HC={k:key,s:h};return h}
function bombView(m){
  var w=el("div",{class:"mm"}),tb=el("div",{class:"tb edt"}),svg=mksvg(m),bs="A",tool="p",cur=null,curF=0,dr=false,hd=el("p",{class:"hint"}),lg=el("div",{class:"row"});svg.style.maxWidth="900px";
  function paint(){var h=bg(m)+heatSvg(m,bs)+wallSvg(m,FLOOR);
    if(cur&&cur.length>1)h+='<polyline points="'+cur.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>';
    var b=m.bp[bs];if(b)h+='<rect x="'+(b.x-13)+'" y="'+(b.y-13)+'" width="26" height="26" fill="#ef4444" stroke="#fff" stroke-width="4" pointer-events="none"/><text x="'+b.x+'" y="'+(b.y+7)+'" font-size="20" font-weight="800" text-anchor="middle" fill="#fff" pointer-events="none">'+bs+(b.f?"↑":"")+"</text>";
    svg.innerHTML=h}
  function bar(){tb.innerHTML="";var s=el("div",{class:"row"});[["A","Bomba A"],["B","Bomba B"]].forEach(function(k){var b=el("button",{class:"tool",type:"button","aria-pressed":bs===k[0]});b.textContent=k[1];b.onclick=function(){bs=k[0];bar();paint()};s.appendChild(b)});s.appendChild(wallBtn());s.appendChild(floorBtn(function(){bar();paint()}));tb.appendChild(s);
    var t=el("div",{class:"row edt"});[["p","Lápis (riscar paredes)"],["x","Apagar parede (clique)"],["b","Colocar bomba (quadrado vermelho)"]].forEach(function(k){var b=el("button",{class:"tool",type:"button","aria-pressed":tool===k[0]});b.textContent=k[1];b.onclick=function(){tool=k[0];bar()};t.appendChild(b)});
    var u=el("button",{class:"b",type:"button"});u.textContent="Desfazer última parede ("+FLN[FLOOR].toLowerCase()+")";u.onclick=function(){wlOf(m,FLOOR).pop();save();paint()};t.appendChild(u);
    var c=el("button",{class:"b danger",type:"button"});c.textContent="Limpar paredes ("+FLN[FLOOR].toLowerCase()+")";c.onclick=function(){if(!wlOf(m,FLOOR).length)return;ask("Apagar TODAS as paredes do andar "+FLN[FLOOR].toLowerCase()+" de "+(m.name||"este mapa")+"? Elas também são usadas na aba Aberturas.",function(){if(FLOOR)m.wu=[];else m.wl=[];save();paint()})};t.appendChild(c);
    var rf=field("input",m.br==null?"":m.br,"Raio da bomba (padrão 1750)",function(v){m.br=v;paint()});rf.style.width="260px";t.appendChild(rf);tb.appendChild(t);
    lg.innerHTML="";BC.forEach(function(x){var i=el("i",{class:"sw"});i.style.setProperty("--c",x[1]);var sp=el("span",{class:"hint"});sp.textContent=x[2];lg.appendChild(i);lg.appendChild(sp)})}
  hd.textContent="Risque as paredes ao redor do bomb (as mesmas paredes da aba Aberturas), coloque o quadrado vermelho da bomba e o mapa pinta o dano sozinho. Cada andar tem as suas paredes: o botão Andar escolhe onde você risca (preto = inferior, azul = superior; o outro andar aparece apagado). A bomba vale para o andar em que foi colocada e só as paredes desse andar bloqueiam a explosão (a seta ↑ marca bomba no superior).";
  svg.onpointerdown=function(e){if(RO||LOCK)return;var p=ptr(svg,e);
    if(tool==="x"){var i=nearWall(m,p,FLOOR);if(i>=0){wlOf(m,FLOOR).splice(i,1);save();paint()}return}
    if(tool==="b"){m.bp[bs]={x:p[0],y:p[1],f:FLOOR};save();paint();return}
    cur=[p];curF=FLOOR;dr=true;svg.setPointerCapture(e.pointerId)};
  svg.onpointermove=function(e){if(!dr)return;var p=ptr(svg,e),l=cur[cur.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>6){cur.push(p);paint()}};
  svg.onpointerup=svg.onpointercancel=function(){if(!dr)return;dr=false;if(cur&&cur.length>=2){wlOf(m,curF).push(cur);save()}cur=null;paint()};
  bar();paint();w.appendChild(tb);w.appendChild(hd);w.appendChild(lg);w.appendChild(svg);return w}
var cmode="nm";
function routesOf(m,q){var sd=q.sd==="ct"?"ct":"tr",k=q.k||"tm",o=[];
  if(k==="tm"){var T=m.tm&&m.tm[sd];((T&&T.r)||[]).forEach(function(r){var s=T.sp[r.sp];o.push([r.id,((s&&s.n)?s.n:"Respawn "+(r.sp+1))+" · "+(r.nm||"rota")+" · P"+(r.n||1)+(r.vs?" ✓":"")])});return o}
  var L=k==="calls"?m.calls[sd]:k==="fx"?m.fx[sd]:m.defs[sd],D=L&&L[q.i|0];((D&&D.s)||[]).forEach(function(it,ii){if(!it.id)it.id=Date.now()+ii*7+Math.floor(Math.random()*1000);o.push([it.id,(k==="calls"?callName(D.players&&D.players[it.c],it.c):pname(it.c))+" · P"+(it.n||1)+(it.vs?" ✓":"")])});return o}
function routeRef(m,q){var sd=q.sd==="ct"?"ct":"tr",k=q.k||"tm";
  if(k==="tm"){var T=m.tm&&m.tm[sd];if(!T)return null;var it=(T.r||[]).filter(function(r){return String(r.id)===String(q.rid)})[0];if(!it)return null;var s=T.sp[it.sp];
    return{it:it,items:T.r,np:T.np||1,pe:T.pe||[],lane:function(r){return r.id},same:function(x){return x.sp===it.sp},who:(s&&s.n)||("Respawn "+(it.sp+1)),rn:(it.nm||"rota")+" P"+(it.n||1)}}
  var L=k==="calls"?m.calls[sd]:k==="fx"?m.fx[sd]:m.defs[sd],D=L&&L[q.i|0];if(!D)return null;var it2=(D.s||[]).filter(function(x){return String(x.id)===String(q.rid)})[0];if(!it2)return null;
  return{it:it2,items:D.s,np:D.np||1,pe:D.pe||[],lane:function(r){return r.c},same:function(x){return x.c===it2.c},who:k==="calls"?callName(D.players&&D.players[it2.c],it2.c):pname(it2.c),rn:"P"+(it2.n||1)}}
function collectRefs(m){var refs=m.vzr;function has(k,sd,i,id){return refs.some(function(q){return(q.k||"tm")===k&&(q.sd||"tr")===sd&&(k==="tm"||(q.i|0)===i)&&String(q.rid)===String(id)})}
  ["tr","ct"].forEach(function(sd){var T=m.tm&&m.tm[sd];((T&&T.r)||[]).forEach(function(r){if(r.vs&&!has("tm",sd,0,r.id))refs.push({k:"tm",sd:sd,i:0,rid:r.id})});
    [["def",m.defs],["calls",m.calls],["fx",m.fx]].forEach(function(pr){((pr[1]||{})[sd]||[]).forEach(function(D,di){(D.s||[]).forEach(function(it,ii){if(it.vs){if(!it.id)it.id=Date.now()+ii*7+Math.floor(Math.random()*1000);if(!has(pr[0],sd,di,it.id))refs.push({k:pr[0],sd:sd,i:di,rid:it.id})}})})})})}
function visEditor(m,host,key,cb,tNow){var w=el("div"),V=function(){return host[key]||(host[key]={r:260,f:70,fl:"",vis:[]})},vs=host[key];
  var f2=el("div",{class:"row"});
  f2.appendChild(pickL("Andar da visão",[["","Automático (acompanha as zonas)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],vs&&vs.fl!=null?vs.fl:"",function(v){V().fl=v===""?"":+v;save();cb()}));
  f2.appendChild(rng("Tamanho",60,600,num(vs&&vs.r,260),function(v){V().r=v;cb()}));
  f2.appendChild(rng("Abertura",20,140,num(vs&&vs.f,70),function(v){V().f=v;cb()}));w.appendChild(f2);
  var L=el("div");w.appendChild(L);
  function draw(){L.innerHTML="";var v=host[key],ks=(v&&v.vis)||[];
    ks.forEach(function(k,ki){var r2=el("div",{class:"row"}),tf=field("input",k.t||"","Começa em (ex: 1:50)",function(x){k.t=x;cb()});tf.style.maxWidth="130px";r2.appendChild(tf);
      var hf=field("input",k.h==null?"":k.h,"Fica (segundos)",function(x){k.h=x;cb()});hf.style.maxWidth="120px";r2.appendChild(hf);
      r2.appendChild(pickL("Olhar para",[["","Manual (ângulo)"]].concat(m.co.map(function(c){return[c.t,c.t||"(sem nome)"]})),k.cn||"",function(x){k.cn=x;save();draw();cb()}));
      if(!k.cn)r2.appendChild(rng("Ângulo",0,359,num(k.a,0),function(x){k.a=x;cb()}));
      var nx=ks[ki+1],info=el("span",{class:"hint"});if(nx&&k.h!=null&&k.h!==""){var gap=ptE(nx.t)-(ptE(k.t)+num(k.h,0));info.textContent=isFinite(gap)?(gap>0?"gira durante "+r1(gap)+" s até o próximo":"sem tempo para girar: troca na hora"):""}
      r2.appendChild(info);r2.appendChild(rmBtn("Tirar campo","Tirar este campo de visão?",function(){v.vis.splice(ki,1);save();draw();cb()}));L.appendChild(r2)})}
  var av=el("button",{class:"b edt",type:"button"});av.textContent="+ novo campo de visão";
  av.onclick=function(){var v=V();v.vis=v.vis||[];var ls=v.vis[v.vis.length-1],st="";if(ls&&ls.h!=null&&ls.h!==""&&ptE(ls.t)>=0)st=fmtT(115-(ptE(ls.t)+num(ls.h,0)+1));else if(tNow&&tNow()>0)st=fmtT(115-tNow());else st=fmtT(115);v.vis.push({t:st,h:"2",cn:(m.co[0]&&m.co[0].t)||"",a:0});save();draw();cb()};
  draw();w.appendChild(av);var hh=el("p",{class:"hint"});hh.textContent="Cada campo diz quando começa e quanto tempo fica. O intervalo entre o fim de um campo e o começo do próximo é o tempo que a câmera usa para girar até o outro.";w.appendChild(hh);return w}
function visaoView(m){m.vzr=m.vzr||[];m.zn=m.zn||[];collectRefs(m);
  var w=el("div",{class:"mm"}),tb=el("div",{class:"tb"}),ed=el("div",{class:"tb edt"}),svg=mksvg(m),wrap=el("div",{class:"mwrap"}),scr=el("div",{class:"row"}),list=el("div",{class:"ulist"}),cap=el("p",{class:"cap"}),hint=el("p",{class:"hint"}),ct=el("span",{class:"hint"});
  var tool="mouse",cur=null,curF=0,dr=false,ZF=0,t=0,tmr=null,mult=1,sl=null,pbtn=null,SPDV=215;
  svg.style.maxWidth=wrap.style.maxWidth="900px";if(hasFl(m))wrap.appendChild(fvCtl(m,function(){paint()},true));wrap.appendChild(svg);
  function res(){return m.vzr.map(function(q,qi){var rr=routeRef(m,q);if(!rr)return null;var S0=sched2(m,rr.items,rr.np,rr.pe,rr.lane,SPDV),idx=rr.items.indexOf(rr.it),wn=routeWin(S0,rr.items,rr.it,idx,rr.np,rr.same);
    return{q:q,qi:qi,rr:rr,vs:rr.it.vs,win:wn,lb:rr.who+" · "+rr.rn,tot:S0.tot,pos:function(x){return gpos(S0,rr.items,rr.np,rr.same,x)}}}).filter(Boolean)}
  function nearCo(P,a,r){var best=null,bd=70;m.co.forEach(function(c){var dx=c.x-P[0],dy=c.y-P[1],al=Math.atan2(dx,-dy)*180/Math.PI,off=Math.abs(wrap180(al-a)),dist=Math.hypot(dx,dy),pd=dist*Math.sin(off*Math.PI/180);if(off<90&&dist<r*1.3&&pd<bd){bd=pd;best=c.t}});return best}
  function total(){var e=1;res().forEach(function(r){e=Math.max(e,r.tot);if(r.vs)vKfs(r.vs).forEach(function(x){e=Math.max(e,x.t+x.d)})});return e}
  function zcen(P){var x=0,y=0;P.forEach(function(a){x+=a[0];y+=a[1]});return[x/P.length,y/P.length]}
  function paint(){var h=bgF(m),R=res(),hl={},info=[],txt=[];
    if(S.zv!==false)m.zn.forEach(function(z){var c=z.f?"#3b82f6":"#f59e0b",c2=zcen(z.p);h+='<polygon points="'+z.p.map(function(a){return a.join(",")}).join(" ")+'" fill="'+c+'" fill-opacity="'+(z.f?.16:.1)+'" stroke="'+c+'" stroke-width="2.5" stroke-dasharray="9 6" pointer-events="none"/><text x="'+c2[0]+'" y="'+c2[1]+'" font-size="20" font-weight="800" text-anchor="middle" fill="'+c+'" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+(z.f?"Superior":"Inferior")+"</text>"});
    h+=wallSvg(m,FLOOR);
    R.forEach(function(r){var p=r.pos(t);if(!p)return;var x=null,nm=null;if(r.vs&&r.win&&t>=r.win[0]&&t<r.win[1]){x=visAng(m,r.vs,r.pos,t);if(x){nm=x.k&&x.k.cn?x.k.cn:nearCo(p,x.a,num(r.vs.r,260));if(nm)hl[nm.trim().toLowerCase()]=1;txt.push(r.lb+": "+(nm||("ângulo "+Math.round(x.a)+"°")))}}info.push({r:r,p:p,x:x})});
    m.co.forEach(function(c){var on=hl[(c.t||"").trim().toLowerCase()];h+='<text x="'+c.x+'" y="'+c.y+'" font-size="'+Math.max(11,Math.round(c.s*.5))+'" font-weight="800" text-anchor="middle" stroke="#000" stroke-width="'+(on?3:2)+'" paint-order="stroke" pointer-events="none" style="fill:'+(on?"#ffe14d":"#fff")+'" opacity="'+(on?1:.8)+'">'+esc(c.t)+"</text>"});
    info.forEach(function(o){var vs=o.r.vs,col=COLORS[o.r.qi%5],ff=vs&&vs.fl!=null&&vs.fl!==""?+vs.fl:trackAt(m,o.r.pos,t);
      if(o.x){var W=vclipOn()?wallSegs(m,ff):[],pts=fovPoly(o.p,o.x.a,num(vs.r,260),num(vs.f,70),W);h+='<polygon points="'+pts.map(function(a){return a[0].toFixed(1)+","+a[1].toFixed(1)}).join(" ")+'" fill="'+col+'" fill-opacity=".28" stroke="'+col+'" stroke-opacity=".8" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>'}
      h+='<circle cx="'+o.p[0]+'" cy="'+o.p[1]+'" r="10" fill="#fff" stroke="'+col+'" stroke-width="5" pointer-events="none"/><text x="'+o.p[0]+'" y="'+(o.p[1]-18)+'" font-size="17" font-weight="800" text-anchor="middle" fill="'+col+'" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+esc(o.r.rr.who)+(ff===1?" ↑":"")+"</text>"});
    if(cur&&cur.length>1)h+='<polyline points="'+cur.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="'+(tool==="z"?(ZF?"#3b82f6":"#f59e0b"):"#111")+'" stroke-width="4"'+(tool==="z"?' stroke-dasharray="9 6"':'')+' stroke-linecap="round"/>';
    svg.innerHTML=h;cap.textContent=txt.length?"Mirando — "+txt.join(" · "):(m.vzr.length?"Nenhuma rota com visão neste instante (a visão só vale durante a rota escolhida).":"Adicione uma rota para criar a visão dela.");
    var tot=total();if(sl)sl.set(t,tot);ct.textContent="Relógio "+fmtT(115-t)+" (início 1:55)";if(pbtn)pbtn.textContent=tmr?"Pausar":"Play"}
  function stop(){if(tmr){clearInterval(tmr);tmr=null}}
  function go(){if(tmr)return;if(t>=total())t=0;tmr=setInterval(function(){t+=.05*mult;var tot=total();if(t>=tot){t=tot;stop()}paint()},50);paint()}
  function grp(par,label,opts,get,set){var l=el("span",{class:"hint"});l.textContent=label;par.appendChild(l);opts.forEach(function(o){var b=el("button",{class:"tool",type:"button","aria-pressed":get()===o[0]});b.textContent=o[1];b.onclick=function(){set(o[0]);bar();paint()};par.appendChild(b)})}
  function bar(){tb.innerHTML="";ed.innerHTML="";
    grp(tb,"Parede:",[[0,"Inferior"],[1,"Superior"],[2,"Mista"]],function(){return FLOOR},function(v){FLOOR=v});tb.appendChild(wallBtn());
    var zb=el("button",{class:"tool",type:"button","aria-pressed":S.zv!==false});zb.textContent="Zonas visíveis";zb.onclick=function(){S.zv=S.zv===false;save();bar();paint()};tb.appendChild(zb);
    var cb=el("button",{class:"tool",type:"button","aria-pressed":vclipOn()});cb.textContent="Visão para nas paredes";cb.onclick=function(){S.vclip=!vclipOn();save();bar();paint()};tb.appendChild(cb);
    [["mouse","Mouse"],["p","Lápis (parede "+FLN[FLOOR].toLowerCase()+")"],["x","Apagar parede"],["b","Lata de tinta (parede "+FLN[FLOOR].toLowerCase()+")"],["z","Zona (desenhar)"],["zx","Apagar zona (clique dentro)"]].forEach(function(k){var b=el("button",{class:"tool",type:"button","aria-pressed":tool===k[0]});b.textContent=k[1];b.onclick=function(){tool=k[0];bar()};ed.appendChild(b)});
    grp(ed,"Zona nova é:",[[0,"Inferior"],[1,"Superior"]],function(){return ZF},function(v){ZF=v});
    var tl=el("label",{class:"sl"}),ti=el("input",{type:"range",min:5,max:120,"aria-label":"Cor parecida"}),tv=el("span");ti.value=TOL;tv.textContent=TOL;ti.oninput=function(){TOL=+ti.value;tv.textContent=TOL};tl.appendChild(document.createTextNode("Cor parecida (lata) "));tl.appendChild(ti);tl.appendChild(tv);ed.appendChild(tl);
    var ub2=el("button",{class:"b",type:"button"});ub2.textContent="Desfazer lata de tinta";ub2.onclick=function(){if(LASTB&&LASTB.m===m){LASTB.arr.splice(LASTB.arr.length-LASTB.n,LASTB.n);LASTB=null;save();paint();setSt("Lata de tinta desfeita.")}else setSt("Nada para desfazer da lata.")};ed.appendChild(ub2);
    var u=el("button",{class:"b",type:"button"});u.textContent="Desfazer última parede";u.onclick=function(){wlOf(m,FLOOR).pop();save();paint()};ed.appendChild(u);
    var c=el("button",{class:"b danger",type:"button"});c.textContent="Limpar paredes ("+FLN[FLOOR].toLowerCase()+")";c.onclick=function(){if(!wlOf(m,FLOOR).length)return;ask("Apagar TODAS as paredes "+FLN[FLOOR].toLowerCase()+"s de "+(m.name||"este mapa")+"?",function(){if(FLOOR===2)m.wm=[];else if(FLOOR)m.wu=[];else m.wl=[];save();paint()})};ed.appendChild(c);
    var cz=el("button",{class:"b danger",type:"button"});cz.textContent="Limpar zonas";cz.onclick=function(){if(!m.zn.length)return;ask("Apagar TODAS as zonas de "+(m.name||"este mapa")+"?",function(){m.zn=[];save();paint()})};ed.appendChild(cz)}
  svg.onpointerdown=function(e){if(RO||LOCK)return;var p=ptr(svg,e);
    if(tool==="x"){var i=nearWall(m,p,FLOOR);if(i>=0){wlOf(m,FLOOR).splice(i,1);save();paint()}return}
    if(tool==="zx"){for(var k=m.zn.length-1;k>=0;k--)if(inPoly(p,m.zn[k].p)){m.zn.splice(k,1);save();paint();break}return}
    if(tool==="b"){paintBucket(m,p,FLOOR,TOL,function(){save();paint()});return}
    if(tool==="p"||tool==="z"){cur=[p];curF=FLOOR;dr=true;svg.setPointerCapture(e.pointerId)}};
  svg.onpointermove=function(e){if(!dr)return;var p=ptr(svg,e),l=cur[cur.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>6){cur.push(p);paint()}};
  svg.onpointerup=svg.onpointercancel=function(){if(!dr)return;dr=false;if(cur&&cur.length>=2){if(tool==="z"){if(cur.length>=4)m.zn.push({f:ZF,p:cur})}else wlOf(m,curF).push(cur);save()}cur=null;paint()};
  function V(rr){return rr.it.vs||(rr.it.vs={r:260,f:70,fl:"",vis:[]})}
  function cards(){list.innerHTML="";m.vzr.forEach(function(q,qi){var rr=routeRef(m,q),box=el("div",{class:"uc"}),f1=el("div",{class:"fld"}),k0=q.k||"tm",sw=el("i",{class:"sw"});sw.style.setProperty("--c",COLORS[qi%5]);f1.appendChild(sw);
    function fix(){var ro=routesOf(m,q);q.rid=ro.length?ro[0][0]:null}
    f1.appendChild(pickL("Origem",[["tm","Timing"],["def","Default"],["calls","Call"],["fx","Round (R1-5)"]],k0,function(v){q.k=v;q.i=0;fix();save();cards();paint()}));
    f1.appendChild(pickL("Lado",[["tr","TR"],["ct","CT"]],q.sd||"tr",function(v){q.sd=v;q.i=0;fix();save();cards();paint()}));
    var its=pullList(m,q);if(k0!=="tm"&&its.length)f1.appendChild(pickL("Qual",its,q.i|0,function(v){q.i=+v;fix();save();cards();paint()}));
    var ro=routesOf(m,q);if(ro.length){if(!ro.some(function(x){return String(x[0])===String(q.rid)}))q.rid=ro[0][0];f1.appendChild(pickL("Rota",ro,q.rid,function(v){var o=ro.filter(function(x){return String(x[0])===v})[0];q.rid=o?o[0]:v;save();cards();paint()}))}
    else{var nr=el("span",{class:"hint"});nr.textContent="Esta origem ainda não tem rotas desenhadas.";f1.appendChild(nr)}
    box.appendChild(f1);rr=routeRef(m,q);
    if(rr){var vs=rr.it.vs;
      var ve=visEditor(m,rr.it,"vs",function(){paint()},function(){return t});if(!CAN){ve.style.pointerEvents="none";ve.style.opacity=".55";var nh=el("p",{class:"hint"});nh.textContent="Só o dono do perfil (com a senha dele) salva visão nas rotas. Aqui você só vê.";box.appendChild(nh)}box.appendChild(ve)}
    var f3=el("div",{class:"row"});f3.appendChild(rmBtn("Tirar da lista","Tirar esta rota da lista? A visão salva nela continua existindo e a lista a traz de volta ao reabrir.",function(){m.vzr.splice(qi,1);save();cards();paint()}));
    if(rr&&rr.it.vs)f3.appendChild(rmBtn("Apagar a visão desta rota","Apagar de vez a visão salva nesta rota?",function(){delete rr.it.vs;m.vzr.splice(qi,1);save();cards();paint()}));box.appendChild(f3);list.appendChild(box)})}
  hint.textContent="Este é o único lugar onde se desenham paredes e zonas. Paredes: inferior (preta), superior (azul) e mista (roxa tracejada, vale para os dois andares). Zonas: desenhe uma área e diga se ela é inferior ou superior. O andar de quem anda NÃO é fixo: ele começa no andar da zona em que está (fora de zona = inferior) e só muda quando encosta em outra zona; fora disso mantém o andar. Regra das paredes: quem está numa zona superior só é afetado por parede superior, quem está numa zona inferior só por parede inferior, e a parede mista afeta os dois. Isso vale para barrar o desenho e para tapar a visão. Se um desenho atravessar uma parede, ao terminar o traço o trecho é refeito pelo caminho mais curto e aparece um aviso. Visão: escolha UMA rota (Timing, Default, Call ou Round) e em '+ visão' a hora e o callout para onde ele olha; a mira acompanha o callout enquanto o jogador anda e 'Tempo para virar' é quanto ele leva para girar. A visão fica salva na própria rota: aparece no replay do Timing e nas Defaults, Calls e Rounds (botão Campo de visão, sem editar) e dá para puxar para as Aberturas.";
  pbtn=el("button",{class:"b"});pbtn.onclick=function(){tmr?(stop(),paint()):go()};
  var rb=el("button",{class:"b"});rb.textContent="Reiniciar";rb.onclick=function(){stop();t=0;paint()};
  sl=scrub(function(v){stop();t=v;paint()});var sw2=el("div");sw2.style.cssText="flex:1;min-width:140px";sw2.appendChild(sl);
  var wr=el("label",{class:"sl"}),sp=el("select");wr.appendChild(document.createTextNode("Velocidade "));[[0.25,"0,25x"],[0.5,"0,5x"],[1,"1x"],[2,"2x"],[3,"3x"],[5,"5x"],[10,"10x"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===1)op.selected=true;sp.appendChild(op)});sp.onchange=function(){mult=parseFloat(sp.value)};wr.appendChild(sp);
  [rb,pbtn,sw2,ct,wr].forEach(function(x){scr.appendChild(x)});
  var ad=el("button",{class:"b edt",type:"button"});ad.textContent="+ Rota";ad.onclick=function(){var q={k:"tm",sd:"tr",i:0,rid:null};var ro=routesOf(m,q);q.rid=ro.length?ro[0][0]:null;m.vzr.push(q);save();cards();paint()};
  bar();cards();paint();w.appendChild(hint);w.appendChild(tb);w.appendChild(ed);w.appendChild(wrap);w.appendChild(cap);w.appendChild(scr);w.appendChild(list);w.appendChild(ad);return w}
;
/* parte 2 de 5 */
function calloutView(m){var w=el("div"),bar=el("div",{class:"tb"}),body=el("div");
  function go(){bar.innerHTML="";var lk=el("button",{class:"tool",type:"button","aria-pressed":String(CALLOK)});lk.textContent=CALLOK?(CAN?"🔓 Callouts destravados (clique para travar)":"🔓 Senha ok, mas este perfil está só visualizando (entre com a senha do jogador)"):"🔒 Callouts travados: só ver (clique e digite a senha)";
    lk.onclick=async function(){if(CALLOK){CALLOK=false;UNL.callouts=0;render();return}if(await unlockKey("callouts","Callouts")){CALLOK=true;render()}};bar.appendChild(lk);
    if(VIEW==="p1"&&UNL.p1&&CAN&&CALLOK){var ln=el("button",{class:"b primary",type:"button"});ln.textContent="📤 Lançar meus Callouts para os Players 2 a 5";ln.onclick=function(){ask("Isto copia TODOS os callouts do Player 1 (nomes, paredes inferiores, superiores e mistas e zonas, de todos os mapas) para os Players 2, 3, 4 e 5, substituindo os callouts deles. Os outros dados deles não mudam. Continuar?",launchCallouts)};bar.appendChild(ln)}
    [["nm","Nomes do mapa (callouts)"],["vis","Visão automática, paredes e zonas"],["img","Imagens das utilitárias"]].forEach(function(k){var b=el("button",{class:"tool",type:"button","aria-pressed":cmode===k[0]});b.textContent=k[1];b.onclick=function(){cmode=k[0];go()};bar.appendChild(b)});
    body.innerHTML="";body.appendChild(cmode==="vis"?visaoView(m):cmode==="img"?utilImgView():calloutNames(m))}
  go();w.appendChild(bar);w.appendChild(body);return w}
function iglView(m){
  var w=el("div",{class:"mm"}),a=el("h2"),b=el("h2");
  a.textContent="Ideia do IGL para "+m.name+" ("+SIDENAME[side]+")";b.textContent="Princípios gerais do IGL (valem para todos os mapas)";
  var t1=field("textarea",m.igl[side]||"","O que o IGL tem em mente neste mapa e lado",function(v){m.igl[side]=v}),t2=field("textarea",S.iglg||"","Princípios, regras e prioridades do time",function(v){S.iglg=v});
  t1.style.minHeight=t2.style.minHeight="220px";
  w.appendChild(a);w.appendChild(t1);w.appendChild(b);w.appendChild(t2);return w}
function calloutNames(m){
  var w=el("div",{class:"mm"}),tb=el("div",{class:"tb edt"}),ed=el("div",{class:"row edt"}),svg=mksvg(m),sel=-1,drag=false,tool="add";
  svg.style.maxWidth="900px";
  function paint(){var h=bg(m);m.co.forEach(function(c,i){h+='<text data-i="'+i+'" x="'+c.x+'" y="'+c.y+'" font-size="'+c.s+'" font-weight="800" text-anchor="middle" stroke="#000" stroke-width="'+(c.s/9).toFixed(1)+'" paint-order="stroke" style="cursor:move;fill:'+(i===sel?"#ffe14d":"#fff")+'">'+esc(c.t)+'</text>'});svg.innerHTML=h}
  function drawT(){tb.innerHTML="";[["mouse","Mouse"],["add","Escrever"]].forEach(function(k){var b=el("button",{class:"tool","aria-pressed":tool===k[0]});b.textContent=k[1];b.onclick=function(){tool=k[0];drawT()};tb.appendChild(b)});var cl=el("button",{class:"b danger",type:"button"});cl.textContent="Apagar todos os nomes";cl.onclick=function(){if(!m.co.length){setSt("Este mapa não tem nomes para apagar.");return}ask("Atenção: isso apaga TODOS os nomes (callouts) de "+(m.name||"este mapa")+". Não dá para desfazer. Deseja continuar?",function(){m.co=[];sel=-1;save();paint();eds()})};tb.appendChild(cl)}
  function eds(){ed.innerHTML="";if(sel<0||!m.co[sel]){var p=el("span",{class:"hint"});p.textContent="Escrever: clique no mapa para criar uma posição (depois volta para Mouse). Mouse: clique num nome para editar, arrastar ou mudar o tamanho.";ed.appendChild(p);return}
    var c=m.co[sel],ni=field("input",c.t,"Nome da posição",function(v){c.t=v;paint()});ni.style.flex="1";ed.appendChild(ni);
    [["A +",1.15],["A −",1/1.15]].forEach(function(k){var b=el("button",{class:"b"});b.textContent=k[0];b.onclick=function(){c.s=Math.max(8,Math.round(c.s*k[1]));save();paint()};ed.appendChild(b)});
    var rm=el("button",{class:"b danger"});rm.textContent="Remover";rm.onclick=function(){m.co.splice(sel,1);sel=-1;save();paint();eds()};ed.appendChild(rm);return ni}
  svg.onpointerdown=function(e){if(RO||LOCK)return;var p=ptr(svg,e),t=e.target.closest("[data-i]");
    if(t){sel=+t.dataset.i;drag=true;svg.setPointerCapture(e.pointerId);paint();eds();return}
    if(tool==="mouse"){sel=-1;paint();eds();return}
    m.co.push({t:"Nome",x:p[0],y:p[1],s:34});sel=m.co.length-1;tool="mouse";drawT();save();paint();var ni=eds();if(ni)ni.select()};
  svg.onpointermove=function(e){if(!drag)return;var p=ptr(svg,e),c=m.co[sel];c.x=p[0];c.y=p[1];paint()};
  svg.onpointerup=svg.onpointercancel=function(){if(drag){drag=false;save()}};
  drawT();paint();eds();w.appendChild(tb);w.appendChild(ed);w.appendChild(svg);return w}
function partialG(p,f){var L=0,i,s;for(i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);var g=f*L,o=[p[0]];for(i=1;i<p.length;i++){s=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(g>=s){o.push(p[i]);g-=s}else{var k=s?g/s:1;o.push([p[i-1][0]+(p[i][0]-p[i-1][0])*k,p[i-1][1]+(p[i][1]-p[i-1][1])*k]);break}}return o}
function ufx(u,a,tt){
  if(tt<a[1]||tt>=a[2])return null;
  var tl=a[2]-tt,op=1,sc=1,fx="",k=1-Math.min(1,tl);
  if(u.t==="molotov"){if(tl<2)sc=Math.max(.05,tl/2)}
  else if(u.t==="smoke"){if(tl<3.5)op=Math.max(0,tl/3.5)}
  else if(u.t==="decoy"){if(tl<1){op=1-k*.85;fx='<circle r="'+(4+k*11)+'" fill="#ff9d2e" stroke="#ffd27a" stroke-width="1.6" opacity="'+(1-k)+'"/>'}}
  else if(u.t==="he"){op=1-k*.85;fx='<circle r="'+(5+k*17)+'" fill="#ff9d2e" stroke="#ffd27a" stroke-width="2" opacity="'+(1-k)+'"/>'}
  else if(u.t==="flash"){op=1-k*.85;var g=7+k*22,o=1-k;fx='<circle r="'+g+'" fill="#fff" opacity="'+(.22*o)+'"/><circle r="'+(g*.66)+'" fill="#fff" opacity="'+(.4*o)+'"/><circle r="'+(g*.33)+'" fill="#fff" opacity="'+o+'"/>'}
  return[op,sc,fx]}
function usvg(list,tt){var h="";list.forEach(function(o){
  var a=ltimeG(o.u,o.e),nm='<text y="21" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".7" paint-order="stroke">'+esc(o.u.nm||"")+'</text>';
  if(tt===null||!a||o.timed===false){h+='<g transform="translate('+o.u.x+' '+o.u.y+') scale(2.2)">'+icoT(o.u.t)+nm+'</g>';return}
  if(tt<a[1]){
    if(tt>=a[0]&&o.st){
      var f=Math.min(1,(tt-a[0])/Math.max(.01,a[1]-a[0])),dx=o.u.x-o.st[0],dy=o.u.y-o.st[1],x=o.st[0]+dx*f,y=o.st[1]+dy*f,ar=Math.sin(Math.PI*f),lift=ar*Math.min(110,40+Math.hypot(dx,dy)*.18),sc=1.4+.8*f+.6*ar;
      h+='<line x1="'+o.st[0]+'" y1="'+o.st[1]+'" x2="'+x+'" y2="'+y+'" stroke="#fff" stroke-width="3" stroke-dasharray="6 9" stroke-linecap="round" opacity=".4"/>'
        +'<ellipse cx="'+x+'" cy="'+y+'" rx="'+(10-4*ar)+'" ry="'+(4.5-1.8*ar)+'" fill="#000" opacity="'+(.3-.12*ar)+'"/>'
        +'<g transform="translate('+x+' '+(y-lift)+') scale('+sc+')" opacity=".62">'+icoT(o.u.t)+'</g>'}
    return}
  var r=ufx(o.u,a,tt);if(!r)return;
  var pop=1+.35*Math.max(0,1-(tt-a[1])/.25);
  h+='<g transform="translate('+o.u.x+' '+o.u.y+') scale('+(2.2*r[1]*pop)+')">'+r[2]+'<g opacity="'+r[0]+'">'+icoT(o.u.t)+(r[1]>.5?nm:"")+'</g></g>'});return h}
function mapPlayer(m,T0,routes,SPD,opt){
  T0.np=T0.np||1;T0.pe=T0.pe||[];var T=T0,br=null,pending=null,CH=!!(opt&&opt.choices),ovl=el("div",{class:"ovl"}),wrap=el("div",{class:"mwrap"});
  var P={solo:null,mult:1,pp:false},svg=mksvg(m),scr=el("div",{class:"row"}),tmr=null,t=0,touched=false,pb=el("button",{class:"b"}),rb=el("button",{class:"b"}),sl=scrub(function(v){stop();pending=null;ovl.style.display="none";touched=true;t=v;paint()}),ct=el("span",{class:"hint"}),pbx=el("div",{class:"row"}),pkey="";
  pbx.style.flexBasis="100%";wrap.appendChild(svg);wrap.appendChild(ovl);
  function ROU(){return br?br.r:routes()}
  function SC(){var R=ROU();return{R:R,S:sched2(m,R,T.np,T.pe,function(r){return r.id},SPD)}}
  function rpOf(S,x){var k=1;for(var j=1;j<=T.np;j++)if(S.T[j]<=x+1e-9)k=j;return k}
  function act(R){R=R||ROU();return P.solo?R.filter(function(r){return P.solo.indexOf(r)>=0}):R}
  function rpos(r,i,S,x){var n=r.n||1,q=S.del[i]||[0,1];return posAtG(r.p,Math.max(0,Math.min(1,(x-S.T[n]-q[0])/q[1])))}
  function total(){var o=SC(),S=o.S,e=1;if(!P.solo)e=Math.max(e,S.tot);
    act(o.R).forEach(function(r){var i=o.R.indexOf(r),n=r.n||1,x=S.del[i];if(x)e=Math.max(e,Math.min(S.T[n]+x[0]+x[1],S.T[n]+S.D[n]));(r.ul||[]).forEach(function(y){if(y.hid)return;var u=findU(m,y.n),a=u&&ltimeG(u,y);if(a&&a[2]>e)e=a[2]})});return e}
  var TX=' font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke"';
  function buildParts(){pbx.innerHTML="";if(T.np<2)return;
    for(var k=1;k<=T.np;k++)(function(k){var b=el("button",{class:"b",type:"button"});b.textContent="Parte "+k;b.onclick=function(){stop();touched=true;t=SC().S.T[k];paint()};pbx.appendChild(b)})(k);
    var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.checked=!!P.pp;cb.onchange=function(){P.pp=cb.checked};lb.appendChild(cb);lb.appendChild(document.createTextNode(" Pausar no fim de cada parte"));pbx.appendChild(lb)}
  function paint(){var h=bg(m),o=SC(),R=o.R,S=o.S,A=act(R),idle=!tmr&&!touched,rp=idle?0:rpOf(S,t),fs=idle?1:Math.min(1,Math.max(0,(t-S.T[rp])/.8)),tot=total();
    R.forEach(function(r){var n=r.n||1;if(!idle&&n>rp)return;var fo=idle?1:fadeOp(rp-n,fs);if(fo<=.01)return;var e=r.p[r.p.length-1],op=.9*fo;
      h+='<polyline points="'+r.p.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="'+COLORS[r.sp%5]+'" stroke-width="'+(4*SZ("tr"))+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+op+'"/><text x="'+e[0]+'" y="'+(e[1]-14)+'" font-size="24"'+TX+' opacity="'+Math.min(1,op+.1)+'">'+esc((r.nm||"")+(T.np>1?" · P"+(r.n||1):""))+'</text>'});
    if(idle)R.forEach(function(r){h+=redSvg(r)});
    T.sp.forEach(function(s,i){if(P.vsp>=0&&i!==P.vsp)return;h+='<circle cx="'+s.x+'" cy="'+s.y+'" r="8" fill="'+COLORS[i%5]+'" stroke="#fff" stroke-width="1.5"/><text x="'+s.x+'" y="'+(s.y+4)+'" font-size="11"'+TX+'>'+(i+1)+'</text><text x="'+s.x+'" y="'+(s.y+21)+'" font-size="13"'+TX+'>'+esc(s.n||"")+'</text>'});
    var ul=[];R.forEach(function(r,ri){var on=A.indexOf(r)>=0,n=r.n||1,x=S.del[ri];(r.ul||[]).forEach(function(e){if(e.hid)return;var u=findU(m,e.n);if(!u)return;var a=ltimeG(u,e),oo={u:u,e:e,timed:on&&!idle};if(a&&on&&x)oo.st=posAtG(r.p,Math.max(0,Math.min(1,(a[0]-S.T[n]-x[0])/x[1])));ul.push(oo)})});
    h+=usvg(ul,idle?null:t);
    if(!idle&&visOn())R.forEach(function(r,ri){if(!r.vs||(P.vsp>=0&&r.sp!==P.vsp))return;var same=function(x){return x.sp===r.sp},w=routeWin(S,R,r,ri,T.np,same);if(!w||t<w[0]||t>=w[1])return;h+=visSvg(m,r.vs,function(x){return gpos(S,R,T.np,same,x)},t,COLORS[r.sp%5])});
    if(!idle){A.forEach(function(r){if((r.n||1)!==rp)return;var q=rpos(r,R.indexOf(r),S,t);h+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(9*SZ("pl"))+'" fill="#fff" stroke="'+COLORS[r.sp%5]+'" stroke-width="'+(3*SZ("pl"))+'"/>'});
      var cur2={},bst={};A.forEach(function(r){if((r.n||1)===rp)cur2[r.sp]=1});A.forEach(function(r){var n=r.n||1;if(n<rp&&!cur2[r.sp]&&r.p.length&&(!bst[r.sp]||n>(bst[r.sp].n||1)))bst[r.sp]=r});
      Object.keys(bst).forEach(function(k){var e2=bst[k].p[bst[k].p.length-1];h+='<circle cx="'+e2[0]+'" cy="'+e2[1]+'" r="9" fill="#fff" stroke="'+COLORS[k%5]+'" stroke-width="3" opacity=".5"/>'});
      var ce=[];A.forEach(function(r){(r.ul||[]).forEach(function(e){if(!e||typeof e==="string"||e.hid)return;var u=findU(m,e.n);if(!u)return;var P2=gpos(S,R,T.np,function(x){return x.sp===r.sp},t);if(P2)ce.push({u:u,e:e,P:P2,k:"s"+r.sp})})});h+=carryDraw(ce,t)}
    if(P.extra&&idle)h+=P.extra();svg.innerHTML=h;sl.set(idle?0:t,tot);strip.rf(tot);
    ct.textContent="Relógio "+fmtT(115-(idle?0:t))+" (início 1:55)"+((T.np>1&&!idle)?" · Parte "+rp+" de "+T.np:"");pb.textContent=tmr?"Pausar":"Play";
    if(pkey!==String(T.np)){pkey=String(T.np);buildParts()}}
  function stop(){if(tmr){clearInterval(tmr);tmr=null}}
  function unbranch(){br=null;T=T0;pending=null;ovl.style.display="none";ovl.innerHTML="";pkey=""}
  function chAt(S0,t0){var r=null;if(!CH||br)return null;(T0.ch||[]).forEach(function(c){var n=c.n||1;if(r||!(c.o&&c.o.length)||n>T0.np)return;var tn=S0.T[n]+S0.D[n];if(t0<tn-1e-9&&t>=tn-1e-9)r={c:c,t:tn}});return r}
  function showCh(c){pending=c;ovl.innerHTML="";var q=el("strong");q.textContent=c.q||"Escolha";ovl.appendChild(q);
    c.o.forEach(function(o){var b=el("button",{class:"b primary",type:"button"});b.textContent=o.nm||"Opção";b.onclick=function(){branch(c,o);go()};ovl.appendChild(b)});ovl.style.display="flex"}
  function branch(c,o){var n=c.n||1;o.r=o.r||[];o.np=o.np||1;o.pe=o.pe||[];
    var base=routes().filter(function(r){return(r.n||1)<=n}),add=o.r.map(function(r){var z=JSON.parse(JSON.stringify(r));z.n=(r.n||1)+n;z.id=String(r.id)+"_o";return z});
    br={sp:T0.sp,np:n+o.np,pe:T0.pe.slice(0,n).concat(o.pe),r:base.concat(add)};T=br;pending=null;ovl.style.display="none";pkey="";paint()}
  function go(){if(pending){showCh(pending);return}if(tmr)return;touched=true;if(t>=total())t=0;tmr=setInterval(function(){var S=SC().S,r0=rpOf(S,t),t00=t;t+=.05*P.mult;
    var hit=chAt(S,t00);if(hit){t=hit.t;stop();showCh(hit.c);paint();return}
    if(P.pp){var nr=rpOf(S,t);if(nr>r0){t=S.T[nr];stop();paint();return}}
    var tot=total();if(t>=tot){t=tot;stop()}paint()},50);paint()}
  rb.textContent="Reiniciar";rb.onclick=function(){stop();unbranch();t=0;touched=false;P.solo=null;paint()};
  pb.onclick=function(){if(tmr){stop();paint()}else go()};
  var wr=el("label",{class:"sl"}),sp=el("select");wr.appendChild(document.createTextNode("Velocidade "));
  [[0.25,"0,25x"],[0.5,"0,5x"],[1,"1x"],[2,"2x"],[3,"3x"],[5,"5x"],[10,"10x"]].forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===1)op.selected=true;sp.appendChild(op)});
  sp.onchange=function(){P.mult=parseFloat(sp.value)};wr.appendChild(sp);
  var strip=tstrip(function(){var o=[];act().forEach(function(r){(r.ul||[]).forEach(function(x){if(x.hid)return;var u=findU(m,x.n);if(u)o.push({u:u,e:x})})});return o},function(x){stop();touched=true;t=x;paint()},function(){var S=SC().S,o=[];for(var k=1;k<=T.np;k++)o.push({t:S.T[k],n:k});return o}),sw=el("div");
  sw.style.cssText="flex:1;min-width:140px";sw.appendChild(sl);sw.appendChild(strip);
  [rb,pb,sw,ct,wr,cmSel(function(){paint()}),vvBtn(function(){paint()}),szCtl(function(){paint()}),pbx].forEach(function(x){scr.appendChild(x)});
  P.svg=svg;P.wrap=wrap;P.scr=scr;P.paint=paint;P.stop=stop;P.reset=function(){stop();unbranch();t=0;touched=false};
  P.play=function(list){stop();unbranch();P.solo=list||null;var A=act(),t0=0;if(list&&A.length){var S=SC().S;t0=Math.min.apply(null,A.map(function(r){return S.T[r.n||1]||0}))}t=t0;go()};
  return P}
function tchoiceEd(m,T){T.ch=T.ch||[];var w=el("div",{class:"uc"}),h=el("strong"),hint=el("p",{class:"hint"}),list=el("div",{class:"ulist"});
  h.textContent="Escolhas durante o replay (controvérsias)";
  hint.textContent="Igual ao Default: no Replay, ao terminar a parte escolhida, tudo para e aparecem botões em cima do mapa. Cada opção tem as suas próprias rotas (com partes e utilitárias), começando de onde as rotas da parte escolhida terminaram. Exemplos: depois da parte 1, 'o segundo roda ou fica?' ou 'o 3 flasha 2 ou só 1?'.";
  function draw(){list.innerHTML="";T.ch.forEach(function(c,ci){var box=el("div",{class:"uc"}),row=el("div",{class:"row"}),ns=[];for(var i=1;i<=Math.max(T.np||1,c.n||1);i++)ns.push([i,String(i)]);
      row.appendChild(pickL("Depois da parte",ns,c.n||1,function(v){c.n=parseInt(v,10);save();draw()}));
      var q=field("input",c.q||"","Pergunta (ex: o segundo roda ou fica?)",function(v){c.q=v});q.style.flex="1";row.appendChild(q);
      row.appendChild(rmBtn("Remover escolha","Remover esta escolha e todas as opções dela?",function(){T.ch.splice(ci,1);save();draw()}));box.appendChild(row);
      c.o=c.o||[];c.o.forEach(function(o,oi){var r2=el("div",{class:"row"}),host=el("div"),nm=field("input",o.nm||"","Nome da opção",function(v){o.nm=v});nm.style.flex="1";r2.appendChild(nm);
        var eb=el("button",{class:"b edt",type:"button"});eb.textContent="Editar rotas";
        eb.onclick=function(){if(host.firstChild){host.innerHTML="";eb.textContent="Editar rotas";return}
          o.r=o.r||[];o.np=o.np||1;o.pe=o.pe||[];
          Object.defineProperty(o,"sp",{get:function(){return T.sp},enumerable:false,configurable:true});
          Object.defineProperty(o,"bs",{value:{T:T,n:c.n||1},enumerable:false,writable:true,configurable:true});
          host.appendChild(timingView(m,o));eb.textContent="Fechar rotas"};
        r2.appendChild(eb);r2.appendChild(rmBtn("Tirar","Tirar esta opção?",function(){c.o.splice(oi,1);save();draw()}));box.appendChild(r2);box.appendChild(host)});
      var ao=el("button",{class:"b edt",type:"button"});ao.textContent="+ Opção";ao.onclick=function(){c.o.push({nm:"Opção "+(c.o.length+1),r:[],np:1,pe:[]});save();draw()};box.appendChild(ao);list.appendChild(box)})}
  var ac=el("button",{class:"b edt",type:"button"});ac.textContent="+ Escolha";ac.onclick=function(){T.ch.push({n:T.np||1,q:"",o:[{nm:"Opção 1",r:[],np:1,pe:[]},{nm:"Opção 2",r:[],np:1,pe:[]}]});save();draw()};
  draw();w.appendChild(h);w.appendChild(hint);w.appendChild(list);w.appendChild(ac);w.style.marginTop="12px";return w}
function timingView(m,OPT){
  var T=OPT||m.tm[side],w=el("div",{class:"mm"}),sub=el("div",{class:"tb"}),bar=el("div",{class:"tb edt"}),sl=el("div",{class:"ulist"}),rl=el("div",{class:"ulist"}),gl=el("div",{class:"ulist"}),ptl=el("div",{class:"ulist"}),rsy=[];
  T.gr=T.gr||[];T.np=T.np||1;T.pe=T.pe||[];T.r.forEach(function(r,i){if(!r.id)r.id=Date.now()+i});
  var tblBox=el("div"),tool="route",hid=[],vs=-1,cs=null,T0=115,SPD=215,gps=[],tpart=1,efT=-1,oldR=null,dupR=[],hist=[],ub=null;
  function vis(r){return hid.indexOf(r)<0&&(vs<0||r.sp===vs)}
  var P=mapPlayer(m,T,function(){return T.r.filter(vis)},SPD,{choices:!OPT}),svg=P.svg;
  function dur(r){return r.tw>0?r.tw:plen2(m,r.p)/SPD}
  function SCall(){return sched2(m,T.r,T.np,T.pe,function(r){return r.id},SPD)}
  function refreshR(){rsy.forEach(function(f){f()});tbl()}
  function pa(){P.paint();gps.forEach(function(q){q.paint()});tbl()}
  function tbl(){
    var S=SCall(),sd=side==="tr"?"TR":"CT",rows=T.r.map(function(r,i){var n=r.n||1,x=S.del[i]||[0,0],t=S.T[n]+x[0]+x[1];return{sp:r.sp,n:n,nm:r.nm||"Rota",d:x[1],t:t,man:!!S.man[i]}});
    rows.sort(function(a,b){return a.sp-b.sp||a.t-b.t});
    var h='<div style="overflow-x:auto"><table class="tt"><thead><tr><th>Respawn</th><th>Lado</th><th>Posição</th>'+(T.np>1?'<th>Parte</th>':'')+'<th>Tempo</th><th>Chega no relógio</th><th>Fonte</th></tr></thead><tbody>';
    rows.forEach(function(r){var s2=T.sp[r.sp];h+='<tr><td>'+esc(s2?(s2.n||("Respawn "+(r.sp+1))):"-")+'</td><td>'+sd+'</td><td>'+esc(r.nm)+'</td>'+(T.np>1?'<td>'+r.n+'</td>':'')+'<td><strong>'+r1(r.d)+' s</strong></td><td>'+fmtT(T0-r.t)+'</td><td>'+(r.man?"tempo digitado":"estimado pelo desenho")+'</td></tr>'});
    if(!rows.length)h+='<tr><td colspan="7">Nenhuma rota ainda. Desenhe uma rota no mapa acima.</td></tr>';
    tblBox.innerHTML=h+'</tbody></table></div>'}
  function btn(par,txt,fn,on,cls){var b=el("button",{class:cls||"tool","aria-pressed":on||false});b.textContent=txt;b.onclick=fn;par.appendChild(b);return b}
  function sel3(label,opts,val,fn){var wr=el("label",{class:"sl"}),s=el("select");wr.appendChild(document.createTextNode(label+" "));
    opts.forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(String(o[0])===String(val))op.selected=true;s.appendChild(op)});s.onchange=function(){fn(s.value)};wr.appendChild(s);sub.appendChild(wr)}
  function drawBar(){bar.innerHTML="";if(!OPT)btn(bar,"Marcar respawn",function(){tool="spawn";drawBar();pa()},tool==="spawn");btn(bar,"Desenhar rota",function(){tool="route";drawBar();pa()},tool==="route");
    var un=btn(bar,"Apagar última rota da Parte "+tpart,function(){var ix=-1;for(var j=T.r.length-1;j>=0;j--){if((T.r[j].n||1)===tpart&&(efT<0||T.r[j].sp===efT)){ix=j;break}}if(ix<0)return;snapT();var r=T.r.splice(ix,1)[0];T.gr.forEach(function(g){g.ids=g.ids.filter(function(x){return x!==r.id})});hid=hid.filter(function(x){return x!==r});P.reset();save();lists();pa();setSt("Última rota da Parte "+tpart+" apagada às "+hora())});un.disabled=!T.r.some(function(r){return(r.n||1)===tpart&&(efT<0||r.sp===efT)});
    if(T.sp.length>1){var ew=el("label",{class:"sl"}),es=el("select");[[-1,"qualquer respawn"]].concat(T.sp.map(function(s,i){return[i,s.n||("Respawn "+(i+1))]})).forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(String(o[0])===String(efT))op.selected=true;es.appendChild(op)});es.onchange=function(){efT=parseInt(es.value,10);drawBar()};ew.appendChild(document.createTextNode("Apagar de: "));ew.appendChild(es);bar.appendChild(ew)}
    for(var k=1;k<=T.np;k++)(function(k){btn(bar,"Parte "+k,function(){tpart=k;drawBar();pa()},tpart===k)})(k);
    btn(bar,"+ parte",function(){T.np++;tpart=T.np;save();lists();pa()});
    var rp2=btn(bar,"- parte",function(){if(T.np<2)return;ask("Remover a Parte "+T.np+" (a última)? As rotas dela serão apagadas.",function(){snapT();var k=T.np;T.r=T.r.filter(function(r){return(r.n||1)!==k});var ids=T.r.map(function(r){return r.id});T.gr.forEach(function(g){g.ids=g.ids.filter(function(x){return ids.indexOf(x)>=0})});hid=hid.filter(function(x){return T.r.indexOf(x)>=0});T.pe.splice(k-1,1);T.np--;tpart=Math.min(tpart,T.np);P.reset();save();lists();pa()})});rp2.disabled=T.np<2;[["◀ Mover parte",-1],["Mover parte ▶",1]].forEach(function(q){var k2=tpart+q[1],mb3=btn(bar,q[0],function(){snapT();swapPartsT(T,tpart,k2);tpart=k2;P.reset();save();lists();pa();setSt("Partes trocadas às "+hora())});mb3.disabled=k2<1||k2>T.np});ub=btn(bar,"Desfazer",undoT);ub.disabled=!hist.length;var rb1=btn(bar,"Refazer",redoT);if(rb1)rb1.disabled=!rhistT.length}
  function drawParts(){ptl.innerHTML="";var sy=[];function all(){sy.forEach(function(f){f()});refreshR()}
    for(var k=1;k<=T.np;k++)(function(k){var c=el("div",{class:"uc"}),h=el("div",{class:"row"}),info=el("span",{class:"hint"}),lb=el("strong");lb.textContent="Parte "+k;
      var f=field("input",T.pe[k-1]||"","Termina em: relógio (1:30) ou duração em segundos (20)",function(v){T.pe[k-1]=v;all();pa()});f.style.flex="1";
      function sy1(){var S=SCall(),e=pEnd(T.pe[k-1],S.T[k]),ok=e>=0&&e>S.T[k]+.5;info.textContent="Dura "+r1(S.D[k])+" s · do relógio "+fmtT(115-S.T[k])+" até "+fmtT(115-S.T[k]-S.D[k])+(ok?"":" (automático: até a última rota chegar)")}
      sy.push(sy1);sy1();h.appendChild(lb);h.appendChild(f);c.appendChild(h);c.appendChild(info);ptl.appendChild(c)})(k)}
  function drawSub(){sub.innerHTML="";
    sel3("Ver respawn",[[-1,"Todos"]].concat(T.sp.map(function(s,i){return[i,s.n||("Respawn "+(i+1))]})),vs,function(v){vs=parseInt(v,10);P.vsp=vs;P.reset();P.paint()})}
  function drawG(){gps.forEach(function(q){q.stop()});gps=[];gl.innerHTML="";
    T.gr.forEach(function(g,gi){var c=el("div",{class:"uc"}),h=el("div",{class:"row"}),ck=el("div",{class:"row"});
      var gm=mapPlayer(m,T,function(){return T.r.filter(function(r){return g.ids.indexOf(r.id)>=0})},SPD);gm.svg.style.maxWidth="560px";gps.push(gm);
      var ni=field("input",g.nm||"","Nome do grupo (ex: default A)",function(v){g.nm=v});ni.style.flex="1";h.appendChild(ni);c.appendChild(h);
      T.r.forEach(function(r){var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.disabled=RO;cb.checked=g.ids.indexOf(r.id)>=0;
        cb.onchange=function(){var k=g.ids.indexOf(r.id);if(cb.checked&&k<0)g.ids.push(r.id);if(!cb.checked&&k>=0)g.ids.splice(k,1);save();gm.reset();gm.paint()};lb.appendChild(cb);lb.appendChild(document.createTextNode(" "+(r.nm||"Rota")));ck.appendChild(lb)});
      c.appendChild(ck);var b=el("div",{class:"row"});btn(b,"Play grupo",function(){gm.play(null)},false,"b");
      var rm=el("button",{class:"b danger"});rm.textContent="Remover grupo";rm.onclick=function(){T.gr.splice(gi,1);save();drawG()};b.appendChild(rm);c.appendChild(b);
      c.appendChild(gm.svg);c.appendChild(gm.scr);gm.paint();gl.appendChild(c)})}
  function lists(){sl.innerHTML="";rl.innerHTML="";rsy=[];tbl();drawBar();drawSub();if(!OPT)drawG();drawParts();
    if(!OPT)T.sp.forEach(function(s,i){var c=el("div",{class:"uc"}),h=el("div",{class:"row"});h.innerHTML='<i class="sw" style="--c:'+COLORS[i%5]+'"></i><strong>'+(i+1)+'.</strong>';
      var ni=field("input",s.n||"","Nome do respawn",function(v){s.n=v;pa()});ni.style.flex="1";h.appendChild(ni);
      var rm=el("button",{class:"b danger"});rm.textContent="Remover";rm.onclick=function(){snapT();efT=-1;T.sp.splice(i,1);T.r.forEach(function(r){if(r.sp===i)r.sp=0;else if(r.sp>i)r.sp--});save();lists();P.paint()};h.appendChild(rm);c.appendChild(h);sl.appendChild(c)});
    T.r.forEach(function(r,ri){var c=el("div",{class:"uc"}),h=el("div",{class:"row"}),info=el("p",{class:"hint"});
      var ni=field("input",r.nm||"","Nome da posição (ex: fundo contato)",function(v){r.nm=v;pa()});ni.style.flex="1";h.appendChild(ni);
      var sp=el("select",{class:"sel","aria-label":"Respawn de saída"});T.sp.forEach(function(s,i){var o=el("option",{value:i});o.textContent="Sai de: "+(s.n||("Respawn "+(i+1)));if(i===r.sp)o.selected=true;sp.appendChild(o)});sp.onchange=function(){r.sp=parseInt(sp.value,10);save();pa()};
      if(T.sp.length)h.appendChild(sp);
      if(T.np>1){var ps=el("select",{class:"sel","aria-label":"Parte da rota"});for(var k=1;k<=T.np;k++){var po=el("option",{value:k});po.textContent="Parte "+k;if(k===(r.n||1))po.selected=true;ps.appendChild(po)}ps.onchange=function(){r.n=parseInt(ps.value,10);save();P.reset();lists();pa()};h.appendChild(ps)}
      c.appendChild(h);
      var tv=field("input",r.tv||(r.tw>0?String(r.tw):""),"Tempo: segundos (8) ou relógio de chegada (1:50)",function(v){r.tv=v;r.tw=0;refreshR();pa()});
      function sync(){var S=SCall(),i=T.r.indexOf(r),n=r.n||1,x=S.del[i]||[0,0],d=x[1],st=S.T[n]+x[0];info.textContent=(T.np>1?"Parte "+n+" · ":"")+"Duração usada: "+d.toFixed(1)+"s"+(S.man[i]?"":" (estimada pelo desenho)")+" · chega no relógio: "+fmtT(T0-(st+d))+(x[0]+x[1]>S.D[n]+.01?" · corta no fim da parte":"")}
      var f=el("div",{class:"row"});tv.style.flex="1";f.appendChild(tv);c.appendChild(f);sync();rsy.push(sync);c.appendChild(info);
      var fr2=el("div",{class:"row edt"});
      function refixT(){snapT();applyFix(m,r,T.r.filter(function(x){return x.sp===r.sp&&x!==r}),r.fl,false);save();lists();P.paint()}
      fr2.appendChild(pickL("Andar da rota",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],r.fl==null?"":r.fl,function(v){r.fl=v===""?"":+v;refixT()}));if(hasFl(m))fr2.appendChild(fcEd(r,"fc","Andar por tempo",function(){save();refixT()}));
      var rfx=el("button",{class:"b",type:"button"});rfx.textContent="Refazer pelas paredes";rfx.onclick=refixT;fr2.appendChild(rfx);c.appendChild(fr2);
      if(r.red&&r.red.length){var wn=el("p",{class:"hint"});wn.style.color="#e11d1d";wn.textContent="Esta rota bateu numa parede: a parte em vermelho no mapa passou da parede e a rota para antes dela. Troque o andar, redesenhe ou, se a passagem for estreita e o caminho estiver certo, use o botão abaixo.";c.appendChild(wn)}c.appendChild(okBtn(r,refixT));
      c.appendChild(field("textarea",r.tx||"","Descrição do timing: o que ele faz, o que isso significa",function(v){r.tx=v}));
      var ulw=utilLink(m,r);ulw.onchg=pa;c.appendChild(ulw);
      var b=el("div",{class:"row"});btn(b,"Play",function(){P.play([r])},false,"b");
      var hb=btn(b,hid.indexOf(r)<0?"Esconder":"Mostrar",function(){var k=hid.indexOf(r);if(k<0)hid.push(r);else hid.splice(k,1);hb.textContent=k<0?"Mostrar":"Esconder";P.reset();P.paint()},false,"b");
      var rm=el("button",{class:"b danger"});rm.textContent="Remover";rm.onclick=function(){snapT();P.reset();T.r.splice(ri,1);T.gr.forEach(function(g){g.ids=g.ids.filter(function(x){return x!==r.id})});hid=hid.filter(function(x){return x!==r});save();lists();P.paint()};b.appendChild(rm);c.appendChild(b);rl.appendChild(c)})}
  svg.onpointerdown=function(e){if(RO||LOCK)return;var p=ptr(svg,e);P.reset();
    if(tool==="spawn"){snapT();T.sp.push({n:"Respawn "+(T.sp.length+1),x:p[0],y:p[1]});save();lists();P.paint();return}
    var best=0,bd=1e9;T.sp.forEach(function(s,i){var d=Math.hypot(s.x-p[0],s.y-p[1]);if(d<bd){bd=d;best=i}});
    if(tpart>1||OPT){var bd2=80,bc=null;T.sp.forEach(function(s,i){var pe2=prevEnd2(i,tpart)||[s.x,s.y],dd=Math.hypot(pe2[0]-p[0],pe2[1]-p[1]);if(dd<bd2){bd2=dd;bc={sp:i,pt:pe2}}});
      if(T.sp.length&&!bc){setSt("Comece perto de onde a parte anterior terminou (círculo tracejado no mapa).");return}
      if(bc){best=bc.sp;p=[bc.pt[0],bc.pt[1]]}}
    snapT();
    var olds=T.r.filter(function(r){return r.sp===best&&(r.n||1)===tpart});
    if(olds.length){cs=olds[0];oldR=cs.p;cs.p=[p];dupR=olds.slice(1)}
    else{cs={id:Date.now()+Math.floor(Math.random()*1000),nm:"Rota "+(T.r.length+1),sp:best,p:[p],n:tpart};T.r.push(cs);oldR=null;dupR=[]}
    svg.setPointerCapture(e.pointerId);P.paint()};
  var rhistT=[];function snapT(){rhistT.length=0;hist.push(JSON.stringify({r:T.r,sp:T.sp,gr:T.gr,np:T.np,pe:T.pe}));if(hist.length>30)hist.shift()}
  function redoT(){if(!rhistT.length)return;hist.push(JSON.stringify({r:T.r,sp:T.sp,gr:T.gr,np:T.np,pe:T.pe}));var o=JSON.parse(rhistT.pop());T.r=o.r;if(!OPT)T.sp=o.sp;T.gr=o.gr;T.np=o.np;T.pe=o.pe;tpart=Math.min(tpart,T.np);hid=[];efT=-1;P.reset();save();lists();pa();setSt("Refeito às "+hora())}
  function undoT(){if(!hist.length)return;rhistT.push(JSON.stringify({r:T.r,sp:T.sp,gr:T.gr,np:T.np,pe:T.pe}));var o=JSON.parse(hist.pop());T.r=o.r;if(!OPT)T.sp=o.sp;T.gr=o.gr;T.np=o.np;T.pe=o.pe;tpart=Math.min(tpart,T.np);hid=[];efT=-1;P.reset();save();lists();pa();setSt("Desfeito às "+hora())}
  function baseEnd(i){var b=null,bn=0;if(!OPT||!OPT.bs)return null;(OPT.bs.T.r||[]).forEach(function(r){var n=r.n||1;if(r.sp===i&&n<=OPT.bs.n&&n>=bn&&r.p.length){bn=n;b=r.p[r.p.length-1]}});return b}
  function prevEnd2(i,pt){return prevEnd(i,pt)||(OPT?baseEnd(i):null)}
  function prevEnd(sp,pt){var b=null,bn=0;T.r.forEach(function(r){var n=r.n||1;if(r.sp===sp&&n<pt&&n>=bn&&r.p.length){bn=n;b=r.p[r.p.length-1]}});return b}
  function relinkT(sp,n,end){var nx=null,nn=1e9;T.r.forEach(function(r){var k=r.n||1;if(r.sp===sp&&k>n&&k<nn&&r.p.length){nn=k;nx=r}});if(nx)nx.p[0]=[end[0],end[1]]}
  svg.onpointermove=function(e){if(!cs)return;var p=ptr(svg,e),l=cs.p[cs.p.length-1];if(Math.abs(p[0]-l[0])+Math.abs(p[1]-l[1])>6){cs.p.push(p);P.paint()}};
  svg.onpointerup=svg.onpointercancel=function(){if(!cs)return;if(cs.p.length<2){if(oldR)cs.p=oldR;else T.r.pop();hist.pop()}else{if(dupR.length){var ds=dupR;T.r=T.r.filter(function(r){return ds.indexOf(r)<0});T.gr.forEach(function(g){g.ids=g.ids.filter(function(x){return!ds.some(function(r){return r.id===x})})});hid=hid.filter(function(x){return ds.indexOf(x)<0})}applyFix(m,cs,T.r.filter(function(x){return x.sp===cs.sp&&x!==cs}),cs.fl,true);relinkT(cs.sp,cs.n||1,cs.p[cs.p.length-1]);save()}cs=null;oldR=null;dupR=[];lists();P.paint()};
  var hint=el("p",{class:"hint edt"});if(OPT)hint.textContent="Rotas desta opção: elas começam exatamente onde as rotas da parte escolhida (linhas pontilhadas apagadas) terminaram. Desenhe de cada respawn até a nova posição, escreva o nome e o tempo, ligue as utilitárias e use + parte se a opção tiver mais de um momento. No Replay, ao chegar no fim da parte escolhida o mapa para e aparecem os botões das opções.";else hint.textContent="1) Marque os respawns do mapa. 2) Desenhe a rota até a posição (ele escolhe o respawn mais próximo). Cada respawn tem 1 rota por parte: desenhar de novo na mesma parte substitui a anterior. Nas partes seguintes a rota começa exatamente onde a anterior terminou (círculo tracejado). 3) Escreva o nome e o tempo: segundos desde o começo da parte (ex: 8) ou o relógio de chegada (ex: 1:50).";
  P.extra=function(){if(RO)return"";var o="";
    if(OPT&&OPT.bs)(OPT.bs.T.r||[]).forEach(function(r){if((r.n||1)<=OPT.bs.n&&r.p.length>1)o+='<polyline points="'+r.p.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="'+COLORS[r.sp%5]+'" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round" opacity=".45" pointer-events="none"/>'});
    if(tool!=="route"||(tpart<2&&!OPT))return o;T.sp.forEach(function(s,i){var e2=prevEnd2(i,tpart);if(e2)o+='<circle cx="'+e2[0]+'" cy="'+e2[1]+'" r="17" fill="none" stroke="'+COLORS[i%5]+'" stroke-width="4" stroke-dasharray="7 6"/>'});return o};
  drawBar();lists();P.paint();w.appendChild(hint);if(!OPT){var vh=el("p",{class:"hint"}),vn=[];T.r.forEach(function(r){if(r.vs){var s=T.sp[r.sp];vn.push(((s&&s.n)?s.n:"Respawn "+(r.sp+1))+" · "+(r.nm||"rota")+" P"+(r.n||1))}});vh.textContent=vn.length?"Visão salva nas rotas: "+vn.join(", ")+" (criada em Callouts, Visão automática). Aparece no replay só dessas rotas, aqui e nas Defaults, Calls e Rounds (botão Campo de visão). Para mudar, volte lá.":"Nenhuma rota com visão ainda. Crie em Callouts, Visão automática, e ela aparece aqui no replay.";w.appendChild(vh)}w.appendChild(bar);w.appendChild(launchBtn());w.appendChild(sub);w.appendChild(P.wrap);w.appendChild(P.scr);
  var hp=el("h2");hp.textContent="Partes";var hpw=el("div",{class:"edt"});hpw.appendChild(hp);var hph=el("p",{class:"hint"});hph.textContent="Cada parte termina no relógio (ex: 1:30) ou numa duração em segundos (ex: 20). Quem terminar a rota antes fica parado até a parte acabar; quem não terminar é cortado e a próxima parte começa. Para desenhar em outra parte, escolha 'Parte N' na barra acima do mapa.";hpw.appendChild(hph);hpw.appendChild(ptl);w.appendChild(hpw);
  var h1=el("h2");h1.textContent="Respawns";var h2=el("h2");h2.textContent="Timings";
  var h1w=el("div",{class:"edt"});h1w.appendChild(h1);h1w.appendChild(sl);if(!OPT){w.appendChild(h1w);if(!RO||true)w.appendChild(tchoiceEd(m,T))}w.appendChild(h2);w.appendChild(rl);
  var h4=el("h2");h4.textContent="Tabela de tempos";w.appendChild(h4);var h4p=el("p",{class:"hint"});h4p.textContent="Resumo de cada rota: de qual respawn sai, para onde vai e quanto tempo leva. Tempo digitado nas rotas vale no lugar da estimativa.";w.appendChild(h4p);w.appendChild(tblBox);
  if(OPT)return w;var h3=el("h2");h3.textContent="Grupos de rotas";w.appendChild(h3);w.appendChild(gl);
  var ag=el("button",{class:"b edt"});ag.textContent="+ Novo grupo";ag.onclick=function(){T.gr.push({nm:"Grupo "+(T.gr.length+1),ids:[]});save();drawG()};w.appendChild(ag);return w}
function ytId(u){var m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i);return m?m[1]:null}
function vt(x){x=String(x==null?"":x).trim();if(!x)return NaN;if(x.indexOf(":")>=0){var a=x.split(":").map(Number);if(a.some(isNaN))return NaN;return a.length===3?a[0]*3600+a[1]*60+a[2]:a[0]*60+a[1]}return /^\d+(\.\d+)?$/.test(x)?+x:NaN}
function ytStart(u){var r=u.match(/[?&#](?:t|start)=([0-9hms]+)/i);if(!r)return 0;var v=r[1];if(/^\d+$/.test(v))return +v;var h=v.match(/(\d+)h/),m=v.match(/(\d+)m/),c=v.match(/(\d+)s/);return(h?+h[1]*3600:0)+(m?+m[1]*60:0)+(c?+c[1]:0)}
function openViewer(url,opt){opt=opt||{};
  var o=el("div",{class:"ov"}),b=el("div",{class:"dlg vw",role:"dialog","aria-modal":"true"}),id=ytId(url),box=el("div"),fr=null;
  var hd=el("div",{class:"row"}),tt=el("strong");tt.textContent=(opt.title&&opt.title())||(id?"Vídeo do YouTube":"Demo / link");tt.style.flex="1";
  var op=el("a",{class:"b",href:url,target:"_blank",rel:"noopener noreferrer"});op.textContent="Abrir em nova aba";
  var cl=el("button",{class:"b primary",type:"button"});cl.textContent="Fechar";
  hd.appendChild(tt);hd.appendChild(op);hd.appendChild(cl);b.appendChild(hd);
  function load(sec,auto){box.innerHTML="";fr=el("iframe",{class:"vwf",allow:"fullscreen; autoplay; encrypted-media; picture-in-picture",allowfullscreen:"",referrerpolicy:"strict-origin-when-cross-origin",title:"Visualizador"});
    if(!id){fr.style.aspectRatio="auto";fr.style.height="70vh"}
    fr.src=id?"https://www.youtube-nocookie.com/embed/"+id+"?rel=0"+(sec>0?"&start="+Math.floor(sec):"")+(auto?"&autoplay=1":""):url;box.appendChild(fr)}
  b.appendChild(box);
  var rs=(opt.rounds&&opt.rounds())||[];
  if(rs.length){var rr=el("div",{class:"row"}),rl=el("span",{class:"hint"});rl.textContent=id?"Rounds (clique para pular):":"Rounds anotados:";rr.appendChild(rl);
    rs.forEach(function(r){var sec=vt(r.tm),t=(r.n?"R"+r.n:"R")+(r.w?" "+r.w.toUpperCase():"")+(r.tm?" · "+r.tm:"");
      if(id&&sec>=0){var bt=el("button",{class:"b",type:"button",title:r.nt||""});bt.textContent=t;bt.onclick=function(){load(sec,true)};rr.appendChild(bt)}
      else{var sp=el("span",{class:"hint"});sp.textContent=t+(r.nt?" ("+r.nt+")":"");rr.appendChild(sp)}});b.appendChild(rr)}
  var ht=el("p",{class:"hint"});ht.textContent=id?"Se aparecer erro no vídeo, abra em nova aba. Alguns vídeos e o arquivo aberto direto do aparelho (sem site) podem bloquear o player embutido.":"Se a área ficar em branco, esse site não permite abrir dentro de outro site. Use 'Abrir em nova aba'. Nada disso é salvo aqui, só o link.";b.appendChild(ht);
  function close(){document.removeEventListener("keydown",kd);o.remove()}
  function kd(e){if(e.key==="Escape")close()}
  document.addEventListener("keydown",kd);cl.onclick=close;o.onclick=function(e){if(e.target===o)close()};
  o.appendChild(b);document.body.appendChild(o);load(id?ytStart(url):0,false);cl.focus()}
function ulinks(u){if(!u.lks)u.lks=u.lk?[{n:"Link 1",u:u.lk}]:[];return u.lks}
var UMN={},ULR={},STW=new WeakMap();
function linkRadar(m,u,ls,key,ro){
  var w=el("div"),hd=el("div",{class:"row"}),tg=el("button",{class:"b",type:"button"}),box=el("div"),placing=-1,dragLi=-1,dragU=false;
  function has(L){return L.px!=null&&L.py!=null}
  function render(){var o=!!ULR[key];tg.textContent=o?"Esconder o radar dos links":"Radar dos links ("+ls.filter(has).length+" de "+ls.length+" com posição)";tg.setAttribute("aria-expanded",String(o));box.innerHTML="";if(!o)return;
    if(!ls.length){var e0=el("p",{class:"hint"});e0.textContent="Esta utilitária ainda não tem links. Use + link acima e depois marque a posição de cada um aqui.";box.appendChild(e0);return}
    var svg=mksvg(m);svg.style.maxWidth="560px";svg.style.touchAction="none";svg.style.cursor=placing>=0?"crosshair":"default";
    function draw(){var h=bg(m)+'<g data-u="1"'+(ro?'':' style="cursor:grab"')+' transform="translate('+u.x+' '+u.y+') scale(2.4)">'+ICO[u.t]+'</g><text x="'+u.x+'" y="'+(u.y+44)+'" font-size="20" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke">'+esc(u.nm||UN[u.t])+'</text>';
      ls.forEach(function(L,li){if(!has(L))return;var col=COLORS[li%5],lx=L.px,ly=L.py;
        h+='<line x1="'+lx+'" y1="'+ly+'" x2="'+u.x+'" y2="'+u.y+'" stroke="'+col+'" stroke-width="3" stroke-dasharray="7 7" opacity=".85" pointer-events="none"/>'
          +'<g data-li="'+li+'"'+(ro?'':' style="cursor:grab"')+'><circle cx="'+lx+'" cy="'+ly+'" r="13" fill="'+col+'" stroke="#fff" stroke-width="3"/><text x="'+lx+'" y="'+(ly+5)+'" font-size="15" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke" pointer-events="none">'+(li+1)+'</text></g>'
          +'<text x="'+lx+'" y="'+(ly-20)+'" font-size="18" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" pointer-events="none">'+esc((L.n||("Link "+(li+1)))+((L.ft!=null&&L.ft!=="")?" · cai "+L.ft+"s":""))+'</text>'});
      svg.innerHTML=h}
    draw();
    if(!ro){
      svg.addEventListener("pointerdown",function(e){var g=e.target.closest?e.target.closest("[data-li]"):null,p=ptr(svg,e);
        if(!g&&e.target.closest&&e.target.closest("[data-u]")){dragU=true;svg.setPointerCapture(e.pointerId);e.preventDefault();return}
        if(g){dragLi=+g.getAttribute("data-li");svg.setPointerCapture(e.pointerId);e.preventDefault();return}
        if(placing>=0){var L=ls[placing];L.px=p[0];L.py=p[1];placing=-1;save();render()}});
      svg.addEventListener("pointermove",function(e){if(dragU){var q=ptr(svg,e);u.x=Math.max(0,Math.min(1000,q[0]));u.y=Math.max(0,Math.min(1000,q[1]));draw();return}if(dragLi<0)return;var p=ptr(svg,e),L=ls[dragLi];L.px=Math.max(0,Math.min(1000,p[0]));L.py=Math.max(0,Math.min(1000,p[1]));draw()});
      var endD=function(){if(dragU){dragU=false;save();render();return}if(dragLi>=0){dragLi=-1;save();render()}};svg.addEventListener("pointerup",endD);svg.addEventListener("pointercancel",endD)}
    box.appendChild(svg);
    var lst=el("div");ls.forEach(function(L,li){var r=el("div",{class:"row"}),lab=el("span",{class:"hint"});
      lab.innerHTML='<i class="sw" style="--c:'+COLORS[li%5]+'"></i> <strong>'+(li+1)+'.</strong> '+esc(L.n||("Link "+(li+1)))+(has(L)?"":" — sem posição");lab.style.flex="1";r.appendChild(lab);
      if(!ro){var b1=el("button",{class:"b",type:"button"});b1.textContent=has(L)?"Mover":"Marcar posição";b1.onclick=function(){placing=li;render();setSt("Clique no radar para marcar a posição de: "+(L.n||("Link "+(li+1))))};r.appendChild(b1);
        if(has(L)){var b2=el("button",{class:"b danger",type:"button"});b2.textContent="Limpar posição";b2.onclick=function(){delete L.px;delete L.py;save();render()};r.appendChild(b2)}}
      lst.appendChild(r)});box.appendChild(lst);
    var ht=el("p",{class:"hint"});ht.textContent=ro?"Radar só desta utilitária: cada ponto é um lugar de onde ela é lançada.":"Radar só desta utilitária. Clique em Marcar posição e depois no radar; arraste um ponto para ajustar.";box.appendChild(ht)}
  tg.onclick=function(){ULR[key]=!ULR[key];render()};hd.appendChild(tg);w.appendChild(hd);w.appendChild(box);w.rf=render;render();return w}
function linkBtn(get,opt){
  var wr=el("span",{class:"lkw"}),a=el("a",{class:"b",target:"_blank",rel:"noopener noreferrer"}),v=el("button",{class:"b",type:"button"});a.textContent=(opt&&opt.label)||"Abrir link";v.textContent="Ver aqui";
  function norm(){var u=(get()||"").trim();if(u&&!/^https?:\/\//i.test(u))u="https://"+u;return /^https?:\/\//i.test(u)?u:""}
  function sync(){var u=norm();if(u)a.href=u;else a.removeAttribute("href")}
  a.addEventListener("click",function(e){sync();if(!a.getAttribute("href"))e.preventDefault()});
  v.onclick=function(){var u=norm();if(!u){setSt("Cole um link primeiro.");return}openViewer(u,opt)};
  sync();wr.appendChild(a);wr.appendChild(v);return wr}
function roundsEd(d){d.rounds=d.rounds||[];var w=el("div"),h=el("h2"),list=el("div",{class:"ulist"}),hint=el("p",{class:"hint"});
  h.textContent="Rounds";h.style.fontSize="17px";hint.textContent="Anote o round, o tempo no vídeo (ex: 12:30) e quem ganhou. Em vídeo do YouTube, o botão 'Ver aqui' mostra esses rounds e pula direto para o tempo.";
  function draw(){list.innerHTML="";d.rounds.forEach(function(r,i){var row=el("div",{class:"row"});
    var n=field("input",String(r.n||""),"Round",function(v){r.n=v});n.style.width="70px";n.style.flex="none";
    var t=field("input",r.tm||"","Tempo no vídeo (12:30)",function(v){r.tm=v});t.style.flex="1";t.style.minWidth="110px";
    var nt=field("input",r.nt||"","Nota (ex: eco, retake A)",function(v){r.nt=v});nt.style.flex="2";nt.style.minWidth="130px";
    row.appendChild(n);row.appendChild(t);row.appendChild(pickL("",[["","Quem ganhou"],["ct","CT"],["tr","TR"]],r.w||"",function(v){r.w=v;save()}));row.appendChild(nt);
    row.appendChild(rmBtn("Tirar","Tirar este round?",function(){d.rounds.splice(i,1);save();draw()}));list.appendChild(row)})}
  var ad=el("button",{class:"b edt",type:"button"});ad.textContent="+ Round";ad.onclick=function(){d.rounds.push({n:String(d.rounds.length+1)});save();draw()};
  draw();w.appendChild(h);w.appendChild(hint);w.appendChild(list);w.appendChild(ad);w.style.margin="10px 0";return w}
function cnorm(t){return String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
function pathTo(m,a,b,f){
  var W=wallSegs(m,f);
  if(!W.length||!blocked(a,b,W))return{p:[[a[0],a[1]],[b[0],b[1]]],ok:true};
  var C=20,N=50,cl=function(v){return Math.max(0,Math.min(N-1,Math.floor(v/C)))},s0=[cl(a[0]),cl(a[1])],g0=[cl(b[0]),cl(b[1])];
  function cen(i,j){return[i*C+C/2,j*C+C/2]}
  function ky(i,j){return i*N+j}
  var gs={},came={},open=[ky(s0[0],s0[1])],seen={},cl2={};gs[open[0]]=0;
  var found=false,gk=ky(g0[0],g0[1]);
  while(open.length){
    var bi=0,bf=1e18;for(var q=0;q<open.length;q++){var k0=open[q],ci=Math.floor(k0/N),cj=k0%N,f0=gs[k0]+Math.hypot(ci-g0[0],cj-g0[1]);if(f0<bf){bf=f0;bi=q}}
    var cur=open.splice(bi,1)[0];if(cl2[cur])continue;cl2[cur]=1;
    if(cur===gk){found=true;break}
    var ci2=Math.floor(cur/N),cj2=cur%N;
    for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){if(!di&&!dj)continue;var ni=ci2+di,nj=cj2+dj;if(ni<0||nj<0||ni>=N||nj>=N)continue;var nk=ky(ni,nj);if(cl2[nk])continue;
      if(blocked(cen(ci2,cj2),cen(ni,nj),W))continue;
      var ng=gs[cur]+Math.hypot(di,dj);if(gs[nk]===undefined||ng<gs[nk]){gs[nk]=ng;came[nk]=cur;open.push(nk)}}
  }
  if(!found)return{p:[[a[0],a[1]],[b[0],b[1]]],ok:false};
  var cells=[],c=gk;while(c!==undefined){cells.unshift(cen(Math.floor(c/N),c%N));c=came[c]}
  var pts=[[a[0],a[1]]].concat(cells,[[b[0],b[1]]]),out=[pts[0]],i=0;
  while(i<pts.length-1){var j=pts.length-1;while(j>i+1&&blocked(pts[i],pts[j],W))j--;out.push(pts[j]);i=j}
  return{p:out.map(function(q){return[Math.round(q[0]),Math.round(q[1])]}),ok:true}}
/* trocar duas partes de lugar (a e b, começando em 1) levando junto tudo que pertence a cada parte */
function swapPartsD(d,a,b){function sw(x){return x===a?b:x===b?a:x}
 (d.s||[]).forEach(function(q){q.n=sw(q.n||1)});
 (d.u||[]).forEach(function(q){if(q.n!=null||q.p!=null)q.n=sw(q.n||1)});
 [d.pt,d.pe].forEach(function(A){if(!A)return;var t=A[a-1],u=A[b-1];A[a-1]=u;A[b-1]=t;for(var i=0;i<A.length;i++)if(A[i]===undefined)A[i]=""});
 ["lk","lt","fl","la"].forEach(function(nm){var o=d[nm];if(!o)return;var c={};Object.keys(o).forEach(function(k){var m=/^(.*)_(\d+)$/.exec(k);c[m?m[1]+"_"+sw(+m[2]):k]=o[k]});Object.keys(o).forEach(function(k){delete o[k]});Object.keys(c).forEach(function(k){o[k]=c[k]})});
 (d.ul||[]).forEach(function(e){if(e&&e.rc!=null&&e.rn!=null)e.rn=sw(e.rn)});
 (d.en||[]).forEach(function(e){(e.rt||[]).forEach(function(r){r.n=sw(r.n||1)});
  [e.ap,e.fp].forEach(function(o){if(!o)return;var ta=o[a],tb=o[b];delete o[a];delete o[b];if(tb!=null)o[a]=tb;if(ta!=null)o[b]=ta});
  if(e.ap&&e.ap[1]!=null)e.a=e.ap[1];if(e.fp&&e.fp[1]!=null)e.fl=e.fp[1]})}
function swapPartsT(T,a,b){function sw(x){return x===a?b:x===b?a:x}(T.r||[]).forEach(function(r){r.n=sw(r.n||1)});if(T.pe){var t=T.pe[a-1];T.pe[a-1]=T.pe[b-1];T.pe[b-1]=t;for(var i=0;i<T.pe.length;i++)if(T.pe[i]===undefined)T.pe[i]=""}}
function minimap(m,d,U){
  d.s=d.s||[];d.u=d.u||[];d.np=d.np||1;d.pt=d.pt||[];d.pe=d.pe||[];
  if(U&&tool.k==="draw")tool={k:"mouse"};
  if(!U&&tool.k==="mouse")tool={k:"draw",i:who};
  if(!U&&tool.k==="util")tool={k:"draw",i:who};
  if(!(sec==="open"&&!U)&&["wall","wallx","en","enr","enx"].indexOf(tool.k)>=0)tool={k:"draw",i:who};
  var w=el("div",{class:"mm"}),sub=el("div",{class:"tb"}),tb=el("div",{class:"tb"}),info=el("div",{class:"inf"}),list=el("div",{class:"ulist"}),stl=el("div",{class:"ulist"});
  var d0=d,br=null,pending=null,focus="all",lastFl=null,dmId="dm"+Math.random().toString(36).slice(2,7),CALLS=sec==="calls"&&!U,OPEN=sec==="open"&&!U,wc=null,ed2=-1,ovl=el("div",{class:"ovl"}),wrap=el("div",{class:"mwrap"}),cmdw=el("div",{class:"uc edt"}),cmdTxt="",cmdMsg="",insw=el("div",{class:"uc edt"}),insOpen=false,insOff={},insSel={c:0,sp:0,r:-1};
  var fcEl=el("div",{class:"uc"}),ecs=null,ecsE=null,eOld=null,ei=0,wcA=null;
  function pn(i){return d.nn?"Player "+(i+1):CALLS?callName(d.players[i],i):pname(i)}
  var mode="est",part=1,rp=1,tm=null,sel=-1,spd=215,mult=1,only=-1,tt=0,capEl=null,scr=el("div",{class:"row"}),scSl=null,scT=null,pbtn=null,strip=null,pauseP=false,ufil="all",snm=true,efil="all",oldP=null,dupl=[],hist=[],ub=null,cardEls=[],goCard=-1;
  var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox",vbOf(m));svg.setAttribute("class","map");svg.setAttribute("role","img");svg.setAttribute("aria-label","Minimapa de "+m.name);
  function tbtn(html,label,on,fn){var b=el("button",{class:"tool","aria-pressed":on});b.innerHTML=html+"<span>"+esc(label)+"</span>";b.onclick=fn;tb.appendChild(b)}
  function sep(){tb.appendChild(el("span",{class:"sep"}))}
  function plen(q){var L=0;for(var i=1;i<q.p.length;i++)L+=Math.hypot(q.p[i][0]-q.p[i-1][0],q.p[i][1]-q.p[i-1][1]);return L*1.024*scaleOf(m)}
  function enItems(){var o=[];(d.en||[]).forEach(function(e,i){(e.rt||[]).forEach(function(r){o.push({c:"e"+i,n:r.n||1,p:r.p,tv:r.tv,tw:r.tw})})});return o}
  function allItems(){return OPEN?d.s.concat(enItems()):d.s}
  function sched(){return sched2(m,allItems(),d.np,d.pe,function(q){return q.c},spd)}
  function enPosAt(S,i,t){var e=(d.en||[])[i];if(!e)return null;return gpos(S,allItems(),d.np,function(q){return q.c==="e"+i},t)||[e.x,e.y]}
  function fixR(o,list,force){return applyFix(m,o,list,force,true)}
  function enEnd(e,pt){var b=null,bn=0;(e.rt||[]).forEach(function(r){var n=r.n||1;if(n<pt&&n>=bn&&r.p.length){bn=n;b=r.p[r.p.length-1]}});return b||[e.x,e.y]}
  function relinkEn(e,n,end){var nx=null,nn=1e9;(e.rt||[]).forEach(function(r){var k=r.n||1;if(k>n&&k<nn&&r.p.length){nn=k;nx=r}});if(nx)nx.p[0]=[end[0],end[1]]}
  function fmt(x){x=Math.round(x);var a=Math.floor(x/60),b=x%60;return(a<10?"0":"")+a+":"+(b<10?"0":"")+b}
  function endT(){var e=sched().tot;lu().forEach(function(o){var a=ltimeG(o.u,o.e);if(a&&a[2]>e)e=a[2]});if(OPEN){var pt2=pullRes(m,d,spd).tot;if(pt2>e)e=pt2}return e}
  function rpOf(S){var k=1;for(var j=1;j<=d.np;j++)if(S.T[j]<=tt+1e-9)k=j;return k}
  function clock(){rp=rpOf(sched());scr.style.display=mode==="rep"?"":"none";if(capEl)capEl.textContent="Parte "+rp+" de "+d.np+" · relógio "+fmtT(115-tt)+" (início 1:55)"+(d.pt[rp-1]?" · "+d.pt[rp-1]:"");if(scSl)scSl.set(tt,endT());if(strip)strip.rf(endT());if(scT)scT.textContent="Relógio "+fmtT(115-tt)}
  function stop(){if(tm){clearInterval(tm);tm=null}if(pbtn)pbtn.textContent="Play"}
  function lookAuto(c,path,dst){
    var e=path[path.length-1],p0=path[path.length-2]||path[0],k=2;while(path.length-k>=0&&Math.hypot(e[0]-path[path.length-k][0],e[1]-path[path.length-k][1])<30&&k<path.length)k++;
    p0=path[Math.max(0,path.length-k)];if(p0[0]===e[0]&&p0[1]===e[1])return null;
    var ang=Math.atan2(e[0]-p0[0],-(e[1]-p0[1])),best=ang,bd=350;
    (m.co||[]).forEach(function(o){if(o===dst)return;var vx=o.x-e[0],vy=o.y-e[1],ds=Math.hypot(vx,vy);if(ds<25||ds>=bd)return;var a2=Math.atan2(vx,-vy),df=Math.abs(((a2-ang+Math.PI*3)%(Math.PI*2))-Math.PI);if(df<70*Math.PI/180){bd=ds;best=a2}});
    return Math.round(((best*180/Math.PI)%360+360)%360)}
  function dg(a){return Math.round(((a*180/Math.PI)%360+360)%360)}
  function findCo(dest){var best=null;(m.co||[]).forEach(function(o){var n=cnorm(o.t);if(!n||!dest)return;var sc=0;if(n===dest)sc=100;else if(dest.indexOf(n)>=0)sc=50+n.length;else if(n.indexOf(dest)>=0)sc=30+dest.length;if(sc>(best?best.sc:0))best={o:o,sc:sc}});return best?best.o:null}
  function lookOpen(path,used,fl){
    var a=path[0],far=a,i;for(i=0;i<path.length;i++){if(Math.hypot(path[i][0]-a[0],path[i][1]-a[1])>Math.hypot(far[0]-a[0],far[1]-a[1]))far=path[i]}
    var dx=far[0]-a[0],dy=far[1]-a[1],L=Math.hypot(dx,dy)||1,c0=[(a[0]+far[0])/2,(a[1]+far[1])/2];
    if(d.en&&d.en.length){var be=null,bd=1e9;d.en.forEach(function(e){var q=Math.hypot(e.x-c0[0],e.y-c0[1]);if(q<bd){bd=q;be=e}});if(be)return dg(Math.atan2(be.x-c0[0],-(be.y-c0[1])))}
    var W=wallSegs(m,fl),bv=null,bf=-1;
    [[-dy/L,dx/L],[dy/L,-dx/L]].forEach(function(v){var t=20;while(t<=600&&!blocked(c0,[c0[0]+v[0]*t,c0[1]+v[1]*t],W))t+=20;if(t>bf){bf=t;bv=v}});
    var ang=Math.atan2(bv[0],-bv[1]),bc=null,bdd=600;
    (m.co||[]).forEach(function(o){if(used.indexOf(o)>=0)return;var vx=o.x-c0[0],vy=o.y-c0[1],ds=Math.hypot(vx,vy);if(ds<30||ds>=bdd)return;var df=Math.abs(((Math.atan2(vx,-vy)-ang+Math.PI*3)%(Math.PI*2))-Math.PI);if(df<40*Math.PI/180&&!blocked(c0,[o.x,o.y],W)){bdd=ds;bc=o}});
    return bc?dg(Math.atan2(bc.x-c0[0],-(bc.y-c0[1]))):dg(ang)}
  function sendTiming(){
    var T=m.tm&&m.tm[side];if(!T)return"Sem Timing neste mapa e lado.";
    T.sp=T.sp||[];T.r=T.r||[];var n=0,warn=false;
    for(var c=0;c<5;c++){var ss=d.s.filter(function(q){return q.c===c&&q.p.length>1}).sort(function(x,y){return(x.n||1)-(y.n||1)});if(!ss.length)continue;
      var pts=[];ss.forEach(function(q){q.p.forEach(function(p,i){var l=pts[pts.length-1];if(l&&i===0&&l[0]===p[0]&&l[1]===p[1])return;pts.push([p[0],p[1]])})});
      var nm=(d.name||"Abertura")+" · "+pn(c),sp=rsOf(c);if(sp<0){sp=0;warn=true}
      T.r=T.r.filter(function(r){return r.nm!==nm});T.r.push({id:"a"+Date.now().toString(36)+Math.floor(Math.random()*1000)+c,nm:nm,sp:sp,p:pts,n:1});n++}
    if(!n)return"Nenhum caminho desenhado nesta abertura.";
    save();return n+" rota(s) enviada(s) ao Timing"+(warn?" (sem respawn marcado para algum jogador, usei o respawn 1)":"")+". Elas aparecem em Inserir rota pronta nas outras abas."}
  function cmdRun(txt){
    var msgs=[],did=false,T=m.tm&&m.tm[side];
    txt.split(/[;\n]+/).forEach(function(raw){var t=cnorm(raw);if(!t)return;var rm=t.match(/\s*\b(?:em|no|do|de|a partir do)?\s*respawn\s*(\d+)\b/),rsn=rm?+rm[1]-1:null;if(rm)t=t.replace(rm[0]," ").trim();
      var c=-1,pm=t.match(/(?:player|jogador|p)\s*([1-5])\b/);
      if(pm)c=+pm[1]-1;else for(var i=0;i<5;i++){var nm=cnorm(pn(i));if(nm&&t.indexOf(nm)>=0){c=i;break}}
      if(c<0){msgs.push("Não achei o jogador em: "+raw.trim());return}
      if(/\b(abre|abrir|abertura|peek|espia|espiar)\b/.test(t)){
        var aft=t.replace(/^.*?\b(abre|abrir|abertura|peek|espia|espiar)\b\s*(?:de|do|da|em|no|na|para|pra|pro)?\s*/,""),fr=aft.split(/\s*(?:\bate\b|\bpara\b|\bpra\b|\bpro\b|->|→|,)\s*/).map(function(x){return x.replace(/^(?:o|a|os|as)\s+/,"").trim()}).filter(Boolean),co=[],bad=null;
        fr.forEach(function(x){var o=findCo(x);if(o)co.push(o);else if(!bad)bad=x});
        if(bad){msgs.push("Não achei o callout \""+bad+"\" (nomeie o lugar na aba Callouts)");return}
        var P=co.map(function(o){return[o.x,o.y]});
        if(P.length===1){var s1=lastEnd(c,part),r1=rsOf(c);if(!s1&&T&&r1>=0&&T.sp[r1])s1=[T.sp[r1].x,T.sp[r1].y];if(!s1){msgs.push("Player "+(c+1)+": sem ponto de partida para a abertura");return}P.unshift(s1)}
        if(P.length<2){msgs.push("Diga pelo menos um lugar: \"player 1 abre de A até B\"");return}
        if(!did){snap();did=true}
        var fk2=c+"_"+part,fl2=d.fl&&d.fl[fk2]!=null?d.fl[fk2]:FLOOR,pp=[P[0]],okp=true;
        for(var qi=1;qi<P.length;qi++){var rr=pathTo(m,P[qi-1],P[qi],fl2);if(!rr.ok)okp=false;rr.p.slice(1).forEach(function(z){pp.push(z)})}
        d.s=d.s.filter(function(x){return!(x.c===c&&(x.n||1)===part)});d.s.push({c:c,n:part,p:pp});relink(c,part,pp[pp.length-1]);
        var lo=lookOpen(pp,co,fl2);d.lk=d.lk||{};d.la=d.la||{};if(d.lk[fk2]==null||d.la[fk2]){d.lk[fk2]=lo;d.la[fk2]=1}
        msgs.push("Player "+(c+1)+" abre "+fr.join(" → ")+" (parte "+part+"), olhando "+lo+"°"+(P.length>2?" e ficando sempre de frente pro mesmo lado":"")+(okp?"":" · sem caminho livre pelas paredes em algum trecho, usei linha reta"));return}
      var dm=t.match(/\b(?:ate|para|pra|pro|ao)\s+(?:o\s+|a\s+|os\s+|as\s+)?(.+)$/),dest=dm?dm[1].trim():t.replace(/(?:player|jogador|p)\s*[1-5]/,"").replace(/\b(vai|ir|va|mover|move|anda|andar|corre|correr)\b/g,"").trim();
      var best=null;(m.co||[]).forEach(function(o){var n=cnorm(o.t);if(!n)return;var sc=0;if(n===dest)sc=100;else if(dest.indexOf(n)>=0)sc=50+n.length;else if(dest&&n.indexOf(dest)>=0)sc=30+dest.length;if(sc>(best?best.sc:0))best={o:o,sc:sc}});
      if(!best){msgs.push("Não achei o callout \""+dest+"\" (nomeie o lugar na aba Callouts)");return}
      var st=lastEnd(c,part),ri=rsOf(c);if(rsn!=null&&T&&T.sp[rsn]){ri=rsn;d.rs=d.rs||[];d.rs[c]=rsn;if(part===1||!st)st=[T.sp[rsn].x,T.sp[rsn].y]}
      if(!st&&T&&ri>=0&&T.sp[ri])st=[T.sp[ri].x,T.sp[ri].y];
      if(!st){msgs.push("Player "+(c+1)+": sem ponto de partida (marque o respawn dele no Timing ou desenhe a parte anterior)");return}
      if(!did){snap();did=true}
      var fk=c+"_"+part,fl=d.fl&&d.fl[fk]!=null?d.fl[fk]:FLOOR,r=pathTo(m,st,[best.o.x,best.o.y],fl);
      d.s=d.s.filter(function(x){return!(x.c===c&&(x.n||1)===part)});d.s.push({c:c,n:part,p:r.p});relink(c,part,r.p[r.p.length-1]);
      var lk=lookAuto(c,r.p,best.o);d.lk=d.lk||{};d.la=d.la||{};if(lk!=null&&(d.lk[fk]==null||d.la[fk])){d.lk[fk]=lk;d.la[fk]=1}
      msgs.push("Player "+(c+1)+" → "+best.o.t+" (parte "+part+")"+(r.ok?"":" · sem caminho livre pelas paredes, usei linha reta")+(lk!=null?" · olhando "+lk+"°":""))});
    if(did){save();paint();setSt("Movimento criado às "+hora())}
    return msgs.join("\n")}
  function cmdUI(){
    cmdw.innerHTML="";var h=el("strong"),r=el("div",{class:"row"}),hint=el("p",{class:"hint"});h.textContent="Comando de movimento";cmdw.appendChild(h);
    function go(){cmdMsg=cmdRun(cmdTxt);bar()}
    var inp=field("input",cmdTxt,"Ex: player 1 vai até escuro em respawn 2",function(v){cmdTxt=v});inp.style.flex="1";inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();go()}});
    var b=el("button",{class:"b primary",type:"button"});b.textContent="Executar";b.onclick=go;r.appendChild(inp);r.appendChild(b);
    if(OPEN){var sb2=el("button",{class:"b",type:"button"});sb2.textContent="Enviar para o Timing";sb2.onclick=function(){cmdMsg=sendTiming();bar()};r.appendChild(sb2)}
    cmdw.appendChild(r);
    if(OPEN){var h2=el("p",{class:"hint"});h2.textContent="Abertura automática: \"player 1 abre de escuro até meio\". Com 3 ou mais lugares ele vai e volta olhando sempre para o mesmo lado, como numa peek de verdade (o olhar vai para o inimigo marcado ou para o lado mais aberto). Se preferir fazer à mão, desenhe e use Enviar para o Timing: os caminhos viram rotas prontas para as outras abas.";cmdw.appendChild(h2)}
    hint.textContent="O jogador anda até o callout com esse nome, na parte "+part+", desviando das paredes desenhadas. Vários comandos: separe com ponto e vírgula. A direção do olhar (Olhando) é preenchida sozinha e pode ser ajustada depois.";cmdw.appendChild(hint);
    if(cmdMsg){var mp=el("p",{class:"hint"});mp.style.whiteSpace="pre-line";mp.textContent=cmdMsg;cmdw.appendChild(mp)}}
  function insertRoute(c,r,pt,skip){snap();var q={c:c,n:pt,p:JSON.parse(JSON.stringify(r.p))};if(r.vs)q.vs=JSON.parse(JSON.stringify(r.vs));if(r.tv)q.tv=r.tv;else if(r.tw>0)q.tv=String(r.tw);
    d.s=d.s.filter(function(x){return!(x.c===c&&(x.n||1)===pt)});d.s.push(q);relink(c,pt,q.p[q.p.length-1]);d.ul=d.ul||[];d.ul=d.ul.filter(function(e){return!(e&&e.rc===c&&e.rn===pt)});(r.ul||[]).forEach(function(e,i){if(skip&&skip[i])return;var o=JSON.parse(JSON.stringify(typeof e==="string"?{n:e,tm:""}:e));o.th=c;o.rc=c;o.rn=pt;o.hid=false;d.ul.push(o)});save();paint();if(w.onins)w.onins()}
  function rsOf(c){var T=(m.tm&&m.tm[side])||{sp:[]},v=d.rs&&d.rs[c];return v==null?(c<T.sp.length?c:-1):v}
  function insUI(){
    var T=(m.tm&&m.tm[side])||{sp:[],r:[]};
    var b=el("button",{class:"tool",type:"button","aria-pressed":insOpen});b.textContent="Inserir rota pronta";b.onclick=function(){insOpen=!insOpen;if(insOpen){var a0=rsOf(insSel.c);if(a0>=0)insSel.sp=a0}bar()};tb.appendChild(b);
    insw.innerHTML="";insw.style.display=insOpen?"":"none";if(!insOpen)return;
    var h=el("strong");h.textContent="Inserir uma rota salva no Timing";insw.appendChild(h);
    if(!T.sp.length||!T.r.length){var p=el("p",{class:"hint"});p.textContent="Ainda não há respawn e rota salvos neste mapa e lado. Marque o respawn e desenhe a rota na aba Timing.";insw.appendChild(p);return}
    var rs=T.r.map(function(r,i){return[i,r]}).filter(function(x){return x[1].sp===insSel.sp});
    if(!rs.some(function(x){return x[0]===insSel.r}))insSel.r=rs.length?rs[0][0]:-1;
    var row=el("div",{class:"fld"});
    row.appendChild(pickL("Jogador",d.players.map(function(p,i){return[i,pn(i)]}),insSel.c,function(v){insSel.c=parseInt(v,10);var a1=rsOf(insSel.c);if(a1>=0)insSel.sp=a1;bar()}));
    row.appendChild(pickL("Respawn",T.sp.map(function(s,i){return[i,s.n||("Respawn "+(i+1))]}),insSel.sp,function(v){insSel.sp=parseInt(v,10);bar()}));
    if(rs.length)row.appendChild(pickL("Rota",rs.map(function(x){var r=x[1];return[x[0],(r.nm||"Rota")+" ("+(r.tv?r.tv:"tempo estimado")+")"]}),insSel.r,function(v){insSel.r=parseInt(v,10);bar()}));
    else{var p2=el("span",{class:"hint"});p2.textContent="Nenhuma rota salva saindo desse respawn.";row.appendChild(p2)}
    var ps=[];for(var k=1;k<=d.np;k++)ps.push([k,"Parte "+k]);
    row.appendChild(pickL("Em",ps,part,function(v){part=parseInt(v,10);bar();frame()}));
    if(rs.length){var ib=el("button",{class:"b primary",type:"button"});ib.textContent="Inserir";ib.onclick=function(){var r=T.r[insSel.r];if(!r)return;var sk={};(r.ul||[]).forEach(function(e,i){if(insOff[r.id+"_"+i])sk[i]=1});insertRoute(insSel.c,r,part,sk);setSt("Rota inserida às "+hora())};row.appendChild(ib)}
    var rr=T.r[insSel.r];if(rr&&(rr.ul||[]).length){var ub2=el("div",{class:"uc"}),uh=el("p",{class:"hint"});uh.textContent="Utilitárias desta rota (desmarque as que não quer trazer; dá para esconder/mostrar depois no mapa):";ub2.appendChild(uh);
      rr.ul.forEach(function(e,i){var nm=typeof e==="string"?e:e.n,tmv=typeof e==="string"?"":(e.tm||""),lb=el("label",{class:"row"}),cb=el("input",{type:"checkbox"});cb.checked=!insOff[rr.id+"_"+i];cb.onchange=function(){insOff[rr.id+"_"+i]=!cb.checked};lb.appendChild(cb);lb.appendChild(document.createTextNode(" "+nm+(tmv?" · lança "+tmv:"")));ub2.appendChild(lb)});insw.appendChild(ub2)}
    insw.appendChild(row);
    var tnp=T.np||1,okp=tnp===d.np,ab2=el("div",{class:"uc"}),ap=el("p",{class:"hint"}),ib2=el("button",{class:"b primary",type:"button"});
    ap.textContent=okp?("O Timing tem "+tnp+" parte"+(tnp>1?"s":"")+", igual a este. Dá para trazer tudo de uma vez: todas as partes, todos os jogadores que têm respawn, utilitárias, fim de cada parte e as escolhas do Timing."):("O Timing tem "+tnp+" parte"+(tnp>1?"s":"")+" e este tem "+d.np+". O timing completo só pode ser trazido quando o número de partes for igual.");
    ib2.textContent="Inserir timing completo (todas as partes)";ib2.disabled=!okp;
    ib2.onclick=function(){ask("Trazer o timing completo substitui as rotas dos jogadores que têm respawn, as utilitárias trazidas antes do Timing, o fim das partes e as escolhas deste mapa. Continuar?",function(){insAll(T)})};
    ab2.appendChild(ap);ab2.appendChild(ib2);insw.appendChild(ab2)}
  function insAll(T){snap();var np=d.np,cp=function(x){return JSON.parse(JSON.stringify(x))},c;
    function mk(r,c,n){var q={c:c,n:n,p:cp(r.p)};if(r.vs)q.vs=cp(r.vs);if(r.tv)q.tv=r.tv;else if(r.tw>0)q.tv=String(r.tw);return q}
    function ulOf(r,c,n,out){(r.ul||[]).forEach(function(e){var o=cp(typeof e==="string"?{n:e,tm:""}:e);o.th=c;o.rc=c;o.rn=n;o.hid=false;out.push(o)})}
    d.ul=(d.ul||[]).filter(function(e){return!(e&&e.rc!=null)});
    for(c=0;c<5;c++){var sp=rsOf(c);if(sp<0)continue;d.s=d.s.filter(function(q){return q.c!==c});
      T.r.filter(function(r){return r.sp===sp&&(r.n||1)<=np}).sort(function(a,b){return(a.n||1)-(b.n||1)}).forEach(function(r){var n=r.n||1;d.s.push(mk(r,c,n));ulOf(r,c,n,d.ul)})}
    d.pe=(T.pe||[]).slice(0,np).map(function(x){return x==null?"":x});
    d.ch=(T.ch||[]).filter(function(cc){return cc.o&&cc.o.length}).map(function(cc){return{n:cc.n||1,q:cc.q||"",o:cc.o.map(function(o){var ob={nm:o.nm||"Opção",s:[],u:[],np:o.np||1,pt:[],pe:(o.pe||[]).slice(),ul:[]};
      for(var c2=0;c2<5;c2++){var s2=rsOf(c2);if(s2<0)continue;(o.r||[]).filter(function(r){return r.sp===s2}).forEach(function(r){var n=r.n||1;ob.s.push(mk(r,c2,n));ulOf(r,c2,n,ob.ul)})}return ob})}});
    part=1;save();bar();paint();if(w.onins)w.onins();setSt("Timing completo inserido às "+hora())}
  function unbranch(){d=d0;br=null;pending=null;ovl.style.display="none";ovl.innerHTML=""}
  function chAt(S0,t0){var r=null;(d.ch||[]).forEach(function(c){var n=c.n||1;if(r||!(c.o&&c.o.length)||n>d.np)return;var tn=S0.T[n]+S0.D[n];if(t0<tn-1e-9&&tt>=tn-1e-9)r={c:c,t:tn}});return r}
  function showCh(c){pending=c;ovl.innerHTML="";var q=el("strong");q.textContent=c.q||"Escolha";ovl.appendChild(q);
    c.o.forEach(function(o){var b=el("button",{class:"b primary",type:"button"});b.textContent=o.nm||"Opção";b.onclick=function(){branch(c,o);play()};ovl.appendChild(b)});ovl.style.display="flex"}
  function branch(c,o){var b0=d,n=c.n||1;o.s=o.s||[];o.u=o.u||[];o.np=o.np||1;o.pt=o.pt||[];o.pe=o.pe||[];
    var sh=function(q){var z=JSON.parse(JSON.stringify(q));z.n=(q.n||1)+n;return z};
    d={s:b0.s.filter(function(q){return(q.n||1)<=n}).concat(o.s.map(sh)),u:b0.u.filter(function(x){return(x.n||1)<=n}).concat(o.u.map(sh)),np:n+o.np,pt:b0.pt.slice(0,n).concat(o.pt),pe:b0.pe.slice(0,n).concat(o.pe),ul:(b0.ul||[]).concat(o.ul||[]),players:b0.players,nn:b0.nn,rs:b0.rs,ch:(o.ch||[]).map(function(c2){var z=Object.assign({},c2);z.n=(c2.n||1)+n;return z}),lk:b0.lk,lt:b0.lt,lz:b0.lz,fl:b0.fl,ks:b0.ks,kv:b0.kv,pl:b0.pl,pv:b0.pv,en:(b0.en||[]).map(function(e){var z=Object.assign({},e);z.rt=(e.rt||[]).filter(function(r){return(r.n||1)<=n});return z})};
    br=o;pending=null;ovl.style.display="none";bar()}
  function play(){if(pending){showCh(pending);return}if(tm)return;if(tt>=endT())tt=0;tm=setInterval(function(){var S0=sched(),r0=rpOf(S0);var t00=tt;tt+=0.05*mult;var hit=chAt(S0,t00);if(hit){tt=hit.t;stop();showCh(hit.c);frame();clock();return}if(pauseP){var nr=rpOf(S0);if(nr>r0){tt=S0.T[nr];stop();frame();clock();return}}var e2=endT();if(tt>=e2){tt=e2;stop()}frame();clock()},50);if(pbtn)pbtn.textContent="Pausar";frame();clock()}
  function sel2(label,opts,val,fn){var wr=el("label",{class:"sl"});wr.appendChild(document.createTextNode(label+" "));var sl=el("select");
    opts.forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(String(o[0])===String(val))op.selected=true;sl.appendChild(op)});
    sl.onchange=function(){fn(sl.value)};wr.appendChild(sl);tb.appendChild(wr)}
  function lu(){var o=[];(d.ul||[]).forEach(function(e){if(e&&e.hid)return;var u=findU(m,e&&e.n);if(u)o.push({u:u,e:e})});if(OPEN)pullRes(m,d,spd).utils.forEach(function(x){o.push(x)});return o}
  function ppos(S,c,t0){return gpos(S,d.s,d.np,function(q){return q.c===c},t0)}
  function renderSt(){if(U)return;stl.innerHTML="";var sy=[],stt=STW.get(d);if(!stt){stt={};STW.set(d,stt)}
    var gb=el("div",{class:"row"}),g1=el("button",{class:"b",type:"button"}),g2=el("button",{class:"b",type:"button"});g1.textContent="Diminuir todas as partes";g2.textContent="Aumentar todas as partes";
    g1.onclick=function(){for(var kk=1;kk<=d.np;kk++)stt[kk]=true;renderSt()};g2.onclick=function(){for(var kk=1;kk<=d.np;kk++)stt[kk]=false;renderSt()};gb.appendChild(g1);gb.appendChild(g2);stl.appendChild(gb);
    function all(){sy.forEach(function(f){f()})}
    for(var pp=1;pp<=d.np;pp++)(function(pp){
      var box=el("div",{class:"uc"}),hd=el("div",{class:"row"}),pinf=el("p",{class:"hint"}),ttl=el("strong");ttl.textContent="Parte "+pp;
      var pe=field("input",d.pe[pp-1]||"","Termina em: relógio (1:30) ou duração em segundos (20)",function(v){d.pe[pp-1]=v;all();clock()});pe.style.flex="1";
      function spy(){var S2=sched(),e=pEnd(d.pe[pp-1],S2.T[pp]),ok=e>=0&&e>S2.T[pp]+.5;pinf.textContent="Dura "+r1(S2.D[pp])+" s · do relógio "+fmtT(115-S2.T[pp])+" até "+fmtT(115-S2.T[pp]-S2.D[pp])+(ok?"":" (automático: termina quando a última rota chega)")}
      sy.push(spy);spy();
      var mn=!!stt[pp],tg=el("button",{class:"b",type:"button","aria-expanded":String(!mn),"aria-label":(mn?"Aumentar":"Diminuir")+" a Parte "+pp});tg.textContent=mn?"Aumentar":"Diminuir";tg.onclick=function(){stt[pp]=!stt[pp];renderSt()};
      hd.appendChild(ttl);if(!mn)hd.appendChild(pe);hd.appendChild(tg);box.appendChild(hd);box.appendChild(pinf);if(mn){stl.appendChild(box);return}
      var cnt={},seen={};d.s.forEach(function(q){if((q.n||1)===pp)cnt[q.c]=(cnt[q.c]||0)+1});
      d.s.forEach(function(q,i){if((q.n||1)!==pp)return;seen[q.c]=(seen[q.c]||0)+1;
        var row=el("div",{class:"row"}),lab=el("span",{class:"hint"}),inf=el("p",{class:"hint"});
        lab.innerHTML='<i class="sw" style="--c:'+COLORS[q.c%5]+'"></i> <span class="'+(CALLS||d.nn?"":"pnl")+'" data-pn="'+q.c+'">'+esc(pn(q.c))+'</span>'+(cnt[q.c]>1?" (trecho "+seen[q.c]+")":"");
        function sy1(){var S2=sched(),x=S2.del[i];if(!x)return;var fim=x[0]+x[1];inf.textContent=(S2.man[i]?"":"(tempo estimado pelo desenho) ")+(fim>S2.D[pp]+.01?"corta no fim da parte (relógio "+fmtT(115-S2.T[pp]-S2.D[pp])+"); ainda faltariam "+r1(fim-S2.D[pp])+" s":"chega no relógio "+fmtT(115-(S2.T[pp]+fim))+(fim<S2.D[pp]-.01?" e fica parado até o fim da parte":""))}
        var tv=field("input",q.tv||(q.tw>0?String(q.tw):""),"Tempo: segundos (8) ou relógio de chegada (1:50)",function(v){q.tv=v;q.tw=0;all();clock()});
                tv.style.flex="1";row.appendChild(lab);row.appendChild(tv);box.appendChild(row);box.appendChild(inf);sy.push(sy1);sy1();
        var fk=q.c+"_"+pp,row2=el("div",{class:"row edt"});
        function refix(){snap();applyFix(m,q,d.s.filter(function(x){return x.c===q.c&&x!==q}),floorAtD(d,q.c,pp),false);save();paint()}
        row2.appendChild(pickL("Andar da rota",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (as duas paredes)"]],(d.fl&&d.fl[fk]!=null)?d.fl[fk]:"",function(v){d.fl=d.fl||{};if(v==="")delete d.fl[fk];else d.fl[fk]=+v;refix()}));
        var rfx=el("button",{class:"b",type:"button"});rfx.textContent="Refazer pelas paredes";rfx.onclick=refix;row2.appendChild(rfx);box.appendChild(row2);
        if(q.red&&q.red.length){var wn=el("p",{class:"hint"});wn.style.color="#e11d1d";wn.textContent="Esta rota bateu numa parede: a parte em vermelho no mapa passou da parede e a rota para antes dela. Troque o andar, redesenhe ou, se a passagem for estreita e o caminho estiver certo, use o botão abaixo.";box.appendChild(wn)}box.appendChild(okBtn(q,refix))});
      stl.appendChild(box)})(pp)}
  function bar(){
    tb.innerHTML="";sub.innerHTML="";info.innerHTML="";tb.className="tb"+(mode==="rep"?"":" edt");insw.innerHTML="";insw.style.display="none";cmdw.innerHTML="";var TT=m.tm&&m.tm[side];if(TT&&TT.sp&&TT.sp.length){var sb=el("button",{class:"tool",type:"button"});sb.textContent=showSp?"Sumir respawn":"Mostrar respawn";sb.onclick=function(){showSp=!showSp;render()};sub.appendChild(sb)}
    if(U){[["all","Todas"]].concat(Object.keys(ICO).map(function(t){return[t,UN[t]]})).forEach(function(k){var b=el("button",{class:"tool","aria-pressed":ufil===k[0]});b.textContent=k[1];b.onclick=function(){ufil=k[0];bar();paint()};sub.appendChild(b)});
      var nb=el("button",{class:"tool","aria-pressed":snm});nb.textContent="Nomes no mapa";nb.onclick=function(){snm=!snm;bar();paint()};sub.appendChild(nb)}
    if(!U){
      [["est","Estático"],["rep","Replay"]].forEach(function(k){var b=el("button",{class:"tool","aria-pressed":mode===k[0]});b.textContent=k[1];
        b.onclick=function(){stop();unbranch();mode=k[0];tt=0;rp=1;bar();paint()};sub.appendChild(b)});
      if(mode==="est")info.appendChild(field("input",d.pt[part-1]||"","Descrição da parte "+part+" (opcional)",function(v){d.pt[part-1]=v}));
      else{var cp=el("p",{class:"cap"});info.appendChild(cp);capEl=cp;clock()}
    }
    if(mode==="rep"){
      for(var i=1;i<=d.np;i++)(function(i){tbtn("","Parte "+i,rp===i,function(){stop();tt=sched().T[i];bar();paint()})})(i);
      sep();
      sel2("Velocidade",[[0.25,"0,25x"],[0.5,"0,50x"],[1,"1x"],[2,"2x"],[3,"3x"],[5,"5x"],[10,"10x"]],mult,function(v){mult=parseFloat(v)});
      sel2("Ver",[[-1,"Todos"]].concat(d.players.map(function(p,i){return[i,pn(i)]})),only,function(v){only=parseInt(v,10);paint()});
      sel2("Foco do andar",[["all","Todos os andares"],["f0","Só inferior"],["f1","Só superior"]].concat(d.players.map(function(p,i){return["p"+i,"Seguir "+pn(i)]})).concat(OPEN?(d.en||[]).map(function(e,i){return["e"+i,"Seguir "+(e.nm||("inimigo "+(i+1)))]}):[]),focus,function(v){focus=v;frame()});
      if(!(m.zn||[]).length){var zh=el("span",{class:"hint"});zh.textContent="Para o foco funcionar, desenhe zonas inferior e superior na aba Desenho.";tb.appendChild(zh)}
      tb.appendChild(cmSel(function(){frame()}));if(!OPEN){tb.appendChild(vdBtn(function(){frame()}));tb.appendChild(veBtn(function(){frame()}))}
      if(d.np>1){var lb2=el("label",{class:"sl"}),cb2=el("input",{type:"checkbox"});cb2.style.width="auto";cb2.checked=pauseP;cb2.onchange=function(){pauseP=cb2.checked};lb2.appendChild(cb2);lb2.appendChild(document.createTextNode(" Pausar no fim de cada parte"));tb.appendChild(lb2)}
      return}
    if(U)tbtn('<svg viewBox="-12 -12 24 24"><path d="M-7-10 8 3 1 4 5 11 2 12-2 5-7 9z" fill="currentColor"/></svg>',"Mouse",tool.k==="mouse",function(){tool={k:"mouse"};bar()});
    else{d.players.forEach(function(p,i){tbtn('<i class="sw" style="--c:'+COLORS[i%5]+'"></i>',pn(i),tool.k==="draw"&&tool.i===i,function(){tool={k:"draw",i:i};who=i;bar();frame()});var l2=tb.lastChild.querySelector("span");if(!CALLS&&!d.nn)l2.className="pnl";l2.dataset.pn=i});sep()}
    if(U)Object.keys(ICO).forEach(function(t){tbtn('<svg viewBox="-12 -12 24 24">'+ICO[t]+'</svg>',UN[t],tool.k==="util"&&tool.t===t,function(){tool={k:"util",t:t};bar()})});
    sep();
    tbtn("","Borracha",tool.k==="erase",function(){tool={k:"erase"};bar();frame()});
    if(OPEN){sep();[["en","Inimigo"],["enr","Mover inimigo (rota)"],["enx","Apagar inimigo"]].forEach(function(k){tbtn("",k[1],tool.k===k[0],function(){tool={k:k[0]};bar();frame()})});
      if(tool.k==="enr"&&(d.en||[]).length){if(ei>=d.en.length)ei=0;sel2("Qual inimigo",d.en.map(function(e,i){return[i,"Inimigo "+(i+1)]}),ei,function(v){ei=parseInt(v,10);frame()})}}
    if(tool.k==="erase"){var ow=el("label",{class:"sl"}),os=el("select"),eo=[["all",U?"Tudo":"Tudo da Parte "+part]];
      if(!U){d.players.forEach(function(p,i){eo.push(["p"+i,pn(i)])});eo.push(["pa","Todos os caminhos"])}
      if(OPEN)eo.push(["en","Inimigos (e rotas deles)"]);eo.push(["ua","Todas as utilitárias"]);Object.keys(ICO).forEach(function(t){eo.push(["u:"+t,UN[t]])});
      eo.forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];if(o[0]===efil)op.selected=true;os.appendChild(op)});
      os.onchange=function(){efil=os.value};ow.appendChild(document.createTextNode("Só apaga: "));ow.appendChild(os);tb.appendChild(ow)}
    var lb=el("button",{class:"tool"});lb.textContent="Limpar";lb.onclick=function(){ask(OPEN?"Apagar tudo deste minimapa (todas as partes, inclusive os inimigos)?":"Apagar tudo deste minimapa (todas as partes)?",function(){snap();d.s=[];d.u=[];if(OPEN){d.en=[];(d.ul||[]).forEach(function(e){if(e&&typeof e.th==="string"&&e.th.charAt(0)==="e")e.th=""})}sel=-1;save();paint();if(w.onen)w.onen()})};tb.appendChild(lb);ub=el("button",{class:"tool",type:"button"});ub.textContent="Desfazer";ub.disabled=!hist.length;ub.onclick=undo;tb.appendChild(ub);var rb0=el("button",{class:"tool",type:"button"});rb0.textContent="Refazer";rb0.disabled=!rhist.length;rb0.onclick=redo;tb.appendChild(rb0);
    if(!U){sep();for(var i=1;i<=d.np;i++)(function(i){tbtn("","Parte "+i,part===i,function(){part=i;bar();frame()})})(i);
      var np=el("button",{class:"tool"});np.textContent="+ parte";np.onclick=function(){d.np++;part=d.np;save();bar();if(w.onen)w.onen()};tb.appendChild(np);
      {var rm2=el("button",{class:"tool"});rm2.textContent="- parte";rm2.disabled=d.np<2;rm2.onclick=function(){if(d.np<2)return;ask("Remover a Parte "+d.np+" (a última)? Os desenhos dela serão apagados.",function(){
        snap();var k=d.np,sh=function(o){return o};if(OPEN)(d.en||[]).forEach(function(e){e.rt=(e.rt||[]).filter(function(r){return(r.n||1)!==k})});
        d.s=d.s.filter(function(q){return(q.n||1)!==k}).map(sh);d.u=d.u.filter(function(u){return(u.n||1)!==k}).map(sh);
        d.pt.splice(k-1,1);d.pe.splice(k-1,1);d.np--;part=Math.min(part,d.np);rp=1;save();bar();paint();if(w.onen)w.onen()})};tb.appendChild(rm2);[["◀ Mover parte",-1],["Mover parte ▶",1]].forEach(function(q){var k2=part+q[1],mb2=el("button",{class:"tool",type:"button"});mb2.textContent=q[0];mb2.title="Troca a Parte "+part+" de lugar com a Parte "+k2+", levando junto desenhos, utilitárias e textos";mb2.disabled=k2<1||k2>d.np;mb2.onclick=function(){stop();snap();swapPartsD(d,part,k2);part=k2;rp=1;save();bar();paint();if(w.onen)w.onen();setSt("Partes trocadas às "+hora())};tb.appendChild(mb2)})}}
  if(!U&&mode==="est"){insUI();cmdUI()}}
  function renderList(){
    if(!U)return;list.innerHTML="";cardEls=[];
    var bt=el("div",{class:"row"}),a1=el("button",{class:"b",type:"button"}),a2=el("button",{class:"b",type:"button"});a1.textContent="Diminuir todas";a2.textContent="Aumentar todas";
    function ukey(i){return(m.uid||m.name)+":"+side+":"+i}
    a1.onclick=function(){d.u.forEach(function(u,i){UMN[ukey(i)]=true});paint()};a2.onclick=function(){d.u.forEach(function(u,i){UMN[ukey(i)]=false});paint()};bt.appendChild(a1);bt.appendChild(a2);list.appendChild(bt);
    d.u.forEach(function(u,i){
      if(ufil!=="all"&&u.t!==ufil)return;var mn=!!UMN[ukey(i)],c=el("div",{class:"uc"+(i===sel?" on":"")+(u.hid?" off":"")}),hd=el("div",{class:"row"});cardEls[i]=c;
      hd.innerHTML='<svg viewBox="-12 -12 24 24" width="28" height="28">'+ICO[u.t]+'</svg><strong>'+(i+1)+". "+UN[u.t]+'</strong>';
      var tg=el("button",{class:"b",type:"button","aria-expanded":String(!mn),"aria-label":(mn?"Aumentar":"Diminuir")+" a utilitária "+(i+1)});tg.textContent=mn?"Aumentar":"Diminuir";tg.onclick=function(){UMN[ukey(i)]=!UMN[ukey(i)];paint()};
      if(mn){var sp=el("span");sp.textContent=u.nm||"(sem nome)";sp.style.flex="1";hd.appendChild(sp);hd.appendChild(tg);c.appendChild(hd);list.appendChild(c);return}
      var ni=field("input",u.nm||"","Nome (ex: smoke do meio)",function(v){u.nm=v});ni.style.flex="1";hd.appendChild(ni);hd.appendChild(pickL("Andar",[["","Automático (pela zona)"],[0,"Inferior"],[1,"Superior"],[2,"Mista (os dois)"]],u.fl==null?"":u.fl,function(v){if(v==="")delete u.fl;else u.fl=+v;save();paint()}));hd.appendChild(tg);
      var rm=el("button",{class:"b danger"});rm.textContent="Remover";rm.onclick=function(){snap();d.u.splice(i,1);sel=-1;save();paint()};hd.appendChild(rm);
      c.appendChild(hd);
      c.appendChild(field("textarea",u.tx||"","Onde é essa utilitária e como lançar",function(v){u.tx=v}));
      var rad=null,ls=ulinks(u),lh=el("p",{class:"hint"}),lb=el("div");lh.textContent="Links: um para cada lugar de onde dá para lançar. Escreva o nome do lugar e depois o link. Use + para outro lugar e − para tirar.";c.appendChild(lh);
      function drawL(){lb.innerHTML="";ls.forEach(function(L,li){var r=el("div",{class:"row"}),nn=field("input",L.n||"","Nome do lugar (ex: pé do pilar)",function(v){L.n=v;if(rad)rad.rf()}),uu=field("input",L.u||"","Link do vídeo (YouTube ou outro)",function(v){L.u=v});nn.style.flex="1";uu.style.flex="2";r.appendChild(nn);r.appendChild(uu);
        var tf=field("input",L.ft==null?"":L.ft,"Cai em (s)",function(v){L.ft=v;if(rad)rad.rf()});tf.style.maxWidth="110px";tf.title="Segundos que a utilitária leva para cair depois de lançada deste lugar";r.appendChild(tf);
        var lbw=linkBtn(function(){return L.u},{label:L.n||("Link "+(li+1)),title:function(){return L.n||"Link"}});nn.addEventListener("input",function(){lbw.firstChild.textContent=nn.value||("Link "+(li+1))});r.appendChild(lbw);
        var mb=el("button",{class:"b danger edt",type:"button","aria-label":"Tirar este link"});mb.textContent="−";mb.onclick=function(){ls.splice(li,1);save();drawL();if(rad)rad.rf()};r.appendChild(mb);lb.appendChild(r)})}
      drawL();c.appendChild(lb);var pb=el("button",{class:"b edt",type:"button","aria-label":"Adicionar outro link"});pb.textContent="+ link";pb.onclick=function(){ls.push({n:"",u:""});save();drawL();if(rad)rad.rf()};
      var lr=el("div",{class:"row"});lr.appendChild(pb);var hb=el("button",{class:"b"});hb.className="b edt";hb.textContent=u.hid?"Mostrar no mapa":"Ocultar do mapa";hb.onclick=function(){u.hid=!u.hid;save();paint()};lr.appendChild(hb);c.appendChild(lr);
      rad=linkRadar(m,u,ls,ukey(i),RO);c.appendChild(rad);
      list.appendChild(c)});
  }
  function pickU(i){sel=i;if(i>=0){var k=(m.uid||m.name)+":"+side+":"+i;UMN[k]=false;ULR[k]=true;goCard=i}paint()}
  function paint(){
    var sx=window.scrollX,sy=window.scrollY;
    paint0();
    if(U){if(goCard>=0&&cardEls[goCard]){var gi=goCard;goCard=-1;requestAnimationFrame(function(){var cc=cardEls[gi];if(cc&&cc.scrollIntoView)cc.scrollIntoView({behavior:"smooth",block:"start"})})}
      else{window.scrollTo(sx,sy);requestAnimationFrame(function(){if(window.scrollY!==sy)window.scrollTo(sx,sy)})}}
  }
  function paint0(){frame();renderList();renderSt();clock()}
  function focusFloorAt(S){var f=focus;if(!f||f==="all")return-1;if(f==="f0")return 0;if(f==="f1")return 1;
    var pos=null,fl=null;
    if(f.charAt(0)==="p"){var c=+f.slice(1);pos=ppos(S,c,tt);fl=hasFl(m)?fcAt((d.fc||{})[c],tt):null;if(fl==null)fl=floorAtD(d,c,rp)}
    else if(f.charAt(0)==="e"){var ie=+f.slice(1),e=(d.en||[])[ie];if(e){pos=enPosAt(S,ie,tt);fl=enF(e,rp)}}
    if(fl==null&&pos)fl=zoneAt(m,pos);
    if(fl==null&&hasFl(m)&&!zonesOn(m))fl=1;if(fl==null)fl=lastFl;lastFl=fl;return fl==null?-1:fl}
  var dropw=el("div",{class:"uc"}),szr=el("div",{class:"row"});
  function dropPart(S,t){var k,p=1;for(k=1;k<=d.np;k++)if(S.T[k]<=t+1e-9)p=k;return p}
  function dropGeom(S,x){var t0=ptE(x.t);if(!(t0>=0))return null;var c=+x.c,A=ppos(S,c,t0);if(!A)return null;
    var a=lkAt(d,c,S,d.np,t0),ux,uy,src;
    if(a!=null){ux=Math.sin(a*Math.PI/180);uy=-Math.cos(a*Math.PI/180);src="mira"}
    else{var A2=ppos(S,c,t0+.4),dx=A2?A2[0]-A[0]:0,dy=A2?A2[1]-A[1]:0;if(Math.abs(dx)+Math.abs(dy)<.5){dx=0;dy=1}var dd=Math.hypot(dx,dy)||1;ux=dx/dd;uy=dy/dd;src="caminho"}
    var sd=Math.sin((c+1)*12.9898+t0*78.233+String(x.ty||"").length*3.1)*43758.5453,r1=sd-Math.floor(sd);sd=Math.sin(sd*91.7)*43758.5453;var r2=sd-Math.floor(sd);
    var dist=DROP_NAT*(.85+r1*.3),lat=(r2-.5)*2*DROP_JIT,tx=A[0]+ux*dist-uy*lat,ty=A[1]+uy*dist+ux*lat;
    tx=Math.max(2,Math.min(998,tx));ty=Math.max(2,Math.min(998,ty));
    var fl=floorAtD(d,c,dropPart(S,t0));if(fl==null){var z=zoneAt(m,A);fl=z!=null?z:2}
    var W=wallSegs(m,fl),hit=W.length?firstHit(A,[tx,ty],W):null,wall=false;
    if(hit){var L2=Math.hypot(tx-A[0],ty-A[1])||1,tb=Math.max(0,hit.t-4/L2);tx=A[0]+(tx-A[0])*tb;ty=A[1]+(ty-A[1])*tb;wall=true}
    var pk=(x.pk===""||x.pk==null)?null:+x.pk,pf=ptE(x.pf);
    return{t0:t0,tl:t0+.8,A:A,L:[tx,ty],c:c,pk:pk,from:Math.max(t0+2.3,pf>=0?pf:0),src:src,ang:a,wall:wall}}
  function dropGot(S,g,tt){if(g.pk==null)return null;for(var q=g.from;q<=tt;q+=.25){var R=ppos(S,g.pk,q);if(R&&Math.hypot(R[0]-g.L[0],R[1]-g.L[1])<9)return q}return null}
  function dropSvg(tt){var h="",S=sched();(d.dr||[]).forEach(function(x,i){if(x.hid)return;var g=dropGeom(S,x);if(!g)return;var ty=x.ty||"smoke",col=UCOL[ty]||"#fff",st=tt==null;
    if(!st&&tt<g.t0)return;
    var f=st?1:Math.min(1,(tt-g.t0)/.8),ao=st?.55:(tt<g.tl?1:Math.max(0,1-(tt-g.tl)/1.2)),dx=g.L[0]-g.A[0],dy=g.L[1]-g.A[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,ex=g.A[0]+dx*f,ey=g.A[1]+dy*f;
    if(ao>0.02&&len>1){h+='<g data-dr="'+i+'" opacity="'+ao.toFixed(2)+'" pointer-events="none"><line x1="'+g.A[0]+'" y1="'+g.A[1]+'" x2="'+ex+'" y2="'+ey+'" stroke="#000" stroke-width="7" stroke-linecap="round"/><line x1="'+g.A[0]+'" y1="'+g.A[1]+'" x2="'+ex+'" y2="'+ey+'" stroke="'+col+'" stroke-width="4" stroke-linecap="round"/>'
      +'<polygon points="'+ex+','+ey+' '+(ex-ux*15+uy*8)+','+(ey-uy*15-ux*8)+' '+(ex-ux*15-uy*8)+','+(ey-uy*15+ux*8)+'" fill="'+col+'" stroke="#000" stroke-width="2"/></g>'}
    if(!st&&tt<g.tl){var lift=Math.sin(Math.PI*f)*14;h+='<g transform="translate('+ex+' '+(ey-lift)+') scale('+(1.15*SZ("held")).toFixed(2)+')" pointer-events="none">'+icoHeld(ty)+'</g>';return}
    var got=st?null:dropGot(S,g,tt);
    if(got!=null){var ag=tt-got;if(ag<.9)h+='<circle cx="'+g.L[0]+'" cy="'+g.L[1]+'" r="'+(14+ag*26)+'" fill="none" stroke="'+COLORS[g.pk%5]+'" stroke-width="4" opacity="'+(1-ag/.9).toFixed(2)+'" pointer-events="none"/>';return}
    h+='<g data-dr="'+i+'" transform="translate('+g.L[0]+' '+g.L[1]+') scale('+(1.0*SZ("held")).toFixed(2)+')" pointer-events="none"><circle r="15" fill="#000" fill-opacity=".55"/>'+icoHeld(ty)+'<text y="26" font-size="9" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="2.4" paint-order="stroke">'+esc(g.pk!=null?"largada · pega: "+pn(g.pk):"largada")+'</text></g>'});return h}
  function dropUI(){dropw.innerHTML="";if(U)return;d.dr=d.dr||[];if(RO&&!d.dr.length)return;
    var hp=el("strong");hp.textContent="Largar utilitária (drop)";dropw.appendChild(hp);
    var ht=el("p",{class:"hint"});ht.textContent="Escolha quem larga, quem pega, o horário e qual utilitária. A utilitária cai para onde o jogador está mirando (campo de visão), com uma pequena diferença de posição, e nunca dentro de parede. No mapa aparece uma seta e a utilitária fica sinalizada até o jogador que você escolheu encostar nela.";dropw.appendChild(ht);
    var P=d.players.map(function(p,i){return[i,pn(i)]}),TY=[["smoke","Smoke"],["flash","Flash"],["he","HE"],["molotov","Molotov"],["decoy","Decoy"]];
    d.dr.forEach(function(x,i){if(x.pk===undefined)x.pk=(x.to===""||x.to==null)?"":+x.to;var box=el("div"),r=el("div",{class:"row"}),inf=el("p",{class:"hint"});
      function upd(){var S2=sched(),g=dropGeom(S2,x);if(!g){inf.textContent="Informe o horário (ex.: 1:48 ou 12) e escolha quem larga. O jogador precisa ter rota nesse horário.";return}
        var m2=scaleOf(m)*1.024,u=Math.round(Math.hypot(g.L[0]-g.A[0],g.L[1]-g.A[1])*m2);
        inf.textContent="Larga aos "+r1(g.t0)+" s · "+(g.src==="mira"?"cai para onde ele mira ("+Math.round(g.ang)+"°)":"sem direção de olhar definida: cai no sentido em que ele anda")+" · a cerca de "+u+" unidades dele"+(g.wall?" · parou antes da parede":"")+(g.pk!=null?" · "+pn(g.pk)+" pega ao encostar (depois de "+r1(g.from)+" s)":" · ninguém pega: fica no chão")}
      if(RO){var sp=el("span",{class:"hint"});sp.textContent=pn(+x.c||0)+" larga "+(x.ty||"smoke")+" às "+(x.t||"?")+((x.pk===""||x.pk==null)?"":" · pega: "+pn(+x.pk));r.appendChild(sp);box.appendChild(r);dropw.appendChild(box);return}
      r.appendChild(pickL("Larga",P,x.c==null?0:x.c,function(v){x.c=+v;save();upd();paint()}));
      r.appendChild(pickL("Quem pega",[["","Ninguém (fica no chão)"]].concat(P),x.pk==null?"":x.pk,function(v){x.pk=v===""?"":+v;save();upd();paint()}));
      var tf=field("input",x.t||"","Horário (1:48) ou segundos (12)",function(v){x.t=v;save();upd();paint()});tf.style.maxWidth="170px";r.appendChild(tf);
      var pf=field("input",x.pf||"","Pega a partir de (opcional)",function(v){x.pf=v;save();upd();paint()});pf.style.maxWidth="190px";r.appendChild(pf);
      r.appendChild(pickL("Utilitária",TY,x.ty||"smoke",function(v){x.ty=v;save();paint()}));
      var hb=el("button",{class:"b",type:"button"});hb.textContent=x.hid?"Mostrar":"Esconder";hb.onclick=function(){x.hid=!x.hid;save();dropUI();paint()};r.appendChild(hb);
      var rb=el("button",{class:"b danger",type:"button"});rb.textContent="Tirar";rb.onclick=function(){d.dr.splice(i,1);save();dropUI();paint()};r.appendChild(rb);
      upd();box.appendChild(r);box.appendChild(inf);dropw.appendChild(box)});
    if(!RO){var ab=el("button",{class:"b",type:"button"});ab.textContent="+ Largar utilitária";ab.onclick=function(){d.dr.push({c:0,pk:"",t:"",ty:"smoke"});save();dropUI();paint()};dropw.appendChild(ab)}}
  function frame(){
    var rep=mode==="rep",S=rep?sched():null,h=radarOf(m)?fvImg(m,rep?focusFloorAt(S):-1):'<rect width="1000" height="1000" style="fill:var(--bg)"/><path d="M0 250H1000M0 500H1000M0 750H1000M250 0V1000M500 0V1000M750 0V1000" style="stroke:var(--line)" stroke-width="2"/><text x="500" y="520" text-anchor="middle" font-size="90" font-weight="800" style="fill:var(--line)">'+esc(m.name)+'</text>';
    if(rep)rp=rpOf(S);
    if(rep)h+=dimSvg(m,focusFloorAt(S),dmId);
    var OC=null,simR=null;if(OPEN){var S0o=S||sched(),tS=rep?tt:Math.max(0,S0o.T[part]+S0o.D[part]-.02);OC={rep:rep,S0:S0o,items:allItems(),part:part,rp:rp,tt:tS,only:only,focus:focus,np:d.np,spd:spd,T:endT(),pn:pn,pull:pullRes(m,d,spd),utils:lu(),pos:function(c,t){return ppos(S0o,c,t)}};simR=openSim(m,d,OC)}
    var fs=rep?Math.min(1,Math.max(0,(tt-S.T[rp])/.8)):1;
    var pcs=[];
    d.s.forEach(function(q,i){var n=q.n||1,pp2=q.p,fo=1;if(rep){if(n>rp||(only>=0&&q.c!==only))return;var dd=simR?simR.dead["o"+q.c]:null,td=dd?dd.t:null,st0=S.T[n]+S.del[i][0];if(td!=null&&st0>=td)return;fo=fadeOp(rp-n,fs);if(fo<=.01)return;var lim=td!=null?Math.min(tt,td):(n===rp?tt:null);if(lim!=null){var f0=(lim-st0)/S.del[i][1];if(f0<=0)return;if(f0<1)pp2=partialG(q.p,f0)}}
      pcs.push({k:"o"+q.c,n:n,p:pp2,col:COLORS[q.c%5],w:7*SZ("tr"),dash:"",att:' data-k="s" data-i="'+i+'"',op:rep&&n<rp?' opacity="'+fo.toFixed(2)+'"':""})});
    if(OPEN){var eix=d.s.length;(d.en||[]).forEach(function(e,ie){(e.rt||[]).forEach(function(r){var idx=eix++,n=r.n||1,pp3=r.p,fo=1;if(n>d.np||r.p.length<2)return;
      if(rep){if(n>rp||!S.del[idx])return;var dd=simR?simR.dead["e"+ie]:null,td=dd?dd.t:null,st0=S.T[n]+S.del[idx][0];if(td!=null&&st0>=td)return;fo=fadeOp(rp-n,fs);if(fo<=.01)return;var lim=td!=null?Math.min(tt,td):(n===rp?tt:null);if(lim!=null){var f1=(lim-st0)/S.del[idx][1];if(f1<=0)return;if(f1<1)pp3=partialG(r.p,f1)}}
      pcs.push({k:"e"+ie,n:n,p:pp3,col:"#ef4444",w:5*SZ("tr"),dash:' stroke-dasharray="10 7"',att:"",op:' opacity="'+(rep&&n<rp?fo.toFixed(2):".9")+'"'})})})}
    var tby={};pcs.forEach(function(p){(tby[p.k]=tby[p.k]||[]).push(p)});
    Object.keys(tby).forEach(function(k){var Ls=tby[k].sort(function(a,b){return a.n-b.n}),dd=rep&&simR?simR.dead[k]:null,rem=0;if(dd&&tt>dd.t){var tot=0;Ls.forEach(function(p){tot+=plenA(p.p)});var u=Math.min(1,(tt-dd.t)/5);rem=u>=1?1e9:u*tot}
      Ls.forEach(function(p){var pts=p.p;if(rem>0){var pl=plenA(pts);if(rem>=pl-1e-6){rem-=pl;return}pts=trimStart(pts,rem);rem=0;if(!pts)return}
        h+='<polyline'+p.att+' points="'+pts.map(function(a){return a.join(",")}).join(" ")+'" fill="none" stroke="'+p.col+'" stroke-width="'+p.w+'"'+p.dash+' stroke-linecap="round" stroke-linejoin="round"'+p.op+'/>'})});
    if(!rep){d.s.forEach(function(q){h+=redSvg(q)});if(OPEN)(d.en||[]).forEach(function(e){(e.rt||[]).forEach(function(r){h+=redSvg(r)})})}
    d.u.forEach(function(u,i){var n=u.n||1,fo=1;if(rep){if(n>rp||(only>=0&&u.p!==only))return;fo=fadeOp(rp-n,fs);if(fo<=.01)return}if(U&&(u.hid||(ufil!=="all"&&u.t!==ufil)))return;
      h+='<g data-k="u" data-i="'+i+'" transform="translate('+u.x+' '+u.y+') scale(2.2)"'+(rep&&n<rp?' opacity="'+fo.toFixed(2)+'"':(hasFl(m)?' opacity="'+fvOp(ufl(m,u))+'"':''))+'>';
      if(!U&&u.p!=null)h+='<circle r="13" fill="none" stroke="'+COLORS[u.p%5]+'" stroke-width="2.5"/>';
      if(U&&i===sel)h+='<circle r="14" fill="none" stroke="#ffe14d" stroke-width="3"/>';
      h+=ICO[u.t];if(U&&ufl(m,u)>0)h+='<text x="-9" y="-8" font-size="11" font-weight="800" fill="#93c5fd" stroke="#000" stroke-width=".6" paint-order="stroke" text-anchor="middle">'+(ufl(m,u)===2?"↕":"↑")+'</text>';
      if(U)h+='<text x="8" y="-8" font-size="11" font-weight="800" fill="#fff" stroke="#000" stroke-width=".6" paint-order="stroke" text-anchor="middle">'+(i+1)+'</text>';
      if(U&&snm&&u.nm)h+='<text y="21" font-size="7.5" font-weight="700" text-anchor="middle" fill="#fff" stroke="#000" stroke-width=".7" paint-order="stroke">'+esc(u.nm)+'</text>';h+='</g>'});
    if(!U){var L2=lu();if(simR)L2=L2.filter(function(o){var a=ltimeG(o.u,o.e),w=whoOf(o);return!(a&&w&&simR.dead[w]&&simR.dead[w].t<=a[0])});if(rep)L2.forEach(function(o){var a=ltimeG(o.u,o.e);if(!a)return;if(o.stf){o.st=o.stf(a[0]);return}var th=o.e.th;if(th===""||th==null)return;if(typeof th==="string"&&th.charAt(0)==="e")o.st=enPosAt(S,+th.slice(1),a[0]);else o.st=ppos(S,+th,a[0])});h+=usvg(L2,rep?tt:null)}
    if(!OPEN&&rep){if(vdOn())d.s.forEach(function(q,i){if(!q.vs||(only>=0&&q.c!==only))return;var same=function(x){return x.c===q.c},w=routeWin(S,d.s,q,i,d.np,same);if(!w||tt<w[0]||tt>=w[1])return;h+=visSvg(m,q.vs,function(x){return ppos(S,q.c,x)},tt,COLORS[q.c%5])});
      if(veOn()){var T2=m.tm&&m.tm[side==="tr"?"ct":"tr"];if(T2&&T2.r&&T2.r.length){var np2=T2.np||1,S2=sched2(m,T2.r,np2,T2.pe||[],function(r){return r.id},spd),sps={};T2.r.forEach(function(r){if(r.vs)sps[r.sp]=1});
        Object.keys(sps).forEach(function(k){var sp=+k,same=function(x){return x.sp===sp},pf=function(x){return gpos(S2,T2.r,np2,same,x)},p0=pf(tt);if(!p0)return;
          T2.r.forEach(function(r,ri){if(!r.vs||r.sp!==sp)return;var w=routeWin(S2,T2.r,r,ri,np2,same);if(!w||tt<w[0]||tt>=w[1])return;h+=visSvg(m,r.vs,pf,tt,"#ef4444")});
          var s2=T2.sp[sp];h+='<circle cx="'+p0[0]+'" cy="'+p0[1]+'" r="10" fill="#ef4444" stroke="#fff" stroke-width="3" pointer-events="none"/><text x="'+p0[0]+'" y="'+(p0[1]-18)+'" font-size="15" font-weight="800" text-anchor="middle" fill="#ef4444" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+esc("Inimigo "+((s2&&s2.n)||(sp+1)))+"</text>"})}}}
    if(rep)d.s.forEach(function(q,i){if((q.n||1)!==rp||(only>=0&&q.c!==only))return;if(simR&&simR.dead["o"+q.c]&&tt>=simR.dead["o"+q.c].t)return;var dl=S.del[i],P=posAtG(q.p,Math.max(0,Math.min(1,(tt-S.T[q.n||1]-dl[0])/dl[1])));h+='<circle data-ball="'+i+'" cx="'+P[0]+'" cy="'+P[1]+'" r="11" fill="#fff" stroke="'+COLORS[q.c%5]+'" stroke-width="5"/>'});
    if(rep){var cc2;for(cc2=0;cc2<5;cc2++){if(only>=0&&cc2!==only)continue;
        if(d.s.some(function(q){return(q.n||1)===rp&&q.c===cc2})||!d.s.some(function(q){return q.c===cc2&&(q.n||1)<rp}))continue;
        if(simR&&simR.dead["o"+cc2]&&tt>=simR.dead["o"+cc2].t)continue;var Pi=ppos(S,cc2,tt);if(!Pi)continue;
        h+='<circle cx="'+Pi[0]+'" cy="'+Pi[1]+'" r="'+(11*SZ("pl"))+'" fill="#fff" stroke="'+COLORS[cc2%5]+'" stroke-width="'+(5*SZ("pl"))+'" opacity=".5"/>'}
      var ce3=[];(d.ul||[]).forEach(function(e){if(!e||e.hid||e.th===""||e.th==null||(typeof e.th==="string"&&e.th.charAt(0)==="e"))return;var u=findU(m,e.n);if(!u)return;var c3=+e.th;if(only>=0&&c3!==only)return;var P3=ppos(S,c3,tt);if(!P3)return;if(simR&&simR.dead["o"+c3]&&tt>=simR.dead["o"+c3].t)return;ce3.push({u:u,e:e,P:P3,k:"c"+c3})});h+=carryDraw(ce3,tt)}
    if(!rep&&!U&&!RO&&tool.k==="draw"&&part>1){var le=lastEnd(tool.i,part);if(le)h+='<circle cx="'+le[0]+'" cy="'+le[1]+'" r="17" fill="none" stroke="'+COLORS[tool.i%5]+'" stroke-width="4" stroke-dasharray="7 6"/>'}
    if(!rep&&!U&&!RO&&OPEN&&tool.k==="enr"&&d.en&&d.en[ei]&&part>1){var es=enEnd(d.en[ei],part);h+='<circle cx="'+es[0]+'" cy="'+es[1]+'" r="17" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="7 6"/>'}
    if(!U)h+=dropSvg(rep?tt:null);
    if(OPEN){h+=openLayer(m,d,OC,simR);updFc(simR,OC)}
    h+=spMarks(m,U?null:d);svg.innerHTML=h;if(tool.k==="erase"&&!rep)svg.appendChild(ring);
  }
  function updFc(R,C){var ev=R.ev.slice().sort(function(a,b){return a.t-b.t}),k=JSON.stringify(ev.map(function(e){return[e.k,Math.round(e.t*20),e.x,e.tg,e.id,Math.round((e.tot||0)*10)]}));if(fcEl.dataset.k===k)return;fcEl.dataset.k=k;fcEl.innerHTML="";
    function nm(id){var X=R.by[id];return X.k==="o"?pn(X.i):X.k==="e"?"Inimigo "+(X.i+1):X.x.lb}
    var hd=el("strong");hd.textContent="Previsão (calculada sozinha enquanto você desenha)";fcEl.appendChild(hd);
    if(!ev.length){var p0=el("p",{class:"hint"});p0.textContent="Com o que está desenhado agora ninguém vê ninguém e nenhum flash pega em ninguém. Se esperava um abate, confira o campo de visão, as paredes (andar certo) e se não há smoke no meio.";fcEl.appendChild(p0)}
    ev.forEach(function(e){var p=el("p",{class:"hint"});
      if(e.k==="kill"&&e.how)p.textContent=fmtT(115-e.t)+" · "+nm(e.x)+" elimina "+nm(e.tg)+" com "+e.how+" (dano de utilitária)";else if(e.k==="kill")p.textContent=fmtT(115-e.t)+" · "+nm(e.x)+" elimina "+nm(e.tg)+" (viu em "+fmtT(115-e.t0)+", gira "+Math.round(e.off)+"° e atira "+r1(e.t-e.t0)+" s depois)";
      else if(e.k==="dmg")p.textContent=fmtT(115-e.t)+" · "+nm(e.id)+" leva "+Math.round(e.dmg)+" de dano de "+e.how+" (fica com "+Math.round(e.hp)+" de vida)";else if(e.k==="burn")p.textContent=fmtT(115-e.t)+" · "+nm(e.id)+" entra no fogo e perde de 1 a 8 de vida a cada 0,2 s (sobe 1 por tick até 40 por segundo; fogos juntos somam)";else p.textContent=fmtT(115-e.t)+" · "+nm(e.id)+" fica sem enxergar por "+r1(e.until)+" s (flash "+e.nm+": cegueira total "+r1(e.tot)+" s, tela branca "+r1(e.hold)+" s; a "+Math.round(e.dist)+" unidades, "+Math.round(e.off)+"° fora do centro da mira)";
      fcEl.appendChild(p)})}
  function pt(e){return ptr(svg,e)}
  var cs=null,er=false,R=30;
  var ring=document.createElementNS("http://www.w3.org/2000/svg","circle");
  ring.setAttribute("r",R);ring.setAttribute("fill","rgba(255,255,255,.25)");ring.setAttribute("stroke","#fff");ring.setAttribute("stroke-width","3");
  ring.style.pointerEvents="none";ring.style.display="none";
  function ringAt(p){ring.setAttribute("cx",p[0]);ring.setAttribute("cy",p[1]);ring.style.display="block"}
  function dseg(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0,x=a[0]+t*dx-p[0],y=a[1]+t*dy-p[1];return Math.sqrt(x*x+y*y)}
  var SNAP=80;
  var rhist=[];function snap(){rhist.length=0;hist.push(JSON.stringify({s:d.s,u:d.u,np:d.np,pt:d.pt,pe:d.pe,en:d.en}));if(hist.length>30)hist.shift();if(ub)ub.disabled=false}
  function redo(){if(!rhist.length)return;stop();hist.push(JSON.stringify({s:d.s,u:d.u,np:d.np,pt:d.pt,pe:d.pe,en:d.en}));var o=JSON.parse(rhist.pop());d.s=o.s;d.u=o.u;d.np=o.np;d.pt=o.pt;d.pe=o.pe;if(o.en!==undefined)d.en=o.en;part=Math.min(part,d.np);sel=-1;save();bar();paint();if(w.onen)w.onen();setSt("Refeito às "+hora())}
  function undo(){if(!hist.length)return;stop();rhist.push(JSON.stringify({s:d.s,u:d.u,np:d.np,pt:d.pt,pe:d.pe,en:d.en}));var o=JSON.parse(hist.pop());d.s=o.s;d.u=o.u;d.np=o.np;d.pt=o.pt;d.pe=o.pe;if(o.en!==undefined)d.en=o.en;part=Math.min(part,d.np);sel=-1;save();bar();paint();if(w.onen)w.onen();setSt("Desfeito às "+hora())}
  function emOk(kind,o){
    if(!U&&(o.n||1)!==part)return false;
    if(efil==="all")return true;
    if(kind==="e")return efil==="en";
    if(kind==="s")return efil==="pa"||efil==="p"+o.c;
    return efil==="ua"||efil==="u:"+o.t||efil==="p"+o.p}
  function lastEnd(c,pt){var b=null,bn=0;d.s.forEach(function(q){var n=q.n||1;if(q.c===c&&n<pt&&n>=bn&&q.p.length){bn=n;b=q.p[q.p.length-1]}});return b}
  function relink(c,n,end){var nx=null,nn=1e9;d.s.forEach(function(q){var k=q.n||1;if(q.c===c&&k>n&&k<nn&&q.p.length){nn=k;nx=q}});if(nx)nx.p[0]=[end[0],end[1]]}
  function erase(p){
    var out=[];
    d.s.forEach(function(q){
      if(!emOk("s",q)){out.push(q);return}
      if(q.p.length<2){if(Math.hypot(q.p[0][0]-p[0],q.p[0][1]-p[1])>R)out.push(q);return}
      var hit=false,runs=[],run=[q.p[0]];
      for(var i=1;i<q.p.length;i++){
        if(dseg(p,q.p[i-1],q.p[i])>R){if(!run.length)run=[q.p[i-1]];run.push(q.p[i])}
        else{hit=true;if(run.length>1)runs.push(run);run=[]}
      }
      if(run.length>1)runs.push(run);
      if(!hit){out.push(q);return}
      runs.forEach(function(r){out.push({c:q.c,n:q.n,p:r})})
    });
    if(OPEN){var kill=[];(d.en||[]).forEach(function(e,ie){var nr=[];(e.rt||[]).forEach(function(q){if(!emOk("e",q)){nr.push(q);return}
        if(q.p.length<2){if(Math.hypot(q.p[0][0]-p[0],q.p[0][1]-p[1])>R)nr.push(q);return}
        var run=[q.p[0]],hit=false,runs=[];for(var i=1;i<q.p.length;i++){if(dseg(p,q.p[i-1],q.p[i])>R){if(!run.length)run=[q.p[i-1]];run.push(q.p[i])}else{hit=true;if(run.length>1)runs.push(run);run=[]}}
        if(run.length>1)runs.push(run);if(!hit){nr.push(q);return}runs.forEach(function(r){nr.push({n:q.n,p:r})})});
      e.rt=nr;if((efil==="all"||efil==="en")&&Math.hypot(e.x-p[0],e.y-p[1])<=R*.7)kill.push(ie)});
      for(var kk=kill.length-1;kk>=0;kk--)rmEn(d,kill[kk]);if(kill.length&&w.onen)w.onen()}
    d.s=out;d.u=d.u.filter(function(u){return !(emOk("u",u)&&Math.hypot(u.x-p[0],u.y-p[1])<=R)});sel=-1;
  }
  var ud=-1;
  svg.onpointerdown=function(e){
    if(mode==="rep")return;
    var p=pt(e);
    if(RO){if(U){var t0=e.target.closest("[data-k=u]");pickU(t0?+t0.dataset.i:-1)}return}
    if(LOCK)return;
    if(U&&tool.k!=="erase"){var tu=e.target.closest("[data-k=u]");if(tu){snap();ud=+tu.dataset.i;sel=ud;svg.setPointerCapture(e.pointerId);paint();return}}
    if(tool.k==="wall"){wcA=wlOf(m,FLOOR);wc=[p];wcA.push(wc);svg.setPointerCapture(e.pointerId);frame();return}
    if(tool.k==="wallx"){var nw=nearWall(m,p,FLOOR);if(nw>=0){wlOf(m,FLOOR).splice(nw,1);save();frame()}return}
    if(tool.k==="en"){var te=e.target.closest("[data-en]");if(te){snap();ed2=+te.dataset.en;svg.setPointerCapture(e.pointerId);return}snap();d.en=d.en||[];d.en.push({x:p[0],y:p[1],a:0,r:160,f:70,rt:[]});save();frame();if(w.onen)w.onen();return}
    if(tool.k==="enx"){var tx=e.target.closest("[data-en]");if(tx){snap();rmEn(d,+tx.dataset.en);save();frame();if(w.onen)w.onen()}return}
    if(tool.k==="enr"){var en0=(d.en||[])[ei];if(!en0){setSt("Coloque um inimigo primeiro (ferramenta Inimigo).");return}
      var st0=enEnd(en0,part);if(Math.hypot(st0[0]-p[0],st0[1]-p[1])>SNAP*1.5){setSt("Comece perto de onde o Inimigo "+(ei+1)+" está nesta parte (círculo tracejado no mapa).");return}
      snap();en0.rt=en0.rt||[];var olds2=en0.rt.filter(function(r){return(r.n||1)===part});
      if(olds2.length){ecs=olds2[0];eOld=ecs.p;ecs.p=[[st0[0],st0[1]]];var dd2=olds2.slice(1);en0.rt=en0.rt.filter(function(r){return dd2.indexOf(r)<0})}
      else{ecs={n:part,p:[[st0[0],st0[1]]]};eOld=null;en0.rt.push(ecs)}
      ecsE=en0;svg.setPointerCapture(e.pointerId);paint();return}
    if(tool.k==="mouse"){var t=e.target.closest("[data-k=u]");pickU(t?+t.dataset.i:-1);return}
    if(tool.k==="erase"){er=true;snap();svg.setPointerCapture(e.pointerId);erase(p);paint();ringAt(p);return}
    if(tool.k==="util"){snap();d.u.push(U?{t:tool.t,x:p[0],y:p[1]}:{t:tool.t,x:p[0],y:p[1],p:who,n:part});if(U)sel=d.u.length-1;save();paint();return}
    var pi=tool.i;
    if(part>1){var pe0=lastEnd(pi,part);if(pe0){if(Math.hypot(pe0[0]-p[0],pe0[1]-p[1])>SNAP){setSt("Comece perto de onde a parte anterior terminou (círculo tracejado no mapa).");return}p=[pe0[0],pe0[1]]}}
    snap();
    var olds=d.s.filter(function(q){return q.c===pi&&(q.n||1)===part});
    if(olds.length){cs=olds[0];oldP=cs.p;cs.p=[p];dupl=olds.slice(1)}
    else{cs={c:pi,n:part,p:[p]};d.s.push(cs);oldP=null;dupl=[]}
    svg.setPointerCapture(e.pointerId);paint()};
  svg.onpointermove=function(e){
    if(mode==="rep")return;
    var p=pt(e);
    if(ud>=0&&d.u[ud]){d.u[ud].x=Math.max(0,Math.min(1000,p[0]));d.u[ud].y=Math.max(0,Math.min(1000,p[1]));paint();return}
    if(wc){var l0=wc[wc.length-1];if(Math.hypot(p[0]-l0[0],p[1]-l0[1])>6){wc.push(p);frame()}return}
    if(ed2>=0&&d.en[ed2]){var en2=d.en[ed2];en2.x=p[0];en2.y=p[1];var r1e=(en2.rt||[]).filter(function(r){return(r.n||1)===1})[0];if(r1e&&r1e.p.length)r1e.p[0]=[p[0],p[1]];frame();return}
    if(ecs){var l1=ecs.p[ecs.p.length-1];if(Math.abs(p[0]-l1[0])+Math.abs(p[1]-l1[1])>5){ecs.p.push(p);paint()}return}
    if(tool.k==="erase"){if(er){erase(p);paint()}ringAt(p);return}
    if(!cs)return;var l=cs.p[cs.p.length-1];if(Math.abs(p[0]-l[0])+Math.abs(p[1]-l[1])>6){cs.p.push(p);paint()}};
  svg.onpointerleave=function(){ring.style.display="none"};
  svg.onpointerup=svg.onpointercancel=function(){
    if(ud>=0){ud=-1;save();paint();return}
    if(wc){if(wc.length<2&&wcA)wcA.pop();wc=null;wcA=null;save();frame();return}
    if(ecs){if(ecs.p.length<2){if(eOld)ecs.p=eOld;else ecsE.rt.splice(ecsE.rt.indexOf(ecs),1);hist.pop();if(ub)ub.disabled=!hist.length}else{fixR(ecs,(ecsE.rt||[]).filter(function(x){return x!==ecs}),enF(ecsE,ecs.n||1));relinkEn(ecsE,ecs.n||1,ecs.p[ecs.p.length-1])}ecs=null;eOld=null;save();paint();return}
    if(ed2>=0){ed2=-1;save();if(w.onen)w.onen();return}
    if(er){er=false;save();paint();return}
    if(cs){if(cs.p.length<2){if(oldP)cs.p=oldP;else d.s.pop();hist.pop();if(ub)ub.disabled=!hist.length}else{if(dupl.length)d.s=d.s.filter(function(q){return dupl.indexOf(q)<0});fixR(cs,d.s.filter(function(x){return x.c===cs.c&&x!==cs}),floorAtD(d,cs.c,cs.n||1));relink(cs.c,cs.n||1,cs.p[cs.p.length-1])}cs=null;oldP=null;dupl=[];save();paint()}};
  (function(){pbtn=el("button",{class:"b"});pbtn.textContent="Play";pbtn.onclick=function(){tm?stop():play()};
    var rb=el("button",{class:"b"});rb.textContent="Reiniciar";rb.onclick=function(){stop();unbranch();tt=0;paint()};
    scSl=scrub(function(v){stop();pending=null;ovl.style.display="none";tt=v;frame();clock()});
    strip=tstrip(function(){return lu()},function(x){stop();tt=x;frame();clock()},function(){var S=sched(),o=[];for(var k=1;k<=d.np;k++)o.push({t:S.T[k],n:k});return o});var sw=el("div");sw.style.cssText="flex:1;min-width:140px";sw.appendChild(scSl);sw.appendChild(strip);
    scT=el("span",{class:"hint"});scr.appendChild(rb);scr.appendChild(pbtn);scr.appendChild(sw);scr.appendChild(scT)})();
  bar();paint();
  if(!U){szr.appendChild(szCtl(function(){frame()}));dropUI()}w.appendChild(sub);w.appendChild(tb);if(!U)w.appendChild(szr);w.appendChild(insw);w.appendChild(cmdw);w.appendChild(info);if(hasFl(m))wrap.appendChild(fvCtl(m,function(){frame()}));wrap.appendChild(svg);wrap.appendChild(ovl);w.appendChild(wrap);if(!U)w.appendChild(scr);if(OPEN)w.appendChild(fcEl);if(U)w.appendChild(list);else{w.appendChild(stl);w.appendChild(dropw)}w.rf=function(){paint()};return w;
}
;
/* parte 3 de 5 */
function fitBox(m,cb){
  var src=radarOf(m);if(!src){setSt("Este mapa ainda não tem imagem de radar.");return}
  var im=new Image();im.onerror=function(){setSt("Não consegui abrir a imagem do radar.")};
  im.onload=function(){var N=256,c=document.createElement("canvas");c.width=c.height=N;var x=c.getContext("2d",{willReadFrequently:true});x.fillStyle="#000";x.fillRect(0,0,N,N);x.drawImage(im,0,0,N,N);
    var D;try{D=x.getImageData(0,0,N,N).data}catch(e){setSt("Não consegui ler os pixels do radar.");return}
    var col=new Array(N).fill(0),row=new Array(N).fill(0);
    for(var y=0;y<N;y++)for(var xx=0;xx<N;xx++){var i=(y*N+xx)*4;if(D[i]+D[i+1]+D[i+2]>150){col[xx]++;row[y]++}}
    var x0=0,x1=N-1,y0=0,y1=N-1;while(x0<N&&col[x0]<3)x0++;while(x1>0&&col[x1]<3)x1--;while(y0<N&&row[y0]<3)y0++;while(y1>0&&row[y1]<3)y1--;
    if(x1<=x0||y1<=y0){setSt("Não achei o desenho do mapa na imagem.");return}
    var k=1000/N,bw=(x1-x0+1)*k,bh=(y1-y0+1)*k,z=Math.max(1,Math.min(4,Math.min(1000/(bw*1.06),1000/(bh*1.06))));
    cb({z:z,cx:(x0+x1+1)/2*k,cy:(y0+y1+1)/2*k})};
  im.src=src}
function zoomUI(m){
  var w=el("div",{class:"uc"}),h=el("strong"),row=el("div",{class:"row"}),hint=el("p",{class:"hint"});
  w.style.flexBasis="100%";w.style.marginTop="8px";
  h.textContent="Tamanho do mapa (só o Player 1)";
  hint.textContent="Aumenta só o desenho do mapa (a margem preta sai da tela). Utilitárias, rotas, respawns, callouts e movimentos acompanham sozinhos, porque tudo é desenhado na mesma escala. Nunca passa da borda da imagem.";
  function cur(){var z=zmOf(m);return z?{z:z.z||1,cx:z.cx==null?500:z.cx,cy:z.cy==null?500:z.cy}:{z:1,cx:500,cy:500}}
  function put(v){v.z=Math.max(1,Math.min(4,+v.z||1));var hf=500/v.z;v.cx=Math.max(hf,Math.min(1000-hf,v.cx));v.cy=Math.max(hf,Math.min(1000-hf,v.cy));
    v.z=Math.round(v.z*1000)/1000;v.cx=Math.round(v.cx);v.cy=Math.round(v.cy);
    if(v.z<=1.001){delete m.zm;if(m.__b)delete m.__b.zm}else{m.zm=v;if(m.__b)m.__b.zm=cpy(v)}
    mark("dados.json",JSON.stringify(BASE),KEY);persistDirty();setSt("Tamanho do mapa salvo neste aparelho. Use Publicar para o time ver.");render()}
  var pc=el("input",{type:"number",min:100,max:400,step:5,"aria-label":"Tamanho do mapa em porcentagem"});pc.value=Math.round(cur().z*100);pc.style.width="84px";
  pc.onchange=function(){var v=cur();v.z=(parseFloat(pc.value)||100)/100;put(v)};
  function btn2(t,fn,cl){var b=el("button",{class:cl||"b",type:"button"});b.textContent=t;b.onclick=fn;return b}
  var pc2=el("span",{class:"hint"});pc2.textContent="%";
  row.appendChild(pc);row.appendChild(pc2);
  row.appendChild(btn2("−10%",function(){var v=cur();v.z=v.z-0.1;put(v)}));
  row.appendChild(btn2("+10%",function(){var v=cur();v.z=v.z+0.1;put(v)}));
  row.appendChild(btn2("Ajustar ao mapa",function(){fitBox(m,put)},"b primary"));
  row.appendChild(btn2("100% (original)",function(){put({z:1,cx:500,cy:500})}));
  var pr=el("div",{class:"row"});
  [["◀",-1,0],["▲",0,-1],["▼",0,1],["▶",1,0]].forEach(function(a){pr.appendChild(btn2(a[0],function(){var v=cur(),st=(1000/v.z)*0.08;v.cx+=a[1]*st;v.cy+=a[2]*st;put(v)}))});
  var pl=el("span",{class:"hint"});pl.textContent="Mover a parte que aparece:";pr.insertBefore(pl,pr.firstChild);
  w.appendChild(h);w.appendChild(hint);w.appendChild(row);w.appendChild(pr);return w}
function radarBox(m){var r=radarBox0(m);if(VIEW==="p1"&&UNL.p1&&CAN)r.appendChild(zoomUI(m));return r}
function radarBox0(m){
  var r=el("div",{class:"row edt"});r.style.marginBottom="14px";
  if(ASSETS){
    var f=el("input",{type:"file",accept:"image/*",hidden:""});f.style.display="none";
    var up=el("button",{class:"b"});up.textContent=(radarOf(m)?"Trocar":"Enviar")+" imagem do radar de "+(m.name||"mapa");
    up.onclick=function(){f.click()};
    f.onchange=function(){if(f.files[0])ASSETS.upload(f.files[0]).then(function(x){m.radar=x.id;save();render()}).catch(function(){setSt("Não consegui enviar a imagem.")})};
    r.appendChild(up);r.appendChild(f);
    if(m.radar){var rm=el("button",{class:"b danger"});rm.textContent="Tirar radar";rm.onclick=function(){delete m.radar;save();render()};r.appendChild(rm)}
  }else if(!radarOf(m)){var h=el("span",{class:"hint"});h.textContent="Sem imagem do radar de "+(m.name||"mapa")+". Um editor pode enviar a imagem aqui.";r.appendChild(h)}
  var sc=field("input",String(scaleOf(m)),"Escala do radar",function(v){var n=parseFloat(String(v).replace(",","."));if(n>0)m.sc=n});sc.style.width="80px";
  var lb=el("span",{class:"hint"});lb.textContent="Escala do radar (unidades por pixel, usada no timer):";r.appendChild(lb);r.appendChild(sc);if(!m.radar&&radarOf(m)){var bh=el("span",{class:"hint"});bh.textContent=" Radar embutido no app (envie outra imagem para trocar).";r.appendChild(bh)};
  return r}
function photo(o,key,label,mx,cls){
  var w=el("div",{class:"ph"});
  function draw(){w.innerHTML="";
    if(o[key]){var im=el("img",{class:cls||"thumb",alt:label});im.src=o[key];w.appendChild(im)}
    var f=el("input",{type:"file",accept:"image/*"});f.style.display="none";
    var b=el("button",{class:"b"});b.textContent=o[key]?"Trocar foto":label;b.onclick=function(){f.click()};
    f.onchange=function(){if(f.files[0])ASSETS.upload(f.files[0],mx).then(function(x){o[key]=x.id;save();draw()}).catch(function(){setSt("Não consegui carregar a imagem.")})};
    w.appendChild(b);w.appendChild(f);
    if(o[key]){var r=el("button",{class:"b danger"});r.textContent="Tirar";r.onclick=function(){delete o[key];save();draw()};w.appendChild(r)}}
  draw();return w}
function mapPick(o){
  var w=el("div"),sl=el("select",{class:"sel","aria-label":"Mapa"}),box=el("div");
  [["","Escolher mapa"]].concat(S.maps.map(function(m){return[m.name,m.name]})).concat([["__o","Outro (escrever o nome)"]]).forEach(function(x){var e=el("option",{value:x[0]});e.textContent=x[1];if((o.map||"")===x[0])e.selected=true;sl.appendChild(e)});
  function show(){box.innerHTML="";
    if(o.map==="__o")box.appendChild(field("input",o.mt||"","Nome do mapa",function(v){o.mt=v}));
    else if(o.map){var m=S.maps.filter(function(x){return x.name===o.map})[0];
      if(m&&radarOf(m)){var im=el("img",{class:"thumb",alt:m.name});im.src=radarOf(m);box.appendChild(im)}
      else{var t=el("div",{class:"mname"});t.textContent=o.map;box.appendChild(t)}}}
  sl.onchange=function(){o.map=sl.value;save();show()};
  w.appendChild(sl);w.appendChild(box);show();return w}
function pickL(label,opts,val,fn){
  var wr=el("label",{class:"sl"}),sl=el("select",{class:"sel"});wr.appendChild(document.createTextNode(label+" "));
  opts.forEach(function(o){var e=el("option",{value:o[0]});e.textContent=o[1];if(String(o[0])===String(val))e.selected=true;sl.appendChild(e)});
  sl.onchange=function(){fn(sl.value)};wr.appendChild(sl);return wr}
function rmBtn(txt,q,fn){var b=el("button",{class:"b danger"});b.textContent=txt;b.onclick=function(){ask(q,fn)};return b}
var MAPPOS={dust2:[-2476,3239,4.4],mirage:[-3230,1713,5],ancient:[-2953,2164,5],anubis:[-2796,3328,5.22],inferno:[-2087,3870,4.9],nuke:[-3453,2887,7],overpass:[-4831,1781,5.2],train:[-2308,2078,4.082077],vertigo:[-3168,1762,4],cache:[-2000,3250,5.5]};
var DEM2JSON="#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n\"\"\"\ndem2json.py - converte uma demo .dem do CS2 no .json da aba \"Demo 2D\" do site.\n\nComo usar (no seu computador, o navegador nao le .dem direto):\n    pip install demoparser2 pandas\n    python dem2json.py minha_demo.dem            -> gera minha_demo.json\n    python dem2json.py minha_demo.dem saida.json --hz 4\n\n--hz = quantas posicoes por segundo salvar (4 e um bom meio-termo; 8 fica mais\nsuave, mas o arquivo fica maior).\n\nDepois, no site: aba \"Demo 2D\" > \"Carregar demo (.json)\".\n\"\"\"\nimport argparse\nimport json\nimport math\nimport re\nimport sys\n\nimport pandas as pd\nfrom demoparser2 import DemoParser\n\nTICKRATE = 64\n\n\ndef norm_team(v):\n    s = str(v).strip().upper()\n    if s in (\"3\", \"CT\", \"COUNTERTERRORIST\", \"COUNTER-TERRORIST\"):\n        return \"CT\"\n    if s in (\"2\", \"T\", \"TERRORIST\"):\n        return \"T\"\n    return \"\"\n\n\ndef norm_nade(name):\n    s = str(name).lower()\n    if \"decoy\" in s:\n        return \"decoy\"\n    if \"smoke\" in s:\n        return \"smoke\"\n    if \"molotov\" in s or \"incend\" in s or \"inferno\" in s:\n        return \"molotov\"\n    if \"flash\" in s:\n        return \"flash\"\n    if \"hegrenade\" in s or s in (\"he\", \"he_grenade\") or \"highexplosive\" in s:\n        return \"he\"\n    return \"\"\n\n\ndef pick(df, *names):\n    \"\"\"Acha o nome real de uma coluna, sem diferenciar maiuscula/minuscula.\"\"\"\n    low = {str(c).lower(): c for c in df.columns}\n    for n in names:\n        if n.lower() in low:\n            return low[n.lower()]\n    return None\n\n\ndef sid(v):\n    if v is None or (isinstance(v, float) and pd.isna(v)):\n        return \"\"\n    try:\n        return str(int(v))\n    except (ValueError, TypeError):\n        return str(v)\n\n\nDET_EVENTS = ((\"hegrenade_detonate\", \"he\"), (\"flashbang_detonate\", \"flash\"),\n              (\"smokegrenade_detonate\", \"smoke\"), (\"molotov_detonate\", \"molotov\"))\n\n\ndef get_events(p, name):\n    try:\n        df = p.parse_event(name)\n        return df if df is not None else pd.DataFrame()\n    except Exception:\n        return pd.DataFrame()\n\n\ndef read_events(p):\n    \"\"\"Le os eventos de explosao (hora e lugar certos) e de fim de efeito.\"\"\"\n    def rows(name):\n        df = get_events(p, name)\n        out = []\n        if not len(df):\n            return out\n        cx, cy, cz = pick(df, \"x\"), pick(df, \"y\"), pick(df, \"z\")\n        ce = pick(df, \"entityid\", \"entity_id\")\n        cw = pick(df, \"user_steamid\", \"steamid\")\n        if not (cx and cy):\n            return out\n        for _, r in df.iterrows():\n            out.append(dict(tick=int(r[\"tick\"]), x=float(r[cx]), y=float(r[cy]),\n                            z=float(r[cz]) if cz else 0.0,\n                            ent=sid(r[ce]) if ce else \"\", who=sid(r[cw]) if cw else \"\"))\n        return out\n    dets = []\n    for name, ty in DET_EVENTS:\n        for d in rows(name):\n            d[\"ty\"] = ty\n            dets.append(d)\n    burns = rows(\"inferno_startburn\")\n    if not any(d[\"ty\"] == \"molotov\" for d in dets):\n        for d in burns:\n            d[\"ty\"] = \"molotov\"\n            dets.append(d)\n    exps = {\"smoke\": rows(\"smokegrenade_expired\"), \"molotov\": rows(\"inferno_expire\")}\n    return dets, exps, burns\n\n\ndef make_segments(gr):\n    \"\"\"Cada granada vira um trecho continuo. Corta quando o rastro da um salto\n    (entidade reaproveitada por outra granada) para nao juntar granadas diferentes.\"\"\"\n    segs = []\n    if not len(gr):\n        return segs\n    cE = pick(gr, \"grenade_entity_id\", \"entity_id\", \"entityid\")\n    cT = pick(gr, \"grenade_type\", \"type\")\n    cX, cY, cZ = pick(gr, \"x\"), pick(gr, \"y\"), pick(gr, \"z\")\n    cB = pick(gr, \"thrower_steamid\", \"steamid\", \"thrower\")\n    if not (cE and cT and cX and cY):\n        print(\"Aviso: nao entendi as colunas de granadas:\", list(gr.columns))\n        return segs\n    keys = [cE, cT] + ([cB] if cB else [])\n    for _, g in gr.groupby(keys):\n        g = g.sort_values(\"tick\")\n        ty = norm_nade(g[cT].iloc[0])\n        if not ty:\n            continue\n        ent = sid(g[cE].iloc[0])\n        by = sid(g[cB].iloc[0]) if cB else \"\"\n        ticks, xs, ys = g[\"tick\"].tolist(), g[cX].tolist(), g[cY].tolist()\n        zs = g[cZ].tolist() if cZ else [0.0] * len(ticks)\n        cur = []\n        for i in range(len(ticks)):\n            x, y, z = float(xs[i]), float(ys[i]), float(zs[i])\n            if x != x or y != y:\n                continue\n            if cur and (int(ticks[i]) - cur[-1][0] > 16 or\n                        math.hypot(x - cur[-1][1], y - cur[-1][2]) > 250):\n                if len(cur) >= 2:\n                    segs.append(dict(ty=ty, by=by, ent=ent, pts=cur, first=cur[0][0], last=cur[-1][0]))\n                cur = []\n            cur.append((int(ticks[i]), x, y, z))\n        if len(cur) >= 2:\n            segs.append(dict(ty=ty, by=by, ent=ent, pts=cur, first=cur[0][0], last=cur[-1][0]))\n    return segs\n\n\ndef thin(pts):\n    return [q for i, q in enumerate(pts) if i % 2 == 0 or i == len(pts) - 1]\n\n\ndef build_nades(gr, dets, exps, burns):\n    segs = make_segments(gr)\n    used = set()\n    nades = []\n    for ev in sorted(dets, key=lambda d: d[\"tick\"]):\n        best, bk = None, None\n        for i, sg in enumerate(segs):\n            if i in used or sg[\"ty\"] != ev[\"ty\"]:\n                continue\n            if ev[\"tick\"] < sg[\"first\"] - 4 or ev[\"tick\"] > sg[\"last\"] + TICKRATE * 3:\n                continue\n            pt = min(sg[\"pts\"], key=lambda q: abs(q[0] - ev[\"tick\"]))\n            d = math.hypot(pt[1] - ev[\"x\"], pt[2] - ev[\"y\"])\n            same = bool(ev[\"ent\"]) and sg[\"ent\"] == ev[\"ent\"]\n            if d > 250 and not same:\n                continue\n            k = (0 if same else 1, d)\n            if bk is None or k < bk:\n                best, bk = i, k\n        pts, by = [], ev[\"who\"]\n        if best is not None:\n            used.add(best)\n            sg = segs[best]\n            pts = [q for q in sg[\"pts\"] if q[0] <= ev[\"tick\"]]\n            if pts and pts[-1][0] < ev[\"tick\"]:\n                pts.append((ev[\"tick\"], ev[\"x\"], ev[\"y\"], ev[\"z\"]))\n            by = sg[\"by\"] or ev[\"who\"]\n            pts = thin(pts)\n        # fim do efeito\n        t2 = None\n        if ev[\"ty\"] == \"smoke\":\n            c = [e for e in exps[\"smoke\"] if e[\"tick\"] > ev[\"tick\"] and\n                 ((ev[\"ent\"] and e[\"ent\"] == ev[\"ent\"]) or math.hypot(e[\"x\"] - ev[\"x\"], e[\"y\"] - ev[\"y\"]) < 80)]\n            if c:\n                t2 = min(e[\"tick\"] for e in c)\n        elif ev[\"ty\"] == \"molotov\":\n            bs = [b for b in burns if -2 * TICKRATE <= b[\"tick\"] - ev[\"tick\"] <= 4 * TICKRATE and\n                  math.hypot(b[\"x\"] - ev[\"x\"], b[\"y\"] - ev[\"y\"]) < 250]\n            if bs:\n                b = min(bs, key=lambda q: abs(q[\"tick\"] - ev[\"tick\"]))\n                c = [e for e in exps[\"molotov\"] if e[\"tick\"] > b[\"tick\"] and e[\"ent\"] == b[\"ent\"]]\n                if c:\n                    t2 = min(e[\"tick\"] for e in c)\n        nades.append(dict(ty=ev[\"ty\"], by=by, pts=pts, t1=ev[\"tick\"], t2=t2,\n                          x=ev[\"x\"], y=ev[\"y\"], z=ev[\"z\"]))\n    # tipos sem evento nenhum na demo: estima pelo rastro\n    have = set(d[\"ty\"] for d in dets)\n    for i, sg in enumerate(segs):\n        if sg[\"ty\"] in have or i in used:\n            continue\n        pts = sg[\"pts\"]\n        land = len(pts) - 1\n        for k in range(len(pts) - 1):\n            if math.hypot(pts[k + 1][1] - pts[k][1], pts[k + 1][2] - pts[k][2]) < 1.0:\n                land = k\n                break\n        if sg[\"ty\"] in (\"he\", \"flash\"):\n            t1 = pts[0][0] + int(1.6 * TICKRATE)\n        else:\n            t1 = pts[land][0]\n        cut = thin([q for q in pts if q[0] <= t1])\n        if len(cut) < 2:\n            continue\n        t2 = t1 + 18 * TICKRATE if sg[\"ty\"] == \"smoke\" else (t1 + 7 * TICKRATE if sg[\"ty\"] == \"molotov\" else None)\n        nades.append(dict(ty=sg[\"ty\"], by=sg[\"by\"], pts=cut, t1=t1, t2=t2,\n                          x=cut[-1][1], y=cut[-1][2], z=cut[-1][3]))\n    return nades\n\n\ndef round_nade(n, s, players):\n    t1 = round((n[\"t1\"] - s) / TICKRATE, 2)\n    path = [[round((tk - s) / TICKRATE, 2), round(x, 1), round(y, 1), round(z, 1)]\n            for tk, x, y, z in n[\"pts\"]]\n    ok = len(path) >= 2\n    if ok and n[\"by\"]:\n        pl = next((q for q in players if q[\"id\"] == n[\"by\"]), None)\n        if pl and pl[\"f\"]:\n            f = min(pl[\"f\"], key=lambda fr: abs(fr[0] - path[0][0]))\n            # o arremesso sai de onde o jogador esta; se estiver longe, e trecho de outra granada\n            if abs(f[0] - path[0][0]) < 1.5 and math.hypot(f[1] - path[0][1], f[2] - path[0][2]) > 600:\n                ok = False\n    if not ok:\n        path = []\n    d = {\"type\": n[\"ty\"], \"by\": n[\"by\"], \"t0\": path[0][0] if path else t1, \"t1\": t1,\n         \"x\": round(n[\"x\"], 1), \"y\": round(n[\"y\"], 1), \"path\": path}\n    if n.get(\"t2\") is not None:\n        d[\"t2\"] = round((n[\"t2\"] - s) / TICKRATE, 2)\n    return d\n\n\ndef main():\n    ap = argparse.ArgumentParser()\n    ap.add_argument(\"demo\")\n    ap.add_argument(\"saida\", nargs=\"?\")\n    ap.add_argument(\"--hz\", type=int, default=4)\n    a = ap.parse_args()\n    out_path = a.saida or (a.demo.rsplit(\".\", 1)[0] + \".json\")\n    step = max(1, TICKRATE // max(1, a.hz))\n\n    p = DemoParser(a.demo)\n    try:\n        map_name = p.parse_header().get(\"map_name\", \"\") or \"\"\n    except Exception:\n        map_name = \"\"\n\n    # --- limites dos rounds (ignora aquecimento: so conta depois do ultimo inicio de partida)\n    first_tick = 0\n    try:\n        bm = p.parse_event(\"begin_new_match\")\n        if len(bm):\n            first_tick = int(bm[\"tick\"].max())\n    except Exception:\n        pass\n    fe = p.parse_event(\"round_freeze_end\")\n    re_ = p.parse_event(\"round_end\")\n    fe_ticks = sorted(int(t) for t in fe[\"tick\"] if int(t) >= first_tick)\n    ends = re_[re_[\"tick\"] >= first_tick].sort_values(\"tick\")\n\n    rounds_meta = []  # (inicio, fim, vencedor)\n    prev_end = first_tick\n    for _, row in ends.iterrows():\n        end = int(row[\"tick\"])\n        starts = [t for t in fe_ticks if prev_end <= t < end]\n        if starts:\n            rounds_meta.append((starts[-1], end, norm_team(row.get(\"winner\", \"\"))))\n        prev_end = end\n    if not rounds_meta:\n        sys.exit(\"Nao achei nenhum round nessa demo.\")\n\n    # --- posicoes dos jogadores (todos os rounds de uma vez)\n    wanted = []\n    for s, e, _ in rounds_meta:\n        wanted.extend(range(s, e + 1, step))\n    props = [\"X\", \"Y\", \"Z\", \"yaw\", \"health\", \"team_num\", \"name\", \"steamid\"]\n    pos = p.parse_ticks(props, ticks=sorted(set(wanted)))\n    pos = pos.copy()\n    pos[\"steamid\"] = pos[\"steamid\"].map(sid)\n    pos = pos[pos[\"steamid\"] != \"\"]\n\n    # --- abates\n    try:\n        kills = p.parse_event(\"player_death\", other=[\"total_rounds_played\"])\n    except Exception:\n        kills = p.parse_event(\"player_death\")\n\n    # --- granadas\n    try:\n        gr = p.parse_grenades()\n    except Exception:\n        gr = pd.DataFrame()\n\n    # --- bomba\n    try:\n        bomb = p.parse_event(\"bomb_planted\", player=[\"X\", \"Y\"])\n    except Exception:\n        try:\n            bomb = p.parse_event(\"bomb_planted\")\n        except Exception:\n            bomb = pd.DataFrame()\n\n    dets, exps, burns = read_events(p)\n    NAD = build_nades(gr, dets, exps, burns)\n    rounds = []\n    for i, (s, e, win) in enumerate(rounds_meta):\n        sub = pos[(pos[\"tick\"] >= s) & (pos[\"tick\"] <= e)]\n        players = []\n        for pid, g in sub.groupby(\"steamid\"):\n            g = g.sort_values(\"tick\")\n            team = \"\"\n            for v in g[\"team_num\"]:\n                team = norm_team(v)\n                if team:\n                    break\n            if not team:\n                continue\n            frames = []\n            for _, r in g.iterrows():\n                hp = r[\"health\"]\n                if pd.isna(hp) or hp <= 0:\n                    continue  # depois de morrer o site esconde o jogador\n                frames.append([\n                    round((int(r[\"tick\"]) - s) / TICKRATE, 2),\n                    round(float(r[\"X\"]), 1), round(float(r[\"Y\"]), 1), round(float(r[\"Z\"]), 1),\n                    round(float(r[\"yaw\"]), 1) if not pd.isna(r[\"yaw\"]) else None,\n                    int(hp),\n                ])\n            if frames:\n                players.append({\"id\": pid, \"name\": str(g[\"name\"].iloc[0]), \"team\": team, \"f\": frames})\n\n        # abates do round\n        ks = []\n        if len(kills):\n            kk = kills[(kills[\"tick\"] >= s) & (kills[\"tick\"] <= e)]\n            for _, r in kk.iterrows():\n                ks.append({\n                    \"t\": round((int(r[\"tick\"]) - s) / TICKRATE, 2),\n                    \"k\": sid(r.get(\"attacker_steamid\")),\n                    \"v\": sid(r.get(\"user_steamid\")),\n                    \"w\": str(r.get(\"weapon\", \"\")),\n                    \"hs\": bool(r.get(\"headshot\", False)),\n                })\n\n        # granadas do round: entram pelo momento da explosao\n        nades = [round_nade(n, s, players) for n in NAD if s <= n[\"t1\"] <= e]\n\n        rd = {\n            \"n\": i + 1,\n            \"winner\": win,\n            \"dur\": round((e - s) / TICKRATE, 2),\n            \"players\": players,\n            \"nades\": nades,\n            \"kills\": ks,\n        }\n        if len(bomb):\n            bb = bomb[(bomb[\"tick\"] >= s) & (bomb[\"tick\"] <= e)]\n            if len(bb):\n                b = bb.iloc[0]\n                bx = b.get(\"user_X\", b.get(\"X\"))\n                by = b.get(\"user_Y\", b.get(\"Y\"))\n                if bx is not None and by is not None and not pd.isna(bx):\n                    rd[\"bomb\"] = {\"plant\": {\"t\": round((int(b[\"tick\"]) - s) / TICKRATE, 2),\n                                            \"x\": round(float(bx), 1), \"y\": round(float(by), 1)}}\n        rounds.append(rd)\n\n    data = {\"map\": map_name, \"tickrate\": TICKRATE, \"rounds\": rounds}\n    txt = json.dumps(data, separators=(\",\", \":\"))\n    # NaN/Infinity nao existem em JSON de verdade: troca por null\n    txt = re.sub(r\"(?<=[\\[,:])-?(?:NaN|Infinity)(?=[,\\]}])\", \"null\", txt)\n    with open(out_path, \"w\", encoding=\"utf-8\") as f:\n        f.write(txt)\n    print(\"Pronto: %s (%d rounds)\" % (out_path, len(rounds)))\n\n\nif __name__ == \"__main__\":\n    main()\n";
/* ---------- Demo 2D: abas de demos (salvar no aparelho, GitHub e link) ---------- */
/* ---------- Demo 2D: calibração por cliques ---------- */
function d2d2(a,b){var x=a[0]-b[0],y=a[1]-b[1];return x*x+y*y}
function d2mean(a){var x=0,y=0;a.forEach(function(q){x+=q[0];y+=q[1]});return[x/a.length,y/a.length]}
function d2refs(dd){var T=[],C=[],P=[],R=[];
  (dd.rounds||[]).forEach(function(r){(r.players||[]).forEach(function(p){var f=p.f&&p.f[0];if(!f||f[0]>3)return;(String(p.team).toUpperCase()==="CT"?C:T).push([f[1],f[2]])});var b=r.bomb&&r.bomb.plant;if(b&&b.x!=null)P.push([b.x,b.y])});
  if(T.length)R.push({n:"o centro do spawn dos TR (onde os TR nascem)",w:d2mean(T)});
  if(C.length)R.push({n:"o centro do spawn dos CT (onde os CT nascem)",w:d2mean(C)});
  if(P.length>=2){var a=P[0],b=P.reduce(function(m,q){return d2d2(q,a)>d2d2(m,a)?q:m},P[0]);
    if(Math.sqrt(d2d2(a,b))>500){var A=[],B=[];P.forEach(function(q){(d2d2(q,a)<=d2d2(q,b)?A:B).push(q)});
      var L=[A,B].sort(function(x,y){return y.length-x.length});
      R.push({n:"o ponto onde mais plantaram a bomba (plant "+L[0].length+"x)",w:d2mean(L[0])});
      if(L[1].length)R.push({n:"o outro ponto de plant da bomba ("+L[1].length+"x)",w:d2mean(L[1])})}}
  return R}
/* pts: [{w:[x,y] mundo, s:[sx,sy] clique no mapa 0-1000}] ; sep: zoom X e Y separados */
function d2fit(mp,pts,sep){var a=1000/1024/mp[2],n=pts.length;if(n<2)return null;
  var U=[],V=[],SX=[],SY=[];pts.forEach(function(q){U.push(a*(q.w[0]-mp[0]));V.push(a*(mp[1]-q.w[1]));SX.push(q.s[0]);SY.push(q.s[1])});
  function av(z){var t=0;z.forEach(function(x){t+=x});return t/z.length}
  var mu=av(U),mv=av(V),msx=av(SX),msy=av(SY),nu=0,nv=0,cu=0,cv=0,i;
  for(i=0;i<n;i++){nu+=(U[i]-mu)*(U[i]-mu);nv+=(V[i]-mv)*(V[i]-mv);cu+=(U[i]-mu)*(SX[i]-msx);cv+=(V[i]-mv)*(SY[i]-msy)}
  var kx,ky;
  if(sep){if(nu<1e-6||nv<1e-6)return null;kx=cu/nu;ky=cv/nv}else{if(nu+nv<1e-6)return null;kx=ky=(cu+cv)/(nu+nv)}
  if(!(kx>0.2&&kx<5&&ky>0.2&&ky<5))return null;
  var ox=msx-kx*mu,oy=msy-ky*mv,err=0;
  for(i=0;i<n;i++)err+=Math.hypot(ox+kx*U[i]-SX[i],oy+ky*V[i]-SY[i]);
  return{ox:ox,oy:oy,kx:kx,ky:ky,err:err/n}}
/* ---------- Demo 2D: calibração compartilhada, limpeza de granadas ---------- */
var DEF_CAL={mirage:{ox:-123.57,oy:107.54,k:1.205}},D2CAL={};
function d2canEdit(){return VIEW==="p1"&&CAN}
function d2base(k){var b=D2CAL[k]||DEF_CAL[k]||{},o={ox:+b.ox||0,oy:+b.oy||0,k:+b.k>0?+b.k:1,zc:b.zc||""};if(b.fx)o.fx=b.fx;if(+b.ky>0)o.ky=+b.ky;return o}
function d2ty(t){t=String(t||"").toLowerCase();return(t==="incendiary"||t==="inferno")?"molotov":t==="hegrenade"?"he":t==="flashbang"?"flash":t==="smokegrenade"?"smoke":t}
async function d2pubCal(){if(!d2canEdit())return;if(!isEd()){ghDlg();return}if(busy)return;busy=true;setSt("Publicando a calibração…");
  try{var ix=await getRemote("demos/calibracao.json");if(ix.err)throw ix.err;var cur=(ix.data&&ix.data.cal)||{};
    Object.keys(S.d2c||{}).forEach(function(k){var c=S.d2c[k];if(!(c.ox||c.oy||c.k!==1||c.ky))return;cur[k]={ox:c.ox,oy:c.oy,k:c.k};if(c.ky)cur[k].ky=c.ky;if(c.zc)cur[k].zc=c.zc});
    await d2put("demos/calibracao.json",JSON.stringify({cal:cur}),ix.sha,"Calibração do radar (Demo 2D)");D2CAL=cur;
    setSt("Calibração publicada no GitHub às "+hora()+". Todos os perfis passam a usar.")}catch(e){setSt("Não publicou a calibração: "+emsg(e))}
  busy=false}
/* conserta granadas de demos convertidas antes: separa trechos de granadas diferentes,
   some com as que nao saem de um jogador e corrige a hora da explosao */
function d2prep(j){if(!j||j._fx)return j;j._fx=1;
  (j.rounds||[]).forEach(function(r){var out=[];delete r._d;
    (r.nades||[]).forEach(function(g){var ty=d2ty(g.type),P=g.path&&g.path.length>1?g.path:null;
      if(!P||g.fx){out.push(g);return}
      var pcs=[],cur=[P[0]],i,k;
      for(i=1;i<P.length;i++){var a=P[i-1],b=P[i];if(b[0]-a[0]>0.5||Math.hypot(b[1]-a[1],b[2]-a[2])>250){pcs.push(cur);cur=[]}cur.push(b)}
      pcs.push(cur);
      var pl=(r.players||[]).filter(function(p){return String(p.id)===String(g.by)})[0],pk=null;
      pcs.forEach(function(pc){if(pk||pc.length<2)return;if(!pl||!pl.f||!pl.f.length){pk=pc;return}var q=d2at(pl.f,pc[0][0]);if(!q||Math.hypot(q[1]-pc[0][1],q[2]-pc[0][2])<600)pk=pc});
      if(!pk){if(pl&&pl.f&&pl.f.length)return;pk=pcs[0];if(!pk||pk.length<2){out.push(g);return}}
      var t0=pk[0][0],land=pk[pk.length-1][0],t1=g.t1,t2=g.t2;
      for(k=0;k<pk.length-1;k++){if(Math.hypot(pk[k+1][1]-pk[k][1],pk[k+1][2]-pk[k][2])<1.0){land=pk[k][0];break}}
      if(ty==="he"||ty==="flash"){if(t1-t0>1.9)t1=t0+1.6}
      else if(ty==="smoke"||ty==="molotov"){if(t1-land>0.8){t1=Math.max(land,t0+0.3);if(t2==null)t2=t1+(ty==="smoke"?18:7)}}
      var ng=Object.assign({},g);ng.t0=t0;ng.t1=t1;if(t2!=null)ng.t2=t2;
      ng.path=pk.filter(function(q){return q[0]<=t1});if(ng.path.length<2)ng.path=pk.slice(0,2);
      if(t1!==g.t1||pk!==P){var q2=d2at(pk,t1);if(q2){ng.x=q2[1];ng.y=q2[2]}}
      ng.fx=1;out.push(ng)});
    r.nades=out});
  return j}
var D2T=[],D2C={};
try{D2T=JSON.parse(localStorage.getItem("cs2-d2idx")||"[]")}catch(e){D2T=[]}
function d2idx(){try{localStorage.setItem("cs2-d2idx",JSON.stringify(D2T.filter(function(x){return x.loc})))}catch(e){}}
var D2IDB=null;
function idbOpen(){return new Promise(function(ok,no){if(D2IDB)return ok(D2IDB);if(!window.indexedDB)return no(new Error("este navegador não tem onde guardar demos."));var r=indexedDB.open("cs2-demos",1);r.onupgradeneeded=function(){r.result.createObjectStore("d")};r.onsuccess=function(){D2IDB=r.result;ok(D2IDB)};r.onerror=function(){no(r.error||new Error("armazenamento bloqueado."))}})}
function idbGet(k){return idbOpen().then(function(db){return new Promise(function(ok,no){var q=db.transaction("d").objectStore("d").get(k);q.onsuccess=function(){ok(q.result)};q.onerror=function(){no(q.error)}})})}
function idbPut(k,v){return idbOpen().then(function(db){return new Promise(function(ok,no){var t=db.transaction("d","readwrite");t.objectStore("d").put(v,k);t.oncomplete=function(){ok()};t.onerror=t.onabort=function(){no(t.error||new Error("sem espaço para salvar."))}})})}
function idbDel(k){return idbOpen().then(function(db){return new Promise(function(ok,no){var t=db.transaction("d","readwrite");t.objectStore("d").delete(k);t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)}})})}
function d2ok(j){return!!(j&&Array.isArray(j.rounds)&&j.rounds.length)}
function d2add(j,name){d2prep(j);var id=newUid(),meta={id:id,name:name||"Demo",map:String(j.map||""),n:j.rounds.length,kb:Math.round(JSON.stringify(j).length/1024),loc:false,gh:false};D2T.push(meta);D2C[id]=j;D2.id=id;D2.data=j;return meta}
function d2remote(id){return getRemote("demos/"+id+".json").then(function(r){if(!r.data)throw new Error("não achei esta demo no GitHub.");return r.data})}
function d2get(id){if(D2C[id])return Promise.resolve(D2C[id]);
  return idbGet("d2:"+id).catch(function(){return null}).then(function(v){if(v){D2C[id]=d2prep(v);return v}
    var meta=D2T.filter(function(x){return x.id===id})[0];
    if(meta&&meta.gh)return d2remote(id).then(function(j){D2C[id]=d2prep(j);return j});
    throw new Error("esta demo não está salva neste aparelho. Carregue o arquivo de novo.")})}
function d2saveLoc(meta){var j=D2C[meta.id];if(!j)return Promise.reject(new Error("abra a demo antes de salvar."));return idbPut("d2:"+meta.id,j).then(function(){meta.loc=true;d2idx()})}
async function d2put(p,txt,sha,msg){var body={message:msg,content:b64(txt)};if(sha)body.sha=sha;var h=ghH();h["Content-Type"]="application/json";
  var r=await fetch(apiUrl(p),{method:"PUT",headers:h,body:JSON.stringify(body)});if(!r.ok)throw new Error(ghErr(r));var j=await r.json();return j.content.sha}
function d2sync(cb,force){if(D2.sy&&!force)return;D2.sy=1;
  getRemote("demos/calibracao.json").then(function(r){if(r&&r.data&&r.data.cal){D2CAL=r.data.cal;if(cb)cb()}}).catch(function(){});
  getRemote("demos/index.json").then(function(r){if(!r.data){if(cb)cb();return}
    var L=r.data.demos||[];
    L.forEach(function(x){var a=D2T.filter(function(y){return y.id===x.id})[0];if(a){a.gh=true;if(!a.loc){a.name=x.name;a.map=x.map;a.n=x.n;a.kb=x.kb}}else D2T.push({id:x.id,name:x.name,map:x.map,n:x.n,kb:x.kb,loc:false,gh:true})});
    D2T.forEach(function(y){if(y.gh&&!L.some(function(x){return x.id===y.id}))y.gh=false});
    D2T=D2T.filter(function(y){return y.loc||y.gh||y.id===D2.id});d2idx();if(cb)cb()})}
async function d2pub(meta,done){if(busy)return;if(!isEd()){ghDlg();return}
  var data;try{data=await d2get(meta.id)}catch(e){setSt("Não publicou: "+emsg(e));return}
  var txt=JSON.stringify(data);if(txt.length>50*1048576){setSt("Esta demo passa de 50 MB, o limite seguro do GitHub. Converta de novo com --hz 2.");return}
  busy=true;setSt("Publicando a demo no GitHub…");
  try{var p="demos/"+meta.id+".json",r0=await getRemote(p);if(r0.err)throw r0.err;await d2put(p,txt,r0.sha,"Demo pelo app: "+meta.name);
    var ix=await getRemote("demos/index.json");if(ix.err)throw ix.err;
    var L=((ix.data&&ix.data.demos)||[]).filter(function(x){return x.id!==meta.id});L.push({id:meta.id,name:meta.name,map:meta.map,n:meta.n,kb:meta.kb});
    await d2put("demos/index.json",JSON.stringify({demos:L}),ix.sha,"Lista de demos");
    meta.gh=true;d2idx();setSt("Demo publicada no GitHub às "+hora()+". Quem abrir o site vê ela na aba Demo 2D.")}
  catch(e){setSt("Não publicou: "+emsg(e))}
  busy=false;if(done)done()}
function d2remove(meta,done){ask("Remover a demo \""+meta.name+"\"? Ela sai deste aparelho"+(meta.gh&&isEd()?" e também do GitHub":"")+".",async function(){
  delete D2C[meta.id];try{await idbDel("d2:"+meta.id)}catch(e){}
  if(meta.gh&&isEd()){try{var p="demos/"+meta.id+".json",r0=await getRemote(p);
      if(r0.sha){var h=ghH();h["Content-Type"]="application/json";var rr=await fetch(apiUrl(p),{method:"DELETE",headers:h,body:JSON.stringify({message:"Demo removida pelo app",sha:r0.sha})});if(!rr.ok&&rr.status!==404)throw new Error(ghErr(rr))}
      var ix=await getRemote("demos/index.json");if(ix.data)await d2put("demos/index.json",JSON.stringify({demos:(ix.data.demos||[]).filter(function(x){return x.id!==meta.id})}),ix.sha,"Lista de demos")}
    catch(e){setSt("Saiu daqui, mas não consegui tirar do GitHub: "+emsg(e))}}
  D2T=D2T.filter(function(x){return x.id!==meta.id});d2idx();if(D2.id===meta.id){D2.id=null;D2.data=null}if(done)done()})}
var D2={data:null,r:0,t:0,tm:null,spd:1,focus:"all",lastFl:null};
function d2key(m){return(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
function d2cal(m){S.d2c=S.d2c||{};var k=d2key(m);if(S.d2c[k])return S.d2c[k];var b=d2base(k);if(!d2canEdit())return b;S.d2c[k]=b;return b}
function d2xy(m,x,y){var mp=MAPPOS[d2key(m)];if(!mp)return null;var c=d2cal(m),f=1000/1024;return[c.ox+(x-mp[0])/mp[2]*f*c.k,c.oy+(mp[1]-y)/mp[2]*f*(c.ky||c.k)]}
function d2at(fr,t){if(!fr||!fr.length)return null;if(t<=fr[0][0])return fr[0].slice();var n=fr.length;if(t>=fr[n-1][0])return fr[n-1].slice();
  var lo=0,hi=n-1;while(hi-lo>1){var mid=(lo+hi)>>1;if(fr[mid][0]<=t)lo=mid;else hi=mid}
  var a=fr[lo],b=fr[hi],u=(t-a[0])/Math.max(1e-6,b[0]-a[0]);return[t,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,(a[3]||0)+((b[3]||0)-(a[3]||0))*u,a[4],a[5]]}
function d2dead(R,id){var t=null;(R.kills||[]).forEach(function(k){if(String(k.v)===String(id)&&(t==null||k.t<t))t=k.t});return t}
function d2dur(r){if(r._d)return r._d;var d=+r.dur||0;(r.players||[]).forEach(function(p){var f=p.f||[];if(f.length&&f[f.length-1][0]>d)d=f[f.length-1][0]});(r.nades||[]).forEach(function(g){if(g.t1>d)d=g.t1});(r.kills||[]).forEach(function(k){if(k.t>d)d=k.t});r._d=Math.max(1,d);return r._d}
function d2fl(m,p){var c=d2cal(m);var zc=(c.zc===""||c.zc==null)&&d2key(m)==="nuke"?-495:c.zc;if(zc!==""&&zc!=null&&!isNaN(+zc))return(p[3]||0)>=+zc?1:0;var q=d2xy(m,p[1],p[2]);return q?zoneAt(m,q):null}
function d2focus(m,r,t){var f=D2.focus;if(f==="all")return-1;if(f==="f0")return 0;if(f==="f1")return 1;
  var id=f.slice(2),pl=(r.players||[]).filter(function(p){return String(p.id)===id})[0],fl=null;
  if(pl){var q=d2at(pl.f,t);if(q)fl=d2fl(m,q)}
  if(fl==null)fl=D2.lastFl;D2.lastFl=fl;return fl==null?-1:fl}
function d2sample(m){var mp=MAPPOS[d2key(m)]||MAPPOS.dust2,sc=mp[2],f=1000/1024;
  function W(X,Y){return[Math.round(mp[0]+X/f*sc),Math.round(mp[1]-Y/f*sc)]}
  function path(pts,dt){return pts.map(function(p,i){var w=W(p[0],p[1]);return[i*dt,w[0],w[1],0,p[2],100]})}
  var a=W(480,430),b=W(300,800);
  return{map:"de_"+d2key(m),tickrate:64,rounds:[{n:1,winner:"T",dur:30,
    players:[{id:"t1",name:"T1",team:"T",f:path([[300,800,60],[420,620,60],[500,500,60],[520,470,60]],10)},{id:"t2",name:"T2",team:"T",f:path([[330,820,60],[560,640,60],[650,520,90],[640,440,120]],10)},{id:"c1",name:"CT1",team:"CT",f:path([[520,200,270],[520,300,270],[520,400,270],[520,420,270]],10)}],
    nades:[{type:"smoke",by:"t1",t0:3,t1:8,x:a[0],y:a[1],path:[[3,b[0],b[1],0],[8,a[0],a[1],0]]}],
    kills:[{t:24,k:"t2",v:"c1",w:"ak47",hs:true}]}]}}
function demo2dView(m){
  if(D2.tm){clearInterval(D2.tm);D2.tm=null}
  var tbar=el("div",{class:"tabs",role:"tablist"}),dact=el("div",{class:"def"});
  var w=el("div",{class:"mm"}),svg=mksvg(m),tb=el("div",{class:"tb"}),tc=el("div",{class:"tb edt"}),inf=el("p",{class:"hint"}),feed=el("div",{class:"uc"}),k2=el("div"),
    sl=scrub(function(v){stop();D2.t=v;paint()}),ct=el("span",{class:"hint"}),pb=el("button",{class:"b",type:"button"}),rsel=null;
  var ulr=el("div",{class:"uc"});ulr.style.display="none";
  var life={smoke:18,molotov:7,decoy:15,flash:.45,he:.5};
  function R(){var d=D2.data;return d&&d.rounds&&d.rounds[D2.r]||null}
  function nm(r,id){var p=(r.players||[]).filter(function(x){return String(x.id)===String(id)})[0];return p?p.name:String(id)}
  function stop(){if(D2.tm){clearInterval(D2.tm);D2.tm=null}pb.textContent="Play"}
  function go(){var r=R();if(!r)return;if(D2.t>=d2dur(r))D2.t=0;stop();pb.textContent="Pausar";D2.tm=setInterval(function(){if(svg.isConnected===false){stop();return}D2.t+=.05*D2.spd;var d=d2dur(r);if(D2.t>=d){D2.t=d;stop()}paint()},50);paint()}
  function paint(){
    var r=R(),h=d2Bg(m),mp=MAPPOS[d2key(m)];
    if(D2.impK!==D2.id+"|"+D2.r){D2.impK=D2.id+"|"+D2.r;impBar()}
    if(!r){svg.innerHTML=h;ct.textContent="Nenhuma demo carregada";sl.set(0,0);feed.innerHTML="";k2.innerHTML="";return}
    if(!mp){svg.innerHTML=h;ct.textContent="Este mapa não tem calibração conhecida.";return}
    var t=D2.t,sc=mp[2]*1.024,d=d2dur(r);
    h+=dimSvg(m,d2focus(m,r,t),"d2dm");
    (r.nades||[]).forEach(function(g){var ty=String(g.type||"").toLowerCase();ty=(ty==="incendiary"||ty==="inferno")?"molotov":ty==="hegrenade"?"he":ty==="flashbang"?"flash":ty==="smokegrenade"?"smoke":ty;if(!ICO[ty])return;
      var P0=g.path&&g.path.length?g.path:null,t0=g.t0!=null?g.t0:(P0?P0[0][0]:g.t1);if(t<t0)return;
      if(t<g.t1){var q=P0?d2at(P0,t):[t,g.x,g.y,0],xy=d2xy(m,q[1],q[2]);if(xy)h+='<ellipse cx="'+xy[0]+'" cy="'+xy[1]+'" rx="9" ry="4" fill="#000" opacity=".3"/><g transform="translate('+xy[0]+' '+(xy[1]-14)+') scale(1.7)" opacity=".85">'+ICO[ty]+'</g>';return}
      var gx=g.x!=null?g.x:(P0?P0[P0.length-1][1]:null),gy=g.y!=null?g.y:(P0?P0[P0.length-1][2]:null);if(gx==null)return;var xy2=d2xy(m,gx,gy);if(!xy2)return;
      var age=t-g.t1,L=g.t2!=null?g.t2-g.t1:(life[ty]||1);if(age>=L)return;var tl=L-age,X=xy2[0],Y=xy2[1];
      if(ty==="smoke"){var op=tl<3.5?tl/3.5:1;h+='<circle cx="'+X+'" cy="'+Y+'" r="'+(144/sc)+'" fill="#aab3ba" fill-opacity="'+(.6*op).toFixed(2)+'" stroke="#20272d" stroke-opacity="'+op.toFixed(2)+'" stroke-width="3.5"/>'}
      else if(ty==="molotov"){var s=tl<2?Math.max(.05,tl/2):1;h+='<circle cx="'+X+'" cy="'+Y+'" r="'+(110/sc*s)+'" fill="#f0771c" fill-opacity=".5" stroke="#7a2e00" stroke-width="3.5"/>'}
      else if(ty==="he"){var k=age/L;h+='<circle cx="'+X+'" cy="'+Y+'" r="'+(6+k*30)+'" fill="#ff9d2e" stroke="#ffd27a" stroke-width="2" opacity="'+(1-k).toFixed(2)+'"/>'}
      else if(ty==="flash"){var k3=age/L,gg=8+k3*26,o=1-k3;h+='<circle cx="'+X+'" cy="'+Y+'" r="'+gg+'" fill="#fff" opacity="'+(.3*o).toFixed(2)+'"/><circle cx="'+X+'" cy="'+Y+'" r="'+(gg*.4)+'" fill="#fff" opacity="'+o.toFixed(2)+'"/>'}
      h+='<g transform="translate('+X+' '+Y+') scale(1.6)">'+ICO[ty]+'</g>';if(L>=2)h+=pieSvg(X,Y-(ty==="smoke"?144/sc+22:34),tl/L,UPIE[ty]||"#fff",Math.ceil(tl)+"s",13)});
    var alive={CT:0,T:0};
    (r.players||[]).forEach(function(p){var q=d2at(p.f,t);if(!q)return;var team=String(p.team).toUpperCase()==="CT"?"CT":"T",dt=d2dead(r,p.id),dead=dt!=null&&t>=dt,xy=d2xy(m,q[1],q[2]);if(!xy)return;var col=team==="CT"?"#3b6fd8":"#e0952a";
      if(dead){if(t-dt<=4)h+='<text x="'+xy[0]+'" y="'+(xy[1]+6)+'" font-size="20" font-weight="800" text-anchor="middle" fill="'+col+'" stroke="#000" stroke-width="3" paint-order="stroke" opacity="'+(1-(t-dt)/4).toFixed(2)+'">✕</text>';return}
      alive[team]++;var foc=D2.focus==="p:"+p.id;
      if(q[4]!=null){var a=q[4]*Math.PI/180;h+='<line x1="'+xy[0]+'" y1="'+xy[1]+'" x2="'+(xy[0]+Math.cos(a)*26)+'" y2="'+(xy[1]-Math.sin(a)*26)+'" stroke="'+col+'" stroke-width="4" stroke-linecap="round" opacity=".8"/>'}
      var pf=d2fl(m,q),hf=hasFl(m);h+=(hf?'<g opacity="'+fvOp(pf)+'">'+(foc?fvBadge(xy,pf):""):"")+'<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="'+(foc?13:9)+'" fill="'+col+'" stroke="#fff" stroke-width="'+(foc?4:2.5)+'"/><text x="'+xy[0]+'" y="'+(xy[1]-16)+'" font-size="15" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">'+esc(p.name||p.id)+(hf?(pf===0?" ↓":pf===1?" ↑":""):"")+'</text>'+(hf?"</g>":"");
      if(q[5]!=null)h+='<rect x="'+(xy[0]-10)+'" y="'+(xy[1]+13)+'" width="20" height="4" fill="#000" opacity=".6"/><rect x="'+(xy[0]-10)+'" y="'+(xy[1]+13)+'" width="'+(20*Math.max(0,Math.min(100,q[5]))/100)+'" height="4" fill="#4ade80"/>'});
    var b=r.bomb&&r.bomb.plant;if(b&&t>=b.t){var bx=d2xy(m,b.x,b.y);if(bx)h+=c4Svg(bx[0],bx[1],40-(t-b.t))}
    h+=calMarks();svg.innerHTML=h;sl.set(t,d);
    var sc2={CT:0,T:0};(D2.data.rounds||[]).slice(0,D2.r+1).forEach(function(x){var wn=String(x.winner||"").toUpperCase();if(wn==="CT"||wn==="T")sc2[wn]++});
    ct.textContent="Round "+(r.n||D2.r+1)+" · relógio "+fmtT(Math.max(0,115-t))+" · vivos CT "+alive.CT+" × T "+alive.T+" · placar CT "+sc2.CT+" × "+sc2.T+" T";
    var ks=(r.kills||[]).filter(function(k){return k.t<=t}).slice(-6);feed.innerHTML=ks.length?ks.map(function(k){return'<div>'+esc(nm(r,k.k))+' ['+esc(k.w||"?")+(k.hs?" HS":"")+'] '+esc(nm(r,k.v))+'</div>'}).join(""):'<span class="hint">Sem abates ainda neste round.</span>';
    k2.innerHTML="";(r.kills||[]).forEach(function(k){var i=el("i");i.title=nm(r,k.k)+" abate "+nm(r,k.v)+" em "+fmtT(Math.max(0,115-k.t));i.style.cssText="position:absolute;top:0;width:3px;height:12px;border-radius:2px;background:#e11d1d;left:"+(Math.min(100,k.t/d*100))+"%";k2.appendChild(i)})}
  var cp={on:false,i:0,refs:[],pts:[],last:null,msg:""},cbx=el("div",{class:"def"});
  function calMarks(){var h="";if(fm.on||cp.showFx){var F=fxGet()||{};FXN.forEach(function(q,i){var v=fm.on&&fm.pts[q[0]]||F[q[0]];if(v)h+='<path d="M'+v[0]+' '+(v[1]-12)+'l12 12l-12 12l-12-12z" fill="#a855f7" stroke="#fff" stroke-width="2.5" pointer-events="none"/><text x="'+v[0]+'" y="'+(v[1]-18)+'" font-size="16" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+["TR","CT","A","B"][i]+"</text>"})}
    cp.pts.forEach(function(q,i){h+='<circle cx="'+q.s[0]+'" cy="'+q.s[1]+'" r="8" fill="#22c55e" stroke="#fff" stroke-width="2.5" pointer-events="none"/><text x="'+q.s[0]+'" y="'+(q.s[1]-14)+'" font-size="18" font-weight="800" text-anchor="middle" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke" pointer-events="none">'+(i+1)+'</text>'});
    if(cp.on&&cp.i<cp.refs.length){var rf=cp.refs[cp.i],xy=d2xy(m,rf.w[0],rf.w[1]);if(xy)h+='<circle cx="'+xy[0]+'" cy="'+xy[1]+'" r="28" fill="none" stroke="#ff2a2a" stroke-width="4" stroke-dasharray="7 6" pointer-events="none"/>'}
    return h}
  function calApply(sep){var mp=MAPPOS[d2key(m)],pts=sep?cp.last:cp.pts;
    if(!mp||!pts||pts.length<2){cp.on=false;cp.msg="Preciso de pelo menos 2 pontos clicados.";calBar();paint();return}
    var f=d2fit(mp,pts,sep);
    if(!f){cp.on=false;cp.msg=sep?"Não deu para separar X e Y com esses pontos (eles estão alinhados). Use mais pontos, em lugares diferentes do mapa.":"Não consegui calcular com esses pontos. Tente de novo clicando em lugares bem diferentes.";calBar();paint();return}
    var c=d2cal(m);c.ox=Math.round(f.ox*100)/100;c.oy=Math.round(f.oy*100)/100;c.k=Math.round(f.kx*10000)/10000;
    if(sep)c.ky=Math.round(f.ky*10000)/10000;else delete c.ky;
    cp.last=pts.slice();cp.on=false;save();
    cp.msg="Calibrado com "+pts.length+" ponto(s). Erro médio: "+f.err.toFixed(0)+" (de 1000)."+(f.err>25?" Está alto: refaça clicando com mais cuidado no centro de cada lugar"+(pts.length>=3?", ou tente 'Esticar X e Y separados'.":"."):" Veja se os jogadores andam pelos corredores agora.");
    calUI();calBar();paint()}
  function calStart(){var dd=D2.data;if(!dd){setSt("Carregue uma demo antes de calibrar.");return}
    if(!MAPPOS[d2key(m)]){notice("Este mapa não tem calibração base conhecida.");return}
    var refs=d2refs(dd);if(refs.length<2){notice("Não achei pontos de referência suficientes nesta demo.");return}
    stop();D2.t=0;cp={on:true,i:0,refs:refs,pts:[],last:cp.last,msg:""};calBar();paint()}
  svg.addEventListener("pointerdown",function(e){if(!cp.on)return;e.preventDefault();var p=ptr(svg,e);cp.pts.push({w:cp.refs[cp.i].w,s:p});cp.i++;
    if(cp.i>=cp.refs.length){calApply(false)}else{calBar();paint()}});
  var fm={on:false,i:0,pts:{}},FXN=[["t","o centro do spawn dos TR"],["ct","o centro do spawn dos CT"],["a","a bomb A"],["b","a bomb B"]];
  function fxGet(){var c=d2cal(m);return c.fx||FIXREF[d2key(m)]||null}
  function calAuto(){var dd=D2.data,F=fxGet();if(!dd){setSt("Carregue uma demo antes de calibrar.");return}
    if(!F){notice("Este mapa ainda não tem pontos fixos. Use 'Marcar pontos fixos do mapa' uma vez.");return}
    var pts=[],bm=[],sp=[];d2refs(dd).forEach(function(rf){if(/dos (TR|CT)/.test(rf.n))sp.push(rf);else bm.push(rf)});
    var u0=null;sp.forEach(function(rf){var xy=d2xy(m,rf.w[0],rf.w[1]),da=Math.hypot(xy[0]-F.t[0],xy[1]-F.t[1]),db=Math.hypot(xy[0]-F.ct[0],xy[1]-F.ct[1]),kk=da<=db?"t":"ct";if(kk===u0)kk=kk==="t"?"ct":"t";u0=kk;pts.push({w:rf.w,s:F[kk].slice()})});if(!F.a||!F.b)bm=[];
    var used=null;bm.forEach(function(rf){var xy=d2xy(m,rf.w[0],rf.w[1]),da=Math.hypot(xy[0]-F.a[0],xy[1]-F.a[1]),db=Math.hypot(xy[0]-F.b[0],xy[1]-F.b[1]),k=da<=db?"a":"b";if(k===used)k=k==="a"?"b":"a";used=k;pts.push({w:rf.w,s:F[k].slice()})});
    cp={on:true,i:0,refs:[],pts:pts,last:cp.last,msg:""};calApply(false)}
  function fxStart(){stop();fm={on:true,i:0,pts:{}};cp.on=false;calBar();paint()}
  svg.addEventListener("pointerdown",function(e){if(!fm.on)return;e.preventDefault();e.stopPropagation();var p=ptr(svg,e);fm.pts[FXN[fm.i][0]]=[Math.round(p[0]),Math.round(p[1])];fm.i++;
    if(fm.i>=FXN.length){fm.on=false;d2cal(m).fx=fm.pts;save();cp.msg="Pontos fixos salvos. Agora use 'Calibrar automático'.";}calBar();paint()});
  function calBar(){cbx.innerHTML="";if(!D2.data||!d2canEdit())return;
    if(fm.on){var q=el("p");q.textContent="Ponto "+(fm.i+1)+" de 4: clique no radar em "+FXN[fm.i][1]+" (o centro da área).";cbx.appendChild(q);var cf=el("button",{class:"b",type:"button"});cf.textContent="Cancelar";cf.onclick=function(){fm.on=false;calBar();paint()};cbx.appendChild(cf);return}
    var t=el("strong");t.textContent="Radar desalinhado? Calibre clicando";cbx.appendChild(t);
    if(!cp.on){var p0=el("p",{class:"hint"});p0.textContent="O site mostra onde ele acha que é um lugar (spawn, bomba) e você clica onde esse lugar fica de verdade no radar. Com 2 a 4 cliques ele calcula posição e zoom sozinho.";cbx.appendChild(p0);
      var r0=el("div",{class:"row"}),b0=el("button",{class:"b primary",type:"button"});b0.textContent="Calibrar clicando no radar";b0.onclick=calStart;r0.appendChild(b0);var ba=el("button",{class:"b primary",type:"button"});ba.textContent="Calibrar automático (pontos fixos)";ba.onclick=calAuto;r0.appendChild(ba);var bf=el("button",{class:"b",type:"button"});bf.textContent="Marcar pontos fixos do mapa";bf.onclick=fxStart;r0.appendChild(bf);
      if(cp.last&&cp.last.length>=3){var b1=el("button",{class:"b",type:"button"});b1.textContent="Esticar X e Y separados";b1.onclick=function(){calApply(true)};r0.appendChild(b1)}
      var b2=el("button",{class:"b",type:"button"});b2.textContent="Voltar ao padrão";b2.onclick=function(){var c=d2cal(m),b0=d2base(d2key(m));c.ox=b0.ox;c.oy=b0.oy;c.k=b0.k;if(b0.ky)c.ky=b0.ky;else delete c.ky;cp.msg="Calibração padrão restaurada.";save();calUI();calBar();paint()};r0.appendChild(b2);if(isEd()){var b3=el("button",{class:"b",type:"button"});b3.textContent="Publicar calibração para todos";b3.onclick=d2pubCal;r0.appendChild(b3)}cbx.appendChild(r0);
      if(cp.msg){var m0=el("p",{class:"hint"});m0.textContent=cp.msg;cbx.appendChild(m0)}return}
    var rf=cp.refs[cp.i],p1=el("p");p1.textContent="Passo "+(cp.i+1)+" de "+cp.refs.length+": clique no radar em "+rf.n+". O círculo vermelho tracejado mostra onde o site coloca agora (pode estar errado). Não sabe onde é? Pule.";cbx.appendChild(p1);
    var r1=el("div",{class:"row"}),sk=el("button",{class:"b",type:"button"});sk.textContent="Pular este ponto";sk.onclick=function(){cp.i++;if(cp.i>=cp.refs.length){calApply(false)}else{calBar();paint()}};r1.appendChild(sk);
    var ap=el("button",{class:"b primary",type:"button"});ap.textContent="Aplicar com "+cp.pts.length+" ponto(s)";ap.disabled=cp.pts.length<2;ap.onclick=function(){calApply(false)};r1.appendChild(ap);
    var cn=el("button",{class:"b",type:"button"});cn.textContent="Cancelar";cn.onclick=function(){cp.on=false;cp.pts=[];cp.msg="";calBar();paint()};r1.appendChild(cn);cbx.appendChild(r1)}
  var ibx=el("div");
  function curName(){return(D2T.filter(function(x){return x.id===D2.id})[0]||{}).name||"demo"}
  function impSide(team){return String(team).toUpperCase()==="CT"?"ct":"tr"}
  function impRoute(){var dd=D2.data,r=dd&&dd.rounds[D2.r],I=D2.imp;if(!r)return;
    if(!CAN){notice("Entre como editor num perfil para enviar.");return}
    var pl=(r.players||[]).filter(function(p){return p.id===I.pid})[0];
    if(!pl||!pl.f||pl.f.length<2){notice("Esse jogador não tem posições neste round.");return}
    var sd=impSide(pl.team),tEnd=Math.max(2,I.sec||20),f=pl.f,t0=f[0][0],tMax=Math.min(t0+tEnd,f[f.length-1][0]),pts=[],last=null,tl=t0,tt;
    for(tt=t0;tt<=tMax+1e-6;tt+=0.25){var q=d2at(f,tt);if(!q)break;var xy=d2xy(m,q[1],q[2]);if(!xy)continue;
      if(!last||Math.hypot(xy[0]-last[0],xy[1]-last[1])>=5){pts.push([Math.round(xy[0]*10)/10,Math.round(xy[1]*10)/10]);last=xy;tl=tt}}
    if(pts.length<2){notice("O jogador quase não se mexeu nesse tempo.");return}
    while(pts.length>90){var cp0=pts;pts=cp0.filter(function(z,i){return i%2===0||i===cp0.length-1})}
    ensure(m);var T=m.tm[sd];T.sp=T.sp||[];T.r=T.r||[];T.gr=T.gr||[];T.np=T.np||1;T.pe=T.pe||[];
    var spi=-1,bd=60;T.sp.forEach(function(s,i){var d=Math.hypot(s.x-pts[0][0],s.y-pts[0][1]);if(d<bd){bd=d;spi=i}});
    if(spi<0){T.sp.push({n:"Respawn "+(T.sp.length+1),x:pts[0][0],y:pts[0][1]});spi=T.sp.length-1}
    var dur=Math.max(1,tl-t0),nm0=(pl.name||pl.id)+" · R"+(r.n||D2.r+1),
      rt={id:"d"+newUid(),nm:nm0,sp:spi,p:pts,n:1,tv:dur.toFixed(1),tw:0,ok:true,tx:"Rota importada da demo \""+curName()+"\", round "+(r.n||D2.r+1)+", jogador "+(pl.name||pl.id)+" ("+dur.toFixed(1)+" s)."},made=0;
    if(I.uts){m.ut=m.ut||{tr:{s:[],u:[]},ct:{s:[],u:[]}};var U=m.ut[sd].u,cnt={};
      (r.nades||[]).forEach(function(g){if(String(g.by)!==String(pl.id))return;var ty=d2ty(g.type);if(!ICO[ty])return;var th=g.t0!=null?g.t0:g.t1;if(th<t0-0.1||th>t0+tEnd)return;
        var xy=d2xy(m,g.x,g.y);if(!xy)return;cnt[ty]=(cnt[ty]||0)+1;var nme=(pl.name||pl.id)+" R"+(r.n||D2.r+1)+" "+UN[ty]+" "+cnt[ty];
        if(!U.some(function(u){return(u.nm||"")===nme}))U.push({t:ty,x:Math.round(xy[0]*10)/10,y:Math.round(xy[1]*10)/10,nm:nme,tx:"Da demo, jogada por "+(pl.name||pl.id)+" aos "+(th-t0).toFixed(1)+" s."});
        rt.ul=rt.ul||[];rt.ul.push({n:nme,tm:String(Math.max(0,+(th-t0).toFixed(1)))});made++})}
    T.r.push(rt);save();
    I.msg="Rota criada no Timing ("+(sd==="tr"?"TR":"CT")+"): "+pts.length+" pontos, "+dur.toFixed(1)+" s"+(made?" e "+made+" utilitária(s) ligada(s) à rota":"")+". Veja na aba Timing do lado "+(sd==="tr"?"TR":"CT")+".";impBar();setSt(I.msg)}
  function impUtil(i){var dd=D2.data,r=dd&&dd.rounds[D2.r],g=r&&r.nades&&r.nades[i];if(!g)return;
    if(!CAN){notice("Entre como editor num perfil para enviar.");return}
    var ty=d2ty(g.type),xy=d2xy(m,g.x,g.y);if(!ICO[ty]||!xy){notice("Não consegui posicionar esta utilitária.");return}
    var pl=(r.players||[]).filter(function(p){return String(p.id)===String(g.by)})[0],sd=pl?impSide(pl.team):"tr",
      nme=(pl?(pl.name||pl.id):"Demo")+" R"+(r.n||D2.r+1)+" "+UN[ty];
    ensure(m);var U=m.ut[sd].u,n2=nme,k=1;while(U.some(function(u){return(u.nm||"")===n2}))n2=nme+" "+(++k);
    U.push({t:ty,x:Math.round(xy[0]*10)/10,y:Math.round(xy[1]*10)/10,nm:n2,tx:"Da demo \""+curName()+"\", round "+(r.n||D2.r+1)+"."});save();
    D2.imp.msg="Enviada para o minimapa de Utilitárias ("+(sd==="tr"?"TR":"CT")+"): "+n2+". Você pode renomear na aba Utilitárias.";impBar();setSt(D2.imp.msg)}
  function impBar(){ibx.innerHTML="";var dd=D2.data,r=dd&&dd.rounds&&dd.rounds[D2.r];if(!r)return;
    var det=el("details"),sm=el("summary"),I=D2.imp=D2.imp||{sec:20,uts:true};
    sm.textContent="Levar da demo para o site (rota para o Timing · utilitária para o minimapa)";det.appendChild(sm);det.open=!!D2.impOpen;det.ontoggle=function(){D2.impOpen=det.open};
    if(!CAN){var np=el("p",{class:"hint"});np.textContent="Para enviar, entre num perfil com senha e token do GitHub (modo editor).";det.appendChild(np);ibx.appendChild(det);return}
    var h1=el("p",{class:"hint"});h1.textContent="1) Rota de um jogador neste round, com o tempo e as utilitárias que ele jogou:";det.appendChild(h1);
    var r1=el("div",{class:"row"}),ps=el("select",{class:"sel","aria-label":"Jogador"});
    (r.players||[]).forEach(function(p){var o=el("option",{value:p.id});o.textContent=(p.name||p.id)+" ("+String(p.team).toUpperCase()+")";ps.appendChild(o)});
    if(!(r.players||[]).some(function(p){return p.id===I.pid}))I.pid=(r.players&&r.players[0]&&r.players[0].id)||"";ps.value=I.pid;ps.onchange=function(){I.pid=ps.value};r1.appendChild(ps);
    var sf=field("input",String(I.sec),"Segundos de rota (ex: 20)",function(v){I.sec=parseFloat(String(v).replace(",","."))||20});sf.style.width="160px";r1.appendChild(sf);
    var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.checked=!!I.uts;cb.onchange=function(){I.uts=cb.checked};lb.appendChild(cb);lb.appendChild(document.createTextNode(" levar as utilitárias dele"));r1.appendChild(lb);
    var b1=el("button",{class:"b primary",type:"button"});b1.textContent="Criar rota no Timing";b1.onclick=impRoute;r1.appendChild(b1);det.appendChild(r1);
    var h2=el("p",{class:"hint"});h2.textContent="2) Uma utilitária deste round para o minimapa de Utilitárias:";det.appendChild(h2);
    var r2=el("div",{class:"row"}),ns=el("select",{class:"sel","aria-label":"Utilitária"}),cnt=0;
    (r.nades||[]).forEach(function(g,i){var ty=d2ty(g.type);if(!ICO[ty])return;var pl=(r.players||[]).filter(function(p){return String(p.id)===String(g.by)})[0],o=el("option",{value:i});o.textContent=UN[ty]+" · "+(pl?(pl.name||pl.id):"?")+" · jogada aos "+(g.t0!=null?g.t0:g.t1).toFixed(1)+" s";ns.appendChild(o);cnt++});
    if(cnt){if(I.nid!=null)ns.value=I.nid;ns.onchange=function(){I.nid=ns.value};r2.appendChild(ns);var b2=el("button",{class:"b",type:"button"});b2.textContent="Enviar para Utilitárias";b2.onclick=function(){impUtil(parseInt(ns.value,10))};r2.appendChild(b2)}
    else{var z=el("span",{class:"hint"});z.textContent="Este round não tem utilitárias.";r2.appendChild(z)}
    det.appendChild(r2);if(I.msg){var mg=el("p",{class:"hint"});mg.textContent=I.msg;det.appendChild(mg)}ibx.appendChild(det)}
  function afterLoad(j){stop();D2.r=0;D2.t=0;D2.focus="all";D2.lastFl=null;var key=String(j.map||"").toLowerCase().replace(/^de_/,"").replace(/[^a-z0-9]/g,""),ix=-1;S.maps.forEach(function(x,i){if(ix<0&&d2key(x)===key)ix=i});if(ix>=0&&ix!==cur){cur=ix;render();return}build();paint()}
  function d2pick(id){d2get(id).then(function(j){D2.id=id;D2.data=j;afterLoad(j)}).catch(function(e){setSt("Não abriu a demo: "+emsg(e))})}
  function d2tabs(){tbar.innerHTML="";dact.innerHTML="";
    D2T.forEach(function(d){var b=el("button",{class:"tab",role:"tab",type:"button","aria-selected":String(d.id===D2.id)});b.textContent=d.name+(d.loc||d.gh?"":" (não salva)");b.onclick=function(){d2pick(d.id)};tbar.appendChild(b)});
    if(!D2T.length){var e0=el("span",{class:"hint"});e0.textContent="Nenhuma demo ainda. Carregue um .json ou um link abaixo.";tbar.appendChild(e0)}
    var c0=D2T.filter(function(x){return x.id===D2.id})[0],done=function(){stop();build();paint()};
    if(c0){var r1=el("div",{class:"row"}),nf=field("input",c0.name,"Nome da demo (a aba)",function(v){c0.name=v;if(c0.loc)d2idx()});nf.style.flex="1";r1.appendChild(nf);
      if(!c0.loc){var sb=el("button",{class:"b primary",type:"button"});sb.textContent="Salvar neste aparelho";sb.onclick=function(){d2saveLoc(c0).then(function(){setSt("Demo salva neste aparelho.");build()}).catch(function(e){setSt("Não consegui salvar aqui: "+emsg(e)+" Use Publicar no GitHub ou guarde o .json.")})};r1.appendChild(sb)}
      if(isEd()){var pb2=el("button",{class:"b"+(c0.gh?"":" primary"),type:"button"});pb2.textContent=c0.gh?"Republicar no GitHub":"Publicar no GitHub";pb2.onclick=function(){d2pub(c0,done)};r1.appendChild(pb2)}
      var rm2=el("button",{class:"b danger",type:"button"});rm2.textContent="Remover";rm2.onclick=function(){d2remove(c0,function(){build();paint()})};r1.appendChild(rm2);
      dact.appendChild(r1);
      var h1=el("p",{class:"hint"});h1.textContent=(c0.kb>=1024?(c0.kb/1024).toFixed(1)+" MB":c0.kb+" KB")+" · "+c0.n+" round(s) · "+(c0.loc?"salva neste aparelho":"ainda não salva neste aparelho")+" · "+(c0.gh?"está no GitHub":"não está no GitHub")+(isEd()?"":" · para publicar, entre como editor");dact.appendChild(h1)}
    var r2=el("div",{class:"row"}),lu=el("input",{placeholder:"Link de um .json de demo (ex: https://raw.githubusercontent.com/.../demo.json)","aria-label":"Link do .json da demo"});lu.style.flex="1";lu.style.border="1px solid var(--line)";r2.appendChild(lu);
    var lb2=el("button",{class:"b",type:"button"});lb2.textContent="Carregar de link";
    lb2.onclick=function(){var u=lu.value.trim();if(!u)return;setSt("Baixando a demo do link…");
      fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("o link respondeu erro "+r.status+".");return r.json()}).then(function(j){if(!d2ok(j))throw new Error("o arquivo não tem a lista 'rounds'.");var nm=decodeURIComponent((u.split("?")[0].split("/").pop()||"Demo")).replace(/\.json$/i,"");d2add(j,nm);setSt("Demo carregada do link. Clique em Salvar para guardar.");afterLoad(j)})
      .catch(function(e){setSt("Não consegui abrir o link: "+(e instanceof TypeError?"o site do link bloqueia (CORS) ou está fora do ar. Baixe o arquivo e use 'Carregar demo (.json)'.":emsg(e)))})};
    r2.appendChild(lb2);
    var rf=el("button",{class:"b",type:"button"});rf.textContent="Atualizar lista do GitHub";rf.onclick=function(){setSt("Buscando demos no GitHub…");d2sync(function(){setSt("Lista atualizada.");build()},true)};r2.appendChild(rf);
    dact.appendChild(r2)}
  function build(){
    tb.innerHTML="";var dd=D2.data;d2tabs();calBar();impBar();
    var fi=el("input",{type:"file",accept:".json,application/json",hidden:""});fi.style.display="none";
    fi.onchange=function(){var f=fi.files[0];if(!f)return;var rd=new FileReader();rd.onerror=function(){notice("Não consegui ler o arquivo.")};rd.onload=function(){try{var j;setSt("Processando "+f.name+"…");try{j=JSON.parse(String(rd.result).replace(/(?<=[\[,:])-?(?:NaN|Infinity)(?=[,\]}])/g,"null"))}catch(e){notice("Arquivo inválido: não é um JSON ("+e.message+"). Gere de novo com o dem2json.py.");return}
      if(!j||!Array.isArray(j.rounds)||!j.rounds.length){notice("Arquivo inválido: faltou a lista 'rounds'. Este não parece ser uma demo convertida.");return}
      stop();d2add(j,f.name.replace(/\.json$/i,""));D2.r=0;D2.t=0;D2.focus="all";D2.lastFl=null;var key=String(j.map||"").toLowerCase().replace(/^de_/,"").replace(/[^a-z0-9]/g,""),ix=-1;S.maps.forEach(function(x,i){if(ix<0&&d2key(x)===key)ix=i});
      if(ix>=0&&ix!==cur){cur=ix;render();setSt("Demo aberta: "+f.name+" ("+j.rounds.length+" rounds). Clique em Salvar neste aparelho para guardar.");return}build();paint();setSt("Demo aberta: "+f.name+" ("+j.rounds.length+" rounds). Clique em Salvar neste aparelho para guardar.")}catch(e){notice("Erro ao abrir a demo: "+((e&&e.message)||e))}};setSt("Lendo "+f.name+" ("+(f.size/1048576).toFixed(1)+" MB)… pode levar alguns segundos.");rd.readAsText(f);fi.value=""};
    var lb=el("button",{class:"b primary",type:"button"});lb.textContent="Carregar demo (.json)";lb.onclick=function(){fi.click()};tb.appendChild(lb);tb.appendChild(fi);
    var sm=el("button",{class:"b",type:"button"});sm.textContent="Carregar exemplo";sm.onclick=function(){stop();d2add(d2sample(m),"Exemplo "+m.name);D2.r=0;D2.t=0;D2.focus="all";build();paint()};tb.appendChild(sm);
    var dl=el("button",{class:"b",type:"button"});dl.textContent="Baixar modelo do arquivo";dl.onclick=function(){var a=el("a",{href:URL.createObjectURL(new Blob([JSON.stringify(d2sample(m),null,1)],{type:"application/json"})),download:"modelo-demo-2d.json"});document.body.appendChild(a);a.click();a.remove()};tb.appendChild(dl);var cv=el("button",{class:"b",type:"button"});cv.textContent="Baixar conversor (.dem para .json)";cv.onclick=function(){var a=el("a",{href:URL.createObjectURL(new Blob([DEM2JSON],{type:"text/x-python"})),download:"dem2json.py"});document.body.appendChild(a);a.click();a.remove()};tb.appendChild(cv);
    if(dd){var r0=R();
      tb.appendChild(pickL("Round",dd.rounds.map(function(x,i){return[i,"R"+(x.n||i+1)+(x.winner?" · "+String(x.winner).toUpperCase():"")]}),D2.r,function(v){stop();D2.r=parseInt(v,10);D2.t=0;D2.lastFl=null;build();paint()}));
      pb.onclick=function(){if(D2.tm){stop()}else go()};tb.appendChild(pb);
      var rs=el("button",{class:"b",type:"button"});rs.textContent="Reiniciar";rs.onclick=function(){stop();D2.t=0;paint()};tb.appendChild(rs);
      tb.appendChild(pickL("Velocidade",[[.5,"0,5x"],[1,"1x"],[2,"2x"],[4,"4x"],[8,"8x"]],D2.spd,function(v){D2.spd=parseFloat(v)}));
      var fo=[["all","Todos os andares"],["f0","Só inferior"],["f1","Só superior"]];(r0.players||[]).forEach(function(p){fo.push(["p:"+p.id,"Seguir "+(p.name||p.id)])});
      tb.appendChild(pickL("Foco do andar",fo,D2.focus,function(v){D2.focus=v;D2.lastFl=null;paint()}));if(hasFl(m))tb.appendChild(fvCtl(m,paint));
      inf.textContent="Demo do mapa "+(dd.map||"?")+" · "+dd.rounds.length+" round(s).";
      if(!(m.zn||[]).length&&d2cal(m).zc==="")inf.textContent+=" Para o foco de andar funcionar, desenhe zonas na aba Desenho ou informe o Z de corte abaixo."}
    else inf.textContent="O navegador não lê .dem direto. Passo a passo: 1) clique em 'Baixar conversor'; 2) no computador rode: pip install demoparser2 pandas e depois python dem2json.py minha_demo.dem; 3) clique em 'Carregar demo (.json)' e escolha o arquivo gerado. Ou use 'Carregar exemplo' para testar."}
  function calUI(){tc.innerHTML="";if(!d2canEdit()){var h0=el("p",{class:"hint"});h0.textContent="Calibração do radar: definida pelo Player 1 e igual para todos.";tc.appendChild(h0);return}var c=d2cal(m);
    [["ox","Deslocar X"],["oy","Deslocar Y"],["k","Zoom (1 = normal)"],["ky","Zoom Y (vazio = igual ao zoom)"],["zc","Z que separa inferior/superior (vazio = usar zonas)"]].forEach(function(k){var f=field("input",c[k[0]]==null?"":String(c[k[0]]),k[1],function(v){if(k[0]==="zc"){c.zc=String(v).trim()}else if(k[0]==="ky"&&String(v).trim()===""){delete c.ky}else{var n=parseFloat(String(v).replace(",","."));if(!isNaN(n)&&((k[0]!=="k"&&k[0]!=="ky")||n>0))c[k[0]]=n}save();paint()});f.style.width=k[0]==="zc"?"260px":"130px";tc.appendChild(f)});
    var hh=el("span",{class:"hint"});hh.textContent="Ajuste fino da posição da demo sobre o radar (use se os jogadores aparecerem deslocados).";tc.appendChild(hh)}
  
  var lw=el("div",{class:"row"}),li=field("input",m.d2l||"","Link de uma demo 2D de site (opcional)",function(v){m.d2l=v});li.style.flex="1";lw.appendChild(li);lw.appendChild(linkBtn(function(){return m.d2l}));
  var hd=el("h2");hd.textContent="Demo 2D";var hp=el("p",{class:"hint"});hp.textContent="Toque uma demo no próprio minimapa: rounds, jogadores vivos, utilitárias e abates, com o andar acompanhando quem você seguir. Sites de demo 2D geralmente não abrem dentro de outro site; use o link abaixo para abrir em nova aba.";
  w.appendChild(hd);w.appendChild(hp);w.appendChild(tbar);w.appendChild(dact);w.appendChild(tb);w.appendChild(inf);w.appendChild(cbx);w.appendChild(ibx);w.appendChild(svg);w.appendChild(ct);w.appendChild(sl);k2.style.cssText="position:relative;height:14px;margin:2px 8px 6px";w.appendChild(k2);w.appendChild(ulr);w.appendChild(feed);w.appendChild(tc);w.appendChild(lw);

  /* utilitárias da demo que batem (mesmo tipo e bem perto) com as nomeadas no minimapa */
  function ulRec(){ulr.innerHTML="";ulr.style.display="none";var r=R();if(!r||!r.nades||!m.ut)return;var rows=[];
   (r.nades||[]).forEach(function(g,i){var ty=d2ty(g.type),xy=ICO[ty]&&d2xy(m,g.x,g.y);if(!xy)return;var b=null;
    ["tr","ct"].forEach(function(sd){((m.ut[sd]&&m.ut[sd].u)||[]).forEach(function(u){if(u.t!==ty||!(u.nm||"").trim())return;var dd=Math.hypot(u.x-xy[0],u.y-xy[1]);if(dd<=UL_REC&&(!b||dd<b.d))b={u:u,d:dd}})});if(b)rows.push({g:g,i:i,b:b,ty:ty})});
   if(!rows.length)return;ulr.style.display="";
   var h=el("strong");h.textContent="Utilitárias iguais às do minimapa neste round ("+rows.length+")";ulr.appendChild(h);
   var auto=D2.ulAuto!==false;
   if(CAN){var lb=el("label",{class:"sl"}),cb=el("input",{type:"checkbox"});cb.style.width="auto";cb.checked=auto;cb.onchange=function(){D2.ulAuto=cb.checked;ulRec()};lb.appendChild(cb);lb.appendChild(document.createTextNode(" Adicionar sozinho a posição de quem jogou ao radar da utilitária"));ulr.appendChild(lb)}
   else{var np=el("p",{class:"hint"});np.textContent="Só o editor adiciona a posição de quem jogou ao radar da utilitária.";ulr.appendChild(np)}
   var added=0,did=D2.id||"demo";
   rows.forEach(function(q){var g=q.g,pl=(r.players||[]).filter(function(p){return String(p.id)===String(g.by)})[0],who=pl?(pl.name||pl.id):String(g.by),
     P=g.path&&g.path.length>1?g.path:null,th=g.t0!=null?g.t0:(P?P[0][0]:null),tf=g.t0!=null?g.t1-g.t0:(P?P[P.length-1][0]-P[0][0]:null),
     a=pl&&pl.f&&th!=null?d2at(pl.f,th):null,tp=a?d2xy(m,a[1],a[2]):(P?d2xy(m,P[0][1],P[0][2]):null),key=did+"|"+(r.n||D2.r)+"|"+q.i,L=ulinks(q.b.u),has=L.some(function(x){return x.dm===key});
    function addPos(){L.push({n:who+" (R"+(r.n||D2.r+1)+")",u:"",px:Math.round(tp[0]*10)/10,py:Math.round(tp[1]*10)/10,dm:key,by:who,tf:tf==null?null:Math.round(tf*10)/10});}
    if(CAN&&auto&&tp&&!has){addPos();has=true;added++}
    var row=el("div",{class:"row"});row.style.margin="6px 0";
    row.innerHTML='<svg viewBox="-12 -12 24 24" width="24" height="24">'+ICO[q.ty]+'</svg><strong>'+esc(q.b.u.nm)+'</strong><span class="hint">'+esc(who)+(th!=null?" jogou aos "+fmtT(Math.max(0,115-th)):"")+(tf!=null?" · demorou "+tf.toFixed(1).replace(".",",")+" s":"")+" · a "+Math.round(q.b.d)+" pts do ponto"+(has?" · posição no radar da utilitária":"")+'</span>';
    var go2=el("button",{class:"b",type:"button"});go2.textContent="Ver";go2.onclick=function(){stop();D2.t=Math.max(0,(g.t0!=null?g.t0:g.t1)-1);paint()};row.appendChild(go2);
    if(CAN&&tp&&!has){var ab=el("button",{class:"b",type:"button"});ab.textContent="Adicionar posição ao radar";ab.onclick=function(){addPos();save();ulRec();setSt("Posição de "+who+" adicionada à utilitária "+q.b.u.nm+".")};row.appendChild(ab)}
    ulr.appendChild(row)});
   if(added){save();setSt(added+" posição(ões) de quem jogou adicionada(s) ao radar das utilitárias.")}}
  w.xseek=function(v){stop();D2.t=v;paint()};var _bd=build;build=function(){_bd.apply(this,arguments);try{ulRec()}catch(e){console.error("ulRec",e)}};build();calUI();paint();d2sync(function(){if(svg.isConnected){build();paint()}});return w}
function demoView(){
  var w=el("div");S.demos=S.demos||[];
  S.demos.forEach(function(d,i){
    var c=el("div",{class:"def"}),top=el("div",{class:"row"});
    var ti=field("input",d.title||"","Título da demo (ex: Final da liga)",function(v){d.title=v},"name");ti.style.flex="1";top.appendChild(ti);
    top.appendChild(rmBtn("Remover demo","Remover esta demo?",function(){S.demos.splice(i,1);save();render()}));c.appendChild(top);
    var tg=el("div",{class:"teams"});
    ["a","b"].forEach(function(k){var t=d["t"+k]=d["t"+k]||{},tm=el("div",{class:"tm"});
      tm.appendChild(photo(t,"img","Foto do time "+k.toUpperCase(),300,"tlogo"));
      tm.appendChild(field("input",t.n||"","Nome do time "+k.toUpperCase(),function(v){t.n=v}));tg.appendChild(tm)});
    c.appendChild(tg);c.appendChild(mapPick(d));
    var rs=field("input",d.res||"","Resultado (ex: 13-9)",function(v){d.res=v});rs.style.margin="10px 0";c.appendChild(rs);
    var lr=el("div",{class:"row"}),li=field("input",d.lk||"","Link da demo ou do vídeo",function(v){d.lk=v});li.style.flex="1";lr.appendChild(li);lr.appendChild(linkBtn(function(){return d.lk},{rounds:function(){return d.rounds},title:function(){return d.title}}));c.appendChild(lr);c.appendChild(roundsEd(d));
    c.appendChild(field("textarea",d.nt||"","Observações",function(v){d.nt=v}));
    w.appendChild(c)});
  var ad=el("button",{class:"b"});ad.textContent="+ Nova demo";ad.onclick=function(){S.demos.push({});save();render()};w.appendChild(ad);return w}
function today(){var t=new Date(),z=function(n){return(n<10?"0":"")+n};return t.getFullYear()+"-"+z(t.getMonth()+1)+"-"+z(t.getDate())}
function ckList(t){t.ck=t.ck||[];var w=el("div"),h=el("div",{class:"hint"}),l=el("div",{class:"ulist"});w.style.margin="10px 0";
  function draw(){l.innerHTML="";var n=t.ck.filter(function(x){return x.ok}).length;h.textContent=t.ck.length?"Checklist: "+n+" de "+t.ck.length+" feitos":"Checklist do treino (opcional)";
    t.ck.forEach(function(x,i){var r=el("div",{class:"row"}),cb=el("input",{type:"checkbox","aria-label":"Feito"});cb.style.width="auto";cb.checked=!!x.ok;cb.onchange=function(){x.ok=cb.checked;save();draw()};
      var ti=field("input",x.t||"","Item (ex: smoke do meio, 5 vezes)",function(v){x.t=v});ti.style.flex="1";ti.readOnly=RO;
      var rm=el("button",{class:"b danger",type:"button"});rm.textContent="Tirar";rm.onclick=function(){t.ck.splice(i,1);save();draw()};
      r.appendChild(cb);r.appendChild(ti);r.appendChild(rm);l.appendChild(r)})}
  var ad=el("button",{class:"b edt",type:"button"});ad.textContent="+ Item";ad.onclick=function(){t.ck.push({t:"",ok:false});save();draw()};
  draw();w.appendChild(h);w.appendChild(l);w.appendChild(ad);return w}
function treinoView(){
  var w=el("div");S.trs=S.trs||[];
  S.trs.map(function(t,i){return i}).sort(function(a,b){return(S.trs[b].dt||"9999").localeCompare(S.trs[a].dt||"9999")}).forEach(function(i){
    var t=S.trs[i],c=el("div",{class:"def"}),top=el("div",{class:"row"});
    var di=field("input",t.dt||"","Data do treino",function(v){t.dt=v});di.type="date";di.value=t.dt||"";di.style.maxWidth="190px";top.appendChild(di);
    var sp=el("span");sp.style.flex="1";top.appendChild(sp);
    top.appendChild(rmBtn("Remover treino","Remover este treino?",function(){S.trs.splice(i,1);save();render()}));c.appendChild(top);
    var wh=field("textarea",t.what||"","O que vamos fazer neste treino",function(v){t.what=v});wh.style.margin="8px 0";c.appendChild(wh);
    var fl=el("div",{class:"fld"});
    fl.appendChild(pickL("Lado",[["ct","CT"],["tr","TR"]],t.side||"ct",function(v){t.side=v;save()}));
    fl.appendChild(pickL("Treino",[["comp","Composto"],["ind","Individual"]],t.kind||"comp",function(v){t.kind=v;save();render()}));
    if((t.kind||"comp")==="ind")fl.appendChild(pickL("Jogador",[0,1,2,3,4].map(function(k){return[k,pname(k)]}),t.pl||0,function(v){t.pl=parseInt(v,10);save()}));
    c.appendChild(fl);c.appendChild(ckList(t));c.appendChild(mapPick(t));w.appendChild(c)});
  var ad=el("button",{class:"b"});ad.textContent="+ Novo treino";ad.onclick=function(){S.trs.push({dt:today(),side:"ct",kind:"comp"});save();render()};w.appendChild(ad);return w}
function render(){setRO();render0();applyRO();decorate()}
function applyRO(){document.body.classList.toggle("ro",RO);document.getElementById("mode").textContent=RO?"Modo: Visualizar (clique para editar)":"Modo: Editar (clique para visualizar)";document.querySelectorAll("#map input,#map textarea").forEach(function(x){x.readOnly=RO})}
function render0(){
  if(cur>=S.maps.length)cur=0;
  var sc=document.getElementById("secs");sc.innerHTML="";
  Object.keys(SEC).forEach(function(k){var b=el("button",{class:"tab",role:"tab","aria-selected":k===sec});b.textContent=SEC[k];b.onclick=function(){sec=k;render()};sc.appendChild(b)});
  var off=sec==="demo"||sec==="treino"||sec==="cfg";
  if(off){document.getElementById("tabs").innerHTML="";var bx=document.getElementById("map");bx.innerHTML="";bx.appendChild(sec==="cfg"?cfgView():sec==="demo"?demoView():treinoView());return}
  var tabs=document.getElementById("tabs");tabs.innerHTML="";
  S.maps.forEach(function(m,i){
    var b=el("button",{class:"tab",role:"tab","aria-selected":i===cur});b.textContent=m.name||"Mapa";
    b.onclick=function(){cur=i;render()};tabs.appendChild(b)});
  var add=el("button",{class:"tab add"});add.textContent="+ mapa";
  add.onclick=function(){ask("Nome do mapa:",function(n){S.maps.push(newMap(n));cur=S.maps.length-1;save();render()},true)};
  tabs.appendChild(add);
  var mvl=el("button",{class:"tab add",type:"button","aria-label":"Mover o mapa selecionado para a esquerda"}),mvr=el("button",{class:"tab add",type:"button","aria-label":"Mover o mapa selecionado para a direita"});
  mvl.textContent="◀ mover";mvr.textContent="mover ▶";mvl.disabled=cur<=0;mvr.disabled=cur>=S.maps.length-1;
  mvl.onclick=function(){if(cur>0){var x=S.maps[cur];S.maps[cur]=S.maps[cur-1];S.maps[cur-1]=x;cur--;save();render()}};
  mvr.onclick=function(){if(cur<S.maps.length-1){var x=S.maps[cur];S.maps[cur]=S.maps[cur+1];S.maps[cur+1]=x;cur++;save();render()}};
  tabs.appendChild(mvl);tabs.appendChild(mvr);
  var m=S.maps[cur],box=document.getElementById("map");box.innerHTML="";
  box.appendChild(field("input",m.name,"Nome do mapa",function(v){m.name=v;tabs.children[cur].textContent=v||"Mapa"},"name"));
  box.lastChild.style.cssText="font-size:26px;font-weight:800;margin-bottom:8px";
  var nt=el("div",{class:"mapnote"});nt.appendChild(field("textarea",m.note,"Descrição do mapa: ideia geral, lado, observações",function(v){m.note=v}));
  box.appendChild(nt);box.lastChild.style.marginBottom="10px";box.appendChild(radarBox(m));
  var sp=el("div",{class:"sides",role:"group","aria-label":"Escolher lado"});
  ["ct","tr"].forEach(function(k){var b=el("button",{class:"side","aria-pressed":k===side});b.style.setProperty("--c",SIDECOL[k]);b.innerHTML=ICON[k]+"<span>"+SIDENAME[k]+"</span>";b.onclick=function(){side=k;render()};sp.appendChild(b)});
  if(sec!=="callouts"&&sec!=="d2")box.appendChild(sp);
  ensure(m);
  try{var hr=ulHeal(m,!RO);if(hr.dirty)save();if(hr.fixed)notice("Reconectei "+hr.fixed+" utilitária"+(hr.fixed>1?"s":"")+" que mudou"+(hr.fixed>1?"ram":"")+" de nome, pegando a mais próxima do mesmo tipo. Os horários foram mantidos.")}catch(e){}
  if(sec==="fixo"){box.appendChild(fxTabs(m));box.appendChild(fxBar())}
  if(sec==="d2"){box.appendChild(demo2dView(m));box.appendChild(d2SendPanel(m));return}
  if(sec==="cmp"){box.appendChild(cmpView(m));return}
  if(sec==="draw"){box.appendChild(drawView(m));return}
  if(sec==="timing"){box.appendChild(timingView(m));box.appendChild(toTmUI(m));box.appendChild(tmShare(m));return}
  if(sec==="callouts"){box.appendChild(calloutView(m));return}
  if(sec==="igl"){box.appendChild(iglView(m));return}
  if(sec==="utils"){box.appendChild(launchUtilBtn());box.appendChild(minimap(m,m.ut[side],true));return}
  var L=sec==="open"?OPENL:sec==="calls"?{n:"Nome da call",d:"Descrição da call: quando chamar, o que falar, quem decide",p:"O que esse jogador fala ou faz nessa call",r:"Remover call",q:"Remover esta call?",a:"+ Nova call",k:"Call"}:{n:"Nome do default",d:"Descrição do default: o que ele busca, timings, leitura",p:"Pef: movimento e o que faz no default",r:"Remover default",q:"Remover este default?",a:"+ Novo default",k:"Default"};
  var defs=sec==="open"?m.ab[side]:sec==="calls"?m.calls[side]:sec==="fixo"?m.fx[side]:m.defs[side];
  if(sec==="fixo")L={n:"Nome do round",d:"Descrição do round: o que o time faz, compra, ideia",p:"O que esse jogador faz nesse round",r:"",q:"",a:"",k:"Round"};
  defs.forEach(function(d,di){var nb0=d;if(sec==="fixo"){d=fxVar(d,di);d.nn=nb0.nn}
    var c=el("div",{class:"def"});if(sec!=="fixo"){c.xi=di;c.xn=defs.length;c.xmove=function(dr){var j=di+dr;if(j<0||j>=defs.length)return;var t=defs[di];defs[di]=defs[j];defs[j]=t;save();render()}}
    if(sec==="fixo"){var rh=el("h2");rh.textContent="Round "+(di+1)+(di>0?" (depois de: "+fxp.slice(0,di).map(function(x,k){return"R"+(k+1)+" "+(x==="G"?"ganhou":"perdeu")}).join(", ")+")":"")+":";c.appendChild(rh)}
    var top=el("div",{class:"row"});
    var nm=field("input",d.name,L.n,function(v){d.name=v},"name");nm.style.flex="1";top.appendChild(nm);
    var rm=el("button",{class:"b danger"});rm.textContent=L.r;
    rm.onclick=function(){ask(L.q,function(){defs.splice(di,1);save();render()})};
    if(sec==="fixo"){var cp=el("select",{class:"sel edt","aria-label":"Copiar este round para outro round"}),o0=el("option",{value:""});o0.textContent="Copiar para…";cp.appendChild(o0);
      defs.forEach(function(x,k){if(k===di)return;var o=el("option",{value:k});o.textContent="Round "+(k+1);cp.appendChild(o)});
      cp.onchange=function(){var k=parseInt(cp.value,10);cp.value="";if(isNaN(k))return;ask("Substituir tudo do Round "+(k+1)+" pelo conteúdo do Round "+(di+1)+"?",function(){var cl=JSON.parse(JSON.stringify(d));delete cl.v;var tv=fxVar(defs[k],k),kv=tv.v,nm0=tv.name;for(var q0 in tv)delete tv[q0];for(var q1 in cl)tv[q1]=cl[q1];tv.name=nm0;if(kv)tv.v=kv;save();render()})};top.appendChild(cp)}
    else{var dp=el("button",{class:"b edt",type:"button"});dp.textContent="Duplicar";dp.onclick=function(){var cl=JSON.parse(JSON.stringify(d));cl.name=(d.name||L.k)+" (cópia)";defs.splice(di+1,0,cl);save();render()};top.appendChild(dp);top.appendChild(rm)}
    var nbt=el("button",{class:"b edt",type:"button"});nbt.textContent=nb0.nn?"Mostrar nomes":"Esconder nomes";nbt.onclick=function(){nb0.nn=!nb0.nn;save();render()};top.appendChild(nbt);
    var pck=m.name+"|"+side+"|"+di,pcb=null;if(sec==="open"){pcb=el("button",{class:"b",type:"button"});function pcs(){pcb.textContent=PCOL[pck]?"+":"−";pcb.setAttribute("aria-label",PCOL[pck]?"Abrir a lista de jogadores":"Fechar a lista de jogadores");pcb.title=PCOL[pck]?"Abrir a lista de jogadores":"Fechar a lista de jogadores"}pcs();top.appendChild(pcb)}
    c.appendChild(top);
    c.appendChild(field("textarea",d.desc,L.d,function(v){d.desc=v}));
    var rf=el("div",{class:"row"});rf.style.margin="8px 0";
    var t1=field("input",d.rt||"","Time de referência (quem fez isso)",function(v){d.rt=v}),t2=field("input",d.rl||"","Link do vídeo ou da partida",function(v){d.rl=v});
    t1.style.flex="1";t2.style.flex="2";rf.appendChild(t1);rf.appendChild(t2);rf.appendChild(linkBtn(function(){return d.rl}));c.appendChild(rf);var ulw=utilLink(m,d,true);if(sec==="open"){d.lk=d.lk||{};d.lt=d.lt||{};d.lz=d.lz||{};d.en=d.en||[];c.appendChild(siteRow(d))}
    var g=el("div",{class:"players"});
    d.players.forEach(function(p,pi){
      if((d.hid||[]).indexOf(pi)>=0)return;var pl=el("div",{class:"pl"});pl.style.setProperty("--c",COLORS[pi%COLORS.length]);
      if(d.nn){var pd0=field("input","Player "+(pi+1),"",function(){});pd0.disabled=true;pl.appendChild(pd0)}else if(sec==="calls"){pl.appendChild(field("input",callName(p,pi),"Player "+(pi+1),function(v){p.name=v}))}else{var pin=field("input",pname(pi),"Nome do jogador",function(v){S.pn[pi]=v;document.querySelectorAll('input[data-pn="'+pi+'"]').forEach(function(x){if(x!==pin)x.value=v});document.querySelectorAll('.pnl[data-pn="'+pi+'"]').forEach(function(x){x.textContent=v||("Jogador "+(pi+1))})});pin.dataset.pn=pi;pl.appendChild(pin)}
      var T9=m.tm&&m.tm[side],nr=T9&&T9.sp?T9.sp.length:0;
      if(nr){d.rs=d.rs||[];var rcur=d.rs[pi]!=null?d.rs[pi]:(pi<nr?pi:-1);
        pl.appendChild(pickL("Respawn",[[-1,"Nenhum"]].concat(T9.sp.map(function(s9,k9){return[k9,s9.n||("Respawn "+(k9+1))]})),rcur,function(v){d.rs[pi]=parseInt(v,10);save();render()}))}
      var arp=pickL("Proteção",[["k","Colete"],["n","Sem proteção"]],(d.arp&&d.arp[pi])||"k",function(v){d.arp=d.arp||[];d.arp[pi]=v;save()});arp.className="sl edt";pl.appendChild(arp);
      if(sec==="defs"||sec==="calls"){var xb=el("button",{class:"b edt",type:"button","aria-label":"Tirar este jogador"});xb.textContent="X";xb.style.float="right";xb.onclick=function(){d.hid=d.hid||[];if(d.hid.indexOf(pi)<0)d.hid.push(pi);save();render()};pl.insertBefore(xb,pl.firstChild)}
      pl.appendChild(field("textarea",p.pef,L.p,function(v){p.pef=v}));if(sec==="open")pl.appendChild(lkEd(d,pi,function(){if(mw)mw.rf()}));
      g.appendChild(pl)});
    if(pcb){g.style.display=PCOL[pck]?"none":"";pcb.onclick=function(){PCOL[pck]=!PCOL[pck];g.style.display=PCOL[pck]?"none":"";pcs()}}
    c.appendChild(g);var mw=minimap(m,d);ulw.onchg=function(){mw.rf()};mw.onins=function(){ulw.rd();mw.rf()};c.appendChild(mw);if(sec==="open"){var enl=enEd(d,function(){mw.rf()}),vae=visAllEd(m,d,function(){mw.rf()});mw.onen=function(){enl.rd();ulw.rd();vae.rd()};c.appendChild(enl);c.appendChild(vae);c.appendChild(pullEd(m,d,function(){mw.rf()}))}c.appendChild(ulw);if(sec!=="fixo")c.appendChild(choiceEd(m,d));c.appendChild(defTools(m,d,sec));box.appendChild(c)});
  var ad=el("button",{class:"b edt"});ad.textContent=L.a;
  ad.onclick=function(){defs.push(newDef(defs.length+1,L.k));save();render()};
  if(sec!=="fixo")box.appendChild(ad);
}
document.getElementById("exp").onclick=function(){
  var a=el("a",{href:URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"})),download:"defaults-cs2-"+new Date().toISOString().slice(0,10)+".json"});
  document.body.appendChild(a);a.click();a.remove();setSt("Backup baixado às "+hora())};
document.getElementById("imp").onclick=function(){document.getElementById("file").click()};
document.getElementById("file").onchange=function(e){
  var f=e.target.files[0];e.target.value="";if(!f)return;var r=new FileReader();
  r.onload=function(){try{var d=JSON.parse(r.result);if(!(d.maps&&d.maps.length)){setSt("Arquivo inválido.");return}
    ask("Carregar este backup substitui tudo que está neste aparelho. Continuar?",function(){S=d;migrate();cur=0;save();render();setSt("Backup carregado às "+hora())})}catch(x){setSt("Arquivo inválido.")}};
  r.readAsText(f)};
var RO=true;
document.getElementById("mode").onclick=function(){ROU=!ROU;try{localStorage.setItem("cs2-ro",ROU?"1":"0")}catch(e){}render()};
document.getElementById("lockb").onclick=function(){LOCK=!LOCK;document.body.classList.toggle("lock",LOCK);this.textContent=LOCK?"Desenho travado (toque para destravar)":"Travar desenho: desligado";this.setAttribute("aria-pressed",String(LOCK))};

/* ---------- GitHub: ler e publicar dados.json ---------- */

function guessRepo(){var h=location.hostname,p=location.pathname.split("/")[1]||"";return/\.github\.io$/.test(h)?h.split(".")[0]+"/"+((p&&p.indexOf(".")<0)?p:h):""}

function ghH(acc){return{Authorization:"Bearer "+GH.tok,Accept:acc||"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}}
function b64(str){var b=new TextEncoder().encode(str),o="",n=32768;for(var i=0;i<b.length;i+=n)o+=String.fromCharCode.apply(null,b.subarray(i,i+n));return btoa(o)}
function unb64(x){var r=atob(x.replace(/\s/g,"")),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return new TextDecoder().decode(u)}
function ghErr(r){return r.status===401?"token inválido ou vencido.":r.status===403?"sem permissão (ou limite de uso do GitHub).":r.status===404?"repositório não encontrado ou token sem acesso a ele.":"erro "+r.status+" do GitHub."}
function emsg(e){return e instanceof TypeError?"sem conexão ou bloqueado pelo navegador.":(e&&e.message)||"erro."}

function isEd(){return!!(GH.tok&&GH.repo)}
function uiGH(){var ed=isEd(),vw=TEAM&&!ed;document.body.classList.toggle("viewer",vw);
  document.getElementById("pub").style.display=ed?"":"none";document.getElementById("refb").style.display=(TEAM||ed)?"":"none";
  document.getElementById("ghb").textContent=ed?"GitHub: editor conectado":"Entrar como editor"}
/* ---------- perfis: arquivos, senhas, GitHub ---------- */
var TEAM=false,busy=false,flT=null,NETOK=false;
try{var g0=JSON.parse(localStorage.getItem("cs2-gh")||"{}");GH.repo=g0.repo||"";GH.tok=g0.tok||""}catch(e){}
function lset(k,v){try{localStorage.setItem(k,v)}catch(e){throw e}}
function persistDirty(){try{localStorage.setItem("cs2-dirty2",JSON.stringify(DIRTY))}catch(e){}}
function anyDirty(){return Object.keys(DIRTY).some(function(k){return DIRTY[k]})}
function mark(path,json,store){if(CURJ[path]===json)return;CURJ[path]=json;DIRTY[path]=1;lset(store,json);persistDirty()}
function setRO(){RO=sec==="callouts"?(ROU||!(CALLOK&&CAN)):(ROU||!CAN)}
function syncOut(){if(VIEW==null)return;var edp=CAN&&VIEW!=="mx";if(!(edp||CALLOK))return;
  Object.keys(S).forEach(function(k){if(k!=="maps")BASE[k]=S[k]});
  var nb=[];S.maps.forEach(function(m){if(!m.uid)m.uid=newUid();var bm=m.__b,isNew=false;if(!bm){bm={};isNew=true;Object.defineProperty(m,"__b",{value:bm,enumerable:false,writable:true,configurable:true})}
    Object.keys(bm).forEach(function(k){if(PK.indexOf(k)<0&&!(k in m))delete bm[k]});
    Object.keys(m).forEach(function(k){if(PK.indexOf(k)<0)bm[k]=m[k]});
    if(isNew)PK.forEach(function(k){if(m[k]!==undefined)bm[k]=cpy(m[k])});nb.push(bm)});
  BASE.maps=nb;mark("dados.json",JSON.stringify(BASE),KEY);
  if(edp){var ps={maps:{}};S.maps.forEach(function(m){ps.maps[m.uid]=pkOf(m)});if(PD[VIEW]&&PD[VIEW].st)ps.st=PD[VIEW].st;PD[VIEW]=ps;mark("perfis/"+VIEW+".json",JSON.stringify(ps),"cs2-p-"+VIEW)}}
function flushNow(){if(flT){clearTimeout(flT);flT=null}try{syncOut()}catch(e){setSt("Sem espaço para salvar aqui. Baixe um backup e remova imagens pesadas.")}}
function flushSoon(){if(flT)clearTimeout(flT);flT=setTimeout(function(){flT=null;flushNow();setSt(stText())},500)}
function stText(){return"Salvo neste aparelho às "+hora()+(GH.tok&&anyDirty()?" · falta publicar no GitHub":"")}
function save(){flushSoon();setSt(stText())}
window.addEventListener("beforeunload",function(){flushNow()});
function apiUrl(p){return"https://api.github.com/repos/"+GH.repo+"/contents/"+p}
async function getRemote(path){try{
  if(isEd()){var r=await fetch(apiUrl(path),{headers:ghH("application/vnd.github.object+json"),cache:"no-store"});if(r.status===404)return{data:null,sha:null};if(!r.ok)throw new Error(ghErr(r));
    var j=await r.json(),txt;if(j.content&&j.encoding==="base64")txt=unb64(j.content);else{var r2=await fetch(apiUrl(path),{headers:ghH("application/vnd.github.raw+json"),cache:"no-store"});if(!r2.ok)throw new Error(ghErr(r2));txt=await r2.text()}
    return{data:JSON.parse(txt),sha:j.sha}}
  var w=await fetch(path+"?t="+Date.now(),{cache:"no-store"});if(!w.ok)return{data:null,sha:null};return{data:await w.json(),sha:null}
}catch(e){return{data:null,sha:null,err:e}}}
function applyFile(p,d){var s;
  if(p==="dados.json"){if(!(d&&d.maps&&d.maps.length))return;var t=S;BASE=d;S=BASE;migrate();S=t;BASE.maps.forEach(function(m){if(!m.uid)m.uid=newUid()});s=JSON.stringify(BASE);CURJ[p]=s;try{lset(KEY,s)}catch(e){}TEAM=true}
  else if(p==="acesso.json"){var n=Object.assign({},d);Object.keys(ACP).forEach(function(k){if(ACP[k]&&ACC[k])n[k]=ACC[k]});ACC=n;try{lset("cs2-ac",JSON.stringify(ACC))}catch(e){}CURJ[p]=JSON.stringify(ACC)}
  else if(p.indexOf("perfis/")===0){var id=p.slice(7,9);PD[id]=d;s=JSON.stringify(d);CURJ[p]=s;try{lset("cs2-p-"+id,s)}catch(e){}}
  else if(p.indexOf("misto/")===0){var id2=p.slice(6,8);MD[id2]=d;s=JSON.stringify(d);CURJ[p]=s;try{lset("cs2-m-"+id2,s)}catch(e){}}
  DIRTY[p]=0}
function allPaths(){var a=["dados.json","acesso.json"];PROF.forEach(function(p){if(p.id!=="mx"){a.push("perfis/"+p.id+".json");a.push("misto/"+p.id+".json")}});return a}
async function loadAll(){var paths=allPaths(),rs=await Promise.all(paths.map(getRemote)),net=null;
  paths.forEach(function(p,i){var r=rs[i];if(r.err){net=r.err;return}if(r.sha)FSHA[p]=r.sha;if(isEd()&&DIRTY[p])return;if(!r.data)return;applyFile(p,r.data)});
  persistDirty();return net}
function rebuildView(){if(VIEW){S=buildS(VIEW);if(cur>=S.maps.length)cur=0}}
async function startRemote(){if(busy)return;busy=true;var net=null;
  try{flushNow();net=await loadAll();if(isEd())TEAM=true}catch(e){net=e}
  LOADED=true;NETOK=!net;busy=false;if(net&&isEd())setSt("Não consegui falar com o GitHub: "+emsg(net));rebuildView();setRO();uiGH();render();drawerRefresh()}
function permitted(p){if(p==="dados.json")return CALLOK;if(p==="acesso.json")return true;var id=p.replace(/^(perfis|misto)\//,"").slice(0,2);return!!UNL[id]||(p.indexOf("perfis/")===0&&!!BC[id]&&!!UNL.p1)}
function contentOf(p){if(p==="dados.json")return JSON.stringify(BASE);if(p==="acesso.json")return JSON.stringify(ACC);var id=p.replace(/^(perfis|misto)\//,"").slice(0,2);return JSON.stringify(p.indexOf("perfis/")===0?(PD[id]||{maps:{}}):(MD[id]||{items:[]}))}
async function putFile(p,retry){var body={message:"Atualização pelo app ("+hora()+"): "+p,content:b64(contentOf(p))};if(FSHA[p])body.sha=FSHA[p];
  var h=ghH();h["Content-Type"]="application/json";var r=await fetch(apiUrl(p),{method:"PUT",headers:h,body:JSON.stringify(body)});
  if((r.status===409||r.status===422)&&!retry&&p!=="dados.json"){var g=await getRemote(p);if(g.sha)FSHA[p]=g.sha;else delete FSHA[p];if(p==="acesso.json"&&g.data){var n=Object.assign({},g.data);Object.keys(ACP).forEach(function(k){if(ACC[k])n[k]=ACC[k]});ACC=n}return putFile(p,true)}
  if(r.status===409||r.status===422)throw new Error("o arquivo mudou no GitHub desde que você carregou. Use Atualizar do GitHub e refaça a mudança (baixe um backup antes se quiser guardar).");
  if(!r.ok)throw new Error(ghErr(r));var j=await r.json();FSHA[p]=j.content.sha;DIRTY[p]=0;if(p.indexOf("perfis/")===0){delete BC[p.slice(7,9)];try{localStorage.setItem("cs2-bc",JSON.stringify(BC))}catch(e){}}if(p==="acesso.json")ACP={};persistDirty();try{localStorage.setItem("cs2-acp","{}")}catch(e){}}
async function publish(){if(busy)return;if(!isEd()){ghDlg();return}flushNow();
  var todo=Object.keys(DIRTY).filter(function(p){return DIRTY[p]}),ok=[],skip=[],fail=[];
  if(!todo.length){setSt("Nada para publicar.");return}
  busy=true;setSt("Publicando no GitHub…");
  for(var i=0;i<todo.length;i++){var p=todo[i];if(!permitted(p)){skip.push(p);continue}try{await putFile(p);ok.push(p)}catch(e){fail.push(p+": "+emsg(e))}}
  busy=false;
  var m=ok.length?("Publicado às "+hora()+": "+ok.join(", ")+". Só estes arquivos foram escritos."):"Nada foi publicado.";
  if(skip.length)m+=" Não publiquei "+skip.join(", ")+" porque falta a senha correspondente nesta sessão (Callouts ou jogador).";
  if(fail.length)m+=" Falhou: "+fail.join(" | ");setSt(m)}
async function refresh(force){if(busy)return;
  if(!force&&isEd()&&anyDirty()){ask("Há mudanças não publicadas neste aparelho. Carregar do GitHub apaga elas. Continuar?",function(){refresh(true)});return}
  busy=true;setSt("Buscando a versão do GitHub…");
  try{flushNow();if(force){DIRTY={};persistDirty()}var net=await loadAll();if(net)throw net;rebuildView();setRO();render();drawerRefresh();setSt("Atualizado do GitHub às "+hora())}catch(e){setSt("Não atualizou: "+emsg(e))}
  busy=false}
/* senhas */
async function pwHash(salt,pw){var enc=new TextEncoder();
  if(window.crypto&&crypto.subtle){var k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]),b=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:60000},k,256);return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")}
  var h1=5381,h2=52711,s=salt+":"+pw,i;for(i=0;i<s.length;i++){var c=s.charCodeAt(i);h1=(h1*33)^c;h2=(h2*31)^c}return"f"+(h1>>>0).toString(16)+(h2>>>0).toString(16)}
async function mkRec(pw){var s=newUid();return{s:s,h:await pwHash(s,pw)}}
async function chkRec(r,pw){return(await pwHash(r.s,pw))===r.h}
function pwDlg(o){return new Promise(function(res){var ov=el("div",{class:"ov"}),b=el("div",{class:"dlg",role:"dialog","aria-modal":"true"}),p=el("p"),hn=el("p",{class:"hint"}),i1=el("input",{type:"password","aria-label":"Senha",placeholder:"Senha",autocomplete:"off"}),i2=o.create?el("input",{type:"password","aria-label":"Repita a senha",placeholder:"Repita a senha",autocomplete:"off"}):null,er=el("p",{class:"hint"});
  p.textContent=o.title;p.style.fontWeight="700";hn.textContent=o.hint||"";[i1,i2].forEach(function(x){if(x){x.style.border="1px solid var(--line)";x.style.marginBottom="8px";x.style.width="100%"}});er.style.color="#e11d48";
  var r=el("div",{class:"row"}),ok=el("button",{class:"b primary",type:"button"}),no=el("button",{class:"b",type:"button"});ok.textContent=o.create?"Criar senha":"Entrar";no.textContent=o.cancel||"Só ver";
  function close(v){ov.remove();res(v)}
  function go(){var v=i1.value;if(!v){er.textContent="Digite a senha.";return}if(o.create){if(v.length<4){er.textContent="Use pelo menos 4 caracteres.";return}if(v!==i2.value){er.textContent="As duas senhas não são iguais.";return}}close(v)}
  ok.onclick=go;no.onclick=function(){close(null)};[i1,i2].forEach(function(x){if(x)x.onkeydown=function(e){if(e.key==="Enter")go()}});
  r.appendChild(ok);r.appendChild(no);[p,hn,i1,i2,er,r].forEach(function(x){if(x)b.appendChild(x)});ov.appendChild(b);document.body.appendChild(ov);i1.focus()})}
function accSave(key){ACP[key]=1;try{localStorage.setItem("cs2-ac",JSON.stringify(ACC));localStorage.setItem("cs2-acp",JSON.stringify(ACP))}catch(e){}CURJ["acesso.json"]=JSON.stringify(ACC);DIRTY["acesso.json"]=1;persistDirty();
  if(isEd()){putFile("acesso.json").then(function(){setSt("Senha criada e gravada no GitHub às "+hora()+": vale em todas as máquinas.")}).catch(function(e){setSt("A senha ficou só neste aparelho (não gravou no GitHub: "+emsg(e)+"). Use Publicar.")})}
  else setSt("Senha criada só neste aparelho. Para valer em todas as máquinas, entre como editor (token do GitHub) e use Publicar.")}
async function unlockKey(key,label){if(UNL[key])return true;var rec=ACC[key];
  if(!rec&&key==="callouts"&&!UNL.p1){notice("A senha dos Callouts só pode ser criada pelo Player 1. Entre como Player 1 (com a senha dele) e destrave os Callouts; depois todos os outros usam essa mesma senha.");return false}
  if(!rec){var pw=await pwDlg({title:"Criar a senha de "+label,hint:"É a primeira vez: escolha uma senha fixa. Ela fica guardada no GitHub e vale para todas as máquinas. Quem não tiver a senha só consegue ver.",create:true,cancel:"Só ver"});if(!pw)return false;ACC[key]=await mkRec(pw);accSave(key);UNL[key]=1;return true}
  var pw2=await pwDlg({title:"Senha de "+label,hint:"Sem a senha você só consegue ver.",create:false});if(!pw2)return false;
  if(await chkRec(rec,pw2)){UNL[key]=1;return true}setSt("Senha incorreta.");return false}

/* ---------- perfis: interface ---------- */
function mergeTm(T,sps,routes,np,pe,by,uid){routes.forEach(function(r){var s=sps[r.sp],idx=-1;
    if(s){T.sp.forEach(function(q,i){if(idx<0&&Math.hypot(q.x-s.x,q.y-s.y)<60)idx=i});if(idx<0){var z0=cpy(s);z0.n=(s.n||"Respawn")+" ("+by+")";T.sp.push(z0);idx=T.sp.length-1}}else idx=0;
    var z=cpy(r);z.sp=idx;z.nm=(r.nm||"rota")+" · "+by;z.id=uid+"_"+r.id;T.r.push(z)});
  T.np=Math.max(T.np||1,np||1);if(pe&&pe.length&&!(T.pe&&T.pe.length))T.pe=cpy(pe)}
function mistoPK(bm){var rd=function(){return[1,2,3,4,5].map(function(n){return newDef(n,"Round")})};
  var o={defs:{tr:[],ct:[]},calls:{tr:[],ct:[]},fx:{tr:rd(),ct:rd()},tm:{tr:{sp:[],r:[],np:1,pe:[]},ct:{sp:[],r:[],np:1,pe:[]}},ab:{tr:[],ct:[]},ut:{tr:{s:[],u:[]},ct:{s:[],u:[]}},dw:{tr:{s:[]},ct:{s:[]}},ar:{tr:[],ct:[]},igl:{tr:"",ct:""},note:"",vzr:[]},seen={};
  PROF.forEach(function(p){if(p.id==="mx")return;var pm=PD[p.id]&&PD[p.id].maps&&PD[p.id].maps[bm.uid];if(pm&&pm.ut)["tr","ct"].forEach(function(sd){((pm.ut[sd]||{}).u||[]).forEach(function(u){var k=sd+"|"+(u.nm||"")+"|"+u.t+"|"+Math.round(u.x)+"|"+Math.round(u.y);if(seen[k])return;seen[k]=1;o.ut[sd].u.push(cpy(u))})})});
  PROF.forEach(function(p){if(p.id==="mx")return;((MD[p.id]&&MD[p.id].items)||[]).forEach(function(it){if(it.mapUid!==bm.uid)return;var by=pnameP(p.id),sd=it.side==="ct"?"ct":"tr",d=cpy(it.data);
    if(it.kind==="def"||it.kind==="call"){d.name=(d.name||"")+" · "+by;d.by=p.id;(it.kind==="def"?o.defs:o.calls)[sd].push(d)}
    else if(it.kind==="fx"){d.name=(d.name||"")+" · "+by;d.by=p.id;o.fx[sd][it.slot|0]=d}
    else if(it.kind==="tm")mergeTm(o.tm[sd],d.sp||[],d.r||[],d.np,d.pe,by,it.uid);
    else if(it.kind==="route"){var z=cpy(d);z.sp=0;mergeTm(o.tm[sd],it.sp?[it.sp]:[],[z],1,[],by,it.uid)}})});
  var p1=PD.p1&&PD.p1.maps&&PD.p1.maps[bm.uid];CK.forEach(function(k){var v=(p1&&p1[k]!==undefined)?p1[k]:bm[k];if(v!==undefined)o[k]=cpy(v)});
  return o}
function launchCallouts(){
  if(!(VIEW==="p1"&&UNL.p1&&CAN&&CALLOK)){notice("Só o Player 1, com o perfil e os Callouts destravados, pode lançar.");return}
  if(!(LOADED&&(NETOK||!isEd()))){notice("Ainda não li os arquivos dos outros jogadores no GitHub. Use Atualizar do GitHub e tente de novo, para não apagar o que eles já têm.");return}
  flushNow();var n=0;["p2","p3","p4","p5"].forEach(function(id){var pd=PD[id]=PD[id]||{maps:{}};pd.maps=pd.maps||{};
    S.maps.forEach(function(m){var cur=pd.maps[m.uid];if(!cur)cur=cpy(pkOf(m.__b||{}));CK.forEach(function(k){if(m[k]!==undefined)cur[k]=cpy(m[k])});pd.maps[m.uid]=cur});
    var s=JSON.stringify(pd),p="perfis/"+id+".json";CURJ[p]=s;DIRTY[p]=1;BC[id]=1;try{localStorage.setItem("cs2-p-"+id,s)}catch(e){}n++});
  S.maps.forEach(function(m){var bm=m.__b;if(bm)CK.forEach(function(k){if(m[k]!==undefined)bm[k]=cpy(m[k])})});
  mark("dados.json",JSON.stringify(BASE),KEY);try{localStorage.setItem("cs2-bc",JSON.stringify(BC))}catch(e){}persistDirty();
  setSt("Callouts do Player 1 copiados para "+n+" jogadores neste aparelho. Use Publicar para gravar no GitHub (escreve só os arquivos dos jogadores 2 a 5 e o modelo).")}
function launchTimings(){
  if(!(VIEW==="p1"&&UNL.p1&&CAN)){notice("Só o Player 1, com o perfil destravado, pode lançar.");return}
  if(!(LOADED&&(NETOK||!isEd()))){notice("Ainda não li os arquivos dos outros jogadores no GitHub. Use Atualizar do GitHub e tente de novo, para não apagar o que eles já têm.");return}
  flushNow();var n=0;["p2","p3","p4","p5"].forEach(function(id){var pd=PD[id]=PD[id]||{maps:{}};pd.maps=pd.maps||{};
    S.maps.forEach(function(m){var cur=pd.maps[m.uid];if(!cur)cur=cpy(pkOf(m.__b||{}));if(m.tm!==undefined)cur.tm=cpy(m.tm);pd.maps[m.uid]=cur});
    var s=JSON.stringify(pd),p="perfis/"+id+".json";CURJ[p]=s;DIRTY[p]=1;BC[id]=1;try{localStorage.setItem("cs2-p-"+id,s)}catch(e){}n++});
  try{localStorage.setItem("cs2-bc",JSON.stringify(BC))}catch(e){}persistDirty();
  setSt("Timings do Player 1 copiados para "+n+" jogadores neste aparelho. Use Publicar para gravar no GitHub (escreve só os arquivos dos jogadores 2 a 5).")}
function launchBtn(){var sp=el("span");if(VIEW==="p1"&&UNL.p1&&CAN){var ln=el("button",{class:"b primary edt",type:"button"});ln.textContent="📤 Lançar meus Timings para os Players 2 a 5";
  ln.onclick=function(){ask("Isto copia TODOS os timings do Player 1 (respawns, rotas e tempos, dos dois lados, de todos os mapas) para os Players 2, 3, 4 e 5, substituindo os timings deles. Os outros dados deles não mudam. Continuar?",launchTimings)};sp.appendChild(ln)}return sp}
function launchUtils(){
  if(!(VIEW==="p1"&&UNL.p1&&CAN)){notice("Só o Player 1, com o perfil destravado, pode lançar.");return}
  if(!(LOADED&&(NETOK||!isEd()))){notice("Ainda não li os arquivos dos outros jogadores no GitHub. Use Atualizar do GitHub e tente de novo, para não apagar o que eles já têm.");return}
  flushNow();var n=0;["p2","p3","p4","p5"].forEach(function(id){var pd=PD[id]=PD[id]||{maps:{}};pd.maps=pd.maps||{};
    S.maps.forEach(function(m){var cur=pd.maps[m.uid];if(!cur)cur=cpy(pkOf(m.__b||{}));if(m.ut!==undefined)cur.ut=cpy(m.ut);pd.maps[m.uid]=cur});
    var s=JSON.stringify(pd),p="perfis/"+id+".json";CURJ[p]=s;DIRTY[p]=1;BC[id]=1;try{localStorage.setItem("cs2-p-"+id,s)}catch(e){}n++});
  try{localStorage.setItem("cs2-bc",JSON.stringify(BC))}catch(e){}persistDirty();
  setSt("Utilitárias do Player 1 copiadas para "+n+" jogadores neste aparelho. Use Publicar para gravar no GitHub (escreve só os arquivos dos jogadores 2 a 5).")}
;
/* parte 4 de 5 */
function launchUtilBtn(){var sp=el("span");if(VIEW==="p1"&&UNL.p1&&CAN){var ln=el("button",{class:"b primary edt",type:"button"});ln.textContent="📤 Lançar minhas Utilitárias para os Players 2 a 5";
  ln.onclick=function(){ask("Isto copia TODAS as utilitárias do Player 1 (dos dois lados, de todos os mapas, com posições, links e horários) para os Players 2, 3, 4 e 5, substituindo as utilitárias deles. Os outros dados deles não mudam. Continuar?",launchUtils)};sp.appendChild(ln)}return sp}
var TOL=28,LASTB=null;
function rdp(P,e){if(P.length<3)return P;var a=P[0],b=P[P.length-1],dm=0,ix=0;for(var i=1;i<P.length-1;i++){var d=dSeg(P[i],a,b);if(d>dm){dm=d;ix=i}}
  if(dm>e){var l=rdp(P.slice(0,ix+1),e),r=rdp(P.slice(ix),e);return l.slice(0,-1).concat(r)}return[a,b]}
function maskLoops(M,N){
  var W1=N+1,outs={};
  function add(x1,y1,x2,y2){var v=y1*W1+x1;(outs[v]=outs[v]||[]).push(y2*W1+x2)}
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){if(!M[y*N+x])continue;
    if(y===0||!M[(y-1)*N+x])add(x,y,x+1,y);
    if(x===N-1||!M[y*N+x+1])add(x+1,y,x+1,y+1);
    if(y===N-1||!M[(y+1)*N+x])add(x+1,y+1,x,y+1);
    if(x===0||!M[y*N+x-1])add(x,y+1,x,y)}
  var loops=[],ks=Object.keys(outs);
  for(var i=0;i<ks.length;i++){var v=+ks[i];while(outs[v]&&outs[v].length){var P=[v],cur=v;
    while(outs[cur]&&outs[cur].length){var nx=outs[cur].pop();P.push(nx);cur=nx}
    loops.push(P.map(function(q){return[q%W1,Math.floor(q/W1)]}))}}
  return loops}
function fillMask(D,N,sx,sy,tol){
  var i0=(sy*N+sx)*4,r0=D[i0],g0=D[i0+1],b0=D[i0+2],T2=tol*tol,M=new Uint8Array(N*N),st=[sy*N+sx],cnt=0;M[st[0]]=1;
  while(st.length){var k=st.pop();cnt++;var kx=k%N,ky=(k-kx)/N;
    for(var q=0;q<4;q++){var nx=kx+(q===0?1:q===1?-1:0),ny=ky+(q===2?1:q===3?-1:0);if(nx<0||ny<0||nx>=N||ny>=N)continue;var nk=ny*N+nx;if(M[nk])continue;
      var j=nk*4,a=D[j]-r0,b=D[j+1]-g0,c=D[j+2]-b0;if(a*a+b*b+c*c>T2)continue;M[nk]=1;st.push(nk)}}
  return{M:M,cnt:cnt}}
function paintBucket(m,p,f,tol,done){
  var src=bktSrc(m,f);if(!src){setSt("Este mapa não tem imagem de radar. Envie uma imagem na aba Mapa.");return}
  var im=new Image();im.onerror=function(){setSt("Não consegui abrir a imagem do radar.")};
  im.onload=function(){
    var N=384,c=document.createElement("canvas");c.width=c.height=N;var x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,N,N);
    var D;try{D=x.getImageData(0,0,N,N).data}catch(e){setSt("Não consegui ler os pixels da imagem do radar.");return}
    var sx=Math.max(0,Math.min(N-1,Math.floor(p[0]/1000*N))),sy=Math.max(0,Math.min(N-1,Math.floor(p[1]/1000*N)));
    var fm=fillMask(D,N,sx,sy,tol),loops=maskLoops(fm.M,N),sc=1000/N,out=[],tot=0;
    loops.forEach(function(L){if(L.length<14)return;var q=rdp(L,1.5);if(q.length<3)return;out.push(q.map(function(a){return[Math.round(a[0]*sc),Math.round(a[1]*sc)]}));tot+=q.length-1});
    if(!out.length){setSt("A lata não achou borda neste ponto. Tente outra cor parecida.");return}
    if(tot>4000){setSt("A lata criaria "+tot+" trechos de parede, é demais e deixaria o simulador lento. Diminua a cor parecida ou clique numa área menor.");return}
    var arr=wlOf(m,f);out.forEach(function(q){arr.push(q)});LASTB={m:m,arr:arr,n:out.length};
    setSt("Lata de tinta: "+out.length+" paredes criadas ("+tot+" trechos). Use Desfazer lata de tinta se não gostou.");if(done)done()};
  im.src=src}
function bktSrc(m,f){var k=(m.name||"").toLowerCase().replace(/[^a-z0-9]/g,"");if(RADARS_L[k]&&f===0)return RADARS_L[k];return radarOf(m)}
function fxSets(m){m.fxo=m.fxo||{};["tr","ct"].forEach(function(sd){if(!m.fxo[sd]||!m.fxo[sd].length)m.fxo[sd]=[{n:"Fixo 1",r:null,a:1}];if(!m.fxo[sd].some(function(x){return x.a}))m.fxo[sd][0].a=1})}
function fxTabs(m){
  fxSets(m);var sd=side,L=m.fxo[sd],act=0,d=el("div"),w=el("div",{class:"tb"}),rw=el("div",{class:"row edt"});
  L.forEach(function(x,i){if(x.a)act=i});
  L.forEach(function(x,i){var b=el("button",{class:"tool",type:"button","aria-pressed":i===act});b.textContent=x.n||("Fixo "+(i+1));
    b.onclick=function(){if(i===act)return;L[act].r=m.fx[sd];L[act].a=0;m.fx[sd]=x.r;x.r=null;x.a=1;save();render()};w.appendChild(b)});
  var nb=el("button",{class:"tool edt",type:"button"});nb.textContent="+ Novo fixo";
  nb.onclick=function(){L[act].r=m.fx[sd];L[act].a=0;L.push({n:"Fixo "+(L.length+1),r:null,a:1});m.fx[sd]=[1,2,3,4,5].map(function(n){return newDef(n,"Round")});fxp=["G","G","G","G"];save();render()};w.appendChild(nb);
  var ren=field("input",L[act].n||"","Nome deste fixo (ex: Pistol alternativo)",function(v){L[act].n=v});ren.style.maxWidth="280px";rw.appendChild(ren);
  if(L.length>1){var dl=el("button",{class:"b danger",type:"button"});dl.textContent="Excluir este fixo";
    dl.onclick=function(){ask("Excluir este fixo inteiro (os 5 rounds e todas as variações de ganhou/perdeu)? Não dá para desfazer.",function(){L.splice(act,1);var nx=L[Math.min(act,L.length-1)];nx.a=1;m.fx[sd]=nx.r;nx.r=null;save();render()})};rw.appendChild(dl)}
  d.appendChild(w);d.appendChild(rw);return d}
function whoText(){if(!VIEW)return"Escolha um perfil na aba <<< (ou na tela de entrada).";var n=pnameP(VIEW);
  if(VIEW==="mx")return"Perfil: Misto · só dá para adicionar itens (de "+(ME?pnameP(ME):"ninguém logado")+"); aparece quem fez cada um.";
  return"Perfil: "+n+" · "+(CAN?"editando":(UNL[VIEW]?"senha ok, mas sem token do GitHub (só visualização)":"só visualização (sem a senha)"))}
async function openProfile(id){if(id===VIEW&&(id==="mx"||UNL[id]))return;flushNow();var okp=false;
  if(id!=="mx"){okp=await unlockKey(id,pnameP(id));if(okp)ME=id}
  VIEW=id;CAN=okp&&id!=="mx"&&(!TEAM||isEd());rebuildView();setRO();render();drawerRefresh();
  if(okp&&TEAM&&!isEd())setSt("Senha ok, mas este aparelho não tem o token do GitHub: dá para ver, não para editar. Use Entrar como editor.")}
function pickBtn(p,cb){var b=el("button",{class:"pf",type:"button"});b.style.setProperty("--c",p.i>=0?COLORS[p.i%5]:"#9aa7b0");
  var n=el("strong");n.textContent=p.i>=0?pnameP(p.id):"Misto";b.appendChild(n);var s=el("span",{class:"hint"});
  s.textContent=p.i<0?"só adicionar":(ACC[p.id]?(UNL[p.id]?"destravado":"com senha"):"criar senha");b.appendChild(s);b.onclick=function(){cb(p.id)};return b}
var PICK=null;
function showPicker(o){o=o||{};if(PICK)PICK.el.remove();var ov=el("div",{class:"ov"}),b=el("div",{class:"dlg",role:"dialog","aria-modal":"true"}),t=el("p"),hn=el("p",{class:"hint"}),L=el("div");
  t.textContent=o.title||"Quem é você?";t.style.fontWeight="700";hn.textContent=o.hint||"Escolha o seu perfil. Cada um tem a própria senha (a primeira vez você cria). Sem a senha dá para entrar e só ver.";
  PROF.forEach(function(p){if(o.onlyPlayers&&p.i<0)return;var pb=pickBtn(p,function(id){ov.remove();PICK=null;(o.pick||openProfile)(id)});if(p.i<0)pb.style.marginTop="12px";pb.disabled=!LOADED&&!o.force;L.appendChild(pb)});
  var cl=el("button",{class:"b",type:"button"});cl.textContent=o.close||"Fechar";cl.style.marginTop="10px";cl.onclick=function(){ov.remove();PICK=null};
  [t,hn,L,cl].forEach(function(x){b.appendChild(x)});ov.appendChild(b);document.body.appendChild(ov);PICK={el:ov,L:L};
  if(!LOADED)setTimeout(function(){if(PICK&&PICK.el===ov)PICK.L.querySelectorAll("button").forEach(function(x){x.disabled=false})},5000)}
function drawerRefresh(){var d=document.getElementById("drwl");if(!d)return;d.innerHTML="";PROF.forEach(function(p){var b=pickBtn(p,function(id){openProfile(id)});if(p.id===VIEW)b.classList.add("on");if(p.i<0)b.style.marginTop="12px";d.appendChild(b)});
  if(PICK&&LOADED)PICK.L.querySelectorAll("button").forEach(function(x){x.disabled=false});var w=document.getElementById("who");if(w)w.textContent=whoText()}
function mkDrawer(){var d=el("div",{id:"drw"}),t=el("button",{id:"drwb",type:"button","aria-expanded":"false","aria-label":"Abrir ou fechar a lista de perfis"}),l=el("div",{id:"drwl"});t.textContent="<<<";l.style.display="none";
  t.onclick=function(){var o=l.style.display==="none";l.style.display=o?"flex":"none";t.textContent=o?">>>":"<<<";t.setAttribute("aria-expanded",String(o));if(o)drawerRefresh()};
  d.appendChild(t);d.appendChild(l);document.body.appendChild(d);drawerRefresh()}
function addMisto(it){var d=MD[ME]=MD[ME]||{items:[]};d.items=d.items||[];
  if(it.kind==="fx")d.items=d.items.filter(function(x){return!(x.kind==="fx"&&x.mapUid===it.mapUid&&x.side===it.side&&x.slot===it.slot)});
  it.uid=newUid();it.at=Date.now();d.items.push(it);saveMisto()}
function saveMisto(){var d=MD[ME],s=JSON.stringify(d),p="misto/"+ME+".json";CURJ[p]=s;DIRTY[p]=1;try{localStorage.setItem("cs2-m-"+ME,s)}catch(e){}persistDirty();rebuildView();render();setSt(stText())}
function mistoPanel(m){var w=el("div",{class:"uc",id:"mxp"}),h=el("strong"),hint=el("p",{class:"hint"});
  h.textContent="Misto: aqui você não cria nada, só adiciona. O nome de quem fez aparece em cada item.";w.appendChild(h);
  if(!ME){hint.textContent="Para adicionar algo seu ao Misto, entre como jogador (com a sua senha).";w.appendChild(hint);var nb=el("button",{class:"b primary",type:"button"});nb.textContent="Entrar como jogador";
    nb.onclick=function(){showPicker({onlyPlayers:true,title:"Quem vai adicionar?",hint:"Entre com a senha do jogador que está adicionando.",pick:async function(id){if(await unlockKey(id,pnameP(id))){ME=id;rebuildView();render();drawerRefresh()}}})};w.appendChild(nb);return w}
  var pm=(PD[ME]&&PD[ME].maps&&PD[ME].maps[m.uid])||(m.__b?pkOf(m.__b):{}),sd=side,kind=sec==="defs"?"def":sec==="calls"?"call":sec==="fixo"?"fx":"timing",opts=[],pick=null;
  hint.textContent="Adicionando como "+pnameP(ME)+" ("+m.name+", lado "+sd.toUpperCase()+").";w.appendChild(hint);
  var row=el("div",{class:"row"}),sel=el("select");
  if(kind==="def"||kind==="call"){((kind==="def"?pm.defs:pm.calls)||{})[sd]&&((kind==="def"?pm.defs:pm.calls)[sd]).forEach(function(d,i){opts.push([i,d.name||("Item "+(i+1))])})}
  else if(kind==="fx"){((pm.fx||{})[sd]||[]).forEach(function(d,i){opts.push([i,"Round "+(i+1)+" → vai para o slot "+(i+1)])})}
  else{var T=(pm.tm||{})[sd]||{sp:[],r:[]};opts.push(["all","Timing completo (todas as rotas)"]);(T.r||[]).forEach(function(r,i){var s0=T.sp[r.sp];opts.push([i,"Rota: "+((s0&&s0.n)||("Respawn "+(r.sp+1)))+" · "+(r.nm||"rota")+" · P"+(r.n||1)])})}
  opts.forEach(function(o){var op=el("option",{value:o[0]});op.textContent=o[1];sel.appendChild(op)});row.appendChild(sel);
  var ad=el("button",{class:"b primary",type:"button"});ad.textContent="Adicionar ao Misto";ad.disabled=!opts.length;
  ad.onclick=function(){var v=sel.value;
    if(kind==="def"||kind==="call"){var d=((kind==="def"?pm.defs:pm.calls)[sd]||[])[+v];if(d)addMisto({kind:kind,mapUid:m.uid,side:sd,data:cpy(d)})}
    else if(kind==="fx"){var f=((pm.fx||{})[sd]||[])[+v];if(f)addMisto({kind:"fx",mapUid:m.uid,side:sd,slot:+v,data:cpy(f)})}
    else{var T2=(pm.tm||{})[sd]||{sp:[],r:[]};if(v==="all")addMisto({kind:"tm",mapUid:m.uid,side:sd,data:cpy({sp:T2.sp,r:T2.r,np:T2.np,pe:T2.pe})});else{var r=T2.r[+v];if(r)addMisto({kind:"route",mapUid:m.uid,side:sd,data:cpy(r),sp:cpy(T2.sp[r.sp]||null)})}}};
  row.appendChild(ad);w.appendChild(row);
  var mine=((MD[ME]&&MD[ME].items)||[]).filter(function(x){return x.mapUid===m.uid&&x.side===sd});
  if(mine.length){var lt=el("p",{class:"hint"});lt.textContent="Seus itens neste mapa e lado:";w.appendChild(lt);
    mine.forEach(function(it){var r2=el("div",{class:"row"}),tx=el("span");tx.textContent=({def:"Default",call:"Call",fx:"Fixo "+((it.slot|0)+1),tm:"Timing completo",route:"Rota"})[it.kind]+" · "+(it.data.name||it.data.nm||"");r2.appendChild(tx);
      var rb=el("button",{class:"b",type:"button"});rb.textContent="Tirar do Misto";rb.onclick=function(){MD[ME].items=MD[ME].items.filter(function(x){return x.uid!==it.uid});saveMisto()};r2.appendChild(rb);w.appendChild(r2)})}
  return w}
function decorate(){var box=document.getElementById("map");if(!box)return;var old=document.getElementById("mxp");if(old)old.remove();
  if(VIEW==="mx"&&["defs","calls","fixo","timing"].indexOf(sec)>=0&&S.maps[cur])box.insertBefore(mistoPanel(S.maps[cur]),box.firstChild);
  var w=document.getElementById("who");if(w)w.textContent=whoText()}
function utilImgView(){var w=el("div",{class:"mm"}),h=el("p",{class:"hint"});
  h.textContent="Cada tipo de utilitária tem duas imagens. NÃO LANÇADA: aparece embaixo do jogador quando ele está segurando e no mapa quando ela é largada (drop); sai menor para dar para ver a diferença. LANÇADA: aparece voando e no lugar onde a utilitária cai. Sem imagem, vale o ícone padrão (o da não lançada vem com um aro tracejado). As imagens ficam salvas e valem para todos.";w.appendChild(h);
  [["smoke","Smoke"],["flash","Flash"],["he","HE"],["molotov","Molotov / Incendiária"],["decoy","Decoy"]].forEach(function(t){var box=el("div",{class:"uc"}),lb=el("strong");lb.textContent=t[1];box.appendChild(lb);
    [["uimg","Não lançada (segurando / largada)",function(){return icoHeld(t[0])}],["uimgT","Lançada (voando e no mapa)",function(){return icoT(t[0])}]].forEach(function(k){
      var row=el("div",{class:"row"}),nm=el("span",{class:"hint"}),pv=el("div");nm.textContent=k[1];nm.style.minWidth="230px";
      function show(){pv.innerHTML='<svg width="52" height="52" viewBox="-16 -16 32 32" aria-hidden="true" style="background:#1b2228;border-radius:6px">'+k[2]()+'</svg>'}
      var inp=el("input",{type:"file",accept:"image/*","aria-label":k[1]+": "+t[1]});inp.className="edt";inp.onchange=function(){var f=inp.files[0];if(!f)return;ASSETS.upload(f,128).then(function(r){S[k[0]]=S[k[0]]||{};S[k[0]][t[0]]=r.id;save();show()})};
      var cl=el("button",{class:"b edt",type:"button"});cl.textContent="Voltar ao ícone padrão";cl.onclick=function(){if(S[k[0]])delete S[k[0]][t[0]];save();show()};
      show();[nm,pv,inp,cl].forEach(function(x){row.appendChild(x)});box.appendChild(row)});
    w.appendChild(box)});return w}

function ghDlg(){
  var o=el("div",{class:"ov"}),b=el("div",{class:"dlg",role:"dialog","aria-modal":"true"}),p=el("p"),p2=el("p",{class:"hint"});
  p.textContent="Entrar como editor do GitHub";p.style.fontWeight="700";
  p2.textContent="Use um token fine-grained criado só para este repositório, com a permissão Contents: leitura e escrita. O token fica só neste aparelho.";
  var ri=el("input",{"aria-label":"Repositório","placeholder":"dono/repositório (ex: time/defaults)"}),ti=el("input",{"aria-label":"Token","type":"password","placeholder":GH.tok?"Token já salvo (deixe vazio para manter)":"Token do GitHub",autocomplete:"off"});
  ri.value=GH.repo||guessRepo();[ri,ti].forEach(function(x){x.style.border="1px solid var(--line)";x.style.marginBottom="8px"});
  var r=el("div",{class:"row"}),ok=el("button",{class:"b primary",type:"button"}),no=el("button",{class:"b",type:"button"}),ex=el("button",{class:"b danger",type:"button"});
  ok.textContent="Salvar";no.textContent="Cancelar";ex.textContent="Sair (apagar token)";
  function close(){o.remove()}
  ok.onclick=function(){var rp=ri.value.trim().replace(/^https?:\/\/github\.com\//i,"").replace(/\.git$/i,"").replace(/\/$/,""),tk=ti.value.trim()||GH.tok;
    if(!/^[\w.-]+\/[\w.-]+$/.test(rp)){setSt("Escreva o repositório como dono/nome.");return}if(!tk){setSt("Cole o token.");return}
    GH.repo=rp;GH.tok=tk;try{localStorage.setItem("cs2-gh",JSON.stringify(GH))}catch(e){}close();
    setRO();uiGH();startRemote()};
  ex.onclick=function(){GH.tok="";try{localStorage.removeItem("cs2-gh");localStorage.removeItem("cs2-sha");localStorage.removeItem("cs2-dirty")}catch(e){}FSHA={};DIRTY={};persistDirty();close();uiGH();startRemote()};
  no.onclick=close;r.appendChild(ok);r.appendChild(no);if(GH.tok)r.appendChild(ex);
  [p,p2,ri,ti,r].forEach(function(x){b.appendChild(x)});o.appendChild(b);o.onclick=function(e){if(e.target===o)close()};document.body.appendChild(o);ri.focus()}
document.getElementById("ghb").onclick=ghDlg;
document.getElementById("pub").onclick=publish;
document.getElementById("refb").onclick=function(){refresh(false)};



/* ===== Plataforma, Configurações (tema + descrições por perfil) ===== */
var THEMES=[
 {n:"Padrão",c:{bg:"#e8ecef",card:"#f7f9fa",ink:"#18242d",mute:"#5b6b76",line:"#c5ced4",acc:"#2457c5"},k:{bg:"#141b21",card:"#1d262d",ink:"#e6ecf0",mute:"#93a3ae",line:"#33414b",acc:"#6f9bff"}},
 {n:"Preto e branco",c:{bg:"#ffffff",card:"#f2f2f2",ink:"#000000",mute:"#444444",line:"#bdbdbd",acc:"#000000"}},
 {n:"Noite azul",c:{bg:"#0b1220",card:"#131c2e",ink:"#e6edf7",mute:"#8da2c0",line:"#243452",acc:"#4f8cff"}},
 {n:"Floresta",c:{bg:"#0f1a14",card:"#16251c",ink:"#e4f1e8",mute:"#8fb09b",line:"#26402f",acc:"#3ecf74"}},
 {n:"Areia",c:{bg:"#efe4cf",card:"#f7efdf",ink:"#3a2e1c",mute:"#7a6a4f",line:"#d3c3a3",acc:"#b5651d"}},
 {n:"Roxo",c:{bg:"#1a1224",card:"#241a33",ink:"#efe6fb",mute:"#a995c9",line:"#3d2d57",acc:"#a66bff"}},
 {n:"Laranja TR",c:{bg:"#1c1209",card:"#281a0d",ink:"#fbeedd",mute:"#c5a983",line:"#4a3319",acc:"#f0a030"}},
 {n:"Azul CT",c:{bg:"#e6f0fb",card:"#f4f9ff",ink:"#0d2a4d",mute:"#4d6a8f",line:"#bcd0ea",acc:"#1e5fbf"}},
 {n:"Alto contraste",c:{bg:"#000000",card:"#0d0d0d",ink:"#ffffff",mute:"#d0d0d0",line:"#8a8a8a",acc:"#ffe14d"}},
 {n:"Personalizado",cu:1,c:null}
];
var PLATS=[["pc","Computador","mouse e tela grande"],["mobile","Celular","toque e tela pequena"]];
var CFGK=null,DSC="all",DSCOBS=null,DSCBUSY=false;
function platGet(){try{var p=localStorage.getItem("cs2-plat");return p==="pc"||p==="mobile"?p:""}catch(e){return""}}
function platSet(v){try{localStorage.setItem("cs2-plat",v)}catch(e){}document.documentElement.setAttribute("data-plat",v);styApply()}
function platAuto(){return(window.matchMedia&&matchMedia("(pointer:coarse)").matches)||window.innerWidth<700?"mobile":"pc"}
function platPick(done){var old=document.getElementById("platov");if(old)old.remove();
 var ov=el("div",{class:"ov",id:"platov"}),b=el("div",{class:"dlg",role:"dialog","aria-modal":"true","aria-label":"Escolher a plataforma"}),t=el("p"),hn=el("p",{class:"hint nodsc"}),L=el("div"),cur=platGet()||platAuto();
 t.textContent="Em que você está usando o site?";t.style.fontWeight="700";hn.textContent="Isso ajusta o tamanho dos botões e do mapa. Dá para trocar depois em Configurações.";
 PLATS.forEach(function(p){var bt=el("button",{class:"pf",type:"button"});bt.style.setProperty("--c","var(--acc)");bt.style.marginBottom="8px";if(p[0]===cur)bt.classList.add("on");
  var n=el("strong"),s=el("span",{class:"hint nodsc"});n.textContent=p[1];s.textContent=p[2];bt.appendChild(n);bt.appendChild(s);
  bt.onclick=function(){platSet(p[0]);ov.remove();if(done)done()};L.appendChild(bt)});
 [t,hn,L].forEach(function(x){b.appendChild(x)});ov.appendChild(b);document.body.appendChild(ov);L.firstChild.focus()}
function cfgKey(){return(typeof VIEW!=="undefined"&&VIEW)||(typeof ME!=="undefined"&&ME)||"_"}
function cfgGet(k){try{return JSON.parse(localStorage.getItem("cs2-cfg-"+k)||"{}")||{}}catch(e){return{}}}
function cfgSave(k,o){try{localStorage.setItem("cs2-cfg-"+k,JSON.stringify(o))}catch(e){}}
function cfgWho(){var k=cfgKey();return k==="_"?"este aparelho (nenhum perfil escolhido)":k==="mx"?"Misto":pnameP(k)}
function themeIdx(c){var n=c.t;if(n==null){try{n=parseInt(localStorage.getItem("cs2-tema"),10)}catch(e){}}return n>=0&&n<THEMES.length?n:0}
function themeApply(n){var h=document.documentElement;if(n>0)h.setAttribute("data-t",n);else h.removeAttribute("data-t");if(n===9){var u=cuGet();CUKEYS.forEach(function(k){h.style.setProperty("--"+k,u[k])});h.style.colorScheme=lumc(u.bg)<.5?"dark":"light"}else{CUKEYS.forEach(function(k){h.style.removeProperty("--"+k)});h.style.colorScheme=""}}
function cfgApply(force){var k=cfgKey();if(!force&&k===CFGK)return;CFGK=k;var c=cfgGet(k);themeApply(themeIdx(c));styApply();DSC=c.d==="none"||c.d==="short"?c.d:"all";descApply()}
function setTheme(n){var k=cfgKey(),c=cfgGet(k);c.t=n;cfgSave(k,c);try{localStorage.setItem("cs2-tema",n)}catch(e){}themeApply(n);render()}
function setDsc(v){var k=cfgKey(),c=cfgGet(k);c.d=v;cfgSave(k,c);DSC=v;descApply();render()}
/* descrições do site: só <p class="hint"> e <p class="sub"> de texto fixo; avisos, status e diálogos ficam sempre */
var DSC_DYN=/^(Larga aos|Adicionando como|Seus itens|Demo do mapa|lança no seg|\(tempo estimado|Nenhum|Sem |Relógio|Round \d|Dura |Lanterna|Perfil)|\bseg\b.*·/;
function dscOk(p,t){var n=t.length;if(/^Dura \d/.test(t))return true;if(n<30||DSC_DYN.test(t)||t.indexOf("·")>=0||/:$/.test(t))return false;return(p.tagName==="P"&&n>=60)||/[.!)]$/.test(t)}
function dscShort(t){var x=t.trim();if(/^Dura \d/.test(x)){var y=x.replace(/\s*\(.*$/,"");return y||x}x=x.trim(),m=x.match(/^[\s\S]*?[.!?](?=\s|$)/),s=m?m[0]:x;if(s.length>140)s=s.slice(0,137).replace(/\s+\S*$/,"")+"…";return s.length>=x.length*.85?x:s}
function descApply(){if(DSCBUSY)return;DSCBUSY=true;if(DSCOBS)DSCOBS.disconnect();
 try{document.querySelectorAll("p.hint,p.sub,span.hint,div.hint").forEach(function(p){
  if(p.id==="who"||p.classList.contains("nodsc")||p.children.length||p.closest(".ov,#drw,.pf,.tt,.tstrip,.tabs,button")||(p.style&&p.style.color))return;
  var cur=p.textContent,full=(p.__cut!==undefined&&cur===p.__cut)?p.__full:cur;
  if(!dscOk(p,full)){if(p.__cut!==undefined){p.textContent=full;p.__cut=undefined}p.classList.remove("dsc-off");return}
  p.__full=full;
  if(DSC==="short"){var w=dscShort(full);if(w!==full){if(cur!==w)p.textContent=w;p.__cut=w;p.title=full}else{p.__cut=undefined}p.classList.remove("dsc-off")}
  else{if(p.__cut!==undefined&&cur===p.__cut)p.textContent=full;p.__cut=undefined;p.removeAttribute("title");p.classList.toggle("dsc-off",DSC==="none")}})}catch(e){}
 DSCBUSY=false;if(DSCOBS)DSCOBS.observe(document.body,{childList:true,subtree:true,characterData:true})}
var DSCT=0;
function rangeSync(r){var mn=+r.min||0,mx=r.max===""?100:+r.max,v=+r.value;r.style.setProperty("--p",mx>mn?Math.max(0,Math.min(1,(v-mn)/(mx-mn))):0)}
function rangeAll(){document.querySelectorAll("input[type=range]").forEach(rangeSync)}
document.addEventListener("input",function(e){if(e.target&&e.target.type==="range")rangeSync(e.target)},true);
document.addEventListener("click",function(){requestAnimationFrame(rangeAll)},true);
DSCOBS=new MutationObserver(function(){if(DSCT)return;DSCT=requestAnimationFrame(function(){DSCT=0;descApply();rangeAll()})});
function thumbHtml(c,w){return'<div style="width:'+w+'px;height:46px;flex:none;border-radius:6px;border:1px solid '+c.line+';background:'+c.bg+';padding:5px;display:flex;flex-direction:column;gap:4px" aria-hidden="true"><div style="display:flex;gap:3px"><i style="width:20px;height:7px;border-radius:3px;background:'+c.acc+'"></i><i style="width:20px;height:7px;border-radius:3px;background:'+c.card+';border:1px solid '+c.line+'"></i></div><div style="flex:1;background:'+c.card+';border:1px solid '+c.line+';border-radius:4px;padding:4px"><i style="display:block;width:70%;height:4px;border-radius:2px;background:'+c.ink+'"></i><i style="display:block;width:90%;height:3px;border-radius:2px;margin-top:4px;background:'+c.mute+'"></i></div></div>'}
var STY_DEF={fs:16,mw:980,rd:6},STY_OPT=[["fs","Tamanho da letra",12,22],["mw","Largura do conteúdo",700,1500],["rd","Arredondamento dos botões",0,16]],CFGTAB="";
function styGet(plat){var c=cfgGet(cfgKey());return c[plat]&&typeof c[plat]==="object"?c[plat]:null}
function styApply(){var h=document.documentElement,p=platGet()||platAuto(),s=styGet(p);STY_OPT.forEach(function(o){var v=s&&s[o[0]]!=null?s[o[0]]:null;if(v==null)h.style.removeProperty("--"+o[0]);else h.style.setProperty("--"+o[0],v+"px")})}
function stySet(plat,key,val){var k=cfgKey(),c=cfgGet(k);c[plat]=c[plat]||{};c[plat][key]=val;cfgSave(k,c);if((platGet()||platAuto())===plat)styApply()}
function styReset(plat){var k=cfgKey(),c=cfgGet(k);delete c[plat];cfgSave(k,c);styApply();render()}
var CUDEF={bg:"#0b1220",card:"#131c2e",ink:"#e6edf7",mute:"#8da2c0",line:"#243452",acc:"#4f8cff",on:"#ffffff"},CUKEYS=["bg","card","ink","mute","line","acc","on"],CUTAB="pri";
var CUPRI=["#2457c5","#4f8cff","#1e5fbf","#06b6d4","#14b8a6","#16a34a","#3ecf74","#facc15","#f0a030","#f97316","#ef4444","#e11d48","#ec4899","#a66bff","#8b5cf6","#ffffff"];
var CUSEC=["#ffffff","#e8ecef","#efe4cf","#e6f0fb","#fdf2f8","#ecfdf5","#1f2937","#141b21","#0b1220","#1e293b","#0f1a14","#1a1224","#1c1209","#2a1a1a","#111111","#000000"];
function hex2rgb(h){h=h.replace("#","");var n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255]}
function rgb2hex(a){return"#"+a.map(function(v){return("0"+Math.max(0,Math.min(255,Math.round(v))).toString(16)).slice(-2)}).join("")}
function mixc(a,b,t){var x=hex2rgb(a),y=hex2rgb(b);return rgb2hex([x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t])}
function lumc(h){var c=hex2rgb(h);return(.2126*c[0]+.7152*c[1]+.0722*c[2])/255}
function cuGet(){var o=cfgGet(cfgKey()).cu||{},r={};CUKEYS.forEach(function(k){r[k]=/^#[0-9a-f]{6}$/i.test(o[k]||"")?o[k]:CUDEF[k]});return r}
function cuSave(o,sel){var k=cfgKey(),c=cfgGet(k);c.cu=o;if(sel){c.t=9;try{localStorage.setItem("cs2-tema",9)}catch(e){}}cfgSave(k,c);if(themeIdx(c)===9)themeApply(9)}
function cuFromBg(u,bg){var dk=lumc(bg)<.5,ink=dk?"#e8eef6":"#18242d";u.bg=bg;u.card=mixc(bg,"#ffffff",dk?.07:.55);u.ink=ink;u.mute=mixc(ink,bg,.42);u.line=mixc(bg,ink,.18);return u}
function cuOn(a){return lumc(a)>.6?"#101820":"#ffffff"}
function tcol(i){return THEMES[i].cu?cuGet():THEMES[i].c}
function swGrid(list,cur,pick){var g=el("div");g.style.cssText="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px";
 list.forEach(function(c){var on=c.toLowerCase()===String(cur).toLowerCase(),b=el("button",{type:"button","aria-label":c,"aria-pressed":on});b.title=c;b.style.cssText="width:30px;height:30px;border-radius:6px;cursor:pointer;padding:0;border:2px solid "+(on?"var(--ink)":"var(--line)")+";background:"+c;b.onclick=function(){pick(c)};g.appendChild(b)});return g}
function colorRow(label,key,u){var l=el("label",{class:"sl"}),sp=el("span"),i=el("input",{type:"color","aria-label":label}),h=el("span");sp.textContent=label;sp.style.minWidth="190px";i.value=u[key];i.style.cssText="width:44px;height:30px;padding:0;border:1px solid var(--line);background:transparent;cursor:pointer";h.textContent=u[key];h.style.cssText="font-size:12px;min-width:64px";l.style.cssText="display:flex;align-items:center;gap:10px;margin-top:8px";
 i.oninput=function(){u[key]=i.value;h.textContent=i.value;cuSave(u,true)};i.onchange=function(){render()};l.appendChild(sp);l.appendChild(i);l.appendChild(h);return l}
function shareView(kind,nm,own,take){var id=cfgKey(),sh=el("div",{class:"uc"});sh.style.marginTop="14px";
 var h=el("h2");h.textContent="Compartilhar · "+nm;sh.appendChild(h);
 var n=el("p",{class:"hint"});n.textContent="Enviar arquivo: publica o seu "+nm.toLowerCase().replace(" · "," de ")+" para os outros jogadores poderem pegar. Pegar arquivo: copia para o seu perfil o que outro jogador enviou. Ninguém é obrigado a usar: quem prefere o jeito atual é só não pegar nada.";sh.appendChild(n);
 var msg=el("p",{class:"hint nodsc"});msg.setAttribute("role","status");
 var r1=el("div",{class:"row"});r1.style.marginTop="8px";var sb=el("button",{class:"b",type:"button"});sb.textContent="Enviar arquivo";
 sb.onclick=function(){if(!/^p\d$/.test(id)){msg.textContent="Abra um perfil de jogador para enviar.";return}
  if(!CAN||VIEW!==id){msg.textContent="Só dá para enviar com este perfil destravado (senha) e com o token de editor do GitHub neste aparelho.";return}
  try{PD[id]=PD[id]||{maps:{}};PD[id].st=PD[id].st||{};PD[id].st[kind]=cpy(own());mark("perfis/"+id+".json",JSON.stringify(PD[id]),"cs2-p-"+id);setSt(stText());msg.textContent="Enviado. Falta publicar no GitHub (botão Publicar) para os outros receberem."}catch(e){msg.textContent="Não consegui enviar: sem espaço para salvar aqui."}};
 r1.appendChild(sb);sh.appendChild(r1);
 var gt=el("p",{class:"hint nodsc"});gt.textContent="Pegar arquivo de:";gt.style.marginTop="10px";sh.appendChild(gt);var r2=el("div",{class:"row"});
 PROF.forEach(function(p){if(p.i<0||p.id===id)return;var has=PD[p.id]&&PD[p.id].st&&PD[p.id].st[kind],b=el("button",{class:"b",type:"button"});b.textContent=pnameP(p.id)+(has?"":" (sem arquivo)");b.disabled=!has;
  b.onclick=function(){take(cpy(PD[p.id].st[kind]));render()};r2.appendChild(b)});
 sh.appendChild(r2);sh.appendChild(msg);return sh}
function styPlatView(plat){var nm=plat==="pc"?"Computador":"Celular",box=el("div",{class:"uc"}),s=styGet(plat)||{};
 function title(t){var h=el("h2");h.textContent=t;return h}
 function note(t){var p=el("p",{class:"hint"});p.textContent=t;return p}
 box.appendChild(title("Estilo do site · "+nm));
 box.appendChild(note("Vale só quando o site está em "+nm+" e fica salvo no perfil aberto ("+cfgWho()+"). O que você não mexer continua do jeito atual do site."));
 STY_OPT.forEach(function(o){var l=el("label",{class:"sl"}),sp=el("span"),r=el("input",{type:"range",min:o[2],max:o[3],step:1,"aria-label":o[1]}),v=el("span");
  var cur=s[o[0]]!=null?s[o[0]]:STY_DEF[o[0]];sp.textContent=o[1];sp.style.minWidth="190px";r.value=cur;r.style.maxWidth="260px";v.textContent=cur+" px";v.style.minWidth="48px";
  r.oninput=function(){v.textContent=r.value+" px";stySet(plat,o[0],+r.value)};l.appendChild(sp);l.appendChild(r);l.appendChild(v);l.style.marginTop="8px";box.appendChild(l)});
 var rs=el("button",{class:"b",type:"button"});rs.textContent="Voltar ao padrão do site";rs.style.marginTop="10px";rs.onclick=function(){styReset(plat)};box.appendChild(rs);
 var w=el("div");w.appendChild(box);
 w.appendChild(shareView(plat,"Estilo do site · "+nm,function(){return styGet(plat)||{}},function(src){var k=cfgKey(),c=cfgGet(k);c[plat]=src;cfgSave(k,c);styApply()}));return w}
function cuView(){var u=cuGet(),box=el("div",{class:"uc"});box.style.marginTop="12px";
 function title(t){var h=el("h2");h.textContent=t;return h}
 function note(t){var p=el("p",{class:"hint"});p.textContent=t;return p}
 box.appendChild(title("Personalizar cores"));
 var tb=el("div",{class:"tabs",role:"tablist"});[["pri","Primária"],["sec","Secundária"]].forEach(function(q){var b=el("button",{class:"tab",role:"tab","aria-selected":CUTAB===q[0]});b.textContent=q[1];b.onclick=function(){CUTAB=q[0];render()};tb.appendChild(b)});box.appendChild(tb);
 if(CUTAB==="pri"){box.appendChild(note("Cor principal: abas, botões e destaques do site."));
  box.appendChild(swGrid(CUPRI,u.acc,function(c){u.acc=c;u.on=cuOn(c);cuSave(u,true);render()}));box.appendChild(colorRow("Cor primária","acc",u));box.appendChild(colorRow("Texto sobre a primária","on",u))}
 else{box.appendChild(note("Fundo e texto. Escolher um fundo ajusta cartão, texto e linhas sozinho; depois dá para refinar cada cor."));
  box.appendChild(swGrid(CUSEC,u.bg,function(c){cuFromBg(u,c);cuSave(u,true);render()}));
  [["Fundo","bg"],["Cartão","card"],["Texto","ink"],["Texto suave","mute"],["Linha","line"]].forEach(function(q){box.appendChild(colorRow(q[0],q[1],u))})}
 var rs=el("button",{class:"b",type:"button"});rs.textContent="Restaurar cores iniciais";rs.style.marginTop="10px";rs.onclick=function(){cuSave(JSON.parse(JSON.stringify(CUDEF)),true);render()};box.appendChild(rs);
 var w=el("div");w.appendChild(box);w.appendChild(shareView("cu","Cores personalizadas",function(){return cuGet()},function(src){cuSave(src,true)}));return w}
function cfgView(){var w=el("div",{class:"mm"}),k=cfgKey(),c=cfgGet(k),ti=themeIdx(c);
 function title(t){var h=el("h2");h.textContent=t;return h}
 function note(t){var p=el("p",{class:"hint"});p.textContent=t;return p}
 w.appendChild(title("Configurações"));w.appendChild(note("As opções ficam salvas no perfil que está aberto agora: "+cfgWho()+". Cada perfil pode ter o seu jeito."));
 var bs=el("h2");bs.textContent="Básico";bs.style.marginTop="14px";w.appendChild(bs);
 var b1=el("div",{class:"uc"});b1.appendChild(title("Modo de cor"));b1.appendChild(note("Escolha um tema. As bolinhas mostram fundo, cartão, texto e destaque (toque nelas para ver o código)."));
 var g=el("div");g.style.cssText="display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px;margin-top:8px";
 THEMES.forEach(function(t,i){var cl=tcol(i),bt=el("button",{class:"pf",type:"button","aria-pressed":i===ti});bt.style.setProperty("--c",cl.acc);bt.style.padding="8px";bt.style.gap="6px";if(i===ti)bt.classList.add("on");
  var top=el("div");top.style.cssText="display:flex;gap:4px;align-items:center";top.innerHTML=t.k?thumbHtml(cl,42)+thumbHtml(t.k,42):thumbHtml(cl,88);
  var n=el("strong");n.textContent=t.n+(i===ti?" ✓":"");n.style.fontSize="13px";var dots=el("div");dots.style.cssText="display:flex;gap:5px";
  [["Fundo","bg"],["Cartão","card"],["Texto","ink"],["Destaque","acc"]].forEach(function(q){var d=el("i");d.title=q[0]+" "+cl[q[1]];d.style.cssText="width:14px;height:14px;border-radius:50%;border:1px solid var(--line);background:"+cl[q[1]];dots.appendChild(d)});
  bt.appendChild(top);bt.appendChild(n);bt.appendChild(dots);bt.onclick=function(){setTheme(i)};g.appendChild(bt)});
 b1.appendChild(g);w.appendChild(b1);if(ti===9)w.appendChild(cuView());
 var b2=el("div",{class:"uc"});b2.style.marginTop="14px";b2.appendChild(title("Descrições"));
 b2.appendChild(note("São os textos explicativos do site, aqueles que dizem o que cada coisa faz. Nenhuma: some tudo. Resumida: fica só a primeira frase. Tudo: mostra o texto inteiro. Avisos, status e janelas de pergunta continuam aparecendo sempre."));
 var r=el("div",{class:"row"});r.style.marginTop="8px";
 [["none","Nenhuma"],["short","Resumida"],["all","Tudo"]].forEach(function(o){var bt=el("button",{class:"tool",type:"button","aria-pressed":DSC===o[0]});bt.textContent=o[1];bt.onclick=function(){setDsc(o[0])};r.appendChild(bt)});
 b2.appendChild(r);w.appendChild(b2);
 var b3=el("div",{class:"uc"});b3.style.marginTop="14px";b3.appendChild(title("Plataforma"));b3.appendChild(note("Define qual estilo do site está valendo agora neste aparelho: o do Computador ou o do Celular."));
 var r3=el("div",{class:"row"});r3.style.marginTop="8px";var pc=platGet()||platAuto();
 PLATS.forEach(function(p){var bt=el("button",{class:"tool",type:"button","aria-pressed":pc===p[0]});bt.textContent=p[1];bt.onclick=function(){platSet(p[0]);render()};r3.appendChild(bt)});
 b3.appendChild(r3);w.appendChild(b3);
 var tab=CFGTAB||pc,tb=el("div",{class:"tabs",role:"tablist"});tb.style.marginTop="22px";
 PLATS.forEach(function(p){var b=el("button",{class:"tab",role:"tab","aria-selected":tab===p[0]});b.textContent=p[1];b.onclick=function(){CFGTAB=p[0];render()};tb.appendChild(b)});
 w.appendChild(tb);w.appendChild(styPlatView(tab));return w}
(function(){var _r=render;render=function(){_r();cfgApply();descApply();rangeAll()}})();
if(platGet())platSet(platGet());
cfgApply(true);
render();uiGH();mkDrawer();platPick(function(){showPicker()});startRemote();
;
/* parte 5 de 5 */
function hora(){return new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}

