/**
 * PROSENTKALKEN / LÅNEKALKEN – Cookie Consent Banner
 * GDPR-compliant | Norwegian
 * 
 * Kategorier:
 *   necessary    – alltid på, kan ikke avslås
 *   statistics   – GA4 / analyse (ikke forhåndshuket)
 *   marketing    – AdSense / annonsering (ikke forhåndshuket)
 * 
 * GTM dataLayer events:
 *   cookie_consent_update – sendes når bruker lagrer valg
 *   Payload: { necessary: true, statistics: bool, marketing: bool }
 */

(function () {
  const STORAGE_KEY = 'cookie_consent_v1';
  const BANNER_ID   = 'ck-banner';

  // ── Les lagret samtykke ──
  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ── Lagre samtykke og send til GTM ──
  function saveConsent(statistics, marketing) {
    const consent = { necessary: true, statistics: !!statistics, marketing: !!marketing };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

    // Send til GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cookie_consent_update',
      cookie_consent_necessary:  true,
      cookie_consent_statistics: consent.statistics,
      cookie_consent_marketing:  consent.marketing
    });

    // Google Consent Mode v2
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage:    consent.statistics  ? 'granted' : 'denied',
        ad_storage:           consent.marketing   ? 'granted' : 'denied',
        ad_user_data:         consent.marketing   ? 'granted' : 'denied',
        ad_personalization:   consent.marketing   ? 'granted' : 'denied',
        functionality_storage: 'granted',
        security_storage:      'granted'
      });
    }

    hideBanner();
  }

  // ── Vis/skjul banner ──
  function hideBanner() {
    const b = document.getElementById(BANNER_ID);
    if (b) b.style.display = 'none';
  }

  // ── Bygg banner HTML ──
  function buildBanner() {
    const banner = document.createElement('div');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-innstillinger');
    banner.innerHTML = `
<div id="ck-overlay"></div>
<div id="ck-box">
  <div id="ck-header">
    <h2>Vi bruker informasjonskapsler</h2>
    <p>Vi bruker cookies for å gi deg en bedre opplevelse, analysere trafikk og vise relevante annonser. Du velger selv hva du godtar.</p>
  </div>
  <div id="ck-categories">
    <div class="ck-cat">
      <div class="ck-cat-top">
        <div class="ck-cat-info">
          <strong>Nødvendige</strong>
          <span>Kreves for at nettsiden skal fungere. Kan ikke avslås.</span>
        </div>
        <div class="ck-toggle ck-toggle--locked" aria-label="Alltid aktiv">
          <span class="ck-badge">Alltid på</span>
        </div>
      </div>
    </div>
    <div class="ck-cat">
      <div class="ck-cat-top">
        <div class="ck-cat-info">
          <strong>Statistikk</strong>
          <span>Hjelper oss å forstå hvordan besøkende bruker siden (Google Analytics). Ingen personlig informasjon deles med tredjeparter.</span>
        </div>
        <label class="ck-toggle" aria-label="Aktiver statistikk-cookies">
          <input type="checkbox" id="ck-stat">
          <span class="ck-slider"></span>
        </label>
      </div>
    </div>
    <div class="ck-cat">
      <div class="ck-cat-top">
        <div class="ck-cat-info">
          <strong>Markedsføring</strong>
          <span>Brukes til å vise relevante annonser via Google AdSense. Informasjon kan deles med annonsepartnere.</span>
        </div>
        <label class="ck-toggle" aria-label="Aktiver markedsføring-cookies">
          <input type="checkbox" id="ck-mkt">
          <span class="ck-slider"></span>
        </label>
      </div>
    </div>
  </div>
  <div id="ck-buttons">
    <button id="ck-reject"  type="button">Avvis alle</button>
    <button id="ck-save"    type="button">Lagre valg</button>
    <button id="ck-accept"  type="button">Godta alle</button>
  </div>
  <div id="ck-footer">
    <a href="/personvern.html">Personvernerklæring</a>
  </div>
</div>`;
    return banner;
  }

  // ── CSS ──
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
#ck-overlay {
  position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;
}
#ck-box {
  position:fixed;bottom:0;left:0;right:0;
  background:#1E2D44;border-top:1px solid rgba(255,255,255,0.1);
  padding:24px;z-index:9999;
  max-width:680px;margin:0 auto;border-radius:16px 16px 0 0;
  font-family:'IBM Plex Sans',system-ui,sans-serif;
  box-shadow:0 -8px 32px rgba(0,0,0,0.4);
}
#ck-header h2 {
  font-size:17px;font-weight:700;color:#F0F4FA;margin-bottom:8px;
}
#ck-header p {
  font-size:13px;color:#94A3B8;line-height:1.6;margin-bottom:20px;
}
.ck-cat { padding:12px 0;border-top:1px solid rgba(255,255,255,0.07); }
.ck-cat-top { display:flex;justify-content:space-between;align-items:center;gap:16px; }
.ck-cat-info strong { display:block;font-size:14px;font-weight:600;color:#F0F4FA;margin-bottom:3px; }
.ck-cat-info span { font-size:12px;color:#64748B;line-height:1.5; }
.ck-toggle { position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer; }
.ck-toggle input { opacity:0;width:0;height:0; }
.ck-slider {
  position:absolute;inset:0;background:#334155;border-radius:24px;transition:background 200ms;
}
.ck-slider::before {
  content:'';position:absolute;height:18px;width:18px;left:3px;bottom:3px;
  background:#fff;border-radius:50%;transition:transform 200ms;
}
.ck-toggle input:checked + .ck-slider { background:#0DAF7B; }
.ck-toggle input:checked + .ck-slider::before { transform:translateX(20px); }
.ck-toggle--locked { cursor:default;width:auto;height:auto; }
.ck-badge {
  background:rgba(13,175,123,0.15);color:#0DAF7B;
  border:1px solid rgba(13,175,123,0.3);border-radius:100px;
  padding:3px 10px;font-size:11px;font-weight:600;white-space:nowrap;
}
#ck-buttons {
  display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;
}
#ck-buttons button {
  flex:1;min-width:100px;padding:11px 16px;border-radius:8px;
  font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;
  border:1px solid transparent;transition:all 200ms;
}
#ck-reject {
  background:transparent;border-color:rgba(255,255,255,0.15);color:#94A3B8;
}
#ck-reject:hover { border-color:#94A3B8;color:#F0F4FA; }
#ck-save {
  background:#1A2640;border-color:rgba(255,255,255,0.2);color:#F0F4FA;
}
#ck-save:hover { border-color:#F0F4FA; }
#ck-accept {
  background:#0DAF7B;border-color:#0DAF7B;color:#fff;
}
#ck-accept:hover { background:#0D8F65; }
#ck-footer {
  text-align:center;margin-top:14px;
}
#ck-footer a {
  font-size:11px;color:#64748B;text-decoration:underline;
}
#ck-footer a:hover { color:#94A3B8; }
@media (max-width:600px) {
  #ck-box { border-radius:0;padding:20px 16px; }
  #ck-buttons button { flex:1 1 calc(50% - 5px); }
}`;
    document.head.appendChild(style);
  }

  // ── Init ──
  function init() {
    // Sett Google Consent Mode defaults (før GTM laster)
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage:    'denied',
      ad_storage:           'denied',
      ad_user_data:         'denied',
      ad_personalization:   'denied',
      functionality_storage: 'granted',
      security_storage:      'granted',
      wait_for_update:       500
    });

    const existing = getConsent();
    if (existing) {
      // Gjenopprett tidligere samtykke
      saveConsent(existing.statistics, existing.marketing);
      return;
    }

    // Vis banner
    injectStyles();
    const banner = buildBanner();
    document.body.appendChild(banner);

    document.getElementById('ck-accept').addEventListener('click', function() {
      saveConsent(true, true);
    });
    document.getElementById('ck-reject').addEventListener('click', function() {
      saveConsent(false, false);
    });
    document.getElementById('ck-save').addEventListener('click', function() {
      const stat = document.getElementById('ck-stat').checked;
      const mkt  = document.getElementById('ck-mkt').checked;
      saveConsent(stat, mkt);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
