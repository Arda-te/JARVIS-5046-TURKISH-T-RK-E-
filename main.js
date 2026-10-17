const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

let win;
const dataPath = () => path.join(app.getPath('userData'), 'jarvis-settings.json');
function readData() {
  try { return JSON.parse(fs.readFileSync(dataPath(), 'utf8')); }
  catch { return { apiKey: '', model: 'openai/gpt-oss-120b', apps: [], history: [], voice: true, speakReplies: true }; }
}
function writeData(data) { fs.mkdirSync(path.dirname(dataPath()), { recursive: true }); fs.writeFileSync(dataPath(), JSON.stringify(data, null, 2), 'utf8'); }
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1020, minHeight: 700,
    backgroundColor: '#050910', title: 'JARVIS 5046',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile('index.html');
}
app.whenReady().then(() => { createWindow(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('settings:get', () => { const d = readData(); return { ...d, apiKey: d.apiKey ? '••••••••' : '' }; });
ipcMain.handle('settings:save', (_e, patch) => {
  const d = readData();
  if (typeof patch.apiKey === 'string' && patch.apiKey && !patch.apiKey.includes('••••')) d.apiKey = patch.apiKey.trim();
  if (typeof patch.model === 'string' && patch.model.trim()) d.model = patch.model.trim();
  if (typeof patch.speakReplies === 'boolean') d.speakReplies = patch.speakReplies;
  if (typeof patch.voice === 'boolean') d.voice = patch.voice;
  writeData(d); return { ok: true, hasApiKey: !!d.apiKey, model: d.model, speakReplies: d.speakReplies, voice: d.voice };
});
ipcMain.handle('ai:chat', async (_e, messages) => {
  const d = readData();
  if (!d.apiKey) throw new Error('Önce Ayarlar bölümüne Groq API anahtarını ekle.');
  const safeMessages = Array.isArray(messages) ? messages.slice(-20).map(m => ({ role: ['user','assistant','system'].includes(m.role) ? m.role : 'user', content: String(m.content || '').slice(0, 12000) })) : [];
  if (!safeMessages.some(m => m.role === 'user')) throw new Error('Önce bir mesaj yaz.');
  const system = { role: 'system', content: 'Sen JARVIS 5046 adlı ileri seviye, güvenilir, Türkçe konuşan masaüstü yapay zekâ asistanısın. Kısa, açık ve faydalı cevap ver. Bilgisayarda gerçekten bir eylem gerçekleştirmediysen gerçekleştirdim deme. Kullanıcının API anahtarını asla açıklama. Tehlikeli veya yıkıcı sistem işlemlerinde kullanıcıyı uyar.' };
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${d.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: d.model || 'openai/gpt-oss-120b', messages: [system, ...safeMessages], temperature: 0.65, max_tokens: 1200 })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Groq API hatası: ${response.status}. Ayarlar bölümünden model adını kontrol et.`);
  const answer = body?.choices?.[0]?.message?.content;
  if (!answer) throw new Error('Yapay zekâ boş yanıt döndürdü.');
  return { answer, model: d.model };
});
ipcMain.handle('apps:pick', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Uygulama veya oyun seç', properties: ['openFile'], filters: [{ name: 'Windows uygulamaları', extensions: ['exe', 'lnk', 'bat', 'cmd'] }, { name: 'Tüm dosyalar', extensions: ['*'] }] });
  if (r.canceled || !r.filePaths[0]) return null;
  const file = r.filePaths[0]; const d = readData();
  if (!d.apps.some(a => a.path.toLowerCase() === file.toLowerCase())) d.apps.push({ id: Date.now().toString(36), name: path.basename(file, path.extname(file)), path: file });
  writeData(d); return d.apps;
});
ipcMain.handle('apps:list', () => readData().apps || []);
ipcMain.handle('apps:remove', (_e, id) => { const d = readData(); d.apps = (d.apps || []).filter(a => a.id !== id); writeData(d); return d.apps; });
ipcMain.handle('apps:launch', async (_e, id) => {
  const d = readData(); const item = (d.apps || []).find(a => a.id === id);
  if (!item) throw new Error('Uygulama bulunamadı.');
  if (!fs.existsSync(item.path)) throw new Error('Dosya bulunamadı: ' + item.path);
  if (item.path.toLowerCase().endsWith('.lnk')) { await shell.openPath(item.path); return true; }
  const child = spawn(item.path, [], { detached: true, stdio: 'ignore', windowsHide: false }); child.on('error', e => { if (win) win.webContents.send('app:error', e.message); }); child.unref(); return true;
});
ipcMain.handle('shortcut:create', async () => {
  if (process.platform !== 'win32') throw new Error('Masaüstü kısayolu bu özellikte Windows için hazırlanmıştır.');
  const desktop = app.getPath('desktop'); const exe = process.execPath; const shortcut = path.join(desktop, 'JARVIS 5046.lnk');
  const ps = `$s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcut.replace(/'/g, "''")}');$s.TargetPath='${exe.replace(/'/g, "''")}';$s.WorkingDirectory='${path.dirname(exe).replace(/'/g, "''")}';$s.Description='JARVIS 5046 AI Assistant';$s.Save()`;
  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true, stdio: 'ignore' });
  return await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => code === 0 ? resolve({ ok: true, path: shortcut }) : reject(new Error('Kısayol oluşturulamadı.'))); });
});
ipcMain.handle('system:info', () => ({ platform: process.platform, version: app.getVersion(), appName: app.getName(), userData: app.getPath('userData'), memory: Math.round(process.memoryUsage().rss / 1024 / 1024) }));
ipcMain.handle('external:open', async (_e, url) => { if (typeof url !== 'string' || !/^https:\/\//i.test(url)) throw new Error('Yalnızca güvenli HTTPS bağlantıları açılabilir.'); await shell.openExternal(url); return true; });
