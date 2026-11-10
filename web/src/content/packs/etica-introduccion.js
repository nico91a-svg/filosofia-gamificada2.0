// Pack de contenido de EJEMPLO: Introduccion a la Etica.
//
// Sirve como plantilla para crear packs nuevos y para probar que un segundo
// curso puede tener contenido propio. Esta marcado como borrador: los objetivos
// son descriptivos y NO citan Objetivos de Aprendizaje oficiales; antes de usarlo
// con un curso real hay que alinearlo con el programa correspondiente.
const unidades = [
    {
        id: 'U1',
        nombre: '¿Qué debo hacer? La pregunta ética',
        emoji: '🧭',
        color: 'from-amber-500 to-orange-600',
        periodo: 'Primer bimestre',
        totalClases: 4,
        objetivos: [
            'Distinguir entre moral (costumbres y normas vividas) y ética (reflexión filosófica sobre ellas).',
            'Analizar un dilema moral identificando las intuiciones y los principios en conflicto.',
            'Comparar la ética de virtudes de Aristóteles con la ética del deber de Kant.'
        ],
        evaluacionSumativa: {
            nombre: 'Análisis escrito de un dilema',
            descripcion: 'Texto breve (500 palabras) que analiza un dilema moral desde dos teorías éticas y defiende una postura.',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Análisis escrito de un dilema (500 palabras)'],
            formativa: ['Tickets de salida', 'Discusión en parejas', 'Cuadro comparativo Aristóteles / Kant'],
            diagnostica: ['Encuesta de intuiciones morales']
        },
        clases: [
            { num: 1, titulo: 'Moral y ética', descripcion: 'Distinguir la moral como conjunto de normas y costumbres de la ética como reflexión crítica sobre ellas, a partir de ejemplos cotidianos.', emoji: '🧭' },
            { num: 2, titulo: 'El dilema del tranvía', descripcion: 'Examinar las propias intuiciones morales mediante el dilema del tranvía (Philippa Foot) y su variante del puente (Judith Jarvis Thomson).', emoji: '🚋' },
            { num: 3, titulo: 'Aristóteles: virtud y vida buena', descripcion: 'Comprender la ética de virtudes: la eudaimonía como fin de la vida humana y la virtud como término medio entre dos extremos (Ética a Nicómaco).', emoji: '🏛️' },
            { num: 4, titulo: 'Kant: el deber y el imperativo categórico', descripcion: 'Comprender la ética del deber: actuar según una máxima que pueda valer como ley universal y tratar a las personas siempre como fines.', emoji: '📏' }
        ],
        vocabulario: [
            { termino: 'Ética', definicion: 'Rama de la filosofía que reflexiona críticamente sobre la moral: qué hace que una acción sea correcta y qué es una vida buena.' },
            { termino: 'Moral', definicion: 'Conjunto de normas, valores y costumbres que orientan de hecho la conducta de una persona o una comunidad.' },
            { termino: 'Dilema moral', definicion: 'Situación en la que toda alternativa disponible entra en conflicto con algún principio o valor que consideramos importante.' },
            { termino: 'Virtud (areté)', definicion: 'Para Aristóteles, disposición estable del carácter que se adquiere con la práctica y que consiste en un término medio entre el exceso y el defecto.' },
            { termino: 'Eudaimonía', definicion: 'Vida lograda o florecimiento humano. Para Aristóteles es el fin último de nuestras acciones y se alcanza viviendo conforme a la virtud.' },
            { termino: 'Imperativo categórico', definicion: 'Principio moral de Kant que manda de forma incondicional: obra solo según una máxima que puedas querer que se convierta en ley universal.' }
        ]
    },
    {
        id: 'U2',
        nombre: 'Consecuencias, justicia y cuidado',
        emoji: '⚖️',
        color: 'from-teal-500 to-cyan-600',
        periodo: 'Segundo bimestre',
        totalClases: 4,
        objetivos: [
            'Explicar el utilitarismo y evaluar sus principales objeciones.',
            'Aplicar el velo de ignorancia de Rawls para juzgar la justicia de una regla.',
            'Contrastar la ética de la justicia con la ética del cuidado.'
        ],
        evaluacionSumativa: {
            nombre: 'Debate sobre un problema contemporáneo',
            descripcion: 'Debate evaluado en equipos sobre un problema ético actual, usando al menos dos de las teorías estudiadas.',
            porcentaje: null
        },
        instrumentosEvaluacion: {
            sumativa: ['Debate evaluado con rúbrica'],
            formativa: ['Ficha de preparación del debate', 'Experimento mental escrito', 'Autoevaluación'],
            diagnostica: []
        },
        clases: [
            { num: 1, titulo: 'Utilitarismo: la mayor felicidad', descripcion: 'Analizar el principio de utilidad de Bentham y Mill: es correcta la acción que produce la mayor felicidad para el mayor número. Objeciones clásicas.', emoji: '➕' },
            { num: 2, titulo: 'Rawls y el velo de ignorancia', descripcion: 'Evaluar reglas sociales imaginando que no sabemos qué lugar ocuparemos en la sociedad (Teoría de la justicia, 1971).', emoji: '🎭' },
            { num: 3, titulo: 'La ética del cuidado', descripcion: 'Contrastar la perspectiva de la justicia con la del cuidado propuesta por Carol Gilligan: responsabilidad, relaciones y atención al caso concreto.', emoji: '🤲' },
            { num: 4, titulo: 'Debate: un problema ético actual', descripcion: 'Argumentar en equipos sobre un problema contemporáneo aplicando las teorías éticas del curso, con refutación y cierre.', emoji: '🗣️' }
        ],
        vocabulario: [
            { termino: 'Utilitarismo', definicion: 'Teoría ética que juzga las acciones por sus consecuencias: es correcta la que maximiza el bienestar total de los afectados.' },
            { termino: 'Consecuencialismo', definicion: 'Familia de teorías para las que el valor moral de una acción depende únicamente de sus resultados.' },
            { termino: 'Deontología', definicion: 'Familia de teorías para las que ciertas acciones son obligatorias o prohibidas en sí mismas, con independencia de sus consecuencias.' },
            { termino: 'Velo de ignorancia', definicion: 'Experimento mental de John Rawls: elegir los principios de justicia sin saber qué posición social, talentos o creencias tendremos.' },
            { termino: 'Ética del cuidado', definicion: 'Enfoque que pone en el centro de la vida moral las relaciones, la responsabilidad por otros y la respuesta a necesidades concretas.' },
            { termino: 'Dignidad', definicion: 'Valor que tiene toda persona por el hecho de serlo y que impide tratarla solo como un medio para los fines de otros.' }
        ]
    }
];

export default {
    id: 'etica-introduccion',
    nombre: 'Introducción a la Ética (ejemplo)',
    descripcion: 'Pack de ejemplo y plantilla: dilemas, virtud, deber, utilitarismo, justicia y cuidado. 2 unidades, 8 clases.',
    nivel: 'Electivo / plantilla',
    version: '0.1',
    borrador: true,
    unidades
};
