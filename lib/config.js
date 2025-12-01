// config.js

// Paso 1: Mapear correos y nombres (¡asegúrate de que la lista de correos no tenga duplicados!)
const PARTICIPANTS = {
    "oriolb47@gmail.com": "Brossa",
    "a.sola.provins@gmail.com": "Sola",
    "manelserrano91@gmail.com": "Manel",
    "mateupibernat@gmail.com": "Mateu",
    "nachomontesramos@gmail.com": "Nacho", // Cuidado con el duplicado en tu lista
    "hugo.nienhausen@gmail.com": "Hugo",
    "Adriansepulveda73@gmail.com": "Sepu",
    "Otramon2003@gmail.com": "Ot",
    "pol.naudi23@gmail.com": "Naudi",
    "marc.2003.bcn@gmail.com": "Millanes", // Asumiendo que Millanes es Marc
    "bernatserragrasas@gmail.com": "Bernat Serra",
    "rodrigomariza10@gmail.com": "Rodri",
    // ⚠️ Importante: Asegúrate de que todos los nombres tengan un correo único.
    // He ajustado para que la lista de correos sea la clave y el nombre sea el valor.
};

// Array de todos los correos permitidos
const EMAILS_ALLOWED = Object.keys(PARTICIPANTS);

/**
 * 🎁 Función que realiza el sorteo del Amigo Invisible (una sola vez)
 * para asegurar que nadie se regala a sí mismo y que todos tienen asignación.
 * Esta función DEBES EJECUTARLA UNA SOLA VEZ para generar el resultado FINAL_ASSIGNMENTS.
 * @returns {Object} Un mapeo de asignaciones finales.
 */
function runSecretSantaDraw(emails) {
    let assignments = {};
    let targets = [...emails]; // Lista de personas que pueden ser regaladas
    let givers = [...emails]; // Lista de personas que regalan

    // Función para mezclar un array (Fisher-Yates)
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    // Aseguramos que la lista de posibles regalos esté bien mezclada.
    shuffle(targets);

    let drawSuccessful = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    while (!drawSuccessful && attempts < MAX_ATTEMPTS) {
        attempts++;
        let tempAssignments = {};
        let currentTargets = [...targets]; // Re-shuffle targets for a fresh attempt

        let successfulIteration = true;
        for (const giver of givers) {
            let possibleTargets = currentTargets.filter(target => target !== giver);

            if (possibleTargets.length === 0) {
                // Si no hay targets posibles, la asignación es imposible, reiniciamos.
                successfulIteration = false;
                break;
            }

            // Selecciona un target aleatorio de los posibles
            const randomIndex = Math.floor(Math.random() * possibleTargets.length);
            const assignedTargetEmail = possibleTargets[randomIndex];

            tempAssignments[giver] = assignedTargetEmail;

            // Elimina al target asignado de la lista de posibles regalos.
            currentTargets = currentTargets.filter(target => target !== assignedTargetEmail);
        }

        if (successfulIteration && currentTargets.length === 0) {
            // Éxito: todos asignados y nadie se ha regalado a sí mismo.
            assignments = tempAssignments;
            drawSuccessful = true;
        }
    }

    if (!drawSuccessful) {
        console.error("No se pudo completar el sorteo después de varios intentos. Revisa la lista de participantes.");
        return {};
    }

    return assignments;
}

// -----------------------------------------------------------------------------
// PASO CLAVE: Ejecuta la función UNA SOLA VEZ para generar el resultado final.
// COMENTA O ELIMINA ESTA LÍNEA DESPUÉS DE LA PRIMERA EJECUCIÓN EXITOSA.
 //const DRAW_RESULT = runSecretSantaDraw(EMAILS_ALLOWED);
 //console.log("Resultado del sorteo (¡Guárdalo!):", DRAW_RESULT);
// -----------------------------------------------------------------------------

// Pega aquí el resultado de la ejecución exitosa de runSecretSantaDraw
// (ejemplo ficticio, ¡debes usar el tuyo!)
const FINAL_ASSIGNMENTS = {
  'oriolb47@gmail.com': 'marc.2003.bcn@gmail.com',
  'a.sola.provins@gmail.com': 'Adriansepulveda73@gmail.com',
  'manelserrano91@gmail.com': 'mateupibernat@gmail.com',
  'mateupibernat@gmail.com': 'hugo.nienhausen@gmail.com',
  'nachomontesramos@gmail.com': 'manelserrano91@gmail.com',
  'hugo.nienhausen@gmail.com': 'oriolb47@gmail.com',
  'Adriansepulveda73@gmail.com': 'rodrigomariza10@gmail.com',
  'Otramon2003@gmail.com': 'bernatserragrasas@gmail.com',
  'pol.naudi23@gmail.com': 'a.sola.provins@gmail.com',
  'marc.2003.bcn@gmail.com': 'Otramon2003@gmail.com',
  'bernatserragrasas@gmail.com': 'pol.naudi23@gmail.com',
  'rodrigomariza10@gmail.com': 'nachomontesramos@gmail.com'
};

// -----------------------------------------------------------------------------
// PASO 2: Estructura de Asignación y Estado (quién ya ha abierto su correo)
// -----------------------------------------------------------------------------

// El estado inicial (nadie ha abierto el correo)
let ACCESS_LOG = {}; // { "oriolb47@gmail.com": true, "a.sola.provins@gmail.com": true, ... }

// Mapeo final para la función Serverless
const ASSIGNMENTS_DETAILS = Object.entries(FINAL_ASSIGNMENTS).map(([giverEmail, receiverEmail]) => ({
    giver: PARTICIPANTS[giverEmail],
    giverEmail: giverEmail,
    receiver: PARTICIPANTS[receiverEmail],
    receiverEmail: receiverEmail,
}));


module.exports = {
    PARTICIPANTS,
    EMAILS_ALLOWED,
    ASSIGNMENTS_DETAILS,
    ACCESS_LOG,
};