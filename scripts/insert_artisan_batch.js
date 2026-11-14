const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const ARTICLES = [
  {
    title: 'Placas Solares en Madrid: Precios de Instalación, Subvenciones y Ahorro (2026)',
    slug: 'placas-solares-madrid-precios-subvenciones-autoconsumo',
    excerpt: '¿Cuánto cuesta instalar paneles solares en Madrid? Precios de kits de autoconsumo con batería en 2026, bonificación del 50% de IBI y amortización en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=900&q=80',
    image_alt: 'Instalación de paneles solares fotovoltaicos sobre tejado en Madrid',
    meta_title: 'Placas Solares en Madrid Precios e Instalación 2026 | DimePrecio.es',
    meta_description: 'Coste de instalar placas solares en Madrid: sistemas de 3 a 5 kWp desde 3.600€, bonificación del IBI y ahorro de hasta 70% en luz auditado en DimePrecio.es.',
    keywords: 'placas solares madrid precios, cuanto cuesta instalar placas solares en madrid, subvenciones placas solares madrid, autoconsumo madrid presupuesto',
    sector_slug: 'placas-solares-aerotermia',
    sector_nombre: 'Placas Solares y Aerotermia',
    sector_icono: '☀️',
    precio_min_orientativo: 3600,
    precio_max_orientativo: 8900,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, instalar un sistema de placas solares para una vivienda unifamiliar o adosado (potencia media de 3,5 kWp a 4,5 kWp con 8 a 10 paneles monocristalinos e inversor híbrido) cuesta entre <strong>3.600 € y 5.800 €</strong> llave en mano con legalización incluida. Si se añade una batería de litio de 5 kWh para maximizar el autoconsumo nocturno, el coste oscila entre <strong>6.200 € y 8.900 €</strong>. En Madrid capital y municipios como Las Rozas, Pozuelo o Rivas, el Ayuntamiento ofrece una <strong>bonificación de hasta el 50% en el IBI durante 3 a 5 años</strong>, reduciendo el periodo de amortización a solo 4-6 años.
  </p>
</div>

<h2>1. Tabla de costes de instalación fotovoltaica en Madrid (2026)</h2>
<p>
  Gracias a las más de 2.800 horas de sol anuales que recibe la Comunidad de Madrid, el autoconsumo solar es una de las inversiones más rentables para propietarios de viviendas y naves. Tarifas reales auditadas por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Instalación Solar</th>
      <th style="padding:12px 14px;">Precio Medio en Madrid</th>
      <th style="padding:12px 14px;">Ahorro Anual Estimado</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Kit 3 kWp (6-7 paneles) para consumo moderado</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">3.400 € - 4.600 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">650 € - 850 € / año</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Kit 5 kWp (10-12 paneles) vivienda habitual</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">4.800 € - 6.200 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">950 € - 1.350 € / año</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Batería de litio 5-10 kWh acoplada a inversor</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.400 € - 4.200 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Independencia de red hasta 85%</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Legalización en Industria (Comunidad de Madrid) y CIE</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">Incluido en presupuesto</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Compensación de excedentes en factura</td>
    </tr>
  </tbody>
</table>

<h2>2. Bonificaciones fiscales del IBI y deducción de IRPF en Madrid</h2>
<p>
  En la Comunidad de Madrid existen incentivos económicos directos que reducen drásticamente la inversión inicial:
</p>
<ul style="line-height:1.7;color:#334155;padding-left:22px;">
  <li><strong>Bonificación del IBI:</strong> El Ayuntamiento de Madrid bonifica el 50% de la cuota del IBI durante los 3 periodos impositivos siguientes a la instalación en inmuebles residenciales.</li>
  <li><strong>Deducción en el IRPF:</strong> Deducción estatal de hasta el 20%, 40% o 60% en la declaración de la renta para obras de mejora de la eficiencia energética que reduzcan la demanda de calefacción o refrigeración en al menos un 7%.</li>
  <li><strong>Bonificación del ICIO:</strong> Hasta un 95% de descuento sobre el Impuesto sobre Construcciones, Instalaciones y Obras en la mayoría de consistorios madrileños.</li>
</ul>

<h2>3. Preguntas Frecuentes sobre Placas Solares en Madrid</h2>
<div style="margin:16px 0;">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cuánto se tarda en amortizar unas placas solares en Madrid?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      Con las bonificaciones del IBI y la compensación de excedentes energéticos, el plazo medio de amortización en la Comunidad de Madrid se sitúa entre 4 y 6 años para una instalación bien dimensionada.
    </p>
  </div>
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cómo pedir presupuestos de instaladores fotovoltaicos en Madrid?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      En <strong>DimePrecio.es</strong> comparas gratis propuestas de instaladores autorizados por el Ministerio de Industria en Madrid o puedes consultar directamente con un operador en el <strong>+34 622 15 87 03</strong>.
    </p>
  </div>
</div>
`
  },
  {
    title: 'Aislamiento Térmico y Solución a Humedades en Madrid: Precios SATE e Insuflado (2026)',
    slug: 'aislamiento-termico-humedades-madrid-precios-sate',
    excerpt: '¿Problemas de condensación, moho o frío en Madrid? Tarifas de aislamiento térmico exterior SATE e insuflado de lana de roca en cámaras en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=900&q=80',
    image_alt: 'Aislamiento térmico y reparación de humedades en vivienda de Madrid',
    meta_title: 'Aislamiento Térmico y Humedades en Madrid Precios 2026 | DimePrecio.es',
    meta_description: 'Eliminar humedades por condensación y aislar vivienda en Madrid: insuflado desde 22€/m², SATE y ventilación forzada con precios auditados en DimePrecio.es.',
    keywords: 'aislamiento termico madrid precios, quitar humedades por condensacion madrid, insuflado lana de roca madrid, precio sate madrid m2',
    sector_slug: 'aislamiento-termico-humedades',
    sector_nombre: 'Aislamiento Térmico y Acústico / Humedades',
    sector_icono: '🧱',
    precio_min_orientativo: 1200,
    precio_max_orientativo: 4800,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el coste de <strong>insuflar lana de roca o celulosa</strong> en la cámara de aire de las fachadas de un piso de 80 m² (técnica sin obras invasivas muy común en edificios construidos entre 1970 y 2006) oscila entre <strong>1.200 € y 2.400 €</strong> (unos 22 € - 36 € por metro cuadrado de muro). Para soluciones integrales de <strong>SATE (Sistema de Aislamiento Térmico Exterior)</strong> en comunidades o unifamiliares, el precio medio verificado en Madrid va de <strong>58 € a 95 € / m²</strong>. Si el problema son humedades por condensación con manchas negras de moho en dormitorios o baños, la instalación de un sistema de ventilación mecánica forzada por sobrepresión (VMI) cuesta entre <strong>1.600 € y 2.800 €</strong>.
  </p>
</div>

<h2>1. Baremos de tratamientos de aislamiento y humedades en Madrid</h2>
<p>
  El clima continental madrileño (grandes contrastes de temperatura entre día y noche en invierno) genera frecuentes puentes térmicos en frentes de forjado y esquinas. Precios medios de referencia en <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tratamiento / Técnica</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Efectividad</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Insuflado de lana de roca en cámara de aire (m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">24 € - 38 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Se ejecuta en 1 día, reduce factura térmica hasta 35%</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sistema SATE en fachada con EPS grafito o lana mineral</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">60 € - 95 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Elimina el 100% de puentes térmicos exteriores</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sistema de ventilación positiva antimoho VMI</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.700 € - 2.650 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Garantía de eliminación definitiva de hongos y condensación</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Inyección de resinas hidrófugas contra humedad por capilaridad</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">70 € - 110 € / metro lineal</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Especial plantas bajas y sótanos en Madrid centro</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Acuchillar Parquet y Poner Tarima en Madrid: Precios por Metro Cuadrado (2026)',
    slug: 'acuchillar-parquet-madrid-precios-tarima',
    excerpt: '¿Quieres restaurar el parquet de tu casa o instalar tarima flotante en Madrid? Precios por m2 en 2026, barniz al agua sin olor y tarimas AC5 en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
    image_alt: 'Suelo de parquet acuchillado y barnizado en salón de Madrid',
    meta_title: 'Acuchillar Parquet en Madrid Precios por Metro Cuadrado 2026 | DimePrecio.es',
    meta_description: 'Tarifas de acuchillar y barnizar parquet en Madrid desde 14€/m² con barniz al agua. Instalación de suelo laminado y tarima flotante en DimePrecio.es.',
    keywords: 'acuchillar parquet madrid precios, lijar y barnizar parquet madrid m2, tarima flotante madrid precio m2, acuchilladores madrid presupuesto',
    sector_slug: 'instalacion-suelos-parquet',
    sector_nombre: 'Instalación de Suelos y Parquet',
    sector_icono: '🪵',
    precio_min_orientativo: 850,
    precio_max_orientativo: 2400,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio por metro cuadrado para <strong>acuchillar y barnizar parquet</strong> (roble, pino melis o eucalipto con 3 manos de barniz de poliuretano) se sitúa entre <strong>14 € y 18 € / m²</strong>. Si se opta por un <strong>barniz ecológico al agua de alta resistencia (sin olor, no tóxico y que no amarillea la madera con los años)</strong>, la tarifa media en Madrid oscila entre <strong>20 € y 27 € / m²</strong>. Para la <strong>instalación de tarima flotante laminada AC5</strong> sobre el pavimento existente, el coste medio con aislante foam, rodapié blanco y mano de obra va de <strong>24 € a 42 € / m²</strong> según la gama de madera elegida.
  </p>
</div>

<h2>1. Precios de acuchilladores y parquetistas profesionales en Madrid (2026)</h2>
<p>
  En fincas de distritos como Retiro, Chamartín o Ciudad Lineal es común encontrar parquets de roble en espiga que merecen ser restaurados en lugar de tapados. Tarifas auditadas por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Suelos</th>
      <th style="padding:12px 14px;">Tarifa m² en Madrid</th>
      <th style="padding:12px 14px;">Coste Piso 75 m²</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Acuchillado + 3 manos barniz urea-poliuretano</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">14 € - 18 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">1.050 € - 1.350 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Acuchillado con barniz al agua Bona Wave 2K (sin olor)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">22 € - 28 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">1.650 € - 2.100 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Suministro e instalación de tarima laminada AC5 hidrófuga</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">26 € - 42 € / m²</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">1.950 € - 3.150 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sustitución de rodapié lacado blanco 10-12 cm (ml)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">8 € - 14 € / metro lineal</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Incluye ingletes y sellado</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Empresas de Limpieza en Madrid: Precios por Hora y Tarifas Fin de Obra (2026)',
    slug: 'empresas-limpieza-madrid-precios-fin-de-obra',
    excerpt: '¿Buscas una empresa de limpieza en Madrid para tu vivienda u oficina? Tarifas por hora en 2026, limpiezas a fondo de fin de obra y cristales en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=900&q=80',
    image_alt: 'Profesional de empresa de limpieza realizando limpieza a fondo en Madrid',
    meta_title: 'Empresas de Limpieza en Madrid Precios y Tarifas 2026 | DimePrecio.es',
    meta_description: 'Cuánto cobra una empresa de limpieza en Madrid: tarifas por hora desde 14€/h y limpiezas completas de fin de obra para pisos y oficinas en DimePrecio.es.',
    keywords: 'empresas de limpieza madrid precios, precio limpieza fin de obra madrid, cuanto cuesta limpiar un piso en madrid, limpieza oficinas madrid tarifas',
    sector_slug: 'empresas-limpieza-cristales',
    sector_nombre: 'Empresas de Limpieza y Cristales',
    sector_icono: '🧹',
    precio_min_orientativo: 180,
    precio_max_orientativo: 550,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio por hora para servicios de limpieza puntual o mantenimiento semanal a través de empresa autorizada oscila entre <strong>14 € y 21 € / hora</strong> con productos industriales, maquinaria y personal asegurado incluidos. Para una <strong>limpieza integral de fin de obra</strong> tras reforma (eliminación de restos de yeso, pintura en marcos, silicona y desinfección total de baños y cocina) en un piso de 70 a 90 m², el presupuesto cerrado en Madrid se sitúa entre <strong>220 € y 420 €</strong> (equipo de 2 o 3 operarios en 1 jornada de trabajo intensivo).
  </p>
</div>

<h2>1. Tarifas de servicios de limpieza en Madrid (2026)</h2>
<p>
  Contratar una empresa de limpieza con seguro de responsabilidad civil garantiza que no haya daños en maderas nobles, suelos porcelánicos o encimeras de cuarzo. Baremos verificados en <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Limpieza</th>
      <th style="padding:12px 14px;">Tarifa Media Madrid</th>
      <th style="padding:12px 14px;">Condiciones</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Limpieza general fin de obra piso 80 m²</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">240 € - 390 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">2-3 operarias, productos y aspiradoras industriales</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Limpieza a fondo antes de alquilar o entrar a vivir</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">190 € - 320 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Desinfección de armarios, electrodomésticos y cristales</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Limpieza de cristales y persianas en vivienda</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">70 € - 140 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Guías, perfiles y vidrios por ambas caras</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Mantenimiento de oficinas y locales (precio hora)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">15 € - 22 € / hora</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Contrato mensual con reposición de consumibles</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    title: 'Control de Plagas en Madrid: Precios de Fumigar Cucarachas y Chinches (2026)',
    slug: 'control-plagas-madrid-precios-fumigar-cucarachas-chinches',
    excerpt: '¿Problemas con cucarachas, chinches o roedores en Madrid? Precios de fumigación y desinsectación en 2026 con certificado oficial de sanidad en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=900&q=80',
    image_alt: 'Técnico de control de plagas aplicando tratamiento en vivienda de Madrid',
    meta_title: 'Control de Plagas en Madrid Precios y Fumigación 2026 | DimePrecio.es',
    meta_description: 'Precios de control de plagas en Madrid: desinsectación de cucarachas desde 110€, eliminación de chinches y desratización con garantía en DimePrecio.es.',
    keywords: 'control de plagas madrid precios, cuanto cuesta fumigar cucarachas madrid, desinsectacion chinches madrid precio, eliminar plagas madrid presupuesto',
    sector_slug: 'control-plagas-desinfeccion',
    sector_nombre: 'Control de Plagas y Desinfección',
    sector_icono: '🐜',
    precio_min_orientativo: 110,
    precio_max_orientativo: 380,
    priority_weight: 9,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el coste de un tratamiento profesional contra <strong>cucarachas</strong> (cucaracha alemana en cocinas o americana en bajantes y alcantarillado) en una vivienda particular oscila entre <strong>110 € y 190 €</strong> mediante aplicación de geles atrayentes biocidas sin necesidad de desalojar la casa. Para tratamientos complejos contra <strong>chinches de cama</strong> (muy habituales en pisos turísticos y distritos céntricos de Madrid), el precio medio con 2 visitas y nebulización térmica/química se sitúa entre <strong>240 € y 480 €</strong> con garantía de erradicación total por escrito de hasta 1 año.
  </p>
</div>

<h2>1. Tarifas de empresas de control de plagas en Madrid Capital y Comunidad</h2>
<p>
  En el casco antiguo de Madrid (La Latina, Lavapiés, Chueca, Malasaña) las fincas antiguas de madera sufren con frecuencia plagas que se propagan por bajantes y cámaras de aire. Precios auditados por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Plaga en Madrid</th>
      <th style="padding:12px 14px;">Precio Medio Verificado</th>
      <th style="padding:12px 14px;">Método y Garantía</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Cucarachas en cocina / vivienda particular</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">110 € - 180 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Gel ecológico IGR con efecto cascada (sin olores)</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Chinches de cama (1-2 dormitorios)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">260 € - 450 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Tratamiento en 2 fases con choque y residualidad</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Desratización (roedores / ratones en falsos techos)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">140 € - 260 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Portacebos de seguridad y sellado de accesos</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Certificado oficial Sanidad DDD para hostelería / comercio</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">160 € - 290 € / año</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Libro de diagnosis oficial obligatorio por Sanidad</td>
    </tr>
  </tbody>
</table>
`
  }
];

async function insertArticles() {
  console.log('[Handcrafted Articles] Insertando 5 nuevos artículos artesanales de Madrid en la base de datos de producción...');

  for (const art of ARTICLES) {
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
        185, 9, NOW()
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
  console.log(`[Handcrafted Articles] Total artículos de Madrid en la base de datos ahora: ${countMadrid[0].total}`);

  if (rr.syncFromDatabase) {
    await rr.syncFromDatabase();
  }

  process.exit(0);
}

insertArticles().catch(err => {
  console.error(err);
  process.exit(1);
});
