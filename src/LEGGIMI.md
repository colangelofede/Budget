# Sorgenti dell'app Budget

`index.html` nella cartella principale è generato da questi file:

    cd src && python3 build.py && cp site/index.html ../index.html && cp sw.js ../sw.js

Modifica sempre i sorgenti qui, poi ricompila. Cambia VERSIONE in sw.js a ogni rilascio.

## Sezione Lavoro (v3, novembre 2026)
- All'apertura c'è la schermata iniziale: swipe a destra → Lavoro, swipe a sinistra → Budget. Per tornare: tocca le iniziali in alto a sinistra, oppure swipe dal bordo (sinistro nel Budget, destro nel Lavoro).
- File: `lavoro.js` (calcoli: fasce di straordinario, trasferte, busta stimata, ferie e ROL) e `lavoro-ui.js` (viste e fogli). `build.py` li include prima di `app.js`.
- Fogli Google nuovi: Ore, Timbrature, Lavoro (parametri con "dal"), Voci (premi), Saldi (saldi ferie/ROL e ore pagate in busta). Codice.gs li conosce dalla versione del 18/11/2026; `?key=…&timbra=arrivo|uscita` registra un orario (Comandi rapidi).
- Il netto stimato dei mesi senza busta confermata entra nel Budget (calc.js → `stimaNettoLav`).
