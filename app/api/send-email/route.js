// app/api/send-email/route.js

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Asegúrate de que esta ruta sea correcta para tu config.js
const {
    PARTICIPANTS,
    EMAILS_ALLOWED,
    ASSIGNMENTS_DETAILS,
    ACCESS_LOG
} = require('../../../lib/config');

// Inicializar Resend
// Se inicializará con la clave cargada desde process.env.RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    // Depuración: Verifica si la API Key está cargada (debe ser TRUE)
    console.log("LOG 1: ¿Clave de Resend cargada?", !!process.env.RESEND_API_KEY); 

    const body = await request.json();
    const { email } = body;

    // 1. Validar el formato y normalizar
    if (!email || !email.includes('@')) {
        return NextResponse.json({ message: 'Por favor, introduce un correo electrónico válido.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`LOG 2: Solicitud de email: ${normalizedEmail}`);

    // 2. Validar que el correo esté en la lista de permitidos
    if (!EMAILS_ALLOWED.includes(normalizedEmail)) {
        return NextResponse.json({ message: `El correo ${normalizedEmail} no es un participante autorizado.` }, { status: 403 });
    }

    // 3. Chequear si ya se le ha asignado (persistencia temporal)
    if (ACCESS_LOG[normalizedEmail]) {
        console.log(`LOG 3: El usuario ${normalizedEmail} ya ha recibido su correo.`);
        return NextResponse.json({ 
            message: '¡Ya se te ha asignado tu amigo invisible! Revisa tu correo.', 
            sent: true 
        }, { status: 200 });
    }

    // 4. Obtener la asignación
    const assignment = ASSIGNMENTS_DETAILS.find(item => item.giverEmail === normalizedEmail);
    if (!assignment) {
        console.error("LOG 4: Error fatal, correo sin asignación en config.js");
        return NextResponse.json({ message: 'Error en la configuración del sorteo.' }, { status: 500 });
    }

    const { giver, receiver } = assignment;
    const receiverName = receiver;

    console.log(`LOG 5: Asignación encontrada: ${giver} regala a ${receiverName}`);

    // 5. Enviar el correo electrónico
    try {
        const emailResponse = await resend.emails.send({
            // *** IMPORTANTE: Usa la dirección "from" VERIFICADA en Resend ***
            from: 'Amigo Invisible <onboarding@resend.dev>', 
            to: [normalizedEmail], 
            subject: '¡Ya tienes a tu Amigo Invisible 🎁!',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h1 style="color: #007bff;">¡Hola ${giver}!</h1>
                    <p style="font-size: 16px;">Tu amigo invisible, la persona a la que debes hacer un regalo, es:</p>
                    <h2 style="color: #e91e63; font-size: 24px; margin: 15px 0;">${receiverName}</h2>
                    <p>¡No lo compartas con nadie! Y recuerda, la fecha de intercambio es [Fecha aquí].</p>
                </div>
            `,
        });
        
        // 6. Registrar el acceso
        ACCESS_LOG[normalizedEmail] = true;
        console.log("LOG 6: Correo enviado y acceso registrado con éxito.");

        return NextResponse.json({
            message: '¡Correo enviado con éxito! Revisa tu bandeja de entrada (y spam).',
            sent: true
        }, { status: 200 });

    } catch (error) {
        // Log de error detallado
        console.error('LOG 7: ERROR CRÍTICO al enviar correo a Resend:', error.message);
        
        return NextResponse.json({ 
            message: 'Error al intentar enviar el correo. Verifica tu clave de API y la dirección FROM.', 
            error: error.message
        }, { status: 500 });
    }
}