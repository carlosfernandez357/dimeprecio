// ============================================================================
// MATRIZ NACIONAL PIDEPRECIO.ES (https://pideprecio.es)
// 52 PROVINCIAS (con coordenadas GPS para detección de usuario) × 30+ SECTORES
// Con tarifas de los 4 Estilos de Negocio y Formularios Personalizables.
// ============================================================================

const LOCATIONS = [
    { id: 1, slug: "madrid", nombre: "Madrid", comunidad_autonoma: "Comunidad de Madrid", lat: 40.4168, lng: -3.7038, poblacion: 6871903, modificador_precio_regional: 1.18, municipios: ["Madrid Centro", "Chamberí", "Salamanca", "Chamartín", "Pozuelo de Alarcón", "Alcobendas", "Las Rozas", "Móstoles", "Alcalá de Henares", "Getafe", "Leganés", "Majadahonda"] },
    { id: 2, slug: "barcelona", nombre: "Barcelona", comunidad_autonoma: "Cataluña", lat: 41.3874, lng: 2.1686, poblacion: 5807448, modificador_precio_regional: 1.16, municipios: ["Eixample", "Sarrià-Sant Gervasi", "Gràcia", "Sant Cugat del Vallès", "Badalona", "L'Hospitalet de Llobregat", "Sabadell", "Terrassa", "Mataró", "Castelldefels", "Sitges"] },
    { id: 3, slug: "valencia", nombre: "Valencia", comunidad_autonoma: "Comunidad Valenciana", lat: 39.4699, lng: -0.3763, poblacion: 2656291, modificador_precio_regional: 1.04, municipios: ["Valencia Centro", "Ruzafa", "El Carmen", "Campanar", "Benimaclet", "Paterna", "Torrent", "Gandía", "Sagunto", "Alzira", "Mislata"] },
    { id: 4, slug: "sevilla", nombre: "Sevilla", comunidad_autonoma: "Andalucía", lat: 37.3891, lng: -5.9845, poblacion: 1957197, modificador_precio_regional: 0.98, municipios: ["Sevilla Centro", "Triana", "Nervión", "Los Remedios", "Macarena", "Dos Hermanas", "Alcalá de Guadaíra", "Mairena del Aljarafe", "Utrera"] },
    { id: 5, slug: "alicante", nombre: "Alicante", comunidad_autonoma: "Comunidad Valenciana", lat: 38.3452, lng: -0.4810, poblacion: 1955268, modificador_precio_regional: 1.02, municipios: ["Alicante Centro", "Playa de San Juan", "Elche", "Torrevieja", "Benidorm", "Orihuela", "Alcoy", "Elda", "Dénia", "Jávea"] },
    { id: 6, slug: "malaga", nombre: "Málaga", comunidad_autonoma: "Andalucía", lat: 36.7213, lng: -4.4214, poblacion: 1752728, modificador_precio_regional: 1.06, municipios: ["Málaga Centro", "Teatinos", "El Limonar", "Marbella", "Mijas", "Vélez-Málaga", "Fuengirola", "Estepona", "Benalmádena", "Torremolinos"] },
    { id: 7, slug: "murcia", nombre: "Murcia", comunidad_autonoma: "Región de Murcia", lat: 37.9922, lng: -1.1307, poblacion: 1552457, modificador_precio_regional: 0.94, municipios: ["Murcia Centro", "El Carmen", "Cartagena", "Lorca", "Molina de Segura", "Alcantarilla", "San Javier", "Águilas"] },
    { id: 8, slug: "cadiz", nombre: "Cádiz", comunidad_autonoma: "Andalucía", lat: 36.5271, lng: -6.2886, poblacion: 1250539, modificador_precio_regional: 0.95, municipios: ["Cádiz Centro", "Jerez de la Frontera", "Algeciras", "El Puerto de Santa María", "Chiclana de la Frontera", "San Fernando", "Sanlúcar de Barrameda"] },
    { id: 9, slug: "baleares", nombre: "Baleares", comunidad_autonoma: "Islas Baleares", lat: 39.5696, lng: 2.6502, poblacion: 1209906, modificador_precio_regional: 1.17, municipios: ["Palma de Mallorca", "Calvià", "Ibiza", "Manacor", "Santa Eulària des Riu", "Inca", "Llucmajor", "Mahón", "Ciutadella"] },
    { id: 10, slug: "las-palmas", nombre: "Las Palmas", comunidad_autonoma: "Canarias", lat: 28.1235, lng: -15.4363, poblacion: 1145843, modificador_precio_regional: 0.99, municipios: ["Las Palmas de Gran Canaria", "Triana", "Vegueta", "Telde", "Santa Lucía de Tirajana", "San Bartolomé de Tirajana", "Arrecife"] },
    { id: 11, slug: "vizcaya", nombre: "Vizcaya", comunidad_autonoma: "País Vasco", lat: 43.2630, lng: -2.9350, poblacion: 1153282, modificador_precio_regional: 1.14, municipios: ["Bilbao", "Abando", "Indautxu", "Deusto", "Barakaldo", "Getxo", "Portugalete", "Santurtzi", "Basauri", "Leioa"] },
    { id: 12, slug: "a-coruna", nombre: "A Coruña", comunidad_autonoma: "Galicia", lat: 43.3623, lng: -8.4115, poblacion: 1123422, modificador_precio_regional: 0.97, municipios: ["A Coruña Centro", "Ensanche", "Santiago de Compostela", "Ferrol", "Narón", "Oleiros", "Arteixo", "Carballo"] },
    { id: 13, slug: "santa-cruz-de-tenerife", nombre: "Santa Cruz de Tenerife", comunidad_autonoma: "Canarias", lat: 28.4636, lng: -16.2518, poblacion: 1062845, modificador_precio_regional: 0.98, municipios: ["Santa Cruz de Tenerife", "San Cristóbal de La Laguna", "Arona", "Adeje", "Granadilla de Abona", "La Orotava", "Puerto de la Cruz"] },
    { id: 14, slug: "asturias", nombre: "Asturias", comunidad_autonoma: "Principado de Asturias", lat: 43.3614, lng: -5.8593, poblacion: 1006060, modificador_precio_regional: 0.97, municipios: ["Oviedo", "Gijón", "Avilés", "Siero", "Langreo", "Mieres", "Castrillón", "Villaviciosa"] },
    { id: 15, slug: "zaragoza", nombre: "Zaragoza", comunidad_autonoma: "Aragón", lat: 41.6488, lng: -0.8891, poblacion: 979365, modificador_precio_regional: 1.00, municipios: ["Zaragoza Centro", "Delicias", "Actur", "Romareda", "Valdespartera", "Calatayud", "Utebo", "Cuarte de Huerva"] },
    { id: 16, slug: "pontevedra", nombre: "Pontevedra", comunidad_autonoma: "Galicia", lat: 42.4298, lng: -8.6446, poblacion: 944825, modificador_precio_regional: 0.96, municipios: ["Vigo", "Pontevedra Centro", "Vilagarcía de Arousa", "Redondela", "Cangas", "Marín", "Sanxenxo"] },
    { id: 17, slug: "granada", nombre: "Granada", comunidad_autonoma: "Andalucía", lat: 37.1773, lng: -3.5986, poblacion: 930181, modificador_precio_regional: 0.95, municipios: ["Granada Centro", "Zaidín", "Albaicín", "Motril", "Almuñécar", "Armilla", "Maracena", "Las Gabias"] },
    { id: 18, slug: "tarragona", nombre: "Tarragona", comunidad_autonoma: "Cataluña", lat: 41.1189, lng: 1.2445, poblacion: 848960, modificador_precio_regional: 1.05, municipios: ["Tarragona Centro", "Reus", "Vendrell", "Cambrils", "Tortosa", "Salou", "Calafell", "Valls"] },
    { id: 19, slug: "girona", nombre: "Girona", comunidad_autonoma: "Cataluña", lat: 41.9794, lng: 2.8214, poblacion: 809268, modificador_precio_regional: 1.08, municipios: ["Girona Centro", "Figueres", "Blanes", "Lloret de Mar", "Olot", "Salt", "Palafrugell", "Platja d'Aro"] },
    { id: 20, slug: "cordoba", nombre: "Córdoba", comunidad_autonoma: "Andalucía", lat: 37.8882, lng: -4.7794, poblacion: 773997, modificador_precio_regional: 0.93, municipios: ["Córdoba Centro", "Ciudad Jardín", "El Brillante", "Lucena", "Puente Genil", "Montilla", "Priego de Córdoba"] },
    { id: 21, slug: "almeria", nombre: "Almería", comunidad_autonoma: "Andalucía", lat: 36.8340, lng: -2.4637, poblacion: 753920, modificador_precio_regional: 0.94, municipios: ["Almería Centro", "Aguadulce", "Roquetas de Mar", "El Ejido", "Níjar", "Vícar", "Adra", "Vera"] },
    { id: 22, slug: "guipuzcoa", nombre: "Guipúzcoa", comunidad_autonoma: "País Vasco", lat: 43.3183, lng: -1.9812, poblacion: 727121, modificador_precio_regional: 1.15, municipios: ["San Sebastián (Donostia)", "Gros", "Amara", "Irun", "Errenteria", "Eibar", "Zarautz", "Mondragón"] },
    { id: 23, slug: "toledo", nombre: "Toledo", comunidad_autonoma: "Castilla-La Mancha", lat: 39.8628, lng: -4.0273, poblacion: 731112, modificador_precio_regional: 0.96, municipios: ["Toledo Casco", "Santa María de Benquerencia", "Talavera de la Reina", "Illescas", "Seseña", "Torrijos"] },
    { id: 24, slug: "badajoz", nombre: "Badajoz", comunidad_autonoma: "Extremadura", lat: 38.8794, lng: -6.9707, poblacion: 665979, modificador_precio_regional: 0.90, municipios: ["Badajoz Centro", "Mérida", "Don Benito", "Almendralejo", "Villanueva de la Serena", "Zafra"] },
    { id: 25, slug: "navarra", nombre: "Navarra", comunidad_autonoma: "Comunidad Foral de Navarra", lat: 42.8125, lng: -1.6458, poblacion: 672155, modificador_precio_regional: 1.07, municipios: ["Pamplona", "Iturrama", "Ensanche", "Tudela", "Barañáin", "Valle de Egüés", "Burlada", "Estella"] },
    { id: 26, slug: "jaen", nombre: "Jaén", comunidad_autonoma: "Andalucía", lat: 37.7796, lng: -3.7849, poblacion: 620242, modificador_precio_regional: 0.90, municipios: ["Jaén Centro", "Linares", "Andújar", "Úbeda", "Martos", "Alcalá la Real", "Baeza"] },
    { id: 27, slug: "castellon", nombre: "Castellón", comunidad_autonoma: "Comunidad Valenciana", lat: 39.9864, lng: -0.0513, poblacion: 604086, modificador_precio_regional: 0.98, municipios: ["Castellón de la Plana", "Vila-real", "Burriana", "La Vall d'Uixó", "Vinaròs", "Benicarló", "Benicàssim"] },
    { id: 28, slug: "cantabria", nombre: "Cantabria", comunidad_autonoma: "Cantabria", lat: 43.4623, lng: -3.8099, poblacion: 588387, modificador_precio_regional: 1.00, municipios: ["Santander", "El Sardinero", "Torrelavega", "Castro-Urdiales", "Camargo", "Piélagos", "Laredo"] },
    { id: 29, slug: "huelva", nombre: "Huelva", comunidad_autonoma: "Andalucía", lat: 37.2614, lng: -6.9447, poblacion: 530824, modificador_precio_regional: 0.92, municipios: ["Huelva Centro", "Lepe", "Almonte", "Moguer", "Aljaraque", "Ayamonte", "Isla Cristina"] },
    { id: 30, slug: "valladolid", nombre: "Valladolid", comunidad_autonoma: "Castilla y León", lat: 41.6523, lng: -4.7245, poblacion: 521333, modificador_precio_regional: 0.97, municipios: ["Valladolid Centro", "Parquesol", "Delicias", "Laguna de Duero", "Medina del Campo", "Arroyo de la Encomienda"] },
    { id: 31, slug: "ciudad-real", nombre: "Ciudad Real", comunidad_autonoma: "Castilla-La Mancha", lat: 38.9848, lng: -3.9274, poblacion: 491427, modificador_precio_regional: 0.91, municipios: ["Ciudad Real Centro", "Puertollano", "Tomelloso", "Alcázar de San Juan", "Valdepeñas", "Manzanares"] },
    { id: 32, slug: "leon", nombre: "León", comunidad_autonoma: "Castilla y León", lat: 42.5987, lng: -5.5671, poblacion: 447802, modificador_precio_regional: 0.93, municipios: ["León Centro", "El Ejido", "Ponferrada", "San Andrés del Rabanedo", "Villaquilambre", "Astorga"] },
    { id: 33, slug: "lleida", nombre: "Lleida", comunidad_autonoma: "Cataluña", lat: 41.6176, lng: 0.6200, poblacion: 446793, modificador_precio_regional: 1.02, municipios: ["Lleida Centro", "Cappont", "Tàrrega", "Balaguer", "Mollerussa", "La Seu d'Urgell"] },
    { id: 34, slug: "caceres", nombre: "Cáceres", comunidad_autonoma: "Extremadura", lat: 39.4753, lng: -6.3724, poblacion: 387826, modificador_precio_regional: 0.90, municipios: ["Cáceres Centro", "Plasencia", "Navalmoral de la Mata", "Coria", "Miajadas", "Trujillo"] },
    { id: 35, slug: "albacete", nombre: "Albacete", comunidad_autonoma: "Castilla-La Mancha", lat: 38.9943, lng: -1.8585, poblacion: 387529, modificador_precio_regional: 0.93, municipios: ["Albacete Centro", "Imaginalia", "Hellín", "Villarrobledo", "Almansa", "La Roda"] },
    { id: 36, slug: "burgos", nombre: "Burgos", comunidad_autonoma: "Castilla y León", lat: 42.3440, lng: -3.6969, poblacion: 357370, modificador_precio_regional: 0.96, municipios: ["Burgos Centro", "Gamonal", "Miranda de Ebro", "Aranda de Duero", "Briviesca"] },
    { id: 37, slug: "alava", nombre: "Álava", comunidad_autonoma: "País Vasco", lat: 42.8467, lng: -2.6716, poblacion: 336308, modificador_precio_regional: 1.12, municipios: ["Vitoria-Gasteiz", "Lakua", "Zabalgana", "Salburua", "Llodio", "Amurrio"] },
    { id: 38, slug: "salamanca", nombre: "Salamanca", comunidad_autonoma: "Castilla y León", lat: 40.9701, lng: -5.6635, poblacion: 327089, modificador_precio_regional: 0.94, municipios: ["Salamanca Centro", "Garrido", "Santa Marta de Tormes", "Béjar", "Ciudad Rodrigo"] },
    { id: 39, slug: "lugo", nombre: "Lugo", comunidad_autonoma: "Galicia", lat: 43.0097, lng: -7.5568, poblacion: 324267, modificador_precio_regional: 0.92, municipios: ["Lugo Centro", "Monforte de Lemos", "Viveiro", "Vilalba", "Sarria", "Foz"] },
    { id: 40, slug: "la-rioja", nombre: "La Rioja", comunidad_autonoma: "La Rioja", lat: 42.4627, lng: -2.4450, poblacion: 322282, modificador_precio_regional: 0.98, municipios: ["Logroño", "Cascajos", "Calahorra", "Arnedo", "Haro", "Lardero"] },
    { id: 41, slug: "ourense", nombre: "Ourense", comunidad_autonoma: "Galicia", lat: 42.3358, lng: -7.8639, poblacion: 304563, modificador_precio_regional: 0.92, municipios: ["Ourense Centro", "A Ponte", "O Barco de Valdeorras", "Verín", "O Carballiño"] },
    { id: 42, slug: "guadalajara", nombre: "Guadalajara", comunidad_autonoma: "Castilla-La Mancha", lat: 40.6337, lng: -3.1674, poblacion: 275082, modificador_precio_regional: 1.01, municipios: ["Guadalajara Centro", "Azuqueca de Henares", "Alovera", "El Casar", "Cabanillas del Campo"] },
    { id: 43, slug: "huesca", nombre: "Huesca", comunidad_autonoma: "Aragón", lat: 42.1401, lng: -0.4089, poblacion: 226878, modificador_precio_regional: 0.97, municipios: ["Huesca Centro", "Monzón", "Barbastro", "Fraga", "Jaca", "Sabiñánigo"] },
    { id: 44, slug: "cuenca", nombre: "Cuenca", comunidad_autonoma: "Castilla-La Mancha", lat: 40.0704, lng: -2.1374, poblacion: 197139, modificador_precio_regional: 0.91, municipios: ["Cuenca Centro", "Tarancón", "Quintanar del Rey", "Las Pedroñeras", "San Clemente"] },
    { id: 45, slug: "zamora", nombre: "Zamora", comunidad_autonoma: "Castilla y León", lat: 41.5035, lng: -5.7468, poblacion: 166253, modificador_precio_regional: 0.90, municipios: ["Zamora Centro", "Benavente", "Toro", "Morales del Vino"] },
    { id: 46, slug: "palencia", nombre: "Palencia", comunidad_autonoma: "Castilla y León", lat: 42.0096, lng: -4.5288, poblacion: 157787, modificador_precio_regional: 0.92, municipios: ["Palencia Centro", "Aguilar de Campoo", "Guardo", "Venta de Baños"] },
    { id: 47, slug: "avila", nombre: "Ávila", comunidad_autonoma: "Castilla y León", lat: 40.6567, lng: -4.6812, poblacion: 158407, modificador_precio_regional: 0.92, municipios: ["Ávila Centro", "Arévalo", "Arenas de San Pedro", "Las Navas del Marqués"] },
    { id: 48, slug: "segovia", nombre: "Segovia", comunidad_autonoma: "Castilla y León", lat: 40.9429, lng: -4.1088, poblacion: 155332, modificador_precio_regional: 0.96, municipios: ["Segovia Centro", "El Espinar", "Cuéllar", "Real Sitio de San Ildefonso"] },
    { id: 49, slug: "teruel", nombre: "Teruel", comunidad_autonoma: "Aragón", lat: 40.3456, lng: -1.1065, poblacion: 134421, modificador_precio_regional: 0.92, municipios: ["Teruel Centro", "Alcañiz", "Andorra", "Calamocha", "Utrillas"] },
    { id: 50, slug: "soria", nombre: "Soria", comunidad_autonoma: "Castilla y León", lat: 41.7666, lng: -2.4790, poblacion: 89528, modificador_precio_regional: 0.93, municipios: ["Soria Centro", "Almazán", "El Burgo de Osma", "Ólvega"] },
    { id: 51, slug: "ceuta", nombre: "Ceuta", comunidad_autonoma: "Ciudad Autónoma de Ceuta", lat: 35.8894, lng: -5.3213, poblacion: 83052, modificador_precio_regional: 0.96, municipios: ["Ceuta Centro", "El Sardinero", "Hadú", "Benzú"] },
    { id: 52, slug: "melilla", nombre: "Melilla", comunidad_autonoma: "Ciudad Autónoma de Melilla", lat: 35.2923, lng: -2.9381, poblacion: 85493, modificador_precio_regional: 0.96, municipios: ["Melilla Centro", "Industrial", "El Real", "Hipódromo"] }
];

