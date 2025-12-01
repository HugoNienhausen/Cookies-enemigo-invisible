// /app/api/send-email/route.js

import { Resend } from 'resend';

// Inicializar Resend usando la variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// Importa tus configuraciones
const {
    PARTICIPANTS,
    EMAILS_ALLOWED,
    ASSIGNMENTS_DETAILS,
    ACCESS_LOG
} = require('../../../lib/config'); // Asegúrate de que esta ruta a config.js sea correcta

// La función debe llamarse POST y recibir un objeto 'request'
export async function POST(request) {
    // 1. Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { email } = body;

    // 2. Comprobación de email y normalización (similar al código anterior)
    if (!email || !email.includes('@')) {
        return Response.json({ message: 'Por favor, introduce un correo electrónico válido.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAILS_ALLOWED.includes(normalizedEmail)) {
        return Response.json({ message: `El correo no está en la lista de participantes permitidos.` }, { status: 403 });
    }

    // 3. Chequear si ya se le ha asignado (persistencia, recuerda que debes usar una DB)
    if (ACCESS_LOG[normalizedEmail]) {
        return Response.json({ message: '¡Ya se te ha asignado tu amigo invisible! Revisa tu correo.', sent: true }, { status: 200 });
    }

    // 4. Obtener la asignación
    const assignment = ASSIGNMENTS_DETAILS.find(item => item.giverEmail === normalizedEmail);
    if (!assignment) {
        return Response.json({ message: 'Error en la configuración del sorteo.' }, { status: 500 });
    }

    const { giver, receiver } = assignment;
    const receiverName = receiver;
    
    // 5. Lógica de Envío de Correo (***DEBES IMPLEMENTAR ESTO CON SendGrid, Resend, etc.***)
    try {
    // 5. Enviar el correo electrónico usando Resend
    const emailResponse = await resend.emails.send({
        // **IMPORTANTE:** Cambia 'tudominio.com' por un dominio o correo verificado en Resend
        from: 'Amigo Invisible <amigo-invisible@tudominio.com>', 
        to: [normalizedEmail], // El correo de la persona que introdujo el mail
        subject: '¡Ya tienes a tu Amigo Invisible 🎁!',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                <h1 style="color: #007bff;">¡Hola ${giver}!</h1>
                <p style="font-size: 16px;">¡Ya es oficial! Tu amigo invisible, la persona a la que debes hacer un regalo, es:</p>
                <h2 style="color: #e91e63; font-size: 24px; margin: 15px 0;">${receiverName}</h2>
                <p>¡No se lo digas a nadie! Y busca el regalo perfecto para ${receiverName}.</p>
                <p style="font-size: 12px; color: #777;">Este correo es confidencial y ha sido generado automáticamente.</p>
            </div>
        `,
    });
    
    // Opcional: Puedes revisar el ID del email enviado si lo necesitas
    // console.log("Email ID de Resend:", emailResponse.data.id); 

    // 6. Registrar el acceso (usar DB en producción)
    ACCESS_LOG[normalizedEmail] = true;

    // 7. Respuesta exitosa al cliente
    return Response.json({
        message: '¡Correo enviado con éxito! Revisa tu bandeja de entrada (y spam).',
        sent: true
    }, { status: 200 });

} catch (error) {
        console.error('Error al enviar el correo:', error);
        return Response.json({ 
            message: 'Error al intentar enviar el correo. Inténtalo de nuevo más tarde.', 
            error: error.message 
        }, { status: 500 });
    }
}