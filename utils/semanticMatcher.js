// ============================================================================
// DimePrecio.es — Motor Semántico de Detección Inteligente de Provincias,
// Sectores y Generador de Títulos Dinámicos e Innovadores
// ============================================================================
const rr = require('./rankRentEngine');
const geo = require('./geoDetector');

// Diccionario de municipios secundarios y comarcas mapeados a su provincia
const MUNICIPALITY_TO_PROVINCE = {
  'artesa de segre': 'lleida',
  'tarrega': 'lleida',
  'balaguer': 'lleida',
  'mollerussa': 'lleida',
  'la seu d urgell': 'lleida',
  'cervera': 'lleida',
  'elche': 'alicante',
  'torrevieja': 'alicante',
  'orihuela': 'alicante',
  'benidorm': 'alicante',
  'alcoy': 'alicante',
  'elda': 'alicante',
  'denia': 'alicante',
  'vigo': 'pontevedra',
  'gijon': 'asturias',
  'oviedo': 'asturias',
  'aviles': 'asturias',
  'hospitalet': 'barcelona',
  'badalona': 'barcelona',
  'terrassa': 'barcelona',
  'sabadell': 'barcelona',
  'mataro': 'barcelona',
  'santa coloma': 'barcelona',
  'sant cugat': 'barcelona',
  'manresa': 'barcelona',
  'alcala de henares': 'madrid',
  'mostoles': 'madrid',
  'fuenlabrada': 'madrid',
  'leganes': 'madrid',
  'getafe': 'madrid',
  'alcorcon': 'madrid',
  'parla': 'madrid',
  'torrejon de ardoz': 'madrid',
  'alcobendas': 'madrid',
  'las rozas': 'madrid',
  'san sebastian de los reyes': 'madrid',
  'pozuelo': 'madrid',
  'majadahonda': 'madrid',
  'jerez': 'cadiz',
  'algeciras': 'cadiz',
  'san fernando': 'cadiz',
  'el puerto de santa maria': 'cadiz',
  'chiclana': 'cadiz',
  'dos hermanas': 'sevilla',
  'alcala de guadaira': 'sevilla',
  'marbella': 'malaga',
  'mijas': 'malaga',
  'fuengirola': 'malaga',
  'velez malaga': 'malaga',
  'torremolinos': 'malaga',
  'benalmadena': 'malaga',
  'estepona': 'malaga',
  'cartagena': 'murcia',
  'lorca': 'murcia',
  'molina de segura': 'murcia',
  'talavera': 'toledo',
  'puertollano': 'ciudad-real',
  'tomelloso': 'ciudad-real',
  'ponferrada': 'leon',
  'san cristobal de la laguna': 'santa-cruz-de-tenerife',
  'arona': 'santa-cruz-de-tenerife',
  'telde': 'las-palmas',
  'barakaldo': 'vizcaya',
  'getxo': 'vizcaya',
  'portugalete': 'vizcaya',
  'irun': 'guipuzcoa',
  'roquetas de mar': 'almeria',
  'el ejido': 'almeria',
  'santiago de compostela': 'la-coruna',
  'ferrol': 'la-coruna',
};

