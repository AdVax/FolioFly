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
function contactHtml(p){
  return contactList(p).map(c=>`<span>${esc(c)}</span>`).join('<span style="opacity:.5"> • </span>');
}

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
   TEMPLATE 3 — Marketing Clean (serif name, two-column skills)
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
   TEMPLATE 4 — Jamal Banis (red header band + dark sidebar)
   Built from a pixel-measured analysis of the reference CV
   ========================================================= */
function renderJamalBanisSidebar(cv, lang){
  const p = cv.personal;
  const accent = '#C10004';
  const dark = '#323232';
  const dir = tDir(lang);
  const align = alignStart(lang);
  const photoBlock = p && cv.photo
    ? `<img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;background:${dark};display:flex;align-items:center;justify-content:center;color:#fff;font-size:40px;font-weight:800;">${esc((p && p.fullName ? p.fullName.charAt(0) : ''))}</div>`;

  const skillsHtml = (cv.skills||[]).map(s =>
    `<div style="margin-bottom:14px;">
       <div style="color:#fff;font-weight:700;font-size:13px;letter-spacing:.5px;margin-bottom:6px;text-transform:uppercase;">${esc(s.name)}</div>
       ${dotBar(s.rating, 5, accent, '#5a5a5a')}
     </div>`
  ).join('');

  const contactRows = [
    p.city ? {icon:'📍', text:p.city} : null,
    p.phone ? {icon:'📞', text:p.phone} : null,
    p.email ? {icon:'✉️', text:p.email} : null,
  ].filter(Boolean).map(c =>
    `<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
       <div style="width:34px;height:34px;flex-shrink:0;background:${accent};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">${c.icon}</div>
       <div style="color:#e8e8e8;font-size:13px;line-height:1.5;padding-top:6px;word-break:break-word;">${esc(c.text)}</div>
     </div>`
  ).join('');

  const educationHtml = (cv.education||[]).map(ed =>
    entryRow(esc(ed.degree||''), esc(ed.school||''), esc(`${ed.start||''} – ${ed.end||''}`), '', accent)
  ).join('<div style="height:18px;"></div>');

  const experienceHtml = (cv.experience||[]).map(ex =>
    entryRow(esc(ex.company||''), esc(ex.role||''), esc(`${ex.start||''} – ${ex.end||''}`), esc(ex.desc||''), accent)
  ).join('<div style="height:18px;"></div>');

  const languagesHtml = (cv.languages||[]).map(l =>
    `<div style="margin-bottom:10px;">
       <div style="font-weight:700;font-size:13px;color:#222;margin-bottom:4px;">${esc(l.name)}</div>
       ${dotBar(l.rating, 5, accent, '#e3e3e3')}
     </div>`
  ).join('');

  return `
  <div style="width:100%;font-family:Arial,Helvetica,sans-serif;direction:${dir};text-align:${align};background:#fff;">

    <div style="background:#fff;height:6px;width:100%;"></div>

    <div style="background:${accent};width:100%;display:flex;align-items:center;gap:30px;padding:26px 40px;box-sizing:border-box;">
      <div style="width:150px;height:150px;border-radius:50%;overflow:hidden;border:7px solid #fff;flex-shrink:0;background:#fff;">
        ${photoBlock}
      </div>
      <div style="flex:1;text-align:center;">
        <div style="color:#fff;font-size:38px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${esc(p.fullName||'')}</div>
        <div style="color:#fff;font-size:16px;letter-spacing:5px;text-transform:uppercase;margin-top:8px;font-weight:600;">${esc(p.jobTitle||'')}</div>
      </div>
    </div>

    <div style="background:#fff;height:5px;width:100%;"></div>

    <div style="display:flex;width:100%;align-items:stretch;">

      <div style="width:47%;background:${dark};color:#fff;padding:32px 26px;box-sizing:border-box;">

        <div style="color:${accent};font-size:17px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${lang==='ar' ? 'نبذة عني' : 'About Me'}</div>
        <div style="border-bottom:2px solid ${accent};width:100%;margin-bottom:22px;"></div>

        ${contactRows}

        ${p.summary ? `<div style="color:#d6d6d6;font-size:13px;line-height:1.7;margin:18px 0 26px;">${esc(p.summary)}</div>` : ''}

        <div style="color:${accent};font-size:17px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${LABELS[lang].skills}</div>
        <div style="border-bottom:2px solid ${accent};width:100%;margin-bottom:22px;"></div>
        ${skillsHtml}

      </div>

      <div style="width:53%;background:#fff;color:#222;padding:32px 36px;box-sizing:border-box;">

        <div style="color:${accent};font-size:22px;font-weight:800;text-transform:uppercase;margin-bottom:14px;">${LABELS[lang].education}</div>
        ${educationHtml}

        <div style="color:${accent};font-size:22px;font-weight:800;text-transform:uppercase;margin:28px 0 14px;">${LABELS[lang].experience}</div>
        ${experienceHtml}

        <div style="color:${accent};font-size:22px;font-weight:800;text-transform:uppercase;margin:28px 0 14px;">${LABELS[lang].languages}</div>
        ${languagesHtml}

      </div>

    </div>

    <div style="background:#fff;height:5px;width:100%;"></div>
    <div style="background:${accent};height:16px;width:100%;"></div>

    ${footerLine(accent)}

  </div>
  `;
}

