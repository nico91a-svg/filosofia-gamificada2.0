// Unidades de Filosofía III Medio 2026 - Planificación Anual
// Basado en: Desglose Didáctico Unidades I-IV 2026
// Profesor Nicolás Aldunate Gaete
// Total: 31 clases | 62 horas pedagógicas
window.UNIDADES_DEFAULT = [
    {
        id: 'U1',
        nombre: 'La Filosofía como Actitud y Práctica',
        emoji: '🏛️',
        color: 'from-blue-500 to-indigo-600',
        periodo: 'Marzo - Mayo',
        totalClases: 8,
        objetivos: [
            'OA1: Describir las características del quehacer filosófico, considerando el problema de su origen y sentido, e identificando algunas de sus grandes preguntas y temas.',
            'OA2: Analizar y fundamentar diversas perspectivas filosóficas, considerando posibles relaciones con la cotidianidad, así como normas, valores, creencias y visiones de mundo.',
            'OA6: Aplicar principios y herramientas elementales de argumentación en el diálogo, la escritura y diferentes contextos.'
        ],
        evaluacionSumativa: {
            nombre: 'Ensayo filosófico breve',
            descripcion: 'Ensayo sobre el rol de la filosofía (600 palabras) + Diálogo filosófico grupal',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Ensayo filosófico (600 palabras)', 'Diálogo filosófico grupal'],
            formativa: ['Tickets de salida', 'Actividades de aplicación', 'Debate estructurado', 'Revisión entre pares', 'Autoevaluación y metacognición'],
            diagnostica: ['Cuestionario de 5 preguntas abiertas']
        },
        clases: [
            { num: 1, titulo: 'Diagnóstico e introducción a la filosofía', descripcion: 'Diagnosticar conocimientos previos e introducir el origen y sentido de la filosofía mediante clase magistral sobre el paso del mito al logos.', emoji: '🌅' },
            { num: 2, titulo: 'Distinguir el pensamiento filosófico', descripcion: 'Distinguir el pensamiento filosófico de otros tipos de pensamiento mediante análisis comparativo de textos (científico, religioso, filosófico).', emoji: '🔎' },
            { num: 3, titulo: 'El asombro como origen del filosofar', descripcion: 'Comprender el asombro (thaumázein) como origen del filosofar mediante lectura guiada del Teeteto de Platón y rutina VEO-PIENSO-ME PREGUNTO.', emoji: '😮' },
            { num: 4, titulo: 'Preguntas y métodos filosóficos', descripcion: 'Clasificar preguntas filosóficas por ramas y comparar métodos filosóficos (mayéutica, dialéctica, duda metódica, fenomenología) mediante trabajo colaborativo.', emoji: '❓' },
            { num: 5, titulo: 'El valor de la filosofía', descripcion: 'Evaluar el valor de la filosofía en la vida contemporánea mediante lectura de Russell y debate estructurado (3 rondas).', emoji: '💎' },
            { num: 6, titulo: 'El amor desde la filosofía', descripcion: 'Analizar filosóficamente el concepto de amor (eros, philia, ágape) mediante la comparación entre perspectivas clásicas y contemporáneas (Byung-Chul Han, La agonía del Eros).', emoji: '❤️' },
            { num: 7, titulo: 'Taller de escritura filosófica', descripcion: 'Aplicar técnicas de escritura filosófica mediante la construcción de un ensayo breve con tesis, argumentos y supuestos explícitos. Revisión entre pares.', emoji: '✍️' },
            { num: 8, titulo: 'Evaluación sumativa: ensayo y diálogo', descripcion: 'Demostrar comprensión de los contenidos de la unidad mediante la entrega del ensayo filosófico (600 palabras) y participación en diálogo filosófico grupal de cierre.', emoji: '📝' }
        ],
        vocabulario: [
            { termino: 'Filosofía', definicion: 'Amor por la sabiduría (philos + sophia). Disciplina que busca comprender la realidad, el conocimiento y los valores mediante la reflexión racional y crítica.' },
            { termino: 'Logos / Razón', definicion: 'Principio racional del universo. Capacidad humana de pensar, argumentar y comprender mediante el uso de la lógica. Se opone al mito como forma de explicación.' },
            { termino: 'Actitud filosófica', definicion: 'Disposición a cuestionar lo dado, a asombrarse ante lo cotidiano y a buscar fundamentos racionales para las creencias.' },
            { termino: 'Asombro (thaumázein)', definicion: 'Estado de admiración y perplejidad ante la realidad que, según Platón y Aristóteles, es el origen de la filosofía.' },
            { termino: 'Pregunta filosófica', definicion: 'Interrogante que busca comprender aspectos fundamentales de la realidad, el conocimiento o los valores, y que no se resuelve empíricamente.' },
            { termino: 'Método filosófico', definicion: 'Procedimiento sistemático de investigación filosófica: dialéctico, mayéutico, fenomenológico, analítico, entre otros.' },
            { termino: 'Diálogo socrático', definicion: 'Método de investigación filosófica basado en preguntas y respuestas que busca examinar críticamente ideas y llegar a la verdad.' },
            { termino: 'Supuesto / Presupuesto', definicion: 'Creencia o idea que se da por sentada sin examinar. La filosofía busca identificar y cuestionar los supuestos.' }
        ]
    },
    {
        id: 'U2',
        nombre: 'Ontología - ¿Qué es lo real?',
        emoji: '🌍',
        color: 'from-green-500 to-emerald-600',
        periodo: 'Mayo - Julio',
        totalClases: 8,
        objetivos: [
            'OA3: Formular preguntas filosóficas referidas al ser y la naturaleza de la realidad que sean significativas para su vida, considerando conceptos y teorías ontológicas fundamentales.',
            'OA5: Dialogar sobre grandes problemas de la ontología, confrontando diversas perspectivas filosóficas y fundamentando visiones personales.',
            'OA6: Aplicar principios y herramientas elementales de argumentación en el diálogo, la escritura y diferentes contextos.'
        ],
        evaluacionSumativa: {
            nombre: 'Ensayo ontológico + Diálogo filosófico',
            descripcion: 'Ensayo sobre un problema ontológico (800 palabras) y participación en diálogo filosófico de cierre',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Ensayo ontológico (800 palabras)', 'Diálogo filosófico grupal'],
            formativa: ['Mapa conceptual', 'Análisis de experimentos mentales', 'Debate filosófico', 'Escritura reflexiva', 'Revisión entre pares', 'Autoevaluación y metacognición'],
            diagnostica: []
        },
        clases: [
            { num: 1, titulo: 'Introducción a la ontología', descripcion: 'Identificar la ontología como rama de la filosofía mediante el análisis de sus preguntas fundamentales y la creación de un mapa conceptual.', emoji: '🗺️' },
            { num: 2, titulo: 'Experimentos mentales sobre la realidad', descripcion: 'Reflexionar sobre el concepto de realidad mediante el análisis de experimentos mentales clásicos y contemporáneos (cerebro en cubeta, argumento de la simulación de Bostrom).', emoji: '🔮' },
            { num: 3, titulo: 'La alegoría de la caverna', descripcion: 'Interpretar la teoría platónica de la realidad mediante el análisis de la alegoría de la caverna (República VII) y su relevancia actual (redes sociales, desinformación).', emoji: '🕳️' },
            { num: 4, titulo: 'El tiempo y la existencia (Nietzsche)', descripcion: 'Diferenciar perspectivas filosóficas sobre el tiempo y la existencia mediante la reflexión sobre el eterno retorno de Nietzsche (La gaya ciencia §341).', emoji: '♾️' },
            { num: 5, titulo: 'Libertad y determinismo', descripcion: 'Evaluar la relación entre libertad y determinismo mediante el análisis de textos de Thomas Nagel y debate filosófico en tríos (determinista, libertario, juez).', emoji: '⚖️' },
            { num: 6, titulo: 'El problema de la existencia de Dios', descripcion: 'Comparar posiciones filosóficas sobre la existencia de Dios mediante el análisis de argumentos clásicos (ontológico, cosmológico, del diseño, problema del mal).', emoji: '✨' },
            { num: 7, titulo: 'Taller de escritura: tesis ontológica', descripcion: 'Formular una tesis filosófica sobre un problema ontológico mediante técnicas de argumentación filosófica y revisión entre pares.', emoji: '📜' },
            { num: 8, titulo: 'Evaluación sumativa: ensayo y diálogo ontológico', descripcion: 'Demostrar comprensión de los problemas ontológicos mediante la presentación del ensayo (800 palabras) y participación en diálogo filosófico de cierre.', emoji: '🎤' }
        ],
        vocabulario: [
            { termino: 'Ontología / Metafísica', definicion: 'Rama de la filosofía que estudia el ser en cuanto ser, la naturaleza de la realidad y las categorías fundamentales de la existencia.' },
            { termino: 'Ser / Ente', definicion: 'El ser es aquello que hace que algo exista. El ente es todo lo que es, todo lo que tiene existencia.' },
            { termino: 'Realidad / Apariencia', definicion: 'Distinción entre lo que verdaderamente es (realidad) y lo que parece ser pero puede no corresponder a lo real (apariencia).' },
            { termino: 'Esencia / Existencia', definicion: 'La esencia es lo que algo es (su naturaleza). La existencia es el hecho de que algo sea (que esté ahí).' },
            { termino: 'Sustancia / Accidente', definicion: 'La sustancia es lo que permanece en un ser. Los accidentes son las propiedades que pueden cambiar sin alterar la identidad del ser.' },
            { termino: 'Dualismo / Monismo', definicion: 'El dualismo sostiene que la realidad se compone de dos principios irreductibles. El monismo afirma que solo hay un principio fundamental.' },
            { termino: 'Determinismo / Libertad', definicion: 'El determinismo sostiene que todo evento está causado necesariamente. La libertad implica la capacidad de elegir entre alternativas genuinas.' },
            { termino: 'Trascendente / Inmanente', definicion: 'Lo trascendente está más allá de la experiencia sensible. Lo inmanente permanece dentro del ámbito de la experiencia o del mundo.' }
        ]
    },
    {
        id: 'U3',
        nombre: 'Epistemología - ¿Cómo conocemos?',
        emoji: '🧠',
        color: 'from-purple-500 to-violet-600',
        periodo: 'Agosto - Octubre',
        totalClases: 8,
        objetivos: [
            'OA4: Formular preguntas filosóficas referidas al conocimiento, la ciencia y la verdad, considerando conceptos y teorías epistemológicas fundamentales.',
            'OA5: Dialogar sobre grandes problemas de la epistemología, confrontando diversas perspectivas filosóficas y fundamentando visiones personales.',
            'OA2: Analizar y fundamentar diversas perspectivas filosóficas, considerando posibles relaciones con la cotidianidad.',
            'OA6: Aplicar principios y herramientas elementales de argumentación en el diálogo, la escritura y diferentes contextos.'
        ],
        evaluacionSumativa: {
            nombre: 'Prueba de contenidos + Cuento filosófico',
            descripcion: 'Prueba escrita (conceptos, aplicación CVJ, análisis Nagel/Descartes, argumentación) y cuento filosófico epistemológico',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Prueba de contenidos (80 pts)', 'Cuento filosófico epistemológico'],
            formativa: ['Mapa conceptual epistemológico', 'Análisis de casos CVJ', 'Rutina Antes pensaba/Ahora pienso', 'Cuadro comparativo Descartes vs Hume', 'Revisión entre pares', 'Tickets de salida'],
            diagnostica: []
        },
        clases: [
            { num: 1, titulo: 'Introducción a la epistemología', descripcion: 'Identificar la epistemología como rama de la filosofía mediante el análisis de sus preguntas fundamentales (¿qué es conocer?, ¿qué podemos conocer?) y la elaboración de un mapa conceptual.', emoji: '🔍' },
            { num: 2, titulo: 'El problema del conocimiento (Nagel)', descripcion: 'Problematizar la posibilidad del conocimiento mediante la lectura y análisis de Thomas Nagel: argumento del sueño, problema de la inducción, límites de los sentidos.', emoji: '🤔' },
            { num: 3, titulo: 'Opinión, creencia y conocimiento', descripcion: 'Diferenciar opinión (doxa), creencia y conocimiento (episteme) mediante la definición tripartita: creencia verdadera justificada (CVJ) y análisis de casos.', emoji: '💡' },
            { num: 4, titulo: 'La duda metódica de Descartes', descripcion: 'Identificar el método cartesiano y el cogito mediante la lectura de las Meditaciones Metafísicas: tres niveles de duda (sentidos, sueño, genio maligno) y el "pienso, luego existo".', emoji: '🧪' },
            { num: 5, titulo: 'Evaluación sumativa: prueba de contenidos', descripcion: 'Demostrar comprensión de los conceptos epistemológicos fundamentales mediante prueba escrita: conceptos, aplicación CVJ, análisis comparativo Nagel/Descartes y argumentación.', emoji: '📝' },
            { num: 6, titulo: 'El empirismo de David Hume', descripcion: 'Cuestionar el conocimiento racional mediante el análisis de Hume: impresiones vs ideas, crítica a la causalidad, el hábito como base de nuestras expectativas. Cuadro comparativo Descartes vs Hume.', emoji: '🌊' },
            { num: 7, titulo: 'Taller de escritura creativa filosófica', descripcion: 'Problematizar el conocimiento mediante la escritura de un cuento filosófico que explore problemas epistemológicos con personajes que encarnen posiciones filosóficas.', emoji: '✍️' },
            { num: 8, titulo: 'Filosofía de la ciencia y Gettier', descripcion: 'Evaluar los límites de la definición tradicional de conocimiento mediante los casos Gettier y la teoría de paradigmas de Kuhn (ciencia normal, anomalías, revolución científica).', emoji: '🔬' }
        ],
        vocabulario: [
            { termino: 'Epistemología', definicion: 'Rama de la filosofía que estudia el conocimiento: su naturaleza, sus fuentes, sus límites y su validez. Del griego episteme (conocimiento) + logos (estudio).' },
            { termino: 'Doxa / Episteme', definicion: 'Doxa es la opinión o creencia no fundamentada. Episteme es el conocimiento verdadero y justificado. Distinción central en la tradición griega (Platón).' },
            { termino: 'Creencia verdadera justificada (CVJ)', definicion: 'Definición tripartita del conocimiento: S sabe que P si y solo si S cree que P, P es verdadero y S tiene justificación para creer P.' },
            { termino: 'Duda metódica / Cogito', definicion: 'Método de Descartes que consiste en dudar de todo para encontrar una certeza indudable. El cogito ("pienso, luego existo") es esa primera certeza.' },
            { termino: 'Racionalismo / Empirismo', definicion: 'El racionalismo (Descartes) sostiene que la razón es la fuente principal del conocimiento. El empirismo (Hume) afirma que la experiencia sensible es la fuente.' },
            { termino: 'Escepticismo', definicion: 'Postura filosófica que cuestiona la posibilidad de alcanzar conocimiento seguro o certeza absoluta sobre el mundo exterior.' },
            { termino: 'Impresiones / Ideas (Hume)', definicion: 'Para Hume, las impresiones son vivencias directas de la experiencia. Las ideas son copias débiles de las impresiones. Todo conocimiento proviene de impresiones.' },
            { termino: 'Paradigma (Kuhn) / Casos Gettier', definicion: 'Paradigma: conjunto de teorías y supuestos compartidos por una comunidad científica. Casos Gettier: contraejemplos que muestran que la definición CVJ es insuficiente.' }
        ]
    },
    {
        id: 'U4',
        nombre: 'Diálogo y Conocimiento Colectivo',
        emoji: '💬',
        color: 'from-orange-500 to-red-600',
        periodo: 'Octubre - Noviembre',
        totalClases: 7,
        objetivos: [
            'OA5: Dialogar sobre grandes problemas filosóficos, confrontando diversas perspectivas y fundamentando visiones personales.',
            'OA6: Aplicar principios y herramientas elementales de argumentación en el diálogo, la escritura y diferentes contextos.',
            'OA4: Formular preguntas filosóficas referidas al conocimiento, la ciencia y la verdad, considerando conceptos y teorías epistemológicas fundamentales.'
        ],
        evaluacionSumativa: {
            nombre: 'Debate filosófico evaluado',
            descripcion: 'Debate filosófico evaluado con rúbrica (tesis, argumentación, uso de filósofos, refutación, escucha activa, expresión oral, respeto) + Reflexión metacognitiva de cierre',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Debate filosófico evaluado (28 pts)', 'Portafolio filosófico del año'],
            formativa: ['Diálogos socráticos', 'Juego de roles filosófico', 'Círculo de puntos de vista', 'Ficha de preparación del debate', 'Reflexión metacognitiva'],
            diagnostica: []
        },
        clases: [
            { num: 1, titulo: 'El diálogo filosófico: tradición y práctica', descripcion: 'Identificar las características del diálogo filosófico mediante el análisis de la tradición socrática (mayéutica, Menón) y participación en comunidad de indagación.', emoji: '🏛️' },
            { num: 2, titulo: 'Tipos y objetivos del diálogo', descripcion: 'Diferenciar los tipos de diálogo filosófico (exploratorio, argumentativo, deliberativo, hermenéutico) mediante el análisis de sus objetivos y la creación de diálogos propios.', emoji: '🗣️' },
            { num: 3, titulo: 'Diálogo filosófico: juego de roles', descripcion: 'Participar en diálogos filosóficos mediante juego de roles representando a Sócrates, Platón, Descartes, Hume y Nagel en mesas redondas ontológicas y epistemológicas.', emoji: '🎭' },
            { num: 4, titulo: 'Manejo de controversias filosóficas', descripcion: 'Identificar formas constructivas de abordar controversias filosóficas mediante el círculo de puntos de vista y la creación de posturas fundamentadas con tolerancia epistémica.', emoji: '🤝' },
            { num: 5, titulo: 'Preparación del debate filosófico', descripcion: 'Elaborar una postura filosófica personal con tesis, argumentos, contraargumentos y conexiones con filósofos del curso, preparando ficha para el debate evaluado.', emoji: '📋' },
            { num: 6, titulo: 'Debate filosófico evaluado (parte 1)', descripcion: 'Dialogar sobre preguntas filosóficas significativas mediante debates evaluados: exposición, refutación, preguntas del público y conclusiones (3 debates de 20 min).', emoji: '⚔️' },
            { num: 7, titulo: 'Debate filosófico evaluado (parte 2) y cierre del año', descripcion: 'Completar debates finales y sintetizar los aprendizajes del año mediante reflexión metacognitiva "Mi viaje filosófico" y círculo de cierre.', emoji: '🏆' }
        ],
        vocabulario: [
            { termino: 'Diálogo socrático / Mayéutica', definicion: 'Método filosófico de Sócrates basado en preguntas que ayudan al interlocutor a "dar a luz" ideas propias, buscando la verdad mediante el examen crítico.' },
            { termino: 'Comunidad de indagación', definicion: 'Grupo de personas que dialogan filosóficamente siguiendo reglas de escucha activa, preguntas genuinas y disposición a cambiar de opinión.' },
            { termino: 'Diálogo exploratorio / argumentativo', definicion: 'El exploratorio busca comprender y abrir posibilidades. El argumentativo evalúa razones y defiende posiciones con fundamentación.' },
            { termino: 'Diálogo deliberativo / hermenéutico', definicion: 'El deliberativo busca tomar decisiones y resolver problemas. El hermenéutico interpreta textos o fenómenos buscando su significado.' },
            { termino: 'Controversia filosófica', definicion: 'Desacuerdo genuino donde personas razonables pueden diferir indefinidamente, a diferencia de desacuerdos que se resuelven con más información.' },
            { termino: 'Tolerancia epistémica', definicion: 'Capacidad de respetar que otros piensen distinto cuando tienen buenas razones para hacerlo, sin renunciar a la búsqueda de la verdad.' },
            { termino: 'Empatía intelectual', definicion: 'Habilidad de comprender y representar fielmente posiciones filosóficas distintas a la propia, poniéndose en el lugar del otro pensador.' },
            { termino: 'Refutación / Contraargumento', definicion: 'Refutación es demostrar que un argumento es inválido o falso. Contraargumento es presentar razones que se oponen a la tesis del otro.' }
        ]
    }
];
