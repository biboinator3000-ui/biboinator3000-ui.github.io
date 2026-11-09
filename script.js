(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const ui = {
    server: byId('server-name'), map: byId('map-name'), gamemode: byId('gamemode'),
    slots: byId('max-players'), status: byId('loading-status'), connection: byId('connection-label'),
    number: byId('progress-number'), fill: byId('progress-fill'), track: byId('progress-track'),
    fileCount: byId('file-count'), currentFile: byId('current-file'), tip: byId('tip-text'), tipCounter: byId('tip-counter')
  };

  const state = { total: null, needed: null, currentFile: '', status: 'Устанавливаем соединение с сервером...' };
  const tips = [
    'Изучите правила сервера перед началом игры.',
    'Общение с другими игроками — важная часть игрового процесса.',
    'Не забывайте следить за окружающей обстановкой и событиями города.',
    'Уважайте других игроков и старайтесь решать конфликты мирно.',
    'Подсказки и команды сервера можно найти в меню помощи.'
  ];
  let tipIndex = 0;

  function cleanText(value, maxLength = 180) {
    return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
  }

  function updateProgress() {
    const hasCounts = Number.isFinite(state.total) && state.total > 0 && Number.isFinite(state.needed);
    ui.track.classList.toggle('indeterminate', !hasCounts);

    if (!hasCounts) {
      ui.number.innerHTML = '—<small>%</small>';
      ui.fileCount.textContent = 'ОЖИДАНИЕ ДАННЫХ СЕРВЕРА';
      ui.track.setAttribute('aria-valuenow', '0');
      return;
    }

    const total = Math.max(0, state.total);
    const needed = Math.min(total, Math.max(0, state.needed));
    const done = total - needed;
    const percent = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
    ui.fill.style.width = `${percent}%`;
    ui.number.innerHTML = `${percent}<small>%</small>`;
    ui.fileCount.textContent = `ЗАГРУЖЕНО ${done} ИЗ ${total} ФАЙЛОВ`;
    ui.track.setAttribute('aria-valuenow', String(percent));
  }

  function setCurrentFile(value) {
    const file = cleanText(value, 140);
    state.currentFile = file;
    ui.currentFile.textContent = file ? `ФАЙЛ: ${file}` : 'ПОДГОТОВКА';
    ui.currentFile.title = file;
  }

  function setStatus(value) {
    const status = cleanText(value, 220);
    if (!status) return;
    state.status = status;
    ui.status.textContent = status;
    ui.connection.textContent = 'ПОДКЛЮЧЕНИЕ К СЕРВЕРУ';
  }

  // Garry's Mod loading-screen callbacks.
  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    const name = cleanText(servername, 90);
    const map = cleanText(mapname, 70);
    const mode = cleanText(gamemode, 60);
    const slots = Number(maxplayers);
    if (name) ui.server.textContent = name;
    if (map) ui.map.textContent = map.toUpperCase();
    if (mode) ui.gamemode.textContent = mode.toUpperCase();
    if (Number.isFinite(slots) && slots > 0) ui.slots.textContent = String(slots);
    ui.connection.textContent = 'СЕРВЕР НАЙДЕН';
    setStatus('Получаем информацию о сервере...');
  };

  window.SetFilesTotal = function (total) {
    const value = Number(total);
    if (!Number.isFinite(value) || value < 0) return;
    state.total = Math.floor(value);
    if (state.needed === null) state.needed = state.total;
    updateProgress();
  };

  window.SetFilesNeeded = function (needed) {
    const value = Number(needed);
    if (!Number.isFinite(value) || value < 0) return;
    state.needed = Math.floor(value);
    updateProgress();
  };

  window.DownloadingFile = function (fileName) {
    setCurrentFile(fileName);
    setStatus('Загрузка файлов сервера...');
  };

  window.SetStatusChanged = function (status) {
    setStatus(status);
  };

  // Optional preview values for opening index.html in a normal browser.
  // Real Garry's Mod callback data replaces these when the client connects.
  const params = new URLSearchParams(window.location.search);
  const param = (key) => params.get(key) || params.get(key.toLowerCase()) || '';
  const previewMap = cleanText(param('Map'), 70);
  if (previewMap) ui.map.textContent = previewMap.toUpperCase();
  if (param('ServerName')) ui.server.textContent = cleanText(param('ServerName'), 90);

  // Ambient dust motes: decorative only, with a small fixed element count.
  const particleRoot = byId('particles');
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${(i * 37 + 11) % 100}%`;
    particle.style.setProperty('--duration', `${13 + ((i * 7) % 15)}s`);
    particle.style.setProperty('--delay', `${-((i * 3) % 24)}s`);
    particle.style.opacity = String(0.18 + ((i * 13) % 35) / 100);
    particleRoot.appendChild(particle);
  }

  function showNextTip() {
    ui.tip.style.opacity = '0';
    window.setTimeout(() => {
      tipIndex = (tipIndex + 1) % tips.length;
      ui.tip.textContent = tips[tipIndex];
      ui.tipCounter.textContent = `СОВЕТ ${String(tipIndex + 1).padStart(2, '0')}`;
      ui.tip.style.opacity = '1';
    }, 250);
  }
  ui.tip.style.transition = 'opacity .25s ease';
  window.setInterval(showNextTip, 7000);

  updateProgress();
})();
