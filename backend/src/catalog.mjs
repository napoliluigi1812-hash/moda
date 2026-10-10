const capi = [
  {
    id: "donna-01",
    nome: "Blazer doppiopetto in lana",
    categoria: "Blazer",
    sesso: "Donna",
    stili: ["Elegante", "Classico", "Chic"],
    occasioni: ["Lavoro", "Cerimonia", "Serata"],
    prezzo: 189,
    colore: "Avorio",
    descrizione: "Linee sartoriali, spalle definite e una morbida texture in lana.",
    immagine:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-02",
    nome: "Blazer oversize color cioccolato",
    categoria: "Blazer",
    sesso: "Donna",
    stili: ["Elegante", "Minimal", "Casual"],
    occasioni: ["Lavoro", "Serata", "Viaggio"],
    prezzo: 149,
    colore: "Cioccolato",
    descrizione: "Un volume rilassato da indossare, senza pensarci troppo.",
    immagine:
      "https://images.unsplash.com/photo-1548624149-f0e0207aab6c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-03",
    nome: "Trench fluido effetto suede",
    categoria: "Trench",
    sesso: "Donna",
    stili: ["Elegante", "Minimal", "Classico"],
    occasioni: ["Lavoro", "Viaggio", "Tempo libero"],
    prezzo: 229,
    colore: "Cammello",
    descrizione: "Il capospalla intramontabile, con una silhouette leggera.",
    immagine:
      "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-04",
    nome: "Giacca bouclé con bottoni gioiello",
    categoria: "Giacca",
    sesso: "Donna",
    stili: ["Elegante", "Chic", "Classico"],
    occasioni: ["Cerimonia", "Lavoro", "Serata"],
    prezzo: 199,
    colore: "Burro",
    descrizione: "Una trama materica e piccoli dettagli luminosi.",
    immagine:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-05",
    nome: "Giacca morbida in pelle",
    categoria: "Giacca",
    sesso: "Donna",
    stili: ["Casual", "Streetwear", "Chic"],
    occasioni: ["Serata", "Tempo libero", "Viaggio"],
    prezzo: 169,
    colore: "Mogano",
    descrizione: "Un classico vissuto, in una tonalità calda e profonda.",
    immagine:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-06",
    nome: "Bomber corto in nylon riciclato",
    categoria: "Bomber",
    sesso: "Donna",
    stili: ["Streetwear", "Sportivo", "Casual"],
    occasioni: ["Tempo libero", "Viaggio"],
    prezzo: 109,
    colore: "Verde oliva",
    descrizione: "Compatto e leggero, per giornate sempre in movimento.",
    immagine:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-07",
    nome: "Giacca in denim dalla linea pulita",
    categoria: "Giacca",
    sesso: "Donna",
    stili: ["Casual", "Streetwear", "Minimal"],
    occasioni: ["Tempo libero", "Viaggio"],
    prezzo: 89,
    colore: "Indigo",
    descrizione: "Il denim essenziale che si abbina a tutto.",
    immagine:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "donna-08",
    nome: "Blazer in misto lino",
    categoria: "Blazer",
    sesso: "Donna",
    stili: ["Minimal", "Elegante", "Casual"],
    occasioni: ["Lavoro", "Viaggio", "Tempo libero"],
    prezzo: 129,
    colore: "Sabbia",
    descrizione: "Una costruzione fresca e destrutturata, perfetta ogni giorno.",
    immagine:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-01",
    nome: "Blazer monopetto in lana",
    categoria: "Blazer",
    sesso: "Uomo",
    stili: ["Elegante", "Classico", "Minimal"],
    occasioni: ["Lavoro", "Cerimonia", "Serata"],
    prezzo: 199,
    colore: "Blu notte",
    descrizione: "Una giacca impeccabile, costruita per durare nel tempo.",
    immagine:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-02",
    nome: "Giacca destrutturata in cotone",
    categoria: "Giacca",
    sesso: "Uomo",
    stili: ["Elegante", "Casual", "Minimal"],
    occasioni: ["Lavoro", "Viaggio", "Tempo libero"],
    prezzo: 139,
    colore: "Tortora",
    descrizione: "Il carattere della sartoria, con il comfort di ogni giorno.",
    immagine:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-03",
    nome: "Cappotto doppiopetto in lana",
    categoria: "Cappotto",
    sesso: "Uomo",
    stili: ["Elegante", "Classico", "Chic"],
    occasioni: ["Lavoro", "Cerimonia", "Viaggio"],
    prezzo: 279,
    colore: "Carbone",
    descrizione: "Volumi netti e tessuto caldo per la stagione fredda.",
    immagine:
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-04",
    nome: "Overshirt in canvas spazzolato",
    categoria: "Overshirt",
    sesso: "Uomo",
    stili: ["Casual", "Minimal", "Streetwear"],
    occasioni: ["Tempo libero", "Viaggio", "Lavoro"],
    prezzo: 119,
    colore: "Verde bosco",
    descrizione: "Strati facili e una mano morbida da portare ovunque.",
    immagine:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-05",
    nome: "Giacca in pelle dal taglio essenziale",
    categoria: "Giacca",
    sesso: "Uomo",
    stili: ["Streetwear", "Casual", "Classico"],
    occasioni: ["Serata", "Tempo libero", "Viaggio"],
    prezzo: 199,
    colore: "Nero",
    descrizione: "La pelle si ammorbidisce nel tempo, il taglio resta attuale.",
    immagine:
      "https://images.unsplash.com/photo-1520975958225-5c4c07dd7f1c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-06",
    nome: "Bomber leggero in nylon",
    categoria: "Bomber",
    sesso: "Uomo",
    stili: ["Streetwear", "Sportivo", "Casual"],
    occasioni: ["Tempo libero", "Viaggio"],
    prezzo: 99,
    colore: "Blu inchiostro",
    descrizione: "Un capo versatile, con una vestibilità rilassata.",
    immagine:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-07",
    nome: "Giacca in denim raw",
    categoria: "Giacca",
    sesso: "Uomo",
    stili: ["Casual", "Streetwear", "Classico"],
    occasioni: ["Tempo libero", "Viaggio"],
    prezzo: 89,
    colore: "Indigo",
    descrizione: "Denim dalla mano compatta, fatto per essere vissuto.",
    immagine:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "uomo-08",
    nome: "Blazer estivo in lino",
    categoria: "Blazer",
    sesso: "Uomo",
    stili: ["Minimal", "Elegante", "Chic"],
    occasioni: ["Cerimonia", "Lavoro", "Serata"],
    prezzo: 159,
    colore: "Sabbia",
    descrizione: "Lino leggero e dettagli discreti, anche nelle occasioni speciali.",
    immagine:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85",
  },
];

const budgetPriceRanges = {
  basso: (prezzo) => prezzo <= 100,
  medio: (prezzo) => prezzo > 100 && prezzo <= 180,
  alto: (prezzo) => prezzo > 180,
};

export function getCapi(filters = {}) {
  const { sesso, stile, occasione, budget } = filters;

  return capi.filter((capo) => {
    if (sesso && capo.sesso !== sesso) return false;
    if (stile && !capo.stili.includes(stile)) return false;
    if (occasione && !capo.occasioni.includes(occasione)) return false;
    if (budget && !budgetPriceRanges[budget](capo.prezzo)) return false;
    return true;
  });
}
