/* =============================================================================
   IDS Media – Jobs Widget  |  app.js
   De Gunfactor  |  v1.0.0
   ============================================================================= */

// ── FIELD DEFINITIONS ────────────────────────────────────────────────────────
// All editable fields from the Jobs (Locatiebezoeken) module.
// type: 'pick' | 'bool' | 'multi' | 'text' | 'textarea' | 'date' | 'datetime' | 'number'
const FIELD_DEFS = [

  // VISIT OUTCOME
  { s:'Visit outcome', api:'Status', label:'Status', t:'pick',
    opts:['Open','Bezocht','Niet bezocht','Afgesproken','Geannuleerd'] },
  { s:'Visit outcome', api:'Datum_veldbezoek',         label:'Visit date',                t:'date' },
  { s:'Visit outcome', api:'Voor',                     label:'From (date/time)',           t:'datetime' },
  { s:'Visit outcome', api:'Na',                       label:'Until (date/time)',          t:'datetime' },
  { s:'Visit outcome', api:'Specifieke_afspraken',     label:'Specific appointments',      t:'text' },
  { s:'Visit outcome', api:'Specifieke_tijd_afgesproken', label:'Specific time agreed',    t:'bool' },
  { s:'Visit outcome', api:'Aantekeningen',            label:'Notes',                      t:'textarea', full:true },
  { s:'Visit outcome', api:'Heeft_deze_locatie_vragen_of_o', label:'Location questions/remarks', t:'text', full:true },
  { s:'Visit outcome', api:'Is_dit_gedaan',            label:'Is this done?',              t:'text' },
  { s:'Visit outcome', api:'Omschrijf_het',            label:'Describe it',                t:'textarea', full:true },
  { s:'Visit outcome', api:'Zijn_er_opmerkingen_mbt_deze_l', label:'Remarks re location/campaign', t:'text', full:true },
  { s:'Visit outcome', api:'Opmerkingen_mbt_locatie_camp_1', label:'Remarks re location/campaign 2', t:'text', full:true },
  { s:'Visit outcome', api:'Opmerkingen_mbt_locatie_camp_2', label:'Remarks re location/campaign 3', t:'text', full:true },

  // LOCATION TYPE
  { s:'Location type', api:'Huisarts',   label:'GP practice',  t:'bool' },
  { s:'Location type', api:'Notaris',    label:'Notary',       t:'bool' },
  { s:'Location type', api:'Ziekenhuis', label:'Hospital',     t:'bool' },
  { s:'Location type', api:'Aantal_Huisartsen', label:'Number of GPs', t:'number' },
  { s:'Location type', api:'POH',      label:'POH',      t:'pick', opts:['Ja','Nee','Onbekend'] },
  { s:'Location type', api:'Di_tiste', label:'Dietician', t:'pick', opts:['Ja','Nee','Onbekend'] },
  { s:'Location type', api:'Beeldschermen', label:'Screens', t:'pick', opts:['Ja','Nee','Niet van toepassing'] },
  { s:'Location type', api:'Is_deze_locatie_nog_altijd_als_Wi_1', label:'Still WIS GP?',     t:'pick', opts:['Ja','Nee','Onbekend'] },
  { s:'Location type', api:'Is_deze_locatie_nog_altijd_als_Wi_2', label:'Still WIS Notary?', t:'pick', opts:['Ja','Nee','Onbekend'] },
  { s:'Location type', api:'Altijd_ziek',        label:'Always sick',        t:'bool' },
  { s:'Location type', api:'Altijd_ziek_vragen', label:'Always sick (questions)', t:'bool' },
  { s:'Location type', api:'Obesitas',   label:'Obesity?',   t:'text' },
  { s:'Location type', api:'Alzheimer',  label:'Alzheimer?', t:'text' },

  // CAMPAIGN ACTIONS
  { s:'Campaign actions', api:'Overhandigd',              label:'Handed over?',                  t:'bool' },
  { s:'Campaign actions', api:'Obesitas_Overhandiging',   label:'Obesity handover',               t:'bool' },
  { s:'Campaign actions', api:'Overhandigd_enveloppe_Obesitas', label:'Obesity envelope handed over', t:'pick', opts:['Ja','Nee','Niet van toepassing'] },
  { s:'Campaign actions', api:'Brochure_Alzheimer',       label:'Alzheimer brochure',             t:'bool' },
  { s:'Campaign actions', api:'Brochurevragen',           label:'Brochure questions',             t:'bool' },
  { s:'Campaign actions', api:'Heb_je_de_Overhandiging_gedaan',  label:'Handover done?',          t:'bool' },
  { s:'Campaign actions', api:'Heb_je_de_overhandiging_gedaa_1', label:'Handover done? (variant)', t:'bool' },
  { s:'Campaign actions', api:'Heb_je_de_poster_kunnen_Opha',    label:'Poster hung up?',          t:'bool' },
  { s:'Campaign actions', api:'Heb_je_deze_Huisarts_bezocht',    label:'GP visited?',              t:'bool' },
  { s:'Campaign actions', api:'Heb_je_deze_Notaris_bezocht',     label:'Notary visited?',          t:'bool' },
  { s:'Campaign actions', api:'Heb_je_dit_Ziekenhuis_bezocht',   label:'Hospital visited?',        t:'bool' },
  { s:'Campaign actions', api:'Heb_je_het_Pakket_overhandigd',   label:'Package delivered?',       t:'bool' },
  { s:'Campaign actions', api:'SVP_alle_oude_materialen_verwij',  label:'Remove old materials',     t:'bool' },
  { s:'Campaign actions', api:'Campaign_Checklist', label:'Campaign checklist', t:'pick', opts:['Compleet','Gedeeltelijk','Niet gedaan'] },
  { s:'Campaign actions', api:'Task_naam', label:'Task name', t:'text' },

  // MATERIALS
  { s:'Materials', api:'Abbott_Brochures_25_a_50_stuks', label:'Abbott Brochures 25–50 pcs',    t:'multi', opts:['Ja','Nee','Niet van toepassing'] },
  { s:'Materials', api:'Brochures_5_a_10_plaatsen_Geef', label:'Brochures 5–10 locations',      t:'pick',  opts:['Ja','Nee','Niet van toepassing'] },
  { s:'Materials', api:'Brochures_Geef_aan_wat_van_to',  label:'Brochures – what applies',      t:'multi', opts:['Brochure A','Brochure B','Brochure C','Poster'] },
  { s:'Materials', api:'Kanker_nl_Posters_Geef_aan_wat', label:'Kanker.nl Posters – what applies', t:'multi', opts:['Poster A3','Poster A4','Niet geplaatst'] },
  { s:'Materials', api:'Vegro_Magazines_5_a_10_stuks',   label:'Vegro Magazines 5–10 pcs',      t:'pick',  opts:['Ja','Nee','Niet van toepassing'] },
  { s:'Materials', api:'Vegro_Magazines_5_a_10_stuks1',  label:'Vegro Magazines 5–10 pcs (multi)', t:'multi', opts:['Magazine A','Magazine B','Magazine C'] },
  { s:'Materials', api:'Asset_Types',      label:'Asset types',      t:'multi', opts:['Poster','Brochure','Display','Beeldscherm','Enveloppe'] },
  { s:'Materials', api:'Network_Audience', label:'Network audience', t:'multi', opts:['Huisartsen','Notarissen','Ziekenhuizen','Apothekers','Fysiotherapeuten'] },

  // REGION
  { s:'Region', api:'Gemeente_Locatie',  label:'Municipality',      t:'text' },
  { s:'Region', api:'Provincie_locatie', label:'Province',          t:'pick', opts:['Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'] },
  { s:'Region', api:'Rayon_Locatie',     label:'Rayon (location)',  t:'text' },
  { s:'Region', api:'Rayon',             label:'Rayon 2',           t:'text' },
];

