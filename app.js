/* =========================================================
   FolioFly — app.js
   Sequential data-entry UX: a per-CV "home" dashboard (like a
   dashboard of section cards) instead of one long accordion.
   Each section (personal / experience / education / skills /
   languages) is its own full screen, entered one at a time.
   Template visuals live in templates.js.
   ========================================================= */

const STORAGE_KEY = 'foliofly_cvs_v3';

/* ---------------- toast (system-status feedback) ---------------- */
function showToast(msg){
  let t = document.getElementById('flyToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'flyToast';
    t.style.cssText = 'position:fixed; bottom:88px; left:50%; transform:translateX(-50%) translateY(10px); background:#1e222b; color:#eceef2; border:1px solid #2a2f3a; padding:10px 18px; border-radius:999px; font-size:13px; z-index:100; opacity:0; transition:opacity .25s ease, transform .25s ease; max-width:82%; text-align:center; pointer-events:none; box-shadow:0 6px 20px rgba(0,0,0,.35);';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(10px)'; }, 1500);
}

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
    language: 'ar',
    photo: null,
    personal: { fullName:'', jobTitle:'', email:'', phone:'', city:'', summary:'' },
    experience: [],
    education: [],
    skills: [],
    languages: []
  };
}

// section metadata used by the generic list/rated screens
const SECTION_META = {
  experience: { title:'الخبرات العملية', icon:'💼', addLabel:'إضافة خبرة',
    fields:[
      {key:'role', label:'المسمى الوظيفي'},
      {key:'company', label:'جهة العمل'},
      {key:'start', label:'من', half:true, placeholder:'2023'},
      {key:'end', label:'إلى', half:true, placeholder:'حتى الآن'},
      {key:'desc', label:'الوصف', multiline:true}
    ],
    titleField:'role', subField:'company' },
  education: { title:'الشهادات والتعليم', icon:'🎓', addLabel:'إضافة شهادة',
    fields:[
      {key:'degree', label:'الدرجة العلمية / الشهادة'},
      {key:'school', label:'الجامعة أو المعهد'},
      {key:'start', label:'من', half:true},
      {key:'end', label:'إلى', half:true}
    ],
    titleField:'degree', subField:'school' }
};
const RATED_META = {
  skills: { title:'المهارات', icon:'🧠', placeholder:'اكتب اسم مهارة (مثال: Excel)' },
  languages: { title:'اللغات', icon:'🌐', placeholder:'اكتب اسم لغة (مثال: الإنجليزية)' }
};

let state = { screen:'list', currentId:null, sectionKey:null, editingItemId:null };

const main = document.getElementById('main');
const backBtn = document.getElementById('backBtn');

function render(){
  if(state.screen === 'list') renderList();
  else if(state.screen === 'template') renderTemplatePicker();
  else if(state.screen === 'home') renderHome();
  else if(state.screen === 'personal') renderPersonalScreen();
  else if(state.screen === 'item-list') renderItemListScreen();
  else if(state.screen === 'item-form') renderItemFormScreen();
  else if(state.screen === 'rated-list') renderRatedListScreen();
}

/* ---------------- LIST SCREEN (all CVs) ---------------- */
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
      state.currentId = card.dataset.id; state.screen='home';
      render();
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

/* ---------------- TEMPLATE PICKER ---------------- */
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
      state.screen='home';
      render();
    });
  });
}

/* ---------------- shared helpers ---------------- */
function getCurrentCV(){
  const cv = loadCVs().find(c=>c.id===state.currentId);
  if(cv && !cv.languages) cv.languages = [];
  return cv;
}
function updateCurrentCV(mutator){
  const list = loadCVs();
  const idx = list.findIndex(c=>c.id===state.currentId);
  if(idx===-1) return;
  mutator(list[idx]);
  list[idx].updatedAt = Date.now();
  saveCVs(list);
}
function goHome(){ state.screen='home'; state.sectionKey=null; state.editingItemId=null; render(); }