// Diccionario de palabras clave por sector (para no caer siempre en "reformas-integrales")
const SECTOR_KEYWORDS = [
  {
    slug: 'puertas-automaticas-garajes',
    keywords: ['puerta automatica', 'puertas automaticas', 'marcado ce', 'garaje', 'persiana metalica', 'cancela', 'motor corredera', 'cierre enrollable', 'automatismo', 'puertas de garaje']
  },
  {
    slug: 'electricistas-boletines',
    keywords: ['boletin', 'boletín', 'electrico', 'eléctrico', 'electricista', 'electricistas', 'cuadro electrico', 'cuadro de luz', 'enchufe', 'potencia', 'monofasico', 'trifasico', 'cie', 'instalacion electrica', 'cortocircuito']
  },
  {
    slug: 'fontaneria-desatascos',
    keywords: ['fontanero', 'fontaneros', 'fontaneria', 'fuga', 'fugas', 'atasco', 'desatasco', 'desatascos', 'tuberia', 'tuberias', 'grifo', 'cisterna', 'bote sifonico', 'bajante', 'arquetas', 'desague']
  },
  {
    slug: 'cerrajeros-24h',
    keywords: ['cerrajero', 'cerrajeros', 'cerradura', 'cerraduras', 'bombin', 'bombín', 'apertura de puerta', 'abrir puerta', 'llaves', 'desahucio', 'cerrojo', 'puerta blindada', 'puerta acorazada', 'ganzuado', 'fac']
  },
  {
    slug: 'climatizacion-aire-acondicionado',
    keywords: ['aire acondicionado', 'climatizacion', 'split', 'caldera', 'calderas', 'calefaccion', 'radiador', 'radiadores', 'termo', 'recarga gas', 'bomba de calor', 'conductos']
  },
  {
    slug: 'placas-solares-aerotermia',
    keywords: ['aerotermia', 'placas solares', 'solar', 'fotovoltaica', 'paneles solares', 'inversor solar', 'autoconsumo', 'baterias solares']
  },
  {
    slug: 'pintores-alisado-paredes',
    keywords: ['pintor', 'pintores', 'pintar', 'pintura', 'alisado', 'alisar', 'gotelet', 'gota', 'estuco', 'lacar puertas', 'empapelar']
  },
  {
    slug: 'tejados-cubiertas',
    keywords: ['tejado', 'tejados', 'cubierta', 'cubiertas', 'goteras', 'retejado', 'tejas', 'onduline', 'impermeabilizacion', 'filtraciones', 'canalones', 'chimenea']
  },
  {
    slug: 'carpinteria-aluminio-ventanas-pvc',
    keywords: ['ventana', 'ventanas', 'aluminio', 'pvc', 'cristal', 'cristaleria', 'climalit', 'mosquitera', 'mosquiteras', 'cerramiento', 'contraventanas']
  },
  {
    slug: 'mudanzas-guardamuebles',
    keywords: ['mudanza', 'mudanzas', 'portes', 'guardamuebles', 'traslado', 'embalaje', 'vaciado de pisos']
  },
  {
    slug: 'control-plagas-desinfeccion',
    keywords: ['plagas', 'cucarachas', 'chinches', 'ratas', 'ratones', 'fumigacion', 'desratizacion', 'desinsectacion', 'termitas', 'carcoma']
  },
  {
    slug: 'jardineria-piscinas',
    keywords: ['piscina', 'piscinas', 'jardin', 'jardineria', 'cesped', 'poda', 'depuradora', 'gresite', 'clorador salino', 'riego automatico']
  },
  {
    slug: 'instalacion-suelos-parquet',
    keywords: ['parquet', 'parque', 'tarima', 'tarima flotante', 'acuchillar', 'pulir suelo', 'microcemento', 'pavimento', 'suelo laminado', 'gres']
  },
  {
    slug: 'aislamiento-termico-humedades',
    keywords: ['aislamiento', 'sate', 'humedad', 'humedades', 'condensacion', 'capilaridad', 'lana de roca', 'corcho', 'poliuretano']
  },
  {
    slug: 'empresas-limpieza-cristales',
    keywords: ['limpieza', 'limpieza a fondo', 'cristales', 'fin de obra', 'limpieza comunidades', 'abrillantado']
  },
  {
    slug: 'abogados-especialistas',
    keywords: ['abogado', 'abogados', 'demanda', 'herencia', 'herencias', 'divorcio', 'indemnizacion', 'laboral', 'penal', 'despido', 'clausula suelo']
  },
  {
    slug: 'asesorias-gestorias',
    keywords: ['asesoria', 'gestoria', 'autonomos', 'declaracion renta', 'impuestos', 'iva', 'sociedades', 'contabilidad']
  },
  {
    slug: 'arquitectos-licencias',
    keywords: ['arquitecto', 'arquitectos', 'licencia de obras', 'ite', 'iee', 'cedula habitabilidad', 'segregacion', 'plano', 'tasacion']
  },
  {
    slug: 'reformas-integrales',
    keywords: ['reforma', 'reformas', 'cocina', 'cocinas', 'baño', 'baños', 'bañera por ducha', 'plato de ducha', 'alicatar', 'albañil', 'albañileria', 'derribo', 'tabique']
  }
];

function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detecta inteligentemente la provincia y sector de una búsqueda o texto de artículo,
 * evitando que todo caiga en "madrid" y "reformas-integrales".
 */