/* =========================================================
   TEMPLATE 5 — Youssef Bahla (dark header, dashed photo ring,
   chevron section banners, dark sidebar)
   ========================================================= */
function renderYoussefBahlaSidebar(cv, lang){
  const p = cv.personal;
  const accent = '#DA1A31';
  const dark = '#1F2326';
  const dir = tDir(lang);
  const align = alignStart(lang);

  const photoBlock = cv.photo
    ? `<img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:46px;font-weight:800;">${esc((p.fullName||'').charAt(0))}</div>`;

  const sectionBar = (label) => `
    <div style="position:relative;background:${accent};padding:14px 28px;margin:0 0 22px 0;clip-path:polygon(0 0,96% 0,100% 50%,96% 100%,0 100%);">
      <div style="color:#fff;font-size:19px;font-weight:800;letter-spacing:1px;text-align:center;text-transform:uppercase;">${esc(label)}</div>
    </div>`;

  const experienceHtml = (cv.experience||[]).map(ex => `
    <div style="margin-bottom:22px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
        <span style="color:${accent};font-size:14px;">■</span>
        <span style="color:${accent};font-weight:800;font-size:15px;letter-spacing:.5px;text-transform:uppercase;">${esc(ex.role||'')}</span>
      </div>
      <div style="color:#222;font-size:16px;margin:2px 0 6px 20px;">${esc(ex.company||'')}${(ex.start||ex.end) ? ' | '+esc(`${ex.start||''} To ${ex.end||''}`) : ''}</div>
      ${ex.desc ? `<div style="color:#444;font-size:13px;line-height:1.6;margin-left:20px;">${esc(ex.desc)}</div>` : ''}
    </div>`
  ).join('');

  const educationHtml = (cv.education||[]).map(ed => `
    <div style="margin-bottom:22px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;flex-wrap:wrap;">
        <span style="color:${accent};font-size:14px;">■</span>
        <span style="color:${accent};font-weight:800;font-size:15px;letter-spacing:.5px;text-transform:uppercase;">${esc(ed.school||'')}</span>
        ${(ed.start||ed.end) ? `<span style="color:#333;font-size:14px;">| ${esc(`${ed.start||''} To ${ed.end||''}`)}</span>` : ''}
      </div>
      ${ed.degree ? `<div style="color:#c9435a;font-weight:700;font-size:14px;margin:4px 0 6px 20px;text-transform:uppercase;">${esc(ed.degree)}</div>` : ''}
    </div>`
  ).join('');

  const toolsHtml = (cv.skills||[]).map(s => `
    <div style="margin-bottom:12px;">
      <div style="color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;">${esc(s.name)}</div>
      ${dotBar(s.rating, 5, accent, '#ffffff')}
    </div>`
  ).join('');

  const languagesHtml = (cv.languages||[]).map(l => `
    <div style="margin-bottom:12px;">
      <div style="color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase;">${esc(l.name)}</div>
      ${dotBar(l.rating, 5, accent, '#ffffff')}
    </div>`
  ).join('');

  const contactItems = contactList(p).map(c =>
    `<div style="color:#fff;font-size:14px;margin-bottom:10px;">• ${esc(c)}</div>`
  ).join('');

  return `
  <div style="width:100%;font-family:Arial,Helvetica,sans-serif;direction:${dir};text-align:${align};background:#fff;">

    <div style="background:${dark};width:100%;box-sizing:border-box;padding:34px 40px 26px;display:flex;align-items:flex-start;gap:36px;">

      <div style="position:relative;width:220px;height:220px;flex-shrink:0;">
        <div style="position:absolute;top:-8px;left:-8px;right:-8px;bottom:-8px;border-radius:50%;border:3px dashed ${accent};"></div>
        <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:${accent};">
          ${photoBlock}
        </div>
      </div>

      <div style="flex:1;padding-top:6px;">
        <div style="color:${accent};font-size:46px;font-weight:800;letter-spacing:1px;text-transform:uppercase;line-height:1;text-shadow:2px 2px 0 rgba(0,0,0,.35);">${esc(p.fullName||'')}</div>
        <div style="color:#fff;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:10px;">${esc(p.jobTitle||'')}</div>
        ${p.summary ? `
        <div style="position:relative;background:${accent};color:#fff;font-size:14px;line-height:1.6;padding:16px 22px;margin-top:16px;border-radius:2px;clip-path:polygon(0 0,100% 0,100% 85%,94% 85%,90% 100%,90% 85%,0 85%);">
          ${esc(p.summary)}
        </div>` : ''}
      </div>

    </div>

    <div style="background:${accent};height:8px;width:100%;"></div>

    <div style="display:flex;width:100%;align-items:stretch;">

      <div style="width:33%;background:${dark};color:#fff;padding:30px 26px;box-sizing:border-box;">

        ${contactItems}

        ${(cv.skills && cv.skills.length) ? `
        <div style="text-align:center;margin:26px 0 18px;">
          <div style="font-size:30px;">🖥️</div>
          <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:6px;">${LABELS[lang].skills}</div>
        </div>
        ${toolsHtml}` : ''}

        ${(cv.languages && cv.languages.length) ? `
        <div style="text-align:center;margin:30px 0 18px;">
          <div style="font-size:28px;">💬</div>
          <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:6px;">${LABELS[lang].languages}</div>
        </div>
        ${languagesHtml}` : ''}

      </div>

      <div style="width:67%;background:#fff;padding:30px 34px;box-sizing:border-box;">

        ${(cv.experience && cv.experience.length) ? sectionBar(LABELS[lang].experience) : ''}
        ${experienceHtml}

        ${(cv.education && cv.education.length) ? sectionBar(LABELS[lang].education) : ''}
        ${educationHtml}

      </div>

    </div>

    ${footerLine(accent)}

  </div>
  `;
}

