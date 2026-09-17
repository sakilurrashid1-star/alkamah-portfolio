from pathlib import Path

INDEX = Path("index.html")
MARKER = "<!-- SAKIL PROFESSIONAL EXPERIENCE ANIMATION -->"

html = INDEX.read_text(encoding="utf-8")
if MARKER in html:
    print("Experience animation already installed; nothing to do.")
    raise SystemExit(0)

css = r'''
/* SAKIL PROFESSIONAL EXPERIENCE — cinematic career animation */
.sakil-exp-enhanced{position:relative!important;isolation:isolate;overflow:hidden}
.sakil-exp-enhanced::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.28;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.05) 50%,transparent 100%),repeating-linear-gradient(90deg,transparent 0 78px,rgba(255,255,255,.035) 79px 80px);animation:sakilExpGrid 12s linear infinite}
.sakil-exp-enhanced::after{content:"";position:absolute;width:55vw;height:55vw;max-width:760px;max-height:760px;left:50%;top:45%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.10),rgba(124,77,255,.055) 35%,transparent 70%);filter:blur(8px);pointer-events:none;z-index:0;animation:sakilExpAura 7s ease-in-out infinite}
.sakil-exp-enhanced>*{position:relative;z-index:2}
.sakil-exp-aura{position:absolute!important;inset:8% 0 8% 0;z-index:1!important;pointer-events:none;overflow:hidden}
.sakil-exp-rail{position:absolute;left:clamp(16px,5vw,72px);top:0;bottom:0;width:2px;background:linear-gradient(to bottom,transparent,rgba(0,229,255,.18) 10%,rgba(0,229,255,.8) 50%,rgba(124,77,255,.22) 90%,transparent);box-shadow:0 0 16px rgba(0,229,255,.35)}
.sakil-exp-rail::before{content:"";position:absolute;left:50%;top:-20%;width:7px;height:20%;transform:translateX(-50%);border-radius:999px;background:linear-gradient(to bottom,transparent,#fff,rgba(0,229,255,.95),transparent);filter:blur(.2px);box-shadow:0 0 18px rgba(0,229,255,.95),0 0 42px rgba(124,77,255,.65);animation:sakilExpScan 4.8s ease-in-out infinite}
.sakil-exp-node{position:absolute;left:clamp(16px,5vw,72px);width:13px;height:13px;transform:translateX(-50%);border-radius:50%;border:2px solid rgba(255,255,255,.85);background:#07111f;box-shadow:0 0 0 5px rgba(0,229,255,.08),0 0 18px rgba(0,229,255,.85);animation:sakilExpNode 2.6s ease-in-out infinite}
.sakil-exp-node:nth-child(2){top:20%;animation-delay:.35s}.sakil-exp-node:nth-child(3){top:50%;animation-delay:.7s}.sakil-exp-node:nth-child(4){top:80%;animation-delay:1.05s}
.sakil-exp-card{transition:transform .55s cubic-bezier(.2,.8,.2,1),filter .55s ease,box-shadow .55s ease;animation:sakilExpCardIn .9s both}
.sakil-exp-card:nth-of-type(2){animation-delay:.12s}.sakil-exp-card:nth-of-type(3){animation-delay:.24s}.sakil-exp-card:nth-of-type(4){animation-delay:.36s}.sakil-exp-card:hover{transform:translateY(-7px) scale(1.012);filter:saturate(1.08);box-shadow:0 18px 60px rgba(0,229,255,.13),0 0 0 1px rgba(255,255,255,.07) inset}
.sakil-exp-card::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.10) 50%,transparent 65%);transform:translateX(-130%);animation:sakilExpSheen 5.5s ease-in-out infinite}
@keyframes sakilExpGrid{to{background-position:160px 0,160px 0}}
@keyframes sakilExpAura{0%,100%{transform:translate(-50%,-50%) scale(.92);opacity:.7}50%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}
@keyframes sakilExpScan{0%{top:-22%}55%,100%{top:105%}}
@keyframes sakilExpNode{0%,100%{transform:translateX(-50%) scale(.9);opacity:.72}50%{transform:translateX(-50%) scale(1.22);opacity:1;box-shadow:0 0 0 8px rgba(0,229,255,.08),0 0 28px rgba(0,229,255,1)}}
@keyframes sakilExpCardIn{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes sakilExpSheen{0%,55%{transform:translateX(-130%)}78%,100%{transform:translateX(130%)}}
@media (prefers-reduced-motion:reduce){.sakil-exp-enhanced::before,.sakil-exp-enhanced::after,.sakil-exp-rail::before,.sakil-exp-node,.sakil-exp-card,.sakil-exp-card::after{animation:none!important}.sakil-exp-card{opacity:1!important;transform:none!important}}
'''

js = r'''
(function(){
  function initSakilExperience(){
    if(document.querySelector('.sakil-exp-enhanced')) return;
    const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    const heading=headings.find(el=>/professional\s+experience|employment|work\s+experience/i.test((el.textContent||'').trim()));
    if(!heading) return;
    let section=heading.closest('section')||heading.closest('[id]')||heading.parentElement;
    if(!section) return;
    section.classList.add('sakil-exp-enhanced');
    const aura=document.createElement('div');
    aura.className='sakil-exp-aura';
    aura.innerHTML='<span class="sakil-exp-rail"></span><span class="sakil-exp-node"></span><span class="sakil-exp-node"></span><span class="sakil-exp-node"></span>';
    section.prepend(aura);
    const candidates=[...section.querySelectorAll('article,.card,.timeline-item,.experience-item,.experience-card,[class*="experience-card"],[class*="timeline-item"]')].filter(el=>!el.closest('.sakil-exp-aura'));
    const cards=candidates.length?candidates:[...section.children].filter(el=>el!==aura&&el.textContent.trim().length>80);
    cards.forEach((el,i)=>{el.classList.add('sakil-exp-card');el.style.setProperty('--sakil-exp-i',i)});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initSakilExperience); else initSakilExperience();
  setTimeout(initSakilExperience,1200);
})();
'''

payload = MARKER + "\n<style>" + css + "</style>\n<script>" + js + "</script>\n"

needle = "</head>"
if needle.lower() not in html.lower():
    raise SystemExit("Could not find </head> in index.html")
pos = html.lower().rfind(needle.lower())
html = html[:pos] + payload + html[pos:]
INDEX.write_text(html, encoding="utf-8")
print("Installed cinematic Professional Experience animation into index.html")
