/* =========================================================
   FolioFly — templates.js
   Defines every resume template: its picker metadata (name,
   category, thumbnail) and its render(cv, lang) function that
   produces the actual HTML shown in the live preview / PDF.

   To add a new template later: write a render function below,
   then add one entry to the TEMPLATES array at the bottom.
   Nothing outside this file needs to change.
   ========================================================= */

const LABELS = {
  ar: { summary:'نبذة', experience:'الخبرات العملية', education:'التعليم', skills:'المهارات', languages:'اللغات' },
  en: { summary:'Summary', experience:'Experience', education:'Education', skills:'Skills', languages:'Languages' }
};

/* ---------------- shared helpers ---------------- */
function esc(str){
  return (str||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function tDir(lang){ return lang==='en' ? 'ltr' : 'rtl'; }
function alignStart(lang){ return lang==='en' ? 'left' : 'right'; }
function contactList(p){ return [p.email, p.phone, p.city].filter(Boolean); }

function entryRow(title, subtitle, dateRange, desc, accent){
  return `<div style="margin-bottom:9px;">
    <div style="display:flex; justify-content:space-between; gap:8px; font-weight:700; font-size:12px;">
      <span>${esc(title)}</span><span style="color:${accent}; font-size:10.5px; white-space:nowrap;">${esc(dateRange)}</span>
    </div>
    <div style="font-size:11px; color:#666; margin-bottom:2px;">${esc(subtitle)}</div>
    ${desc ? `<div style="font-size:11px; color:#333;">${esc(desc)}</div>` : ''}
  </div>`;
}
function expEntries(cv, accent){
  return cv.experience.map(x=>entryRow(x.role, x.company, `${x.start} - ${x.end}`, x.desc, accent)).join('');
}
function eduEntries(cv, accent){
  return cv.education.map(x=>entryRow(x.degree, x.school, `${x.start} - ${x.end}`, '', accent)).join('');
}
function timelineItem(title, subtitle, dateRange, dotColor, textColor){
  return `<div style="display:flex; gap:9px; margin-bottom:11px;">
    <div style="width:8px;height:8px;border-radius:50%;background:${dotColor}; margin-top:5px; flex-shrink:0;"></div>
    <div>
      <div style="font-weight:700; font-size:12px; color:${textColor||'inherit'};">${esc(title)}</div>
      <div style="font-size:10.5px; opacity:.75;">${esc(subtitle)} ${subtitle&&dateRange?'•':''} ${esc(dateRange)}</div>
    </div>
  </div>`;
}
function dotBar(filled, total, onColor, offColor){
  let d='';
  for(let i=0;i<total;i++) d += `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;margin-inline-start:3px;background:${i<filled?onColor:offColor}"></span>`;
  return `<span style="white-space:nowrap; vertical-align:middle;">${d}</span>`;
}
function underlineHeader(text, accent){
  return `<div style="font-size:11.5px; font-weight:800; color:${accent}; text-transform:uppercase; letter-spacing:.4px; border-bottom:2px solid ${accent}; padding-bottom:4px; margin:14px 0 8px;">${text}</div>`;
}
function plainHeader(text, accent){
  return `<div style="font-size:11.5px; font-weight:800; text-transform:uppercase; border-bottom:1px solid #ccc; padding-bottom:4px; margin:14px 0 8px; color:${accent||'#111'};">${text}</div>`;
}
function bannerHeader(text, accent){
  return `<div style="background:${accent}; color:#fff; font-size:11px; font-weight:700; padding:7px 10px; margin:14px 0 8px; border-radius:2px;">${text}</div>`;
}
function pillHeader(text, accent){
  return `<div style="display:inline-block; background:${accent}; color:#fff; font-size:9.5px; font-weight:700; padding:4px 11px; border-radius:99px; margin:14px 0 8px;">${text}</div>`;
}
function footerLine(color){
  return `<div style="margin-top:16px; text-align:center; font-size:9px; color:${color||'#aaa'}; direction:ltr;">Designed by FolioFly</div>`;
}

/* =========================================================
   TEMPLATE 1 — Harvard Bold (photo, bold monochrome, ATS-safe)
   ========================================================= */
function renderHarvard(cv, lang){
  const p = cv.personal, accent = '#111';
  return `<div class="padded" dir="${tDir(lang)}" style="text-align:${alignStart(lang)};">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; border-bottom:4px solid #111; padding-bottom:10px; margin-bottom:14px;">
      <div>
        <div style="font-size:22px; font-weight:900; letter-spacing:.5px; text-transform:uppercase;">${esc(p.fullName||'')}</div>
        <div style="font-size:11px; color:#444; margin-top:6px;">${contactList(p).map(esc).join('&nbsp;&nbsp;•&nbsp;&nbsp;')}</div>
      </div>
      ${cv.photo?`<img src="${cv.photo}" style="width:62px;height:62px;border-radius:50%;object-fit:cover;flex-shrink:0;">`:''}
    </div>
    ${p.summary?`<div style="margin-bottom:12px;">${plainHeader(LABELS[lang].summary,accent)}<div style="font-size:12px; color:#333;">${esc(p.summary)}</div></div>`:''}
    ${cv.experience.length?`<div>${plainHeader(LABELS[lang].experience,accent)}${expEntries(cv,'#555')}</div>`:''}
    ${cv.education.length?`<div>${plainHeader(LABELS[lang].education,accent)}${eduEntries(cv,'#555')}</div>`:''}
    ${cv.skills.length?`<div>${plainHeader(LABELS[lang].skills,accent)}<div style="font-size:12px;">${cv.skills.map(s=>esc(s.name)).join(' • ')}</div></div>`:''}
    ${footerLine()}
  </div>`;
}

/* =========================================================
   TEMPLATE 2 — Master's Blue (centered, italic objective, ATS-safe)
   ========================================================= */
function renderMasters(cv, lang){
  const p = cv.personal, accent = '#1d3d7a';
  return `<div class="padded" dir="${tDir(lang)}" style="text-align:center;">
    <div style="font-size:19px; font-weight:800; color:${accent}; letter-spacing:1px;">${esc((p.fullName||'').toUpperCase())}</div>
    <div style="font-size:11px; color:#555; margin:6px 0 10px;">${contactList(p).map(esc).join(' • ')}</div>
    ${p.summary?`<div style="font-style:italic; font-size:11.5px; color:#333; margin-bottom:8px;">${esc(p.summary)}</div>`:''}
    <div style="text-align:${alignStart(lang)};">
      ${cv.education.length?underlineHeader(LABELS[lang].education,accent)+eduEntries(cv,accent):''}
      ${cv.experience.length?underlineHeader(LABELS[lang].experience,accent)+expEntries(cv,accent):''}
      ${cv.skills.length?underlineHeader(LABELS[lang].skills,accent)+`<div style="font-size:12px;">${cv.skills.map(s=>esc(s.name)).join(' • ')}</div>`:''}
    </div>
    ${footerLine()}
  </div>`;
}

/* =========================================================
   TEMPLATE 3 — Elegant Arch (mauve sidebar, circular photo)
   ========================================================= */
function renderElegant(cv, lang){
  const p = cv.personal, accent = '#8a7391';
  const side = `
    ${cv.photo?`<div style="width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 14px;"><img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;"></div>`:''}
    <div style="font-size:10px; line-height:2; text-align:${alignStart(lang)};">
      ${p.email?`<div>✉ ${esc(p.email)}</div>`:''}
      ${p.phone?`<div>☎ ${esc(p.phone)}</div>`:''}
      ${p.city?`<div>📍 ${esc(p.city)}</div>`:''}
    </div>
    ${cv.skills.length?`<div style="text-align:${alignStart(lang)};">${pillHeader(LABELS[lang].skills,accent)}<div style="font-size:10.5px; line-height:1.9;">${cv.skills.map(s=>esc(s.name)).join('<br>')}</div></div>`:''}
    ${cv.languages&&cv.languages.length?`<div style="text-align:${alignStart(lang)};">${pillHeader(LABELS[lang].languages,accent)}<div style="font-size:10.5px; line-height:1.9;">${cv.languages.map(s=>esc(s.name)).join('<br>')}</div></div>`:''}
    ${cv.education.length?`<div style="text-align:${alignStart(lang)};">${pillHeader(LABELS[lang].education,accent)}${cv.education.map(x=>`<div style="font-size:10px; margin-bottom:8px;"><b>${esc(x.degree)}</b><br>${esc(x.school)}<br><span style="opacity:.7;">${esc(x.start)} - ${esc(x.end)}</span></div>`).join('')}</div>`:''}
  `;
  const mainc = `
    <div style="font-size:20px; font-weight:800; font-family:Georgia,serif;">${esc(p.fullName||'')}</div>
    <div style="font-size:11.5px; color:${accent}; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">${esc(p.jobTitle||'')}</div>
    ${p.summary?`<div style="font-size:11px; color:#444; margin-bottom:14px;">${esc(p.summary)}</div>`:''}
    ${cv.experience.length?pillHeader(LABELS[lang].experience,accent)+expEntries(cv,accent):''}
  `;
  const dirv = tDir(lang);
  return `<div dir="${dirv}" style="display:flex; min-height:100%;">
    <div style="width:36%; background:#f2ecf0; padding:70px 14px 18px;">${side}</div>
    <div style="width:64%; padding:22px 16px; text-align:${alignStart(lang)};">${mainc}${footerLine('#ccc')}</div>
  </div>`;
}

/* =========================================================
   TEMPLATE 4 — Marketing Clean (serif name, two-column skills)
   ========================================================= */
function renderMarketingClean(cv, lang){
  const p = cv.personal, accent = '#111';
  return `<div class="padded" dir="${tDir(lang)}" style="text-align:center;">
    <div style="font-size:20px; font-weight:800; font-family:Georgia,serif;">${esc(p.fullName||'')}</div>
    <div style="font-size:11px; color:#555; margin:6px 0 10px; border-bottom:1px solid #ccc; padding-bottom:10px;">${contactList(p).map(esc).join(' | ')}</div>
    <div style="text-align:${alignStart(lang)};">
      ${p.summary?plainHeader(LABELS[lang].summary,accent)+`<div style="font-size:11.5px; color:#333;">${esc(p.summary)}</div>`:''}
      ${cv.education.length?plainHeader(LABELS[lang].education,accent)+eduEntries(cv,'#555'):''}
      ${cv.experience.length?plainHeader(LABELS[lang].experience,accent)+expEntries(cv,'#555'):''}
      ${cv.skills.length?plainHeader(LABELS[lang].skills,accent)+`<div style="columns:2; column-gap:14px; font-size:11px;">${cv.skills.map(s=>`<div style="break-inside:avoid; margin-bottom:4px;">• ${esc(s.name)}</div>`).join('')}</div>`:''}
    </div>
    ${footerLine()}
  </div>`;
}

/* =========================================================
   TEMPLATE 5 & 7 — Bold sidebar family (dark sidebar + banner
   headers + decorative skill/language dot ratings)
   Shared factory used for both "bold-dark-red" and "charcoal-red"
   ========================================================= */
function renderBoldSidebar(cv, lang, cfg){
  const p = cv.personal;
  const accent = cfg.accent, sideBg = cfg.sideBg;
  const topBar = cfg.bubble
    ? `<div style="background:${sideBg}; color:#fff; padding:18px 16px; display:flex; align-items:center; gap:12px;">
        ${cv.photo?`<img src="${cv.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid ${accent};">`:''}
        <div><div style="font-size:17px; font-weight:800; color:${accent};">${esc(p.fullName||'')}</div><div style="font-size:10.5px; opacity:.8;">${esc(p.jobTitle||'')}</div></div>
      </div>
      ${p.summary?`<div style="background:${accent}; color:#fff; font-size:10px; padding:9px 16px;">${esc(p.summary)}</div>`:''}`
    : '';
  const side = `<div style="background:${sideBg}; color:#fff; width:34%; padding:${cfg.bubble?'16px':'70px'} 12px 16px; font-size:10px; line-height:2;">
    ${!cfg.bubble && cv.photo?`<div style="text-align:center; margin-bottom:10px;"><img src="${cv.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;"></div>`:''}
    ${!cfg.bubble?`<div style="font-size:14px; font-weight:800; text-align:center; color:${accent}; margin-bottom:2px;">${esc(p.fullName||'')}</div><div style="font-size:9.5px; text-align:center; opacity:.75; margin-bottom:10px;">${esc(p.jobTitle||'')}</div>`:''}
    ${!cfg.bubble && p.summary?`<div style="font-size:9.5px; opacity:.85; margin-bottom:10px;">${esc(p.summary)}</div>`:''}
    ${contactList(p).map(c=>`<div>${esc(c)}</div>`).join('')}
    ${cv.skills.length?`<div style="margin-top:12px; font-weight:700; color:${accent}; text-transform:uppercase; font-size:9.5px;">${LABELS[lang].skills}</div>${cv.skills.map(s=>`<div style="margin:5px 0; display:flex; justify-content:space-between; gap:6px;"><span>${esc(s.name)}</span>${dotBar(s.rating||4,5,accent,'rgba(255,255,255,.2)')}</div>`).join('')}`:''}
    ${cv.languages&&cv.languages.length?`<div style="margin-top:12px; font-weight:700; color:${accent}; text-transform:uppercase; font-size:9.5px;">${LABELS[lang].languages}</div>${cv.languages.map(s=>`<div style="margin:5px 0; display:flex; justify-content:space-between; gap:6px;"><span>${esc(s.name)}</span>${dotBar(s.rating||4,5,accent,'rgba(255,255,255,.2)')}</div>`).join('')}`:''}
  </div>`;
  const main = `<div style="width:66%; padding:16px 14px;">
    ${cv.experience.length?bannerHeader(LABELS[lang].experience,accent)+expEntries(cv,accent):''}
    ${cv.education.length?bannerHeader(LABELS[lang].education,accent)+eduEntries(cv,accent):''}
  </div>`;
  return `<div dir="${tDir(lang)}">${topBar}<div style="display:flex;">${side}${main}</div>${footerLine()}</div>`;
}
function renderBoldDarkRed(cv, lang){
  return renderBoldSidebar(cv, lang, { accent:'#e02424', sideBg:'#14161b', bubble:true });
}
function renderCharcoalRed(cv, lang){
  return renderBoldSidebar(cv, lang, { accent:'#d21f1f', sideBg:'#2b2b2b', bubble:false });
}

/* =========================================================
   TEMPLATE 6 — Qatari Timeline (navy sidebar + timeline main)
   ========================================================= */
function renderTimelineNavy(cv, lang){
  const p = cv.personal, accent = '#1b3a5c';
  const side = `<div style="background:${accent}; color:#fff; width:34%; padding:22px 12px; text-align:center;">
    ${cv.photo?`<img src="${cv.photo}" style="width:76px;height:76px;border-radius:50%;object-fit:cover; margin-bottom:12px;">`:''}
    <div style="text-align:${alignStart(lang)}; font-size:10px; line-height:1.9;">
      ${p.city?`<div>📍 ${esc(p.city)}</div>`:''}
      ${p.phone?`<div>☎ ${esc(p.phone)}</div>`:''}
      ${p.email?`<div>✉ ${esc(p.email)}</div>`:''}
      ${cv.skills.length?`<div style="margin-top:14px; font-weight:700;">${LABELS[lang].skills}</div>${cv.skills.map(s=>`<div>${esc(s.name)}</div>`).join('')}`:''}
      ${cv.languages&&cv.languages.length?`<div style="margin-top:14px; font-weight:700;">${LABELS[lang].languages}</div>${cv.languages.map(s=>`<div>${esc(s.name)}</div>`).join('')}`:''}
    </div>
  </div>`;
  const main = `<div style="width:66%; padding:18px 16px; text-align:${alignStart(lang)};">
    <div style="font-size:18px; font-weight:800;">${esc(p.fullName||'')}</div>
    <div style="font-size:11.5px; color:${accent}; margin-bottom:10px;">${esc(p.jobTitle||'')}</div>
    ${p.summary?underlineHeader(LABELS[lang].summary,accent)+`<div style="font-size:11px; color:#444;">${esc(p.summary)}</div>`:''}
    ${cv.education.length?underlineHeader(LABELS[lang].education,accent)+cv.education.map(x=>timelineItem(x.degree,x.school,`${x.start} - ${x.end}`,accent)).join(''):''}
    ${cv.experience.length?underlineHeader(LABELS[lang].experience,accent)+cv.experience.map(x=>timelineItem(x.role,x.company,`${x.start} - ${x.end}`,accent)).join(''):''}
  </div>`;
  return `<div dir="${tDir(lang)}"><div style="display:flex;">${side}${main}</div>${footerLine()}</div>`;
}

/* =========================================================
   TEMPLATE 8 — Split Red/Navy (full-bleed two-tone columns)
   ========================================================= */
function renderSplitRedNavy(cv, lang){
  const p = cv.personal, redBg='#a52222', navyBg='#161c28';
  const left = `<div style="background:${redBg}; color:#fff; width:34%; padding:22px 13px; text-align:center;">
    ${cv.photo?`<img src="${cv.photo}" style="width:74px;height:74px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.4); margin-bottom:12px;">`:''}
    <div style="font-size:13px; font-weight:800;">${esc(p.fullName||'')}</div>
    <div style="font-size:10px; opacity:.85; margin-bottom:12px;">${esc(p.jobTitle||'')}</div>
    ${p.summary?`<div style="font-size:9.5px; opacity:.9; text-align:${alignStart(lang)}; margin-bottom:12px;">${esc(p.summary)}</div>`:''}
    <div style="text-align:${alignStart(lang)}; font-size:9.5px; line-height:1.9;">${contactList(p).map(c=>`<div>${esc(c)}</div>`).join('')}</div>
    ${cv.languages&&cv.languages.length?`<div style="margin-top:12px; font-weight:700; font-size:10px;">${LABELS[lang].languages}</div><div style="font-size:9.5px;">${cv.languages.map(s=>esc(s.name)).join(' • ')}</div>`:''}
  </div>`;
  const right = `<div style="background:${navyBg}; color:#fff; width:66%; padding:20px 15px;">
    ${cv.education.length?`<div style="font-size:11px; font-weight:800; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.25); padding-bottom:4px; margin-bottom:10px;">${LABELS[lang].education}</div>${cv.education.map(x=>timelineItem(x.degree,x.school,`${x.start} - ${x.end}`,'#fff','#fff')).join('')}`:''}
    ${cv.experience.length?`<div style="font-size:11px; font-weight:800; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.25); padding-bottom:4px; margin:14px 0 10px;">${LABELS[lang].experience}</div>${cv.experience.map(x=>timelineItem(x.role,x.company,`${x.start} - ${x.end}`,'#fff','#fff')).join('')}`:''}
    ${cv.skills.length?`<div style="font-size:11px; font-weight:800; text-transform:uppercase; border-bottom:1px solid rgba(255,255,255,.25); padding-bottom:4px; margin:14px 0 10px;">${LABELS[lang].skills}</div>${cv.skills.map(s=>`<div style="font-size:10.5px; margin:5px 0; display:flex; justify-content:space-between;"><span>${esc(s.name)}</span>${dotBar(s.rating||4,5,'#fff','rgba(255,255,255,.25)')}</div>`).join('')}`:''}
  </div>`;
  return `<div dir="${tDir(lang)}"><div style="display:flex; min-height:460px;">${left}${right}</div>${footerLine('#999')}</div>`;
}

/* =========================================================
   TEMPLATE REGISTRY — picker metadata + mock thumbnail
   ========================================================= */
function mockHtml(tpl){
  if(tpl.mockLayout==='sidebar'){
    return `<div style="width:34%; background:${tpl.accent};"></div>
      <div style="flex:1; padding:8px; display:flex; flex-direction:column; gap:5px;">
        <div style="height:5px; width:60%; border-radius:2px; background:#e2e2e2;"></div>
        <div style="height:5px; width:40%; border-radius:2px; background:#e2e2e2;"></div>
        <div style="height:5px; width:80%; border-radius:2px; background:#e2e2e2;"></div>
      </div>`;
  }
  if(tpl.mockLayout==='split'){
    return `<div style="width:34%; background:${tpl.accent};"></div><div style="width:66%; background:#20242e;"></div>`;
  }
  if(tpl.mockLayout==='centered'){
    return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;">
      <div style="height:6px; width:50%; border-radius:2px; background:${tpl.accent};"></div>
      <div style="height:5px; width:70%; border-radius:2px; background:#e2e2e2;"></div>
      <div style="height:5px; width:60%; border-radius:2px; background:#e2e2e2;"></div>
    </div>`;
  }
  // plain/single
  return `<div style="flex:1; padding:8px; display:flex; flex-direction:column; gap:5px;">
    <div style="height:6px; width:55%; border-radius:2px; background:${tpl.accent};"></div>
    <div style="height:5px; width:75%; border-radius:2px; background:#e2e2e2;"></div>
    <div style="height:5px; width:60%; border-radius:2px; background:#e2e2e2;"></div>
    <div style="height:5px; width:40%; border-radius:2px; background:#e2e2e2;"></div>
  </div>`;
}

const TEMPLATES = [
  { id:'harvard-bold', name:'Harvard الجريء', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#111111', mockLayout:'plain', render:renderHarvard },
  { id:'masters-blue', name:"Master's الأزرق", category:'ats', categoryLabel:'متوافق مع أنظمة الفرز الآلي (ATS)',
    accent:'#1d3d7a', mockLayout:'centered', render:renderMasters },
  { id:'elegant-arch', name:'الأناقة المقوّسة', category:'creative', categoryLabel:'تصميمي / إبداعي',
    accent:'#8a7391', mockLayout:'sidebar', render:renderElegant },
  { id:'marketing-clean', name:'التسويقي النظيف', category:'ats', categoryLabel:'متوافق مع أنظمة الفرز الآلي (ATS)',
    accent:'#111111', mockLayout:'plain', render:renderMarketingClean },
  { id:'bold-dark-red', name:'الجريء الأحمر', category:'creative', categoryLabel:'تصميمي / إبداعي',
    accent:'#e02424', mockLayout:'sidebar', render:renderBoldDarkRed },
  { id:'timeline-navy', name:'الخط الزمني الكحلي', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#1b3a5c', mockLayout:'sidebar', render:renderTimelineNavy },
  { id:'charcoal-red', name:'الفحمي الأحمر', category:'creative', categoryLabel:'تصميمي / إبداعي',
    accent:'#d21f1f', mockLayout:'sidebar', render:renderCharcoalRed },
  { id:'split-red-navy', name:'المنقسم أحمر/كحلي', category:'creative', categoryLabel:'تصميمي / إبداعي',
    accent:'#a52222', mockLayout:'split', render:renderSplitRedNavy },
];
const CATEGORY_ORDER = [
  {key:'ats', label:'متوافق مع أنظمة الفرز الآلي (ATS)'},
  {key:'photo', label:'مع صورة شخصية'},
  {key:'creative', label:'تصميمي / إبداعي'}
];
function getTemplate(id){ return TEMPLATES.find(t=>t.id===id) || TEMPLATES[0]; }