/* =========================================================
   TEMPLATE 6 — Nathanial Dough (full-bleed red/navy split,
   circular icon section headings)
   ========================================================= */
function renderNathanialDoughSplit(cv, lang){
  const p = cv.personal;
  const accent = '#A52822';
  const dark = '#1F2935';
  const dir = tDir(lang);
  const align = alignStart(lang);

  const photoBlock = cv.photo
    ? `<img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:${dark};display:flex;align-items:center;justify-content:center;color:#fff;font-size:46px;font-weight:800;">${esc((p.fullName||'').charAt(0))}</div>`;

  const contactRows = [
    p.city ? {icon:'📍', text:p.city} : null,
    p.phone ? {icon:'📞', text:p.phone} : null,
    p.email ? {icon:'✉️', text:p.email} : null,
  ].filter(Boolean).map(c =>
    `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
       <span style="font-size:16px;">${c.icon}</span>
       <span style="color:#f2dedd;font-size:13px;">${esc(c.text)}</span>
     </div>`
  ).join('');

  const languagesHtml = (cv.languages||[]).map(l => `
    <div style="margin-bottom:14px;">
      <div style="color:#fff;font-size:13px;font-weight:700;margin-bottom:5px;">${esc(l.name)}</div>
      ${dotBar(l.rating, 5, '#ffffff', 'rgba(255,255,255,.28)')}
    </div>`
  ).join('');

  const educationHtml = (cv.education||[]).map(ed =>
    timelineItem(esc(ed.degree||''), esc(ed.school||''), esc(`${ed.start||''} – ${ed.end||''}`), accent, '#ffffff')
  ).join('');

  const experienceHtml = (cv.experience||[]).map(ex =>
    timelineItem(esc(ex.role||''), esc(ex.company||''), esc(`${ex.start||''} – ${ex.end||''}`), accent, '#ffffff')
  ).join('');

  const skillsHtml = (cv.skills||[]).map(s => `
    <div style="margin-bottom:16px;">
      <div style="color:#fff;font-size:14px;font-weight:700;margin-bottom:6px;">${esc(s.name)}</div>
      ${dotBar(s.rating, 5, accent, 'rgba(255,255,255,.15)')}
    </div>`
  ).join('');

  const sectionIconHeading = (icon, label) => `
    <div style="display:flex;align-items:center;gap:16px;margin:8px 0 22px;">
      <div style="width:46px;height:46px;border-radius:50%;border:3px solid ${accent};background:${dark};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${icon}</div>
      <div style="color:#fff;font-size:26px;font-weight:800;">${esc(label)}</div>
    </div>`;

  return `
  <div style="width:100%;font-family:Arial,Helvetica,sans-serif;direction:${dir};text-align:${align};display:flex;background:#fff;">

    <div style="width:41%;background:${accent};color:#fff;box-sizing:border-box;padding:0;">

      <div style="padding:34px 26px 20px;text-align:center;">
        <div style="width:170px;height:170px;border-radius:50%;overflow:hidden;border:5px solid ${dark};margin:0 auto 18px;background:${dark};">
          ${photoBlock}
        </div>
        <div style="color:#fff;font-size:22px;font-weight:800;">${esc(p.fullName||'')}</div>
        <div style="color:#e7c9c7;font-size:14px;margin-top:4px;">${esc(p.jobTitle||'')}</div>
      </div>

      <div style="height:14px;background:linear-gradient(${dir==='rtl'?'to left':'to right'}, rgba(0,0,0,.35), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,.35));"></div>

      ${p.summary ? `
      <div style="padding:22px 26px 26px;">
        <div style="color:#fff;font-size:22px;font-weight:800;margin-bottom:14px;">${LABELS[lang].summary}</div>
        <div style="color:#f0dcdb;font-size:13px;line-height:1.7;">${esc(p.summary)}</div>
      </div>` : ''}

      ${contactRows ? `
      <div style="padding:8px 26px 26px;">
        <div style="color:#fff;font-size:22px;font-weight:800;margin-bottom:14px;">${lang==='ar' ? 'التواصل' : 'Contact'}</div>
        ${contactRows}
      </div>` : ''}

      ${(cv.languages && cv.languages.length) ? `
      <div style="padding:8px 26px 30px;">
        <div style="color:#fff;font-size:22px;font-weight:800;margin-bottom:16px;">${LABELS[lang].languages}</div>
        ${languagesHtml}
      </div>` : ''}

    </div>

    <div style="width:1%;background:#fff;"></div>

    <div style="width:58%;background:${dark};color:#fff;box-sizing:border-box;padding:34px 30px;">

      ${(cv.education && cv.education.length) ? `
        ${sectionIconHeading('🎓', LABELS[lang].education)}
        <div style="margin-bottom:30px;">${educationHtml}</div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        ${sectionIconHeading('💼', LABELS[lang].experience)}
        <div style="margin-bottom:30px;">${experienceHtml}</div>
      ` : ''}

      ${(cv.skills && cv.skills.length) ? `
        ${sectionIconHeading('⚙️', LABELS[lang].skills)}
        <div>${skillsHtml}</div>
      ` : ''}

      ${footerLine('#ffffff')}

    </div>

  </div>
  `;
}