// Fields to never include in the editable form
const SKIP = new Set([
  'Name','Owner','Created_By','Modified_By','Email','Secondary_Email',
  'Tag','Currency','Exchange_Rate','Record_Image','Field_Work_Cycle',
  'Klant','Locatiebezoek_NEW','Locatiebezoek_ref','Connected_To__s',
  'Campagnes_2','Campagnes_Orderlijst','Email_Opt_Out',
  'Postadres_straat','Postadres_huisnummer','Postadres_huisnummertoevoeging',
  'Postadres_Plaats','Postadres_postcode','Postadres_land',
  'Opmerkingen_uit_Locatie_record','Opmerking_Kantoor_uit_Locatie_',
  'Neem_een_foto_zie_Briefing','Neem_een_foto_van_de_magazin',
  'Neem_een_foto_van_de_poster_i','Foto_van_poster_hier_uploaden',
]);

const TAG_CLASSES = ['tag-blue','tag-green','tag-amber','tag-purple','tag-pink'];

// ── STATE ─────────────────────────────────────────────────────────────────────
const S = {
  recordId:  null,   // Relaties (Accounts) record ID
  apiDomain: 'https://www.zohoapis.eu',
  jobs: [],
};

// ── ZOHO SDK INIT ──────────────────────────────────────────────────────────────
ZOHO.embeddedApp.on('PageLoad', function (data) {
  S.recordId = data.EntityId;
  loadJobs();
});

