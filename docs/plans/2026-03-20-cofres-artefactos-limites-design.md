# Sistema de Cofres, Artefactos Ampliados y Limite de Participacion

**Fecha:** 2026-03-20
**Estado:** Aprobado

## Sistema de Cofres

### Tipos de cofre

| Cofre | Se obtiene con | Comun | Raro | Epico | Legendario |
|-------|---------------|-------|------|-------|------------|
| Bronce | Actividades de proceso (firma/tarea/control) | 70% | 22% | 7% | 1% |
| Plata | Evaluaciones con nota (basico/competente) | 50% | 30% | 15% | 5% |
| Oro | Evaluaciones con nota (avanzado/excepcional) | 30% | 35% | 25% | 10% |

### Flujo

1. Profesor registra actividad de proceso o evaluacion -> se agrega un cofre al inventario del estudiante
2. El estudiante ve el cofre en su pestana de Artefactos con boton "Abrir"
3. Al abrir: animacion de revelacion -> se sortea un objeto segun probabilidades del tipo de cofre -> aparece en inventario

### Que actividades dan cofre

- **Si:** Actividades de proceso con firma, tareas, controles, evaluaciones sumativas
- **No:** Participacion en clase, reflexiones cortas, actividades cotidianas

## Catalogo de Artefactos (20 total)

### Comunes (8)

| ID | Nombre | Emoji | Efecto |
|----|--------|-------|--------|
| A1 | Cuaderno de Notas | 📓 | Decorativo |
| A2 | Vela del Estudio | 🕯️ | Decorativo |
| A3 | Reloj de Arena | ⏳ | Decorativo |
| A4 | Tintero Antiguo | 🪶 | +10 XP extra proxima actividad |
| A5 | Moneda del Agora | 🪙 | Decorativo |
| A6 | Mapa de Atenas | 🗺️ | Decorativo |
| A7 | Piedra de Sisifo | 🪨 | Decorativo |
| A8 | Copa de Socrates | 🏆 | +10 XP extra proxima actividad |

### Raros (5)

| ID | Nombre | Emoji | Efecto |
|----|--------|-------|--------|
| A9 | Pergamino Antiguo | 📜 | +50 pts a una habilidad |
| A10 | Mascara de Diogenes | 🎭 | Proteccion: anula 0 XP por limite diario una vez |
| A11 | Pluma de Platon | ✒️ | +25 XP extra en ensayo |
| A12 | Libro de Tales | 📕 | Revela 1 termino de vocabulario |
| A13 | Balanza de Justicia | ⚖️ | +30 XP extra proxima actividad |

### Epicos (4)

| ID | Nombre | Emoji | Efecto |
|----|--------|-------|--------|
| A14 | Orbe del Conocimiento | 🔮 | Revela 3 terminos de vocabulario |
| A15 | Brujula de Descartes | 🧭 | x1.3 XP por 1 semana |
| A16 | Llave de Socrates | 🗝️ | Otorga un badge al azar que no tengas |
| A17 | Espejo de Aristoteles | 🪞 | +100 XP directos |

### Legendarios (3)

| ID | Nombre | Emoji | Efecto |
|----|--------|-------|--------|
| A18 | Anfora de la Sabiduria | 🏺 | Duplica XP de la proxima actividad |
| A19 | Gema de Aristoteles | 💎 | x1.5 XP por 1 semana |
| A20 | Corona del Filosofo | 👑 | Otorga un cofre de oro extra |

### Probabilidades de loot por rareza

- **Comun:** Aparece con alta frecuencia en todos los cofres
- **Raro:** Frecuencia media, requiere varios cofres para coleccionarlos
- **Epico:** Frecuencia baja, se obtienen principalmente con cofres de plata y oro
- **Legendario:** Muy dificil, se obtienen con suerte en cofres de oro

## Limite de Participacion en Clase

- Maximo 2 participaciones con XP por dia por estudiante
- Registro libre sin bloqueos, pero 3ra en adelante registra con 0 XP
- Nota automatica en historial: "Limite diario alcanzado (2/2)"
- Indicador visual en Registro Masivo: icono de advertencia junto a estudiantes que ya alcanzaron el tope

## Efectos de artefactos

- Los decorativos son puro coleccionismo
- Los efectos reales los aplica el profesor manualmente al ver que el estudiante uso el objeto
- Excepcion: "+XP directos" se aplica automaticamente al usar
