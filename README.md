AI DB Chatbot - Frontend (Vite + React port 3000)

Nota: UI stile WhatsApp con messaggi a destra/sinistra, supporto tabella HTML, JSON, grafico Chart.js embedded, download Excel.

Configurazione:
- Imposta VITE_BACKEND_URL nel file .env del frontend (es: VITE_BACKEND_URL=https://<backend-url>)

Funzionamento:
- Invia testo libero. Di default ricevi un messaggio testuale e una preview dei primi risultati.
- Usa i trigger: "fammi tabella", "fammi grafico", "fammi excel", "fammi json" per ottenere i diversi formati.

Chart.js: caricato dinamicamente in ChartBubble, supporta bar/line.
