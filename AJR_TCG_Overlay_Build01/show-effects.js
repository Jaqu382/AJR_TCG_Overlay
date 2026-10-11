const CUE_TEXT={stashpass:'STASH OR PASS',pyt:'PYT',see2:'SEE 2 • PICK 1',see3:'SEE 3 • PICK 2'};
const cueBox=document.getElementById('showCue'),cueTitle=document.getElementById('cueTitle'),cueArt=document.getElementById('cueArt'),givvyText=document.getElementById('givvyText'),givvyBox=document.getElementById('givvyBar');
const cueDisplayView=document.body?.classList.contains('rip-view')?'rip':'full';
let lastCueKey='',lastCueTheme='',lastMotionKey='';
const CUE_PARTS={stashpass:['STASH','OR','PASS'],pyt:['P','Y','T'],see2:['SEE 2','PICK 1'],see3:['SEE 3','PICK 2']};
const CUE_ICONS={halloween:['ghost','pumpkin'],thanksgiving:['leaf','turkey'],christmas:['tree','snowman'],newyear:['firework','firework'],easter:['bunny','egg'],july:['flag','firework'],cosmic:['star','planet']};
function paintCueTheme(theme,title){const classic=['classic','gold','sapphire'].includes(theme);cueBox.dataset.look=classic?'classic':theme;cueTitle.replaceChildren();cueTitle.setAttribute('aria-label',title);const kind=Object.keys(CUE_TEXT).find(k=>CUE_TEXT[k]===title);const parts=CUE_PARTS[kind];cueBox.dataset.kind=kind;cueTitle.style.setProperty('--cycle',parts.length*1300+'ms');parts.forEach((word,i)=>{const span=document.createElement('span');span.textContent=word;span.className='cue-word';span.dataset.phase=String(i*1300);cueTitle.append(span);});
 cueArt.innerHTML=(CUE_ICONS[theme]||[]).map((name,i)=>`<span class="cue-icon cue-icon-${i}">${SEASONAL_ART[name]}</span>`).join('');
 if(theme==='christmas'){cueArt.innerHTML+=`<span class="cue-hat">${SEASONAL_ART.hat}</span><span class="cue-lights">${Array.from({length:17},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</span><span class="cue-snow">${Array.from({length:18},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</span>`;}
 if(theme==='halloween')cueArt.innerHTML+='<span class="cue-bat bat-left">✦</span><span class="cue-bat bat-right">✦</span>';
 if(theme==='newyear'||theme==='july')cueArt.innerHTML+='<span class="cue-sparkles">✦ · ✧ · ✦ · ✧ · ✦</span>';
 if(theme==='cosmic')cueArt.innerHTML+='<span class="cue-orbit"></span><span class="cue-stars">✧　·　✦　·　✧</span>';
}
function updateShowEffects(s){const g=s.givvy;givvyBox.hidden=!g.visible||!g.text.trim();if(givvyText.textContent!==g.text)givvyText.textContent=g.text;
 if(!s.cue||(s.cueView||'full')!==cueDisplayView){cueBox.hidden=true;lastCueKey='';lastMotionKey='';return;}
 const key=s.cue.id,theme=s.theme,title=CUE_TEXT[s.cue.kind];if(!title){cueBox.hidden=true;return;}
 const repaint=key!==lastCueKey||theme!==lastCueTheme;
 if(repaint){paintCueTheme(theme,title);lastCueTheme=theme;}
 const elapsed=(s.cue.elapsedMs||0)+(s.cue.paused?0:Math.max(0,Date.now()-s.cue.startedAt));
 const motionKey=key+':'+theme+':'+s.cue.paused+':'+s.cue.startedAt+':'+s.cue.elapsedMs;
 if(repaint||motionKey!==lastMotionKey){for(const span of cueTitle.children){span.style.animationDelay=-(elapsed-Number(span.dataset.phase))+'ms';}cueBox.dataset.paused=String(!!s.cue.paused);lastMotionKey=motionKey;}
 if(key!==lastCueKey){lastCueKey=key;cueBox.style.animation='none';void cueBox.offsetWidth;if(!s.cue.paused&&elapsed<700){cueBox.style.animation='cueSlam 700ms both';cueBox.style.animationDelay=-elapsed+'ms';}}
 cueBox.hidden=false;
}
