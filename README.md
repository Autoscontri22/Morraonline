# 🎮 Sasso Carta Forbici - Gioco Online

Un gioco interattivo in HTML/CSS/JavaScript che permette di giocare a Sasso Carta Forbici contro il computer. Perfetto da giocare su desktop, tablet e smartphone!

## ✨ Features

### 🔐 Autenticazione & Profilo
- **Registrazione** con validazione password forte
- **Login** sicuro con persistenza dati
- **Profilo utente** con statistiche personali
- **Log delle attività** di accesso

### 🎮 Gioco
- **Serie al meglio di 3** con tracking in tempo reale
- **Animazioni fluide** e feedback visivi coinvolgenti
- **Effetti celebrativi** con confetti al raggiungimento della vittoria
- **Round-by-round** detailed view con emoji e risultati

### 📊 Cronologia & Statistiche
- **Salvataggio automatico** di tutte le partite
- **Cronologia completa** con date e risultati
- **Statistiche personali** (vittorie, sconfitte, pareggi, percentuale di vittoria)
- **Ultimo 100 match** conservati

### 📱 Ottimizzazioni Mobile
- **Fully Responsive** - funziona perfettamente su smartphone, tablet e desktop
- **Touch-friendly** - bottoni grandi e facilmente cliccabili
- **Haptic Feedback** - vibrazione al click (su dispositivi supportati)
- **PWA Support** - Installabile come app nativa
- **Offline Support** - Funziona offline dopo il primo caricamento
- **Dark Mode** - Supporto automatico per dark mode del sistema
- **Landscape & Portrait** - Supporto completo per entrambi gli orientamenti
- **Safe Area Support** - Compatibile con notch e barre di stato

### 🎨 Interfaccia Moderna
- **Animazioni avanzate** con fallback per dispositivi lenti
- **Gradient animato** di sfondo
- **Effetti particellari** durante il gioco
- **Transizioni fluide** tra le schermate
- **Accessibilità** - Focus visible, high contrast, riduttore motion

## 📋 Come Usare

### Su Desktop
1. Apri `index.html` nel browser
2. Registrati o accedi
3. Inizia a giocare!

### Su Smartphone/Tablet

#### Option 1: Browser Standard
1. Apri il link nel browser mobile
2. Gioca direttamente dal browser

#### Option 2: Installare come App (PWA)
1. Apri la pagina nel browser mobile
2. Menu → "Installa app" (o simile)
3. L'app apparirà nella home screen
4. Gioca come app nativa!

**Browser supportati per PWA:**
- ✅ Chrome/Edge (Android, Windows)
- ✅ Firefox (Android)
- ✅ Samsung Internet
- ✅ Safari (iPad/iPhone - limited)
- ✅ Opera

## 🛠️ Struttura del Progetto

```
.
├── index.html           # Pagina principale con interfaccia
├── style.css            # Stili e animazioni (responsive)
├── script.js            # Logica del gioco e auth
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker (offline support)
└── README.md            # Questo file
```

## 🎯 Tecnologie

- **HTML5** - Semantic markup con PWA support
- **CSS3** - Animazioni, flex layout, media queries
- **Vanilla JavaScript** - ES6+ classi e moderne APIs
- **LocalStorage** - Salvataggio dati utenti
- **Service Workers** - Caching offline
- **Vibration API** - Haptic feedback
- **Web App Manifest** - PWA capabilities
- **Socket.IO + Express** - Multiplayer in tempo reale (due giocatori su due PC differenti)

## 🚀 Performance

- ✅ **Lightweight** - Nessuna dipendenza esterna
- ✅ **Fast** - Caricamento istantaneo
- ✅ **Offline** - Funziona offline con caching
- ✅ **Mobile-first** - Ottimizzato per smartphone
- ✅ **Accessible** - WCAG 2.1 compliant

## 🎮 Come Giocare

1. **Registrati** - Crea un account con username e password
2. **Accedi** - Usa le tue credenziali
3. **Seleziona mossa** - Sasso (🪨), Carta (📄), Forbici (✂️)
4. **Vedi risultato** - Il computer sceglie e viene determinato il vincitore
5. **Ripeti** - Gioca fino a 3 vittorie per vincere la serie
6. **Nuova serie** - Clicca il pulsante per iniziare una nuova sfida

## 📊 Comandi Disponibili

- **Cronologia** - Visualizza tutte le partite giocate
- **Esci** - Logout dal tuo account
- **Nuova Serie** - Resetta il punteggio e inizia una nuova serie

## 💾 Dati Salvati

Tutti i dati vengono salvati **localmente nel browser**:
- Account utente e password (hashate)
- Serie e round giocati
- Statistiche personali
- Log di attività

## 🌐 Modalità Multiplayer (online)

Su questa versione hai la modalità **due giocatori online**. Puoi giocare da due dispositivi/browser diversi via WebSocket.

**⚠️ IMPORTANTE:** GitHub Pages NON può eseguire il server Node.js. Devi deployare il server su una piattaforma esterna (Railway, Render, Heroku) **oppure** testare localmente su LAN.

### 🚀 Quick Start Multiplayer

1. **Per test locale (LAN):**
   - Avvia il server: `node server.js`
   - Apri su PC1: `http://localhost:3000`
   - Apri su PC2: `http://[IP_PC1]:3000`
   - Nel gioco, clicca ⚙️ e configura il server

2. **Per deploy online (Railway):**
   - Pushpa su GitHub
   - Deploy su Railway (free)
   - Copia l'URL generato
   - Nel gioco, clicca ⚙️ e incolla l'URL

📖 **Leggi la guida completa:** [MULTIPLAYER_SETUP.md](MULTIPLAYER_SETUP.md)

### Perché non funziona da GitHub Pages?
GitHub Pages è **solo hosting statico**. Non può eseguire Node.js o WebSocket in background. Per il multiplayer devi:
- **Opzione A:** Server locale (test su LAN)
- **Opzione B:** Server deployato su Railway/Render/Heroku (deploy pubblico)

**Nota:** Pulire la cache del browser cancellerà tutti i dati.

## 🔍 Requisiti Browser

- Chrome/Edge ≥ 60
- Firefox ≥ 55
- Safari ≥ 12
- Opera ≥ 47

## 🎨 Personalizzazione

### Tema
L'app rileva automaticamente se il tuo dispositivo è in dark mode e si adatta.

### Animazioni
Se preferisci meno animazioni (accessibility), il tuo sistema operativo può ridurle automaticamente.

## 📝 Note

- ✅ Responsive e touch-friendly
- ✅ PWA installabile
- ✅ Funziona offline
- ✅ Senza pubblicità
- ✅ Dati privati (salvataggio locale)
- ✅ Nessun tracciamento

## 🤝 Contributi

Senti libero di fare fork e personalizzare il gioco per i tuoi bisogni!

## 📄 Licenza

Libero da utilizzare per scopi personali e educativi.

---

**Buon gioco!** 🎮✨