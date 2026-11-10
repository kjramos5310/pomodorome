// ============= BANCO DE CHISPAS =============
// Temas de curiosidad aleatoria para la fase "Chispa": ramas que no tienen
// nada que ver entre sí. Cada uno trae un gancho corto y, si existe, el paper
// o la fuente para tirar del hilo.

export const SPARK_TOPICS = [
  {
    id: 'sp-physarum', emoji: '🦠', category: 'Biología / redes',
    title: 'El moho sin cerebro que rediseñó el metro de Tokio',
    hook: 'Pusieron avena donde están las ciudades alrededor de Tokio y dejaron crecer Physarum polycephalum. La red de tubos que formó se parece muchísimo al sistema ferroviario real.',
    source: 'Tero et al. (2010), Science — "Rules for Biologically Inspired Adaptive Network Design"',
    keywords: ['Physarum polycephalum', 'Tero 2010 Tokyo rail', 'redes adaptativas'],
  },
  {
    id: 'sp-cassiopea', emoji: '🪼', category: 'Neurociencia del sueño',
    title: 'Medusas que duermen sin tener cerebro',
    hook: 'La medusa Cassiopea muestra señales de sueño y, si la privas de dormir, lo "paga" al día siguiente. ¿El sueño apareció antes que el cerebro?',
    source: 'Nath et al. (2017), Current Biology',
    keywords: ['Cassiopea sleep', 'sueño sin cerebro', 'evolución del sueño'],
  },
  {
    id: 'sp-tardigrade', emoji: '🐻', category: 'Genética extrema',
    title: 'Tardígrados: el animal casi indestructible',
    hook: 'Resisten deshidratación, radiación y el vacío del espacio. Su proteína Dsup, puesta en células humanas, redujo de forma notable el daño al ADN por rayos X.',
    source: 'Hashimoto et al. (2016), Nature Communications',
    keywords: ['tardígrado Dsup', 'criptobiosis', 'tardigrade space'],
  },
  {
    id: 'sp-chills', emoji: '🎻', category: 'Neurociencia de la música',
    title: 'Por qué una canción te da escalofríos',
    hook: 'La música que da escalofríos activa los mismos circuitos de recompensa que la comida o las drogas.',
    source: 'Blood & Zatorre (2001), PNAS',
    keywords: ['music chills brain reward', 'Blood Zatorre 2001', 'frisson'],
  },
  {
    id: 'sp-ultimatum', emoji: '🤝', category: 'Economía / antropología',
    title: 'El "hombre egoísta" no aparece en ninguna cultura',
    hook: 'El juego del ultimátum en 15 sociedades pequeñas: el modelo del puro interés propio falló en todas.',
    source: 'Henrich et al. (2005), Behavioral and Brain Sciences',
    keywords: ['ultimatum game small-scale societies', 'Henrich 2005', 'homo economicus'],
  },
  {
    id: 'sp-snowball', emoji: '🧊', category: 'Geología',
    title: 'Cuando la Tierra entera se congeló',
    hook: 'La hipótesis de la "Tierra bola de nieve": el planeta casi totalmente congelado. Su defensor fue ridiculizado y hoy la idea es ampliamente aceptada.',
    source: 'Hoffman et al. (1998), Science — "A Neoproterozoic Snowball Earth"',
    keywords: ['Snowball Earth', 'Neoproterozoico', 'Hoffman 1998'],
  },
  {
    id: 'sp-wunderkammer', emoji: '🗝️', category: 'Historia del coleccionismo',
    title: 'Wunderkammer: los gabinetes de curiosidades',
    hook: 'Cuartos del siglo XVI-XVII donde fósiles, autómatas, astrolabios y "cuernos de unicornio" convivían sin orden: el ancestro común de todos los museos.',
    source: 'Grabado del Museum Wormianum de Ole Worm (1655)',
    keywords: ['Wunderkammer', 'Kunstkammer Rodolfo II', 'Museum Wormianum'],
  },
  {
    id: 'sp-shor', emoji: '⚛️', category: 'Computación cuántica',
    title: 'El algoritmo de Shor y el fin de RSA',
    hook: 'En 1994 Peter Shor mostró que una computadora cuántica podría factorizar números enormes en tiempo polinómico, rompiendo la base de RSA.',
    source: 'Shor (1994), "Algorithms for quantum computation: discrete logarithms and factoring"',
    keywords: ['Shor algorithm', 'transformada cuántica de Fourier', 'criptografía post-cuántica'],
  },
  {
    id: 'sp-homer-blue', emoji: '🌊', category: 'Lingüística / percepción',
    title: 'Por qué Homero nunca dijo que el mar era azul',
    hook: 'Homero habla del mar "color vino". ¿Cómo influye el idioma en los colores que distinguimos?',
    source: 'Gladstone (1858) y el debate posterior sobre los términos de color',
    keywords: ['wine-dark sea', 'términos de color Berlin Kay', 'relatividad lingüística'],
  },
  {
    id: 'sp-fermented', emoji: '🫙', category: 'Ciencia de la comida',
    title: 'Comida fermentada: pudrir comida a propósito',
    hook: 'Garum romano, kimchi, natto: la microbiología (y el asco inicial) detrás de dejar que los microbios cocinen por ti.',
    keywords: ['garum romano', 'fermentación láctica', 'natto Bacillus subtilis'],
  },
  {
    id: 'sp-tsp', emoji: '🧭', category: 'Matemáticas',
    title: 'El problema del viajante',
    hook: 'Fácil de enunciar, durísimo de resolver: nadie conoce un algoritmo eficiente para la ruta más corta entre muchas ciudades. Y mueve la logística del mundo.',
    keywords: ['travelling salesman problem', 'NP-hard', 'heurísticas TSP'],
  },
  {
    id: 'sp-flood-myths', emoji: '🌧️', category: 'Mitología comparada',
    title: 'Diluvios universales en culturas que nunca se conocieron',
    hook: 'Gilgamesh, Noé, Manu, Deucalión… ¿por qué tantas culturas cuentan una inundación que lo borra todo?',
    keywords: ['flood myth', 'Epopeya de Gilgamesh', 'mitología comparada'],
  },
  {
    id: 'sp-typography', emoji: '🔤', category: 'Diseño / cognición',
    title: 'Por qué una tipografía "se siente" cálida o fría',
    hook: 'Las formas redondeadas o angulosas cambian lo que sentimos al leer, aunque no sepamos explicar por qué.',
    keywords: ['typeface personality', 'psicología de la tipografía', 'bouba kiki'],
  },
  {
    id: 'sp-perfume', emoji: '🌹', category: 'Historia de la química',
    title: 'Cómo se capturaban olores antes de la química moderna',
    hook: 'Enfleurage, destilación de agua de rosas, resinas: el mercado del perfume antiguo y sus técnicas.',
    keywords: ['enfleurage', 'Avicena destilación agua de rosas', 'perfume antiguo'],
  },
  {
    id: 'sp-tenebrism', emoji: '🕯️', category: 'Arte',
    title: 'Caravaggio y el tenebrismo',
    hook: 'Figuras que emergen de la oscuridad total como bajo un solo foco. Una técnica, y una biografía igual de dramática.',
    keywords: ['Caravaggio tenebrismo', 'claroscuro', 'barroco'],
  },
  {
    id: 'sp-gunpla', emoji: '🤖', category: 'Cultura del modelismo',
    title: 'Gunpla: del gabinete de curiosidades a la vitrina mecha',
    hook: 'Desde 1980 los kits de Bandai convirtieron coleccionar en construir: el mismo impulso del Wunderkammer, con robots gigantes.',
    keywords: ['Gunpla historia', 'garage kits', 'scale model kits Bandai'],
  },
]

// Enlaces de exploración para un tema
export const exploreLinks = (topic) => {
  const q = encodeURIComponent(topic.keywords?.[0] || topic.title)
  const t = encodeURIComponent(topic.title)
  return [
    { label: 'Wikipedia', url: `https://es.wikipedia.org/w/index.php?search=${q}` },
    { label: 'YouTube', url: `https://www.youtube.com/results?search_query=${q}` },
    { label: 'Google', url: `https://www.google.com/search?q=${t}` },
    { label: 'Scholar', url: `https://scholar.google.com/scholar?q=${q}` },
  ]
}
