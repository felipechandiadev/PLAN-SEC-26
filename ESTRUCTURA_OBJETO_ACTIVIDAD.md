# Estructura del Objeto Actividad - Modal de Edición/Adición

## 📋 Objeto Base (Envío al Modal)

Cuando se abre el modal para **agregar nuevas actividades**, se crea este objeto:

```javascript
{
  // Datos de la actividad
  actividad: {
    nombre: "",                    // string: nombre de la actividad
      fecha: "2026-01-01",           // string (YYYY-MM-DD): fecha única
         hora_inicio: "08:00",          // string (HH:MM): hora de inicio
    hora_fin: "10:00",             // string (HH:MM): hora de finalización
  
 
    responsable: "dspm",           // string: ID institución responsable
    otras_instituciones: [],       // array<string>: IDs de otras instituciones

      justificacion: "",             // string: justificación o descripción
    tipo: "otra",                  // string: se rellena después con subtipo
        categoria: "...",              // string: categoría general
    subtipo: "...",                // string: tipo específico dentro de categoría
 
    estado: "planificado",         // string: estado actual
    // Campos que se agregan al guardar:


    hora_inicio: "08:00",
    hora_fin: "10:00"
  },
  
  // Contexto de institución responsable
  institucion: {
    nombre: "dspm",                // string: ID/key de institución
    abreviacion: "DSPM",           // string: abreviatura mostrada
    color: "bg-blue-500"           // string: clase Tailwind de color
  },
  
  // Contexto del calendario
  mesIndex: 0,                     // number: índice del mes (0-11)
  dia: 1                           // number: día del mes (1-31)
}
```

---

## 📌 Opciones Disponibles

### **Responsable (Institución Responsable)**
Valores del `select#edit-actividad-responsable`:
```javascript
[
  "dspm",              // Dirección de Seguridad Pública
  "carabineros",       // Carabineros de Chile
  "senda",             // SENDA
  "sag",               // SAG
  "slep",              // SLEP
  "pdi",               // PDI
  "gendarmeria",       // Gendarmería de Chile
  "oln",               // OLN (Niñez)
  "seguridad_retiro"   // Seguridad Comuna Retiro
]
```

---

### **Categoría de Actividad**
Valores del `select#edit-actividad-categoria`:
```javascript
[
  "Operativos de Patrullaje y Vigilancia",
  "Operativos de Control y Fiscalización",
  "Gestión Comunitaria y Preventiva",
  "Operativos Estacionales o Temáticos"
]
```

---

### **Tipo de Actividad (dinámico según Categoría)**

El campo `select#edit-actividad-tipo` se rellena dinámicamente según la categoría seleccionada:

#### 1. **Operativos de Patrullaje y Vigilancia**
```javascript
[
  "Patrullas Mixtas",
  "Rondas sectores residenciales",
  "Rondas de Impacto",
  "Vigilancia por Cámaras (VMS)",
  "Patrullaje Preventivo Rural",
  "Otro"  // opción adicional
]
```

#### 2. **Operativos de Control y Fiscalización**
```javascript
[
  "Control de Acceso e Identidad",
  "Fiscalización al Comercio Formal",
  "Fiscalización al Comercio Informal",
  "Fiscalización para Prevenir el Abigeato",
  "Control de Ley de Alcoholes",
  "Fiscalización de Tránsito y Transporte",
  "Otro"
]
```

#### 3. **Gestión Comunitaria y Preventiva**
```javascript
[
  "Red de Autocuidado Vecinal",
  "Mesa Territoriales",
  "Mesa Técnicas",
  "Charla preventivas",
  "Levantamiento de Factores de Riesgo",
  "Operativos de Prevención SENDA",
  "Otro"
]
```

#### 4. **Operativos Estacionales o Temáticos**
```javascript
[
  "Seguridad Escolar",
  "Retorno Escolar",
  "Operativos Rurales",
  "Ruta Segura",
  "Seguridad Fiestas Patrias / Navidad",
  "Otro"
]
```

---

### **Estado de Actividad**
Valores del `select#edit-actividad-estado`:
```javascript
[
  "planificado",       // Por defecto
  "ejecutado",
  "cancelado",
  "postergado"
]
```

---

