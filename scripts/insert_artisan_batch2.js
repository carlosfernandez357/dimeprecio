const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const ARTICLES_BATCH_2 = [
  {
    title: 'Jardineros y Mantenimiento de Piscinas en Madrid: Precios (2026)',
    slug: 'jardineros-piscinas-madrid-precios-mantenimiento',
    excerpt: '¿Cuánto cuesta el mantenimiento de jardín y piscina en Madrid? Puesta a punto, cloración salina, poda de arizónicas y césped en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&q=80',
    image_alt: 'Piscina cristalina y jardín cuidado en vivienda de Madrid',
    meta_title: 'Jardineros y Piscinas en Madrid Precios y Mantenimiento 2026 | DimePrecio.es',
    meta_description: 'Precios de jardineros y mantenimiento de piscinas en Madrid: puestas a punto desde 180€, podas y mantenimiento mensual para chalets y comunidades en DimePrecio.es.',
    keywords: 'jardineros madrid precios, mantenimiento piscinas madrid tarifas, cuanto cobra un jardinero en madrid, cloracion salina madrid precio',
    sector_slug: 'jardineria-piscinas',
    sector_nombre: 'Jardinería y Piscinas',
    sector_icono: '🌿',
    precio_min_orientativo: 180,
    precio_max_orientativo: 750,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, la <strong>puesta a punto de piscina para verano</strong> (limpieza química con ácido de paredes de gresite, revisión de bomba/filtro, reposición de arena por vidrio reciclado y ajuste químico de pH y cloro) cuesta entre <strong>190 € y 380 €</strong> en unifamiliares de zonas como Pozuelo, Las Rozas, Majadahonda o la sierra. La instalación de un <strong>clorador salino</strong> con regulador automático de pH oscila entre <strong>850 € y 1.450 €</strong>. Para servicios de <strong>jardinería</strong> (corte de césped, poda de setos y mantenimiento quincenal), las tarifas medias se sitúan entre <strong>18 € y 26 € / hora</strong> o en contratos mensuales de <strong>120 € a 280 € / mes</strong>.
  </p>
</div>

<h2>1. Tarifas de mantenimiento de jardines y piscinas en Madrid (2026)</h2>
<p>
  En urbanizaciones y chalets de la Comunidad de Madrid, el mantenimiento profesional evita la proliferación de algas verdes y previene plagas de procesionaria en pinos. Baremos de <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Jardinería / Piscina</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Frecuencia / Detalle</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Puesta a punto de piscina estándar (8x4 m)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">190 € - 360 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Lavado de filtro, desincrustado gresite y puesta en marcha</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Instalación de cloración salina + bomba dosificadora pH</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">850 € - 1.450 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Agua cristalina sin irritación en ojos ni piel</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Mantenimiento integral de jardín chalet (2 visitas/mes)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">130 € - 260 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Corte de pradera, perfilado de setos y retirada de restos</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Tala o poda en altura de árboles grandes y pinos</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">180 € - 420 € / árbol</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Con trepa profesional, camión pluma y gestión de residuos</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Puertas Automáticas de Garaje en Madrid: Precios de Motores e Instalación (2026)',
    slug: 'puertas-automaticas-garajes-madrid-precios-motores',
    excerpt: '¿Necesitas motorizar tu puerta de garaje en Madrid o reparar una avería? Precios de motores seccionales, basculantes y mandos en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=900&q=80',
    image_alt: 'Puerta automática seccional de garaje instalada en Madrid',
    meta_title: 'Puertas Automáticas de Garaje en Madrid Precios 2026 | DimePrecio.es',
    meta_description: 'Precios de motores e instalación de puertas de garaje en Madrid: motorización desde 290€, puertas seccionales y mantenimiento comunitario en DimePrecio.es.',
    keywords: 'puertas automaticas garaje madrid precios, motor puerta garaje madrid precio, arreglar puerta garaje madrid, puertas seccionales madrid presupuesto',
    sector_slug: 'puertas-automaticas-garajes',
    sector_nombre: 'Puertas Automáticas y Garajes',
    sector_icono: '🚪',
    precio_min_orientativo: 290,
    precio_max_orientativo: 1450,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el coste de <strong>motorizar una puerta de garaje existente</strong> (seccional o basculante con motor de techo de 600N a 1000N, cuadro de maniobras y 2 mandos a distancia con código evolutivo) oscila entre <strong>290 € y 580 €</strong> con instalación y conexionado eléctrico incluidos. Si se requiere una <strong>puerta seccional nueva completa con paneles térmicos sándwich de 40 mm</strong> lacada en blanco o gris antracita para un chalet, el precio medio verificado en Madrid va de <strong>1.150 € a 2.100 €</strong> según medidas. Las intervenciones urgentes para reparar muelles rotos o cables sueltos en comunidades rondan los <strong>140 € a 290 €</strong>.
  </p>
</div>

<h2>1. Tarifas de puertas automáticas en la Comunidad de Madrid (2026)</h2>
<p>
  Toda puerta automática debe cumplir la norma de seguridad europea UNE-EN 13241-1 con marcado CE y sistemas antiaplastamiento por fotocélula. Tarifas de <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Puerta Automática</th>
      <th style="padding:12px 14px;">Precio Medio Madrid</th>
      <th style="padding:12px 14px;">Detalle</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Kit de motorización puerta basculante o seccional</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">290 € - 540 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Motor electromecánico de tracción por cadena o correa silenciosa</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Puerta seccional completa automatizada (2,5 x 2,2 m)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.200 € - 1.850 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Aislamiento acústico y térmico con goma perimetral EPDM</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Reparación urgente de muelle de torsión o cable partido</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">150 € - 310 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Sustitución in situ con calibrado de tensión</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Contrato de mantenimiento preventivo para comunidad</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">45 € - 85 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Revisión periódica obligatoria y libro de mantenimiento</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Reformas de Locales Comerciales en Madrid: Precios por Metro Cuadrado (2026)',
    slug: 'reformas-locales-madrid-precios-adecuacion',
    excerpt: '¿Vas a abrir un negocio en Madrid? Precios por m2 para reformar locales comerciales, insonorización, licencias de actividad y normativas en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    image_alt: 'Reforma de local comercial moderno y diáfano en Madrid',
    meta_title: 'Reformas de Locales Comerciales en Madrid Precios 2026 | DimePrecio.es',
    meta_description: 'Cuánto cuesta reformar un local en Madrid: adecuación básica desde 320€/m², proyectos de hostelería y licencias de actividad en el Ayuntamiento en DimePrecio.es.',
    keywords: 'reformas de locales madrid precios, reformar local comercial madrid m2, licencia apertura local madrid precio, adecuacion local comercial madrid',
    sector_slug: 'reformas-locales-naves',
    sector_nombre: 'Reformas de Locales y Naves',
    sector_icono: '🏬',
    precio_min_orientativo: 5500,
    precio_max_orientativo: 28000,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el coste medio por metro cuadrado para <strong>reformar un local comercial</strong> oscila entre <strong>320 € y 580 € / m²</strong> para adecuaciones básicas de tiendas u oficinas (revisión de instalación eléctrica según REBT, pladur, pintura ignífuga, suelos e iluminación LED comercial). Para proyectos exigentes de <strong>hostelería, bares o clínicas</strong> que requieren insonorización acústica homologada, salida de humos a cubierta y aseos adaptados a personas con movilidad reducida (PMR), el presupuesto medio se sitúa entre <strong>650 € y 1.250 € / m²</strong> llave en mano con gestión de la Licencia de Actividad ante el Ayuntamiento de Madrid o ECLU.
  </p>
</div>

<h2>1. Baremos de reformas de locales comerciales en Madrid (2026)</h2>
<p>
  La estricta normativa urbanística del Ayuntamiento de Madrid exige proyectos visados y certificados energéticos antes de la apertura al público. Tarifas medias auditadas en <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Local Comercial</th>
      <th style="padding:12px 14px;">Coste Medio m² en Madrid</th>
      <th style="padding:12px 14px;">Local Tipo 90 m²</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Adecuación comercial retail / tienda de ropa</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">320 € - 520 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">28.000 € - 46.000 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Oficinas y despachos profesionales con falso techo</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">360 € - 620 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">32.000 € - 55.000 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Cafetería / Bar con insonorización y salida de humos</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">720 € - 1.350 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">64.000 € - 120.000 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Proyecto técnico de actividad + Declaración Responsable</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.200 € - 2.800 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Redactado por arquitecto o ingeniero colegiado</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Arquitectos en Madrid: Precios de Proyectos de Obra, ITE y Licencias (2026)',
    slug: 'arquitectos-madrid-precios-proyectos-ite-licencias',
    excerpt: '¿Necesitas un arquitecto en Madrid? Honorarios orientativos en 2026 para proyectos de reforma, cambio de uso a vivienda, ITE y licencias en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80',
    image_alt: 'Arquitecto revisando planos y proyecto de edificación en Madrid',
    meta_title: 'Arquitectos en Madrid Precios y Honorarios 2026 | DimePrecio.es',
    meta_description: 'Cuánto cobra un arquitecto en Madrid: proyectos de reforma desde 1.400€, cambio de uso de local a vivienda e informes ITE con tarifas auditadas en DimePrecio.es.',
    keywords: 'arquitectos madrid precios, honorarios arquitecto madrid, proyecto cambio de uso local a vivienda madrid, precio ite madrid',
    sector_slug: 'arquitectos-licencias',
    sector_nombre: 'Arquitectos y Licencias',
    sector_icono: '📐',
    precio_min_orientativo: 450,
    precio_max_orientativo: 3900,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, los honorarios de un arquitecto colegiado (COAM) para redactar el <strong>proyecto de cambio de uso de local comercial a vivienda residencial</strong> oscilan entre <strong>2.200 € y 4.500 €</strong> según superficie y si se tramita por Declaración Responsable o Licencia Ordinaria. Para proyectos de <strong>reforma integral con modificación de tabiques estructurales</strong>, el coste medio va de <strong>1.400 € a 2.900 €</strong>. Por su parte, la realización del <strong>Informe de Evaluación del Edificio (IEE / ITE)</strong> para comunidades de propietarios en Madrid tiene un coste medio de entre <strong>450 € y 1.200 €</strong> en función del número de viviendas y plantas.
  </p>
</div>

<h2>1. Honorarios habituales de arquitectos en la Comunidad de Madrid (2026)</h2>
<p>
  Los honorarios profesionales están liberalizados en España, pero en <strong>DimePrecio.es</strong> recopilamos las medias reales aplicadas por estudios de arquitectura en Madrid:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Trabajo Técnico</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Incluye</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Proyecto básico y de ejecución cambio de uso</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.400 € - 4.200 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Planos, memoria técnica CTE, visado colegial y dirección</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Informe ITE / IEE edificio 10-20 vecinos en Madrid</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">490 € - 890 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Inspección de estructura, cimentación, fachadas y accesibilidad</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Certificado de Eficiencia Energética (piso 80 m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">75 € - 140 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Visita física, cálculo CEX y registro oficial en la CAM</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Levantamiento de planos acotados de vivienda</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">180 € - 350 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Medición láser y entrega en formato PDF y DWG (AutoCAD)</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Abogados en Madrid: Tarifas Orientativas y Honorarios Legales (2026)',
    slug: 'abogados-madrid-tarifas-honorarios-consultas',
    excerpt: '¿Necesitas asesoramiento legal en Madrid? Baremos de honorarios en 2026 para herencias, divorcios, despidos laborales y consultas en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80',
    image_alt: 'Despacho de abogados y asesoría jurídica en Madrid',
    meta_title: 'Abogados en Madrid Honorarios y Tarifas Orientativas 2026 | DimePrecio.es',
    meta_description: 'Cuánto cobra un abogado en Madrid: consulta inicial desde 60€, herencias, divorcios de mutuo acuerdo y reclamaciones laborales en DimePrecio.es.',
    keywords: 'abogados madrid precios, honorarios abogados madrid, cuanto cobra un abogado laboralista madrid, abogado herencias madrid tarifas',
    sector_slug: 'abogados-especialistas',
    sector_nombre: 'Abogados Especialistas',
    sector_icono: '⚖️',
    precio_min_orientativo: 120,
    precio_max_orientativo: 1800,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, la <strong>primera consulta jurídica presencial u online</strong> en despacho de abogados colegiado (ICAM) oscila entre <strong>60 € y 140 €</strong> (muchos bufetes la descuentan del importe total si se contrata el caso). Para la tramitación de una <strong>herencia con adjudicación de bienes e inmuebles</strong> aprovechando la bonificación fiscal del 99% en el Impuesto de Sucesiones de la Comunidad de Madrid, los honorarios medios van de <strong>950 € a 2.400 €</strong>. Un <strong>divorcio de mutuo acuerdo sin hijos</strong> en Madrid cuesta entre <strong>400 € y 750 €</strong> por cónyuge, mientras que las <strong>reclamaciones laborales por despido improcedente</strong> en el SMAC suelen fijarse a porcentaje (entre el 12% y el 18% de la indemnización conseguida con una provisión inicial reducida).
  </p>
</div>

<h2>1. Baremos medios de despachos de abogados en Madrid (2026)</h2>
<p>
  Tener una hoja de encargo formalizada antes de iniciar cualquier trámite ante los Juzgados de Plaza de Castilla o la Audiencia Provincial es el estándar de seguridad que auditamos en <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Asunto Jurídico</th>
      <th style="padding:12px 14px;">Honorarios Medios Madrid</th>
      <th style="padding:12px 14px;">Modalidad</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Tramitación completa de herencia y liquidación plusvalía</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">950 € - 2.200 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Gestión de certificados, notaría y registros</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Divorcio de mutuo acuerdo con convenio regulador</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">450 € - 850 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Vía judicial o notarial con procurador</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Reclamación por despido ante el SMAC y Juzgado de lo Social</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">150 € inicial + 12-18% cuota litis</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Papeleta de conciliación y juicio si procede</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Reclamación de impago / procedimiento monitorio</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">220 € - 540 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Requerimiento previo fehaciente y demanda judicial</td>
    </tr>
  </tbody>
</table>
`
  }
];

async function insertBatch2() {
  console.log('[Batch 2] Insertando 5 artículos artesanales más para Madrid...');

  for (const art of ARTICLES_BATCH_2) {
    const sec = rr.getSectorBySlug(art.sector_slug);
    const sql = `
      INSERT INTO posts (
        title, slug, excerpt, content, featured_image, image_alt,
        category_id, author_id, status, is_featured, is_breaking, is_selected, is_pinned,
        priority_weight, meta_title, meta_description, keywords,
        provincia_id, provincia_slug, provincia_nombre,
        sector_id, sector_slug, sector_nombre, sector_icono,
        precio_min_orientativo, precio_max_orientativo,
        views, likes, published_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        1, 1, 'published', 1, 0, 1, 1,
        ?, ?, ?, ?,
        1, 'madrid', 'Madrid',
        ?, ?, ?, ?,
        ?, ?,
        160, 7, NOW()
      )
    `;

    await pool.query(sql, [
      art.title, art.slug, art.excerpt, art.content, art.featured_image, art.image_alt,
      art.priority_weight, art.meta_title, art.meta_description, art.keywords,
      sec ? sec.id : null, art.sector_slug, art.sector_nombre, art.sector_icono,
      art.precio_min_orientativo, art.precio_max_orientativo
    ]);
    console.log(' - Creado artículo artesanal:', art.title);
  }

  const [countMadrid] = await pool.query("SELECT count(*) as total FROM posts WHERE provincia_slug = 'madrid'");
  console.log(`[Batch 2] Total artículos de Madrid en la base de datos ahora: ${countMadrid[0].total}`);

  if (rr.syncFromDatabase) {
    await rr.syncFromDatabase();
  }

  process.exit(0);
}

insertBatch2().catch(err => {
  console.error(err);
  process.exit(1);
});