// Tarifas exactas de los 4 estilos de negocio según el tipo de sector en España
const TIER_BUSINESS_MODELS = {
    urgencias: { leadMin: 15, leadMax: 30, leadDefault: 25, rentMonthly: 350, commissionPct: 12, featuredMonthly: 99, lead_min: 15, lead_max: 30, lead_recomendado: 25, alquiler_mensual_zona: 350, comision_obra_pct: 12, espacio_destacado_mes: 99, ticket_medio_obra: 350 },
    medio: { leadMin: 20, leadMax: 40, leadDefault: 30, rentMonthly: 400, commissionPct: 12, featuredMonthly: 149, lead_min: 20, lead_max: 40, lead_recomendado: 30, alquiler_mensual_zona: 400, comision_obra_pct: 12, espacio_destacado_mes: 149, ticket_medio_obra: 1500 },
    servicios_medios: { leadMin: 20, leadMax: 40, leadDefault: 30, rentMonthly: 400, commissionPct: 12, featuredMonthly: 149, lead_min: 20, lead_max: 40, lead_recomendado: 30, alquiler_mensual_zona: 400, comision_obra_pct: 12, espacio_destacado_mes: 149, ticket_medio_obra: 1500 },
    profesional: { leadMin: 35, leadMax: 70, leadDefault: 50, rentMonthly: 450, commissionPct: 15, featuredMonthly: 199, lead_min: 35, lead_max: 70, lead_recomendado: 50, alquiler_mensual_zona: 450, comision_obra_pct: 15, espacio_destacado_mes: 199, ticket_medio_obra: 2500 },
    profesionales_salud_legal: { leadMin: 35, leadMax: 70, leadDefault: 50, rentMonthly: 450, commissionPct: 15, featuredMonthly: 199, lead_min: 35, lead_max: 70, lead_recomendado: 50, alquiler_mensual_zona: 450, comision_obra_pct: 15, espacio_destacado_mes: 199, ticket_medio_obra: 2500 },
    alto_ticket: { leadMin: 50, leadMax: 120, leadDefault: 75, rentMonthly: 550, commissionPct: 15, featuredMonthly: 249, lead_min: 50, lead_max: 120, lead_recomendado: 75, alquiler_mensual_zona: 550, comision_obra_pct: 15, espacio_destacado_mes: 249, ticket_medio_obra: 12000 },
    ticket_alto: { leadMin: 50, leadMax: 120, leadDefault: 75, rentMonthly: 550, commissionPct: 15, featuredMonthly: 249, lead_min: 50, lead_max: 120, lead_recomendado: 75, alquiler_mensual_zona: 550, comision_obra_pct: 15, espacio_destacado_mes: 249, ticket_medio_obra: 12000 }
};

