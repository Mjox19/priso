// Mailjet API endpoint for sending emails
// This is a Node.js serverless function for handling email sending

const mailjet = require('node-mailjet').connect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);

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
        
        // Send email using Mailjet
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: process.env.FROM_EMAIL || 'noreply@decoandco.ma',
                            Name: 'DecoAndCo Website'
                        },
                        To: [
                            {
                                Email: process.env.TO_EMAIL || 'contact@decoandco.ma',
                                Name: 'DecoAndCo'
                            }
                        ],
                        Subject: `Nouvelle demande de devis - ${projectType}`,
                        TextPart: `
Nouvelle demande de devis reçue:

Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non renseigné'}
Type de projet: ${projectType}

Message:
${message}

---
Cette demande a été envoyée depuis le site web DecoAndCo.ma
                        `,
                        HTMLPart: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1b5e20;">Nouvelle demande de devis</h2>
    
    <div style="background: #f0f9f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d7d32; margin-top: 0;">Informations du client</h3>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Téléphone:</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Type de projet:</strong> ${projectType}</p>
    </div>
    
    <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h3 style="color: #2d7d32; margin-top: 0;">Message</h3>
        <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
        Cette demande a été envoyée depuis le site web DecoAndCo.ma
    </div>
</div>
                        `
                    }
                ]
            });
        
        const result = await request;
        
        if (result.body.Messages[0].Status === 'success') {
            res.status(200).json({ success: true, message: 'Email sent successfully' });
        } else {
            throw new Error('Failed to send email');
        }
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}