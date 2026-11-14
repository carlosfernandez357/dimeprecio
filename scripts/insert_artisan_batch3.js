const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const ARTICLES_BATCH_3 = [
  {
    title: 'Asesorías y Gestorías en Madrid: Precios para Autónomos y Pymes (2026)',
    slug: 'asesorias-gestorias-madrid-precios-autonomos-pymes',
    excerpt: '¿Cuánto cuesta una asesoría fiscal y contable en Madrid? Cuotas mensuales para autónomos, constitución de SL y presentación de impuestos en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
    image_alt: 'Reunión de consultoría fiscal y gestión contable para autónomos en Madrid',
    meta_title: 'Asesorías y Gestorías en Madrid Precios para Autónomos y SL 2026 | DimePrecio.es',
    meta_description: 'Tarifas reales de asesorías en Madrid: cuotas de autónomos desde 49€/mes, pymes desde 120€/mes, balances trimestrales y rentas en DimePrecio.es.',
    keywords: 'asesoria fiscal madrid precios, cuota mensual gestoria autonomo madrid, precio gestoria pyme madrid, declaracion renta gestor madrid',
    sector_slug: 'asesorias-gestorias',
    sector_nombre: 'Asesorías y Gestorías',
    sector_icono: '📊',
    precio_min_orientativo: 50,
    precio_max_orientativo: 290,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En la <strong>Comunidad de Madrid</strong>, la cuota mensual de una <strong>gestoría o asesoría fiscal para autónomos</strong> oscila entre <strong>49 € y 75 € / mes</strong> (gestión digital y trimestres modelos 130/303) y entre <strong>70 € y 110 € / mes</strong> con atención presencial en distritos céntricos como Chamberí o Salamanca. Para <strong>pequeñas y medianas empresas (sociedades SL)</strong>, el coste de la contabilidad analítica, balances y presentación de cuentas anuales en el Registro Mercantil ronda entre <strong>120 € y 280 € / mes</strong>. La <strong>Declaración de la Renta anual</strong> con deducciones autonómicas madrileñas se cobra habitualmente entre <strong>50 € y 120 €</strong>.
  </p>
</div>

<h2>1. Tarifas medias de gestoría y asesoría contable en Madrid (2026)</h2>
<p>
  Delegar la fiscalidad ante la Agencia Tributaria en Madrid garantiza aplicar correctamente deducciones por alquiler de vivienda para jóvenes y gastos de suministros para trabajadores por cuenta propia. Tarifas contrastadas por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio de Gestión Fiscal</th>
      <th style="padding:12px 14px;">Cuota / Tarifa Madrid</th>
      <th style="padding:12px 14px;">Incluye</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Autónomo estándar (estimación directa simplificada)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">49 € - 79 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Modelos 303, 130, 390, 190 y resolución de dudas fiscales</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Autónomo societario o con empleados (laboral básica)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">85 € - 145 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Nóminas, altas en Seguridad Social (RED) y retenciones 111</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pyme / Sociedad Limitada (hasta 20 facturas/mes)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">120 € - 220 € / mes</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Impuesto sobre Sociedades (IS 200), legalización de libros</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Constitución exprés de Sociedad Limitada (CIRCE)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">180 € - 350 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Redacción de estatutos, NIF provisional y gestión telemática</td>
    </tr>
  </tbody>
</table>

<h2>2. Qué buscar al contratar una asesoría en Madrid</h2>
<p>
  En el ecosistema empresarial de Madrid (Alcobendas, Pozuelo, distrito financiero de Chamartín o polígonos de Getafe y Fuenlabrada), la rapidez ante requerimientos de Hacienda es vital. Busca asesorías que ofrezcan software en la nube para subir fotos de tickets en tiempo real y certificación de colegiación oficial en el Colegio de Gestores Administrativos de Madrid (ICOGAM).
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas regularizar tu contabilidad o cambiar de gestoría en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Contacta gratis con nuestros asesores colegiados verificados y optimiza tus deducciones fiscales.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Clínicas Dentales en Madrid: Precios de Implantes y Ortodoncia Invisible (2026)',
    slug: 'clinicas-dentales-madrid-precios-implantes-ortodoncia',
    excerpt: '¿Cuánto cuesta un implante dental o Invisalign en Madrid? Comparativa de precios de titanio, coronas de zirconio y ortodoncia en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80',
    image_alt: 'Tratamiento odontológico con escaneo 3D en clínica dental de Madrid',
    meta_title: 'Clínicas Dentales en Madrid Precios Implantes y Ortodoncia 2026 | DimePrecio.es',
    meta_description: 'Precios de implantes dentales completos en Madrid desde 750€ a 1.250€ con corona de zirconio y ortodoncia invisible desde 2.200€ en DimePrecio.es.',
    keywords: 'implante dental madrid precio completo, ortodoncia invisible madrid coste, dentistas madrid opiniones precios, precio corona zirconio madrid',
    sector_slug: 'clinicas-dentales-implantes',
    sector_nombre: 'Clínicas Dentales e Implantes',
    sector_icono: '🦷',
    precio_min_orientativo: 750,
    precio_max_orientativo: 3100,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio total de un <strong>implante dental unitario con corona de zirconio</strong> (incluyendo tornillo de titanio grado quirúrgico, pilar transepitelial, cirugía y TAC 3D previo) se sitúa entre <strong>780 € y 1.250 €</strong>. Tratamientos de <strong>ortodoncia invisible mediante alineadores transparentes</strong> (como Invisalign Spark) tienen un coste medio de <strong>1.900 € a 2.600 €</strong> para correcciones leves (Comprehensive/Lite) y entre <strong>3.200 € y 4.500 €</strong> para tratamientos complejos de más de 18 meses. Las <strong>limpiezas dentales avanzadas por ultrasonidos</strong> oscilan entre <strong>40 € y 65 €</strong>.
  </p>
</div>

<h2>1. Tabla de tratamientos y costes dentales en Madrid (2026)</h2>
<p>
  En el mercado odontológico de Madrid conviven clínicas tradicionales de autor y cadenas sanitarias. Para evitar presupuestos con costes ocultos (cobro extra de aditamentos o radiografías), este es el baremo cerrado verificado por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tratamiento Odontológico</th>
      <th style="padding:12px 14px;">Rango de Precio Madrid</th>
      <th style="padding:12px 14px;">Observaciones y Garantía</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Implante dental completo (fase quirúrgica + corona zirconio)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">780 € - 1.250 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Titanio osteointegrado con pasaporte biológico internacional</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Ortodoncia invisible (ambas arcadas)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.100 € - 3.800 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Alineadores transparentes removibles con revisiones incluidas</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Blanqueamiento dental LED en clínica + férulas en casa</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">240 € - 420 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Peróxido de hidrógeno/carbamida con supervisión médica</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Endodoncia unirradicular / multirradicular</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">110 € - 210 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Tratamiento de conductos con microscopio quirúrgico</td>
    </tr>
  </tbody>
</table>

<h2>2. Consejos para elegir dentista de confianza en Madrid</h2>
<p>
  Comprueba siempre que el odontólogo esté colegiado en el Ilustre Colegio Oficial de Odontólogos y Estomatólogos de la 1ª Región (COEM). En implantes dentales, exige factura detallada con el lote y la marca del implante (como Straumann, Nobel Biocare o Klockner) para asegurar la compatibilidad de piezas en revisiones futuras.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas diagnóstico dental o presupuesto cerrado en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Consulta con especialistas colegiados con tecnología de escaneo intraoral 3D.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Fisioterapeutas en Madrid: Tarifas por Sesión y a Domicilio (2026)',
    slug: 'fisioterapeutas-madrid-precios-sesion-domicilio',
    excerpt: '¿Cuánto cuesta un fisioterapeuta en Madrid? Tarifas por sesión en clínica, bonos de tratamiento y fisio a domicilio en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
    image_alt: 'Sesión de fisioterapia y rehabilitación muscular en Madrid',
    meta_title: 'Fisioterapia en Madrid Precios por Sesión y Domicilio 2026 | DimePrecio.es',
    meta_description: 'Precios de fisioterapeutas en Madrid: sesión en consulta desde 38€ a 55€, fisio a domicilio de 50€ a 75€ y bonos de rehabilitación en DimePrecio.es.',
    keywords: 'fisioterapeuta madrid precio sesion, fisio a domicilio madrid tarifas, bono fisioterapia madrid economico, precio puncion seca madrid',
    sector_slug: 'fisioterapia-rehabilitacion',
    sector_nombre: 'Fisioterapia y Rehabilitación',
    sector_icono: '💪',
    precio_min_orientativo: 38,
    precio_max_orientativo: 75,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, una <strong>sesión individual de fisioterapia clínica de 50 a 60 minutos</strong> (terapia manual, punción seca, diatermia Indiba o neuromodulación) cuesta entre <strong>38 € y 58 €</strong> en barrios como Chamartín, Retiro o Moncloa. La <strong>fisioterapia a domicilio</strong> para pacientes con movilidad reducida o postoperados oscila entre <strong>50 € y 75 € por visita</strong> dentro de la M-30 y corona metropolitana. La adquisición de <strong>bonos de 5 o 10 sesiones</strong> reduce el precio unitario a una horquilla de <strong>32 € a 45 € / sesión</strong>.
  </p>
</div>

<h2>1. Tarifas de tratamientos de fisioterapia en Madrid (2026)</h2>
<p>
  Desde lumbalgias provocadas por el sedentarismo en oficinas madrileñas hasta lesiones deportivas en corredores de El Retiro o Casa de Campo, estas son las tarifas promedio de <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Modalidad de Tratamiento</th>
      <th style="padding:12px 14px;">Coste por Sesión Madrid</th>
      <th style="padding:12px 14px;">Duración y Técnicas</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sesión clínica individual (terapia manual integral)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">38 € - 55 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">50-60 min: masaje terapéutico, osteopatía y estiramientos</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Fisioterapia a domicilio en Madrid capital</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">50 € - 75 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Desplazamiento con camilla portátil para personas mayores o rehabilitación</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sesión avanzada con Diatermia (Radiofrecuencia Indiba)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">50 € - 70 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Regeneración celular rápida para tendinitis y roturas fibrilares</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Bono de 5 sesiones en consulta</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">170 € - 230 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Ahorro de hasta el 20% respecto a pago individual</td>
    </tr>
  </tbody>
</table>

<h2>2. Garantía sanitaria de colegiación</h2>
<p>
  Asegúrate de que el terapeuta esté inscrito en el Colegio Profesional de Fisioterapeutas de la Comunidad de Madrid (CPFM). Un fisioterapeuta titulado diagnostica patologías músculo-esqueléticas y descarta contraindicaciones antes de aplicar técnicas invasivas como la punción seca o electrolisis percutánea intratisular (EPI).
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Sufres dolores cervicales o necesitas rehabilitación en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Solicita cita hoy con fisioterapeutas colegiados en consulta o a domicilio.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Injerto Capilar en Madrid: Precios Método FUE y Clínicas Especializadas (2026)',
    slug: 'injerto-capilar-madrid-precios-metodo-fue',
    excerpt: '¿Cuánto cuesta un injerto capilar en Madrid? Precios por folículo, técnica FUE zafiro, DHI y revisiones postoperatorias en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80',
    image_alt: 'Consulta especializada en cirugía capilar y medicina estética en Madrid',
    meta_title: 'Injerto Capilar en Madrid Precios Técnica FUE Zafiro 2026 | DimePrecio.es',
    meta_description: 'Precios de trasplante capilar en Madrid: paquetes FUE de 2.500 a 4.000 folículos desde 2.100€ a 3.800€ con seguimiento médico y mesoterapia en DimePrecio.es.',
    keywords: 'injerto capilar madrid precio, tecnica fue madrid coste, trasplante pelo madrid clinicas, precio 3000 foliculos madrid injerto',
    sector_slug: 'clinicas-estetica-injerto-capilar',
    sector_nombre: 'Medicina Estética e Injerto Capilar',
    sector_icono: '✂️',
    precio_min_orientativo: 1900,
    precio_max_orientativo: 4200,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio medio de un <strong>injerto capilar con técnica FUE o FUE Zafiro</strong> (de 2.500 a 3.800 unidades foliculares, equivalentes a entre 5.500 y 8.500 cabellos) oscila entre <strong>2.100 € y 3.900 €</strong> todo incluido en clínicas autorizadas por la Consejería de Sanidad. La técnica <strong>DHI (Direct Hair Implantation)</strong> sin rapado previo tiene un precio que oscila entre <strong>2.800 € y 4.600 €</strong>. Operarse en Madrid ofrece la ventaja de contar con revisiones presenciales a los 3, 6 y 12 meses y tratamientos coadyuvantes como <strong>mesoterapia con dutasteride o PRP</strong> (desde 110 € / sesión).
  </p>
</div>

<h2>1. Comparativa de precios de trasplante capilar en Madrid (2026)</h2>
<p>
  Madrid se ha consolidado como la capital europea del trasplante capilar por su relación entre rigor médico y precio competitivo frente a viajes a Turquía. Baremos de <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tratamiento Capilar</th>
      <th style="padding:12px 14px;">Precio Paquete Madrid</th>
      <th style="padding:12px 14px;">Folículos y Seguimiento</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">FUE Zafiro estándar (entradas o coronilla)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.100 € - 2.800 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Hasta 2.500 folículos, anestesia local y primer lavado en clínica</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">FUE Zafiro megasesión (alopecia avanzada)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.900 € - 3.900 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">3.500 a 4.500 folículos, quirófano hospitalario y seguimiento 1 año</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Técnica DHI con implanter Lion (sin rapar)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">2.800 € - 4.500 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Máxima densidad natural en zona frontal sin modificar la longitud</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Sesión individual de PRP / Mesoterapia capilar</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">110 € - 170 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Factores de crecimiento autólogos y bioestimulación del bulbo</td>
    </tr>
  </tbody>
</table>

<h2>2. Qué incluye la intervención en clínicas madrileñas</h2>
<p>
  En Madrid la intervención se realiza con médicos colegiados y anestesistas presentes. El pack integral incluye análisis de sangre previo, kit de lavado con champú neutro y loción antiséptica, almohada cervical de viaje y revisiones médicas programadas a los 10 días, 3 meses, 6 meses y al año final de evolución.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Deseas una valoración capilar con densidad estimada en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Consulta disponibilidad con cirujanos capilares acreditados de Madrid.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Psicólogos en Madrid: Precios de Terapia Presencial y Online (2026)',
    slug: 'psicologos-madrid-precios-terapia-presencial-online',
    excerpt: '¿Cuánto cuesta un psicólogo en Madrid? Tarifas de terapia para ansiedad, parejas y terapia online por sesión y bonos en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80',
    image_alt: 'Gabinete de consulta psicológica profesional en Madrid centro',
    meta_title: 'Psicólogos en Madrid Precios por Sesión Presencial y Online 2026 | DimePrecio.es',
    meta_description: 'Precios de psicólogos en Madrid: consulta individual de 50€ a 75€, terapia de pareja desde 75€ y terapia online desde 45€ en DimePrecio.es.',
    keywords: 'psicologo madrid precio sesion, terapia pareja madrid coste, psicologo ansiedad madrid opiniones, psicologos baratos madrid precios',
    sector_slug: 'psicologos-terapia',
    sector_nombre: 'Psicología y Terapia',
    sector_icono: '🧠',
    precio_min_orientativo: 45,
    precio_max_orientativo: 85,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el precio medio de una sesión de <strong>psicología clínica o sanitaria individual</strong> (de 50 a 60 minutos para tratamiento de ansiedad, estrés laboral o depresión) oscila entre <strong>50 € y 75 €</strong> en consulta presencial (gabinete en barrios como Chamberí, Arganzuela o Salamanca). La <strong>terapia psicológica online por videollamada</strong> cuesta habitualmente entre <strong>45 € y 60 € por sesión</strong>. Para <strong>terapia de pareja o sexología</strong> (sesiones de 75 a 90 minutos), los honorarios medios se sitúan entre <strong>75 € y 105 €</strong>.
  </p>
</div>

<h2>1. Tarifas de terapia psicológica en Madrid (2026)</h2>
<p>
  El ritmo exigente de la capital madrileña incrementa las consultas de salud mental por burnout laboral y crisis de pánico. Baremos oficiales de consulta según <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Tipo de Intervención Psicológica</th>
      <th style="padding:12px 14px;">Precio por Sesión Madrid</th>
      <th style="padding:12px 14px;">Metodología / Duración</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Terapia individual adultos (presencial)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">50 € - 75 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">50-60 min: Cognitivo-conductual, EMDR o Terapia de Aceptación</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Terapia online individual (videoconferencia)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">45 € - 60 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Misma eficacia clínica sin desplazamientos por Madrid</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Terapia de pareja (ambos miembros)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">75 € - 105 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">75-90 min: resolución de conflictos de convivencia y comunicación</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Psicología infantil y juvenil</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">55 € - 75 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Evaluación de TDAH, problemas de conducta escolar y autoestima</td>
    </tr>
  </tbody>
</table>

<h2>2. Diferencia entre Psicólogo General Sanitario y Coach</h2>
<p>
  En Madrid es esencial verificar el número de colegiado en el Colegio Oficial de la Psicología de Madrid (COP Madrid) y la habilitación de Centro Sanitario expedida por la Comunidad de Madrid. Solo los profesionales sanitarios están cualificados para emitir diagnósticos clínicos y aplicar psicoterapias basadas en la evidencia científica.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas apoyo psicológico confidencial en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Habla con terapeutas colegiados para iniciar tu proceso con cercanía y rigor.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  },
  {
    title: 'Talleres Mecánicos y Chapa y Pintura en Madrid: Precios y Tarifas (2026)',
    slug: 'talleres-mecanicos-chapa-pintura-madrid-precios',
    excerpt: '¿Cuánto cuesta pintar un coche o una revisión mecánica en Madrid? Precio de pintar por piezas, cambio de embrague y frenos en DimePrecio.es.',
    featured_image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=80',
    image_alt: 'Taller mecánico profesional realizando diagnosis y chapa en Madrid',
    meta_title: 'Talleres Mecánicos y Chapa y Pintura en Madrid Precios 2026 | DimePrecio.es',
    meta_description: 'Precios de talleres mecánicos en Madrid: pintar coche entero de 900€ a 1.600€, pieza suelta desde 90€, cambio de embrague y revisión en DimePrecio.es.',
    keywords: 'pintar coche entero madrid precio, taller chapa y pintura barato madrid, cambio embrague madrid precio taller, revision coche itv madrid coste',
    sector_slug: 'talleres-mecanicos-chapa-pintura',
    sector_nombre: 'Talleres Mecánicos y Chapa y Pintura',
    sector_icono: '🚗',
    precio_min_orientativo: 90,
    precio_max_orientativo: 1450,
    priority_weight: 8,
    content: `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, <strong>pintar un coche entero</strong> (desmontaje de molduras, lijado, masillado de pequeños golpes, cabina de secado y barniz bicapa) cuesta entre <strong>900 € y 1.550 €</strong> para vehículos compactos y berlinas medias en polígonos de Villaverde, Vallecas o San Fernando de Henares. <strong>Pintar una pieza suelta</strong> (paragolpes, aleta o puerta) oscila entre <strong>90 € y 140 €</strong>. Para averías mecánicas habituales, el <strong>cambio de embrague con bimasa</strong> ronda entre <strong>550 € y 980 €</strong>, y el <strong>cambio de correa de distribución con bomba de agua</strong> se sitúa entre <strong>380 € y 620 €</strong>.
  </p>
</div>

<h2>1. Tabla de precios de chapa, pintura y mecánica en Madrid (2026)</h2>
<p>
  El tráfico continuo en la M-30 y las zonas de aparcamiento regulado (SER) de Madrid generan numerosos rozones de carrocería. Precios orientativos en talleres auditados por <strong>DimePrecio.es</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Operación de Taller</th>
      <th style="padding:12px 14px;">Coste Orientativo Madrid</th>
      <th style="padding:12px 14px;">Tiempo de Entrega / Garantía</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pintar pieza individual (paragolpes delantero/trasero)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">90 € - 140 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">24 - 48 horas en cabina presurizada con pintura al agua</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Pintado integral del vehículo (mismo color original)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">950 € - 1.550 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Garantía de 3 a 5 años en brillo y resistencia UV</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Kit de distribución + bomba de agua + anticongelante</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">380 € - 620 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Piezas originales Continental/Gates con factura detallada</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Revisión de mantenimiento completa (aceite sintético + 4 filtros)</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">140 € - 220 €</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Sellado en libro digital manteniendo la garantía oficial de fabricante</td>
    </tr>
  </tbody>
</table>

<h2>2. Mano de obra y vehículo de sustitución en Madrid</h2>
<p>
  El precio por hora de mano de obra en talleres mecánicos de Madrid oscila entre <strong>38 € y 55 € / hora</strong> en talleres multimarca independientes, frente a los <strong>80 € - 120 € / hora</strong> de los servicios oficiales de marcas premium. Pregunta siempre por la disponibilidad de coche de cortesía gratuito mientras tu vehículo esté en bancada o cabina de pintura.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:24px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas presupuesto de reparación o chapa en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Contacta con talleres de confianza con vehículo de sustitución y presupuesto cerrado.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`
  }
];

async function run() {
  console.log('[Batch 3] Insertando 6 artículos artesanales más para Madrid (20 a 25)...');
  for (const art of ARTICLES_BATCH_3) {
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
  console.log(`[Batch 3] Total artículos de Madrid en la base de datos ahora: ${total[0].c}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error insertando Batch 3:', err);
  process.exit(1);
});
