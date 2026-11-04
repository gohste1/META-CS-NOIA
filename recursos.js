/* recursos.js · tudo o que é novo (Configurações no menu ⋮, layouts, radar em tela inteira, recolher/expandir, atalhos).
   Se algo quebrar, é aqui que se mexe. Nada muda para ninguém até a pessoa ligar uma opção (padrão = Clássico). */
(function(){
"use strict";
var D={layout:"classic",dens:"comfy",btn:0,top:0,fold:1,foldInit:"open",acc:0,fsBtn:1,plusSide:"right",plusOpen:0,keys:1,bot:0,read:0,orient:"auto",player:null,barMode:"always",clock:null,c4:1,pen:null,penMode:"temp",penCols:"r,y,g,b,w",penW:6,penDur:5,penShow:1,remember:0,undoTop:null,saveTop:null,a11y:0,help:null,pef:"show",stick:0,side:0,pnSide:"right",pnW:480,reorder:null,flip:0,keep:1};
var GROUPS=[["Planejar",["defs","fixo","calls","open"]],["Ferramentas",["utils","draw","timing"]],["Revisar",["demo","d2","cmp"]],["Outros",["callouts","igl","treino"]]];
var MAIN=["defs","timing","d2","callouts"];
function eff(x,k){return x[k]==null?x.layout==="org":!!x[k]}
function P(){return platGet()||platAuto()}
function xGet(){var c=cfgGet(cfgKey()),o={},p=c.x&&c.x[P()]||{};for(var k in D)o[k]=p[k]!=null?p[k]:D[k];return o}
function xSet(k,v){if(k==="a11y"){var tt=cfgKey(),cc=cfgGet(tt);cc.t=v?8:0;cc[P()]=cc[P()]||{};if(v)cc[P()].fs=20;else delete cc[P()].fs;cfgSave(tt,cc);try{themeApply(cc.t);styApply()}catch(e){}}
 var id=cfgKey(),c=cfgGet(id);c.x=c.x||{};c.x[P()]=c.x[P()]||{};c.x[P()][k]=v;cfgSave(id,c);applyCls()}
function xReset(){var id=cfgKey(),c=cfgGet(id);if(c.x)delete c.x[P()];cfgSave(id,c);applyCls()}
function $(s,r){return(r||document).querySelector(s)}
function $$(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function btn(t,cls,fn){var b=el("button",{type:"button",class:cls||"tool"});b.textContent=t;if(fn)b.onclick=fn;return b}

/* ---------- CSS ---------- */
var css=document.createElement("style");css.textContent=
"main{padding-top:54px}"+
"#xmenu{display:flex;align-items:center;justify-content:center;padding:0;position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:10px;z-index:12;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font:800 24px/1 sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}"+
".xpn{position:fixed;z-index:20;top:0;right:0;bottom:0;width:min(480px,100%);background:var(--bg);border-left:1px solid var(--line);overflow:auto;padding:0 14px 40px;box-shadow:-6px 0 24px rgba(0,0,0,.3)}"+
":root[data-plat=mobile] .xpn{width:100%;border:0}"+
".xph{position:sticky;top:0;z-index:2;background:var(--bg);padding:12px 0 10px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--line);margin-bottom:10px}"+
".xph input{flex:1;border:1px solid var(--line)}"+
".xpn .mm{margin-top:0}"+
".xfb{display:block;width:100%;text-align:left;margin:0 0 8px;font:600 14px inherit;font-family:inherit;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:var(--rd,6px);padding:6px 10px;cursor:pointer}"+
".xclosed>*:not(.xfb){display:none!important}.xclosed{padding-top:8px!important;padding-bottom:4px!important}"+
".xfbar{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap}"+
".xfsb{position:absolute;top:8px;right:8px;z-index:3;width:38px;height:38px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;cursor:pointer;opacity:.92} .xfs .xfsb{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:10px;width:46px;height:46px;border-radius:50%;z-index:33;font-size:22px;opacity:1}"+
"body.xfs-on{overflow:hidden}"+
".xfs{position:fixed!important;inset:0;z-index:30;background:var(--bg);margin:0!important;padding:0!important;display:flex!important;align-items:center;justify-content:center;max-width:none!important}"+
".xfs .mwrap{max-width:none!important;width:min(100vw,100vh);height:min(100vw,100vh)}"+
".xfs svg.map{max-width:none!important;width:100%;height:100%;border-radius:0}"+
".xfx,.xfp,.xfi{position:fixed;z-index:32;top:calc(10px + env(safe-area-inset-top,0px));width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font:800 22px/1 sans-serif;cursor:pointer}"+
".xfx{right:10px}.xfi{right:64px}"+
".xfp{bottom:calc(14px + env(safe-area-inset-bottom,0px));top:auto;background:var(--acc);color:var(--on);font-size:28px}"+
".xsheet{position:fixed;z-index:31;bottom:calc(70px + env(safe-area-inset-bottom,0px));max-height:55vh;max-width:min(560px,calc(100vw - 20px));overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;display:none;box-shadow:0 6px 24px rgba(0,0,0,.35)}"+
".xsheet.open{display:block}"+
/* densidade e botões */
"body.x-comp .def,body.x-comp .uc{padding:8px;margin-bottom:10px}body.x-comp .tab{padding:5px 11px}body.x-comp main{line-height:1.35}"+
"body.x-b1 button.b,body.x-b1 .tab,body.x-b1 .tool{min-height:44px;font-size:15px}body.x-b2 button.b,body.x-b2 .tab,body.x-b2 .tool{min-height:54px;font-size:17px;padding-left:18px;padding-right:18px}"+
/* barra fixa no topo */
"body.x-top .bar{top:0;bottom:auto;border-top:0;border-bottom:1px solid var(--line);padding:calc(8px + env(safe-area-inset-top,0px)) 62px 8px 18px}body.x-top main{padding-top:84px;padding-bottom:40px}"+
/* abas laterais agrupadas (PC organizado) */
"body.x-org.x-pc #secs{position:fixed;left:34px;top:150px;bottom:70px;width:176px;flex-direction:column;overflow:auto;border:0;margin:0;padding:0;gap:4px;z-index:4}"+
"body.x-org.x-pc #secs .tab{border-radius:var(--rd,6px);text-align:left;font-size:15px;padding:8px 12px}"+
"body.x-org.x-pc main{margin-left:max(220px,calc((100vw - var(--mw,980px))/2 + 100px))}"+
".xgl{font:700 12px sans-serif;color:var(--mute);margin:10px 4px 2px}"+
/* abas embaixo (celular) */
"body.x-bot #secs{position:fixed;left:0;right:0;bottom:0;margin:0;z-index:6;background:var(--card);border-top:1px solid var(--line);border-bottom:0;padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap;justify-content:space-around;overflow:visible}"+
"body.x-bot #secs .tab{border-radius:var(--rd,6px)}body.x-bot main{padding-bottom:110px}"+
"body.x-org.x-mob .players{grid-template-columns:1fr}"+
"#tabs.xmapsel .tab{display:none}#tabs.xmapsel select{width:100%;font-size:17px}"+
/* deitado */
"body.x-land .mm{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:12px;align-items:start}body.x-land .mm>.mwrap{grid-column:1;grid-row:1/span 40;position:sticky;top:60px;max-width:100%}body.x-land .mm>*:not(.mwrap){grid-column:2}"+
"@media(max-width:700px){.xpn{width:100%}}"+"body.x-pefh .pl>textarea{display:none}.xpb{display:block;width:100%;text-align:left;margin:4px 0;font:600 13px inherit;font-family:inherit;border:1px dashed var(--line);background:transparent;color:var(--mute);border-radius:6px;padding:4px 8px;cursor:pointer}"+
".xmv{padding:6px 10px!important;min-width:36px}"+
"body.x-lat #map{column-width:min(92vw,560px);column-gap:20px;column-fill:auto;overflow-x:auto;overflow-y:hidden;padding-bottom:6px}body.x-lat #map>*{max-width:100%}body.x-lat #map .mwrap,body.x-lat #map .xcol{break-inside:avoid;max-width:100%}body.x-lat .def,body.x-lat .uc{break-inside:auto}"+
".xlat{position:fixed;top:50%;z-index:9;width:40px;height:64px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:800 22px sans-serif;cursor:pointer;display:none;opacity:.92}body.x-lat .xlat{display:block}#xl1{left:4px}#xl2{right:4px}"+
"body.x-stick #map .mwrap,body.x-stick #map .xcol{position:sticky;top:60px;z-index:2}"+
"body.x-side.x-flip #map .def{grid-template-columns:minmax(300px,540px) minmax(0,1fr)}body.x-side.x-flip #map .def>*{grid-column:2}body.x-side.x-flip #map .def>.mm{grid-column:1}"+
"body.x-side.x-flip #map>.mm{grid-template-columns:minmax(0,1fr) minmax(0,640px)}body.x-side.x-flip #map>.mm>.xcol,body.x-side.x-flip #map>.mm>.mwrap{grid-column:2}body.x-side.x-flip #map>.mm>*:not(.mwrap):not(.xcol){grid-column:1}"+

"body.x-side #map .def{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,540px);gap:0 16px;align-items:start}body.x-side #map .def>*{grid-column:1}body.x-side #map .def>.mm{grid-column:2;grid-row:1/span 30;position:sticky;top:60px}"+
"body.x-side #map>.mm{display:grid;grid-template-columns:minmax(0,640px) minmax(0,1fr);gap:12px;align-items:start}body.x-side #map>.mm>.xcol,body.x-side #map>.mm>.mwrap{grid-column:1;grid-row:1/span 40;position:sticky;top:60px}body.x-side #map>.mm>*:not(.mwrap):not(.xcol){grid-column:2}"+
"body.x-land .mm>.xcol{grid-column:1;grid-row:1/span 40;position:sticky;top:60px}.xcol{max-width:640px}"+
/* abas embaixo: − aba + */
"body.x-bot #secs .tab{display:none}body.x-bot #secs.xmore .tab{display:block;order:0;flex:1 1 45%}.xnav{order:9;flex:1 1 100%;display:flex;gap:8px;align-items:stretch}.xnav button{min-height:46px;font-size:17px}.xnav .xc{flex:1;font-weight:800;background:var(--acc);color:var(--on);border-color:var(--acc)}.xnav .xs{width:56px;font-size:24px;line-height:1}";
document.head.appendChild(css);

/* ---------- classes no body ---------- */
function isLand(x){return P()==="mobile"&&(x.orient==="land"||(x.orient==="auto"&&window.matchMedia&&matchMedia("(orientation:landscape)").matches&&innerHeight<560))}
function applyCls(){var x=xGet(),c=document.body.classList,p=P();
 c.toggle("x-org",x.layout==="org");c.toggle("x-lat",x.layout==="lat");c.toggle("x-pefh",x.pef==="hide");c.toggle("x-stick",!!x.stick&&p==="pc");c.toggle("x-side",!!x.side&&p==="pc");c.toggle("x-flip",!!x.flip);c.toggle("x-pc",p==="pc");c.toggle("x-mob",p==="mobile");c.toggle("x-comp",x.dens==="compact");
 c.toggle("x-b1",x.btn===1);c.toggle("x-b2",x.btn===2);c.toggle("x-top",!!x.top||(p==="mobile"&&!!x.bot));c.toggle("x-bot",p==="mobile"&&!!x.bot);c.toggle("x-land",isLand(x))}
addEventListener("resize",function(){applyCls()});addEventListener("orientationchange",function(){setTimeout(applyCls,200)});

/* ---------- menu ⋮ e Configurações ---------- */
var PN=null,Q="";
var mb=btn("⋮","",function(){PN?closePanel():openPanel()});mb.id="xmenu";mb.innerHTML='<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><circle cx="10" cy="3.5" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="16.5" r="2"/></svg>';mb.setAttribute("aria-label","Abrir as Configurações");document.body.appendChild(mb);
function openPanel(){PN=el("div",{class:"xpn",role:"dialog","aria-label":"Configurações"});var xq=xGet();if(P()==="pc"){PN.style.width="min("+(+xq.pnW||480)+"px,100%)";if(xq.pnSide==="left"){PN.style.left="0";PN.style.right="auto";PN.style.borderLeft="0";PN.style.borderRight="1px solid var(--line)"}}document.body.appendChild(PN);fill();mb.setAttribute("aria-expanded","true")}
function closePanel(){if(PN){PN.remove();PN=null}mb.setAttribute("aria-expanded","false")}
function fill(){if(!PN)return;var st=PN.scrollTop;PN.innerHTML="";var h=el("div",{class:"xph"}),q=el("input",{type:"search",placeholder:"Buscar (ex: cor, tela cheia)","aria-label":"Buscar nas Configurações"});q.value=Q;
 q.oninput=function(){Q=q.value;filt()};var cb=btn("Fechar","b",closePanel);h.appendChild(q);h.appendChild(cb);PN.appendChild(h);
 var w=cfgView();PN.appendChild(w);filt();PN.scrollTop=st;if(Q)q.focus()}
function filt(){if(!PN)return;var w=PN.querySelector(".mm");if(!w)return;var s=Q.trim().toLowerCase();[].forEach.call(w.children,function(k){k.style.display=!s||k.textContent.toLowerCase().indexOf(s)>=0?"":"none"})}
function seg(label,key,opts,note){var b=el("div",{class:"uc"});b.style.marginTop="14px";var h=el("h2");h.textContent=label;b.appendChild(h);if(note){var n=el("p",{class:"hint"});n.textContent=note;b.appendChild(n)}
 var r=el("div",{class:"row"}),x=xGet();r.style.marginTop="8px";opts.forEach(function(o){var t=btn(o[1],"tool");t.setAttribute("aria-pressed",String(x[key]===o[0]));t.onclick=function(){xSet(key,o[0]);render()};r.appendChild(t)});b.appendChild(r);return b}
var ON=[[1,"Ligado"],[0,"Desligado"]],PENC=[["r","Vermelho"],["y","Amarelo"],["g","Verde"],["b","Azul"],["w","Branco"]],PCOL2={r:"#ef4444",y:"#facc15",g:"#22c55e",b:"#3b82f6",w:"#ffffff"};
function extraView(){var w=el("div"),x=xGet(),mob=P()==="mobile",nm=mob?"Celular":"Computador";
 var h=el("h2");h.textContent="Layout e radar · "+nm;h.style.marginTop="22px";w.appendChild(h);
 var n=el("p",{class:"hint"});n.textContent="Vale só para "+nm+" e fica salvo no perfil aberto ("+cfgWho()+"). O padrão é o jeito Clássico de sempre; nada muda até você ligar.";w.appendChild(n);
 w.appendChild(seg("Layout","layout",[["classic","Clássico"],["org","Organizado"],["lat","Lateral ←→"]],mob?"Organizado: cartões em coluna única. Lateral: o conteúdo corre para a direita e a esquerda em vez de subir e descer.":"Organizado: abas agrupadas na lateral esquerda. Lateral: o conteúdo corre para a direita e a esquerda em vez de subir e descer."));
 w.appendChild(seg("Densidade","dens",[["comfy","Confortável"],["compact","Compacta"]]));
 w.appendChild(seg("Tamanho dos botões","btn",[[0,"Atual"],[1,"Médio"],[2,"Grande"]]));
 w.appendChild(seg("Barra fixa no topo (Modo, Publicar, salvamento)","top",ON,mob?"No celular ela já vai para o topo quando as abas ficam embaixo.":""));
 w.appendChild(seg("Recolher e expandir blocos","fold",ON,"Cada bloco ganha um botão para diminuir ou aumentar, e no topo aparecem Recolher tudo e Expandir tudo."));
 w.appendChild(seg("Blocos começam","foldInit",[["open","Abertos"],["closed","Fechados"],["last","Como deixei"]]));
 w.appendChild(seg("Abrir só um bloco de cada vez","acc",ON));
 w.appendChild(seg("Botão de tela inteira no radar","fsBtn",[[1,"Visível"],[0,"Escondido"]],"Na tela inteira: o mesmo botão ⛶ (ou Esc) fecha; o botão + abre as edições rápidas; 📷 salva uma imagem do radar."));
 w.appendChild(seg("Botão + da tela inteira: lado","plusSide",[["left","Esquerdo"],["right","Direito"]]));
 w.appendChild(seg("Botão + da tela inteira: edições","plusOpen",[[0,"Recolhidas"],[1,"Sempre abertas"]]));
 w.appendChild(seg("Manter a rolagem ao editar","keep",[[1,"Ligado"],[0,"Desligado"]],"Ao apagar ou mudar algo, o site não te leva mais para o topo da página."));
 w.appendChild(seg("Anotação de cada jogador (o que vai fazer)","pef",[["show","Mostrar"],["fold","Recolhida"],["hide","Esconder"]],"O campo de texto de cada jogador em Default, Fixo, Calls e Aberturas. Recolhida: aparece só quando você toca em Anotação."));
 if(!mob){w.appendChild(seg("Radar fixo ao rolar","stick",ON,"O radar acompanha a rolagem da página."));
  w.appendChild(seg("Funções ao lado do radar","side",ON,"Radar de um lado e painéis/ferramentas do outro, aproveitando a largura da tela."));
  w.appendChild(seg("Inverter o lado do radar","flip",ON,"Com as funções ao lado do radar: troca o radar de lado (esquerda ou direita)."));
  w.appendChild(seg("Reordenar defaults (▲ ▼)","reorder",[[null,"Seguir o layout"],[1,"Ligado"],[0,"Desligado"]]));
  w.appendChild(seg("Lado do painel de Configurações","pnSide",[["right","Direita"],["left","Esquerda"]]));
  w.appendChild(seg("Largura do painel de Configurações","pnW",[[380,"Estreito"],[480,"Médio"],[640,"Largo"]]));
 }
 if(!mob){w.appendChild(seg("Atalhos de teclado","keys",ON,"Espaço: Play/Pausa · Z: desfazer · Y: refazer · B: borracha · 1 a 9: trocar de mapa · Esc: fechar."))}
 else{w.appendChild(seg("Abas embaixo","bot",ON,"Defaults, Timing, Demo 2D e Callouts ficam fixos; o resto fica em Mais. Mapas viram um seletor único."));
  w.appendChild(seg("Modo leitura ao abrir","read",ON,"Esconde os controles de edição; o botão Modo liga a edição de volta."));
  w.appendChild(seg("Orientação","orient",[["auto","Automático"],["port","De pé"],["land","Deitado"]],"O site não gira o celular: a opção muda o layout. No Android (Chrome) a tela inteira trava a orientação; no iPhone é preciso girar o aparelho."))}

 var h2=el("h2");h2.textContent="Player, lápis e extras";h2.style.marginTop="22px";w.appendChild(h2);
 var o3=[[null,"Seguir o layout"],[1,"Ligado"],[0,"Desligado"]];
 w.appendChild(seg("Player embaixo do radar (Demo 2D)","player",o3,"Play, Pausa, velocidade e a barra ficam logo abaixo do radar, com marcadores de abates, C4 e utilitárias."));
 w.appendChild(seg("Barra de reprodução","barMode",[["always","Sempre visível"],["touch","Só ao tocar no radar"]]));
 w.appendChild(seg("Relógio no topo do radar","clock",o3,"Quando a C4 é plantada, o relógio passa a mostrar o tempo da bomba."));
 w.appendChild(seg("C4 plantada no radar","c4",[[1,"Mostrar"],[0,"Esconder"]]));
 w.appendChild(seg("Lápis (marcar erros no radar)","pen",o3,"As marcas ficam presas ao momento do replay e só aparecem naquele trecho."));
 w.appendChild(seg("Marcas do lápis","penMode",[["temp","Temporárias"],["saved","Salvas na demo"]],"Salvas na demo: ficam na demo e vão para todos quando você publicar a demo (ou usar Publicar marcas)."));
 w.appendChild(seg("Ver as marcas dos outros","penShow",[[1,"Ver marcas"],[0,"Sem marcas"]]));
 w.appendChild(seg("Tempo que cada marca fica","penDur",[[3,"3 s"],[5,"5 s"],[10,"10 s"],[0,"Até o fim"]]));
 w.appendChild(seg("Espessura do lápis","penW",[[3,"Fina"],[6,"Média"],[11,"Grossa"]]));
 var pc=el("div",{class:"uc"});pc.style.marginTop="14px";var ph=el("h2");ph.textContent="Cores da paleta";pc.appendChild(ph);var pr=el("div",{class:"row"}),cur0=String(x.penCols).split(",");
 PENC.forEach(function(q){var t=btn(q[1],"tool");t.setAttribute("aria-pressed",String(cur0.indexOf(q[0])>=0));t.onclick=function(){var a=cur0.filter(function(k){return k!==q[0]});if(cur0.indexOf(q[0])<0)a.push(q[0]);if(!a.length)a=["r"];xSet("penCols",a.join(","));render()};pr.appendChild(t)});pc.appendChild(pr);w.appendChild(pc);
 w.appendChild(seg("Desfazer no topo","undoTop",o3,"Botão ↶ sempre visível; clica no Desfazer da tela aberta."));
 w.appendChild(seg("Aviso de salvamento no topo","saveTop",o3,"Mostra Salvo, Falta publicar ou Sem internet."));
 w.appendChild(seg("Lembrar a última visão","remember",ON,"Ao abrir, volta para a última aba, mapa e lado."));
 w.appendChild(seg("Texto grande e alto contraste","a11y",ON,"Aumenta a letra e usa o tema Alto contraste."));
 var tu=btn("Ver tutorial","b",function(){closePanel();tutorial()});tu.style.margin="14px 8px 0 0";w.appendChild(tu);
 w.appendChild(shareView("x"+P(),"Layout e radar · "+nm,function(){return(cfgGet(cfgKey()).x||{})[P()]||{}},function(src){var id=cfgKey(),c=cfgGet(id);c.x=c.x||{};c.x[P()]=src;cfgSave(id,c);applyCls()}));
 var hp0=xGet();w.appendChild(seg("Botão ? nas ferramentas","help",[[null,"Só nas descrições Resumidas"],[1,"Sempre"],[0,"Nunca"]],"Mostra um ? ao lado de cada ferramenta; a explicação aparece só quando você toca."));
 var r=btn("Voltar ao Clássico","b",function(){xReset();render()});r.style.marginTop="14px";w.appendChild(r);return w}
(function(){var _c=cfgView;cfgView=function(){var w=_c();w.appendChild(extraView());return w}})();

/* ---------- radar em tela inteira ---------- */
var FS=null,FSOPEN=null;
function hostOf(s){var c=s.closest(".xcol");if(c&&c.parentElement)return c.parentElement;var m=s.closest(".mwrap");return m&&m.parentElement?m.parentElement:s.parentElement}
function enterFS(host){if(FS)exitFS();var x=xGet(),mw=host.querySelector(".mwrap")||host.querySelector("svg.map").parentElement,sh=el("div",{class:"xsheet"}),ph=[];
 [].slice.call(host.children).forEach(function(k){if(k===mw||k.classList.contains("xfx")||k.classList.contains("xplayer")||k.contains(mw))return;var c=document.createComment("x");host.replaceChild(c,k);ph.push([c,k]);sh.appendChild(k)});
 host.classList.add("xfs");document.body.classList.add("xfs-on");
 var I=btn("📷","xfi",function(){png(host.querySelector("svg.map"))}),B=btn("+","xfp",function(){sh.classList.toggle("open");FSOPEN=sh.classList.contains("open")});
 I.setAttribute("aria-label","Salvar imagem do radar");B.setAttribute("aria-label","Edições rápidas");
 B.style[x.plusSide==="left"?"left":"right"]="14px";sh.style[x.plusSide==="left"?"left":"right"]="10px";
 if(FSOPEN==null)FSOPEN=!!x.plusOpen;sh.classList.toggle("open",FSOPEN&&ph.length>0);if(!ph.length)B.style.display="none";
 [I,B,sh].forEach(function(n){document.body.appendChild(n)});FS={host:host,ph:ph,ui:[I,B,sh]};
 try{if(x.orient!=="auto"&&screen.orientation&&screen.orientation.lock)screen.orientation.lock(x.orient==="land"?"landscape":"portrait").catch(function(){})}catch(e){}}
function exitFS(){if(!FS)return;var f=FS;FS=null;FSOPEN=null;f.ph.forEach(function(p){if(p[0].parentNode)p[0].parentNode.replaceChild(p[1],p[0])});f.ui.forEach(function(n){n.remove()});
 f.host.classList.remove("xfs");document.body.classList.remove("xfs-on");try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}catch(e){}}
function png(svg){if(!svg)return;var s=svg.cloneNode(true);s.setAttribute("xmlns","http://www.w3.org/2000/svg");s.setAttribute("width","1000");s.setAttribute("height","1000");
 var r=document.createElementNS("http://www.w3.org/2000/svg","rect");r.setAttribute("width","1000");r.setAttribute("height","1000");r.setAttribute("fill","#10161a");s.insertBefore(r,s.firstChild);
 var po=svg.parentElement.querySelector(".xpensvg");if(po){var g=document.createElementNS("http://www.w3.org/2000/svg","g");g.innerHTML=po.innerHTML;s.appendChild(g)}
 var im=new Image();im.onload=function(){var c=document.createElement("canvas");c.width=c.height=1000;c.getContext("2d").drawImage(im,0,0,1000,1000);
  c.toBlob(function(b){if(!b){setSt("Não consegui gerar a imagem.");return}var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="radar.png";a.click();setSt("Imagem do radar salva.")})};
 im.onerror=function(){setSt("Não consegui gerar a imagem.")};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(s))}
function fsButtons(){var x=xGet();if(!x.fsBtn)return;$$("#map svg.map").forEach(function(s){if(s.parentElement.querySelector(".xfsb"))return;var pa=s.parentElement;if(getComputedStyle(pa).position==="static")pa.style.position="relative";
 var b=btn("⛶","xfsb",function(){if(FS)exitFS();else enterFS(hostOf(s))});b.setAttribute("aria-label","Abrir ou fechar o radar em tela inteira");b.title="Abrir ou fechar o radar em tela inteira";pa.appendChild(b)})}

/* ---------- recolher e expandir ---------- */
function FL(){try{return JSON.parse(localStorage.getItem("cs2-fold")||"{}")}catch(e){return{}}}
function FLs(o){try{localStorage.setItem("cs2-fold",JSON.stringify(o))}catch(e){}}
function ttl(h,b,i){var t="",inp=h&&(h.matches&&h.matches("input,textarea")?h:h.querySelector&&h.querySelector("input,textarea"));if(inp)t=(inp.value||"").trim();if(!t&&h&&!inp)t=(h.textContent||"").replace(/\s+/g," ").trim();if(!t||t.length>60)t=((SEC[sec]||"Bloco")+" "+(i+1)).replace(/^Configurações/,"Bloco");var c=b?b.querySelectorAll(".pl").length:0;t=t.length>46?t.slice(0,44)+"…":t;return t+(c?" · "+c+" jogadores":"")}
function fold(){var x=xGet(),box=$("#map");if(!box||!x.fold)return;
 var bl=$$(".def,.uc",box).filter(function(b){return!b.parentElement.closest(".def,.uc")&&b.children.length>1&&!b.querySelector(":scope>.xfb")&&!b.closest(".xpn")}),L=FL(),pre=[sec,cur,side].join("|")+"|";
 bl.forEach(function(b,i){var key=pre+i,h=b.firstElementChild,st=L[key];if(st==null)st=x.foldInit==="closed"?1:0;else if(x.foldInit!=="last")st=x.foldInit==="closed"?1:0;
  var f=btn("","xfb");function lab(){var c=b.classList.contains("xclosed");f.textContent=c?"▸ "+ttl(h,b,i)+" (abrir)":"▾ Recolher";f.setAttribute("aria-expanded",String(!c))}
  f.onclick=function(){var c=!b.classList.contains("xclosed");if(!c&&x.acc)bl.forEach(function(o){if(o!==b&&o.__f){o.classList.add("xclosed");o.__f()}});b.classList.toggle("xclosed",c);var M=FL();M[key]=c?1:0;FLs(M);lab()};
  b.__f=lab;b.insertBefore(f,b.firstChild);b.classList.toggle("xclosed",!!st);lab()});
 if(bl.length>1&&!$(".xfbar",box)){var bar=el("div",{class:"xfbar"});[["Recolher tudo",1],["Expandir tudo",0]].forEach(function(k){bar.appendChild(btn(k[0],"tool",function(){var M=FL();bl.forEach(function(b,i){b.classList.toggle("xclosed",!!k[1]);M[pre+i]=k[1];b.__f&&b.__f()});FLs(M)}))});box.insertBefore(bar,box.firstChild)}}

/* ---------- abas: esconder Configurações, agrupar, abas embaixo, seletor de mapas ---------- */
function tabs(){var x=xGet(),sc=$("#secs"),p=P();if(!sc)return;var inv={};Object.keys(SEC).forEach(function(k){inv[SEC[k]]=k});
 $$(".tab",sc).forEach(function(b){var k=inv[b.textContent];b.dataset.k=k||"";if(k==="cfg")b.style.display="none";b.classList.toggle("xmain",MAIN.indexOf(k)>=0)});
 $$(".xgl",sc).forEach(function(n){n.remove()});
 if(sec==="cfg"){sec="defs";render();return}
 if(x.layout==="org"&&p==="pc"){GROUPS.forEach(function(g){var first=true;g[1].forEach(function(k){var b=$('.tab[data-k="'+k+'"]',sc);if(!b)return;if(first){var l=el("div",{class:"xgl"});l.textContent=g[0];sc.appendChild(l);first=false}sc.appendChild(b)})});$$(".tab",sc).forEach(function(b){if(b.dataset.k==="cfg")sc.appendChild(b)})}
 $$(".xnav",sc).forEach(function(n){n.remove()});
 if(x.bot&&p==="mobile"){var ks=$$(".tab",sc).filter(function(q){return q.dataset.k&&q.dataset.k!=="cfg"}),ix=0;ks.forEach(function(q,j){if(q.dataset.k===sec)ix=j});
  var nv=el("div",{class:"xnav"}),mi=btn("−","xs b",function(){var q=ks[(ix-1+ks.length)%ks.length];sc.classList.remove("xmore");q&&q.click()}),cu=btn((SEC[sec]||"Aba"),"xc b",function(){sc.classList.toggle("xmore");pl2.textContent=sc.classList.contains("xmore")?"×":"+"}),pl2=btn("+","xs b",function(){var o=sc.classList.toggle("xmore");pl2.textContent=o?"×":"+";pl2.setAttribute("aria-label",o?"Fechar a lista de abas":"Ver as outras abas")});
  mi.setAttribute("aria-label","Aba anterior");pl2.setAttribute("aria-label","Ver as outras abas");nv.appendChild(mi);nv.appendChild(cu);nv.appendChild(pl2);sc.appendChild(nv);
  ks.forEach(function(q){q.addEventListener("click",function(){sc.classList.remove("xmore")})})}
 var tb=$("#tabs");tb.classList.remove("xmapsel");$$("select",tb).forEach(function(s){s.remove()});
 if(p==="mobile"&&(x.bot||x.layout==="org")&&$$(".tab:not(.add)",tb).length){var s=el("select",{class:"sel","aria-label":"Mapa"});S.maps.forEach(function(m,i){var o=el("option",{value:i});o.textContent=m.name||"Mapa";if(i===cur)o.selected=true;s.appendChild(o)});s.onchange=function(){cur=+s.value;render()};tb.classList.add("xmapsel");tb.insertBefore(s,tb.firstChild)}}

/* ---------- atalhos ---------- */
function findBtn(re){return $$("#map button").filter(function(b){return re.test((b.textContent||"").trim()+" "+(b.title||"")+" "+(b.getAttribute("aria-label")||""))})[0]}
document.addEventListener("keydown",function(e){
 if(e.key==="Escape"){if(FS){exitFS();e.preventDefault()}else if(PN)closePanel();return}
 var x=xGet();if(!x.keys||P()!=="pc"||e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target;if(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable)return;
 var b=null;if(e.key===" ")b=findBtn(/^(▶|❚❚)/);else if(/^z$/i.test(e.key))b=findBtn(/^Desfazer/i);else if(/^b$/i.test(e.key))b=findBtn(/Borracha/i);else if(/^y$/i.test(e.key))b=findBtn(/^Refazer/i);
 else if(/^[1-9]$/.test(e.key)){var ts=$$("#tabs .tab:not(.add)").filter(function(q){return!/mover/.test(q.textContent)});b=ts[+e.key-1]}
 if(b&&!b.disabled){b.click();e.preventDefault()}});

/* ---------- ligar tudo ---------- */
var _r=render;
var LK="";
render=function(){var kp=false,y=0,sx=0,mh=null,mp=document.getElementById("map");
 try{kp=!!xGet().keep&&!FS&&LK===[sec,cur,side].join("|");if(kp){y=window.scrollY||0;if(mp){sx=mp.scrollLeft;mh=mp.offsetHeight;mp.style.minHeight=mh+"px"}}}catch(e){}
 _r();
 try{var mp2=document.getElementById("map");if(kp){window.scrollTo(0,y);if(mp2){mp2.scrollLeft=sx}}if(mp2)mp2.style.minHeight="";if(kp){requestAnimationFrame(function(){if(Math.abs((window.scrollY||0)-y)>2)window.scrollTo(0,y)})}LK=[sec,cur,side].join("|")}catch(e){}
 try{applyCls();tabs();fold();fsButtons();d2enh();cmpEnh();extras2();latH();topChips();remember();setTimeout(helpQ,120);
 if(FS&&!document.body.contains(FS.host)){var o=FS;o.ui.forEach(function(n){n.remove()});FS=null;document.body.classList.remove("xfs-on");var s=$("#map svg.map");if(s)enterFS(hostOf(s))}
 if(PN)fill()}catch(err){console.error("recursos.js:",err)}};
/* ---------- C4 no radar (mostrar/esconder) ---------- */
var _c4=c4Svg;c4Svg=function(){return xGet().c4?_c4.apply(this,arguments):""};

/* ---------- player embaixo, relógio, marcadores e lápis (Demo 2D) ---------- */
var css2=document.createElement("style");css2.textContent=
".xrw{position:relative}.xpensvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:6px}.xpensvg.on{pointer-events:auto;cursor:crosshair;touch-action:none}"+
".xclk{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:3;background:rgba(10,14,18,.78);color:#fff;font:800 22px/1 sans-serif;padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.35);pointer-events:none;min-width:70px;text-align:center}"+
".xplayer{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:8px 0;max-width:640px}.xplayer.xhide{display:none}"+
".xplayer .row{gap:8px}.xplayer button.b{min-height:44px;font-size:16px}"+
".xmk{position:relative;height:18px;margin:0 8px}.xmk button{position:absolute;top:1px;transform:translateX(-50%);padding:0;border:1px solid #000;cursor:pointer;background:var(--c)}"+
".xmk .k{width:4px;height:14px;border-radius:2px}.xmk .n{width:3px;height:9px;opacity:.85}.xmk .c{width:12px;height:12px;transform:translateX(-50%) rotate(45deg)}"+
".xpentb{margin-top:6px;border-top:1px solid var(--line);padding-top:8px}.xsw{width:30px;height:30px;border-radius:50%;border:3px solid var(--line);padding:0;cursor:pointer}.xsw[aria-pressed=true]{border-color:var(--ink);box-shadow:0 0 0 2px var(--acc)}"+
".xfs .xcol{max-width:none!important;width:min(100vw,100vh)}.xfs .xplayer{position:fixed;left:8px;right:70px;bottom:calc(8px + env(safe-area-inset-bottom,0px));margin:0;max-width:none;z-index:32;opacity:.96}.xfs .xclk{font-size:26px}"+
"#xundo,#xredo,#xsave{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));z-index:12;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;font:700 13px sans-serif;padding:7px 12px}#xredo{right:108px}#xundo,#xredo{cursor:pointer;font-size:16px}#xundo{right:62px;cursor:pointer;font-size:16px}#xsave{left:46px}"+
".xtut{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px}.xtd{background:var(--card);border:1px solid var(--line);border-radius:14px;max-width:460px;width:100%;padding:16px;max-height:100%;overflow:auto}"+
".xmock{position:relative;height:170px;border:1px solid var(--line);border-radius:10px;background:var(--bg);overflow:hidden;margin:8px 0}.xmock i{position:absolute;font-style:normal}"+
".xbot{font-size:26px;left:10%;top:70%;animation:xb 6s infinite}@keyframes xb{0%{left:10%;top:70%}30%,40%{left:84%;top:10%}70%,100%{left:30%;top:60%}}"+
".xm1{right:8px;top:8px;width:30px;height:30px;border-radius:50%;background:var(--acc);color:var(--on);text-align:center;line-height:30px;font-weight:800}"+
".xm2{right:0;top:0;bottom:0;width:46%;background:var(--card);border-left:1px solid var(--line);padding:8px;font-size:12px;animation:xp 6s infinite;transform:translateX(100%)}@keyframes xp{0%,35%{transform:translateX(100%)}45%,80%{transform:translateX(0)}100%{transform:translateX(100%)}}"+
".xm3{left:6px;top:6px;bottom:6px;width:26%;border-radius:8px;background:var(--card);border:1px solid var(--line);font-size:11px;padding:6px;animation:xq 6s infinite;opacity:.15}@keyframes xq{0%,55%{opacity:.15}70%,100%{opacity:1;background:var(--acc);color:var(--on)}}"+
".xm4{left:36%;top:30%;width:40px;height:40px;border-radius:50%;background:#e0952a;animation:xd 4s infinite alternate}@keyframes xd{to{left:60%;top:55%}}.xm5{left:36%;top:30%;width:130px;height:3px;background:#ef4444;transform:rotate(18deg);transform-origin:left;animation:xe 4s infinite}@keyframes xe{0%,40%{opacity:0}60%,100%{opacity:1}}"+
"@media(prefers-reduced-motion:reduce){.xbot,.xm2,.xm3,.xm4,.xm5{animation:none}}";
document.head.appendChild(css2);

var TMP={},PS={tool:"pen",col:"r",undo:[],redo:[],cur:null};
function penStore(saved){if(saved){D2.data.pen=D2.data.pen||[];return D2.data.pen}TMP[D2.id]=TMP[D2.id]||[];return TMP[D2.id]}
function penAll(x){var a=[];if(x.penShow){if(D2.data&&D2.data.pen)a=a.concat(D2.data.pen)}return a.concat(TMP[D2.id]||[])}
function penPersist(id){var meta=D2T.filter(function(y){return y.id===(id||D2.id)})[0];if(meta&&meta.loc){try{d2saveLoc(meta)}catch(e){}}}
function d2enh(){
 var x=xGet(),svg=$("#map svg.map"),mm=$("#map .mm");if(sec!=="d2"||!svg||!mm||!D2.data||mm.__xi)return;
 var pb=$$("#map button").filter(function(b){return/^(Play|Pausar)$/.test(b.textContent.trim())})[0];if(!pb)return;
 var col=el("div",{class:"xcol"}),wr=el("div",{class:"mwrap xrw"});svg.parentNode.insertBefore(col,svg);col.appendChild(wr);wr.appendChild(svg);
 var ct=col.nextElementSibling,sl=ct&&ct.nextElementSibling;if(!sl||!sl.classList.contains("scrub"))return;mm.__xi=1;var k2=sl.nextElementSibling;
 var ov=document.createElementNS("http://www.w3.org/2000/svg","svg");ov.setAttribute("viewBox","0 0 1000 1000");ov.setAttribute("class","xpensvg");wr.appendChild(ov);
 var clk=el("div",{class:"xclk","aria-live":"off"});wr.appendChild(clk);
 function upd(){if(window.__mkb){var kk=D2.id+"|"+D2.r;if(kk!==window.__mkk){window.__mkk=kk;window.__mkb()}}var r=D2.data.rounds[D2.r],b=r&&r.bomb&&r.bomb.plant,t=D2.t,txt="",col="#fff";
  if(eff(x,"clock")){var mt=/relógio (\d+:\d\d)/.exec(ct.textContent);txt=mt?mt[1]:"";
   if(x.c4&&b&&t>=b.t&&40-(t-b.t)>0){var rm=40-(t-b.t);txt="💣 "+rm.toFixed(1)+"s";col=rm>10.5?"#4ade80":rm>4.7?"#facc15":"#f87171"}}
  clk.textContent=txt;clk.style.color=col;clk.style.display=txt?"":"none";
  var h="";penAll(x).concat(PS.cur?[PS.cur]:[]).forEach(function(q){if(q.r!==D2.r||t<q.t0||(q.t1!=null&&t>q.t1))return;h+='<polyline points="'+q.p.map(function(p){return p.join(",")}).join(" ")+'" fill="none" stroke="'+PCOL2[q.c]+'" stroke-width="'+q.w+'" stroke-linecap="round" stroke-linejoin="round"/>'+(q.p.length===1?'<circle cx="'+q.p[0][0]+'" cy="'+q.p[0][1]+'" r="'+q.w+'" fill="'+PCOL2[q.c]+'"/>':"")});ov.innerHTML=h}
 new MutationObserver(upd).observe(ct,{childList:true,characterData:true,subtree:true});
 /* barra de reprodução */
 window.__mkb=null;window.__mkk=null;
 if(eff(x,"player")){var bar=el("div",{class:"xplayer"}),row=el("div",{class:"row"}),mk=el("div",{class:"xmk"});
  function adopt(){var pb2=$$("button",mm).filter(function(b){return/^(Play|Pausar)$/.test(b.textContent.trim())})[0];if(!pb2||pb2.parentElement===row)return;
   var sp=$$("select",mm).filter(function(s){return[].some.call(s.options,function(o){return o.textContent==="8x"})})[0],rs=$$("button",mm).filter(function(b){return b.textContent==="Reiniciar"})[0];
   row.innerHTML="";row.appendChild(pb2);if(rs)row.appendChild(rs);if(sp)row.appendChild(sp.closest("label")||sp.parentElement)}
  adopt();bar.appendChild(row);bar.appendChild(sl);bar.appendChild(mk);if(k2)k2.style.display="none";col.appendChild(bar);
  function mkBuild(){mk.innerHTML="";var r=D2.data.rounds[D2.r];if(!r)return;var d=d2dur(r)||1;
   function tick(cls,t,col,tt){var b=el("button",{type:"button",class:cls,title:tt});b.style.setProperty("--c",col);b.style.left=Math.min(100,Math.max(0,t/d*100))+"%";b.setAttribute("aria-label",tt);b.onclick=function(){mm.xseek&&mm.xseek(t)};mk.appendChild(b)}
   function nmOf(id){var p=(r.players||[]).filter(function(q){return String(q.id)===String(id)})[0];return p?p.name:id}
   (r.kills||[]).forEach(function(k){tick("k",k.t,"#e11d1d",nmOf(k.k)+" abate "+nmOf(k.v)+" · "+fmtT(Math.max(0,115-k.t)))});
   (r.nades||[]).forEach(function(g){var ty=String(g.type||"").toLowerCase();ty=/incend|inferno|molo/.test(ty)?"molotov":/^he/.test(ty)?"he":/flash/.test(ty)?"flash":/smoke/.test(ty)?"smoke":ty;if(UPIE[ty])tick("n",g.t1,UPIE[ty],"Utilitária: "+ty)});
   if(r.bomb&&r.bomb.plant)tick("c",r.bomb.plant.t,"#f0771c","C4 plantada")}
  window.__mkb=mkBuild;mkBuild();window.__mkk=D2.id+"|"+D2.r;
  var tb0=$(".tb",mm);if(tb0)new MutationObserver(function(){adopt();mkBuild()}).observe(tb0,{childList:true});
  if(x.barMode==="touch"){bar.classList.add("xhide");wr.addEventListener("click",function(e){if(e.target.closest(".xfsb"))return;bar.classList.toggle("xhide")})}
  /* lápis */
  if(eff(x,"pen")){var tb=el("div",{class:"xpentb row"}),cols=String(x.penCols).split(",");if(cols.indexOf(PS.col)<0)PS.col=cols[0];
   var on=false;function sync(){ov.classList.toggle("on",on);pen.setAttribute("aria-pressed",String(on))}
   var pen=btn("✏ Lápis","tool",function(){on=!on;sync()});tb.appendChild(pen);
   PENC.forEach(function(q){if(cols.indexOf(q[0])<0)return;var s=el("button",{type:"button",class:"xsw","aria-label":q[1],"aria-pressed":String(PS.col===q[0]&&PS.tool==="pen")});s.style.background=PCOL2[q[0]];s.onclick=function(){PS.col=q[0];PS.tool="pen";on=true;sync();$$(".xsw",tb).forEach(function(z){z.setAttribute("aria-pressed","false")});s.setAttribute("aria-pressed","true");er.setAttribute("aria-pressed","false")};tb.appendChild(s)});
   var er=btn("Borracha","tool",function(){PS.tool=PS.tool==="erase"?"pen":"erase";on=true;sync();er.setAttribute("aria-pressed",String(PS.tool==="erase"))});tb.appendChild(er);
   var un=btn("↶","tool",function(){var q=PS.undo.pop();if(!q)return;q.arr.splice(q.arr.indexOf(q.m),1);PS.redo.push(q);penPersist();upd()}),re=btn("↷","tool",function(){var q=PS.redo.pop();if(!q)return;q.arr.push(q.m);PS.undo.push(q);penPersist();upd()});un.title="Desfazer marca";re.title="Refazer marca";tb.appendChild(un);tb.appendChild(re);
   tb.appendChild(btn("Limpar tudo","tool",function(){ask("Apagar todas as marcas deste round?",function(){[penStore(false),D2.data.pen||[]].forEach(function(a){for(var i=a.length-1;i>=0;i--)if(a[i].r===D2.r)a.splice(i,1)});PS.undo=[];PS.redo=[];penPersist();upd()})}));
   var vs=el("label",{class:"sl"}),ck=el("input",{type:"checkbox"});ck.style.width="auto";ck.checked=!!x.penShow;ck.onchange=function(){xSet("penShow",ck.checked?1:0);upd()};vs.appendChild(ck);vs.appendChild(document.createTextNode(" Ver marcas"));tb.appendChild(vs);
   if(x.penMode==="saved"){var pu=btn("Publicar marcas","tool",function(){var meta=D2T.filter(function(y){return y.id===D2.id})[0];if(!meta){setSt("Salve a demo antes de publicar as marcas.");return}penPersist();d2pub(meta)});tb.appendChild(pu)}
   bar.appendChild(tb);
   ov.addEventListener("pointerdown",function(e){if(!on)return;e.preventDefault();var p=ptr(ov,e);
    if(PS.tool==="erase"){var all=[[penStore(false)],[D2.data.pen||[]]],hit=null;all.forEach(function(a){a[0].forEach(function(q){if(q.r===D2.r&&D2.t>=q.t0&&(q.t1==null||D2.t<=q.t1)&&q.p.some(function(z){return Math.hypot(z[0]-p[0],z[1]-p[1])<28}))hit={a:a[0],q:q}})});if(hit){hit.a.splice(hit.a.indexOf(hit.q),1);penPersist();upd()}return}
    ov.setPointerCapture(e.pointerId);PS.cur={r:D2.r,t0:D2.t,t1:x.penDur?D2.t+x.penDur:null,c:PS.col,w:x.penW,p:[p]};upd()});
   ov.addEventListener("pointermove",function(e){if(!PS.cur)return;var p=ptr(ov,e),l=PS.cur.p[PS.cur.p.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>3){PS.cur.p.push(p);upd()}});
   function end(){if(!PS.cur)return;var q=PS.cur;PS.cur=null;var sv=x.penMode==="saved",a=penStore(sv);a.push(q);PS.undo.push({arr:a,m:q});PS.redo=[];if(sv){penPersist();setSt("Marca salva na demo. Use Publicar marcas para todos verem.")}upd()}
   ov.addEventListener("pointerup",end);ov.addEventListener("pointercancel",end)}
 }
 upd()}

var mp0=document.getElementById("map");if(mp0)new MutationObserver(function(){if(sec==="d2"&&D2.data){var m0=$("#map .mm");if(m0&&!m0.__xi)requestAnimationFrame(d2enh)}}).observe(mp0,{childList:true,subtree:true});

/* ---------- botão ? (explicação só ao tocar) ---------- */
var css3=document.createElement("style");css3.textContent=".xq{width:24px;height:24px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 13px/1 sans-serif;cursor:pointer;padding:0;margin:0 4px;vertical-align:middle;flex:none}.xpop{position:fixed;z-index:50;left:10px;right:10px;bottom:calc(14px + env(safe-area-inset-bottom,0px));max-width:520px;margin:0 auto;background:var(--card);color:var(--ink);border:1px solid var(--acc);border-radius:12px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.4)}";document.head.appendChild(css3);
function pop(t){var o=$(".xpop");if(o)o.remove();var d=el("div",{class:"xpop",role:"status"});d.textContent=t;d.onclick=function(){d.remove()};document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove()},9000)}
function helpQ(){var x=xGet();$$(".xq").forEach(function(q){q.remove()});var on=x.help==null?DSC==="short":!!x.help;if(!on)return;
 $$("#map .tool[title],#map button.b[title],#map label[title]").forEach(function(b){if(b.closest(".xpn")||!b.title||b.title.length<12)return;var q=btn("?","xq",function(e){e.stopPropagation();pop(b.title)});q.setAttribute("aria-label","Explicação");b.parentNode.insertBefore(q,b.nextSibling)});
 $$("#map p.hint[title]").forEach(function(p){var q=btn("?","xq",function(){pop(p.title)});q.setAttribute("aria-label","Ler descrição completa");p.appendChild(q)})}
