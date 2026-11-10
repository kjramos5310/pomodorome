import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, RotateCw, Search, Mic, Clock, BookOpen, Sparkles,
  Copy, ExternalLink, Plus, Trash2, Volume2, CheckCircle2, Play,
  Pause, RefreshCw, X, Tag, Lightbulb, Quote, ChevronRight, Award,
  Palette, Zap, Bot, Layers, Sliders, Dices, Pill, BookMarked, Atom, Skull, Filter
} from 'lucide-react'

// Extended Topic Database: "Diversificar para Converger" with High-Depth Advanced Topics
export const INITIAL_TOPICS = [
  // --- TECNICO-DEATH: ULTRA TÉCNICO & CONCRETO ---
  {
    id: 'death_farm1',
    category: 'Farmacología & Neurociencia',
    level: 'TECNICO-death',
    title: 'Cinética de Modulación Alostérica Positiva (PAM) en Subunidades GABA-A (α1β2γ2)',
    emoji: '☠️',
    keywords: ['Receptores GABA-A (α1β2γ2)', 'Corriente de Cloro', 'PAMs vs Agonistas Directos', 'Hiperpolarización neuronal', 'Desensibilización alostérica'],
    questions: [
      '¿Cómo los moduladores alostéricos positivos alteran la afinidad del sitio ortostérico de GABA sin abrir directamente el canal iónico de Cloro?',
      '¿De qué manera la subunidad α1 media la sedación mientras que las subunidades α2/α3 median la anxiolisis?'
    ],
    quote: '"El canal iónico no miente: la entrada de ion Cloro determina el potencial de membrana celular."'
  },
  {
    id: 'death_farm2',
    category: 'Farmacología & Neurociencia',
    level: 'TECNICO-death',
    title: 'Vía mTORC1 & Autofagia Neuronal por Deprivación de Aminoácidos',
    emoji: '☠️',
    keywords: ['mTORC1', 'Rheb-GTP', 'Complex ULK1', 'AMPK', 'Autofagosoma', 'Síntesis proteica dendrítica'],
    questions: [
      '¿Cómo la quinasa mTORC1 actúa como el sensor maestro de aminoácidos celular e inhibe la autofagia cuando está fosforilada?',
      '¿De qué forma la deprivación temporal estimula la autofagia neuronal para limpiar agregados proteicos defectuosos?'
    ]
  },
  {
    id: 'death_data1',
    category: 'Ciencia de Datos & IA',
    level: 'TECNICO-death',
    title: 'FlashAttention-2 & Algoritmos de Tiling en Memoria SRAM vs HBM',
    emoji: '☠️',
    keywords: ['FlashAttention-2', 'Tiling Algorithm', 'HBM Bandwidth IO', 'SRAM Cache', 'Kernel Fusion CUDA', 'Online Softmax'],
    questions: [
      '¿Cómo FlashAttention evita escribir la matriz de atención de $N \\times N$ en la memoria HBM mediante el cálculo incremental con Online Softmax en la rápida memoria SRAM?',
      '¿Cómo reduce la complejidad de acceso a memoria de $O(N^2)$ a $O(N)$ optimizando la velocidad en GPUs H100/A100?'
    ]
  },
  {
    id: 'death_data2',
    category: 'Ciencia de Datos & IA',
    level: 'TECNICO-death',
    title: 'Derivación del ELBO & Reparameterization Trick en VAEs',
    emoji: '☠️',
    keywords: ['ELBO (Evidence Lower Bound)', 'Divergencia Kullback-Leibler', 'Reparameterization Trick', 'Latent Space Gaussian', 'Variational Inference'],
    questions: [
      '¿Por qué el "Reparameterization Trick" ($z = \\mu + \\sigma \\odot \\epsilon$) permite que el gradiente fluya por retropropagación a través de variables estocásticas latentes?',
      '¿Cómo la maximización del ELBO equilibra la reconstrucción exacta con el ordenamiento del espacio latente?'
    ]
  },
  {
    id: 'death_cripto1',
    category: 'Criptografía & Secretos Matemáticos',
    level: 'TECNICO-death',
    title: 'Criptografía Basada en Retículos (Lattice-Based - LWE) Post-Cuántica',
    emoji: '☠️',
    keywords: ['Learning With Errors (LWE)', 'Shortest Vector Problem (SVP)', 'CRYSTALS-Kyber', 'Resistencia a Shor', 'Retículos vectoriales $Z^n$'],
    questions: [
      '¿Por qué encontrar el vector más corto (SVP) en un retículo vectorial de $N$ dimensiones es insoluble incluso para la computadora cuántica con el algoritmo de Shor?',
      '¿Cómo el ruido aleatorio añadido en el problema LWE transforma un sistema de ecuaciones lineales simple en una trampa criptográfica indestructible?'
    ]
  },
  {
    id: 'death_cripto2',
    category: 'Criptografía & Secretos Matemáticos',
    level: 'TECNICO-death',
    title: 'Curvas Elípticas Pairing-Friendly (BLS12-381) en zk-SNARKs',
    emoji: '☠️',
    keywords: ['BLS12-381', 'Apareamiento de Tate/Weil', 'Bilinear Pairings $e(G_1, G_2) \\to G_T$', 'Groth16', 'Homomorfismo multiplicativo'],
    questions: [
      '¿Cómo la propiedad bilineal $e(aP, bQ) = e(P, Q)^{ab}$ permite verificar multiplicaciones de polinomios sin revelar las entradas en pruebas de cero conocimiento?',
      '¿Por qué la curva elíptica BLS12-381 fue elegida como el estándar de la industria para Ethereum 2.0 y Zcash?'
    ]
  },
  {
    id: 'death_sis1',
    category: 'Sistemas Complejos',
    level: 'TECNICO-death',
    title: 'Consenso Raft / Paxos & Algoritmos de Tolerancia a Fallos Bizantinos (BFT)',
    emoji: '☠️',
    keywords: ['Byzantine Fault Tolerance', 'Vector Clocks', 'State Machine Replication', 'Split-brain', 'Raft Leader Election', 'Log Compaction'],
    questions: [
      '¿Cómo el algoritmo Raft resuelve el problema de consenso dividiendo la vida del sistema en términos de elección y replicación estricta del Log?',
      '¿Cómo los relojes de vector (Vector Clocks) garantizan el ordenamiento causal de eventos sin necesidad de un reloj de pared centralizado?'
    ]
  },
  {
    id: 'death_fis1',
    category: 'Física & Satélites',
    level: 'TECNICO-death',
    title: 'Efecto Túnel Cuántico & Diodos Esaki en Barreras de Potencial',
    emoji: '☠️',
    keywords: ['Aproximación WKB', 'Resistencia diferencial negativa', 'Barrera de potencial fino', 'Bandas de energía p-n ultradopadas', 'Diodos Esaki'],
    questions: [
      '¿Cómo la probabilidad de transmisión de la función de onda $\\psi(x)$ atravesando una barrera de potencial genera una resistencia diferencial negativa a frecuencias de Terahertz?',
      '¿De qué manera el efecto túnel limita la miniaturización de transistores por debajo de los 2 nanómetros?'
    ]
  },
  {
    id: 'death_mat1',
    category: 'Química & Materiales',
    level: 'TECNICO-death',
    title: 'Depósitos de Capa Atómica (ALD) & Litografía EUV 13.5nm',
    emoji: '☠️',
    keywords: ['Atomic Layer Deposition (ALD)', 'EUV 13.5nm', 'Laser-Produced Plasma (LPP)', 'Espejos Bragg multicapa', 'Fotoresina quimicamente amplificada'],
    questions: [
      '¿Cómo la litografía de Extremo Ultravioleta (EUV) genera fotones de 13.5nm vaporizando gotas de estaño con láseres de CO2 a 50.000 veces por segundo?',
      '¿Cómo ALD permite depositar capas de material de grosor exactamente monoatómico usando reacciones químicas autocatalíticas saturadas?'
    ]
  },

  // --- FARMACOLOGÍA, VITAMINAS & ESTÍMULOS NEUROQUÍMICOS ---
  {
    id: 'farm1',
    category: 'Farmacología & Neurociencia',
    level: 'Básico',
    title: 'Sinergia Cafeína + L-Teanina & Antagonismo de Adenosina',
    emoji: '☕',
    keywords: ['Receptores de Adenosina A1/A2A', 'L-Teanina', 'Ondas Alfa', 'Vasoconstricción cerebral', 'Foco sostenido'],
    questions: [
      '¿Cómo bloquea la cafeína el receptor de adenosina para evitar la señal de cansancio celular?',
      '¿De qué manera la L-Teanina (aminoácido del té verde) cruza la barrera hematoencefálica para eliminar el nerviosismo y inducir ondas Alfa?'
    ],
    quote: '"La cafeína prestada del futuro se paga con el choque del presente."'
  },
  {
    id: 'farm2',
    category: 'Farmacología & Neurociencia',
    level: 'Intermedio',
    title: 'Eje Intestino-Cerebro & Microbioma Neuroquímico',
    emoji: '🦠',
    keywords: ['Nervio Vago', 'Microbiota intestinal', 'Síntesis de Serotonina', 'Ácidos grasos de cadena corta (SCFA)', 'GABA intestinal'],
    questions: [
      '¿Sabías que más del 90% de la serotonina del cuerpo se produce en el intestino por bacterias simbióticas?',
      '¿Cómo viajan las señales neuroquímicas desde la microbiota hasta la corteza cerebral a través del nervio vago?'
    ]
  },
  {
    id: 'farm3',
    category: 'Farmacología & Neurociencia',
    level: 'Avanzado',
    title: 'Receptores NMDA, AMPA & Potenciación a Largo Plazo (LTP)',
    emoji: '🧠',
    keywords: ['Potenciación a Largo Plazo (LTP)', 'Receptores NMDA/AMPA', 'BDNF', 'Glutamato', 'Plasticidad sináptica', 'Nootrópicos racetámicos'],
    questions: [
      '¿Cómo el flujo de iones de calcio a través de los receptores NMDA consolida la memoria de largo plazo (LTP)?',
      '¿De qué manera el Factor Neurotrófico Derivado del Cerebro (BDNF) estimula la neurogénesis adulta en el hipocampo?'
    ]
  },
  {
    id: 'farm4',
    category: 'Farmacología & Neurociencia',
    level: 'Avanzado',
    title: 'Bioenergética Celular: CoQ10, NAD+, Vitamina D3 & Mitocondrias',
    emoji: '⚡',
    keywords: ['NAD+/NADH', 'Coenzima Q10', 'Cadena de transporte de electrones', 'Vitamina D3/K2', 'ATP mitocondrial', 'Respiración celular'],
    questions: [
      '¿De qué forma la molécula NAD+ disminuye con la edad y cómo su restauración optimiza la producción de ATP en neuronas de alta demanda?',
      '¿Cómo la Vitamina D3 actúa en realidad como una neurohormona que regula más de 2.000 genes del sistema nervioso?'
    ]
  },
  {
    id: 'farm5',
    category: 'Farmacología & Neurociencia',
    level: 'Avanzado',
    title: 'Farmacodinámica del TDAH: Dopamina, Noradrenalina & Reabsorción',
    emoji: '💊',
    keywords: ['Dopamine Transporter (DAT)', 'VMAT2', 'Metilfenidato vs Lisdexanfetamina', 'Corteza prefrontal', 'Modulación alostérica'],
    questions: [
      '¿Cuál es la diferencia farmacológica exacta entre un inhibidor de la reabsorción (DAT blocker) y un liberador de dopamina vesicular?',
      '¿Cómo el incremento del tono noradrenérgico en la corteza prefrontal mejora el filtro de ruido en mentes neurodivergentes?'
    ]
  },

  // --- CITAS & FRASES DE LIBROS FAMOSOS CON ORIGEN HISTÓRICO ---
  {
    id: 'libro1',
    category: 'Lingüística & Citas',
    level: 'Básico',
    title: 'George Orwell (1984) & El Doblepensamiento',
    emoji: '👁️',
    keywords: ['1984', 'George Orwell', 'Doblepensamiento', 'Neolengua', 'Totalitarismo', 'Manipulación del pasado'],
    questions: [
      '¿De qué manera el concepto de "Neolengua" en 1984 buscaba limitar el pensamiento crítico reduciendo el número de palabras disponibles?',
      '¿Cómo funciona el mecanismo de "Doblepensamiento" (sostener dos creencias contradictorias simultáneamente y aceptar ambas)?'
    ],
    quote: '"Quien controla el presente controla el pasado y quien controla el pasado controla el futuro." — George Orwell (1984)'
  },
  {
    id: 'libro2',
    category: 'Lingüística & Citas',
    level: 'Intermedio',
    title: 'Marco Aurelio (Meditaciones) & La Ciudadela Interior',
    emoji: '🏛️',
    keywords: ['Meditaciones', 'Marco Aurelio', 'Estoicismo', 'Amor Fati', 'Dicotomía del control', 'Ciudadela interior'],
    questions: [
      '¿Por qué las Meditaciones de Marco Aurelio nunca se escribieron para ser publicadas, sino como su propio diario personal de entrenamiento mental?',
      '¿Cómo la regla estoica de la "Dicotomía del control" elimina la ansiedad separando lo que depende de ti de lo que no?'
    ],
    quote: '"Tienes poder sobre tu mente, no sobre los acontecimientos. Date cuenta de esto y encontrarás la fuerza." — Marco Aurelio'
  },
  {
    id: 'libro3',
    category: 'Lingüística & Citas',
    level: 'Intermedio',
    title: 'Ray Bradbury (Fahrenheit 451) & La Censura por Placer',
    emoji: '🔥',
    keywords: ['Fahrenheit 451', 'Ray Bradbury', 'Sobre-entretenimiento', 'Censura voluntaria', 'Superficialidad de la atención'],
    questions: [
      '¿Sabías que en Fahrenheit 451 los libros no fueron prohibidos por el gobierno, sino que la sociedad dejó de leerlos por adicción al entretenimiento rápido?',
      '¿Cómo anticipó Bradbury la pérdida de profundidad cognitiva debido a la sobreestimulación mediática?'
    ],
    quote: '"No tienes que quemar libros para destruir una cultura. Solo consigue que la gente deje de leerlos." — Ray Bradbury'
  },
  {
    id: 'libro4',
    category: 'Lingüística & Citas',
    level: 'Avanzado',
    title: 'Sun Tzu (El Arte de la Guerra) & La Victoria Sin Lucha',
    emoji: '⚔️',
    keywords: ['El Arte de la Guerra', 'Sun Tzu', 'Estrategia indirecta', 'Maniobra', 'Engaño táctico', 'Posicionamiento superior'],
    questions: [
      '¿Por qué el tratado estratégico militar más antiguo del mundo sostiene que la mayor victoria es derrotar al enemigo sin disparar un solo proyectil?',
      '¿Cómo aplicar los principios de diplomacia e inercia de Sun Tzu a la negociación y gestión de proyectos modernos?'
    ],
    quote: '"La suprema excelencia consiste en romper la resistencia del enemigo sin luchar." — Sun Tzu'
  },
  {
    id: 'libro5',
    category: 'Lingüística & Citas',
    level: 'Avanzado',
    title: 'Aldous Huxley (Un Mundo Feliz) & La Prisión del Placer',
    emoji: '🧪',
    keywords: ['Un Mundo Feliz', 'Aldous Huxley', 'Soma', 'Condicionamiento Pavloviano', 'Distopía Hedonista'],
    questions: [
      '¿Cuál es la diferencia fundamental entre la distopía basada en el miedo de Orwell y la distopía basada en el placer farmacológico de Huxley?',
      '¿Cómo el concepto del fármaco "Soma" neutralizaba cualquier deseo de rebeldía manteniendo a la población plácidamente anestesiada?'
    ],
    quote: '"Una dictadura perfecta tendría la apariencia de una democracia, pero sería básicamente una prisión sin muros." — Aldous Huxley'
  },

  // --- FULL AVANZADO: CIENCIA DE DATOS & IA ---
  {
    id: 'adv_data1',
    category: 'Ciencia de Datos & IA',
    level: 'Avanzado',
    title: 'Mecanismo de Atención en Transformers & Autoderivación',
    emoji: '🤖',
    keywords: ['Self-Attention Mechanism', 'Transformers', 'Query-Key-Value (QKV)', 'Positional Encoding', 'LLMs', 'Softmax matmul'],
    questions: [
      '¿Cómo la fórmula de Atención Escalada del Producto Punto ($Attention(Q,K,V) = softmax(\\frac{QK^T}{\\sqrt{d_k}})V$) permitió procesar todo el texto en paralelo superando las RNNs?',
      '¿De qué manera los vectores de codificación posicional transmiten el orden de las palabras sin recurrencia temporal?'
    ]
  },
  {
    id: 'adv_data2',
    category: 'Ciencia de Datos & IA',
    level: 'Avanzado',
    title: 'Reducción de Dimensionalidad: t-SNE & UMAP',
    emoji: '🌌',
    keywords: ['t-SNE', 'UMAP', 'Manifold Learning', 'Divergencia Kullback-Leibler', 'Geometría riemanniana', 'Embeddings de alta dimensión'],
    questions: [
      '¿Cómo logran t-SNE y UMAP proyectar espacios de 1.536 dimensiones (embeddings) a 2D manteniendo las distancias topológicas locales?',
      '¿Cuál es la diferencia matemática entre la preservación de estructura global en PCA vs la preservación local en UMAP?'
    ]
  },

  // --- FULL AVANZADO: CRIPTOGRAFÍA & SECRETOS MATEMÁTICOS ---
  {
    id: 'adv_cripto1',
    category: 'Criptografía & Secretos Matemáticos',
    level: 'Avanzado',
    title: 'Cifrado de Curvas Elípticas (ECC) & Logaritmo Discreto',
    emoji: '📐',
    keywords: ['Curvas Elípticas (secp256k1)', 'Problema del logaritmo discreto', 'Adición de puntos en curvas', 'ECDSA', 'Seguridad cuántica'],
    questions: [
      '¿Por qué una clave de 256 bits en Curvas Elípticas ofrece la misma seguridad que una clave RSA de 3.072 bits?',
      '¿Cómo funciona la geometría de sumar puntos en la ecuación $y^2 = x^3 + ax + b \\pmod p$ para generar llaves criptográficas irrompibles?'
    ]
  },

  // --- FULL AVANZADO: FÍSICA & SATÉLITES ---
  {
    id: 'adv_fis1',
    category: 'Física & Satélites',
    level: 'Avanzado',
    title: 'Entrelazamiento Cuántico & Teorema de Bell',
    emoji: '⚛️',
    keywords: ['Teorema de Bell', 'Desigualdad de Bell', 'Acción a distancia', 'Estados de Bell (EPR)', 'Decoherencia cuántica', 'Qubits'],
    questions: [
      '¿Cómo el experimento de John Clauser y Alain Aspect demostró que la realidad no es localmente realista, dándole la razón a la Mecánica Cuántica sobre Einstein?',
      '¿Por qué el entrelazamiento cuántico no permite transmitir información más rápida que la luz (Teorema de No-Comunicación)?'
    ]
  },

  // --- FULL AVANZADO: SISTEMAS COMPLEJOS ---
  {
    id: 'adv_sis1',
    category: 'Sistemas Complejos',
    level: 'Avanzado',
    title: 'Atractores Extraños & Teoría del Caos (Lorenz)',
    emoji: '🌀',
    keywords: ['Atractor de Lorenz', 'Efecto Mariposa', 'Exponente de Lyapunov', 'Ecuaciones diferenciales no lineales', 'Espacio de fases'],
    questions: [
      '¿Cómo sistemas completamente deterministas de 3 ecuaciones simples pueden generar comportamientos caóticos 100% impredecibles a largo plazo?',
      '¿Qué es un atractor extraño y por qué su geometría fractal demuestra la sensibilidad extrema a las condiciones iniciales?'
    ]
  },

  // --- FULL AVANZADO: BIOMÍMESIS ---
  {
    id: 'adv_bio1',
    category: 'Biomímesis & Diseño Biológico',
    level: 'Avanzado',
    title: 'Ensamblaje Molecular de la Seda de Araña',
    emoji: '🕷️',
    keywords: ['Esidroína', 'Láminas beta plegadas', 'Resistencia a la tracción', 'Autoensamblaje macromolecular', 'Proteínas estructurales'],
    questions: [
      '¿Por qué la seda de araña es 5 veces más fuerte que el acero en peso y puede estirarse un 30% sin romperse?',
      '¿Cómo logran las glándulas de la araña pasar de un gel líquido de proteínas solas a una fibra cristalina en milisegundos?'
    ]
  },

  // --- BIOMÍMESIS BÁSICO E INTERMEDIO ---
  {
    id: 'bio1',
    category: 'Biomímesis & Diseño Biológico',
    level: 'Básico',
    title: 'Trenes Bala y el Pico del Martín Pescador',
    emoji: '🐦',
    keywords: ['Efecto estallido sónico', 'Aerodinámica aviar', 'Eiji Nakatsu', 'Shinkansen'],
    questions: [
      '¿Cómo la estructura del pico del Martín Pescador resolvió el problema del estallido sónico en los trenes?',
      '¿Qué otros animales han inspirado la ingeniería de transporte moderno?'
    ],
    quote: '"La naturaleza es el mayor laboratorio de I+D del planeta." — Janine Benyus'
  },

  // --- CIBERPSICOLOGÍA ---
  {
    id: 'ciber1',
    category: 'Ciberpsicología & Mente-Máquina',
    level: 'Básico',
    title: 'Diseño Neuro-Adictivo & Recompensa Variable',
    emoji: '📱',
    keywords: ['Bucle de hábito', 'Notificaciones rojas', 'Scroll infinito', 'B.F. Skinner'],
    questions: [
      '¿Cómo las aplicaciones móviles utilizan el condicionamiento de recompensa variable?',
      '¿Por qué las alertas rojas provocan una respuesta de urgencia inconsciente?'
    ]
  },

  // --- TEORÍA DE JUEGOS ---
  {
    id: 'juegos1',
    category: 'Teoría de Juegos & Estrategia',
    level: 'Básico',
    title: 'El Dilema del Prisionero & Cooperación Evolutiva',
    emoji: '♟️',
    keywords: ['Equilibrio de Nash', 'Estrategia Tit-for-Tat', 'Matriz de pagos', 'Confianza'],
    questions: [
      '¿Por qué en encuentros repetidos la cooperación triunfa sobre la traición?',
      '¿Cómo la estrategia "Tit-for-Tat" demostró ser la más exitosa?'
    ]
  },

  // --- ACÚSTICA & NEURO-AUDIO ---
  {
    id: 'audio1',
    category: 'Acústica, Música & Neuro-Audio',
    level: 'Básico',
    title: 'Ondas Cerebrales & Batimentos Binaurales',
    emoji: '🎧',
    keywords: ['Frecuencias Alfa (8-12Hz)', 'Sincronización auditiva', 'Batimento binaural'],
    questions: [
      '¿Cómo el cerebro percibe la diferencia entre dos frecuencias en cada oído?',
      '¿Existe evidencia científica sobre las frecuencias Alfa en el estado de flujo?'
    ]
  },

  // --- CRIPTOGRAFÍA BÁSICA ---
  {
    id: 'cripto1',
    category: 'Criptografía & Secretos Matemáticos',
    level: 'Básico',
    title: 'La Máquina Enigma & El Nacimiento de la Computación',
    emoji: '🔐',
    keywords: ['Alan Turing', 'Bletchley Park', 'Cifrado de sustitución', 'Rotores Enigma'],
    questions: [
      '¿Cómo funcionaban los rotores mecánicos de Enigma?',
      '¿Por qué el intento de romper Enigma dio origen a la computadora programable?'
    ]
  },

  // --- ECONOMÍA DEL COMPORTAMIENTO ---
  {
    id: 'econ1',
    category: 'Economía del Comportamiento',
    level: 'Básico',
    title: 'La Falacia del Costo Hundido & Aversión a la Pérdida',
    emoji: '💸',
    keywords: ['Costo hundido', 'Kahneman', 'Aversión a la pérdida', 'Sesgo del status quo'],
    questions: [
      '¿Por qué el cerebro prefiere seguir perdiendo tiempo en un proyecto fracasado?',
      '¿Por qué el dolor de perder es psicológicamente el doble de intenso que la alegría de ganar?'
    ]
  },

  // --- PINTURA & ESTÉTICA ---
  {
    id: 'p1',
    category: 'Pintura & Estética Visual',
    level: 'Básico',
    title: 'Evolución de Pigmentos Químicos en la Historia del Arte',
    emoji: '🎨',
    keywords: ['Azul Ultramar', 'Lapislázuli', 'Bermellón', 'Blanco de plomo'],
    questions: [
      '¿Cómo la escasez del lapislázuli definió el uso del azul en el Renacimiento?',
      '¿De qué manera los pigmentos sintéticos tubulares permitieron el Impresionismo?'
    ]
  },

  // --- FILOSOFÍA BÁSICA ---
  {
    id: 'f1',
    category: 'Filosofía & Sociedad',
    level: 'Básico',
    title: 'Avance de la Sociedad vs Civilizaciones Antiguas',
    emoji: '🏛️',
    keywords: ['Desarrollo de civilizaciones', 'Gran Filtro', 'Revolución cognitiva'],
    questions: [
      '¿Por qué nuestra sociedad ha avanzado hasta este punto?',
      '¿El desarrollo tecnológico garantiza la permanencia de la especie?'
    ],
    quote: '"A la final nos construimos a nosotros mismos." — Reflexión sobre la autoconstrucción.'
  },

  // --- PSICOLOGÍA BÁSICA ---
  {
    id: 'psi1',
    category: 'Psicología & TDAH',
    level: 'Básico',
    title: 'Constancia del Objeto & Desarrollo Emocional',
    emoji: '🧠',
    keywords: ['Jean Piaget', 'Permanencia del objeto', 'Apego emocional'],
    questions: [
      '¿Qué es la constancia del objeto y cómo impacta en relaciones adultas?',
      '¿Cómo se relaciona la falta de permanencia objetal con el TDAH?'
    ]
  },

  // --- METODOLOGÍA ---
  {
    id: 'met1',
    category: 'Metodología & Convergencia',
    level: 'Avanzado',
    title: 'Diversificar para Converger: Pensamiento Transdisciplinario',
    emoji: '🔄',
    keywords: ['First Principles Thinking', 'Transdisciplinariedad', 'Polimatía'],
    questions: [
      '¿Cómo conectar conceptos aparentemente distantes para crear soluciones novedosas?',
      '¿De qué forma la exploración divergente evita el encasillamiento mental?'
    ],
    quote: '"Aprende el arte de la ciencia y la ciencia del arte." — Leonardo da Vinci'
  }
]

