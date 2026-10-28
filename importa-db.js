async function main() {
  const [{ default: Database }, fs, os, path] = await Promise.all([
    import("better-sqlite3"),
    import("node:fs"),
    import("node:os"),
    import("node:path"),
  ]);
  const rootPath = __dirname;
  const databasePath = path.resolve(rootPath, process.env.DATABASE_PATH || "negozio.db");
  const sourcePath = path.resolve(
    process.env.IMAGE_SOURCE_DIR || path.join(os.homedir(), "Desktop", "negozio.db"),
  );
  const publicImagesPath = path.join(rootPath, "public", "capi");

  // Se REMOVE_MISSING=1, i capi le cui immagini non esistono più nella cartella sorgente vengono eliminati dal DB
  const removeMissing = process.env.REMOVE_MISSING === "1";

  // Parola chiave nel nome cartella/file -> valore salvato in OCCASIONE
  // Aggiungi pure le tue categorie qui
  const OCCASIONS = {
    WORK: "Work",
    OFFICE: "Work",
    EVENING: "Evening",
    NIGHT: "Evening",
    CEREMONY: "Ceremony",
    WEDDING: "Ceremony",
    LEISURE: "Leisure",
    TRAVEL: "Travel",
  };
  const OCCASION_DEFAULT = "Da classificare";
  const CATEGORIE = {
    TOP: "Top",
    GIACCHE: "Giacche",
    CAMICIE: "Camicie",
    PANTALONI: "Pantaloni",
    SCARPE: "Scarpe",
    GONNE: "Gonne",
    ABITI: "Abiti",
  };

  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
    throw new Error(`Cartella immagini non trovata: ${sourcePath}`);
  }

  const immagini = [];

  function scansionaTutto(dirCorrente) {
    for (const elemento of fs.readdirSync(dirCorrente)) {
      const percorsoCompleto = path.join(dirCorrente, elemento);
      const stat = fs.statSync(percorsoCompleto);

      if (stat.isDirectory()) {
        scansionaTutto(percorsoCompleto);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(elemento)) {
        immagini.push(percorsoCompleto);
      }
    }
  }

  scansionaTutto(sourcePath);

  if (immagini.length === 0) {
    throw new Error(`Nessuna immagine trovata in: ${sourcePath}`);
  }

  const db = new Database(databasePath);

  // 1) Crea la tabella se non esiste (già con la colonna occasione)
  db.exec(`
    CREATE TABLE IF NOT EXISTS capi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      stile TEXT,
      sesso TEXT,
      categoria TEXT,
      occasione TEXT,
      prezzo REAL,
      immagine TEXT
    );
  `);

  // 2) Migrazione: se il DB esiste già senza la colonna, la aggiunge
  const colonne = db.prepare("PRAGMA table_info(capi)").all().map((c) => c.name);
  if (!colonne.includes("occasione")) {
    db.exec("ALTER TABLE capi ADD COLUMN occasione TEXT");
    console.log("Colonna 'occasione' aggiunta al database.");
  }

  // 3) Indice univoco sull'immagine: serve per riconoscere i capi già presenti
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_capi_immagine ON capi(immagine)");

  const esiste = db.prepare("SELECT 1 FROM capi WHERE immagine = ?");

  // Upsert: inserisce i nuovi, aggiorna gli esistenti (senza toccare il prezzo)
  const upsert = db.prepare(`
    INSERT INTO capi (nome, stile, sesso, categoria, occasione, prezzo, immagine)
    VALUES (@nome, @stile, @sesso, @categoria, @occasione, @prezzo, @immagine)
    ON CONFLICT(immagine) DO UPDATE SET
      nome = excluded.nome,
      sesso = excluded.sesso,
      categoria = excluded.categoria,
      occasione = COALESCE(capi.occasione, excluded.occasione)
  `);

  let aggiunti = 0;
  let aggiornati = 0;
  let rimossi = 0;

  const importRows = db.transaction(() => {
    const urlPresenti = new Set();

    for (const percorsoImmagine of immagini) {
      const percorsoRelativo = path.relative(sourcePath, percorsoImmagine);
      const partiPercorso = percorsoRelativo.split(path.sep);
      const nomeCapo = path.parse(percorsoImmagine).name.replace(/[-_]/g, " ");
      let stile = "Classificare";
      let sesso = "Unisex";
      let categoria = "Generico";
      let occasione = OCCASION_DEFAULT;

      for (const parte of partiPercorso.slice(0, -1)) {
        const parteMaiuscola = parte.replace(/[-_]/g, " ").toUpperCase();
        if (parteMaiuscola.includes("UOMO")) sesso = "Uomo";
        if (parteMaiuscola.includes("DONNA")) sesso = "Donna";
        if (parteMaiuscola.includes("ELEGANTE")) stile = "Elegante";
        if (parteMaiuscola.includes("MINIMAL")) stile = "Minimal";
        if (parteMaiuscola.includes("CASUAL")) stile = "Casual";
        if (parteMaiuscola.includes("CHIC")) stile = "Chic";
        if (parteMaiuscola.includes("STREETWEAR")) stile = "Streetwear";
        if (parteMaiuscola.includes("CLASSICO")) stile = "Classico";
        if (parteMaiuscola.includes("SPORTIVO")) stile = "Sportivo";
        
        if (Object.hasOwn(CATEGORIE, parteMaiuscola)) categoria = CATEGORIE[parteMaiuscola];
        for (const [parola, valore] of Object.entries(OCCASIONS)) {
          if (parteMaiuscola.includes(parola)) occasione = valore;
        }
      }

      const destinationPath = path.join(publicImagesPath, percorsoRelativo);
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
      fs.copyFileSync(percorsoImmagine, destinationPath);

      const imageUrl = `/capi/${partiPercorso.map(encodeURIComponent).join("/")}`;
      urlPresenti.add(imageUrl);

      if (esiste.get(imageUrl)) aggiornati++;
      else aggiunti++;

      upsert.run({
        nome: nomeCapo.charAt(0).toUpperCase() + nomeCapo.slice(1),
        stile,
        sesso,
        categoria,
        occasione,
        prezzo: 49.99, // usato solo per i capi NUOVI
        immagine: imageUrl,
      });
    }

    if (removeMissing) {
      const tutti = db.prepare("SELECT id, immagine FROM capi").all();
      const elimina = db.prepare("DELETE FROM capi WHERE id = ?");
      for (const riga of tutti) {
        if (!urlPresenti.has(riga.immagine)) {
          elimina.run(riga.id);
          rimossi++;
        }
      }
    }
  });

  try {
    importRows();
    console.log(
      `Sincronizzazione completata in ${databasePath}: ` +
        `${aggiunti} aggiunti, ${aggiornati} aggiornati` +
        (removeMissing ? `, ${rimossi} rimossi.` : "."),
    );
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});