function buildSectorDefaultCalculatorAndFields(slug, nombre, icono, workTypes, scopes) {
    // 1. CLIMATIZACIÓN Y AIRE ACONDICIONADO -> Calculador de Frigorías, kW y Equipos
    if (slug === "climatizacion-aire-acondicionado") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "frigorias",
                titulo: "❄️ Calculador Técnico de Frigorías y Potencia (kW)",
                descripcion: "Calcula al instante cuántas frigorías y qué potencia necesita tu estancia o vivienda antes de enviar la solicitud:",
                campos_calculadora: [
                    { name: "m2_estancia", label: "Superficie a climatizar (m²)", type: "number", defaultValue: 25, min: 8, max: 350 },
                    { name: "altura_techo", label: "Altura del techo", type: "select", options: ["Estándar (2,5 m)", "Techos altos (2,8 - 3,2 m)", "Doble altura o local (+3,3 m)"] },
                    { name: "orientacion_sol", label: "Incidencia solar y aislamiento", type: "select", options: ["Normal / Sombra parcial", "Muy soleado (Sur/Oeste o Ático)", "Buen aislamiento térmico (Climalit/SATE)"] },
                    { name: "num_estancias", label: "Nº de habitaciones / zonas a climatizar", type: "select", options: ["1 estancia (Split 1x1)", "2 estancias (Multisplit 2x1)", "3 estancias (Multisplit 3x1)", "Toda la vivienda (Conductos)"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Tipo de equipo o instalación de Aire Acondicionado",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "preinstalacion_ac",
                    name: "preinstalacion_ac",
                    label: "¿Dispone de preinstalación hecha?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["No, necesito instalación completa desde cero", "Sí, ya tiene preinstalación de tubería/conductos", "Es para sustituir un aparato antiguo por uno nuevo", "No estoy seguro"],
                    options: ["No, necesito instalación completa desde cero", "Sí, ya tiene preinstalación de tubería/conductos", "Es para sustituir un aparato antiguo por uno nuevo", "No estoy seguro"]
                },
                {
                    id: "ubicacion_compresor",
                    name: "ubicacion_compresor",
                    label: "Ubicación de la unidad exterior (compresor)",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Terraza o balcón accesible", "Fachada o patio interior (fácil acceso)", "Cubierta / Tejado comunitario", "Necesito asesoramiento técnico"],
                    options: ["Terraza o balcón accesible", "Fachada o patio interior (fácil acceso)", "Cubierta / Tejado comunitario", "Necesito asesoramiento técnico"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "¿Para cuándo necesitas la instalación?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Urgente esta semana", "En este mes", "Antes de verano / invierno", "Estoy comparando opciones"],
                    options: ["Urgente esta semana", "En este mes", "Antes de verano / invierno", "Estoy comparando opciones"]
                }
            ]
        };
    }

    // 2. REFORMAS INTEGRALES Y BAÑOS/COCINAS -> Calculador de Superficie m² y Partidas de Obra
    if (slug === "reformas-integrales") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "reforma_m2",
                titulo: "🏗️ Calculador de Alcance y Partidas de Reforma",
                descripcion: "Configura los metros cuadrados y las partidas que incluye tu reforma para adjuntar el cálculo técnico a tu solicitud:",
                campos_calculadora: [
                    { name: "m2_reforma", label: "Superficie aproximada a reformar (m²)", type: "number", defaultValue: 65, min: 3, max: 500 },
                    { name: "tipo_estancia_calc", label: "Tipo principal de intervención", type: "select", options: ["Cambiar bañera por plato de ducha", "Reforma completa de Baño", "Reforma completa de Cocina", "Reforma Integral de Vivienda"] },
                    { name: "calidad_acabados", label: "Gama de materiales deseada", type: "select", options: ["Estándar funcional (Calidad Media)", "Gama Media-Alta (Porcelánico rectificado / Diseño)", "Alta Gama / Premium"] },
                    { name: "partidas_incluidas", label: "Partidas principales necesarias", type: "select", options: ["Albañilería + Fontanería +Alicatado", "Obra completa llave en mano (incluye electricidad, suelos y carpintería)", "Solo mano de obra (yo aporto materiales)"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "¿Qué reforma necesitas realizar?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "estado_inmueble",
                    name: "estado_inmueble",
                    label: "Tipo y estado actual del inmueble",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Piso habitado", "Piso vacío / recién comprado", "Chalet o vivienda unifamiliar", "Local u oficina"],
                    options: ["Piso habitado", "Piso vacío / recién comprado", "Chalet o vivienda unifamiliar", "Local u oficina"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "¿Cuándo quieres empezar la reforma?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Lo antes posible (este mes)", "En 1 a 2 meses", "En 3 o más meses", "Necesito valorar opciones primero"],
                    options: ["Lo antes posible (este mes)", "En 1 a 2 meses", "En 3 o más meses", "Necesito valorar opciones primero"]
                }
            ]
        };
    }

    // 3. PLACAS SOLARES Y AEROTERMIA -> Calculador de Paneles Solares y Potencia (kWp)
    if (slug === "placas-solares-aerotermia") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "solar_kwp",
                titulo: "☀️ Calculador de Paneles Solares y Potencia Recomendada (kWp)",
                descripcion: "Indica tu gasto eléctrico mensual aproximado para calcular cuántos paneles y qué potencia en kWp necesita tu vivienda:",
                campos_calculadora: [
                    { name: "factura_mensual_eur", label: "Gasto mensual aproximado de luz (€/mes)", type: "number", defaultValue: 110, min: 30, max: 1500 },
                    { name: "orientacion_tejado", label: "Orientación e inclinación de la cubierta", type: "select", options: ["Sur / Óptima", "Sureste o Suroeste", "Este / Oeste", "Cubierta plana / Terraza"] },
                    { name: "sistema_deseado", label: "Tipo de sistema energético", type: "select", options: ["Placas Solares Autoconsumo", "Placas Solares + Batería Litio/Virtual", "Aerotermia (Calefacción/Frío + ACS)", "Combinado Placas Solares + Aerotermia"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Instalación energética que deseas solicitar",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "tipo_cubierta",
                    name: "tipo_cubierta",
                    label: "Tipo de tejado o cubierta disponible",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Tejado inclinado de teja (Chalet/Adosado)", "Cubierta plana o azotea transitable", "Comunidad de propietarios", "Nave industrial o cubierta metálica"],
                    options: ["Tejado inclinado de teja (Chalet/Adosado)", "Cubierta plana o azotea transitable", "Comunidad de propietarios", "Nave industrial o cubierta metálica"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "Plazo previsto para la instalación",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Este mes", "En 1 a 2 meses", "En 3 meses", "Solicitar estudio previo"],
                    options: ["Este mes", "En 1 a 2 meses", "En 3 meses", "Solicitar estudio previo"]
                }
            ]
        };
    }

    // 4. PINTORES Y ALISADO DE PAREDES -> Calculador de m² de Pintura y Alisado de Gotelé
    if (slug === "pintores-alisado-paredes") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "pintura_m2",
                titulo: "🎨 Calculador de Superficie de Pintura y Alisado de Paredes",
                descripcion: "Calcula el paramento vertical estimado (m² de paredes y techos) a partir de los m² de suelo de tu vivienda:",
                campos_calculadora: [
                    { name: "m2_vivienda", label: "Superficie en planta del piso o local (m²)", type: "number", defaultValue: 80, min: 15, max: 600 },
                    { name: "estado_paredes", label: "Estado actual de las paredes", type: "select", options: ["Paredes lisas en buen estado (Pintar en blanco/color)", "Tienen gotelé y quiero alisar + pintar", "Paredes con grietas o manchas de humedad a reparar"] },
                    { name: "incluir_techos", label: "¿Incluir pintura de techos y puertas?", type: "select", options: ["Sí, paredes y techos completos", "Solo paredes", "Paredes, techos y lacado de puertas"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Trabajo de pintura solicitado",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "vivienda_amueblada",
                    name: "vivienda_amueblada",
                    label: "¿El inmueble está vacío o amueblado?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Vacío (sin muebles)", "Amueblado (requiere tapar y mover mobiliario)", "Exterior / Fachada / Comunidad"],
                    options: ["Vacío (sin muebles)", "Amueblado (requiere tapar y mover mobiliario)", "Exterior / Fachada / Comunidad"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "¿Cuándo necesitas pintar?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Urgente esta semana", "En este mes", "En 1 a 2 meses"],
                    options: ["Urgente esta semana", "En este mes", "En 1 a 2 meses"]
                }
            ]
        };
    }

    // 5. CARPINTERÍA DE ALUMINIO Y VENTANAS PVC -> Calculador de Nº de Ventanas y Aislamiento
    if (slug === "carpinteria-aluminio-ventanas-pvc") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "ventanas_unidades",
                titulo: "🪟 Calculador de Ventanas PVC / Aluminio RPT y Aislamiento",
                descripcion: "Configura cuántas ventanas o cerramientos necesitas y el nivel de aislamiento térmico y acústico:",
                campos_calculadora: [
                    { name: "num_ventanas", label: "Número total de ventanas o balconeras", type: "number", defaultValue: 4, min: 1, max: 40 },
                    { name: "material_perfil", label: "Material del perfil preferido", type: "select", options: ["PVC (Máximo aislamiento térmico/acústico)", "Aluminio con Rotura de Puente Térmico (RPT)", "Indiferente (busco recomendación técnica)"] },
                    { name: "acristalamiento_persianas", label: "Vidrio y persianas", type: "select", options: ["Doble acristalamiento Bajo Emisivo + Persianas", "Triple vidrio máximo aislamiento + Motorización", "Solo ventanas sin persiana"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Tipo de cerramiento o carpintería",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "apertura_preferida",
                    name: "apertura_preferida",
                    label: "Sistema de apertura deseado",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Oscilobatiente (cierre hermético)", "Corredera / Elevable", "Combinación de ambas"],
                    options: ["Oscilobatiente (cierre hermético)", "Corredera / Elevable", "Combinación de ambas"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "¿Para cuándo lo necesitas?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Este mes", "En 1 a 2 meses", "Estoy valorando opciones"],
                    options: ["Este mes", "En 1 a 2 meses", "Estoy valorando opciones"]
                }
            ]
        };
    }

    // 6. INSTALACIÓN DE SUELOS Y PARQUET -> Calculador de m² + Merma 10% + Rodapié
    if (slug === "instalacion-suelos-parquet") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "suelos_m2",
                titulo: "🪵 Calculador de Superficie de Suelo (+10% Merma) y Rodapié",
                descripcion: "Introduce los m² útiles para calcular el material total con el 10% de recorte/merma y los metros lineales de rodapié:",
                campos_calculadora: [
                    { name: "m2_suelo", label: "Superficie útil a instalar o acuchillar (m²)", type: "number", defaultValue: 70, min: 10, max: 500 },
                    { name: "tipo_pavimento", label: "Tipo de suelo deseado", type: "select", options: ["Tarima Flotante Laminada AC5", "Suelo Vinílico SPC (100% resistente al agua)", "Parquet de Madera Natural / Acuchillado", "Suelo Porcelánico Imitación Madera"] },
                    { name: "rodapie_puertas", label: "Rodapié y rebaje de puertas", type: "select", options: ["Incluir rodapié blanco/madera y cepillado de puertas", "Solo instalación de suelo"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Servicio de pavimentación o parquet",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "suelo_actual",
                    name: "suelo_actual",
                    label: "¿Sobre qué superficie se va a instalar?",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Sobre suelo actual (terrazo/gres nivelado)", "Hay que retirar suelo o moqueta antigua", "Requiere pasta niveladora previa"],
                    options: ["Sobre suelo actual (terrazo/gres nivelado)", "Hay que retirar suelo o moqueta antigua", "Requiere pasta niveladora previa"]
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "Plazo deseado",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Este mes", "En 1 a 2 meses", "Comparando opciones"],
                    options: ["Este mes", "En 1 a 2 meses", "Comparando opciones"]
                }
            ]
        };
    }

    // 7. MUDANZAS Y GUARDAMUEBLES -> Calculador de Volumen Estimado (m³)
    if (slug === "mudanzas-guardamuebles") {
        return {
            calculadora_json: {
                activa: true,
                tipo: "mudanza_volumen",
                titulo: "📦 Calculador de Volumen de Mudanza (m³) y Logística",
                descripcion: "Calcula el volumen aproximado en metros cúbicos (m³) y el tipo de camión necesario según el número de habitaciones:",
                campos_calculadora: [
                    { name: "num_habitaciones", label: "Número de habitaciones de la vivienda", type: "number", defaultValue: 3, min: 1, max: 10 },
                    { name: "desmontaje_embalaje", label: "Servicio de desmontaje y embalaje", type: "select", options: ["Completo (Desmontaje y montaje de muebles + cajas)", "Intermedio (Solo muebles grandes, yo embalo cajas)", "Económico (Solo carga y transporte)"] },
                    { name: "acceso_viviendas", label: "Accesibilidad (Ascensor / Grúa)", type: "select", options: ["Ambas viviendas tienen ascensor amplio", "Una vivienda sin ascensor o requiere plataforma elevadora", "Vivienda unifamiliar / Chalet a pie de calle"] }
                ]
            },
            campos: [
                {
                    id: "tipo_trabajo",
                    name: "tipo_trabajo",
                    label: "Tipo de traslado o guardamuebles",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: workTypes.map(w => w.label),
                    options: workTypes.map(w => w.label)
                },
                {
                    id: "origen_destino",
                    name: "origen_destino",
                    label: "Localidad de origen y localidad de destino",
                    tipo: "text",
                    type: "text",
                    required: true,
                    placeholder: "Ej: De Madrid Centro a Alcobendas (o a otra provincia)"
                },
                {
                    id: "urgencia",
                    name: "urgencia",
                    label: "Fecha aproximada de la mudanza",
                    tipo: "select",
                    type: "select",
                    required: true,
                    opciones: ["Esta semana / Urgente", "Este mes", "Próximo mes"],
                    options: ["Esta semana / Urgente", "Este mes", "Próximo mes"]
                }
            ]
        };
    }

    // CALCULADOR INTERACTIVO DE ALCANCE POR DEFECTO PARA EL RESTO DE SECTORES
    return {
        calculadora_json: {
            activa: true,
            tipo: "alcance_general",
            titulo: `${icono || "📋"} Configurador Rápido de ${nombre}`,
            descripcion: `Selecciona las características principales de tu caso de ${nombre.toLowerCase()} para adjuntar la ficha técnica a tu solicitud:`,
            campos_calculadora: [
                { name: "servicio_especifico", label: "Trabajo principal requerido", type: "select", options: workTypes.map(w => w.label) },
                { name: "dimension_estimada", label: "Envergadura o alcance", type: "select", options: scopes.map(s => s.label) },
                { name: "modalidad_atencion", label: "Tipo de inmueble o cliente", type: "select", options: ["Vivienda particular / Piso", "Chalet / Unifamiliar", "Local comercial / Empresa", "Comunidad de propietarios"] }
            ]
        },
        campos: [
            {
                id: "tipo_trabajo",
                name: "tipo_trabajo",
                label: "Tipo de servicio o trabajo solicitado",
                tipo: "select",
                type: "select",
                required: true,
                opciones: workTypes.map(w => w.label),
                options: workTypes.map(w => w.label)
            },
            {
                id: "alcance",
                name: "alcance",
                label: "Tamaño aproximado o alcance",
                tipo: "select",
                type: "select",
                required: true,
                opciones: scopes.map(s => s.label),
                options: scopes.map(s => s.label)
            },
            {
                id: "urgencia",
                name: "urgencia",
                label: "¿Para cuándo necesitas realizar el trabajo?",
                tipo: "select",
                type: "select",
                required: true,
                opciones: ["Urgente esta semana", "En este mes", "En 1 a 3 meses", "Solo quiero valorar opciones"],
                options: ["Urgente esta semana", "En este mes", "En 1 a 3 meses", "Solo quiero valorar opciones"]
            }
        ]
    };
}

