# 🚀 Guida Multiplayer Online - Sasso Carta Forbici

Hai trovato il problema: **GitHub Pages è hosting statico** e non può eseguire il server Node.js. Ecco come risolvere!

---

## 🔧 Soluzione 1: Test Locale su LAN (Più Semplice)

Perfetto se vuoi testare con due PC su **la stessa rete domestica/aziendale**.

### Step 1: Avvia il Server sulla Macchina 1
```bash
cd provacopilot
npm install
npm start
```
Il server è ora in ascolto su `http://localhost:3000`

### Step 2: Ottieni l'IP della Macchina 1
**Windows (PowerShell):**
```powershell
ipconfig
```
Cerca `IPv4 Address` (es: `192.168.1.100`)

**Mac/Linux (Terminal):**
```bash
ifconfig
```
Cerca `inet` (es: `192.168.1.100`)

### Step 3: Apri su Due Browser
- **PC 1:** `http://localhost:3000`
- **PC 2:** `http://192.168.1.100:3000` (sostituisci 192.168.1.100 con l'IP della Macchina 1)

### Step 4: Configura Server Online
1. Nel gioco, clicca il bottone ⚙️ (Configurazione Server)
2. Su **PC 1**: Il server è già a `http://localhost:3000`
3. Su **PC 2**: Incolla `http://192.168.1.100:3000` e clicca "Salva & Connetti"

### Step 5: Gioca!
1. Scegli "Online" in entrambi i browser
2. I due player verranno abbinati automaticamente
3. Gioca la serie!

**⚠️ Nota:** Entrambi i PC devono essere sulla stessa rete

---

## 🌐 Soluzione 2: Deploy su Railway (Gratis & Online)

Puoi giocare da qualsiasi posto del mondo!

### Step 1: Crea Account su Railway
1. Vai su [railway.app](https://railway.app)
2. Clicca "Login with GitHub"
3. Autorizza Railway

### Step 2: Deploy del Progetto
1. Pushpa il tuo progetto su GitHub (se non l'hai già fatto)
   ```bash
   git init
   git add .
   git commit -m "Sasso Carta Forbici multiplayer"
   git push origin main
   ```

2. Su Railway:
   - Clicca "+ New Project"
   - Scegli "Deploy from GitHub"
   - Seleziona il repository `provacopilot`
   - Scegli il branch `main`

3. Railway automaticamente:
   - Rileva `package.json`
   - Esegue `npm install`
   - Avvia `npm start` (vedi `server.js`)

### Step 3: Ottieni l'URL Pubblico
Nella dashboard di Railway:
- Vai nella scheda "Deployments"
- Troverai un URL come `https://provacopilot-production.up.railway.app`
- Copia questo URL

### Step 4: Configura il Server nel Gioco
1. Nel gioco, clicca il bottone ⚙️
2. Incolla l'URL di Railway: `https://provacopilot-production.up.railway.app`
3. Clicca "Salva & Connetti"

### Step 5: Condividi & Gioca!
- Condividi il link GitHub Pages con l'amico
- Tu: Configura il server con l'URL di Railway
- Amico: Configura il server con lo stesso URL di Railway
- Entrambi scegli "Online"
- Cliccate contemporaneamente e vi abbinerete automaticamente!

---

## 🔗 Deployment Alternativi (Free)

Se Railway non ti piace, prova:

### Render.com
1. Vai su [render.com](https://render.com)
2. Crea account
3. New → Web Service
4. Connetti il repository GitHub
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Deploy!

### Heroku (Freemium, con limiti)
1. Vai su [heroku.com](https://heroku.com)
2. Crea account e app
3. Connetti GitHub
4. Deploy automatico
5. Ottieni URL pubblico

---

## 🧪 Troubleshooting

### "Server non configurato"
- Clicca ⚙️
- Seleziona "Usa Localhost (LAN)" per test locale
- O incolla l'URL di Railway se deployato

### "Errore di connessione"
- Verifica che l'URL sia raggiungibile da browser
- Controlla firewall/porte
- Prova a refresh `F5`

### "Due giocatori non si trovano"
- Entrambi devono cliccare "Online" contemporaneamente
- Verificate di usare lo **stesso server URL**
- Controllate console del browser (F12) per errori

### Server local non funziona
- Assicurati di aver eseguito `npm install` e `npm start`
- Controlla che nessum'altra app usi la porta 3000
- Prova `lsof -i :3000` (Mac/Linux) per vedere cosa usa la porta

---

## 📝 Riepilogo Comandi

### Test Locale
```bash
cd provacopilot
npm install
npm start
# Apri http://localhost:3000 e http://192.168.x.y:3000 da due PC
```

### Deploy Railway
```bash
# Solo pushare su GitHub, Railway farà il resto
git push origin main
# Poi configura nel gioco con l'URL di Railway
```

---

## 💡 Prossimi Step

Una volta che il multiplayer funziona:
- Aggiungi leaderboard globale
- Trofei/Achievement per serie vinte
- Chat tra giocatori
- Stanze private con password

Divertiti! 🎮✨