export const CATEGORIES = [
  'Todas',
  'Farmacología & Neurociencia',
  'Lingüística & Citas',
  'Biomímesis & Diseño Biológico',
  'Ciberpsicología & Mente-Máquina',
  'Teoría de Juegos & Estrategia',
  'Acústica, Música & Neuro-Audio',
  'Criptografía & Secretos Matemáticos',
  'Economía del Comportamiento',
  'Pintura & Estética Visual',
  'Filosofía & Sociedad',
  'Psicología & TDAH',
  'Sistemas Complejos',
  'Ciencia de Datos & IA',
  'Física & Satélites',
  'Química & Materiales',
  'Geociencias & Naturaleza',
  'Arquitectura & Orden',
  'Metodología & Convergencia'
]

export const LEVELS = ['Todos', 'Básico', 'Intermedio', 'Avanzado', 'TECNICO-death']

// Audio click synthesis
const playClickSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  } catch (e) {}
}

const playVictorySound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [440, 554.37, 659.25, 880]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.08)
      osc.stop(ctx.currentTime + i * 0.08 + 0.3)
    })
  } catch (e) {}
}

// Estructura del guion de 1 minuto: qué decir en cada tramo del speech
const SPEECH_SEGMENTS = [
  { key: 'hook', emoji: '🎯', label: 'Gancho', from: 0, to: 10, hint: '¿Qué es, en una sola frase?' },
  { key: 'ideas', emoji: '🧩', label: '3 ideas clave', from: 10, to: 40, hint: 'Lo esencial. Máximo 3.' },
  { key: 'example', emoji: '🔗', label: 'Ejemplo / analogía', from: 40, to: 50, hint: 'Algo concreto que lo haga entender.' },
  { key: 'close', emoji: '🏁', label: 'Cierre', from: 50, to: 60, hint: '¿Por qué importa o cómo lo aplicas?' },
]
const FILTER_SECONDS = 120
const EMPTY_SCRIPT = { hook: '', ideas: ['', '', ''], example: '', close: '' }
const scriptHasContent = (sc) => !!(sc.hook || sc.example || sc.close || sc.ideas.some(Boolean))
const scriptToText = (sc) => [
  sc.hook && `🎯 ${sc.hook}`,
  ...sc.ideas.filter(Boolean).map((i, n) => `🧩 ${n + 1}. ${i}`),
  sc.example && `🔗 ${sc.example}`,
  sc.close && `🏁 ${sc.close}`,
].filter(Boolean).join('\n')