function buildSector(id, slug, nombre, icono, tierKey, minBase, maxBase, workTypes, scopes, tablaServicios, keywords = []) {
    const bm = TIER_BUSINESS_MODELS[tierKey] || TIER_BUSINESS_MODELS.servicios_medios;
    const defaultFormSpec = buildSectorDefaultCalculatorAndFields(slug, nombre, icono, workTypes, scopes);
    const campos = defaultFormSpec.campos;
    return {
        id,
        slug,
        nombre,
        icono,
        tier: tierKey,
        keywords: [nombre.toLowerCase(), slug.replace(/-/g, " "), ...keywords],
        business_models: {
            precio_lead_min: bm.leadMin,
            precio_lead_max: bm.leadMax,
            precio_lead_sugerido: bm.leadDefault,
            alquiler_mensual_zona: bm.rentMonthly,
            comision_obra_pct: bm.commissionPct,
            espacio_destacado_mensual: bm.featuredMonthly
        },
        precios_negocio: {
            lead_min: bm.leadMin,
            lead_max: bm.leadMax,
            lead_recomendado: bm.leadDefault,
            alquiler_mensual_zona: bm.rentMonthly,
            comision_obra_pct: bm.commissionPct,
            espacio_destacado_mes: bm.featuredMonthly,
            ticket_medio_obra: Math.round((minBase + maxBase) / 2)
        },
        formulario_presupuesto: {
            titulo: `Solicitar Presupuesto de ${nombre} en PidePrecio.es`,
            titulo_formulario: `Solicitar Presupuesto Oficial de ${nombre}`,
            explicacion_cliente: `Completa los datos específicos de ${nombre.toLowerCase()} en tu zona. La configuración de la calculadora y tu explicación llegan directamente a nuestro agente en el panel de administración.`,
            instrucciones_cliente: `Completa los datos específicos de ${nombre.toLowerCase()} en tu zona. La configuración de la calculadora y tu explicación llegan directamente a nuestro agente en el panel de administración.`,
            permitir_adjuntos: true,
            formatos_admitidos: ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx",
            calculadora_json: defaultFormSpec.calculadora_json,
            campos_personalizados: campos,
            campos,
            explicacion_label: "Explicación detallada del trabajo que necesitas",
            explicacion_placeholder: `Explica aquí los detalles de tu solicitud de ${nombre.toLowerCase()} (medidas, calidades, situación actual, barrio o municipio...).`
        },
        formula_precio_base_json: {
            min: minBase,
            max: maxBase,
            unidad: "servicio",
            min_base: minBase,
            max_base: maxBase,
            tabla_precios: tablaServicios
        }
    };
}