### **Otras Instituciones Asociadas**
`textarea#edit-actividad-otras` - checkboxes múltiples con todos los valores de responsable (arriba).

---

## 📝 Ejemplo Completo (Con tus datos)

```javascript
{
  actividad: {
    // Input: Nombre
    nombre: "Rondas Fiscalización Sectores Residenciales",
    
    // Input: Justificación
    justificacion: "Aumento presencia inspectores en zonas residenciales.",
    
    // Input: Fecha (en formato YYYY-MM-DD internamente)
    fecha: "2026-01-01",
    fechas: ["2026-01-01"],
    
    // Input: Hora inicio
    hora_inicio: "08:00",
    
    // Input: Hora fin
    hora_fin: "10:00",
    
    // Input: Responsable (select único)
    responsable: "dspm",
    
    // Input: Otras instituciones (checkboxes múltiples)
    otras_instituciones: [
      "dspm",
      "carabineros",
      "gendarmeria",
      "oln",
      "pdi",
      "sag",
      "seguridad_retiro",
      "senda",
      "slep"
    ],
    
    // Input: Categoría (select)
    categoria: "Operativos de Patrullaje y Vigilancia",
    
    // Input: Tipo de actividad (select dinámico)
    subtipo: "operativo_autonomo",
    tipo: "operativo_autonomo",
    
    // Input: Estado (select)
    estado: "planificado",
    
    // Automático
    frecuencia: "diaria"
  },
  
  // Contexto
  institucion: {
    nombre: "dspm",
    abreviacion: "DSPM",
    color: "bg-blue-500"
  },
  
  mesIndex: 0,  // Enero (mes 0)
  dia: 1        // Día 1 de enero
}
```

---

## 🔄 Flujo de Guardado

Cuando se presiona el botón **"Guardar"** en el modal, el objeto se actualiza con:

```javascript
// Si es edición (data existe):
data.actividad.nombre = nombreInput.value;
data.actividad.justificacion = justificacionInput.value;
data.actividad.fecha = fechaInput.value;  // YYYY-MM-DD
data.actividad.fechas = [fechaInput.value];
data.actividad.hora_inicio = horaInicioInput.value;
data.actividad.hora_fin = horaFinInput.value;
data.actividad.responsable = responsableSelect.value;
data.actividad.otras_instituciones = [array de checkboxes marcados];
data.actividad.categoria = categoriaSelect.value;
data.actividad.subtipo = tipoSelect.value;
data.actividad.estado = estadoSelect.value;
data.actividad.frecuencia = "diaria";

// Si es nueva actividad (agregar a institucion.actividades[mesIndex]):
institucionObj.actividades[mesIndex].push({
  nombre,
  justificacion,
  fecha,
  fechas: [fecha],
  hora_inicio: horaInicio,
  hora_fin: horaFin,
  responsable,
  otras_instituciones: otras,
  categoria,
  subtipo: tipo,
  tipo: categoria,
  estado,
  frecuencia: "diaria"
});
```

Después se **re-renderiza el calendario** con los cambios.

---

## 🎯 Validaciones en el Modal

- **Nombre**: Requerido (`required`)
- **Hora inicio**: Requerido (`required`)
- **Hora fin**: Requerido (`required`)
- **Responsable**: Requerido (`required`)
- **Fecha**: Opcional (si se deja vacía, toma valor anterior o se usa `fechas[]`)
- **Otras instituciones**: Opcional (checkboxes, múltiples allowed)
- **Justificación**: Opcional (textarea)
- **Categoría**: Por defecto "Operativos de Patrullaje y Vigilancia"
- **Tipo**: Se auto-rellena según categoría
- **Estado**: Por defecto "planificado"

---

## 📂 Archivos Relacionados

- **Modal UI**: [src/views/CalendarioMesView.js](src/views/CalendarioMesView.js#L290-L600)
- **Mapa de Tipos**: [src/views/CalendarioMesView.js](src/views/CalendarioMesView.js#L30-L70) (`categoriaTiposMap`)
- **Renderizado**: [src/views/CalendarioMesView.js](src/views/CalendarioMesView.js#L75-L150) (función `renderCalendar`)
- **DataLoader**: [src/utils/dataLoader.js](src/utils/dataLoader.js) (transforma datos cargados)