/* =========================================================
   TEMPLATE 7 — Gaber Naser (navy photo-block sidebar + timeline)
   ========================================================= */
function renderGaberNaserTimeline(cv, lang){
  const p = cv.personal;
  const accent = '#17375E';
  const accent2 = '#2E5D8A';
  const darkText = '#373737';
  const dir = tDir(lang);
  const align = alignStart(lang);

  const photoBlock = cv.photo
    ? `<img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />`
    : `<div style="width:100%;height:100%;border-radius:12px;background:#0f2542;display:flex;align-items:center;justify-content:center;color:#fff;font-size:44px;font-weight:800;">${esc((p.fullName||'').charAt(0))}</div>`;

  const contactRows = [
    p.city ? {icon:'📍', text:p.city} : null,
    p.phone ? {icon:'📞', text:p.phone} : null,
    p.email ? {icon:'✉️', text:p.email} : null,
  ].filter(Boolean).map(c =>
    `<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
       <span style="font-size:17px;">${c.icon}</span>
       <span style="color:#fff;font-size:15px;">${esc(c.text)}</span>
     </div>`
  ).join('');

  const sidebarHeading = (label) => `
    <div style="display:flex;align-items:center;gap:14px;margin:26px 0 18px;">
      <div style="color:#fff;font-size:24px;font-weight:800;white-space:nowrap;">${esc(label)}</div>
      <div style="flex:1;height:3px;background:#fff;"></div>
    </div>`;

  const abilitiesHtml = (cv.skills||[]).map(s => `
    <div style="margin-bottom:20px;">
      <div style="color:#fff;font-size:15px;margin-bottom:8px;">${esc(s.name)}</div>
      ${dotBar(s.rating, 5, '#ffffff', 'rgba(255,255,255,.3)')}
    </div>`
  ).join('');

  const languagesHtml = (cv.languages||[]).map(l => `
    <div style="margin-bottom:16px;">
      <div style="color:#fff;font-size:15px;margin-bottom:6px;">${esc(l.name)}</div>
      ${dotBar(l.rating, 5, '#ffffff', 'rgba(255,255,255,.3)')}
    </div>`
  ).join('');

  const mainHeading = (label) => `
    <div style="border-bottom:2px solid ${darkText};padding-bottom:14px;margin:0 0 20px;">
      <div style="color:${darkText};font-size:26px;font-weight:800;text-transform:uppercase;">${esc(label)}</div>
    </div>`;

  const educationHtml = (cv.education||[]).map(ed =>
    timelineItem(esc(ed.degree||''), esc(ed.school||''), esc(`${ed.start||''} – ${ed.end||''}`), '#555555', darkText)
  ).join('');

  const experienceHtml = (cv.experience||[]).map(ex =>
    timelineItem(esc(ex.role||''), `${esc(ex.company||'')}${ex.desc ? ' — '+esc(ex.desc) : ''}`, esc(`${ex.start||''} – ${ex.end||''}`), '#555555', darkText)
  ).join('');

  return `
  <div style="width:100%;font-family:Arial,Helvetica,sans-serif;direction:${dir};text-align:${align};display:flex;background:#fff;">

    <div style="width:31%;background:${accent};color:#fff;box-sizing:border-box;padding:24px 22px 40px;">

      <div style="width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;margin-bottom:26px;">
        ${photoBlock}
      </div>

      ${contactRows ? `
        ${sidebarHeading(lang==='ar' ? 'التواصل' : 'Contact')}
        ${contactRows}
      ` : ''}

      ${(cv.skills && cv.skills.length) ? `
        ${sidebarHeading(lang==='ar' ? 'القدرات' : 'Abilities')}
        ${abilitiesHtml}
      ` : ''}

      ${(cv.languages && cv.languages.length) ? `
        ${sidebarHeading(LABELS[lang].languages)}
        ${languagesHtml}
      ` : ''}

    </div>

    <div style="width:69%;background:#fff;color:${darkText};box-sizing:border-box;padding:34px 46px;">

      <div style="font-size:34px;font-weight:800;color:${darkText};text-transform:uppercase;">${esc(p.fullName||'')}</div>
      ${p.jobTitle ? `<div style="color:${accent2};font-size:17px;font-weight:700;margin-top:6px;">${esc(p.jobTitle)}</div>` : ''}
      <div style="border-bottom:2px solid ${darkText};margin:18px 0 26px;"></div>

      ${p.summary ? `
        ${mainHeading(LABELS[lang].summary)}
        <div style="font-size:15px;line-height:1.7;color:#333;margin-bottom:14px;">${esc(p.summary)}</div>
        <div style="border-bottom:2px solid ${darkText};margin:0 0 26px;"></div>
      ` : ''}

      ${(cv.education && cv.education.length) ? `
        ${mainHeading(LABELS[lang].education)}
        <div style="margin-bottom:14px;">${educationHtml}</div>
        <div style="border-bottom:2px solid ${darkText};margin:0 0 26px;"></div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        ${mainHeading(LABELS[lang].experience)}
        <div style="margin-bottom:14px;">${experienceHtml}</div>
      ` : ''}

      ${footerLine(accent)}

    </div>

  </div>
  `;
}

