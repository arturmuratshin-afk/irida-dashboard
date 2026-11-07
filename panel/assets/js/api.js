/* ============================================================
   IRIDA · веб-панель · слой данных
   Читает panel.json (снапшот, который собирает core/panel.py),
   при недоступности — отдаёт демо-данные из data.js.

   Контракт совпадает с window.IRIDA: рендер не меняется.
   ============================================================ */

(function () {
  'use strict';

  const BASE = window.IRIDA_API_BASE || '';   // '' — panel.json рядом с index.html
  const TTL = 60 * 1000;                      // не дёргать чаще раза в минуту
  let cache = null;

  function contractOk(j) {
    return j && typeof j === 'object' &&
      Array.isArray(j.markets) && j.layers && typeof j.layers === 'object' &&
      Array.isArray(j.scenarios) && Array.isArray(j.walls) && j.itogi;
  }

  async function load() {
    if (cache && Date.now() - cache.t < TTL) return cache.v;

    if (typeof fetch !== 'function') return window.IRIDA;

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    try {
      const res = await fetch(BASE + 'panel.json?ts=' + Math.floor(Date.now() / 60000), {
        signal: ctl.signal,
        cache: 'no-cache',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!contractOk(data)) throw new Error('контракт не совпал');
      cache = { v: data, t: Date.now() };
      return data;
    } catch (err) {
      console.warn('[IRIDA] живой снапшот недоступен — демо-данные:', err.message);
      window.IRIDA_DATA_STATE = 'demo';
      return window.IRIDA;
    } finally {
      clearTimeout(timer);
    }
  }

  window.IRIDA_API = { load: load };
})();
