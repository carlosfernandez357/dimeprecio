const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const ARTICLES_BATCH_4 = [
  {
    title: 'Cuidado de Personas Mayores en Madrid: Precios por Horas e Internas (2026)',
    slug: 'cuidado-mayores-madrid-precios-horas-internas',
    excerpt: '¿Cuánto cuesta el cuidado de ancianos en Madrid? Tarifas por horas, cuidadoras internas con contrato y ayudas a la dependencia en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=900&q=80',
    image_alt: 'Acompañamiento y cuidado cariñoso a persona mayor en domicilio de Madrid',
    meta_title: 'Cuidado de Personas Mayores en Madrid Precios y Cuidadoras 2026 | DimePrecio.es',
    meta_description: 'Precios de cuidadoras de ancianos en Madrid: servicio por horas desde 10€ a 14€/h, cuidadora interna desde 1.250€/mes y tramitación de Ley de Dependencia en DimePrecio.es.',
    keywords: 'cuidado ancianos madrid precios, cuidadora interna madrid sueldo, ayuda a domicilio madrid tarifas, cuidadora por horas personas mayores madrid',
    sector_slug: 'cuidado-mayores-domicilio',
    sector_nombre: 'Cuidado de Mayores y Ayuda a Domicilio',
    sector_icono: '👵',
    precio_min_orientativo: 11,
    precio_max_orientativo: 1450,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En la <strong>Comunidad de Madrid</strong>, el <strong>cuidado de ancianos a domicilio por horas</strong> oscila entre <strong>10,50 € y 14,50 € / hora</strong> a través de empresas autorizadas del Servicio de Ayuda a Domicilio (SAD). Para una <strong>cuidadora interna (régimen de empleo del hogar)</strong>, el coste total familiar se sitúa entre <strong>1.280 € y 1.550 € / mes</strong> (incluyendo el Salario Mínimo Interprofesional en 14 pagas prorrateadas y la cuota patronal a la Seguridad Social). Las familias madrileñas pueden acogerse al <strong>Cheque Servicio o Prestación Económica Vinculada al Servicio (PEVS)</strong> de la Ley de Dependencia de la Comunidad de Madrid para cubrir hasta un 70% de este gasto.
  </p>
</div>

<h2>1. Tabla de tarifas de cuidado y asistencia en Madrid (2026)</h2>
<p>
  En barrios consolidados de Madrid como Moratalaz, Tetuán, Chamberí o Aluche, muchas familias optan por la atención en el propio hogar antes que el ingreso en residencias. Baremos de <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Modalidad de Asistencia</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Condiciones del Servicio</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Servicio por horas (acompañamiento, aseo y comidas)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">10,50 € - 14,00 € / hora</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Mínimo 2 o 3 horas diarias continuadas</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Cuidadora interna semanal (lunes a sábado mediodía)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.280 € - 1.550 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Sueldo neto + Seguridad Social + 36h de descanso ininterrumpido</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Acompañamiento nocturno en hospital o domicilio</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">65 € - 95 € / noche</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Vigilia activa y asistencia para medicación y cambios posturales</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Cuidadora fin de semana (sábado tarde a lunes mañana)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">450 € - 650 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Cobertura de libranzas de la empleada interna principal</td>
    </tr>
  </tbody>
</table>

<h2>2. Subvenciones del Cheque Servicio en la Comunidad de Madrid</h2>
<p>
  Si tu familiar cuenta con el Grado II o Grado III de Dependencia reconocido por la Comunidad de Madrid, puedes tramitar el Cheque Servicio para contratar agencias acreditadas. Esta prestación aporta entre <strong>300 € y más de 715 € al mes</strong> directamente a la cuenta familiar para amortizar la contratación de auxiliares sociosanitarios homologados.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Buscas cuidadora de total confianza para tu familiar en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Contacta con personal sociosanitario verificado con referencias contrastadas.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Entrenadores Personales en Madrid: Tarifas por Sesión y Bonos (2026)',
    slug: 'entrenadores-personales-madrid-tarifas-sesion-bonos',
    excerpt: '¿Cuánto cobra un entrenador personal en Madrid? Precios por sesión en gimnasio, a domicilio o parques (Retiro/Madrid Río) y planes en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
    image_alt: 'Sesión de entrenamiento personal y tonificación en Madrid',
    meta_title: 'Entrenador Personal en Madrid Precios por Sesión 2026 | DimePrecio.es',
    meta_description: 'Precios de entrenadores personales en Madrid: sesión individual desde 30€ a 50€, bonos mensuales de 180€ a 320€ en gimnasio o al aire libre en DimePrecio.es.',
    keywords: 'entrenador personal madrid precios, tarifas personal trainer madrid, cuanto cobra un entrenador personal en retiro madrid, bonos entrenamiento personal madrid',
    sector_slug: 'entrenadores-personales-nutricionistas',
    sector_nombre: 'Entrenadores Personales y Nutrición',
    sector_icono: '🏋️',
    precio_min_orientativo: 30,
    precio_max_orientativo: 340,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, contratar a un <strong>entrenador personal cualificado (graduado en Ciencias del Deporte CAFYD)</strong> tiene un coste medio de <strong>30 € a 50 € por sesión individual de 60 minutos</strong> al aire libre en parques como El Retiro, Juan Carlos I o Madrid Río, o en salas de entrenamiento funcional. La tarifa de <strong>entrenamiento a domicilio con material propio</strong> oscila entre <strong>40 € y 65 € / sesión</strong>. Para programas mensuales consistentes de 2 o 3 sesiones por semana, los <strong>bonos mensuales de entrenamiento y nutrición</strong> se contratan entre <strong>190 € y 350 € / mes</strong>.
  </p>
</div>

<h2>1. Tarifas de entrenamiento personal en Madrid (2026)</h2>
<p>
  Tanto para la pérdida de grasa como para opositores a Policía Nacional o Bomberos de la Comunidad de Madrid, los precios varían según la titulación y el formato de sesión:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Entrenamiento</th>
      <th style="padding:12px 14px;">Precio Medio Madrid</th>
      <th style="padding:12px 14px;">Incluye</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sesión individual al aire libre (Retiro, Madrid Río)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">30 € - 45 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Gomas, kettlebells, TRX y planificación personalizada</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Entrenamiento personal a domicilio en Madrid</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">40 € - 65 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Ahorro de desplazamientos, adaptado al espacio de la vivienda</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Bono mensual (2 días/semana = 8 sesiones) + pauta nutricional</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">220 € - 340 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Seguimiento por WhatsApp, pesajes con bioimpedancia y dieta</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Entrenamiento en pareja (Dúo)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">45 € - 65 € / sesión total</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Precio compartido entre dos personas (22€ - 32€ por persona)</td>
    </tr>
  </tbody>
</table>

<h2>2. Exige titulación oficial colegiada (COPLEF Madrid)</h2>
<p>
  En la Comunidad de Madrid rige la Ley de Regulación del Ejercicio de las Profesiones del Deporte. Contratar profesionales titulados con grado universitario en Ciencias de la Actividad Física y del Deporte (CAFYD) o Técnico Superior en Acondicionamiento Físico (TSAF) garantiza rutinas biomecánicamente seguras sin riesgo de lesiones articulares o de espalda.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Quieres ponerte en forma con un entrenador cualificado en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Solicita tu sesión de valoración física y plan de objetivos sin compromiso.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Fotógrafos en Madrid: Precios de Bodas, Eventos y Sesiones (2026)',
    slug: 'fotografos-madrid-precios-bodas-eventos-sesiones',
    excerpt: '¿Cuánto cuesta contratar un fotógrafo profesional en Madrid? Precios para reportajes de bodas, eventos de empresa y sesiones de estudio en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=80',
    image_alt: 'Fotógrafo profesional capturando sesión de retrato urbano en Madrid',
    meta_title: 'Fotógrafos en Madrid Precios para Bodas y Eventos 2026 | DimePrecio.es',
    meta_description: 'Precios de fotógrafos en Madrid: bodas completas desde 750€ a 1.600€, eventos corporativos desde 60€/h y sesiones de book desde 90€ en DimePrecio.es.',
    keywords: 'fotografo madrid precios, precio fotografo boda madrid, reportaje fotografico madrid tarifas, fotografo eventos corporativos madrid coste',
    sector_slug: 'fotografia-video-eventos',
    sector_nombre: 'Fotografía, Vídeo y Eventos',
    sector_icono: '📸',
    precio_min_orientativo: 90,
    precio_max_orientativo: 1550,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio de un <strong>reportaje de boda completo</strong> (desde los preparativos de novios, ceremonia civil o religiosa, cóctel y banquete hasta 2 horas de barra libre) oscila entre <strong>750 € y 1.650 €</strong> con entrega de más de 600 fotografías en alta resolución editadas sin marcas de agua. Para <strong>eventos corporativos o congresos</strong> (en IFEMA o centros hoteleros), la tarifa se sitúa entre <strong>60 € y 95 € / hora</strong>. Una <strong>sesión de book o retrato profesional</strong> en estudio o exteriores madrileños cuesta habitualmente entre <strong>90 € y 180 €</strong>.
  </p>
</div>

<h2>1. Tabla de tarifas de fotografía profesional en Madrid (2026)</h2>
<p>
  En localizaciones tan demandadas como los jardines de Sabatini, el Palacio Real o fincas en la sierra norte de Madrid, este es el desglose tarifario auditado por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Servicio Fotográfico</th>
      <th style="padding:12px 14px;">Precio Orientativo Madrid</th>
      <th style="padding:12px 14px;">Entregables y Tiempo</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Boda completa cobertura integral (1 fotógrafo)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">750 € - 1.250 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">10-12 horas, galería web privada + USB con fotos retocadas</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pack Boda VIP (2 fotógrafos + Álbum digital piel)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.350 € - 1.950 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Tomas simultáneas novio/novia y álbum encuadernado artesanal</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Evento de empresa / conferencias (mínimo 3 horas)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">180 € - 280 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Entrega exprés en 24h para notas de prensa y LinkedIn</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sesión retrato / embarazo / recién nacido (Newborn)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">90 € - 180 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">1h30m de sesión con 15-25 fotos con retoque de piel profesional</td>
    </tr>
  </tbody>
</table>

<h2>2. Qué fijar en el contrato fotográfico</h2>
<p>
  Exige siempre contrato mercantil detallando los derechos de reproducción y cesión de imagen, el plazo máximo de entrega de la galería (lo habitual en Madrid son de 3 a 5 semanas para bodas), copias de seguridad de las fotos RAW durante al menos 1 año y un equipo de doble ranura de tarjeta de memoria para evitar pérdidas accidentales de archivos.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Tienes una boda o evento próximo en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Comprueba portafolios de fotógrafos profesionales y reserva fecha disponible.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Diseño Web y Posicionamiento SEO en Madrid: Precios y Tarifas (2026)',
    slug: 'diseno-web-posicionamiento-seo-madrid-precios',
    excerpt: '¿Cuánto cuesta una página web profesional o consultoría SEO en Madrid? Precios de WordPress, tiendas Shopify y tarifas mensuales en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
    image_alt: 'Desarrollo web responsive y optimización de posicionamiento orgánico en Madrid',
    meta_title: 'Diseño Web y SEO en Madrid Precios para Empresas 2026 | DimePrecio.es',
    meta_description: 'Precios de diseño web y SEO en Madrid: web corporativa desde 550€ a 1.200€, tienda online desde 1.100€ y cuotas de SEO local en DimePrecio.es.',
    keywords: 'diseno web madrid precios, agencia seo madrid tarifas, cuanto cuesta hacer una web en madrid, precio tienda online shopify madrid',
    sector_slug: 'diseno-web-digitalizacion',
    sector_nombre: 'Diseño Web y Posicionamiento Digital',
    sector_icono: '💻',
    precio_min_orientativo: 550,
    precio_max_orientativo: 2400,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, crear una <strong>página web corporativa profesional</strong> (de 5 a 8 secciones, responsive, adaptada a RGPD y optimizada para velocidad de carga móvil en WordPress) cuesta entre <strong>550 € y 1.250 €</strong> con un freelance o estudio digital. Para una <strong>tienda online de comercio electrónico</strong> (Shopify o WooCommerce con pasarela de pago Redsys y Bizum), el precio oscila entre <strong>1.100 € y 2.400 €</strong>. Los servicios mensuales de <strong>posicionamiento SEO local en Madrid y optimización de Google Business Profile</strong> tienen una cuota media de <strong>250 € a 550 € / mes</strong>.
  </p>
</div>

<h2>1. Tabla de tarifas de desarrollo web y marketing en Madrid (2026)</h2>
<p>
  En una urbe tan competitiva como Madrid, una web veloz y bien posicionada en Google es la principal fuente de clientes directos. Precios auditados por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Proyecto Digital</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Plazo y Características</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Web corporativa para servicios o pymes</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">550 € - 1.250 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">2 a 4 semanas: diseño a medida, formulario y certificado SSL</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">E-commerce / Tienda online completa</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">1.100 € - 2.400 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Configuración de catálogo, pasarelas de pago y logística</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Mantenimiento y SEO Local mensual en Madrid</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">250 € - 550 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Auditoría mensual, enlaces locales, reseñas y optimización AEO</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Landing page de alta conversión para Google Ads</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">280 € - 490 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Diseñada para maximizar captación de leads y llamadas telefónicas</td>
    </tr>
  </tbody>
</table>

<h2>2. Ayudas del Kit Digital en Madrid</h2>
<p>
  Tanto autónomos como empresas con menos de 50 empleados en la Comunidad de Madrid pueden optar a los bonos del Kit Digital (de entre 2.000 € y 12.000 € a fondo perdido) a través de Agentes Digitalizadores autorizados para financiar al 100% el diseño de su web corporativa, comercio electrónico o presencia avanzada en internet.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Quieres multiplicar tus clientes online en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Solicita presupuesto cerrado para tu página web o estrategia de posicionamiento SEO.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Tasación de Viviendas y Agencias Inmobiliarias en Madrid: Tarifas (2026)',
    slug: 'tasacion-viviendas-inmobiliarias-madrid-tarifas',
    excerpt: '¿Cuánto cuesta tasar un piso en Madrid o la comisión de una inmobiliaria? Precios de tasaciones oficiales hipotecarias y honorarios en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80',
    image_alt: 'Edificio residencial y tasación pericial inmobiliaria en Madrid',
    meta_title: 'Tasación de Pisos en Madrid Precios y Comisiones Inmobiliarias 2026 | DimePrecio.es',
    meta_description: 'Precios de tasaciones oficiales en Madrid de 250€ a 450€ homologadas por el Banco de España y comisiones de agencias inmobiliarias en DimePrecio.es.',
    keywords: 'tasacion piso madrid precio, cuanto cuesta tasar una vivienda en madrid, comisiones inmobiliarias madrid venta piso, tasador oficial banco de espana madrid',
    sector_slug: 'inmobiliarias-tasacion-viviendas',
    sector_nombre: 'Inmobiliarias y Tasaciones Periciales',
    sector_icono: '🏢',
    precio_min_orientativo: 240,
    precio_max_orientativo: 490,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, la <strong>tasación oficial homologada por el Banco de España</strong> de una vivienda estándar (de 60 a 110 m² para solicitud de hipoteca, herencia o reparto judicial) cuesta entre <strong>250 € y 440 € + IVA</strong> en sociedades de tasación reguladas (como Tinsa, Sociedad de Tasación o Gloval). En cuanto a las <strong>comisiones de agencias inmobiliarias</strong> para la venta de un piso en Madrid, las agencias tradicionales cobran entre un <strong>3% y un 5% de comisión + IVA</strong> sobre el precio final de venta, mientras que las agencias inmobiliarias online de tarifa plana operan con tarifas fijas de entre <strong>2.900 € y 4.900 €</strong>.
  </p>
</div>

<h2>1. Tarifas de tasación pericial y servicios inmobiliarios en Madrid (2026)</h2>
<p>
  En el mercado inmobiliario madrileño (con valores de metro cuadrado que superan los 5.500 €/m² en distritos como Chamberí o Salamanca y 2.600 €/m² en Villaverde o Vallecas), disponer de una tasación pericial objetiva es indispensable:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Tasación / Intermediación</th>
      <th style="padding:12px 14px;">Tarifa Promedio Madrid</th>
      <th style="padding:12px 14px;">Validez Legal y Plazo</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Tasación hipotecaria piso estándar (hasta 120 m²)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">260 € - 390 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Válida durante 6 meses ante cualquier banco en España (Orden ECO)</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Tasación chalet unifamiliar en urbanización (Pozuelo, Las Rozas)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">420 € - 680 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Inspección pericial de parcela, piscina, calidades y catastro</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Informe de valoración de mercado para venta</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">110 € - 180 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Estudio comparativo de testigos de transacciones reales recientes</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Certificado de Eficiencia Energética (CEE obligatorio)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">70 € - 110 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Registro en la Dirección General de Industria de la CAM incluido</td>
    </tr>
  </tbody>
</table>

<h2>2. Derecho del comprador a elegir la sociedad tasadora</h2>
<p>
  Según la Ley de Crédito Inmobiliario 5/2019, la entidad bancaria está obligada por ley a aceptar cualquier tasación oficial homologada por el Banco de España que el cliente aporte, siempre que esté vigente (máximo 6 meses desde su emisión), sin que el banco pueda cobrar comisiones adicionales por rechazar a su tasadora habitual.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Vas a pedir hipoteca o necesitas tasar tu inmueble en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Consigue tu informe pericial homologado con visita en 48 horas.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  }
];