function sectionFilled(cv, key){
  if(key==='personal') return !!(cv.personal.fullName && cv.personal.jobTitle);
  if(key==='experience') return cv.experience.length>0;
  if(key==='education') return cv.education.length>0;
  if(key==='skills') return cv.skills.length>0;
  if(key==='languages') return (cv.languages||[]).length>0;
  return false;
}
function overallPct(cv){
  const keys = ['personal','experience','education','skills','languages'];
  const filled = keys.filter(k=>sectionFilled(cv,k)).length;
  return Math.round((filled/keys.length)*100);
}
function ringSvg(pct){
  const r = 40, c = 2*Math.PI*r;
  const offset = c * (1 - pct/100);
  return `<div class="ring-wrap">
    <svg width="96" height="96" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r="${r}" stroke="var(--bg-elev2)" stroke-width="8" fill="none"/>
      <circle cx="45" cy="45" r="${r}" stroke="var(--accent)" stroke-width="8" fill="none"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 45 45)"/>
    </svg>
    <div class="ring-label">${pct}%</div>
  </div>`;
}

/* ---------------- HOME (per-CV dashboard) ---------------- */
function renderHome(){
  backBtn.style.display='block';
  const cv = getCurrentCV();
  if(!cv){ state.screen='list'; return render(); }
  const tpl = getTemplate(cv.templateId);
  const lang = cv.language || 'ar';
  const pct = overallPct(cv);

  let html = ringSvg(pct);
  html += `<div style="text-align:center; font-size:12.5px; color:var(--text-dim); margin-bottom:18px;">${escapeHtml(cv.name)}</div>`;

  html += `<div class="home-header" id="personalRow">
    <div class="avatar">${cv.photo?`<img src="${cv.photo}">`:'صورة'}</div>
    <div style="flex:1;">
      <div class="name">${escapeHtml(cv.personal.fullName || 'أضف اسمك')}</div>
      <div class="sub">${escapeHtml(cv.personal.jobTitle || 'المعلومات الشخصية')}</div>
    </div>
    <div class="chev">›</div>
  </div>`;

  const rows = [
    {key:'education', label:SECTION_META.education.title, icon:SECTION_META.education.icon, count:cv.education.length},
    {key:'experience', label:SECTION_META.experience.title, icon:SECTION_META.experience.icon, count:cv.experience.length},
    {key:'languages', label:RATED_META.languages.title, icon:RATED_META.languages.icon, count:(cv.languages||[]).length},
    {key:'skills', label:RATED_META.skills.title, icon:RATED_META.skills.icon, count:cv.skills.length},
  ];
  rows.forEach(r=>{
    html += `<div class="nav-row" data-nav="${r.key}">
      <div class="nav-row-icon">${r.icon}</div>
      <div class="nav-row-text">
        <div class="nav-row-title">${r.label}</div>
        <div class="nav-row-sub">${r.count>0? r.count+' مُضاف':'لم تتم الإضافة بعد'}</div>
      </div>
      <div class="nav-row-dot ${r.count>0?'filled':''}"></div>
      <div class="chev">›</div>
    </div>`;
  });

  html += `<div class="tpl-current-row" style="margin-top:16px;">
      <div><div class="lbl">القالب الحالي</div><div class="val">${tpl.name}</div></div>
      <button id="changeTplBtn">تغيير القالب</button>
    </div>
    <div class="tpl-current-row">
      <div><div class="lbl">لغة السيرة الذاتية</div><div class="val">${lang==='en'?'English':'العربية'}</div></div>
      <div style="display:flex; gap:6px;">
        <button class="lang-opt" data-lang="ar" style="${lang==='ar'?'background:var(--accent-dim); border-color:var(--accent); color:var(--text);':''}">عربي</button>
        <button class="lang-opt" data-lang="en" style="${lang==='en'?'background:var(--accent-dim); border-color:var(--accent); color:var(--text);':''}">English</button>
      </div>
    </div>`;

  html += `<div class="bottom-bar" style="position:fixed;">
      <button class="btn-preview" id="previewBtn">معاينة</button>
      <button class="btn-pdf" id="pdfBtn">تحميل PDF</button>
    </div>`;

  main.innerHTML = html;

  backBtn.onclick = ()=>{ state.screen='list'; render(); };
  document.getElementById('personalRow').addEventListener('click', ()=>{ state.screen='personal'; render(); });
  document.querySelectorAll('.nav-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const key = row.dataset.nav;
      if(SECTION_META[key]){ state.screen='item-list'; state.sectionKey=key; }
      else { state.screen='rated-list'; state.sectionKey=key; }
      render();
    });
  });
  document.getElementById('changeTplBtn').addEventListener('click', ()=>{ state.screen='template'; render(); });
  document.querySelectorAll('.lang-opt').forEach(btn=>{
    btn.addEventListener('click', ()=>{ updateCurrentCV(c=>{ c.language = btn.dataset.lang; }); renderHome(); });
  });
  document.getElementById('previewBtn').addEventListener('click', openPreview);
  document.getElementById('pdfBtn').addEventListener('click', openPreview);
}