ZOHO.embeddedApp.init();

// ── API HELPERS ───────────────────────────────────────────────────────────────
async function zohoGet(module, recordId, relatedList) {
  return new Promise((resolve, reject) => {
    if (relatedList) {
      ZOHO.CRM.API.getRelatedRecords({
        Entity:     module,
        RecordID:   recordId,
        RelatedList: relatedList,
        page: 1,
        per_page: 200,
      }).then(resolve).catch(reject);
    } else {
      ZOHO.CRM.API.getRecord({ Entity: module, RecordID: recordId })
        .then(resolve).catch(reject);
    }
  });
}

async function zohoUpdate(module, recordId, fields) {
  return new Promise((resolve, reject) => {
    ZOHO.CRM.API.updateRecord({
      Entity: module,
      APIData: { id: recordId, ...fields },
      Trigger: [],
    }).then(resolve).catch(reject);
  });
}

async function zohoSearch(module, criteria) {
  return new Promise((resolve, reject) => {
    ZOHO.CRM.API.searchRecord({
      Entity:    module,
      Type:      'criteria',
      Query:     criteria,
      page:      1,
      per_page:  200,
    })
    .then(data => {
      // Zoho SDK returns {data:[...]} or just an array depending on version
      if (Array.isArray(data)) resolve({ data });
      else resolve(data);
    })
    .catch(err => {
      // If no records found, Zoho returns an error object — treat as empty
      if (err && (err.status === 'error' || err.code === 'NO_RECORD_FOUND')) {
        resolve({ data: [] });
      } else {
        reject(err);
      }
    });
  });
}

// ── LOAD JOBS ─────────────────────────────────────────────────────────────────
async function loadJobs() {
  showLoading(true);

  // Helper: wraps any promise with a timeout so we never hang forever
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
      )
    ]);
  }

  try {
    // Show record ID in UI immediately so we can verify it
    document.getElementById('tb-fwc').textContent = 'Record ID: ' + S.recordId;

    // 1. Get Relaties (Accounts) record for header info
    banner('info', '⏳', 'Step 1: loading location record…');
    const relResp = await withTimeout(
      ZOHO.CRM.API.getRecord({ Entity: 'Accounts', RecordID: S.recordId }),
      8000, 'getRecord Accounts'
    );
    const rel     = relResp.data?.[0] || {};
    const locName = rel.Account_Name || rel.Name || '—';
    document.getElementById('tb-name').textContent = locName;
    document.getElementById('tb-fwc').textContent  = 'All Field Work Cycles';
    banner('info', '⏳', 'Step 2: loading jobs…');

    // 2. Get all Jobs via the Accounts → Locatiebezoeken related list
    const jobsResp = await withTimeout(
      ZOHO.CRM.API.getRelatedRecords({
        Entity:      'Accounts',
        RecordID:    S.recordId,
        RelatedList: 'Locatiebezoeken',
        page:        1,
        per_page:    200,
      }),
      10000, 'getRelatedRecords Locatiebezoeken'
    );
    const rawJobs  = jobsResp.data || [];

    if (!rawJobs.length) {
      showLoading(false);
      banner('warn', '⚠️', 'No Jobs found for this location. Jobs are created via the Field Work Cycle process.');
      return;
    }

    // 3. Build state
    S.jobs = rawJobs.map((j, i) => ({
      id:        j.id,
      name:      j.Name || `Job ${i + 1}`,
      campaigns: parseCampaigns(j),
      tagClass:  TAG_CLASSES[i % TAG_CLASSES.length],
      data:      j,
      orig:      JSON.parse(JSON.stringify(j)),
      ctx: {
        Street:    j.Postadres_straat || '',
        'Nr':      [j.Postadres_huisnummer, j.Postadres_huisnummertoevoeging].filter(Boolean).join(' '),
        City:      j.Postadres_Plaats || '',
        Postcode:  j.Postadres_postcode || '',
        Land:      j.Postadres_land || '',
        Municipality: j.Gemeente_Locatie || '',
      },
      note:  j.Opmerkingen_uit_Locatie_record || '',
      dirty: false,
      saved: false,
      error: null,
    }));

    showLoading(false);
    renderAll();
    show('stats-wrap');
    show('prog-wrap');
    show('savebar');
    updateStats();
    // Group jobs by FWC for the info banner
    const fwcNames = [...new Set(S.jobs.map(j => j.data.Field_Work_Cycle?.name).filter(Boolean))];
    const fwcLabel = fwcNames.length ? fwcNames.join(', ') : 'unknown FWC';
    banner('info', 'ℹ️', `<strong>${S.jobs.length}</strong> job(s) loaded for <strong>${locName}</strong> across <strong>${fwcNames.length || 1}</strong> Field Work Cycle(s): ${fwcLabel}. Fill in the fields and save.`);

  } catch (e) {
    showLoading(false);
    banner('err', '❌', 'Error loading jobs: ' + e.message);
    console.error(e);
  }
}