const SECTORS = [
    buildSector(1, "reformas-integrales", "Reformas Integrales y Baños/Cocinas", "🏗️", "ticket_alto", 4200, 7800,
        [{ label: "Cambiar bañera por plato de ducha" }, { label: "Reforma de Baño completo" }, { label: "Reforma de Cocina completa" }, { label: "Reforma Integral de Vivienda (Piso/Casa)" }],
        [{ label: "Pequeño (< 6 m² / 1 estancia)" }, { label: "Mediano (Piso 60-90 m²)" }, { label: "Grande (+100 m² o reforma integral)" }],
        [
            { servicio: "Cambiar bañera por plato de ducha antideslizante", min: 1150, max: 1950 },
            { servicio: "Reforma completa de cuarto de baño (4-6 m²)", min: 3400, max: 5900 },
            { servicio: "Reforma integral de cocina con mobiliario", min: 5800, max: 11500 },
            { servicio: "Reforma integral de piso de 80 m² llave en mano", min: 28000, max: 49000 }
        ],
        ["reforma", "baño", "cocina", "ducha", "bañera", "albañil", "obra", "piso"]
    ),
    buildSector(2, "fontaneria-desatascos", "Fontanería y Desatascos Urgentes", "🚰", "urgencias", 140, 380,
        [{ label: "Desatasco urgente de tuberías / WC / fregadero" }, { label: "Reparación de fuga de agua o bajante" }, { label: "Cambio de termo eléctrico o calentador" }, { label: "Instalación completa de fontanería" }],
        [{ label: "Avería puntual (1 punto)" }, { label: "Intervención con camión cuba" }, { label: "Renovación completa baño/cocina" }],
        [
            { servicio: "Desatasco urgente sin rotura", min: 95, max: 220 },
            { servicio: "Localización y reparación de fuga de agua", min: 150, max: 390 },
            { servicio: "Instalación de termo o calentador", min: 280, max: 620 }
        ],
        ["fontanero", "fuga", "agua", "desatasco", "tuberia", "termo", "calentador", "grifo", "cisterna"]
    ),
    buildSector(3, "electricistas-boletines", "Electricistas y Boletines Eléctricos", "⚡", "urgencias", 150, 420,
        [{ label: "Boletín Eléctrico Oficial (CIE) / Subida potencia" }, { label: "Avería eléctrica o apagón urgente" }, { label: "Cambio de cuadro eléctrico normativo" }, { label: "Instalación eléctrica completa o Cargador VE" }],
        [{ label: "Vivienda o local pequeño (<70 m²)" }, { label: "Vivienda estándar (70-110 m²)" }, { label: "Chalet, local o nave industrial" }],
        [
            { servicio: "Certificado / Boletín Eléctrico (CIE) oficial", min: 90, max: 180 },
            { servicio: "Sustitución de cuadro eléctrico completo", min: 260, max: 540 },
            { servicio: "Reforma eléctrica integral vivienda 80 m²", min: 2100, max: 3900 }
        ],
        ["electricista", "boletin", "luz", "enchufe", "cuadro electrico", "apagon", "wallbox"]
    ),
    buildSector(4, "tejados-cubiertas", "Tejados, Cubiertas e Impermeabilizaciones", "🏠", "ticket_alto", 1800, 4600,
        [{ label: "Impermeabilización de terraza o azotea con goteras" }, { label: "Reparación de tejado y sustitución de tejas" }, { label: "Rehabilitación integral de cubierta con aislamiento" }, { label: "Instalación de canalones o panel sándwich" }],
        [{ label: "Hasta 40 m² (Reparación localizada)" }, { label: "De 40 a 120 m² (Vivienda unifamiliar)" }, { label: "Más de 120 m² (Comunidad de vecinos / Nave)" }],
        [
            { servicio: "Impermeabilización de terraza o cubierta (m²)", min: 28, max: 55 },
            { servicio: "Reparación de goteras y retejado parcial", min: 850, max: 2200 },
            { servicio: "Rehabilitación de tejado en comunidad o vivienda", min: 6500, max: 19000 }
        ],
        ["tejado", "goteras", "cubierta", "impermeabilizar", "terraza", "tejas", "canalon"]
    ),
    buildSector(5, "placas-solares-aerotermia", "Placas Solares y Aerotermia", "☀️", "ticket_alto", 4200, 7500,
        [{ label: "Instalación de Placas Solares Autoconsumo" }, { label: "Placas Solares + Batería física/virtual" }, { label: "Sistema de Aerotermia (Calefacción + ACS)" }, { label: "Combinado Aerotermia + Fotovoltaica" }],
        [{ label: "Consumo bajo-medio (3-4 kWp / 6-8 paneles)" }, { label: "Consumo familiar (5-6 kWp / 10-12 paneles)" }, { label: "Gran vivienda o empresa (+8 kWp / Industrial)" }],
        [
            { servicio: "Kit Solar Fotovoltaico 3.5 kWp legalizado", min: 3400, max: 5100 },
            { servicio: "Instalación Solar 5 kWp con batería de litio", min: 5800, max: 8600 },
            { servicio: "Sistema de Aerotermia completo", min: 6500, max: 11200 }
        ],
        ["placas solares", "paneles solares", "fotovoltaica", "aerotermia", "autoconsumo", "bateria solar"]
    ),
    buildSector(6, "climatizacion-aire-acondicionado", "Climatización y Aire Acondicionado", "❄️", "servicios_medios", 850, 2100,
        [{ label: "Aire acondicionado Split 1x1 con instalación" }, { label: "Sistema Multisplit (2x1 o 3x1)" }, { label: "Aire acondicionado por Conductos" }, { label: "Carga de gas o reparación de equipo" }],
        [{ label: "Con preinstalación hecha" }, { label: "Instalación desde cero" }, { label: "Vivienda completa o local comercial" }],
        [
            { servicio: "Split Inverter A++ con instalación incluida", min: 590, max: 1050 },
            { servicio: "Multisplit 2x1 o 3x1 instalado", min: 1350, max: 2600 },
            { servicio: "Aire acondicionado por conductos", min: 2400, max: 4800 }
        ],
        ["aire acondicionado", "split", "conductos", "climatizacion", "calefaccion"]
    ),
    buildSector(7, "carpinteria-aluminio-ventanas-pvc", "Carpintería de Aluminio y Ventanas PVC", "🪟", "servicios_medios", 1400, 3400,
        [{ label: "Cambio de ventanas de PVC aislantes" }, { label: "Ventanas de Aluminio con Rotura de Puente Térmico" }, { label: "Cerramiento de terraza o cortina de cristal" }, { label: "Persianas motorizadas o mosquiteras" }],
        [{ label: "1 a 2 ventanas" }, { label: "3 a 5 ventanas (Piso estándar)" }, { label: "6 o más ventanas / Chalet completo" }],
        [
            { servicio: "Ventana PVC oscilobatiente doble acristalamiento", min: 380, max: 720 },
            { servicio: "Pack 4 ventanas aislantes con persiana", min: 1650, max: 3100 },
            { servicio: "Cerramiento de terraza a medida", min: 2200, max: 4900 }
        ],
        ["ventanas", "pvc", "aluminio", "cerramiento", "persianas", "climalit"]
    ),
    buildSector(8, "pintores-alisado-paredes", "Pintores y Alisado de Paredes", "🎨", "servicios_medios", 750, 1850,
        [{ label: "Pintar piso completo en blanco o color" }, { label: "Quitar gotelé y alisar paredes + pintura" }, { label: "Pintura de fachada exterior o comunidad" }, { label: "Lacado de puertas o papel pintado" }],
        [{ label: "Piso pequeño / Estudio (<60 m²)" }, { label: "Piso mediano (60 a 100 m²)" }, { label: "Piso grande o chalet (+100 m²)" }],
        [
            { servicio: "Pintar piso de 70-80 m² en blanco lavable", min: 620, max: 1150 },
            { servicio: "Quitar gotelé y alisar paredes (piso 80 m²)", min: 1450, max: 2700 }
        ],
        ["pintor", "pintar piso", "gotele", "alisar paredes", "fachada"]
    ),
    buildSector(9, "control-plagas-desinfeccion", "Control de Plagas y Desinfección", "🛡️", "urgencias", 140, 360,
        [{ label: "Eliminación de cucarachas, hormigas o avispas" }, { label: "Tratamiento contra chinches de cama" }, { label: "Desratización (ratas y ratones)" }, { label: "Termitas / Carcoma o Certificado DDD Sanidad" }],
        [{ label: "Vivienda particular" }, { label: "Bar, restaurante o local comercial" }, { label: "Comunidad de propietarios o nave" }],
        [
            { servicio: "Desinsectación garantizada en vivienda", min: 110, max: 210 },
            { servicio: "Certificado DDD anual para locales y hostelería", min: 190, max: 390 },
            { servicio: "Tratamiento contra termitas o chinches", min: 280, max: 950 }
        ],
        ["plagas", "cucarachas", "chinches", "ratas", "termitas", "desinfeccion", "fumigar"]
    ),
    buildSector(10, "mudanzas-guardamuebles", "Mudanzas y Guardamuebles", "📦", "servicios_medios", 320, 890,
        [{ label: "Mudanza local dentro de la provincia" }, { label: "Mudanza nacional a otra ciudad" }, { label: "Mudanza de oficina o empresa" }, { label: "Porte pequeño o Guardamuebles" }],
        [{ label: "1-2 habitaciones" }, { label: "Vivienda estándar (3 habitaciones)" }, { label: "Chalet o vivienda grande con embalaje" }],
        [
            { servicio: "Porte o minimudanza urbana", min: 160, max: 340 },
            { servicio: "Mudanza completa piso 3 dormitorios", min: 450, max: 980 }
        ],
        ["mudanza", "guardamuebles", "portes", "traslado"]
    ),
    buildSector(11, "cerrajeros-24h", "Cerrajeros 24h", "🔑", "urgencias", 90, 240,
        [{ label: "Apertura de puerta urgente" }, { label: "Cambio de bombín de alta seguridad Antibumping" }, { label: "Reparación de cierre metálico de local" }, { label: "Instalación de segunda cerradura o cerrojo" }],
        [{ label: "Horario laboral diurno" }, { label: "Urgencia inmediata (<25 min)" }, { label: "Horario nocturno o festivo 24h" }],
        [
            { servicio: "Apertura de puerta sin rotura", min: 75, max: 135 },
            { servicio: "Cambio de bombín antibumping alta seguridad", min: 120, max: 245 }
        ],
        ["cerrajero", "cerradura", "llaves", "abrir puerta", "bombin"]
    ),
    buildSector(12, "instalacion-suelos-parquet", "Instalación de Suelos y Parquet", "🪵", "servicios_medios", 1100, 2600,
        [{ label: "Instalación de Tarima Flotante AC5 / AC6" }, { label: "Suelo Vinílico SPC resistente al agua" }, { label: "Acuchillado y barnizado de parquet" }, { label: "Suelo porcelánico imitación madera" }],
        [{ label: "Hasta 40 m²" }, { label: "De 40 a 85 m² (Piso estándar)" }, { label: "Más de 85 m²" }],
        [
            { servicio: "Tarima flotante AC5 + rodapié instalado (m²)", min: 24, max: 42 },
            { servicio: "Acuchillado y barnizado de parquet (m²)", min: 18, max: 30 }
        ],
        ["parquet", "tarima", "suelo vinilico", "acuchillar"]
    ),
    buildSector(13, "aislamiento-termico-humedades", "Aislamiento Térmico y Acústico / Humedades", "💧", "ticket_alto", 1200, 3100,
        [{ label: "Aislamiento térmico por insuflado sin obras" }, { label: "Eliminación definitiva de humedades (Capilaridad/Condensación)" }, { label: "Insonorización acústica de pared o techo" }, { label: "Fachada SATE exterior" }],
        [{ label: "1 estancia o pared" }, { label: "Piso completo (70-100 m²)" }, { label: "Vivienda unifamiliar o edificio" }],
        [
            { servicio: "Aislamiento por insuflado en cámara para piso", min: 980, max: 1850 },
            { servicio: "Tratamiento definitivo antihumedades", min: 1200, max: 2800 }
        ],
        ["humedades", "aislamiento", "insuflado", "insonorizar", "moho", "condensacion"]
    ),
    buildSector(14, "empresas-limpieza-cristales", "Empresas de Limpieza y Cristales", "✨", "servicios_medios", 160, 480,
        [{ label: "Limpieza general a fondo o Fin de Obra" }, { label: "Mantenimiento periódico de Oficina o Comunidad" }, { label: "Limpieza de cristales o escaparates" }, { label: "Limpieza de tapicerías o vaciado" }],
        [{ label: "Piso o local pequeño (<80 m²)" }, { label: "Vivienda grande, chalet u oficina" }, { label: "Comunidad de propietarios o nave" }],
        [
            { servicio: "Limpieza integral fin de obra (piso 80 m²)", min: 180, max: 360 },
            { servicio: "Mantenimiento mensual de comunidad u oficina", min: 160, max: 450 }
        ],
        ["limpieza", "fin de obra", "cristales", "comunidades"]
    ),
    buildSector(15, "jardineria-piscinas", "Jardinería y Piscinas", "🌴", "ticket_alto", 950, 3800,
        [{ label: "Instalación de Césped Artificial" }, { label: "Construcción o rehabilitación de Piscina" }, { label: "Poda en altura o desbroce de parcela" }, { label: "Diseño de jardín y riego automático" }],
        [{ label: "Jardín pequeño (<50 m²)" }, { label: "Parcela mediana (50 a 200 m²)" }, { label: "Gran parcela o comunidad (+200 m²)" }],
        [
            { servicio: "Césped artificial instalado todo incluido (m²)", min: 34, max: 58 },
            { servicio: "Construcción o reforma de piscina de obra", min: 6500, max: 18500 }
        ],
        ["jardinero", "piscina", "cesped artificial", "poda", "desbroce"]
    ),
    buildSector(16, "abogados-especialistas", "Abogados (Laboral, Divorcios, Herencias, Extranjería)", "⚖️", "profesionales_salud_legal", 350, 1400,
        [{ label: "Divorcio o Separación" }, { label: "Herencias, Testamentos y Sucesiones" }, { label: "Abogado Laboralista (Despidos, Reclamaciones)" }, { label: "Extranjería, Ley de Segunda Oportunidad o Penal" }],
        [{ label: "Consulta + acuerdo amistoso" }, { label: "Procedimiento judicial estándar" }, { label: "Caso complejo o alto patrimonio" }],
        [
            { servicio: "Divorcio de mutuo acuerdo", min: 350, max: 850 },
            { servicio: "Tramitación integral de herencia", min: 550, max: 1800 }
        ],
        ["abogado", "divorcio", "herencia", "despido", "extranjeria", "segunda oportunidad"]
    ),
    buildSector(17, "asesorias-gestorias", "Asesorías y Gestorías para Autónomos/Pymes", "📊", "profesionales_salud_legal", 65, 220,
        [{ label: "Asesoría fiscal, contable y laboral para Autónomo" }, { label: "Gestión integral para Sociedad Limitada (Pyme)" }, { label: "Alta de Autónomo o Constitución de SL" }, { label: "Declaración de la Renta o Trámites Tráfico" }],
        [{ label: "Autónomo sin empleados" }, { label: "Negocio con 1 a 5 trabajadores" }, { label: "Empresa con +5 empleados" }],
        [
            { servicio: "Cuota mensual para Autónomos", min: 45, max: 85 },
            { servicio: "Asesoría integral para Sociedad Limitada", min: 135, max: 290 }
        ],
        ["asesoria", "gestoria", "autonomo", "pyme", "declaracion renta", "contabilidad"]
    ),
    buildSector(18, "clinicas-dentales-implantes", "Clínicas Dentales e Implantes", "🦷", "profesionales_salud_legal", 750, 2900,
        [{ label: "Implantes Dentales" }, { label: "Ortodoncia Invisible o Brackets" }, { label: "Carillas dentales y Blanqueamiento" }, { label: "Prótesis fija arcada completa" }],
        [{ label: "1 pieza o tratamiento puntual" }, { label: "Varias piezas o arcada" }, { label: "Rehabilitación oral completa" }],
        [
            { servicio: "Implante dental completo con corona", min: 790, max: 1350 },
            { servicio: "Ortodoncia invisible completa", min: 2100, max: 3800 }
        ],
        ["dentista", "implante dental", "ortodoncia", "invisalign", "blanqueamiento dental"]
    ),
    buildSector(19, "fisioterapia-rehabilitacion", "Fisioterapia y Rehabilitación", "🏃", "profesionales_salud_legal", 45, 220,
        [{ label: "Dolor de espalda, cervicales o lesión muscular" }, { label: "Fisioterapia deportiva y ecografía" }, { label: "Bono de Rehabilitación (5 o 10 sesiones)" }, { label: "Fisioterapia a domicilio" }],
        [{ label: "Sesión individual" }, { label: "Bono 5 sesiones" }, { label: "Bono 10 sesiones" }],
        [
            { servicio: "Sesión de fisioterapia avanzada", min: 38, max: 58 },
            { servicio: "Bono 5 sesiones de rehabilitación", min: 165, max: 245 }
        ],
        ["fisioterapeuta", "fisio", "rehabilitacion", "osteopata", "espalda"]
    ),
    buildSector(20, "clinicas-estetica-injerto-capilar", "Clínicas de Estética e Injerto Capilar", "✨", "profesionales_salud_legal", 450, 3200,
        [{ label: "Injerto Capilar FUE Zafiro / DHI" }, { label: "Medicina estética facial (Ácido hialurónico, Neuromoduladores)" }, { label: "Tratamiento corporal o láser" }, { label: "Cirugía estética" }],
        [{ label: "Tratamiento sin cirugía" }, { label: "Injerto capilar o intervención ambulatoria" }, { label: "Tratamiento completo" }],
        [
            { servicio: "Injerto capilar FUE Zafiro todo incluido", min: 2200, max: 3600 },
            { servicio: "Tratamiento médico-estético facial", min: 250, max: 490 }
        ],
        ["injerto capilar", "clinica estetica", "pelo", "botox", "acido hialuronico"]
    ),
    buildSector(21, "psicologos", "Psicólogos", "🧠", "profesionales_salud_legal", 55, 260,
        [{ label: "Terapia individual (Ansiedad, Estrés, Estado de ánimo)" }, { label: "Terapia de Pareja o Familiar" }, { label: "Psicología Infantil y Adolescente" }, { label: "Informe psicológico pericial" }],
        [{ label: "Primera sesión" }, { label: "Bono mensual (4 sesiones)" }, { label: "Evaluación completa" }],
        [
            { servicio: "Sesión de psicología sanitaria", min: 50, max: 75 },
            { servicio: "Bono 4 sesiones de terapia", min: 180, max: 270 }
        ],
        ["psicologo", "terapia", "ansiedad", "terapia pareja"]
    ),
    buildSector(22, "talleres-mecanicos-chapa-pintura", "Talleres Mecánicos y Chapa/Pintura", "🚗", "servicios_medios", 180, 950,
        [{ label: "Pintar coche entero o reparar chapa" }, { label: "Cambio de Kit de Distribución o Embrague" }, { label: "Revisión Pre-ITV, frenos y mantenimiento" }, { label: "Diagnosis de avería mecánica o motor" }],
        [{ label: "Utilitario o compacto" }, { label: "Berlina o SUV" }, { label: "Furgoneta o gama alta" }],
        [
            { servicio: "Cambio de kit de distribución + bomba de agua", min: 390, max: 690 },
            { servicio: "Pintar coche completo en cabina", min: 950, max: 1850 }
        ],
        ["taller mecanico", "chapa y pintura", "embrague", "distribucion", "pintar coche"]
    ),
    buildSector(23, "puertas-automaticas-garajes", "Instalación de Puertas Automáticas y Garajes", "🚪", "servicios_medios", 850, 2400,
        [{ label: "Puerta de garaje seccional o basculante motorizada" }, { label: "Motorizar puerta existente" }, { label: "Puerta automática de cristal para comercio" }, { label: "Reparación o mantenimiento de comunidad" }],
        [{ label: "Vivienda unifamiliar" }, { label: "Local comercial o nave" }, { label: "Comunidad de propietarios" }],
        [
            { servicio: "Motorización de puerta existente", min: 380, max: 690 },
            { servicio: "Puerta seccional motorizada instalada", min: 1150, max: 2150 }
        ],
        ["puerta garaje", "puerta automatica", "motor puerta", "seccional"]
    ),
    buildSector(24, "reformas-locales-naves", "Reformas de Locales Comerciales y Naves", "🏪", "ticket_alto", 6500, 19500,
        [{ label: "Adecuación de local comercial para apertura" }, { label: "Cambio de uso de Local a Vivienda" }, { label: "Reforma de hostelería, clínica o comercio" }, { label: "Adecuación de oficina o nave industrial" }],
        [{ label: "Local pequeño (<60 m²)" }, { label: "Local mediano (60-150 m²)" }, { label: "Gran superficie o nave (+150 m²)" }],
        [
            { servicio: "Adecuación de local comercial para licencia", min: 5500, max: 12500 },
            { servicio: "Cambio de uso de local a vivienda llave en mano", min: 26000, max: 48000 }
        ],
        ["reforma local", "cambio de uso", "nave industrial", "reforma oficina"]
    ),
    buildSector(25, "arquitectos-licencias", "Arquitectos y Licencias de Obra/Apertura", "📐", "profesionales_salud_legal", 550, 2400,
        [{ label: "Licencia de Actividad y Apertura de Local" }, { label: "Proyecto de Reforma, Obra Mayor o Cambio de Uso" }, { label: "Proyecto de Vivienda Unifamiliar" }, { label: "ITE / IEE de Edificios o Certificado Energético" }],
        [{ label: "Inmueble < 100 m²" }, { label: "Inmueble 100-250 m²" }, { label: "Edificio completo o proyecto singular" }],
        [
            { servicio: "Proyecto técnico de Licencia de Apertura", min: 480, max: 1150 },
            { servicio: "Proyecto de cambio de uso o rehabilitación", min: 1800, max: 3400 }
        ],
        ["arquitecto", "licencia apertura", "proyecto obra", "ite", "aparejador"]
    ),
    buildSector(26, "cuidado-mayores-domicilio", "Cuidado de Mayores y Ayuda a Domicilio", "🤝", "servicios_medios", 480, 1450,
        [{ label: "Cuidado por horas a domicilio" }, { label: "Cuidadora Interna 24h" }, { label: "Acompañamiento nocturno o fin de semana" }, { label: "Asistencia especializada dependencia" }],
        [{ label: "Media jornada (2-4h/día)" }, { label: "Jornada completa" }, { label: "Servicio interno 24h" }],
        [
            { servicio: "Asistencia domiciliaria por horas (mes)", min: 390, max: 720 },
            { servicio: "Cuidadora interna con gestión laboral", min: 1350, max: 1750 }
        ],
        ["cuidado mayores", "ayuda domicilio", "cuidadora", "ancianos"]
    ),
    buildSector(27, "entrenadores-personales-nutricionistas", "Entrenadores Personales y Nutricionistas", "💪", "servicios_medios", 90, 290,
        [{ label: "Entrenador Personal presencial" }, { label: "Nutricionista Clínico o Deportivo" }, { label: "Plan combinado Entrenamiento + Nutrición" }, { label: "Preparación física oposiciones o lesiones" }],
        [{ label: "1 sesión por semana" }, { label: "2 sesiones por semana" }, { label: "Plan intensivo 3+ sesiones/semana" }],
        [
            { servicio: "Plan nutricional personalizado", min: 65, max: 120 },
            { servicio: "Bono mensual Entrenador Personal", min: 180, max: 320 }
        ],
        ["entrenador personal", "nutricionista", "dieta", "adelgazar"]
    ),
    buildSector(28, "fotografia-video-eventos", "Fotografía y Vídeo para Eventos/Bodas", "📸", "servicios_medios", 650, 1950,
        [{ label: "Reportaje completo de Boda (Foto + Vídeo)" }, { label: "Vídeo y Fotografía Corporativa para Empresas" }, { label: "Comuniones, Bautizos o Eventos" }, { label: "Fotografía Inmobiliaria o de Producto" }],
        [{ label: "Media jornada (3-4 horas)" }, { label: "Jornada completa" }, { label: "Pack Completo con Drone y Álbum" }],
        [
            { servicio: "Reportaje fotográfico de boda", min: 950, max: 1750 },
            { servicio: "Vídeo corporativo para empresa", min: 450, max: 1100 }
        ],
        ["fotografo", "boda", "video corporativo", "eventos"]
    ),
    buildSector(29, "diseno-web-digitalizacion", "Diseño Web y Digitalización de Negocios", "💻", "ticket_alto", 690, 2200,
        [{ label: "Diseño de Página Web Corporativa con SEO" }, { label: "Tienda Online (E-Commerce)" }, { label: "Posicionamiento SEO Local en Google" }, { label: "Automatización con IA o Software a medida" }],
        [{ label: "Web profesional para autónomo o pyme" }, { label: "Web + SEO + Captación de clientes" }, { label: "E-Commerce o plataforma avanzada" }],
        [
            { servicio: "Web corporativa optimizada para SEO Local", min: 590, max: 1250 },
            { servicio: "Tienda Online completa autogestionable", min: 1100, max: 2400 }
        ],
        ["diseño web", "pagina web", "tienda online", "seo", "digitalizacion"]
    ),
    buildSector(30, "inmobiliarias-tasacion-viviendas", "Inmobiliarias y Tasación de Viviendas", "🔑", "ticket_alto", 280, 3200,
        [{ label: "Vender piso o vivienda al mejor precio" }, { label: "Tasación Oficial Homologada de inmueble" }, { label: "Gestión integral de Alquiler Seguro" }, { label: "Valoración para herencia o compraventa" }],
        [{ label: "Inmueble hasta 150.000 €" }, { label: "Vivienda entre 150.000 € y 350.000 €" }, { label: "Inmueble de +350.000 €" }],
        [
            { servicio: "Tasación inmobiliaria oficial", min: 220, max: 450 },
            { servicio: "Gestión integral de venta inmobiliaria", min: 1950, max: 4500 }
        ],
        ["inmobiliaria", "tasacion", "vender piso", "alquiler seguro"]
    )
];