function detectProvinceAndSector(text, fallbackProv = null, fallbackSector = null) {
  const norm = normalizeText(text);
  const allLocations = rr.getLocations(false);
  const allSectors = rr.getSectors(false);

  // 1. Detección de provincia
  let detectedProv = null;

  // A) Comprobar municipios secundarios del mapa
  for (const [muni, provSlug] of Object.entries(MUNICIPALITY_TO_PROVINCE)) {
    if (norm.includes(muni)) {
      detectedProv = rr.getLocationBySlug(provSlug);
      if (detectedProv) break;
    }
  }

  // B) Comprobar con geoDetector nativo
  if (!detectedProv) {
    detectedProv = geo.matchProvinceByText(text);
  }

  // C) Comprobar nombres de provincias y municipios oficiales
  if (!detectedProv) {
    for (const loc of allLocations) {
      const locNorm = normalizeText(loc.nombre);
      if (norm.includes(locNorm)) {
        detectedProv = loc;
        break;
      }
      if (Array.isArray(loc.municipios)) {
        for (const muni of loc.municipios) {
          const mNorm = normalizeText(muni);
          if (mNorm.length >= 4 && norm.includes(mNorm)) {
            detectedProv = loc;
            break;
          }
        }
      }
      if (detectedProv) break;
    }
  }

  // D) Si no se detectó ninguna en el texto, usar fallback o aleatorizar entre provincias principales
  if (!detectedProv) {
    if (fallbackProv) {
      detectedProv = rr.getLocationBySlug(fallbackProv);
    }
    if (!detectedProv) {
      const topProvinces = ['madrid', 'barcelona', 'valencia', 'sevilla', 'malaga', 'zaragoza', 'alicante', 'vizcaya', 'murcia', 'la-coruna', 'cadiz', 'baleares', 'las-palmas', 'valladolid'];
      const randomSlug = topProvinces[Math.floor(Math.random() * topProvinces.length)];
      detectedProv = rr.getLocationBySlug(randomSlug) || allLocations[0];
    }
  }

  // 2. Detección de sector
  let detectedSector = null;

  // A) Buscar coincidencias con las palabras clave específicas
  for (const group of SECTOR_KEYWORDS) {
    for (const kw of group.keywords) {
      const kwNorm = normalizeText(kw);
      if (norm.includes(kwNorm)) {
        detectedSector = rr.getSectorBySlug(group.slug);
        break;
      }
    }
    if (detectedSector) break;
  }

  // B) Si no hay coincidencia directa en SECTOR_KEYWORDS, buscar en nombres de sectores
  if (!detectedSector) {
    for (const sec of allSectors) {
      const secNorm = normalizeText(sec.nombre);
      if (norm.includes(secNorm)) {
        detectedSector = sec;
        break;
      }
    }
  }

  // C) Si sigue sin coincidir, usar fallbackSector o aleatorizar entre sectores de alta demanda
  if (!detectedSector) {
    if (fallbackSector) {
      detectedSector = rr.getSectorBySlug(fallbackSector);
    }
    if (!detectedSector) {
      const activeSectors = allSectors.slice(0, 15);
      detectedSector = activeSectors[Math.floor(Math.random() * activeSectors.length)] || allSectors[0];
    }
  }

  return {
    province: detectedProv,
    provincia_slug: detectedProv.slug,
    provincia_nombre: detectedProv.nombre,
    sector: detectedSector,
    sector_slug: detectedSector.slug,
    sector_nombre: detectedSector.nombre
  };
}

/**
 * Asegura que el título y la provincia guardada en base de datos coincidan al 100%.
 * Si el título dice "en Barcelona", la provincia debe ser obligatoriamente 'barcelona'.
 */
function syncTitleAndProvince(title, currentProvinciaSlug) {
  const normTitle = normalizeText(title);
  const allLocations = rr.getLocations(false);

  for (const loc of allLocations) {
    const locNorm = normalizeText(loc.nombre);
    // Buscar patrones como "en barcelona", "barcelona:", "de barcelona"
    const regex = new RegExp(`\\b(en|de|para|zona)\\s+${locNorm}\\b|\\b${locNorm}\\b`, 'i');
    if (regex.test(normTitle)) {
      return loc.slug;
    }
  }
  return currentProvinciaSlug;
}

/**
 * Genera títulos dinámicos, periodísticos y con gancho, eliminando el cliché repetitivo "X en 2026".
 */
function generateDynamicTitle(topicOrOpts, provinciaNombre = null, angleIndex = null) {
  let topic = '';
  let prov = 'España';
  let index = null;

  if (typeof topicOrOpts === 'object' && topicOrOpts !== null) {
    topic = topicOrOpts.topic || topicOrOpts.prompt || topicOrOpts.sectorNombre || '';
    prov = topicOrOpts.provinciaNombre || topicOrOpts.provincia || 'España';
    index = topicOrOpts.angleIndex ?? topicOrOpts.styleIndex ?? null;
  } else {
    topic = String(topicOrOpts || '');
    prov = provinciaNombre || 'España';
    index = angleIndex;
  }

  const cleanTopic = String(topic || '').trim().replace(/[:?¿!¡]/g, '');
  const cap = cleanTopic ? (cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1)) : 'Servicios';

  const angles = [
    `¿Cuánto Cuesta Realmente ${cap} en ${prov}? Desglose y Tarifas Auditadas`,
    `Guía Práctica de ${cap} en ${prov}: Cómo Evitar Sobrecostes y Sorpresas`,
    `${cap} en ${prov}: Proceso Técnico Paso a Paso, Tiempos y Presupuesto`,
    `Presupuesto y Tarifas de ${cap} en ${prov}: Mano de Obra y Materiales`,
    `Comparativa de ${cap} en ${prov}: Qué Calidades Elegir y Precios Medios`,
    `${cap} en ${prov}: Claves de Profesionales Verificados y Garantías`,
    `Análisis de Precios: ${cap} en ${prov} y Factores que Influyen en el Coste`,
    `Todo lo que Debes Saber Antes de Contratar ${cap} en ${prov}`
  ];

  if (index !== null && typeof index === 'number') {
    return angles[index % angles.length];
  }

  const randomAngle = angles[Math.floor(Math.random() * angles.length)];
  return randomAngle;
}

module.exports = {
  detectProvinceAndSector,
  syncTitleAndProvince,
  generateDynamicTitle,
  normalizeText,
};