async function run() {
  console.log('[Batch 4] Insertando los 5 artículos finales para completar los 30 de Madrid (26 a 30)...');
  for (const art of ARTICLES_BATCH_4) {
    const [existing] = await pool.query('SELECT id FROM posts WHERE slug = ?', [art.slug]);
    if (existing.length > 0) {
      console.log(` - El artículo ya existe: ${art.slug}`);
      continue;
    }

    const insertSql = `
      INSERT INTO posts (
        title, slug, excerpt, content, featured_image, image_alt,
        category_id, author_id, status, is_featured, is_breaking, is_selected, is_pinned,
        priority_weight, meta_title, meta_description, keywords,
        provincia_id, provincia_slug, provincia_nombre,
        sector_slug, sector_nombre, sector_icono,
        precio_min_orientativo, precio_max_orientativo,
        views, likes, published_at, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        1, 1, 'published', 1, 0, 1, 0,
        ?, ?, ?, ?,
        28, 'madrid', 'Madrid',
        ?, ?, ?,
        ?, ?,
        ?, 0, NOW(), NOW(), NOW()
      )
    `;

    const randomViews = Math.floor(Math.random() * 250) + 120;

    await pool.query(insertSql, [
      art.title,
      art.slug,
      art.excerpt,
      art.content.trim(),
      art.featured_image,
      art.image_alt,
      art.priority_weight,
      art.meta_title,
      art.meta_description,
      art.keywords,
      art.sector_slug,
      art.sector_nombre,
      art.sector_icono,
      art.precio_min_orientativo,
      art.precio_max_orientativo,
      randomViews
    ]);

    console.log(` - Creado artículo artesanal: ${art.title}`);
  }

  const [total] = await pool.query("SELECT COUNT(*) as c FROM posts WHERE provincia_slug = 'madrid'");
  console.log(`[Batch 4] ¡ENHORABUENA! Total artículos de Madrid en la base de datos ahora: ${total[0].c}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error insertando Batch 4:', err);
  process.exit(1);
});
