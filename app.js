/* =============================================================================
   IDS Media – Widget TEST v1
   Loads and displays the current Relaties (Accounts) record fields.
   Uses direct REST API with token from URL params.
   ============================================================================= */

const S = {
  recordId:  null,
  token:     null,
  apiDomain: 'https://crmsandbox.zoho.eu',
};

window.addEventListener('load', function() {
  const p = new URLSearchParams(window.location.search);
  S.recordId  = p.get('recordId') || p.get('EntityId') || p.get('id');
  S.token     = p.get('token')    || p.get('access_token');
  S.apiDomain = p.get('apiDomain') || 'https://crmsandbox.zoho.eu';

  show('topbar'); show('main-content'); show('savebar');

  if (!S.recordId || !S.token) {
    showLoading(false);
    banner('err', '❌',
      '<strong>Missing URL parameters.</strong><br><br>' +
      'The button URL needs:<br>' +
      '<code>?recordId=RECORD_ID&token=ACCESS_TOKEN</code><br><br>' +
      'Current URL: <code>' + esc(window.location.href) + '</code>'
    );
    return;
  }

  loadRelatie();
});

async function loadRelatie() {
  showLoading(true);
  banner('info', '⏳', 'Calling API: GET Accounts/' + S.recordId);

  try {
    const url = S.apiDomain + '/crm/v5/Accounts/' + S.recordId;
    const r = await fetch(url, {
      headers: { 'Authorization': 'Zoho-oauthtoken ' + S.token }
    });

    const responseText = await r.text();

    if (!r.ok) {
      showLoading(false);
      banner('err', '❌',
        'API error ' + r.status + ':<br><pre style="font-size:11px;white-space:pre-wrap">' +
        esc(responseText.slice(0, 500)) + '</pre>'
      );
      return;
    }

    const data = JSON.parse(responseText);
    const record = data.data?.[0] || {};

    showLoading(false);
    banner('ok', '✅', 'Record loaded successfully! Showing all fields below.');

    document.getElementById('tb-name').textContent = record.Account_Name || record.Name || '—';
    document.getElementById('tb-fwc').textContent  = 'Relaties record – field test';

    // Display all fields in a simple table
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';

    const table = document.createElement('div');
    table.style.cssText = 'background:#fff;border:1px solid #e5e1da;border-radius:8px;overflow:hidden';

    const header = document.createElement('div');
    header.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0;background:#f4f1ec;padding:8px 14px;font-size:11px;font-weight:600;color:#7a746c;text-transform:uppercase;letter-spacing:.06em';
    header.innerHTML = '<span>Field API Name</span><span>Value</span>';
    table.appendChild(header);

    let rowCount = 0;
    Object.entries(record).forEach(([key, val]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0;padding:7px 14px;border-top:1px solid #e5e1da;font-size:12px;background:' + (rowCount % 2 === 0 ? '#fff' : '#faf9f7');
      
      let displayVal = '';
      if (val === null || val === undefined) displayVal = '<span style="color:#ccc">—</span>';
      else if (typeof val === 'object') displayVal = '<span style="color:#9c958c">' + esc(JSON.stringify(val).slice(0, 80)) + '</span>';
      else displayVal = esc(String(val));

      row.innerHTML = '<span style="color:#5c574f;font-weight:500">' + esc(key) + '</span><span>' + displayVal + '</span>';
      table.appendChild(row);
      rowCount++;
    });

    container.appendChild(table);
    show('jobs-area');
    show('stats-wrap');

    document.getElementById('s-total').textContent = rowCount;
    document.getElementById('s-done').textContent  = '—';
    document.getElementById('s-pending').textContent = '—';
    document.getElementById('s-err').textContent   = '0';

  } catch(e) {
    showLoading(false);
    banner('err', '❌', 'Fetch error: ' + esc(e.message));
    console.error(e);
  }
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function showLoading(on) {
  document.getElementById('loading-wrap').style.display = on ? 'flex' : 'none';
  document.getElementById('jobs-area').style.display    = on ? 'none' : 'block';
}

function banner(type, icon, html) {
  const cls = { info:'b-info', ok:'b-ok', err:'b-err', warn:'b-warn' }[type] || 'b-info';
  document.getElementById('banner-area').innerHTML =
    '<div class="banner ' + cls + '"><span class="banner-icon">' + icon + '</span><div>' + html + '</div></div>';
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Stubs for buttons referenced in HTML
function expandAll(){}
function collapseAll(){}
function saveAll(){}
function resetAll(){}