/* ---------- marcas do lápis na Comparação (só ver) ---------- */
function cmpEnh(){if(sec!=="cmp")return;var mm=$("#map .mm"),svg=mm&&$("svg.map",mm);if(!mm||!mm.xst||!svg||mm.__xc)return;mm.__xc=1;var st=mm.xst,x=xGet();
 var wr=svg.parentElement;wr.classList.add("xrw");
 var ov=document.createElementNS("http://www.w3.org/2000/svg","svg");ov.setAttribute("viewBox","0 0 1000 1000");ov.setAttribute("class","xpensvg");wr.appendChild(ov);
 var cap=$("p.cap",mm),show=x.penShow;
 var lb=el("label",{class:"sl"}),ck=el("input",{type:"checkbox"});ck.style.width="auto";ck.checked=!!show;ck.onchange=function(){show=ck.checked?1:0;xSet("penShow",show);upd()};lb.appendChild(ck);lb.appendChild(document.createTextNode(" Ver marcas do lápis (erros marcados na demo)"));cap.parentNode.insertBefore(lb,cap);
 var upd=function(){var h="";if(show&&st.d&&st.id){var pl=(st.d.rounds||[])[st.r];pl=pl&&pl.players&&pl.players[st.p];var f=pl&&pl.f||[],t=(f.length?f[0][0]:0)+st.t;
   ((st.d.pen||[]).concat(TMP[st.id]||[])).forEach(function(q){if(q.r!==st.r||t<q.t0||(q.t1!=null&&t>q.t1))return;h+='<polyline points="'+q.p.map(function(p){return p.join(",")}).join(" ")+'" fill="none" stroke="'+PCOL2[q.c]+'" stroke-width="'+q.w+'" stroke-linecap="round" stroke-linejoin="round"/>'})}ov.innerHTML=h}
 if(cap)new MutationObserver(function(){upd()}).observe(cap,{childList:true,characterData:true,subtree:true});
 function tNow(){var pl=(st.d.rounds||[])[st.r];pl=pl&&pl.players&&pl.players[st.p];var f=pl&&pl.f||[];return(f.length?f[0][0]:0)+st.t}
 if(eff(x,"pen")){var on=false,cols=String(x.penCols).split(","),tb=el("div",{class:"xpentb row"}),cur=null,U=[],R=[];if(cols.indexOf(PS.col)<0)PS.col=cols[0];
  function sync(){ov.classList.toggle("on",on);pen.setAttribute("aria-pressed",String(on))}
  var pen=btn("✏ Lápis","tool",function(){on=!on;sync()});tb.appendChild(pen);
  PENC.forEach(function(q){if(cols.indexOf(q[0])<0)return;var b=el("button",{type:"button",class:"xsw","aria-label":q[1],"aria-pressed":String(PS.col===q[0])});b.style.background=PCOL2[q[0]];b.onclick=function(){PS.col=q[0];PS.tool="pen";on=true;sync();$$(".xsw",tb).forEach(function(z){z.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");er.setAttribute("aria-pressed","false")};tb.appendChild(b)});
  var er=btn("Borracha","tool",function(){PS.tool=PS.tool==="erase"?"pen":"erase";on=true;sync();er.setAttribute("aria-pressed",String(PS.tool==="erase"))});tb.appendChild(er);
  tb.appendChild(btn("↶","tool",function(){var q=U.pop();if(!q)return;q.a.splice(q.a.indexOf(q.m),1);R.push(q);penPersist(st.id);upd()}));
  tb.appendChild(btn("↷","tool",function(){var q=R.pop();if(!q)return;q.a.push(q.m);U.push(q);penPersist(st.id);upd()}));
  cap.parentNode.insertBefore(tb,lb);
  function arr(sv){if(sv){st.d.pen=st.d.pen||[];return st.d.pen}TMP[st.id]=TMP[st.id]||[];return TMP[st.id]}
  var _u=upd;upd=function(){_u();if(cur&&show){ov.insertAdjacentHTML("beforeend",'<polyline points="'+cur.p.map(function(p){return p.join(",")}).join(" ")+'" fill="none" stroke="'+PCOL2[cur.c]+'" stroke-width="'+cur.w+'" stroke-linecap="round"/>')}};
  ov.addEventListener("pointerdown",function(e){if(!on||!st.d)return;e.preventDefault();var p=ptr(ov,e),t=tNow();
   if(PS.tool==="erase"){[arr(false),st.d.pen||[]].forEach(function(a){a.slice().forEach(function(q){if(q.r===st.r&&t>=q.t0&&(q.t1==null||t<=q.t1)&&q.p.some(function(z){return Math.hypot(z[0]-p[0],z[1]-p[1])<28})){a.splice(a.indexOf(q),1);penPersist(st.id)}})});upd();return}
   ov.setPointerCapture(e.pointerId);cur={r:st.r,t0:t,t1:x.penDur?t+x.penDur:null,c:PS.col,w:x.penW,p:[p]};upd()});
  ov.addEventListener("pointermove",function(e){if(!cur)return;var p=ptr(ov,e),l=cur.p[cur.p.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>3){cur.p.push(p);upd()}});
  function end(){if(!cur)return;var q=cur;cur=null;var sv=x.penMode==="saved",a=arr(sv);a.push(q);U.push({a:a,m:q});R.length=0;if(sv){penPersist(st.id);setSt("Marca salva na demo. Publique a demo para todos verem.")}upd()}
  ov.addEventListener("pointerup",end);ov.addEventListener("pointercancel",end)}
 upd()}
var mp1=document.getElementById("map");if(mp1)new MutationObserver(function(){if(sec==="cmp"){var m0=$("#map .mm");if(m0&&m0.xst&&!m0.__xc)requestAnimationFrame(cmpEnh)}}).observe(mp1,{childList:true,subtree:true});

/* ---------- anotação por jogador, mover defaults, setas laterais ---------- */
var PEFO={};
function extras2(){var x=xGet();$$(".xpb,.xmv").forEach(function(n){n.remove()});
 if(x.pef==="fold"){$$("#map .players .pl").forEach(function(pl,i){var ta=pl.querySelector(":scope>textarea:last-of-type");if(!ta)return;var key=[sec,cur,side,i].join("|"),b=btn("","xpb");function lab(){var o=!!PEFO[key];ta.style.display=o?"":"none";b.textContent=(o?"▾ ":"▸ ")+"Anotação"+(!o&&ta.value?" ("+ta.value.slice(0,24).replace(/\s+/g," ")+"…)":"")}b.onclick=function(){PEFO[key]=!PEFO[key];lab()};lab();ta.parentNode.insertBefore(b,ta)})}
 else $$("#map .players .pl>textarea").forEach(function(t){t.style.display=""});
 if(eff(x,"reorder")&&P()==="pc"){$$("#map .def").forEach(function(d){if(!d.xmove||d.xn<2)return;var row=d.querySelector(":scope>.row");if(!row)return;
  var u=btn("▲","b edt xmv",function(){d.xmove(-1)}),dn=btn("▼","b edt xmv",function(){d.xmove(1)});u.title="Subir";dn.title="Descer";u.setAttribute("aria-label","Subir este default");dn.setAttribute("aria-label","Descer este default");u.disabled=d.xi===0;dn.disabled=d.xi===d.xn-1;row.appendChild(u);row.appendChild(dn)})}}
function latH(){var m=$("#map");if(!m)return;if(document.body.classList.contains("x-lat")){var t=m.getBoundingClientRect().top+(window.scrollY||0);m.style.height=Math.max(320,innerHeight-t-72)+"px"}else m.style.height=""}addEventListener("resize",latH);
var L1=btn("‹","xlat",function(){var m=$("#map");m.scrollBy({left:-m.clientWidth*.9,behavior:"smooth"})}),L2=btn("›","xlat",function(){var m=$("#map");m.scrollBy({left:m.clientWidth*.9,behavior:"smooth"})});L1.id="xl1";L2.id="xl2";L1.setAttribute("aria-label","Anterior");L2.setAttribute("aria-label","Próximo");document.body.appendChild(L1);document.body.appendChild(L2);
/* ---------- topo: desfazer, aviso de salvamento, última visão ---------- */
var uB=btn("↶","","");uB.id="xundo";uB.title="Desfazer";uB.setAttribute("aria-label","Desfazer");uB.onclick=function(){var b=$$("#map button").filter(function(q){return/^Desfazer/i.test(q.textContent.trim())&&!q.disabled})[0];if(b)b.click();else setSt("Nada para desfazer nesta tela.")};document.body.appendChild(uB);
var rB=btn("↷","","");rB.id="xredo";rB.title="Refazer";rB.setAttribute("aria-label","Refazer");rB.onclick=function(){var b=$$("#map button").filter(function(q){return/^Refazer/i.test(q.textContent.trim())&&!q.disabled})[0];if(b)b.click();else setSt("Nada para refazer nesta tela.")};document.body.appendChild(rB);
var sB=el("div",{id:"xsave",role:"status"});document.body.appendChild(sB);
function topChips(){var x=xGet();uB.style.display=rB.style.display=eff(x,"undoTop")?"":"none";var show=eff(x,"saveTop");sB.style.display=show?"":"none";
 if(show){var off=navigator.onLine===false,d=0;try{d=Object.keys(DIRTY).length}catch(e){}sB.textContent=off?"Sem internet":d?"Falta publicar":"Salvo"}}
addEventListener("online",topChips);addEventListener("offline",topChips);setInterval(topChips,4000);
function remember(){var x=xGet();if(!x.remember)return;try{localStorage.setItem("cs2-last-"+cfgKey(),JSON.stringify({sec:sec,cur:cur,side:side}))}catch(e){}}
function restore(){var x=xGet();if(!x.remember)return;try{var o=JSON.parse(localStorage.getItem("cs2-last-"+cfgKey())||"null");if(o&&SEC[o.sec]&&o.sec!=="cfg"){sec=o.sec;cur=o.cur|0;if(o.side==="tr"||o.side==="ct")side=o.side}}catch(e){}}

/* ---------- tutorial ---------- */
function tutorial(){var old=$(".xtut");if(old)old.remove();try{localStorage.setItem("cs2-tut","1")}catch(e){}
 var S2=[["Menu ⋮ e layout","Toque no ⋮ para abrir as Configurações. Lá você troca para o layout Organizado e as abas ficam agrupadas.",'<i class="xm1">⋮</i><i class="xm2">Layout<br><b>Organizado</b></i><i class="xm3">Planejar<br>Default<br>Calls</i><i class="xbot">🤖</i>'],
 ["Radar em tela inteira","Use ⛶ no canto do radar. Na tela inteira, X ou Esc fecham, + abre as edições rápidas e 📷 salva uma imagem.",'<i class="xm4" style="left:30%;top:20%;width:90px;height:90px;border-radius:8px;background:#2a3640"></i><i class="xm1" style="left:8px;right:auto">⛶</i><i class="xbot">🤖</i>'],
 ["Player e lápis","O Play fica abaixo do radar e o relógio no topo. Com o lápis você marca o erro e ele aparece só naquele trecho do replay.",'<i class="xm4"></i><i class="xm5"></i><i class="xbot">🤖</i>'],
 ["Recolher e expandir","Toque no cabeçalho de um bloco para diminuir ou aumentar. Recolher tudo e Expandir tudo ficam no topo da aba.",'<i class="xm3" style="width:80%;height:30px;bottom:auto;opacity:1">▾ Parte 1</i><i class="xm3" style="width:80%;height:30px;top:48px;bottom:auto;opacity:1">▸ Parte 2 · 3 jogadores</i><i class="xbot">🤖</i>']],i=0;
 var ov=el("div",{class:"xtut",role:"dialog","aria-label":"Tutorial"}),bx=el("div",{class:"xtd"});ov.appendChild(bx);document.body.appendChild(ov);
 function dr(){bx.innerHTML="";var h=el("h2");h.textContent=S2[i][0];var m=el("div",{class:"xmock","aria-hidden":"true"});m.innerHTML=S2[i][2];var p=el("p");p.textContent=S2[i][1];var r=el("div",{class:"row"});
  S2.forEach(function(q,j){var t=btn(String(j+1),"tool",function(){i=j;dr()});t.setAttribute("aria-pressed",String(j===i));r.appendChild(t)});
  var nx=btn(i<S2.length-1?"Próximo":"Concluir","b primary",function(){if(i<S2.length-1){i++;dr()}else ov.remove()}),x=btn("× Fechar","b",function(){ov.remove()});
  var r2=el("div",{class:"row"});r2.style.marginTop="10px";r2.appendChild(nx);r2.appendChild(x);[h,m,p,r,r2].forEach(function(k){bx.appendChild(k)})}
 dr()}
var tt=0,ti=setInterval(function(){if(++tt>40){clearInterval(ti);return}if(localStorage.getItem("cs2-tut")){clearInterval(ti);return}if(!$(".ov")&&document.getElementById("map")&&VIEW){clearInterval(ti);tutorial()}},1000);

try{var x0=xGet();if(P()==="mobile"&&x0.read){ROU=true}restore()}catch(e){}
render();
})();

