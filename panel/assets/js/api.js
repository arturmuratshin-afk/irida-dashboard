/* ============================================================
   IRIDA · веб-панель · слой данных
   Читает panel.json (снапшот из core/panel.py) из двух источников:
     1) рядом с index.html (GitHub Pages, /panel/panel.json);
     2) raw.githubusercontent.com (обновляется сразу после коммита,
        не зависит от пересборки Pages).
   Берётся тот, у кого новее поле build. Если оба недоступны —
   демо-данные из data.js.

   Контракт совпадает с window.IRIDA: рендер не меняется.
   ============================================================ */

(function () {
  'use strict';

  const RELATIVE = 'panel.json?ts=' + Math.floor(Date.now() / 60000);
  const RAW = 'https://raw.githubusercontent.com/arturmuratshin-afk/' +
    'irida-dashboard/main/panel/panel.json';
  const TTL = 60 * 1000;
  let cache = null;

  function contractOk(j) {
    return j && typeof j === 'object' &&
      Array.isArray(j.markets) && j.layers && typeof j.layers === 'object' &&
      Array.isArray(j.scenarios) && Array.isArray(j.walls) && j.itogi;
  }

  async function fetchOne(url, ms) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try {
      const res = await fetch(url, {
        signal: ctl.signal,
        cache: 'no-cache',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!contractOk(data)) throw new Error('контракт не совпал');
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  function buildKey(d) {
    return String((d && d.build) || '');   // 'YYYY-MM-DD HH:MM' — сортируется строкой
  }

  async function load() {
    if (cache && Date.now() - cache.t < TTL) return cache.v;

    if (typeof fetch !== 'function') return window.IRIDA;

    const settled = await Promise.allSettled([
      fetchOne(RELATIVE, 5000),
      fetchOne(RAW, 7000)
    ]);
    const ok = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value);

    if (!ok.length) {
      console.warn('[IRIDA] снапшот недоступен — демо-данные');
      window.IRIDA_DATA_STATE = 'demo';
      return window.IRIDA;
    }

    ok.sort((a, b) => buildKey(b).localeCompare(buildKey(a)));
    const best = ok[0];
    cache = { v: best, t: Date.now() };
    return best;
  }

  window.IRIDA_API = { load: load };
})();
