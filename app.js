/* =========================================================
   FolioFly — app.js
   All app behavior: CV storage, list screen, template picker,
   accordion editor, photo crop/compress, live preview + PDF.
   Template visuals themselves live in templates.js.
   ========================================================= */

const STORAGE_KEY = 'foliofly_cvs_v1';

function uid(){ return 'cv_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }

function loadCVs(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveCVs(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

function blankCV(name){
  return {
    id: uid(),
    name: name || 'سيرة ذاتية جديدة',
    updatedAt: Date.now(),
    templateId: null,
    language: 'ar', // 'ar' | 'en' — controls resume text direction + section labels
    photo: null,
    personal: { fullName:'', jobTitle:'', email:'', phone:'', city:'', summary:'' },
    experience: [],
    education: [],
    skills: [],
    languages: []
  };
}

let state = { screen:'list', currentId:null, openSection:'personal' };

const main = document.getElementById('main');
const backBtn = document.getElementById('backBtn');

function render(){
  if(state.screen === 'list') renderList();
  else if(state.screen === 'template') renderTemplatePicker();
  else renderEditor();
}

/* ---------------- LIST SCREEN ---------------- */
function renderList(){
  backBtn.style.display = 'none';
  const cvs = loadCVs().sort((a,b)=>b.updatedAt-a.updatedAt);
  let html = '';
  if(cvs.length === 0){
    html += `<div class="empty-state">
      <div class="big">📄</div>
      <div>لا توجد سير ذاتية بعد</div>
      <div style="font-size:12.5px; margin-top:4px;">اضغط "سيرة جديدة" بالأسفل للبدء</div>
    </div>`;
  } else {
    html += '<div class="cv-list">';
    cvs.forEach(cv=>{
      const d = new Date(cv.updatedAt);
      const dateStr = d.toLocaleDateString('ar-EG', {day:'numeric', month:'short'});
      html += `
        <div class="cv-card" data-id="${cv.id}">
          <div class="info">
            <div class="name">${escapeHtml(cv.name)}</div>
            <div class="meta">آخر تعديل: ${dateStr}</div>
          </div>
          <div class="actions">
            <button class="dup-btn" data-id="${cv.id}" title="نسخ">⧉</button>
            <button class="del-btn" data-id="${cv.id}" title="حذف">🗑</button>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  html += `<button class="fab" id="newCvBtn">+ سيرة جديدة</button>`;
  main.innerHTML = html;

  document.querySelectorAll('.cv-card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.actions')) return;
      openEditor(card.dataset.id);
    });
  });
  document.querySelectorAll('.dup-btn').forEach(btn=>btn.addEventListener('click', ()=>duplicateCV(btn.dataset.id)));
  document.querySelectorAll('.del-btn').forEach(btn=>btn.addEventListener('click', ()=>askDelete(btn.dataset.id)));
  document.getElementById('newCvBtn').addEventListener('click', ()=>{
    const name = prompt('اسم السيرة الذاتية:', 'سيرتي الذاتية');
    if(name === null) return;
    const cv = blankCV(name.trim() || 'سيرة بدون اسم');
    const list = loadCVs(); list.push(cv); saveCVs(list);
    state.currentId = cv.id; state.screen='template';
    render();
  });
}

function duplicateCV(id){
  const list = loadCVs();
  const orig = list.find(c=>c.id===id);
  if(!orig) return;
  const copy = JSON.parse(JSON.stringify(orig));
  copy.id = uid();
  copy.name = orig.name + ' (نسخة)';
  copy.updatedAt = Date.now();
  list.push(copy); saveCVs(list); renderList();
}

let pendingDeleteId = null;
function askDelete(id){
  pendingDeleteId = id;
  document.getElementById('confirmOverlay').classList.add('show');
}
document.getElementById('confirmCancel').addEventListener('click', ()=>{
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').classList.remove('show');
});
document.getElementById('confirmOk').addEventListener('click', ()=>{
  if(pendingDeleteId){
    const list = loadCVs().filter(c=>c.id!==pendingDeleteId);
    saveCVs(list);
  }
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').classList.remove('show');
  renderList();
});

/* ---------------- TEMPLATE PICKER SCREEN ---------------- */
function renderTemplatePicker(){
  backBtn.style.display='block';
  let html = `<div style="font-size:15px; font-weight:700; margin-bottom:4px;">اختر قالبًا</div>
    <div style="font-size:12.5px; color:var(--text-dim); margin-bottom:6px;">يمكنك تغييره لاحقًا في أي وقت</div>`;
  CATEGORY_ORDER.forEach(cat=>{
    const items = TEMPLATES.filter(t=>t.category===cat.key);
    if(!items.length) return;
    html += `<div class="category-label">${cat.label}</div><div class="tpl-grid">`;
    items.forEach(tpl=>{
      html += `<div class="tpl-card" data-tid="${tpl.id}">
        <div class="tpl-mock" style="display:flex;">${mockHtml(tpl)}</div>
        <div class="tpl-name">${tpl.name}</div>
      </div>`;
    });
    html += `</div>`;
  });
  main.innerHTML = html;
  document.getElementById('backBtn').onclick = ()=>{ state.screen='list'; render(); };
  document.querySelectorAll('.tpl-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      updateCurrentCV(c=>{ c.templateId = card.dataset.tid; });
      state.screen='editor'; state.openSection='personal';
      render();
    });
  });
}

/* ---------------- EDITOR SCREEN ---------------- */
function openEditor(id){
  state.screen='editor'; state.currentId=id; state.openSection='personal';
  render();
}
function getCurrentCV(){ return loadCVs().find(c=>c.id===state.currentId); }
function updateCurrentCV(mutator){
  const list = loadCVs();
  const idx = list.findIndex(c=>c.id===state.currentId);
  if(idx===-1) return;
  mutator(list[idx]);
  list[idx].updatedAt = Date.now();
  saveCVs(list);
}

const SECTIONS = [
  {key:'personal', title:'المعلومات الشخصية'},
  {key:'experience', title:'الخبرات العملية'},
  {key:'education', title:'التعليم'},
  {key:'skills', title:'المهارات'},
  {key:'languages', title:'اللغات'}
];

function sectionFilled(cv, key){
  if(key==='personal') return !!(cv.personal.fullName && cv.personal.jobTitle);
  if(key==='experience') return cv.experience.length>0;
  if(key==='education') return cv.education.length>0;
  if(key==='skills') return cv.skills.length>0;
  if(key==='languages') return (cv.languages||[]).length>0;
  return false;
}

function renderEditor(){
  backBtn.style.display='block';
  const cv = getCurrentCV();
  if(!cv){ state.screen='list'; return render(); }
  if(!cv.languages) cv.languages = []; // migrate CVs created before this field existed

  const tpl = getTemplate(cv.templateId);
  const lang = cv.language || 'ar';
  const filledCount = SECTIONS.filter(s=>sectionFilled(cv,s.key)).length;
  const pct = Math.round((filledCount/SECTIONS.length)*100);

  let html = `
    <div class="tpl-current-row">
      <div><div class="lbl">القالب الحالي</div><div class="val">${tpl.name}</div></div>
      <button id="changeTplBtn">تغيير القالب</button>
    </div>
    <div class="tpl-current-row">
      <div><div class="lbl">لغة السيرة الذاتية</div><div class="val">${lang==='en'?'English':'العربية'}</div></div>
      <div style="display:flex; gap:6px;">
        <button class="lang-opt" data-lang="ar" style="${lang==='ar'?'background:var(--accent-dim); border-color:var(--accent); color:var(--text);':''}">عربي</button>
        <button class="lang-opt" data-lang="en" style="${lang==='en'?'background:var(--accent-dim); border-color:var(--accent); color:var(--text);':''}">English</button>
      </div>
    </div>
    <div class="progress-wrap">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-label">${escapeHtml(cv.name)} — اكتمال ${pct}%</div>
    </div>
  `;

  SECTIONS.forEach(sec=>{
    const isOpen = state.openSection===sec.key;
    html += `
      <div class="accordion-item ${isOpen?'open':''}" data-sec="${sec.key}">
        <div class="accordion-head" data-toggle="${sec.key}">
          <div class="title">
            <span class="done-dot ${sectionFilled(cv,sec.key)?'filled':''}"></span>
            ${sec.title}
          </div>
          <span class="chev">⌄</span>
        </div>
        <div class="accordion-body">${renderSectionBody(cv, sec.key)}</div>
      </div>
    `;
  });

  html += `
    <div class="bottom-bar" style="position:fixed;">
      <button class="btn-preview" id="previewBtn">معاينة</button>
      <button class="btn-pdf" id="pdfBtn">تحميل PDF</button>
    </div>
  `;

  main.innerHTML = html;
  wireEditorEvents(cv);
}

function renderSectionBody(cv, key){
  if(key==='personal'){
    const p = cv.personal;
    return `
      <div class="field photo-box">
        <div class="photo-preview" id="photoPreview">${cv.photo? `<img src="${cv.photo}">` : 'صورة'}</div>
        <div class="photo-btns">
          <button id="uploadPhotoBtn" type="button">اختيار صورة</button>
          ${cv.photo? '<button id="removePhotoBtn" type="button">إزالة</button>':''}
          <input type="file" id="photoInput" accept="image/*" style="display:none;">
        </div>
      </div>
      <div class="field"><label>الاسم الكامل</label><input id="f_fullName" value="${attr(p.fullName)}"></div>
      <div class="field"><label>المسمى الوظيفي</label><input id="f_jobTitle" value="${attr(p.jobTitle)}"></div>
      <div class="row2">
        <div class="field"><label>البريد الإلكتروني</label><input id="f_email" value="${attr(p.email)}"></div>
        <div class="field"><label>رقم الهاتف</label><input id="f_phone" value="${attr(p.phone)}"></div>
      </div>
      <div class="field"><label>المدينة</label><input id="f_city" value="${attr(p.city)}"></div>
      <div class="field"><label>نبذة مختصرة</label><textarea id="f_summary">${p.summary||''}</textarea></div>
    `;
  }
  if(key==='experience'){
    let html = cv.experience.map(item=>`
      <div class="repeatable-item" data-id="${item.id}">
        <div class="field"><label>المسمى الوظيفي</label><input class="exp-role" data-id="${item.id}" value="${attr(item.role)}"></div>
        <div class="field"><label>جهة العمل</label><input class="exp-company" data-id="${item.id}" value="${attr(item.company)}"></div>
        <div class="row2">
          <div class="field"><label>من</label><input class="exp-start" data-id="${item.id}" value="${attr(item.start)}" placeholder="2023"></div>
          <div class="field"><label>إلى</label><input class="exp-end" data-id="${item.id}" value="${attr(item.end)}" placeholder="حتى الآن"></div>
        </div>
        <div class="field"><label>الوصف</label><textarea class="exp-desc" data-id="${item.id}">${item.desc||''}</textarea></div>
        <div class="rm-row"><button class="rm-btn exp-rm" data-id="${item.id}">حذف هذه الخبرة</button></div>
      </div>
    `).join('');
    html += `<button class="add-btn" id="addExpBtn">+ إضافة خبرة</button>`;
    return html;
  }
  if(key==='education'){
    let html = cv.education.map(item=>`
      <div class="repeatable-item" data-id="${item.id}">
        <div class="field"><label>الدرجة العلمية / الشهادة</label><input class="edu-degree" data-id="${item.id}" value="${attr(item.degree)}"></div>
        <div class="field"><label>الجهة التعليمية</label><input class="edu-school" data-id="${item.id}" value="${attr(item.school)}"></div>
        <div class="row2">
          <div class="field"><label>من</label><input class="edu-start" data-id="${item.id}" value="${attr(item.start)}"></div>
          <div class="field"><label>إلى</label><input class="edu-end" data-id="${item.id}" value="${attr(item.end)}"></div>
        </div>
        <div class="rm-row"><button class="rm-btn edu-rm" data-id="${item.id}">حذف</button></div>
      </div>
    `).join('');
    html += `<button class="add-btn" id="addEduBtn">+ إضافة مؤهل</button>`;
    return html;
  }
  if(key==='skills'){
    let html = cv.skills.map(item=>`
      <div class="repeatable-item" data-id="${item.id}" style="display:flex; align-items:center; gap:8px;">
        <input class="skill-name" data-id="${item.id}" value="${attr(item.name)}" style="flex:1; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text); padding:9px 10px;">
        <button class="rm-btn skill-rm" data-id="${item.id}">حذف</button>
      </div>
    `).join('');
    html += `<button class="add-btn" id="addSkillBtn">+ إضافة مهارة</button>`;
    return html;
  }
  if(key==='languages'){
    let html = `<div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">مثال: العربية (اللغة الأم)، الإنجليزية (جيد)</div>`;
    html += cv.languages.map(item=>`
      <div class="repeatable-item" data-id="${item.id}" style="display:flex; align-items:center; gap:8px;">
        <input class="lang-name" data-id="${item.id}" value="${attr(item.name)}" style="flex:1; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text); padding:9px 10px;">
        <button class="rm-btn lang-rm" data-id="${item.id}">حذف</button>
      </div>
    `).join('');
    html += `<button class="add-btn" id="addLangBtn">+ إضافة لغة</button>`;
    return html;
  }
  return '';
}

function wireEditorEvents(cv){
  document.getElementById('backBtn').onclick = ()=>{ state.screen='list'; render(); };
  document.getElementById('changeTplBtn').addEventListener('click', ()=>{ state.screen='template'; render(); });
  document.querySelectorAll('.lang-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      updateCurrentCV(c=>{ c.language = btn.dataset.lang; });
      renderEditor();
    });
  });

  document.querySelectorAll('[data-toggle]').forEach(head=>{
    head.addEventListener('click', ()=>{
      const key = head.dataset.toggle;
      state.openSection = state.openSection===key ? null : key;
      renderEditor();
    });
  });

  const bind = (id, path)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', ()=>{ updateCurrentCV(c=>{ c.personal[path] = el.value; }); });
  };
  bind('f_fullName','fullName'); bind('f_jobTitle','jobTitle'); bind('f_email','email');
  bind('f_phone','phone'); bind('f_city','city'); bind('f_summary','summary');

  const uploadBtn = document.getElementById('uploadPhotoBtn');
  if(uploadBtn){
    uploadBtn.addEventListener('click', ()=>document.getElementById('photoInput').click());
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
  }
  const removeBtn = document.getElementById('removePhotoBtn');
  if(removeBtn) removeBtn.addEventListener('click', ()=>{ updateCurrentCV(c=>{ c.photo=null; }); renderEditor(); });

  const addExp = document.getElementById('addExpBtn');
  if(addExp) addExp.addEventListener('click', ()=>{
    updateCurrentCV(c=>c.experience.push({id:uid(), role:'', company:'', start:'', end:'', desc:''}));
    renderEditor();
  });
  bindRepeatable('exp-role','experience','role');
  bindRepeatable('exp-company','experience','company');
  bindRepeatable('exp-start','experience','start');
  bindRepeatable('exp-end','experience','end');
  bindRepeatable('exp-desc','experience','desc');
  document.querySelectorAll('.exp-rm').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c.experience = c.experience.filter(i=>i.id!==b.dataset.id); });
    renderEditor();
  }));

  const addEdu = document.getElementById('addEduBtn');
  if(addEdu) addEdu.addEventListener('click', ()=>{
    updateCurrentCV(c=>c.education.push({id:uid(), degree:'', school:'', start:'', end:''}));
    renderEditor();
  });
  bindRepeatable('edu-degree','education','degree');
  bindRepeatable('edu-school','education','school');
  bindRepeatable('edu-start','education','start');
  bindRepeatable('edu-end','education','end');
  document.querySelectorAll('.edu-rm').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c.education = c.education.filter(i=>i.id!==b.dataset.id); });
    renderEditor();
  }));

  const addSkill = document.getElementById('addSkillBtn');
  if(addSkill) addSkill.addEventListener('click', ()=>{
    updateCurrentCV(c=>c.skills.push({id:uid(), name:''}));
    renderEditor();
  });
  bindRepeatable('skill-name','skills','name');
  document.querySelectorAll('.skill-rm').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c.skills = c.skills.filter(i=>i.id!==b.dataset.id); });
    renderEditor();
  }));

  const addLang = document.getElementById('addLangBtn');
  if(addLang) addLang.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ if(!c.languages) c.languages=[]; c.languages.push({id:uid(), name:''}); });
    renderEditor();
  });
  bindRepeatable('lang-name','languages','name');
  document.querySelectorAll('.lang-rm').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c.languages = c.languages.filter(i=>i.id!==b.dataset.id); });
    renderEditor();
  }));

  document.getElementById('previewBtn').addEventListener('click', openPreview);
  document.getElementById('pdfBtn').addEventListener('click', openPreview);
}

