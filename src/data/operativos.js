/**
 * Datos centralizados de operativos y actividades
 */
export const operativos = [
    {
        id: 1,
        nombre: "Patrullaje Mixto Nocturno",
        institucion: "DSPM / Carabineros",
        color: "bg-blue-600",
        descripcion: "Presencia preventiva diaria para mantención de sensación de seguridad",
        fechas: Array(12).fill("Diario")
    },
    {
        id: 2,
        nombre: "Fiscalización Comercio",
        institucion: "Inspectores Municipales",
        color: "bg-blue-600",
        descripcion: "Control de comercio formal e informal",
        fechas: [
            [[23, "Feria estival: Control permisos transitorios."]],
            [[13, "Semana parralina: Despliegue en zona de fondas."]],
            [[5, "Venta útiles: Fiscalización Paseo Peatonal."]],
            [[3, "S. Santa: Control venta productos del mar (Salud)."]],
            [[9, "DÍA DE LA MADRE: Operativo especial contra comercio ilegal por peak de compras."]],
            [[24, "Feria Invierno: Ordenamiento de puestos céntricos."]],
            [[15, "Vacaciones: Seguridad en plazas y parques de juegos."]],
            [[9, "Día del Niño: Vigilancia locales de juguetes."]],
            [[18, "F. PATRIAS: Fiscalización integral de ramadas."]],
            [[30, "Pre-Halloween: Control comercio temporada."]],
            [[14, "Feria Rural: Ordenamiento productores locales."]],
            [[22, "NAVIDAD: Refuerzo ante peak de compras céntricas."], [23, "NAVIDAD: Vigilancia barrios comerciales."]]
        ]
    },
    {
        id: 3,
        nombre: "Control Acceso / Identidad",
        institucion: "Inspectores / Carabineros",
        color: "bg-blue-600",
        descripcion: "Control de accesos y verificación de identidad",
        fechas: [
            [[14, "Recambio turistas: Control ruta precordillera."]],
            [[15, "Semana Parralina: Alta rotación vehicular."]],
            [[4, "RETORNO ESCOLAR: Mitigación congestión colegios."]],
            [[2, "Semana Santa: Control ingresos foráneos."]],
            [[8, "Pre-Día de la Madre: Vigilancia flujo comercial."]],
            [[16, "Feriado religioso: Control desplazamientos rurales."]],
            [[10, "Vacaciones Inv.: Protección de residentes."]],
            [[14, "Víspera feriado: Control flujo nocturno."]],
            [[17, "F. PATRIAS: Blindaje accesos evento masivo."]],
            [[14, "Aniversario: Control accesos actos públicos."]],
            [[1, "Todos los Santos: Seguridad en Cementerios."]],
            [[30, "Año Nuevo: Prevención accidentes rutas princ."]]
        ]
    },
    {
        id: 4,
        nombre: "Rondas Alto Impacto",
        institucion: "Carabineros de Chile",
        color: "bg-amber-500",
        descripcion: "Operaciones de alto impacto visibilidad policial",
        fechas: [
            [[10, "Prevención VIF post-fiestas."], [24, "Seguridad cierre quincena."]],
            [[7, "Refuerzo Semana Parralina."], [21, "Cierre periodo estival."]],
            [[6, "Prevención desórdenes retorno escolar."], [20, "Vigilancia focalizada zona sur."]],
            [[11, "Seguridad Semana Santa."], [25, "Ronda cuadrante rural."]],
            [[15, "Peak comercial Mayo."], [29, "Prevención robo accesorios veh."]],
            [[13, "Ronda clima extremo."], [27, "Seguridad terminal buses."]],
            [[11, "Prevención delitos vacaciones."], [25, "Control preventivo nocturno."]],
            [[7, "Ronda impacto zona norte."], [21, "Seguridad Mes Niñez."]],
            [[12, "Lanzamiento Plan Sept."], [20, "Operativo post-F. Patrias."]],
            [[9, "Ronda Cosecha Segura."], [23, "Vigilancia sector bancario."]],
            [[6, "Prevención robo lugar no hab."], [20, "Focalización cuadrante céntrico."]],
            [[12, "Seguridad Navidad."], [19, "Cierre año comercial."]]
        ]
    },
    {
        id: 5,
        nombre: "Mesa Técnica SLEP",
        institucion: "SLEP",
        color: "bg-purple-600",
        descripcion: "Coordinación intersectorial con educación",
        fechas: [
            [],
            [],
            [[24, "COORDINACIÓN SLEP: Protocolos emergencia liceos."]],
            [],
            [],
            [],
            [],
            [],
            [],
            [[15, "VINCULACIÓN SLEP: Prevención violencia escolar."]],
            [],
            []
        ]
    },
    {
        id: 6,
        nombre: "Operativos Abigeato",
        institucion: "SAG / Carabineros",
        color: "bg-red-600",
        descripcion: "Fiscalización contra robo de animales",
        fechas: [
            [],
            [],
            [],
            [[1, "Otoño: Trazabilidad en ferias ganaderas."]],
            [],
            [],
            [],
            [],
            [[7, "PRE-18: Fiscalización mataderos y trazabilidad."], [14, "PRE-18: Prevención robo animales zona rural."]],
            [[7, "Post-Cosecha: Control faenamiento estacional."]],
            [[4, "Cordillera: Operativo preventivo ganado."]],
            [[2, "Fin de Año: Control transporte de ganado."]]
        ]
    },
    {
        id: 7,
        nombre: "PDI / Extranjería",
        institucion: "Prefectura Linares",
        color: "bg-indigo-600",
        descripcion: "Operaciones de la Policía de Investigaciones",
        fechas: [
            [],
            [],
            [],
            [[14, "COSECHA: Fiscalización laboral agrícola fundos."]],
            [],
            [],
            [],
            [],
            [[2, "COMERCIO: Fiscalización receptación local."]],
            [],
            [],
            []
        ]
    }
];