const SECTOR_IMAGES = {
    "reformas-integrales": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&auto=format&fit=crop&q=80",
    "fontaneria-desatascos": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&auto=format&fit=crop&q=80",
    "electricistas-boletines": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80",
    "tejados-cubiertas": "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=900&auto=format&fit=crop&q=80",
    "placas-solares-aerotermia": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&auto=format&fit=crop&q=80",
    "climatizacion-aire-acondicionado": "https://images.unsplash.com/photo-1631545806609-35d4ae440431?w=900&auto=format&fit=crop&q=80",
    "carpinteria-aluminio-ventanas-pvc": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    "pintores-alisado-paredes": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=900&auto=format&fit=crop&q=80",
    "control-plagas-desinfeccion": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop&q=80",
    "mudanzas-guardamuebles": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=900&auto=format&fit=crop&q=80",
    "cerrajeros-24h": "https://images.unsplash.com/photo-1558002038-1055907df827?w=900&auto=format&fit=crop&q=80",
    "instalacion-suelos-parquet": "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=900&auto=format&fit=crop&q=80",
    "aislamiento-termico-humedades": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80",
    "empresas-limpieza-cristales": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=900&auto=format&fit=crop&q=80",
    "jardineria-piscinas": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&auto=format&fit=crop&q=80",
    "abogados-especialistas": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&auto=format&fit=crop&q=80",
    "asesorias-gestorias": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=80",
    "clinicas-dentales-implantes": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&auto=format&fit=crop&q=80",
    "fisioterapia-rehabilitacion": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&auto=format&fit=crop&q=80",
    "clinicas-estetica-injerto-capilar": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&auto=format&fit=crop&q=80",
    "psicologos": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&auto=format&fit=crop&q=80",
    "talleres-mecanicos-chapa-pintura": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=900&auto=format&fit=crop&q=80",
    "puertas-automaticas-garajes": "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=900&auto=format&fit=crop&q=80",
    "reformas-locales-naves": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
    "arquitectos-licencias": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=80",
    "cuidado-mayores-domicilio": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&auto=format&fit=crop&q=80",
    "entrenadores-personales-nutricionistas": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&auto=format&fit=crop&q=80",
    "fotografia-video-eventos": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&auto=format&fit=crop&q=80",
    "diseno-web-digitalizacion": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
    "inmobiliarias-tasacion-viviendas": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop&q=80"
};

module.exports = {
    LOCATIONS,
    SECTORS,
    LOCATIONS_SEED: LOCATIONS,
    SECTORS_SEED: SECTORS,
    SECTOR_IMAGES,
    TIER_BUSINESS_MODELS,
    buildSector
};