function bindRepeatable(cls, arrKey, field){
  document.querySelectorAll('.'+cls).forEach(el=>{
    el.addEventListener('input', ()=>{
      updateCurrentCV(c=>{
        const item = c[arrKey].find(i=>i.id===el.dataset.id);
        if(item) item[field] = el.value;
      });
    });
  });
}

function handlePhotoUpload(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const img = new Image();
    img.onload = ()=>{
      const size = Math.min(img.width, img.height);
      const sx = (img.width-size)/2, sy=(img.height-size)/2;
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      updateCurrentCV(c=>{ c.photo = dataUrl; });
      renderEditor();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ---------------- PREVIEW / PDF ---------------- */
function openPreview(){
  const cv = getCurrentCV();
  const tpl = getTemplate(cv.templateId);
  const lang = cv.language || 'ar';
  const paper = document.getElementById('resume-paper');
  paper.className = '';
  paper.removeAttribute('style');
  paper.innerHTML = tpl.render(cv, lang);
  document.getElementById('previewOverlay').classList.add('show');
}
document.getElementById('closePreview').addEventListener('click', ()=>{
  document.getElementById('previewOverlay').classList.remove('show');
});

document.getElementById('exportPdfBtn').addEventListener('click', async ()=>{
  const node = document.getElementById('resume-paper');
  const canvas = await html2canvas(node, {scale:2, backgroundColor:'#ffffff'});
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','mm','a4');
  const pageWidth = 210, pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  let heightLeft = imgHeight, position = 0;
  pdf.addImage(imgData,'JPEG',0,position,imgWidth,imgHeight);
  heightLeft -= pageHeight;
  while(heightLeft > 0){
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData,'JPEG',0,position,imgWidth,imgHeight);
    heightLeft -= pageHeight;
  }
  const cv = getCurrentCV();
  pdf.save((cv.name || 'CV') + '.pdf');
});

/* ---------------- utils ---------------- */
function escapeHtml(str){
  return (str||'').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function attr(str){ return escapeHtml(str); }

render();
