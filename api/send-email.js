// Brevo API endpoint for sending emails
// This is a Node.js serverless function for handling email sending

const brevo = require('@getbrevo/brevo');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { name, email, phone, projectType, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !projectType || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        
        // Initialize Brevo API
        const apiInstance = new brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
        
        // Email to company (notification)
        const companyEmailData = {
            sender: {
                email: process.env.FROM_EMAIL || 'noreply@decoandco.ma',
                name: 'DecoAndCo Website'
            },
            to: [{
                email: process.env.TO_EMAIL || 'contact@decoandco.ma',
                name: 'DecoAndCo'
            }],
            subject: `🏠 Nouvelle demande de devis - ${projectType}`,
            htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2d7d32, #1b5e20); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                🏠 Nouvelle Demande de Devis
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                ${projectType}
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <!-- Client Info -->
            <div style="background: #f0f9f0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2d7d32;">
                <h3 style="color: #2d7d32; margin: 0 0 15px; font-size: 18px;">👤 Informations du Client</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 100px;">Nom:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2d7d32; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Téléphone:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${phone || 'Non renseigné'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Projet:</td>
                        <td style="padding: 8px 0; color: #1f2937;">${projectType}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Message -->
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #2d7d32; margin: 0 0 15px; font-size: 18px;">💬 Message du Client</h3>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #2d7d32;">
                    <p style="margin: 0; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" style="display: inline-block; background: #2d7d32; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-right: 10px;">
                    📧 Répondre au Client
                </a>
                <a href="tel:${phone || ''}" style="display: inline-block; background: #1b5e20; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    📞 Appeler le Client
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                📅 Reçu le ${new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
            <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">
                Cette demande a été envoyée depuis le site web DecoAndCo.ma
            </p>
        </div>
    </div>
</div>
            `
        };
        
        // Email to client (confirmation)
        const clientEmailData = {
            sender: {
                email: process.env.FROM_EMAIL || 'noreply@decoandco.ma',
                name: 'DecoAndCo'
            },
            to: [{
                email: email,
                name: name
            }],
            subject: `✅ Confirmation de votre demande de devis - DecoAndCo`,
            htmlContent: `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2d7d32, #1b5e20); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                ✅ Demande Reçue avec Succès
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                Merci pour votre confiance, ${name} !
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Bonjour <strong>${name}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Nous avons bien reçu votre demande de devis pour votre projet de <strong>${projectType}</strong>. 
                Notre équipe d'experts en décoration d'intérieur va étudier votre demande avec attention.
            </p>
            
            <!-- Summary -->
            <div style="background: #f0f9f0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2d7d32;">
                <h3 style="color: #2d7d32; margin: 0 0 15px; font-size: 18px;">📋 Résumé de votre demande</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151; width: 120px;">Type de projet:</td>
                        <td style="padding: 6px 0; color: #1f2937;">${projectType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151;">Email:</td>
                        <td style="padding: 6px 0; color: #1f2937;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: 600; color: #374151;">Téléphone:</td>
                        <td style="padding: 6px 0; color: #1f2937;">${phone || 'Non renseigné'}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">🚀 Prochaines Étapes</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                    <li style="margin-bottom: 8px;">Notre équipe va analyser votre projet dans les <strong>24h</strong></li>
                    <li style="margin-bottom: 8px;">Nous vous contacterons pour planifier un <strong>rendez-vous gratuit</strong></li>
                    <li style="margin-bottom: 8px;">Présentation d'un <strong>devis personnalisé</strong> adapté à vos besoins</li>
                    <li>Début des travaux selon votre planning</li>
                </ul>
            </div>
            
            <!-- Contact Info -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 15px; font-size: 18px;">📞 Besoin d'informations ?</h3>
                <p style="margin: 0 0 15px; color: #374151; line-height: 1.6;">
                    N'hésitez pas à nous contacter si vous avez des questions :
                </p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center;">
                        <span style="color: #f59e0b; margin-right: 10px;">📞</span>
                        <a href="tel:0600908467" style="color: #92400e; text-decoration: none; font-weight: 500;">06.00.90.84.67 / 07.53.23.64.14</a>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="color: #25d366; margin-right: 10px;">💬</span>
                        <a href="https://wa.me/212600908467" style="color: #92400e; text-decoration: none; font-weight: 500;">WhatsApp: 06.00.90.84.67</a>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="color: #f59e0b; margin-right: 10px;">✉️</span>
                        <a href="mailto:contact@decoandco.ma" style="color: #92400e; text-decoration: none; font-weight: 500;">contact@decoandco.ma</a>
                    </div>
                </div>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                Merci de nous faire confiance pour votre projet de décoration d'intérieur. 
                Nous avons hâte de transformer votre espace en un lieu unique qui vous ressemble !
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0 0; font-weight: 600;">
                L'équipe DecoAndCo 🎨
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                DecoAndCo - L'art de vivre, réinventé chez vous
            </p>
            <div style="margin-top: 15px;">
                <a href="https://web.facebook.com/people/Déco-Co/61560077693333/" style="color: #3b5998; text-decoration: none; margin: 0 10px;">Facebook</a>
                <a href="https://www.instagram.com/decoandco.ma/" style="color: #e4405f; text-decoration: none; margin: 0 10px;">Instagram</a>
                <a href="https://wa.me/212782079586" style="color: #25d366; text-decoration: none; margin: 0 10px;">WhatsApp</a>
            </div>
        </div>
    </div>
</div>
            `
        };
        
        // Send both emails
        const [companyResult, clientResult] = await Promise.all([
            apiInstance.sendTransacEmail(companyEmailData),
            apiInstance.sendTransacEmail(clientEmailData)
        ]);
        
        res.status(200).json({ 
            success: true, 
            message: 'Emails sent successfully',
            companyEmailId: companyResult.messageId,
            clientEmailId: clientResult.messageId
        });
        
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ 
            error: 'Failed to send emails',
            details: error.message 
        });
    }
}