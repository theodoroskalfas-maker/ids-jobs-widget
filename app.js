/* =============================================================================
   IDS Media – Jobs Widget  |  app.js  v9
   - Tabs per job card (Overzicht / Tijdslijn)
   - Only Status + Adresgegevens editable
   - Status options fetched dynamically via META API
   - Everything else read-only
   ============================================================================= */

const TAG_CLASSES = ['tag-blue','tag-green','tag-amber','tag-purple','tag-pink'];

const S = {
  recordId:   null,
  jobs:       [],
  statusOpts: ['Open','Ingepland','In Progress','Afgerond','Goedgekeurd','Afgekeurd','Missing Data'], // fallback
};

// ── SDK INIT ──────────────────────────────────────────────────────────────────
ZOHO.embeddedApp.on('PageLoad', function(data) {
  S.recordId = data.EntityId;
  show('topbar'); show('main-content'); show('savebar');
  init();
});
ZOHO.embeddedApp.init();

// ── INIT: fetch Status options + Jobs in parallel ─────────────────────────────
async function init() {
  showLoading(true);
  try {
    // Fetch Status picklist options dynamically
    const metaResp = await ZOHO.CRM.META.getFields({ Entity: 'Locatiebezoeken' });
    const fields   = metaResp.fields || [];
    const statusF  = fields.find(f => f.api_name === 'Status');
    if (statusF?.pick_list_values?.length) {
      S.statusOpts = statusF.pick_list_values.map(v => v.display_value || v.actual_value);
    }
  } catch(e) {
    console.warn('Could not fetch Status options, using fallback:', e);
  }
  await loadJobs();
}

// ── LOAD JOBS ─────────────────────────────────────────────────────────────────
async function loadJobs() {
  showLoading(true);
  try {
    const relResp = await ZOHO.CRM.API.getRecord({ Entity: 'Accounts', RecordID: S.recordId });
    const rel     = relResp.data?.[0] || {};
    const locName = rel.Account_Name || rel.Name || '—';
    document.getElementById('tb-name').textContent = locName;
    document.getElementById('tb-fwc').textContent  = 'All Field Work Cycles';

    const jobsResp = await ZOHO.CRM.API.getRelatedRecords({
      Entity: 'Accounts', RecordID: S.recordId,
      RelatedList: 'Locatiebezoeken', page: 1, per_page: 200,
    });
    const rawJobs = jobsResp.data || [];

    if (!rawJobs.length) {
      showLoading(false);
      banner('warn', '⚠️', 'No Jobs found for this location.');
      return;
    }

    S.jobs = rawJobs.map((j, i) => ({
      id:        j.id,
      name:      j.Name || 'Job ' + (i+1),
      campaigns: parseCampaigns(j),
      tagClass:  TAG_CLASSES[i % TAG_CLASSES.length],
      fwcName:   j.Field_Work_Cycle?.name || '',
      data:      j,
      orig:      JSON.parse(JSON.stringify(j)),
      dirty: false, saved: false, error: null,
    }));

    showLoading(false);
    renderAll();
    show('stats-wrap'); show('prog-wrap');
    updateStats();
    const fwcNames = [...new Set(S.jobs.map(j=>j.fwcName).filter(Boolean))];
    banner('info','ℹ️','<strong>'+S.jobs.length+'</strong> job(s) loaded for <strong>'+esc(locName)+'</strong>'+(fwcNames.length?' · FWC: '+fwcNames.map(esc).join(', '):'')+'.');
  } catch(e) {
    showLoading(false);
    banner('err','❌','Error: '+esc(e.message||JSON.stringify(e)));
    console.error(e);
  }
}

