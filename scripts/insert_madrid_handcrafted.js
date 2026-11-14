const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const MADRID_ARTICLES = [
  {
    title: 'Pintores en Madrid: Precios de Pintar Piso y Quitar Gotelé (2026)',
    slug: 'pintores-madrid-precios-pintar-piso-gotele',
    excerpt: '¿Cuánto cuesta pintar un piso o quitar el gotelé en Madrid? Tarifas medias por metro cuadrado en 2026, pintura plástica lavable y consejos para fincas madrileñas en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&q=80',
    image_alt: 'Pintores profesionales pintando piso en Madrid con rodillo',
    meta_title: 'Pintores en Madrid Precios Pintar Piso y Quitar Gotelé 2026 | DimePrecio.es',
    meta_description: 'Tarifas de pintores en Madrid: pintar piso de 70-90m² desde 680€, alisar gotelé con masilla y pintura lavable. Presupuestos verificados en DimePrecio.es.',
    keywords: 'pintores madrid precios, cuanto cuesta pintar un piso en madrid, quitar gotele madrid precio m2, alisar paredes madrid presupuesto',
    sector_slug: 'pintores-alisado-paredes',
    sector_nombre: 'Pintores y Alisado de Paredes',
    sector_icono: '🎨',
    precio_min_orientativo: 680,
    precio_max_orientativo: 2900,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio medio para pintar un piso estándar de 70 a 90 m² en blanco o color claro oscila entre <strong>680 € y 1.250 €</strong> con pintura plástica lavable de primera calidad y mano de obra incluida. Si además se desea <strong>quitar el gotelé y alisar las paredes</strong> mediante tendido de masilla y lijado mecánico con aspiración, el presupuesto medio en Madrid se sitúa entre <strong>1.650 € y 2.900 €</strong> según el estado del soporte y la altura de techos.
  </p>
</div>

<h2>1. Tarifas medias de pintores profesionales en Madrid (2026)</h2>
<p>
  En la Comunidad de Madrid, los precios de pintura varían notablemente según si la vivienda está amueblada, el tipo de pintura elegido y si es necesario reparar grietas o humedades previas. En <strong>DimePrecio.es</strong> recopilamos tarifas reales aplicadas en Madrid:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Trabajo de Pintura</th>
      <th style="padding:12px 14px;">Precio Medio en Madrid</th>
      <th style="padding:12px 14px;">Detalle / Materiales</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pintar piso 70 m² vacío (blanco mate)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">680 € - 950 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">2 manos pintura plástica lavable Titán/Valentine</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pintar piso 90 m² amueblado con protección</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">980 € - 1.450 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Empapelado de suelo, rodapiés, marcos y muebles</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Quitar gotelé y alisar piso 80 m²</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.750 € - 2.800 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Raspado/cubrición con pasta, lijado aspirado y pintura</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Tratamiento antimoho y pintura de techos baño/cocina</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">180 € - 340 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Saneado de manchas de condensación e imprimación</td>
    </tr>
  </tbody>
</table>

<h2>2. Particularidades del gotelé en las viviendas de Madrid</h2>
<p>
  Gran parte del parque inmobiliario de barrios madrileños consolidados (como Chamberí, Aluche, Tetuán, Moratalaz o San Blas) cuenta con gotelé plástico aplicado en los años 70, 80 y 90. Alisar estas paredes exige:
</p>
<ul style="line-height:1.7;color:#334155;padding-left:22px;">
  <li><strong>Comprobar si es gotelé al temple o plástico:</strong> El gotelé al temple se reblandece con agua y se raspa; el plástico requiere pastas de renovación especiales (mecafino o masilla de renovación).</li>
  <li><strong>Lijado con foco rasante y aspiración:</strong> Imprescindible para evitar nubes de polvo en el interior de la vivienda y lograr un acabado Q4 completamente liso.</li>
  <li><strong>Fijador previo a la pintura:</strong> Evita que la masilla absorba la pintura de forma irregular y garantiza un color uniforme y duradero.</li>
</ul>

<h2>3. Preguntas Frecuentes sobre Pintura en Madrid</h2>
<div style="margin:16px 0;">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cuánto tardan los pintores en pintar un piso en Madrid?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      Un equipo de 2 pintores profesionales tarda entre 2 y 3 días hábiles en pintar un piso completo de 80 m² amueblado. Si hay que quitar gotelé y alisar, el plazo se amplía a 5-7 días para respetar los tiempos de secado de las capas de masilla.
    </p>
  </div>
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cómo comparar presupuestos de pintores verificados en Madrid?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      En <strong>DimePrecio.es</strong> puedes pedir presupuesto gratuito y recibir hasta 3 valoraciones de empresas de pintura acreditadas en tu distrito de Madrid, o llamar directamente a nuestro operador en el <strong>+34 622 15 87 03</strong>.
    </p>
  </div>
</div>
`
  },
  {
    title: 'Reparación de Tejados y Cubiertas en Madrid: Precios e Impermeabilización (2026)',
    slug: 'reparacion-tejados-cubiertas-madrid-precios',
    excerpt: 'Baremos de precios para arreglar goteras, retejar e impermeabilizar terrazas en Madrid y su sierra. Tarifas para comunidades y unifamiliares en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=900&q=80',
    image_alt: 'Reparación de tejado y sustitución de tejas en Madrid',
    meta_title: 'Reparación de Tejados en Madrid Precios e Impermeabilización 2026 | DimePrecio.es',
    meta_description: 'Coste de reparar goteras y retejar en Madrid: impermeabilizaciones desde 32€/m², retejado parcial y rehabilitación integral de cubiertas en DimePrecio.es.',
    keywords: 'reparacion tejados madrid, arreglar goteras madrid precio, impermeabilizar terraza comunidad madrid, retejar tejado madrid presupuesto',
    sector_slug: 'tejados-cubiertas',
    sector_nombre: 'Tejados, Cubiertas e Impermeabilizaciones',
    sector_icono: '🏠',
    precio_min_orientativo: 890,
    precio_max_orientativo: 5400,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, reparar goteras puntuales o sustituir tejas desplazadas tiene un coste medio de entre <strong>380 € y 850 €</strong>. Para impermeabilizaciones completas de cubiertas planas o terrazas comunitarias con membrana de poliuretano o tela asfáltica SBS, el precio se mueve entre <strong>32 € y 58 € por metro cuadrado</strong>. Las rehabilitaciones integrales de tejados en edificios comunitarios o chalets en la sierra madrileña oscilan entre <strong>7.500 € y 22.000 €</strong> según accesos y andamiaje.
  </p>
</div>

<h2>1. Tabla de costes de cubiertas y tejados en la Comunidad de Madrid</h2>
<p>
  Las heladas de invierno y el intenso calor estival en Madrid provocan dilataciones extremas en telas asfálticas y tejas cerámicas. En <strong>DimePrecio.es</strong> auditamos los siguientes baremos:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Intervención en Cubierta</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Garantía Habitual</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Localización y reparación de gotera urgente</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">380 € - 750 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">1 año por escrito</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Retejado parcial y fijación de tejas movidas</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">890 € - 1.850 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">2 a 5 años</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Impermeabilización de terraza transitable (m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">35 € - 60 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">10 años certificada</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Limpieza y sustitución de canalones de aluminio continuo</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">28 € - 45 € / ml</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Sin soldaduras ni fugas</td>
    </tr>
  </tbody>
</table>

<h2>2. Normativa y licencias del Ayuntamiento de Madrid</h2>
<p>
  Cualquier obra en cubierta que requiera ocupación de vía pública con contenedores de escombros o instalación de andamios tubulares necesita tramitación de Declaración Responsable o Licencia Urbanística ante el Ayuntamiento de Madrid o la junta de distrito correspondiente. En <strong>DimePrecio.es</strong> los instaladores se encargan de gestionar toda la documentación técnica y seguros de responsabilidad civil.
</p>
`
  },
  {
    title: 'Ventanas de PVC y Aluminio en Madrid: Precios con Instalación Climalit (2026)',
    slug: 'ventanas-pvc-madrid-precios-instalacion',
    excerpt: '¿Cuánto cuesta cambiar las ventanas en Madrid? Precios con instalación de PVC oscilobatiente, doble acristalamiento acústico y Plan Renove en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=900&q=80',
    image_alt: 'Ventana de PVC oscilobatiente Climalit en salón de Madrid',
    meta_title: 'Ventanas de PVC en Madrid Precios con Instalación 2026 | DimePrecio.es',
    meta_description: 'Precios de cambiar ventanas en Madrid: perfiles PVC oscilobatientes 70-76mm con Climalit desde 390€. Aislamiento acústico y térmico auditado en DimePrecio.es.',
    keywords: 'ventanas pvc madrid precios, cambiar ventanas madrid presupuesto, ventanas climalit madrid, cerramiento terraza madrid precio',
    sector_slug: 'carpinteria-aluminio-ventanas-pvc',
    sector_nombre: 'Carpintería de Aluminio y Ventanas PVC',
    sector_icono: '🪟',
    precio_min_orientativo: 1450,
    precio_max_orientativo: 4200,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio medio para instalar una ventana de PVC oscilobatiente de 2 hojas (120x120 cm) con perfil de 5 a 6 cámaras y doble acristalamiento Climalit oscila entre <strong>380 € y 650 €</strong> con desmontaje, remates y mano de obra incluidos. Cambiar todas las ventanas de un piso en Madrid (pack de 4 a 6 ventanas con persianas aislantes) tiene un presupuesto medio verificado de <strong>2.600 € a 4.800 €</strong>, permitiendo un ahorro de hasta el 40% en calefacción y aire acondicionado.
  </p>
</div>

<h2>1. Tarifas de ventanas de PVC y cerramientos en Madrid</h2>
<p>
  El aislamiento acústico frente al tráfico de vías como la M-30, Paseo de la Castellana o la A-6 hace que los madrileños opten cada vez más por vidrios laminados acústicos Silence. Precios de referencia en <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Modelo / Instalación</th>
      <th style="padding:12px 14px;">Precio Unidad Instalada</th>
      <th style="padding:12px 14px;">Aislamiento</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Ventana PVC oscilobatiente 120x120 Climalit 4/16/4</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">390 € - 590 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Térmico estándar Uw 1.3 W/m²K</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Ventana PVC con vidrio acústico Stadip Silence</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">480 € - 720 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Atenuación hasta 42 dB (tráfico urbano)</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pack integral 5 ventanas piso completo con persianas motorizadas</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.900 € - 4.900 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Cajón túnel monoblock térmico</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Cerramiento de terraza con rotura de puente térmico</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.400 € - 5.500 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">A medida según metros lineales</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Mudanzas en Madrid: Precios de Portes y Traslados de Pisos (2026)',
    slug: 'mudanzas-madrid-precios-portes-pisos',
    excerpt: 'Tarifas medias de mudanzas completas y portes en Madrid. Costes de elevador por fachada, permisos del Ayuntamiento y guardamuebles en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&q=80',
    image_alt: 'Furgoneta y operarios de mudanza realizando traslado en Madrid',
    meta_title: 'Mudanzas en Madrid Precios de Portes y Traslados 2026 | DimePrecio.es',
    meta_description: 'Cuánto cuesta una mudanza en Madrid: pisos de 2 y 3 dormitorios desde 420€, portes urbanos desde 160€. Permisos de corte de calle y elevador en DimePrecio.es.',
    keywords: 'mudanzas madrid precios, portes baratos madrid, cuanto cuesta una mudanza en madrid, guardamuebles madrid tarifas',
    sector_slug: 'mudanzas-guardamuebles',
    sector_nombre: 'Mudanzas y Guardamuebles',
    sector_icono: '📦',
    precio_min_orientativo: 220,
    precio_max_orientativo: 1150,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, una mudanza local para un piso de 2 o 3 dormitorios cuesta de media entre <strong>420 € y 890 €</strong> con furgoneta capitoné, 2 o 3 mozos de carga, desmontaje y montaje de muebles y seguro de transporte. Los portes pequeños o traslados de habitaciones dentro del municipio de Madrid parten desde <strong>160 € a 280 €</strong>. Si el acceso requiere plataforma elevadora por fachada en calles estrechas del centro, el suplemento suele rondar los <strong>120 € a 180 €</strong>.
  </p>
</div>

<h2>1. Tarifas de mudanzas y guardamuebles en Madrid Capital y Comunidad</h2>
<p>
  El coste de una mudanza en Madrid depende directamente del volumen en metros cúbicos, si existe ascensor grande en origen y destino, y de la tramitación de permisos de estacionamiento en el Ayuntamiento de Madrid:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Servicio de Mudanza</th>
      <th style="padding:12px 14px;">Precio Medio en Madrid</th>
      <th style="padding:12px 14px;">Incluye</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Porte pequeño / traslado de sofás o electrodomésticos</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">160 € - 260 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Furgón + 1 operario (2 horas máx.)</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Mudanza piso 2 dormitorios (50-70 m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">420 € - 680 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Furgoneta 20 m³ + 2 operarios + seguro</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Mudanza piso 3-4 dormitorios o chalet (90-130 m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">720 € - 1.250 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Camión carrozado + 3 mozos + embalaje</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Guardamuebles en Madrid (precio mensual)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">60 € - 140 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Módulo individual privado y vigilado 24h</td>
    </tr>
  </tbody>
</table>

<h2>2. Permisos de estacionamiento y ZBE en Madrid</h2>
<p>
  En distritos como Centro, Salamanca, Chamberí o Arganzuela, es obligatorio señalizar con placas oficiales 48 horas antes para reservar espacio ante el Ayuntamiento de Madrid, y los vehículos de mudanza deben contar con distintivo ambiental B, C o ECO para acceder a las Zonas de Bajas Emisiones (ZBE). En <strong>DimePrecio.es</strong> todas las empresas colaboradoras gestionan estos trámites para que no te preocupes de multas.
</p>
`
  }
];

async function insertMadridArticles() {
  console.log('[Madrid Articles] Insertando 4 artículos artesanales para Madrid...');
  const madridLoc = rr.getLocationBySlug('madrid');

  for (const art of MADRID_ARTICLES) {
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
        ?, 'madrid', 'Madrid',
        ?, ?, ?, ?,
        ?, ?,
        140, 6, NOW()
      )
    `;

    await pool.query(sql, [
      art.title, art.slug, art.excerpt, art.content, art.featured_image, art.image_alt,
      art.priority_weight, art.meta_title, art.meta_description, art.keywords,
      madridLoc ? madridLoc.id : null,
      sec ? sec.id : null, art.sector_slug, art.sector_nombre, art.sector_icono,
      art.precio_min_orientativo, art.precio_max_orientativo
    ]);
    console.log(' - Creado artículo artesanal:', art.title);
  }

  const [totalMadrid] = await pool.query("SELECT count(*) as total FROM posts WHERE provincia_slug = 'madrid'");
  console.log('[Madrid Articles] Total artículos en Madrid ahora:', totalMadrid[0].total);

  if (rr.syncFromDatabase) {
    await rr.syncFromDatabase();
  }

  process.exit(0);
}

insertMadridArticles().catch(err => {
  console.error(err);
  process.exit(1);
});
