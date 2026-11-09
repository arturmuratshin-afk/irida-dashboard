/* ============================================================
   IRIDA · веб-панель · приложение v0.1
   Хэш-роутер + рендер экранов из window.IRIDA (демо-данные).
   Точка подключения боевого движка: см. README.md
   ============================================================ */

(function () {
  'use strict';

  let D = window.IRIDA;

  /* ---------- мелкие помощники ---------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const meta = (horizon) =>
    '<div class="meta"><span>Время данных: ' + esc(D.asOf) + '</span>' +
    (horizon ? '<span>горизонт: ' + esc(horizon) + '</span>' : '') +
    '<span>версия ' + esc(D.version) + '</span></div>';

  const dot = (gold) => '<span class="dot' + (gold ? ' dot-gold' : '') + '"></span>';

  const rubric = (name, gold) =>
    '<div class="rubric">' + dot(gold) + esc(name) + '</div>';

  const delta = (d) => '<span class="delta ' + d.dir + '">' + esc(d.delta) + '</span>';

  const statusPill = (status) => {
    const cls = {
      'активен': 'st-active',
      'наблюдение': 'st-nabludenie',
      'подтверждён': 'st-podtverzden',
      'отменён': 'st-otmenen'
    }[status] || 'st-nabludenie';
    return '<span class="pill ' + cls + '">' + esc(status) + '</span>';
  };

  const botbar = (ticker) =>
    '<a class="botbar" href="' + D.botUrl + '" target="_blank" rel="noopener">' +
    'Продолжить разбор в IRIDA <span class="sep">|</span> БОТ' +
    '<svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">' +
    '<path d="M0 6h16m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></a>';

  const pageHead = (rub, title, lead) =>
    '<div class="page-head">' + rubric(rub) +
    '<h1>' + esc(title) + '</h1>' +
    (lead ? '<p class="lead">' + esc(lead) + '</p>' : '') +
    '</div>';

  /* ---------- логотип (SVG, повторяет знак: круг с разрывом и хвостом) ---------- */

  const LOGO =
    '<svg width="52" height="34" viewBox="0 0 70 46" fill="none" aria-hidden="true">' +
    '<path d="M42.7 30.5 A17 17 0 1 1 42.7 13.5" stroke="#C9CFD8" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M28 39 H56" stroke="#C9CFD8" stroke-width="2.4" stroke-linecap="round"/>' +
    '<circle cx="62.5" cy="39" r="3.4" fill="#79C8EA"/>' +
    '</svg>';

  const LOGO_GOLD_ARROW =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M3 12h14m0 0-6-6m6 6-6 6" stroke="#D6AE58" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* ============================================================
     ЭКРАНЫ
     ============================================================ */

  /* ---------- Картина рынка ---------- */

  function renderOverview() {
    const tiles = D.markets.map((m) =>
      '<div class="tile"><div class="name">' + esc(m.name) + '</div>' +
      '<div class="val">' + esc(m.val) + '</div>' +
      '<span class="tiny ' + m.dir + '">' + esc(m.delta) + '</span></div>'
    ).join('');

    const changed = D.changed.changed.map((t) => '<li class="mark-blue">' + esc(t) + '</li>').join('');
    const same = D.changed.same.map((t) => '<li>' + esc(t) + '</li>').join('');

    const sc = D.activeScenariosShort.map((s) =>
      '<div class="history-item"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<a href="#/scenario/' + s.id + '" style="color:var(--text);font-weight:700">' + esc(s.title) + '</a>' +
      '<span class="tag">' + esc(s.ticker) + '</span>' + statusPill(s.status) + '</div></div>'
    ).join('');

    return pageHead('Обзор', 'Картина рынка',
      'Главный сдвиг дня и то, что остаётся неопределённым. Формат рубрики #IRIDA_обзор.') +
      '<div class="tiles">' + tiles + '</div>' +

      '<div class="card" style="margin-top:16px">' +
      rubric('Что изменилось') +
      '<div class="changed-grid" style="margin-top:14px">' +
      '<div><h3>' + dot(true) + ' Изменилось</h3><ul class="plain">' + changed + '</ul></div>' +
      '<div><h3>' + dot(false) + ' Без изменений</h3><ul class="plain">' + same + '</ul></div>' +
      '</div>' +
      '<div class="meaning"><b>Для сценария это означает:</b> ' + esc(D.changed.means) + '</div>' +
      meta('1 день') +
      '</div>' +

      '<div class="card">' +
      rubric('Три слоя — вместе') +
      '<h2>Согласованная картина по слоям</h2>' +
      '<ul class="plain">' +
      '<li class="mark-blue"><b>Акции.</b> ' + esc(D.layersTogether.stock) + '</li>' +
      '<li class="mark-blue"><b>Фьючерсы.</b> ' + esc(D.layersTogether.fut) + '</li>' +
      '<li class="mark-blue"><b>Опционы.</b> ' + esc(D.layersTogether.opt) + '</li>' +
      '</ul>' +
      '<div class="meaning"><b>Вместе.</b> ' + esc(D.layersTogether.together) + '</div>' +
      '<div style="margin-top:14px"><a class="btn btn-ghost-blue" href="#/layers">Открыть три слоя по инструменту</a></div>' +
      meta('1 день · неделя') +
      '</div>' +

      '<div class="card">' +
      rubric('Сценарии') +
      '<h2>Активные сценарии</h2>' + sc +
      '<div style="margin-top:14px"><a class="btn btn-ghost-blue" href="#/scenarios">Все сценарии и история изменений</a></div>' +
      meta() +
      '</div>' +

      '<div class="card">' + botbar() + '</div>';
  }

  /* ---------- Три слоя ---------- */

  let currentTicker = 'SBER';

  function renderLayers() {
    if (!D.layers[currentTicker]) currentTicker = Object.keys(D.layers)[0];
    const tabs = Object.keys(D.layers).map((t) =>
      '<button class="tab' + (t === currentTicker ? ' active' : '') + '" data-ticker="' + t + '">' + esc(t) + '</button>'
    ).join('');

    const L = D.layers[currentTicker];

    const layerCard = (title, items) =>
      '<div class="card"><div class="layer-head">' + rubric(title) + '</div>' +
      '<ul class="plain" style="margin-top:12px">' +
      items.map((i) => '<li class="mark-blue">' + esc(i) + '</li>').join('') +
      '</ul></div>';

    return pageHead('Три слоя', L.name + ' · ' + currentTicker,
      'Акция · фьючерс · опционы · вместе. Рубрика #IRIDA_трислоя: каждый слой говорит только за себя.') +
      '<div class="tabs">' + tabs + '</div>' +
      '<div class="card"><div class="layer-head">' +
      '<div><span class="muted tiny">Цена</span> <span class="price">' + esc(L.price) + '</span></div>' +
      delta(L) + '</div>' +
      '<div class="tiny muted">IV: ' + esc(L.iv.value) + ' · интервал: ' + esc(L.iv.interval) + ' (расчёт core/iv.py)</div>' +
      meta('1 день') + '</div>' +
      '<div class="grid-3" style="margin-top:16px">' +
      layerCard('Акция', L.stock) +
      layerCard('Фьючерс', L.fut) +
      layerCard('Опционы', L.opt) +
      '</div>' +
      '<div class="card card-accent-blue" style="margin-top:16px">' +
      rubric('Вместе') +
      '<p style="margin-top:10px">' + esc(L.together) + '</p>' + meta('1 день · неделя') + '</div>' +
      '<div class="card" style="margin-top:16px">' +
      rubric('Чего это не доказывает') +
      '<p class="muted" style="margin-top:10px">' + esc(L.notProof) + '</p>' +
      botbar() + '</div>';
  }

  /* ---------- Сценарии ---------- */

  function renderScenarios() {
    const rows = D.scenarios.map((s) =>
      '<a class="card" style="display:block;color:inherit;text-decoration:none" href="#/scenario/' + s.id + '">' +
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
      '<span class="tag">' + esc(s.id.toUpperCase()) + '</span>' +
      '<span class="tag">' + esc(s.ticker) + '</span>' +
      statusPill(s.status) +
      '<span class="tiny muted" style="margin-left:auto">горизонт: ' + esc(s.horizon) + '</span></div>' +
      '<h2 style="margin-top:10px">' + esc(s.title) + '</h2>' +
      '<p class="muted small">' + esc(s.basis) + '</p>' +
      '</a>'
    ).join('');

    return pageHead('Сценарии', 'Паспорта сценариев',
      'Основание, условие активации, условие отмены, горизонт и статус — всегда словами. Рубрика #IRIDA_сценарий.') +
      '<div class="stack">' + rows + '</div>' +
      '<div class="card"><div class="small muted">Статус обозначается словом, а не только цветом: «активен», «наблюдение», «подтверждён», «отменён». Обновления публикуются со ссылкой на исходный разбор (рубрика #IRIDA_обновление).</div>' +
      botbar() + '</div>';
  }

  function renderScenario(id) {
    const s = D.scenarios.find((x) => x.id === id);
    if (!s) return renderScenarios();

    const hist = s.history.map((h) =>
      '<div class="history-item"><div class="h-date">' + esc(h.date) + '</div>' +
      '<div class="small">' + esc(h.data) + '</div>' +
      '<div class="small" style="margin-top:4px"><span class="pill st-nabludenie">' + esc(h.status) + '</span></div>' +
      '</div>'
    ).join('');

    return pageHead('Сценарий', s.title, s.id.toUpperCase() + ' · ' + s.ticker) +
      '<div class="card">' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">' +
      '<span class="tag">' + esc(s.ticker) + '</span>' + statusPill(s.status) +
      '<span class="tiny muted">горизонт: ' + esc(s.horizon) + '</span></div>' +
      '<div class="passport" style="margin-top:14px">' +
      '<div class="k">Основание</div><div>' + esc(s.basis) + '</div>' +
      '<div class="k">Условие активации</div><div>' + esc(s.on) + '</div>' +
      '<div class="k">Условие отмены</div><div>' + esc(s.off) + '</div>' +
      '<div class="k">Горизонт</div><div>' + esc(s.horizon) + '</div>' +
      '<div class="k">Статус</div><div>' + esc(s.status) + '</div>' +
      '</div>' + meta(s.horizon) + '</div>' +
      '<div class="card">' + rubric('История изменений') +
      '<div style="margin-top:8px">' + hist + '</div>' +
      '<p class="tiny muted" style="margin-top:12px">Ошибка расчёта называется исправлением, а не изменением рыночной ситуации. Каждая запись ссылается на исходную публикацию.</p>' +
      botbar() + '</div>' +
      '<p style="margin-top:16px"><a href="#/scenarios" class="small">← Все сценарии</a></p>';
  }

  /* ---------- Проверка вывода ---------- */

  let currentCheck = (D.checks && D.checks[0]) ? D.checks[0].id : '';

  function renderCheck() {
    const chips = D.checks.map((c) =>
      '<button class="chip' + (c.id === currentCheck ? ' active' : '') + '" data-check="' + c.id + '"' +
      (c.id === currentCheck ? ' style="color:var(--text);border-color:var(--blue)"' : '') +
      '>' + esc(c.id) + '</button>'
    ).join('');

    const c = D.checks.find((x) => x.id === currentCheck) || D.checks[0] ||
      { id: '—', claim: '—', data: '—', calc: '—', notProof: '—' };

    return pageHead('Метод', 'Проверка вывода',
      'Разбор одного утверждения: что утверждаем, на каких данных, как рассчитано и чего это не доказывает. Аналог команды /proverka <id>.') +
      '<div class="card">' +
      rubric('Идентификатор вывода') +
      '<div class="chips">' + chips + '</div>' +
      '<div class="check-id-input"><input id="checkInput" placeholder="PRV-001" value="' + esc(c.id) + '">' +
      '<button class="btn" id="checkGo">Показать</button></div>' +
      '<div id="checkNotFound" class="tiny down" style="margin-top:6px;display:none">Вывод с таким id не найден в демо-наборе.</div>' +
      '</div>' +
      '<div class="card card-accent-blue">' +
      '<div class="passport">' +
      '<div class="k">Что утверждаем</div><div>' + esc(c.claim) + '</div>' +
      '<div class="k">На каких данных</div><div>' + esc(c.data) + '</div>' +
      '<div class="k">Как рассчитано</div><div>' + esc(c.calc) + '</div>' +
      '<div class="k">Чего это не доказывает</div><div class="muted">' + esc(c.notProof) + '</div>' +
      '</div>' + meta() + botbar() + '</div>';
  }

  /* ---------- Прогнозы и участники ---------- */

  function renderForecasts() {
    const f = D.forecasts || [];
    const p = D.participants || [];

    const rows = f.map((x) => {
      const target = x.target ? x.target.toLocaleString('ru-RU') + ' ₽' : '—';
      const range = (x.low && x.high)
        ? x.low.toLocaleString('ru-RU') + '–' + x.high.toLocaleString('ru-RU')
        : '—';
      const votes = (x.buy || x.hold || x.sell)
        ? x.buy + ' / ' + x.hold + ' / ' + x.sell
        : '—';
      const up = (x.upside === null || x.upside === undefined)
        ? '—'
        : (x.upside > 0 ? '+' : '') + String(x.upside).replace('.', ',') + ' %';
      const rsi = (x.rsi === null || x.rsi === undefined) ? '—' : String(x.rsi).replace('.', ',');
      return '<tr>' +
        '<td><b>' + esc(x.code) + '</b></td>' +
        '<td class="num">' + target + '</td>' +
        '<td class="num muted">' + range + '</td>' +
        '<td class="num">' + votes + '</td>' +
        '<td class="num">' + up + '</td>' +
        '<td class="num">' + rsi + '</td>' +
        '<td><span class="pill st-nabludenie">' + esc(x.consensus || '—') + '</span></td>' +
        '</tr>';
    }).join('');

    const prows = p.map((x) => {
      const fiz = (x.fiz_long || 0) - (x.fiz_short || 0);
      const yur = (x.yur_long || 0) - (x.yur_short || 0);
      const sign = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toLocaleString('ru-RU');
      return '<tr>' +
        '<td><b>' + esc(x.code) + '</b></td>' +
        '<td class="num up">' + sign(fiz) + '</td>' +
        '<td class="num down">' + sign(yur) + '</td>' +
        '<td class="num muted">' + (x.fiz_num || 0).toLocaleString('ru-RU') + ' / ' +
          (x.yur_num || 0).toLocaleString('ru-RU') + '</td>' +
        '<td class="num muted">' + esc(x.date || '—') + '</td>' +
        '</tr>';
    }).join('');

    const meta = f.length && f[0].date ? 'данные ' + f[0].date : '';

    return pageHead('Прогнозы', 'Что думают аналитики и участники',
      'Консенсус инвестдомов и позиции физлиц и юрлиц. Это не рекомендация ИРИДЫ: мы показываем, кто как устроен в бумаге.') +
      '<div class="card">' + rubric('Консенсус аналитиков') +
      '<div style="overflow-x:auto"><table class="tbl" style="margin-top:10px"><thead><tr>' +
      '<th>Бумага</th><th>Цель</th><th>Диапазон</th><th>Покуп/держ/прод</th><th>К цене</th><th>RSI</th><th>Итог</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:14px">Цель — средний ориентир инвестдомов на 12 месяцев. ' +
      'RSI-14 считает брокер. Консенсус не означает, что цена туда придёт.</p>' +
      meta2(meta) + '</div>' +
      '<div class="card" style="margin-top:16px">' + rubric('Участники фьючерса') +
      '<div style="overflow-x:auto"><table class="tbl" style="margin-top:10px"><thead><tr>' +
      '<th>Бумага</th><th>Физлица, нетто</th><th>Юрлица, нетто</th><th>Участников физ/юр</th><th>Срез</th>' +
      '</tr></thead><tbody>' + prows + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:14px">Нетто = лонг минус шорт. Физлица обычно в лонге, юрлица — в шорте: ' +
      'это структура хеджа, а не прогноз. Данные MOEX с задержкой 14 дней.</p>' +
      botbar() + '</div>' +
      renderFlow();
  }

  function renderFlow() {
    const f = D.flow || [];
    if (!f.length) {
      return '<div class="card" style="margin-top:16px">' + rubric('Давление по сделкам') +
        '<p class="small muted" style="margin-top:10px">Поток сделок пуст: ' +
        'он наполняется только в торговые часы.</p></div>';
    }

    const bar = (series) => series.map((p) => {
      if (p === null || p === undefined) return '<span class="muted">·</span>';
      if (p >= 40) return '<span class="up">▲</span>';
      if (p >= 15) return '<span class="up">△</span>';
      if (p <= -40) return '<span class="down">▼</span>';
      if (p <= -15) return '<span class="down">▽</span>';
      return '<span class="muted">·</span>';
    }).join('');

    const pct = (v) => {
      if (v === null || v === undefined) return '<span class="muted">—</span>';
      const cls = v > 15 ? 'up' : (v < -15 ? 'down' : 'muted');
      const sign = v > 0 ? '+' : (v < 0 ? '−' : '');
      return '<span class="' + cls + '">' + sign + Math.abs(Math.round(v)) + ' %</span>';
    };

    const rows = f.map((x) => '<tr>' +
      '<td><b>' + esc(x.code) + '</b><br><span class="small muted">' +
        (x.price || 0).toLocaleString('ru-RU') + ' ₽</span></td>' +
      '<td class="num">' + pct(x.w5) + '<br><span class="small muted">1м ' +
        pct(x.w1) + '</span></td>' +
      '<td><span style="font-size:12px;letter-spacing:0;white-space:nowrap">' +
        bar(x.series || []) + '</span><br><span class="small muted">' +
        (x.verdict || '—') + '</span></td>' +
      '</tr>').join('');

    return '<div class="card" style="margin-top:16px">' + rubric('Давление по сделкам') +
      '<div style="overflow-x:auto"><table class="tbl" style="margin-top:10px">' +
      '<thead><tr><th>Бумага</th><th>Дельта 5 мин</th><th>15 минут и вывод</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:14px">Дельта — купленные минус проданные лоты, ' +
      'в процентах от объёма окна. Плюс: перевес покупателей, минус: продавцов. ' +
      '«Поглощение» — одна сторона давит, а цена стоит: встречные заявки впитывают объём. ' +
      'Это не прогноз: крупный игрок может давить и для набора, и для выхода.</p>' +
      '</div>';
  }

  const meta2 = (note) => note
    ? '<div class="meta"><span>Данные: T-Invest MCP · ' + esc(note) + '</span></div>'
    : '';

  /* ---------- Стены ---------- */

  function renderWalls() {
    const rows = D.walls.map((w) => {
      const span = w.r2 - w.s2;
      const pos = Math.max(0, Math.min(100, ((w.price - w.s2) / span) * 100));
      return '<tr>' +
        '<td><b>' + esc(w.ticker) + '</b></td>' +
        '<td class="num">' + w.price.toLocaleString('ru-RU') + '</td>' +
        '<td class="num muted">' + w.s2.toLocaleString('ru-RU') + '</td>' +
        '<td class="num">' + w.s1.toLocaleString('ru-RU') + '</td>' +
        '<td class="num">' + w.r1.toLocaleString('ru-RU') + '</td>' +
        '<td class="num muted">' + w.r2.toLocaleString('ru-RU') + '</td>' +
        '<td><div class="rangebar"><div class="mark" style="left:' + pos.toFixed(1) + '%"></div></div></td>' +
        '</tr>';
    }).join('');

    return pageHead('Стены', 'Уровни поддержки и сопротивления',
      'Аналог команды /steny: рабочие зоны объёмного профиля и положение цены между ними.') +
      '<div class="card"><table class="tbl"><thead><tr>' +
      '<th>Инструмент</th><th>Цена</th><th>S2</th><th>S1</th><th>R1</th><th>R2</th><th>Положение</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="small muted" style="margin-top:14px">' + esc(D.wallsNote) + '</p>' +
      meta('60 сеансов') + botbar() + '</div>';
  }

  /* ---------- Тренд ---------- */

  function renderTrend() {
    const cards = D.trends.map((t) =>
      '<div class="card"><div class="layer-head"><h3 style="margin:0">' + esc(t.ticker) + '</h3>' +
      '<span class="tiny muted">аналог /trend</span></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">' +
      '<span class="pill st-nabludenie">день: ' + esc(t.day) + '</span>' +
      '<span class="pill st-nabludenie">неделя: ' + esc(t.week) + '</span>' +
      '<span class="pill st-nabludenie">месяц: ' + esc(t.month) + '</span></div>' +
      '<p class="small muted">' + esc(t.basis) + '</p></div>'
    ).join('');

    return pageHead('Тренд', 'Направление по горизонтам',
      'Тренд указывается словом и горизонтом: направление на разных сроках может не совпадать — это нормально.') +
      '<div class="grid-2">' + cards + '</div>' +
      '<div class="card">' + botbar() + '</div>';
  }

  /* ---------- Новости ---------- */

  function renderNews() {
    const items = D.news.map((n) =>
      '<div class="news-item"><div class="head">' +
      '<span class="time">' + esc(n.time) + '</span>' +
      '<span class="tag">' + esc(n.tag) + '</span></div>' +
      '<h3>' + esc(n.title) + '</h3>' +
      '<div class="why">' + esc(n.why) + '</div>' +
      (n.link ? '<a class="tiny" href="' + esc(n.link) + '" target="_blank" rel="noopener">Открыть первоисточник</a>' : '') +
      '</div>'
    ).join('');

    return pageHead('Лента', 'Новости',
      'Аналог команды /news: заголовки, тема и ссылка на первоисточник. ИРИДА не перепечатывает тексты.') +
      '<div class="card">' + items + meta('сегодня') + botbar() + '</div>';
  }

  /* ---------- Банки ---------- */

  function renderBanks() {
    const rows = D.banks.rows.map((r) =>
      '<tr><td><b>' + esc(r[0]) + '</b></td><td class="num">' + esc(r[1]) + '</td><td class="num muted">' + esc(r[2]) + '</td></tr>'
    ).join('');

    return pageHead('Лента', 'Банки и ставка',
      (D.banks.lead || 'Аналог команды /banki: связь банковских бумаг и относительная сила.')) +
      '<div class="grid-2">' +
      '<div class="card">' + rubric(D.banks.kpiTitle || 'Ключевая ставка') +
      '<div class="val" style="font-size:34px;font-weight:800;margin:10px 0 4px">' + esc(D.banks.kpiValue || D.banks.keyRate) + '</div>' +
      '<p class="small muted">' + esc(D.banks.kpiNote || D.banks.meeting) + '</p>' + meta() + '</div>' +
      '<div class="card">' + rubric(D.banks.title || 'Депозиты, витрина') +
      '<table class="tbl" style="margin-top:10px"><thead><tr><th>Банк</th>' +
      (D.banks.cols || ['6 мес', '12 мес']).map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead>' +
      '<tbody>' + rows + '</tbody></table>' + meta() + '</div>' +
      '</div>' +
      '<div class="card"><p class="small muted">' + esc(D.banks.note) + '</p>' + botbar() + '</div>';
  }

  /* ---------- Итоги ---------- */

  function renderItogi() {
    const li = (arr, mark) => '<ul class="plain">' + arr.map((t) => '<li class="' + (mark || '') + '">' + esc(t) + '</li>').join('') + '</ul>';

    return pageHead('Итоги', 'Итоги дня',
      'Аналог команды /itogi: день по трём слоям, изменения статусов и план на завтра.') +
      '<div class="grid-3">' +
      '<div class="card">' + rubric('Акция') + '<div style="margin-top:10px">' + li(D.itogi.layers.stock, 'mark-blue') + '</div></div>' +
      '<div class="card">' + rubric('Фьючерс') + '<div style="margin-top:10px">' + li(D.itogi.layers.fut, 'mark-blue') + '</div></div>' +
      '<div class="card">' + rubric('Опционы') + '<div style="margin-top:10px">' + li(D.itogi.layers.opt, 'mark-blue') + '</div></div>' +
      '</div>' +
      '<div class="card">' + rubric('Изменения статусов сценариев') +
      '<div style="margin-top:10px">' + li(D.itogi.scenarioChanges) + '</div>' +
      '<p class="tiny muted" style="margin-top:10px">Дата итогов: ' + esc(D.itogi.date) + (D.live ? '.' : ' (демо).') + '</p></div>' +
      '<div class="card">' + rubric('План на завтра') +
      '<div style="margin-top:10px">' + li(D.itogi.tomorrow, 'mark-gold') + '</div>' +
      meta('1 день') + botbar() + '</div>';
  }

  /* ---------- Спросить Ириду (чат-мок) ---------- */

  const chatLog = [];

  function botAnswer(raw) {
    const t = raw.toLowerCase();
    const tickers = Object.keys(D.layers);
    const tk = tickers.find((k) => t.includes(k.toLowerCase()));

    if (t.startsWith('/start')) return { role: 'навигация', text: 'Здравствуйте. Я Ирида.\nГлавное меню: картина рынка, три слоя, сценарии, стены, тренд, новости, банки, итоги, проверка вывода.\nСвободным текстом тоже можно — я сама выберу роль.' };
    if (t.startsWith('/help')) return { role: 'справка', text: D.method.commands.map((c) => c[0] + ' — ' + c[1]).join('\n') };
    if (t.startsWith('/legal')) return { role: 'правовое', text: D.method.legal };
    if (t.startsWith('/steny')) return { role: 'стены', text: 'Стены (демо):\n' + D.walls.map((w) => w.ticker + ': S ' + w.s2 + ' / ' + w.s1 + ' · R ' + w.r1 + ' / ' + w.r2).join('\n') + '\nПолная таблица — на экране «Стены».' };
    if (t.startsWith('/trend')) return { role: 'тренд', text: 'Тренд (демо):\n' + D.trends.map((x) => x.ticker + ': день ' + x.day + ', неделя ' + x.week + ', месяц ' + x.month).join('\n') };
    if (t.startsWith('/news')) return { role: 'новости', text: 'Свежее (демо):\n' + D.news.slice(0, 3).map((n) => n.time + ' ' + n.title).join('\n') };
    if (t.startsWith('/banki')) return { role: 'банки', text: 'Ключевая ставка: ' + D.banks.keyRate + ' (демо).\nВитрина депозитов — на экране «Банки».' };
    if (t.startsWith('/itogi')) return { role: 'итоги', text: 'Итоги ' + D.itogi.date + ' (демо):\n' + D.itogi.layers.stock[0] + '\n' + D.itogi.layers.fut[0] + '\n' + D.itogi.layers.opt[0] };
    if (t.startsWith('/proverka')) return { role: 'проверка вывода', text: 'Доступные id в демо: ' + D.checks.map((c) => c.id).join(', ') + '.\nОткройте экран «Проверка вывода» и выберите id.' };
    if (t.startsWith('/nastroy')) return { role: 'настройки', text: 'В демо-интерфейсе настройки отключены. В боевом боте /nastroy управляет инструментами, уведомлениями и временем сводки.' };
    if (t.startsWith('/delete')) return { role: 'данные', text: 'Запрос на удаление данных в демо не выполняется. В боевом боте /delete удаляет ваши данные из системы.' };

    if (tk) {
      const L = D.layers[tk];
      return { role: 'три слоя · ' + tk, text: tk + ' (' + L.price + ', демо).\nАкция: ' + L.stock[0] + '\nФьючерс: ' + L.fut[0] + '\nОпционы: ' + L.opt[0] + '\nВместе: ' + L.together };
    }
    if (t.includes('сценар')) return { role: 'сценарии', text: 'Активные сценарии (демо):\n' + D.activeScenariosShort.map((s) => s.id.toUpperCase() + ' ' + s.ticker + ' — ' + s.title + ' · ' + s.status).join('\n') };
    if (t.includes('стен') || t.includes('уровн')) return { role: 'стены', text: 'Ближайшие стены SBER (демо): поддержка 296,0, сопротивление 308,5. Полная таблица — экран «Стены».' };
    if (t.includes('новост')) return { role: 'новости', text: D.news[0].time + ' ' + D.news[0].title + '\n' + D.news[0].why };
    if (t.includes('ставк') || t.includes('банк')) return { role: 'банки', text: 'Ключевая ставка ' + D.banks.keyRate + ' (демо). ' + D.banks.meeting + '.' };
    if (t.includes('итог')) return { role: 'итоги', text: 'Итоги ' + D.itogi.date + ' (демо): ' + D.itogi.layers.stock[0] };
    if (t.includes('iv') || t.includes('волат')) return { role: 'опционы', text: 'IV SBER 32 %, интервал 30–38 % (демо, расчёт core/iv.py). Снижение с 36 % за неделю.' };

    return { role: 'метод', text: 'Я поняла вопрос свободно и выбрала роль «метод» (демо).\nВ боевом режиме я сама определяю роль: три слоя, сценарии, стены, тренд, новости, банки, итоги или проверка вывода.\nПопробуйте: «SBER», «сценарии», «ставки», «итоги» или команду /help.' };
  }

  function chatBubble(m) {
    if (m.who === 'user') {
      return '<div class="msg user"><div class="bubble">' + esc(m.text) + '</div></div>';
    }
    return '<div class="msg bot"><div class="ava">' + LOGO_GOLD_ARROW + '</div>' +
      '<div class="bubble"><span class="role">Ирида · ' + esc(m.role || '') + '</span>' + esc(m.text) + '</div></div>';
  }

  function renderAsk() {
    if (D.live) {
      return pageHead('Бот', 'Спросить Ириду',
        'Диалог живёт в боте: там движок выбирает роль, считает числа и проверяет вывод.') +
        '<div class="card card-accent-blue">' +
        '<p class="small">Панель показывает расчёты. Свободный вопрос, разбор по инструменту и проверка вывода — в боте: он принимает текст, команды и кнопки меню.</p>' +
        '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<a class="btn btn-gold" href="' + D.botUrl + '" target="_blank" rel="noopener">Открыть бота</a>' +
        '<a class="btn btn-ghost-blue" href="' + D.channelUrl + '" target="_blank" rel="noopener">Канал</a>' +
        '</div>' + meta() + '</div>';
    }
    if (!chatLog.length) {
      chatLog.push({ who: 'bot', role: 'навигация', text: 'Здравствуйте. Это демо-интерфейс диалога: ответы формируются локально из демо-данных.\nСпросите свободным текстом или выберите команду ниже.' });
    }
    const chips = ['/start', '/trend', '/steny', '/news', '/banki', '/itogi', '/proverka', '/legal', '/help']
      .map((c) => '<button class="chip" data-cmd="' + c + '">' + esc(c) + '</button>').join('');

    return pageHead('Бот', 'Спросить Ириду',
      'Диалоговое окно бота: свободный текст или команды. Ирида сама выбирает роль ответа.') +
      '<div class="card">' +
      '<div class="chat" id="chat">' + chatLog.map(chatBubble).join('') + '</div>' +
      '<div class="chat-input"><input id="chatText" placeholder="Например: SBER, сценарии, ставки… или /help">' +
      '<button class="btn btn-gold" id="chatSend">Отправить</button></div>' +
      '<div class="chips">' + chips + '</div>' +
      '<p class="tiny muted" style="margin-top:14px">Демо: без обращения к движку и GigaChat. В боевом режиме ответы приходят от IRIDA_AI_ENGINE.</p>' +
      '</div>';
  }

  function wireAsk(view) {
    const send = () => {
      const input = $('#chatText', view);
      const text = (input.value || '').trim();
      if (!text) return;
      chatLog.push({ who: 'user', text: text });
      const a = botAnswer(text);
      chatLog.push({ who: 'bot', role: a.role, text: a.text });
      render(); // перерисовка сохранит позицию маршрута
      const chat = $('#chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
      const ni = $('#chatText');
      if (ni) ni.focus();
    };
    $('#chatSend', view).addEventListener('click', send);
    $('#chatText', view).addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    $$('.chip[data-cmd]', view).forEach((ch) => ch.addEventListener('click', () => {
      chatLog.push({ who: 'user', text: ch.dataset.cmd });
      const a = botAnswer(ch.dataset.cmd);
      chatLog.push({ who: 'bot', role: a.role, text: a.text });
      render();
      const chat = $('#chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }));
  }

  /* ---------- Метод и справки ---------- */

  function renderMethod() {
    const rub = D.method.rubrics.map((r) =>
      '<tr><td><span class="tag">' + esc(r[0]) + '</span></td><td>' + esc(r[1]) + '</td></tr>').join('');
    const cmd = D.method.commands.map((c) =>
      '<tr><td><span class="kbd">' + esc(c[0]) + '</span></td><td>' + esc(c[1]) + '</td></tr>').join('');
    const pr = D.method.principles.map((p) => '<li class="mark-blue">' + esc(p) + '</li>').join('');

    return pageHead('Метод', 'Метод, рубрики и справки',
      'Правила дома IRIDA: форматы публикаций, принципы оформления и команды бота.') +
      '<div class="card">' + rubric('Рубрики и теги') +
      '<table class="tbl" style="margin-top:10px"><tbody>' + rub + '</tbody></table></div>' +
      '<div class="card">' + rubric('Принципы') +
      '<ul class="plain" style="margin-top:10px">' + pr + '</ul></div>' +
      '<div class="card">' + rubric('Команды бота', true) +
      '<table class="tbl" style="margin-top:10px"><tbody>' + cmd + '</tbody></table>' +
      botbar() + '</div>' +
      '<div class="card">' + rubric('Правовая информация') +
      '<p class="small muted" style="margin-top:10px">' + esc(D.method.legal) + '</p></div>';
  }

  /* ============================================================
     РОУТЕР
     ============================================================ */

  const routes = [
    { path: '/overview',  title: 'Картина рынка',  fn: renderOverview },
    { path: '/layers',    title: 'Три слоя',       fn: renderLayers },
    { path: '/scenarios', title: 'Сценарии',       fn: renderScenarios },
    { path: '/check',     title: 'Проверка вывода', fn: renderCheck },
    { path: '/forecasts', title: 'Прогнозы и участники', fn: renderForecasts },
    { path: '/walls',     title: 'Стены',          fn: renderWalls },
    { path: '/trend',     title: 'Тренд',          fn: renderTrend },
    { path: '/news',      title: 'Новости',        fn: renderNews },
    { path: '/banks',     title: 'Банки',          fn: renderBanks },
    { path: '/itogi',     title: 'Итоги',          fn: renderItogi },
    { path: '/ask',       title: 'Спросить Ириду', fn: renderAsk },
    { path: '/method',    title: 'Метод и справки', fn: renderMethod }
  ];

  function currentRoute() {
    const hash = location.hash.replace(/^#/, '') || '/overview';
    const m = hash.match(/^\/scenario\/([\w-]+)/);
    if (m) return { name: '/scenario', arg: m[1], hash: hash };
    const r = routes.find((x) => x.path === hash);
    return { name: r ? r.path : '/overview', arg: null, hash: r ? r.path : '/overview' };
  }

  function render() {
    const route = currentRoute();
    const view = $('#view');
    let html = '';

    if (route.name === '/scenario') html = renderScenario(route.arg);
    else {
      const r = routes.find((x) => x.path === route.name);
      html = r.fn();
    }

    view.innerHTML = html;
    document.title = 'IRIDA · ' + (route.name === '/scenario' ? 'Сценарий' : (routes.find((x) => x.path === route.name) || {}).title);

    /* активный пункт навигации */
    $$('.nav a').forEach((a) => {
      const href = a.getAttribute('href').replace(/^#/, '');
      const active = href === route.hash ||
        (href === '/scenarios' && route.name === '/scenario');
      a.classList.toggle('active', active);
    });

    /* интерактив экрана */
    if (route.name === '/layers') {
      $$('.tab[data-ticker]', view).forEach((b) => b.addEventListener('click', () => {
        currentTicker = b.dataset.ticker;
        render();
      }));
    }
    if (route.name === '/check') {
      $$('.chip[data-check]', view).forEach((b) => b.addEventListener('click', () => {
        currentCheck = b.dataset.check;
        render();
      }));
      const go = () => {
        const v = ($('#checkInput', view).value || '').trim().toUpperCase();
        const found = D.checks.find((c) => c.id === v);
        if (found) { currentCheck = v; render(); }
        else { const nf = $('#checkNotFound', view); if (nf) nf.style.display = 'block'; }
      };
      $('#checkGo', view).addEventListener('click', go);
      $('#checkInput', view).addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    }
    if (route.name === '/ask') wireAsk(view);
  }

  window.addEventListener('hashchange', render);

  async function boot() {
    D = await window.IRIDA_API.load();

    const flag = document.querySelector('.demo-flag');
    if (flag) {
      flag.innerHTML = '<span class="dot"></span>' + (D.live ? 'живые данные' : 'демо-данные');
    }
    const foot = document.getElementById('legalFoot');
    if (foot && D.method && D.method.legal) {
      foot.innerHTML = '<span>' + esc(D.method.legal) + '</span>' +
        '<span class="tiny">' + esc(D.asOf || '') + ' · версия ' + esc(D.version || '') + '</span>';
    }

    render();

    if (D.live) {
      setInterval(async () => {
        D = await window.IRIDA_API.load();
        render();
      }, 5 * 60 * 1000);
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