function parseCampaigns(j) {
  const raw = j.Campagnes_Orderlijst;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(c => c?.name || String(c));
  if (typeof raw === 'string') return raw.split(/[;,\n]/).map(s=>s.trim()).filter(Boolean);
  return [];
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderAll() {
  const c = document.getElementById('jobs-container');
  c.innerHTML = '';
  S.jobs.forEach((job, idx) => c.appendChild(buildCard(job, idx)));
}

function buildCard(job, idx) {
  const card = document.createElement('div');
  card.className = 'job-card' + (idx===0?' open':'') + (job.saved?' saved':'') + (job.error?' errored':'');
  card.id = 'card-' + job.id;

  card.innerHTML = `
    <div class="job-hdr" onclick="toggleCard('${job.id}')">
      <div class="jh-left">
        <span class="jnum">#${idx+1}</span>
        <span class="jname">${esc(job.name)}</span>
        ${job.campaigns.map(c=>`<span class="jtag ${job.tagClass}">${esc(c)}</span>`).join('')}
        ${job.fwcName?`<span class="jtag fwc-tag">${esc(job.fwcName)}</span>`:''}
      </div>
      <div class="jh-right">
        <span class="dot${job.saved?' ok':job.dirty?' dirty':job.error?' err':''}" id="dot-${job.id}"></span>
        <button onclick="event.stopPropagation();saveOne('${job.id}')">Save</button>
        <span class="chev">▼</span>
      </div>
    </div>
    <div class="job-body" id="body-${job.id}"></div>
    <div class="jfoot">
      <span class="jfoot-msg${job.saved?' ok':job.error?' err':''}" id="fm-${job.id}">${job.saved?'✓ Saved':job.error?'❌ Error':'Not saved yet'}</span>
      <button class="primary" onclick="saveOne('${job.id}')">Save this job</button>
    </div>`;

  // Build body after inserting into DOM
  setTimeout(() => buildBody(job), 0);
  return card;
}

function buildBody(job) {
  const body = document.getElementById('body-' + job.id);
  if (!body) return;

  const d = job.data;

  // ── TAB BAR ──
  const tabBar = document.createElement('div');
  tabBar.className = 'tab-bar';
  tabBar.innerHTML = `
    <button class="tab-btn active" onclick="switchTab('${job.id}','overzicht',this)">Overzicht</button>
    <button class="tab-btn" onclick="switchTab('${job.id}','tijdslijn',this)">Tijdslijn</button>`;
  body.appendChild(tabBar);

  // ── OVERZICHT TAB ──
  const overzicht = document.createElement('div');
  overzicht.className = 'tab-content';
  overzicht.id = 'tab-overzicht-' + job.id;
  overzicht.innerHTML = buildOverzicht(job);
  body.appendChild(overzicht);

  // ── TIJDSLIJN TAB ──
  const tijdslijn = document.createElement('div');
  tijdslijn.className = 'tab-content';
  tijdslijn.id = 'tab-tijdslijn-' + job.id;
  tijdslijn.style.display = 'none';
  tijdslijn.innerHTML = `<div class="ro-section"><p style="color:var(--text-3);font-size:12px;padding:16px 0">Tijdslijn is not available in this widget. Open the Job record directly to view it.</p></div>`;
  body.appendChild(tijdslijn);

  // Attach change listeners
  attachListeners(job);
}

function buildOverzicht(job) {
  const d = job.data;
  const v = (val) => val != null && val !== '' ? esc(String(val)) : '<span class="ro-empty">—</span>';
  const vBool = (val) => val === true || val === 'true' ? '✓ Ja' : '<span class="ro-empty">—</span>';

  return `
    <!-- JOB INFORMATIE -->
    <div class="crm-section">
      <div class="crm-section-title">Job Informatie</div>
      <div class="crm-fields-grid">
        <div class="crm-field">
          <div class="crm-label">Jobnaam</div>
          <div class="crm-value">${v(d.Name)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Job-eigenaar</div>
          <div class="crm-value">${v(d.Owner?.name)}</div>
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Status <span class="edit-badge">bewerkbaar</span></div>
          <select class="fi" data-job="${job.id}" data-api="Status">
            ${S.statusOpts.map(o=>`<option value="${esc(o)}"${d.Status===o?' selected':''}>${esc(o)}</option>`).join('')}
          </select>
        </div>
        <div class="crm-field">
          <div class="crm-label">Locatie</div>
          <div class="crm-value crm-link">${v(d.Klant?.name)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Field Work Cycle</div>
          <div class="crm-value crm-link">${v(d.Field_Work_Cycle?.name)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Datum veldbezoek</div>
          <div class="crm-value">${v(d.Datum_veldbezoek)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Campagnes Orderlijst</div>
          <div class="crm-value">${job.campaigns.length ? job.campaigns.map(esc).join(', ') : '<span class="ro-empty">—</span>'}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Aantekeningen</div>
          <div class="crm-value">${v(d.Aantekeningen)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Specifieke afspraken</div>
          <div class="crm-value">${v(d.Specifieke_afspraken)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Locatiebezoek</div>
          <div class="crm-value crm-link">${v(d.Locatiebezoek_NEW?.name)}</div>
        </div>
      </div>
    </div>

    <!-- INFO. LOCATIE -->
    <div class="crm-section">
      <div class="crm-section-title">Info. Locatie</div>
      <div class="crm-fields-grid">
        <div class="crm-field">
          <div class="crm-label">Opmerkingen uit Locatie record</div>
          <div class="crm-value">${v(d.Opmerkingen_uit_Locatie_record)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">1 - Netwerk Audience</div>
          <div class="crm-value">${v(Array.isArray(d.Network_Audience)?d.Network_Audience.join('; '):d.Network_Audience)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Aantal Huisartsen</div>
          <div class="crm-value">${v(d.Aantal_Huisartsen)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">POH</div>
          <div class="crm-value">${v(d.POH)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Diëtiste</div>
          <div class="crm-value">${v(d.Di_tiste)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Beeldschermen</div>
          <div class="crm-value">${v(d.Beeldschermen)}</div>
        </div>
      </div>
    </div>

    <!-- ADRESGEGEVENS (editable) -->
    <div class="crm-section editable-section">
      <div class="crm-section-title">Adresgegevens <span class="edit-badge">bewerkbaar</span></div>
      <div class="crm-fields-grid">
        <div class="crm-field editable">
          <div class="crm-label">Postadres (straat)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_straat" value="${esc(d.Postadres_straat||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Postadres (huisnummer)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_huisnummer" value="${esc(d.Postadres_huisnummer||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Postadres (huisnummertoevoeging)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_huisnummertoevoeging" value="${esc(d.Postadres_huisnummertoevoeging||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Postadres (Plaats)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_Plaats" value="${esc(d.Postadres_Plaats||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Postadres (postcode)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_postcode" value="${esc(d.Postadres_postcode||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Postadres (land)</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Postadres_land" value="${esc(d.Postadres_land||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Gemeente Locatie</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Gemeente_Locatie" value="${esc(d.Gemeente_Locatie||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Provincie locatie</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Provincie_locatie" value="${esc(d.Provincie_locatie||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Rayon Locatie</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Rayon_Locatie" value="${esc(d.Rayon_Locatie||'')}">
        </div>
        <div class="crm-field editable">
          <div class="crm-label">Rayon2</div>
          <input type="text" class="fi" data-job="${job.id}" data-api="Rayon" value="${esc(d.Rayon||'')}">
        </div>
      </div>
    </div>

    <!-- TASKS -->
    <div class="crm-section">
      <div class="crm-section-title">Tasks</div>
      <div class="crm-fields-grid">
        <div class="crm-field">
          <div class="crm-label">Task naam</div>
          <div class="crm-value">${v(d.Task_naam)}</div>
        </div>
        <div class="crm-field">
          <div class="crm-label">Middelen Assets</div>
          <div class="crm-value">${v(Array.isArray(d.Asset_Types)?d.Asset_Types.join('; '):d.Asset_Types)}</div>
        </div>
      </div>
    </div>`;
}

// ── TABS ──────────────────────────────────────────────────────────────────────
function switchTab(jobId, tab, btn) {
  const body = document.getElementById('body-' + jobId);
  if (!body) return;
  body.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  body.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('tab-' + tab + '-' + jobId);
  if (target) target.style.display = 'block';
  btn.classList.add('active');
}

// ── LISTENERS ─────────────────────────────────────────────────────────────────
function attachListeners(job) {
  const body = document.getElementById('body-' + job.id);
  if (!body) return;
  body.querySelectorAll('[data-job]').forEach(el => {
    const h = () => markDirty(job, el.dataset.api, el.value || null);
    el.addEventListener('change', h);
    el.addEventListener('input', h);
  });
}

function markDirty(job, api, value) {
  job.data[api] = value;
  job.dirty = true; job.saved = false; job.error = null;
  const dot = document.getElementById('dot-' + job.id);
  if (dot) dot.className = 'dot dirty';
  updateStats();
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
async function saveOne(id) {
  const job = S.jobs.find(j => j.id === id);
  if (!job) return;
  setMsg(id, '⏳ Saving…', '');
  try {
    // Only save editable fields
    const editableApis = [
      'Status',
      'Postadres_straat','Postadres_huisnummer','Postadres_huisnummertoevoeging',
      'Postadres_Plaats','Postadres_postcode','Postadres_land',
      'Gemeente_Locatie','Provincie_locatie','Rayon_Locatie','Rayon'
    ];
    const payload = { id };
    editableApis.forEach(api => { if (job.data[api] !== undefined) payload[api] = job.data[api]; });
    await ZOHO.CRM.API.updateRecord({ Entity: 'Locatiebezoeken', APIData: payload, Trigger: [] });
    job.saved = true; job.dirty = false; job.error = null;
    job.orig = JSON.parse(JSON.stringify(job.data));
    const dot = document.getElementById('dot-' + id);
    const card = document.getElementById('card-' + id);
    if (dot) dot.className = 'dot ok';
    if (card) { card.classList.add('saved'); card.classList.remove('errored'); }
    setMsg(id, '✓ Saved', 'ok');
  } catch(e) {
    job.error = e.message || JSON.stringify(e);
    const dot = document.getElementById('dot-' + id);
    const card = document.getElementById('card-' + id);
    if (dot) dot.className = 'dot err';
    if (card) { card.classList.add('errored'); card.classList.remove('saved'); }
    setMsg(id, '❌ ' + esc(job.error), 'err');
    console.error(e);
  }
  updateStats();
}

async function saveAll() {
  const pending = S.jobs.filter(j => j.dirty || !j.saved);
  if (!pending.length) return;
  showOverlay(true, 'Saving (0/'+pending.length+')…', 'Please wait…', 0);
  let done=0, errors=0;
  for (const job of pending) {
    await saveOne(job.id); done++;
    if (job.error) errors++;
    showOverlay(true, 'Saving ('+done+'/'+pending.length+')…', errors?errors+' error(s)':'Please wait…', Math.round(done/pending.length*100));
    await sleep(80);
  }
  showOverlay(false);
  if (errors) banner('err','❌',done-errors+'/'+pending.length+' saved. '+errors+' error(s).');
  else banner('ok','✅','All '+done+' jobs saved!');
  updateStats();
}

function resetAll() {
  if (!confirm('Reset all unsaved changes?')) return;
  S.jobs.forEach(j => { j.data=JSON.parse(JSON.stringify(j.orig)); j.dirty=false; j.error=null; });
  renderAll(); updateStats();
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function toggleCard(id) { const c=document.getElementById('card-'+id); if(c) c.classList.toggle('open'); }
function expandAll()    { document.querySelectorAll('.job-card').forEach(c=>c.classList.add('open')); }
function collapseAll()  { document.querySelectorAll('.job-card').forEach(c=>c.classList.remove('open')); }

function setMsg(id,msg,cls) {
  const el=document.getElementById('fm-'+id); if(!el) return;
  el.textContent=msg; el.className='jfoot-msg'+(cls?' '+cls:'');
}

function updateStats() {
  const total=S.jobs.length,done=S.jobs.filter(j=>j.saved).length,
        pending=S.jobs.filter(j=>!j.saved).length,errors=S.jobs.filter(j=>j.error).length;
  document.getElementById('s-total').textContent=total;
  document.getElementById('s-done').textContent=done;
  document.getElementById('s-pending').textContent=pending;
  document.getElementById('s-err').textContent=errors;
  const pct=total?Math.round(done/total*100):0;
  document.getElementById('prog-fill').style.width=pct+'%';
  document.getElementById('prog-txt').textContent=done+' / '+total;
  const hasDirty=S.jobs.some(j=>j.dirty||!j.saved);
  document.getElementById('btn-save-all').disabled=!hasDirty;
  document.getElementById('sab-btn').disabled=!hasDirty;
  document.getElementById('sab-count').textContent=pending;
}

function showLoading(on) {
  document.getElementById('loading-wrap').style.display=on?'flex':'none';
  document.getElementById('jobs-area').style.display=on?'none':'block';
}
function banner(type,icon,html) {
  const cls={info:'b-info',ok:'b-ok',err:'b-err',warn:'b-warn'}[type]||'b-info';
  document.getElementById('banner-area').innerHTML='<div class="banner '+cls+'"><span class="banner-icon">'+icon+'</span><div>'+html+'</div></div>';
}
function show(id){const el=document.getElementById(id);if(el)el.style.display='';}
function showOverlay(on,title,sub,pct){const ov=document.getElementById('overlay');ov.classList.toggle('active',on);if(on){document.getElementById('ov-title').textContent=title;document.getElementById('ov-sub').textContent=sub;document.getElementById('ov-fill').style.width=pct+'%';}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
