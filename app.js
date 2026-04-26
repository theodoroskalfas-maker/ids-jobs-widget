/* =============================================================================
   IDS Media – Widget SDK Diagnostic v2
   Tests if ZOHO JS SDK fires correctly.
   ============================================================================= */

const S = { recordId: null, jobs: [] };

// Show something immediately so we know JS is running
document.addEventListener('DOMContentLoaded', function() {
  show('topbar'); show('main-content'); show('savebar');
  document.getElementById('tb-name').textContent = 'Initialising…';
  document.getElementById('tb-fwc').textContent  = 'Waiting for Zoho SDK…';
  banner('info', '⏳', 'JavaScript loaded. Waiting for ZOHO SDK PageLoad event…');
});

// ── SDK INIT ──────────────────────────────────────────────────────────────────
try {
  ZOHO.embeddedApp.on('PageLoad', function(data) {
    document.getElementById('tb-name').textContent = 'PageLoad fired!';
    document.getElementById('tb-fwc').textContent  = 'EntityId: ' + (data.EntityId || '?');
    
    banner('ok', '✅',
      '<strong>SDK PageLoad fired successfully!</strong><br>' +
      'EntityId: <code>' + esc(data.EntityId || '—') + '</code><br>' +
      'Entity: <code>' + esc(data.Entity || '—') + '</code><br>' +
      'Full data: <pre style="font-size:10px;margin-top:6px;white-space:pre-wrap">' + 
      esc(JSON.stringify(data, null, 2)) + '</pre>'
    );

    showLoading(false);
    S.recordId = data.EntityId;

    // Now try an API call
    if (S.recordId) {
      testApiCall(S.recordId);
    }
  });

  ZOHO.embeddedApp.init();

  // Timeout fallback
  setTimeout(function() {
    if (!S.recordId) {
      banner('err', '❌',
        '<strong>SDK PageLoad did NOT fire after 8 seconds.</strong><br><br>' +
        'This means the Zoho JS SDK is not initialising correctly for this external widget.<br><br>' +
        'ZOHO object available: <code>' + (typeof ZOHO !== 'undefined' ? 'YES' : 'NO') + '</code><br>' +
        'ZOHO.embeddedApp available: <code>' + (typeof ZOHO !== 'undefined' && ZOHO.embeddedApp ? 'YES' : 'NO') + '</code><br>' +
        'Current URL: <code>' + esc(window.location.href) + '</code>'
      );
      showLoading(false);
    }
  }, 8000);

} catch(e) {
  banner('err', '❌', 'SDK init error: ' + esc(e.message));
  showLoading(false);
}

// ── TEST API CALL ─────────────────────────────────────────────────────────────
function testApiCall(recordId) {
  banner('info', '⏳', 'SDK works! Now testing API call for record: ' + esc(recordId));
  
  ZOHO.CRM.API.getRecord({
    Entity:   'Accounts',
    RecordID: recordId
  }).then(function(data) {
    const record = data.data?.[0] || {};
    const name = record.Account_Name || record.Name || '—';
    
    document.getElementById('tb-name').textContent = name;
    document.getElementById('tb-fwc').textContent  = 'API call successful!';
    
    banner('ok', '✅',
      '<strong>API call works!</strong> Record name: <strong>' + esc(name) + '</strong><br><br>' +
      'Fields returned: <code>' + Object.keys(record).length + '</code><br>' +
      'Next step: load Jobs related list.'
    );

    show('stats-wrap');
    show('jobs-area');
    document.getElementById('s-total').textContent = Object.keys(record).length;
    document.getElementById('s-done').textContent  = '✓';
    document.getElementById('s-pending').textContent = '0';
    document.getElementById('s-err').textContent   = '0';

    // Show field list
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border:1px solid #e5e1da;border-radius:8px;overflow:hidden';
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;padding:8px 14px;background:#f4f1ec;font-size:11px;font-weight:600;color:#7a746c;text-transform:uppercase';
    hdr.innerHTML = '<span>Field</span><span>Value</span>';
    box.appendChild(hdr);
    let i = 0;
    Object.entries(record).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;padding:6px 14px;border-top:1px solid #e5e1da;font-size:12px;background:' + (i++%2?'#faf9f7':'#fff');
      let dv = v === null ? '<span style="color:#ccc">—</span>' : typeof v === 'object' ? '<span style="color:#9c8">' + esc(JSON.stringify(v).slice(0,60)) + '</span>' : esc(String(v));
      row.innerHTML = '<span style="color:#5c574f;font-weight:500">' + esc(k) + '</span><span>' + dv + '</span>';
      box.appendChild(row);
    });
    container.appendChild(box);

  }).catch(function(err) {
    banner('err', '❌',
      'API call failed:<br><pre style="font-size:10px">' + 
      esc(JSON.stringify(err, null, 2).slice(0, 400)) + '</pre>'
    );
  });
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function showLoading(on) {
  document.getElementById('loading-wrap').style.display = on ? 'flex' : 'none';
  document.getElementById('jobs-area').style.display    = on ? 'none' : 'block';
}
function banner(type, icon, html) {
  const cls = {info:'b-info',ok:'b-ok',err:'b-err',warn:'b-warn'}[type]||'b-info';
  document.getElementById('banner-area').innerHTML =
    '<div class="banner '+cls+'"><span class="banner-icon">'+icon+'</span><div>'+html+'</div></div>';
}
function show(id) { const el=document.getElementById(id); if(el) el.style.display=''; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function expandAll(){}
function collapseAll(){}
function saveAll(){}
function resetAll(){}