/* =========================================================
   TEMPLATE 8 — Louise Garnier (mauve elegant, arch photo header)
   ========================================================= */
function renderLouiseGarnierElegant(cv, lang){
  const p = cv.personal;
  const accent = '#978B95';
  const headerBg = '#E2DDE3';
  const darkText = '#1A1210';
  const dir = tDir(lang);
  const align = alignStart(lang);

  const photoBlock = cv.photo
    ? `<img src="${cv.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:44px;font-weight:700;">${esc((p.fullName||'').charAt(0))}</div>`;

  const contactRows = [
    p.email ? {icon:'✉️', text:p.email} : null,
    p.city ? {icon:'📍', text:p.city} : null,
    p.phone ? {icon:'📞', text:p.phone} : null,
  ].filter(Boolean).map(c =>
    `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
       <div style="width:26px;height:26px;border-radius:50%;background:${darkText};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">${c.icon}</div>
       <span style="color:${darkText};font-size:12px;">${esc(c.text)}</span>
     </div>`
  ).join('');

  const badge = (label) => `
    <div style="display:inline-block;background:${accent};color:#fff;font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:6px 14px;border-radius:3px;margin-bottom:14px;">${esc(label)}</div>`;

  const skillsHtml = (cv.skills||[]).map(s =>
    `<div style="color:${darkText};font-size:13px;margin-bottom:6px;">${esc(s.name)}</div>`
  ).join('');

  const languagesHtml = (cv.languages||[]).map(l => `
    <div style="margin-bottom:10px;">
      <div style="color:${darkText};font-size:13px;margin-bottom:4px;">${esc(l.name)}</div>
      ${dotBar(l.rating, 5, accent, '#e2dde3')}
    </div>`
  ).join('');

  const educationHtml = (cv.education||[]).map(ed => `
    <div style="margin-bottom:16px;">
      <div style="color:${darkText};font-size:13px;font-weight:700;">${esc(ed.degree||'')}</div>
      <div style="color:#555;font-size:12px;font-style:italic;">${esc(ed.school||'')}</div>
      <div style="color:#555;font-size:12px;">${esc(`${ed.start||''} - ${ed.end||''}`)}</div>
    </div>`
  ).join('');

  const experienceHtml = (cv.experience||[]).map(ex => `
    <div style="margin-bottom:22px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:14px;">
        <div style="color:${darkText};font-size:15px;font-weight:700;">${esc(ex.role||'')}</div>
        <div style="color:#555;font-size:13px;white-space:nowrap;">${esc(`${ex.start||''}-${ex.end||''}`)}</div>
      </div>
      <div style="color:#555;font-size:13px;font-style:italic;margin:2px 0 6px;">${esc(ex.company||'')}</div>
      ${ex.desc ? `<div style="color:#444;font-size:13px;line-height:1.6;">${esc(ex.desc)}</div>` : ''}
    </div>`
  ).join('');

  return `
  <div style="width:100%;font-family:Georgia,'Times New Roman',serif;direction:${dir};text-align:${align};background:#fff;">

    <div style="background:${headerBg};width:100%;display:flex;align-items:center;gap:36px;padding:34px 40px;box-sizing:border-box;">
      <div style="width:150px;height:150px;border-radius:50%;overflow:hidden;border:5px solid #fff;flex-shrink:0;background:#fff;">
        ${photoBlock}
      </div>
      <div>
        <div style="color:${darkText};font-size:38px;font-weight:700;letter-spacing:1px;">${esc(p.fullName||'')}</div>
        <div style="color:${darkText};font-family:Arial,Helvetica,sans-serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-top:8px;">${esc(p.jobTitle||'')}</div>
      </div>
    </div>

    <div style="display:flex;width:100%;font-family:Arial,Helvetica,sans-serif;">

      <div style="width:39%;background:#fff;padding:26px 24px;box-sizing:border-box;">

        ${contactRows}

        ${(cv.skills && cv.skills.length) ? `
        <div style="margin-top:20px;">
          ${badge(LABELS[lang].skills)}
          ${skillsHtml}
        </div>` : ''}

        ${(cv.languages && cv.languages.length) ? `
        <div style="margin-top:20px;">
          ${badge(LABELS[lang].languages)}
          ${languagesHtml}
        </div>` : ''}

        ${(cv.education && cv.education.length) ? `
        <div style="margin-top:20px;">
          ${badge(LABELS[lang].education)}
          ${educationHtml}
        </div>` : ''}

      </div>

      <div style="width:61%;background:#fff;padding:26px 30px;box-sizing:border-box;">

        ${p.summary ? `<div style="color:#444;font-size:13px;line-height:1.7;margin-bottom:22px;">${esc(p.summary)}</div>` : ''}

        ${(cv.experience && cv.experience.length) ? `
          ${badge(LABELS[lang].experience)}
          ${experienceHtml}
        ` : ''}

        ${footerLine(accent)}

      </div>

    </div>

  </div>
  `;
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
  { id:'marketing-clean', name:'التسويقي النظيف', category:'ats', categoryLabel:'متوافق مع أنظمة الفرز الآلي (ATS)',
    accent:'#111111', mockLayout:'plain', render:renderMarketingClean },
  { id:'jamal-banis-red-sidebar', name:'سيرة العمود الأحمر', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#C10004', mockLayout:'sidebar', render:renderJamalBanisSidebar },
  { id:'youssef-bahla-dark-sidebar', name:'سيرة العمود الداكن الأحمر', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#DA1A31', mockLayout:'sidebar', render:renderYoussefBahlaSidebar },
  { id:'nathanial-dough-split-red-navy', name:'سيرة عمودين أحمر وكحلي', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#A52822', mockLayout:'split', render:renderNathanialDoughSplit },
  { id:'gaber-naser-navy-timeline', name:'سيرة كحلي بخط زمني', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#17375E', mockLayout:'split', render:renderGaberNaserTimeline },
  { id:'louise-garnier-elegant-mauve', name:'سيرة أنيقة بنفسجية', category:'photo', categoryLabel:'مع صورة شخصية',
    accent:'#978B95', mockLayout:'split', render:renderLouiseGarnierElegant },
];
const CATEGORY_ORDER = [
  {key:'ats', label:'متوافق مع أنظمة الفرز الآلي (ATS)'},
  {key:'photo', label:'مع صورة شخصية'},
  {key:'creative', label:'تصميمي / إبداعي'}
];
function getTemplate(id){ return TEMPLATES.find(t=>t.id===id) || TEMPLATES[0]; }