export default function RouletteScreen({ onCompleteSession }) {
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('pomodoro_roulette_topics')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) {}
    }
    return INITIAL_TOPICS
  })

  useEffect(() => {
    localStorage.setItem('pomodoro_roulette_topics', JSON.stringify(topics))
  }, [topics])

  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedLevel, setSelectedLevel] = useState('Todos')
  const [isSpinning, setIsSpinning] = useState(false)

  const [isFusionMode, setIsFusionMode] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [fusionTopics, setFusionTopics] = useState([])

  const [currentAngle, setCurrentAngle] = useState(0)

  const filteredTopics = topics.filter(t => {
    const matchCat = selectedCategory === 'Todas' || t.category === selectedCategory
    const matchLvl = selectedLevel === 'Todos' || t.level === selectedLevel
    return matchCat && matchLvl
  })

  const [phase, setPhase] = useState('roulette')
  const [researchDurationMinutes, setResearchDurationMinutes] = useState(15)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [researchNotes, setResearchNotes] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)

  const [speechTimeLeft, setSpeechTimeLeft] = useState(60)
  const [speechActive, setSpeechActive] = useState(false)

  // Fase de filtro: destilar los apuntes en un guion de 1 minuto
  const [script, setScript] = useState(EMPTY_SCRIPT)
  const [filterTimeLeft, setFilterTimeLeft] = useState(FILTER_SECONDS)
  const [filterActive, setFilterActive] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Farmacología & Neurociencia')
  const [newLevel, setNewLevel] = useState('TECNICO-death')
  const [newEmoji, setNewEmoji] = useState('☠️')
  const [newKeywords, setNewKeywords] = useState('')
  const [newQuestions, setNewQuestions] = useState('')
  const [newQuote, setNewQuote] = useState('')

  const canvasRef = useRef(null)

  const COLORS = [
    '#f97316', '#eab308', '#3b82f6', '#10b981', '#a855f7',
    '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 15

    ctx.clearRect(0, 0, width, height)

    if (filteredTopics.length === 0) {
      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px Rajdhani, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Sin temas en este filtro', centerX, centerY)
      return
    }

    const sliceAngle = (2 * Math.PI) / filteredTopics.length

    filteredTopics.forEach((topic, i) => {
      const startAngle = currentAngle + i * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = topic.level === 'TECNICO-death' ? '#4c1d95' : COLORS[i % COLORS.length]
      ctx.globalAlpha = 0.85
      ctx.fill()
      ctx.globalAlpha = 1.0

      ctx.lineWidth = 2
      ctx.strokeStyle = topic.level === 'TECNICO-death' ? '#ec4899' : '#0a0a0c'
      ctx.stroke()

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px Rajdhani, sans-serif'

      const text = `${topic.emoji} ${topic.title}`
      const maxLength = filteredTopics.length > 8 ? 16 : 24
      const displayStr = text.length > maxLength ? text.substring(0, maxLength) + '...' : text

      ctx.fillText(displayStr, radius - 20, 5)
      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI)
    ctx.lineWidth = 4
    ctx.strokeStyle = isFusionMode ? '#a855f7' : selectedLevel === 'TECNICO-death' ? '#ec4899' : '#f97316'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#0f172a'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = isFusionMode ? '#a855f7' : selectedLevel === 'TECNICO-death' ? '#ec4899' : '#f97316'
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px Rajdhani, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(isFusionMode ? 'FUSIÓN' : 'SPIN', centerX, centerY + 5)
  }, [filteredTopics, currentAngle, isFusionMode, selectedLevel])

  const spinWheel = () => {
    if (isSpinning || filteredTopics.length === 0) return
    setIsSpinning(true)
    setSelectedTopic(null)
    setFusionTopics([])

    const numSlices = filteredTopics.length
    const sliceAngle = (2 * Math.PI) / numSlices

    if (isFusionMode && numSlices >= 2) {
      const win1 = Math.floor(Math.random() * numSlices)
      let win2 = Math.floor(Math.random() * numSlices)
      while (win2 === win1) {
        win2 = Math.floor(Math.random() * numSlices)
      }

      const extraSpins = (6 + Math.floor(Math.random() * 2)) * 2 * Math.PI
      const targetSliceCenter = win1 * sliceAngle + sliceAngle / 2
      const finalAngleOffset = (1.5 * Math.PI) - targetSliceCenter
      const totalRotation = currentAngle + extraSpins + (finalAngleOffset - (currentAngle % (2 * Math.PI)))

      let start = null
      const duration = 4000
      let lastClickSlice = -1

      const animateSpin = (timestamp) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)

        const easeOut = 1 - Math.pow(1 - progress, 3)
        const newAngle = currentAngle + (totalRotation - currentAngle) * easeOut

        setCurrentAngle(newAngle)

        const normalizedAngle = (newAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
        const currentSlice = Math.floor(normalizedAngle / sliceAngle)
        if (currentSlice !== lastClickSlice) {
          lastClickSlice = currentSlice
          playClickSound()
        }

        if (progress < 1) {
          requestAnimationFrame(animateSpin)
        } else {
          setIsSpinning(false)
          setFusionTopics([filteredTopics[win1], filteredTopics[win2]])
          playVictorySound()
        }
      }
      requestAnimationFrame(animateSpin)
    } else {
      const winningIndex = Math.floor(Math.random() * numSlices)
      const extraSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI
      const targetSliceCenter = winningIndex * sliceAngle + sliceAngle / 2
      const finalAngleOffset = (1.5 * Math.PI) - targetSliceCenter
      const totalRotation = currentAngle + extraSpins + (finalAngleOffset - (currentAngle % (2 * Math.PI)))

      let start = null
      const duration = 4000
      let lastClickSlice = -1

      const animateSpin = (timestamp) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)

        const easeOut = 1 - Math.pow(1 - progress, 3)
        const newAngle = currentAngle + (totalRotation - currentAngle) * easeOut

        setCurrentAngle(newAngle)

        const normalizedAngle = (newAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
        const currentSlice = Math.floor(normalizedAngle / sliceAngle)
        if (currentSlice !== lastClickSlice) {
          lastClickSlice = currentSlice
          playClickSound()
        }

        if (progress < 1) {
          requestAnimationFrame(animateSpin)
        } else {
          setIsSpinning(false)
          setSelectedTopic(filteredTopics[winningIndex])
          playVictorySound()
        }
      }
      requestAnimationFrame(animateSpin)
    }
  }

  const handleResetTopics = () => {
    setTopics(INITIAL_TOPICS)
    setSelectedTopic(null)
    setFusionTopics([])
  }

  useEffect(() => {
    let interval = null
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false)
      playVictorySound()
      goToFilter()
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  useEffect(() => {
    let interval = null
    if (speechActive && speechTimeLeft > 0) {
      interval = setInterval(() => {
        setSpeechTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (speechActive && speechTimeLeft === 0) {
      setSpeechActive(false)
      playVictorySound()
      setPhase('completed')
      if (onCompleteSession) {
        const titleStr = isFusionMode && fusionTopics.length === 2
          ? `FUSIÓN: ${fusionTopics[0].title} + ${fusionTopics[1].title}`
          : selectedTopic ? selectedTopic.title : 'Investigación Libre'
        onCompleteSession({
          topic: titleStr,
          notes: buildSessionNotes(),
          durationMinutes: researchDurationMinutes + 1
        })
      }
    }
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechActive, speechTimeLeft, selectedTopic, fusionTopics, isFusionMode, researchNotes, researchDurationMinutes, onCompleteSession])

  const startResearchPhase = (durationMin) => {
    setResearchDurationMinutes(durationMin)
    setTimeLeft(durationMin * 60)
    setScript(EMPTY_SCRIPT)
    setPhase('research')
    setTimerActive(true)
  }

  // ── Fase FILTRO ──
  function goToFilter() {
    setTimerActive(false)
    setFilterTimeLeft(FILTER_SECONDS)
    setFilterActive(true)
    setPhase('filter')
  }

  useEffect(() => {
    if (phase !== 'filter' || !filterActive) return
    const id = setInterval(() => setFilterTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, filterActive])

  const startSpeech = () => {
    setFilterActive(false)
    setPhase('speech')
    setSpeechTimeLeft(60)
    setSpeechActive(true)
  }

  // Líneas de los apuntes + palabras clave del tema, para pasarlas al guion con un toque
  const noteLines = researchNotes.split('\n').map(l => l.replace(/^[-*•\s]+/, '').trim()).filter(l => l.length > 2)
  const topicKeywords = isFusionMode && fusionTopics.length === 2
    ? [...fusionTopics[0].keywords, ...fusionTopics[1].keywords]
    : selectedTopic?.keywords || []
  const usedInScript = (text) => [script.hook, script.example, script.close, ...script.ideas].includes(text)

  // Un toque en un apunte: rellena el primer hueco libre (ideas → ejemplo → cierre → gancho)
  const pushToScript = (text) => {
    setScript(sc => {
      if (usedInScript(text)) return sc
      const i = sc.ideas.findIndex(x => !x)
      if (i !== -1) { const ideas = [...sc.ideas]; ideas[i] = text; return { ...sc, ideas } }
      if (!sc.example) return { ...sc, example: text }
      if (!sc.close) return { ...sc, close: text }
      if (!sc.hook) return { ...sc, hook: text }
      return sc
    })
  }

  function buildSessionNotes() {
    const guion = scriptToText(script)
    if (!guion) return researchNotes
    return `GUION 1 MIN:\n${guion}${researchNotes ? `\n\nAPUNTES:\n${researchNotes}` : ''}`
  }

  // Tramo actual del speech según los segundos transcurridos
  const speechElapsed = 60 - speechTimeLeft
  const currentSegment = SPEECH_SEGMENTS.find(sg => speechElapsed >= sg.from && speechElapsed < sg.to) || SPEECH_SEGMENTS[3]

  const handleCopyKeywords = () => {
    let textToCopy = ''
    if (isFusionMode && fusionTopics.length === 2) {
      textToCopy = `CHOQUE DE REINOS (FUSIÓN):\n1) ${fusionTopics[0].title}: ${fusionTopics[0].keywords.join(', ')}\n2) ${fusionTopics[1].title}: ${fusionTopics[1].keywords.join(', ')}\nMisión: Encontrar el patrón o metáfora que conecta ambos dominios.`
    } else if (selectedTopic) {
      textToCopy = `Tema: ${selectedTopic.title}\nCategoría: ${selectedTopic.category} (${selectedTopic.level || 'General'})\nPalabras Clave: ${selectedTopic.keywords.join(', ')}\nPreguntas:\n${selectedTopic.questions.map(q => `- ${q}`).join('\n')}`
    }
    navigator.clipboard.writeText(textToCopy)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2500)
  }

  const handleCopyAIPrompt = () => {
    let promptStr = ''
    if (isFusionMode && fusionTopics.length === 2) {
      promptStr = `Actúa como un profesor universitario transdisciplinario y polímata. Necesito investigar el choque y fusión entre dos ramas aparentemente distintas:\n\nTEMA A: "${fusionTopics[0].title}" (Palabras clave: ${fusionTopics[0].keywords.join(', ')})\nTEMA B: "${fusionTopics[1].title}" (Palabras clave: ${fusionTopics[1].keywords.join(', ')})\n\nPor favor explícame en 3 minutos:\n1. Qué principios fundamentales rigen cada uno.\n2. ¿Qué metáfora, principio físico, matemático o psicológico conecta a ambos temas?\n3. Proponme un proyecto o experimento práctico para aplicar esta fusión en la vida real.`
    } else if (selectedTopic) {
      promptStr = `Actúa como un investigador científico y mentor técnico nivel experto. Explícame el tema ultra-técnico "${selectedTopic.title}" (Categoría: ${selectedTopic.category}, Nivel: ${selectedTopic.level || 'General'}).\n\nPalabras Clave: ${selectedTopic.keywords.join(', ')}.\n\nPor favor estructúrate así:\n1. Principios teóricos, fórmulas matemáticas o mecanismos moleculares/algorítmicos exactos.\n2. Los 3 aspectos más complejos o contraintuitivos sobre su funcionamiento real.\n3. Respuestas concisas a estas preguntas:\n${selectedTopic.questions.map(q => `- ${q}`).join('\n')}\n4. Aplicación práctica en la ingeniería, medicina o sistemas modernos.`
    }
    navigator.clipboard.writeText(promptStr)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2500)
  }

  const handleSearchGoogle = (kw) => {
    const query = encodeURIComponent(kw || selectedTopic?.title || '')
    window.open(`https://www.google.com/search?q=${query}`, '_blank')
  }

  const handleAddTopic = () => {
    if (!newTitle.trim()) return
    const created = {
      id: Date.now().toString(),
      category: newCategory,
      level: newLevel,
      title: newTitle.trim(),
      emoji: newEmoji || '🔍',
      keywords: newKeywords.split(',').map(k => k.trim()).filter(Boolean),
      questions: newQuestions.split('\n').map(q => q.trim()).filter(Boolean),
      quote: newQuote.trim() || undefined
    }
    setTopics(prev => [created, ...prev])
    setShowAddModal(false)
    setNewTitle('')
    setNewKeywords('')
    setNewQuestions('')
    setNewQuote('')
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getLevelBadgeColor = (lvl) => {
    switch (lvl) {
      case 'Básico': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'Intermedio': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'Avanzado': return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'TECNICO-death': return 'bg-purple-950 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.3)] animate-pulse'
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-screen w-full pt-20 px-4 md:px-8 pb-12 text-gray-100"
      style={{ fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title Banner */}
        <div className="relative p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-orange-950/30 overflow-hidden shadow-2xl">
          <div className="hud-scanline" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="text-orange-400 animate-spin-slow" size={28} />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-white">
                  RULETA DE INVESTIGACIÓN <span className="text-orange-500">&amp; ENCICLOPEDIA</span>
                </h1>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Motor de curiosidad transdisciplinaria. Incluye modo <strong className="text-pink-400">☠️ TECNICO-death</strong> de máxima rigurosidad concreta.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetTopics}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-xl transition-all border border-neutral-700 flex items-center gap-1.5 text-xs font-bold"
                title="Sincronizar y cargar el banco completo actualizado"
              >
                <RefreshCw size={16} />
                Cargar Banco
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 text-sm uppercase tracking-wider"
              >
                <Plus size={18} />
                Añadir Tema
              </button>
            </div>
          </div>
        </div>

        {/* MAIN ROULETTE & TOPIC DISPLAY VIEW */}
        {phase === 'roulette' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Controls & Wheel */}
            <div className="lg:col-span-6 flex flex-col items-center gap-5 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 backdrop-blur-sm">
              
              {/* Single Spin vs Dual Fusion Mode Toggle */}
              <div className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-xs uppercase font-extrabold text-gray-300 tracking-wider flex items-center gap-2">
                  <Dices className={isFusionMode ? 'text-purple-400' : 'text-orange-400'} size={18} />
                  Modo de Giro:
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsFusionMode(false)
                      setSelectedTopic(null)
                      setFusionTopics([])
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isFusionMode ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' : 'bg-neutral-800 text-gray-400'
                    }`}
                  >
                    Giro Individual
                  </button>
                  <button
                    onClick={() => {
                      setIsFusionMode(true)
                      setSelectedTopic(null)
                      setFusionTopics([])
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isFusionMode ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 animate-pulse' : 'bg-neutral-800 text-gray-400'
                    }`}
                  >
                    <Zap size={14} /> Giro Doble (Fusión)
                  </button>
                </div>
              </div>

              {/* Level Filter Pills */}
              <div className="w-full">
                <label className="text-[11px] uppercase font-bold text-gray-400 tracking-widest block mb-1.5">
                  Filtrar Nivel de Dificultad:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {LEVELS.map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedLevel(lvl)
                        setSelectedTopic(null)
                        setFusionTopics([])
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                        selectedLevel === lvl
                          ? lvl === 'TECNICO-death' 
                            ? 'bg-purple-950 text-pink-300 border-pink-500 font-bold shadow-[0_0_10px_rgba(236,72,153,0.4)]' 
                            : 'bg-neutral-200 text-black border-white font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'Básico' ? '🟢 Básico' : lvl === 'Intermedio' ? '🟡 Intermedio' : lvl === 'Avanzado' ? '🔴 Avanzado' : lvl === 'TECNICO-death' ? '☠️ DEATH' : '🌐 Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="w-full">
                <label className="text-[11px] uppercase font-bold text-orange-400 tracking-widest block mb-1.5">
                  Filtrar Categorías ({filteredTopics.length} temas)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 scrollbar-thin">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setSelectedTopic(null)
                        setFusionTopics([])
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === cat
                          ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                          : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roulette Wheel Visual Container */}
              <div className="relative flex flex-col items-center my-2">
                
                {/* Top Arrow Pointer */}
                <div className={`absolute -top-4 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] ${isFusionMode ? 'border-t-purple-500' : selectedLevel === 'TECNICO-death' ? 'border-t-pink-500' : 'border-t-orange-500'} filter drop-shadow-[0_4px_8px_rgba(var(--accent-rgb),0.8)]`} />

                {/* Canvas Wheel */}
                <div className="relative p-2 bg-neutral-950 rounded-full border-2 border-orange-500/30 shadow-[0_0_40px_rgba(var(--accent-rgb),0.15)]">
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={360}
                    className="cursor-pointer transition-transform"
                    onClick={spinWheel}
                  />
                </div>

                {/* Spin Action Button */}
                <button
                  onClick={spinWheel}
                  disabled={isSpinning || filteredTopics.length === 0}
                  className={`mt-5 px-8 py-3.5 rounded-xl font-extrabold tracking-widest text-lg transition-all flex items-center gap-3 shadow-xl ${
                    isSpinning || filteredTopics.length === 0
                      ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                      : isFusionMode
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30 hover:scale-105 active:scale-95'
                        : selectedLevel === 'TECNICO-death'
                          ? 'bg-gradient-to-r from-purple-900 via-pink-600 to-red-600 hover:from-purple-800 hover:to-pink-500 text-white shadow-pink-500/40 hover:scale-105 active:scale-95'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-orange-500/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  <RotateCw className={isSpinning ? 'animate-spin' : ''} size={22} />
                  {isSpinning ? 'GIRANDO...' : isFusionMode ? 'FUSIONAR 2 TEMAS' : selectedLevel === 'TECNICO-death' ? 'GIRAR TECNICO-DEATH' : 'GIRAR RULETA'}
                </button>
              </div>

            </div>

            {/* Right Column: Selected Topic Details */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <AnimatePresence mode="wait">
                
                {/* DUAL FUSION MODE DISPLAY */}
                {isFusionMode && fusionTopics.length === 2 ? (
                  <motion.div
                    key="fusion-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 rounded-2xl bg-neutral-900/90 border-2 border-purple-500/40 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    <div className="hud-scanline" />

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={14} /> CHOQUE DE REINOS (FUSIÓN TRANSDISCIPLINARIA)
                      </span>
                    </div>

                    {/* Dual Topics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fusionTopics.map((top, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-400 font-bold block">{top.category}</span>
                            <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getLevelBadgeColor(top.level)}`}>
                              {top.level}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-white flex items-center gap-2">
                            <span>{top.emoji}</span> {top.title}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {top.keywords.map((kw, kIdx) => (
                              <span key={kIdx} className="px-2 py-0.5 rounded bg-neutral-900 text-gray-300 text-[10px] font-mono">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fusion Challenge Question */}
                    <div className="p-4 rounded-xl bg-purple-950/30 border-l-4 border-purple-500 text-purple-200 text-sm space-y-1">
                      <strong className="text-purple-400 font-bold block uppercase text-xs">Misión de Convergencia:</strong>
                      <p>
                        ¿Qué principio, metáfora física, matemática o psicológica conecta a <strong className="text-white">{fusionTopics[0].title}</strong> con <strong className="text-white">{fusionTopics[1].title}</strong>?
                      </p>
                    </div>

                    {/* Actions: Copy Prompt & Pomodoro Duration */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyKeywords}
                        className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-neutral-700"
                      >
                        {copySuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copySuccess ? '¡Copiado!' : 'Copiar Palabras Clave'}
                      </button>

                      <button
                        onClick={handleCopyAIPrompt}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-purple-500/40"
                      >
                        {promptCopied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Bot size={14} />}
                        {promptCopied ? '¡Prompt Copiado!' : 'Copiar Prompt para IA'}
                      </button>
                    </div>

                    {/* Start Pomodoro buttons */}
                    <div className="pt-4 border-t border-neutral-800">
                      <label className="text-xs uppercase font-bold text-gray-400 tracking-wider block mb-2">
                        Iniciar Pomodoro de Investigación Combinada:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 12, 15].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => startResearchPhase(mins)}
                            className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all border border-purple-500/40 flex items-center justify-center gap-1.5"
                          >
                            <Clock size={14} /> {mins} Minutos
                          </button>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : selectedTopic ? (

                  /* SINGLE TOPIC DISPLAY */
                  <motion.div
                    key={selectedTopic.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-6 rounded-2xl bg-neutral-900/80 border ${selectedTopic.level === 'TECNICO-death' ? 'border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.2)]' : 'border-orange-500/30'} shadow-2xl space-y-6 relative overflow-hidden`}
                  >
                    <div className="hud-scanline" />

                    {/* Topic Category & Level Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        {selectedTopic.category}
                      </span>

                      {selectedTopic.level && (
                        <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase flex items-center gap-1 ${getLevelBadgeColor(selectedTopic.level)}`}>
                          {selectedTopic.level === 'TECNICO-death' && <Skull size={14} className="text-pink-400" />}
                          {selectedTopic.level}
                        </span>
                      )}
                    </div>

                    {/* Topic Title */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                        <span className="text-3xl">{selectedTopic.emoji}</span>
                        {selectedTopic.title}
                      </h2>
                    </div>

                    {/* Quote */}
                    {selectedTopic.quote && (
                      <div className="p-4 rounded-xl bg-orange-950/20 border-l-4 border-orange-500 text-orange-200 text-sm italic flex items-start gap-3">
                        <Quote size={20} className="text-orange-400 shrink-0 mt-0.5" />
                        <p>{selectedTopic.quote}</p>
                      </div>
                    )}

                    {/* Key Words */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs uppercase font-extrabold tracking-widest text-orange-400 flex items-center gap-1.5">
                          <Tag size={14} /> Palabras Clave
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyAIPrompt}
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-bold"
                          >
                            {promptCopied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Bot size={13} />}
                            {promptCopied ? '¡Prompt Copiado!' : 'Copiar Prompt IA'}
                          </button>
                          <span className="text-gray-600">|</span>
                          <button
                            onClick={handleCopyKeywords}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-400 transition-colors"
                          >
                            {copySuccess ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            {copySuccess ? '¡Copiado!' : 'Copiar todo'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedTopic.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            onClick={() => handleSearchGoogle(kw)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-gray-200 text-xs font-mono font-medium hover:border-orange-500 hover:text-orange-400 cursor-pointer transition-all flex items-center gap-1.5 group"
                            title="Haz clic para buscar en Google"
                          >
                            {kw}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Questions */}
                    {selectedTopic.questions && selectedTopic.questions.length > 0 && (
                      <div>
                        <h3 className="text-xs uppercase font-extrabold tracking-widest text-orange-400 flex items-center gap-1.5 mb-2">
                          <Lightbulb size={14} /> Preguntas Sugeridas
                        </h3>
                        <ul className="space-y-2">
                          {selectedTopic.questions.map((q, idx) => (
                            <li key={idx} className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-sm text-gray-300 flex items-start gap-2.5">
                              <ChevronRight size={16} className="text-orange-400 shrink-0 mt-0.5" />
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Start Pomodoro */}
                    <div className="pt-4 border-t border-neutral-800">
                      <label className="text-xs uppercase font-bold text-gray-400 tracking-wider block mb-3">
                        Duración del Pomodoro de Investigación:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[10, 12, 15].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => startResearchPhase(mins)}
                            className="p-3 rounded-xl bg-neutral-800 hover:bg-orange-500 hover:text-black font-bold text-center transition-all border border-neutral-700 hover:border-orange-500 text-sm flex flex-col items-center gap-1"
                          >
                            <Clock size={16} /> {mins} Minutos
                          </button>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 text-gray-500">
                    <Sparkles size={48} className="text-orange-500/40 mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">
                      {isFusionMode ? 'Gira para Fusionar 2 Temas' : 'Gira la Ruleta Enciclopédica'}
                    </h3>
                    <p className="text-sm max-w-md text-gray-400">
                      {isFusionMode
                        ? 'El modo Fusión seleccionará 2 disciplinas distintas para desafiarte a encontrar la metáfora que las conecta.'
                        : 'Elige tu nivel de dificultad (Básico, Intermedio, Avanzado, ☠️ TECNICO-death) o categoría y haz clic en GIRAR RULETA.'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* PHASE 1: RESEARCH TIMER VIEW (10-15 min) */}
        {phase === 'research' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Timer Display */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-neutral-900/90 border border-orange-500/30 flex flex-col items-center justify-center text-center shadow-2xl relative">
              <div className="hud-scanline" />
              
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-widest mb-4">
                FASE 1: INVESTIGACIÓN LIBRE ({researchDurationMinutes} MIN)
              </span>

              <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                {isFusionMode && fusionTopics.length === 2 ? (
                  <span>⚡ FUSIÓN: {fusionTopics[0].title} + {fusionTopics[1].title}</span>
                ) : (
                  <span>{selectedTopic?.emoji || '🔍'} {selectedTopic?.title || 'Tema de Investigación'}</span>
                )}
              </h2>

              {/* Big Timer */}
              <div className="relative my-6 flex items-center justify-center w-64 h-64 rounded-full border-4 border-orange-500/20 bg-neutral-950 shadow-[0_0_50px_rgba(var(--accent-rgb),0.1)]">
                <div className="flex flex-col items-center">
                  <span className="text-5xl md:text-6xl font-mono font-black text-orange-400 tracking-wider">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs uppercase text-gray-400 tracking-widest mt-2">
                    {timerActive ? '● Tiempo corriendo' : '❚❚ En pausa'}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold flex items-center gap-2 transition-all"
                >
                  {timerActive ? <Pause size={18} /> : <Play size={18} />}
                  {timerActive ? 'Pausar' : 'Reanudar'}
                </button>

                <button
                  onClick={() => {
                    setTimerActive(false)
                    setTimeLeft(researchDurationMinutes * 60)
                  }}
                  className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 transition-colors"
                  title="Reiniciar Timer"
                >
                  <RefreshCw size={18} />
                </button>

                <button
                  onClick={goToFilter}
                  className="px-5 py-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-bold text-sm transition-all border border-amber-500/40 flex items-center gap-1.5"
                >
                  <Filter size={15} /> Filtrar →
                </button>
              </div>
            </div>

            {/* Right: Research Notes */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Prompt AI Copy Bar */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-purple-300 font-bold uppercase">
                  <Bot size={18} /> ¿Investigando con IA?
                </div>
                <button
                  onClick={handleCopyAIPrompt}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {promptCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {promptCopied ? '¡Prompt Copiado!' : 'Copiar Prompt para ChatGPT / Gemini'}
                </button>
              </div>

              {/* Research Notes Textarea */}
              <div className="flex-1 p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase font-extrabold text-orange-400 tracking-widest flex items-center gap-2">
                    <BookOpen size={16} />
                    Notas Rápidas de Investigación (Apuntes durante el Pomodoro)
                  </label>
                </div>

                <textarea
                  value={researchNotes}
                  onChange={(e) => setResearchNotes(e.target.value)}
                  placeholder="Escribe aquí los datos más curiosos, fechas, fórmulas, la metáfora de conexión o citas que descubras..."
                  className="w-full flex-1 min-h-[220px] p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-gray-200 text-sm focus:border-orange-500 focus:outline-none resize-none font-mono"
                />
              </div>

            </div>
          </motion.div>
        )}

        {/* PHASE 1.5: FILTRO — destilar los apuntes en un guion de 1 minuto */}
        {phase === 'filter' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            {/* Cabecera con timer */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="hud-scanline" />
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Filter size={13} /> Fase 2: Filtro
                </span>
                <h2 className="text-xl font-bold text-white mt-2">Quédate solo con lo que cabe en 1 minuto</h2>
                <p className="text-sm text-gray-400">Toca tus apuntes para pasarlos al guion, o escribe directo. No tiene que ser perfecto.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-center px-4 py-2 rounded-xl border ${filterTimeLeft === 0 ? 'border-red-500/50 bg-red-500/10' : 'border-amber-500/30 bg-neutral-950'}`}>
                  <p className={`text-3xl font-mono font-black ${filterTimeLeft === 0 ? 'text-red-400' : 'text-amber-400'}`}>{formatTime(filterTimeLeft)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">{filterTimeLeft === 0 ? '¡a exponer!' : 'para filtrar'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Fuentes: apuntes + keywords */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
                <div>
                  <p className="text-xs uppercase font-extrabold text-orange-400 tracking-widest mb-2">Tus apuntes</p>
                  {noteLines.length === 0 ? (
                    <p className="text-sm text-gray-500">No escribiste apuntes. Escribe el guion directo con lo que recuerdes: eso también es práctica de recuperación.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                      {noteLines.map((line, i) => {
                        const used = usedInScript(line)
                        return (
                          <button
                            key={i}
                            onClick={() => pushToScript(line)}
                            disabled={used}
                            className={`text-left text-sm px-3 py-2 rounded-lg border transition-all ${used ? 'border-emerald-500/30 bg-emerald-500/5 text-gray-500 line-through' : 'border-neutral-700 bg-neutral-950 text-gray-200 hover:border-amber-500/60 hover:bg-amber-500/5'}`}
                          >
                            {used ? '✓ ' : '+ '}{line}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {topicKeywords.length > 0 && (
                  <div>
                    <p className="text-xs uppercase font-extrabold text-gray-400 tracking-widest mb-2">Palabras clave del tema</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topicKeywords.map((k, i) => (
                        <button key={i} onClick={() => pushToScript(k)} disabled={usedInScript(k)}
                          className="text-xs px-2.5 py-1 rounded-full border border-neutral-700 text-gray-300 hover:border-amber-500/60 disabled:opacity-40">
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Guion */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-neutral-900/90 border border-amber-500/20 space-y-4">
                <p className="text-xs uppercase font-extrabold text-amber-400 tracking-widest">Guion de 1 minuto</p>
                {SPEECH_SEGMENTS.map(sg => (
                  <div key={sg.key}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-bold text-white">{sg.emoji} {sg.label}</span>
                      <span className="text-[10px] font-mono text-gray-500">{sg.from}–{sg.to}s</span>
                    </div>
                    {sg.key === 'ideas' ? (
                      <div className="space-y-1.5">
                        {script.ideas.map((idea, i) => (
                          <div key={i} className="flex gap-1.5">
                            <input
                              value={idea}
                              onChange={e => setScript(sc => { const ideas = [...sc.ideas]; ideas[i] = e.target.value; return { ...sc, ideas } })}
                              placeholder={`Idea ${i + 1}`}
                              className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
                            />
                            {idea && (
                              <button onClick={() => setScript(sc => { const ideas = [...sc.ideas]; ideas[i] = ''; return { ...sc, ideas } })}
                                className="px-2 text-gray-500 hover:text-red-400" aria-label={`Quitar idea ${i + 1}`}><X size={14} /></button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        value={script[sg.key]}
                        onChange={e => setScript(sc => ({ ...sc, [sg.key]: e.target.value }))}
                        placeholder={sg.key === 'hook' && isFusionMode ? 'La metáfora que conecta ambos temas…' : sg.hint}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-gray-200 focus:border-amber-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={startSpeech}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all ${filterTimeLeft === 0 ? 'bg-amber-400 text-black animate-pulse' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
                  >
                    <Mic size={18} /> Exponer (1 min) →
                  </button>
                  <button onClick={() => { setPhase('research'); setFilterActive(false) }} className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-sm">
                    ← Apuntes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: SPEECH TIMER VIEW (1 MIN) */}
        {phase === 'speech' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-neutral-900/95 border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] max-w-3xl mx-auto flex flex-col items-center text-center space-y-6 relative overflow-hidden"
          >
            <div className="hud-scanline" />

            <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <Mic size={16} className="animate-pulse" />
              FASE 3: EXPOSICIÓN ORAL (TÉCNICA FEYNMAN)
            </span>

            <div>
              <h2 className="text-2xl font-black text-white">
                ¡Habla en voz alta durante 1 minuto!
              </h2>
              <p className="text-sm text-gray-400 max-w-md mt-2">
                {isFusionMode && fusionTopics.length === 2
                  ? `Explica con tus palabras la metáfora que conecta ${fusionTopics[0].title} con ${fusionTopics[1].title}.`
                  : `Explica con tus propias palabras lo que aprendiste sobre ${selectedTopic?.title}.`}
              </p>
            </div>

            {/* Speech 60-second Timer */}
            <div className={`relative flex flex-col items-center justify-center rounded-full border-4 border-amber-500 bg-neutral-950 shadow-2xl ${scriptHasContent(script) ? 'w-36 h-36 my-1' : 'w-56 h-56 my-4'}`}>
              <span className={`font-mono font-black text-amber-400 tracking-wider ${scriptHasContent(script) ? 'text-5xl' : 'text-6xl'}`}>
                {speechTimeLeft}s
              </span>
              <span className="text-xs uppercase text-gray-400 tracking-widest mt-2">
                {speechActive ? '🎤 Hablando...' : '❚❚ En Pausa'}
              </span>
            </div>

            {/* Speech Wave visual simulation */}
            <div className="flex items-center gap-1.5 h-8">
              {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30].map((h, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: speechActive ? [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] : '20%' }}
                  transition={{ repeat: Infinity, duration: 0.6 + idx * 0.1, ease: 'easeInOut' }}
                  className="w-1.5 bg-amber-400 rounded-full"
                />
              ))}
            </div>

            {/* Guion con el tramo actual resaltado */}
            {scriptHasContent(script) && (
              <div className="w-full text-left space-y-2">
                <div className="flex gap-1">
                  {SPEECH_SEGMENTS.map(sg => (
                    <div key={sg.key} className="h-1.5 rounded-full overflow-hidden bg-neutral-800" style={{ flex: sg.to - sg.from }}>
                      <div className="h-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(0, ((speechElapsed - sg.from) / (sg.to - sg.from)) * 100))}%` }} />
                    </div>
                  ))}
                </div>
                {SPEECH_SEGMENTS.map(sg => {
                  const isNow = sg.key === currentSegment.key
                  const content = sg.key === 'ideas' ? script.ideas.filter(Boolean) : script[sg.key]
                  if (!content || (Array.isArray(content) && content.length === 0)) return null
                  return (
                    <div key={sg.key} className={`p-3 rounded-xl border transition-all ${isNow ? 'border-amber-400 bg-amber-500/10 scale-[1.02]' : 'border-neutral-800 bg-neutral-950 opacity-50'}`}>
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${isNow ? 'text-amber-400' : 'text-gray-500'}`}>{sg.emoji} {sg.label} · {sg.from}–{sg.to}s</p>
                      {Array.isArray(content)
                        ? <ul className={`space-y-0.5 ${isNow ? 'text-lg text-white' : 'text-sm text-gray-400'}`}>{content.map((c, i) => <li key={i}>{i + 1}. {c}</li>)}</ul>
                        : <p className={isNow ? 'text-lg text-white' : 'text-sm text-gray-400'}>{content}</p>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Notes Reminder (si no armaste guion) */}
            {!scriptHasContent(script) && researchNotes && (
              <div className="w-full p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs text-gray-300 font-mono max-h-32 overflow-y-auto">
                <span className="text-amber-400 font-bold block mb-1">Tus Notas Rápidas:</span>
                {researchNotes}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSpeechActive(!speechActive)}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center gap-2 transition-all"
              >
                {speechActive ? <Pause size={18} /> : <Play size={18} />}
                {speechActive ? 'Pausar Exposición' : 'Continuar Exposición'}
              </button>

              <button
                onClick={() => {
                  setSpeechActive(false)
                  setPhase('completed')
                  if (onCompleteSession) {
                    const titleStr = isFusionMode && fusionTopics.length === 2
                      ? `FUSIÓN: ${fusionTopics[0].title} + ${fusionTopics[1].title}`
                      : selectedTopic ? selectedTopic.title : 'Investigación Libre'
                    onCompleteSession({
                      topic: titleStr,
                      notes: buildSessionNotes(),
                      durationMinutes: researchDurationMinutes + 1
                    })
                  }
                }}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold flex items-center gap-2 transition-all"
              >
                <CheckCircle2 size={18} />
                Finalizar Ahora
              </button>
            </div>

          </motion.div>
        )}

        {/* PHASE 3: COMPLETED CELEBRATION VIEW */}
        {phase === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-neutral-900 border-2 border-emerald-500/50 text-center max-w-xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <Award size={48} />
            </div>

            <h2 className="text-3xl font-extrabold text-white">
              ¡Investigación &amp; Exposición Completadas!
            </h2>
            <p className="text-gray-300 text-sm">
              Has ejercitado tu pensamiento transdisciplinario y retención activa Feynman. ¡Excelente sesión de foco!
            </p>

            <button
              onClick={() => {
                setPhase('roulette')
                setSelectedTopic(null)
                setFusionTopics([])
                setResearchNotes('')
                setScript(EMPTY_SCRIPT)
              }}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              Girar la Ruleta de Nuevo
            </button>
          </motion.div>
        )}

      </div>

      {/* MODAL FOR ADDING A CUSTOM TOPIC */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-neutral-900 border border-orange-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Plus className="text-orange-400" size={20} />
                  Añadir Nuevo Tema a la Ruleta
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Título del Tema *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Modulación Alostérica en Receptores GABA"
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none"
                    >
                      {CATEGORIES.filter(c => c !== 'Todas').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Nivel</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Básico">🟢 Básico</option>
                      <option value="Intermedio">🟡 Intermedio</option>
                      <option value="Avanzado">🔴 Avanzado</option>
                      <option value="TECNICO-death">☠️ TECNICO-death</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Emoji</label>
                    <input
                      type="text"
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      placeholder="☠️"
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Palabras Clave (por comas)</label>
                    <input
                      type="text"
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      placeholder="Ej: GABA-A, Cloro, PAMs, Ansiolíticos"
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Preguntas de Investigación (una por línea)</label>
                  <textarea
                    value={newQuestions}
                    onChange={(e) => setNewQuestions(e.target.value)}
                    placeholder="¿Cómo funciona la entrada de iones cloro?&#10;¿Qué diferencia a un modulador de un agonista directo?"
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none h-20 resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 block mb-1">Cita o Procedencia (Opcional)</label>
                  <input
                    type="text"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    placeholder="Ej: 'El cerebro es un bosque de transmisión química.'"
                    className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-orange-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-neutral-800">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTopic}
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold disabled:opacity-50"
                >
                  Guardar Tema
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