/* ---------------- PERSONAL INFO (own screen) ---------------- */
function renderPersonalScreen(){
  backBtn.style.display='block';
  backBtn.onclick = goHome;
  const cv = getCurrentCV();
  const p = cv.personal;
  main.innerHTML = `
    <div style="font-size:16px; font-weight:700; margin-bottom:4px;">👤 المعلومات الشخصية</div>
    <div class="section-intro">هذه المعلومات هي ما ستظهر أولًا للشركات في سيرتك الذاتية.</div>
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
    <div class="bottom-bar" style="position:fixed;">
      <button class="btn-pdf" id="doneBtn" style="width:100%;">تم</button>
    </div>
  `;
  const bind = (id, path)=>{
    document.getElementById(id).addEventListener('input', (e)=>{
      updateCurrentCV(c=>{ c.personal[path] = e.target.value; });
    });
  };
  bind('f_fullName','fullName'); bind('f_jobTitle','jobTitle'); bind('f_email','email');
  bind('f_phone','phone'); bind('f_city','city'); bind('f_summary','summary');

  document.getElementById('uploadPhotoBtn').addEventListener('click', ()=>document.getElementById('photoInput').click());
  document.getElementById('photoInput').addEventListener('change', (e)=>handlePhotoUpload(e, renderPersonalScreen));
  const removeBtn = document.getElementById('removePhotoBtn');
  if(removeBtn) removeBtn.addEventListener('click', ()=>{ updateCurrentCV(c=>{ c.photo=null; }); renderPersonalScreen(); });
  document.getElementById('doneBtn').addEventListener('click', goHome);
}