function parseCampaigns(j) {
  const raw = j.Campagnes_Orderlijst;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(c => c?.name || c?.Campagnes_Orderlijst?.name || String(c));
  if (typeof raw === 'string') return raw.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
  return [];
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderAll() {
  const container = document.getElementById('jobs-container');
  container.innerHTML = '';
  S.jobs.forEach((job, idx) => container.appendChild(buildCard(job, idx)));
}

function buildCard(job, idx) {
  const card = document.createElement('div');
  card.className = 'job-card' + (idx === 0 ? ' open' : '') + (job.saved ? ' saved' : '');
  card.id = 'card-' + job.id;

  card.innerHTML = `
    <div class="job-hdr" onclick="toggleCard('${job.id}')">
      <div class="jh-left">
        <span class="jnum">#${idx + 1}</span>
        <span class="jname">${esc(job.name)}</span>
        ${job.campaigns.map(c => `<span class="jtag ${job.tagClass}">${esc(c)}</span>`).join('')}
      </div>
      <div class="jh-right">
        <span class="dot${job.saved ? ' ok' : job.dirty ? ' dirty' : ''}" id="dot-${job.id}"></span>
        <button onclick="event.stopPropagation();saveOne('${job.id}')">Save</button>
        <span class="chev">▼</span>
      </div>
    </div>
    <div class="job-body" id="body-${job.id}">${buildBody(job)}</div>
    <div class="jfoot">
      <span class="jfoot-msg${job.saved ? ' ok' : ''}" id="fm-${job.id}">${job.saved ? '✓ Saved' : 'Not saved yet'}</span>
      <button class="primary" onclick="saveOne('${job.id}')">Save this job</button>
    </div>`;

  // Attach change listeners after inserting into DOM
  setTimeout(() => attachListeners(job), 0);
  return card;
}

function buildBody(job) {
  const ctxItems = Object.entries(job.ctx).filter(([, v]) => v);
  const ctxHtml  = ctxItems.map(([k, v]) =>
    `<div><div class="ctx-label">${k}</div><div class="ctx-val">${esc(String(v))}</div></div>`
  ).join('');

  const noteHtml = job.note
    ? `<div class="note-strip"><strong>Note from location:</strong> ${esc(job.note)}</div>` : '';

  // Group FIELD_DEFS by section
  const sections = {};
  FIELD_DEFS.forEach(f => { if (!sections[f.s]) sections[f.s] = []; sections[f.s].push(f); });

  const fieldsHtml = Object.entries(sections).map(([sec, fields]) => {
    const fHtml = fields.map(f => {
      const val = job.data[f.api];
      let inp = '';

      if (f.t === 'bool') {
        inp = `<label class="cb-row">
          <input type="checkbox" data-job="${job.id}" data-api="${f.api}"${val === true || val === 'true' ? ' checked' : ''}> Yes
        </label>`;
      } else if (f.t === 'pick') {
        const opts = f.opts.map(o => `<option value="${esc(o)}"${val === o ? ' selected' : ''}>${esc(o)}</option>`).join('');
        const extra = val && !f.opts.includes(val) ? `<option value="${esc(val)}" selected>${esc(val)}</option>` : '';
        inp = `<select data-job="${job.id}" data-api="${f.api}"><option value="">— Select —</option>${extra}${opts}</select>`;
      } else if (f.t === 'multi') {
        const cur = Array.isArray(val) ? val : (val ? String(val).split(';').map(s => s.trim()) : []);
        const rows = f.opts.map(o =>
          `<label class="ms-opt"><input type="checkbox" data-job="${job.id}" data-api="${f.api}" data-ms="1" value="${esc(o)}"${cur.includes(o) ? ' checked' : ''}> ${esc(o)}</label>`
        ).join('');
        inp = `<div class="ms-grid">${rows}</div>`;
      } else if (f.t === 'textarea') {
        inp = `<textarea data-job="${job.id}" data-api="${f.api}" rows="3">${esc(val || '')}</textarea>`;
      } else if (f.t === 'date') {
        inp = `<input type="date" data-job="${job.id}" data-api="${f.api}" value="${val ? String(val).split('T')[0] : ''}">`;
      } else if (f.t === 'datetime') {
        inp = `<input type="datetime-local" data-job="${job.id}" data-api="${f.api}" value="${val ? String(val).slice(0, 16).replace(' ', 'T') : ''}">`;
      } else if (f.t === 'number') {
        inp = `<input type="number" data-job="${job.id}" data-api="${f.api}" value="${val ?? ''}">`;
      } else {
        inp = `<input type="text" data-job="${job.id}" data-api="${f.api}" value="${esc(val || '')}">`;
      }

      return `<div class="field${f.full ? ' field-full' : ''}">
        <div class="field-label">${esc(f.label)}</div>
        ${inp}
      </div>`;
    }).join('');

    return `<div class="sec-title">${esc(sec)}</div><div class="fields-grid">${fHtml}</div>`;
  }).join('');

  return `
    ${ctxItems.length ? `<div class="ctx-strip">${ctxHtml}</div>` : ''}
    ${noteHtml}
    ${fieldsHtml}`;
}

function attachListeners(job) {
  const body = document.getElementById('body-' + job.id);
  if (!body) return;

  // Handle multiselect checkboxes separately (group by api)
  const msGroups = {};
  body.querySelectorAll('[data-ms]').forEach(cb => {
    const api = cb.dataset.api;
    if (!msGroups[api]) msGroups[api] = [];
    msGroups[api].push(cb);
    cb.addEventListener('change', () => {
      const checked = msGroups[api].filter(x => x.checked).map(x => x.value);
      markDirty(job, api, checked.length ? checked : null);
    });
  });

  // All other inputs
  body.querySelectorAll('[data-job]:not([data-ms])').forEach(el => {
    const handler = () => {
      const v = el.type === 'checkbox' ? el.checked : (el.value || null);
      markDirty(job, el.dataset.api, v);
    };
    el.addEventListener('change', handler);
    el.addEventListener('input', handler);
  });
}

function markDirty(job, api, value) {
  job.data[api] = value;
  job.dirty = true;
  job.saved = false;
  job.error = null;
  const dot = document.getElementById('dot-' + job.id);
  if (dot) { dot.className = 'dot dirty'; }
  updateStats();
}

// ── SAVE ONE ──────────────────────────────────────────────────────────────────
async function saveOne(id) {
  const job = S.jobs.find(j => j.id === id);
  if (!job) return;

  setMsg(id, '⏳ Saving…', '');
  try {
    // Build payload — only include editable fields
    const payload = {};
    FIELD_DEFS.forEach(f => {
      if (job.data[f.api] !== undefined) payload[f.api] = job.data[f.api];
    });

    await zohoUpdate('Locatiebezoeken', id, payload);

    job.saved = true;
    job.dirty = false;
    job.error = null;
    job.orig  = JSON.parse(JSON.stringify(job.data));

    const dot  = document.getElementById('dot-' + id);
    const card = document.getElementById('card-' + id);
    if (dot)  dot.className = 'dot ok';
    if (card) { card.classList.add('saved'); card.classList.remove('errored'); }
    setMsg(id, '✓ Saved', 'ok');
  } catch (e) {
    job.error = e.message;
    const dot  = document.getElementById('dot-' + id);
    const card = document.getElementById('card-' + id);
    if (dot)  dot.className = 'dot err';
    if (card) { card.classList.add('errored'); card.classList.remove('saved'); }
    setMsg(id, '❌ Error: ' + e.message, 'err');
    console.error(e);
  }
  updateStats();
}

// ── SAVE ALL ──────────────────────────────────────────────────────────────────
async function saveAll() {
  const pending = S.jobs.filter(j => j.dirty || !j.saved);
  if (!pending.length) return;

  showOverlay(true, `Saving (0/${pending.length})…`, 'Please wait…', 0);
  let done = 0, errors = 0;

  for (const job of pending) {
    await saveOne(job.id);
    done++;
    if (job.error) errors++;
    showOverlay(true,
      `Saving (${done}/${pending.length})…`,
      errors ? `${errors} error(s) so far` : 'Please wait…',
      Math.round(done / pending.length * 100)
    );
    await sleep(80);
  }

  showOverlay(false);

  if (errors) {
    banner('err', '❌', `${done - errors} of ${pending.length} jobs saved. ${errors} error(s) — check the red cards.`);
  } else {
    banner('ok', '✅', `All ${done} jobs saved successfully!`);
  }
  updateStats();
}

// ── RESET ALL ─────────────────────────────────────────────────────────────────
function resetAll() {
  if (!confirm('Reset all unsaved changes?')) return;
  S.jobs.forEach(j => {
    j.data  = JSON.parse(JSON.stringify(j.orig));
    j.dirty = false;
    j.error = null;
  });
  renderAll();
  updateStats();
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function toggleCard(id) {
  const card = document.getElementById('card-' + id);
  if (card) card.classList.toggle('open');
}
function expandAll()  { document.querySelectorAll('.job-card').forEach(c => c.classList.add('open')); }
function collapseAll(){ document.querySelectorAll('.job-card').forEach(c => c.classList.remove('open')); }

function setMsg(id, msg, cls) {
  const el = document.getElementById('fm-' + id);
  if (!el) return;
  el.textContent = msg;
  el.className   = 'jfoot-msg' + (cls ? ' ' + cls : '');
}

function updateStats() {
  const total   = S.jobs.length;
  const done    = S.jobs.filter(j => j.saved).length;
  const pending = S.jobs.filter(j => !j.saved).length;
  const errors  = S.jobs.filter(j => j.error).length;

  document.getElementById('s-total').textContent   = total;
  document.getElementById('s-done').textContent    = done;
  document.getElementById('s-pending').textContent = pending;
  document.getElementById('s-err').textContent     = errors;

  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-txt').textContent  = `${done} / ${total}`;

  const hasDirty = S.jobs.some(j => j.dirty || !j.saved);
  document.getElementById('btn-save-all').disabled = !hasDirty;
  document.getElementById('sab-btn').disabled      = !hasDirty;
  document.getElementById('sab-count').textContent = pending;
}

function showLoading(on) {
  document.getElementById('loading-wrap').style.display = on ? 'flex' : 'none';
  document.getElementById('jobs-area').style.display    = on ? 'none' : 'block';
}

function banner(type, icon, html) {
  const cls = { info:'b-info', ok:'b-ok', err:'b-err', warn:'b-warn' }[type] || 'b-info';
  document.getElementById('banner-area').innerHTML =
    `<div class="banner ${cls}"><span class="banner-icon">${icon}</span><div>${html}</div></div>`;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function showOverlay(on, title = '', sub = '', pct = 0) {
  const ov = document.getElementById('overlay');
  ov.classList.toggle('active', on);
  if (on) {
    document.getElementById('ov-title').textContent = title;
    document.getElementById('ov-sub').textContent   = sub;
    document.getElementById('ov-fill').style.width  = pct + '%';
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