function handlePhotoUpload(e, onDone){
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
      onDone();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

/* ---------------- ITEM-LIST screens (experience / education) ---------------- */
function renderItemListScreen(){
  backBtn.style.display='block';
  backBtn.onclick = goHome;
  const cv = getCurrentCV();
  const key = state.sectionKey;
  const meta = SECTION_META[key];
  const items = cv[key];

  let html = `<div style="font-size:16px; font-weight:700; margin-bottom:4px;">${meta.icon} ${meta.title}</div>
    <div class="section-intro">إضافة كل ${meta.title} يساعد الشركات على معرفة المزيد عنك ويزيد فرصك.</div>`;

  if(items.length===0){
    html += `<div class="empty-state" style="padding:30px 10px;">
      <div class="big">${meta.icon}</div><div>لا يوجد شيء مضاف بعد</div>
    </div>`;
  } else {
    items.forEach(item=>{
      html += `<div class="item-card" data-id="${item.id}">
        <div class="item-title">${escapeHtml(item[meta.titleField]) || '—'}</div>
        <div class="item-sub">${escapeHtml(item[meta.subField]) || ''}</div>
        <div class="item-dates">${escapeHtml(item.start||'')} — ${escapeHtml(item.end||'')}</div>
        <div class="item-actions">
          <button class="edit-item" data-id="${item.id}">✎ تعديل</button>
          <button class="danger rm-item" data-id="${item.id}">🗑 حذف</button>
        </div>
      </div>`;
    });
  }
  html += `<div style="height:70px;"></div>
    <button class="sticky-add-btn" id="addItemBtn">+ ${meta.addLabel}</button>`;
  main.innerHTML = html;

  document.getElementById('addItemBtn').addEventListener('click', ()=>{
    state.screen='item-form'; state.editingItemId=null; render();
  });
  document.querySelectorAll('.edit-item').forEach(b=>b.addEventListener('click', ()=>{
    state.screen='item-form'; state.editingItemId=b.dataset.id; render();
  }));
  document.querySelectorAll('.rm-item').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c[key] = c[key].filter(i=>i.id!==b.dataset.id); });
    showToast('تم الحذف');
    renderItemListScreen();
  }));
}

/* ---------------- ITEM-FORM screen (one experience/education entry) ---------------- */
function renderItemFormScreen(){
  backBtn.style.display='block';
  const key = state.sectionKey;
  const meta = SECTION_META[key];
  const cv = getCurrentCV();
  const isNew = !state.editingItemId;

  // Autosave means "new" items must exist immediately so every keystroke has
  // somewhere to land — create the record up front, then edit it in place.
  if(isNew){
    const blank = { id: uid() };
    meta.fields.forEach(f=>{ blank[f.key]=''; });
    updateCurrentCV(c=>{ c[key].push(blank); });
    state.editingItemId = blank.id;
  }
  const item = getCurrentCV()[key].find(i=>i.id===state.editingItemId);

  backBtn.onclick = ()=>{ state.screen='item-list'; state.editingItemId=null; render(); };

  let html = `<div style="font-size:16px; font-weight:700; margin-bottom:14px;">${isNew?'إضافة':'تعديل'} — ${meta.title}</div>`;
  let i = 0;
  while(i < meta.fields.length){
    const f = meta.fields[i];
    const val = item[f.key] || '';
    if(f.half && meta.fields[i+1] && meta.fields[i+1].half){
      const f2 = meta.fields[i+1];
      const val2 = item[f2.key] || '';
      html += `<div class="row2">
        <div class="field"><label>${f.label}</label><input id="itf_${f.key}" value="${attr(val)}" ${f.placeholder?`placeholder="${f.placeholder}"`:''}></div>
        <div class="field"><label>${f2.label}</label><input id="itf_${f2.key}" value="${attr(val2)}" ${f2.placeholder?`placeholder="${f2.placeholder}"`:''}></div>
      </div>`;
      i += 2;
    } else {
      const inputTag = f.multiline
        ? `<textarea id="itf_${f.key}">${val}</textarea>`
        : `<input id="itf_${f.key}" value="${attr(val)}" ${f.placeholder?`placeholder="${f.placeholder}"`:''}>`;
      html += `<div class="field"><label>${f.label}</label>${inputTag}</div>`;
      i += 1;
    }
  }

  html += `<div class="bottom-bar" style="position:fixed;">
    <button class="btn-preview" id="deleteItemBtn" style="color:var(--danger); flex:0 0 90px;">حذف</button>
    <button class="btn-pdf" id="doneItemBtn" style="width:100%;">تم</button>
  </div>`;
  main.innerHTML = html;

  meta.fields.forEach(f=>{
    document.getElementById('itf_'+f.key).addEventListener('input', (e)=>{
      updateCurrentCV(c=>{
        const it = c[key].find(x=>x.id===state.editingItemId);
        if(it) it[f.key] = e.target.value;
      });
    });
  });
  document.getElementById('doneItemBtn').addEventListener('click', ()=>{
    // Drop the entry silently if the user added it but left every field empty.
    const cur = getCurrentCV()[key].find(x=>x.id===state.editingItemId);
    const isEmpty = cur && meta.fields.every(f=>!cur[f.key]);
    if(isEmpty) updateCurrentCV(c=>{ c[key] = c[key].filter(x=>x.id!==state.editingItemId); });
    else showToast('تم الحفظ');
    state.screen='item-list'; state.editingItemId=null; render();
  });
  document.getElementById('deleteItemBtn').addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c[key] = c[key].filter(x=>x.id!==state.editingItemId); });
    showToast('تم الحذف');
    state.screen='item-list'; state.editingItemId=null; render();
  });
}

/* ---------------- RATED-LIST screens (skills / languages) ---------------- */
function renderRatedListScreen(){
  backBtn.style.display='block';
  backBtn.onclick = goHome;
  const cv = getCurrentCV();
  const key = state.sectionKey;
  const meta = RATED_META[key];
  if(!cv[key]) cv[key] = [];
  const items = cv[key];

  let html = `<div style="font-size:16px; font-weight:700; margin-bottom:4px;">${meta.icon} ${meta.title}</div>
    <div class="section-intro">أضف ${meta.title} وحدد مستوى إتقانك لكل واحدة بالنجوم.</div>
    <div class="add-row">
      <input id="newItemInput" placeholder="${meta.placeholder}">
      <button id="addItemBtn">إضافة +</button>
    </div>`;

  if(items.length===0){
    html += `<div class="empty-state" style="padding:20px 10px;"><div>لا يوجد شيء مضاف بعد</div></div>`;
  } else {
    items.forEach(it=>{
      html += `<div class="rated-item" data-id="${it.id}">
        <div class="rated-name">${escapeHtml(it.name)}</div>
        <div class="star-rating" data-id="${it.id}">
          ${[1,2,3,4,5].map(n=>`<span class="star ${n<=(it.rating||0)?'filled':''}" data-n="${n}">★</span>`).join('')}
        </div>
        <button class="rated-rm" data-id="${it.id}">✕</button>
      </div>`;
    });
  }
  html += `<div style="height:20px;"></div>`;
  main.innerHTML = html;

  document.getElementById('addItemBtn').addEventListener('click', ()=>{
    const input = document.getElementById('newItemInput');
    const val = input.value.trim();
    if(!val) return;
    updateCurrentCV(c=>{ if(!c[key]) c[key]=[]; c[key].push({id:uid(), name:val, rating:4}); });
    showToast('تمت الإضافة');
    renderRatedListScreen();
  });
  document.getElementById('newItemInput').addEventListener('keydown', (e)=>{
    if(e.key==='Enter') document.getElementById('addItemBtn').click();
  });
  document.querySelectorAll('.star-rating').forEach(group=>{
    group.querySelectorAll('.star').forEach(star=>{
      star.addEventListener('click', ()=>{
        const id = group.dataset.id, n = parseInt(star.dataset.n,10);
        updateCurrentCV(c=>{ const it = c[key].find(i=>i.id===id); if(it) it.rating = n; });
        renderRatedListScreen();
      });
    });
  });
  document.querySelectorAll('.rated-rm').forEach(b=>b.addEventListener('click', ()=>{
    updateCurrentCV(c=>{ c[key] = c[key].filter(i=>i.id!==b.dataset.id); });
    showToast('تم الحذف');
    renderRatedListScreen();
  }));
}

/* ---------------- PREVIEW / PDF ---------------- */
function openPreview(){
  const cv = getCurrentCV();
  if(!cv.personal.fullName || !cv.personal.jobTitle){
    showToast('أكمل الاسم والمسمى الوظيفي أولًا');
    state.screen='personal'; render();
    return;
  }
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
