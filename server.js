const express = require('express');
const mailjet = require('node-mailjet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Mailjet Configuration
const mailjetClient = mailjet.apiConnect(
  'dc68a5aa4d2f3cb46093c55826f4f708', // API Key
  'da75d63f0658dad5827fe75a8197f8c4'  // Secret Key
);

// Verify Mailjet connection
const verifyMailjetConnection = async () => {
  try {
    const result = await mailjetClient.get('user').request();
    console.log('✅ Mailjet API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Mailjet connection error:', error.message);
    return false;
  }
};

// Initialize connection verification
verifyMailjetConnection();

// Email templates
function getQuoteEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e40af; }
        .value { margin-left: 10px; }
        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Nouvelle Demande de Devis</h1>
          <p>IO Metric - Precision</p>
        </div>
        <div class="content">
          <h2>Informations du Client</h2>
          <div class="field">
            <span class="label">Nom:</span>
            <span class="value">${data.firstName} ${data.lastName}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${data.email}</span>
          </div>
          <div class="field">
            <span class="label">Téléphone:</span>
            <span class="value">${data.phone || 'Non renseigné'}</span>
          </div>
          <div class="field">
            <span class="label">Entreprise:</span>
            <span class="value">${data.company}</span>
          </div>
          <div class="field">
            <span class="label">Secteur d'activité:</span>
            <span class="value">${data.industry}</span>
          </div>
          <div class="field">
            <span class="label">Type de projet:</span>
            <span class="value">${data.projectType}</span>
          </div>
          <div class="field">
            <span class="label">Description du projet:</span>
            <div style="background: white; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px;">
              ${data.description}
            </div>
          </div>
          <div class="field">
            <span class="label">Date de soumission:</span>
            <span class="value">${new Date(data.submittedAt).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div class="footer">
          <p>Cette demande a été soumise via le site web IO Metric - Precision</p>
          <p>Répondre sous 24h maximum</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getContactEmailTemplate(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e40af; }
        .value { margin-left: 10px; }
        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nouveau Message de Contact</h1>
          <p>IO Metric - Precision</p>
        </div>
        <div class="content">
          <h2>Informations du Contact</h2>
          <div class="field">
            <span class="label">Nom:</span>
            <span class="value">${data.name}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${data.email}</span>
          </div>
          <div class="field">
            <span class="label">Entreprise:</span>
            <span class="value">${data.company || 'Non renseignée'}</span>
          </div>
          <div class="field">
            <span class="label">Sujet:</span>
            <span class="value">${data.subject}</span>
          </div>
          <div class="field">
            <span class="label">Message:</span>
            <div style="background: white; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px;">
              ${data.message}
            </div>
          </div>
          <div class="field">
            <span class="label">Date de soumission:</span>
            <span class="value">${new Date(data.submittedAt).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div class="footer">
          <p>Ce message a été envoyé via le formulaire de contact du site web</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getAutoReplyTemplate(name, type = 'quote') {
  const subject = type === 'quote' ? 'demande de devis' : 'message';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .cta { background: #059669; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Confirmation de réception</h1>
          <p>IO Metric - Precision</p>
        </div>
        <div class="content">
          <h2>Bonjour ${name},</h2>
          <p>Nous avons bien reçu votre ${subject} et nous vous remercions de votre intérêt pour nos solutions de monitoring industriel.</p>
          
          <div class="cta">
            <h3>⏱️ Délai de réponse: 24h maximum</h3>
          </div>
          
          <p><strong>Prochaines étapes:</strong></p>
          <ul>
            <li>📋 Analyse de votre demande par notre équipe technique</li>
            <li>📞 Prise de contact sous 24h</li>
            <li>🎯 Proposition personnalisée adaptée à vos besoins</li>
          </ul>
          
          <p>En attendant, n'hésitez pas à consulter nos <a href="https://precisio.ma" style="color: #1e40af;">études de cas</a> pour découvrir comment nous avons aidé d'autres entreprises à optimiser leurs performances industrielles.</p>
          
          <p>Cordialement,<br>
          <strong>L'équipe IO Metric - Precision</strong></p>
        </div>
        <div class="footer">
          <p>IO Metric - Precision | Solutions de Monitoring Industriel</p>
          <p>Email: contact@precisio.ma | Web: precisio.ma</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enhanced email sending function with Mailjet
async function sendEmailWithMailjet(emailData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const request = mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [emailData]
      });
      
      const result = await request;
      return result;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// API Routes
app.post('/api/quote', async (req, res) => {
  try {
    const quoteData = {
      ...req.body,
      submittedAt: new Date().toISOString()
    };
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'industry', 'projectType', 'description', 'gdprConsent'];
    const missingFields = requiredFields.filter(field => !quoteData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Champs requis manquants', 
        missingFields 
      });
    }

    // Email to company
    const companyEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: "contact@precisio.ma",
          Name: "IO Metric Team"
        }
      ],
      Subject: `🎯 Nouvelle demande de devis - ${quoteData.company}`,
      HTMLPart: getQuoteEmailTemplate(quoteData)
    };

    // Auto-reply to client
    const clientEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: quoteData.email,
          Name: `${quoteData.firstName} ${quoteData.lastName}`
        }
      ],
      Subject: "✅ Confirmation de votre demande de devis - IO Metric",
      HTMLPart: getAutoReplyTemplate(quoteData.firstName, 'quote')
    };

    // Send both emails
    try {
      await Promise.all([
        sendEmailWithMailjet(companyEmail),
        sendEmailWithMailjet(clientEmail)
      ]);

      console.log(`✅ Quote emails sent successfully for ${quoteData.company}`);

      res.status(200).json({ 
        message: 'Demande de devis envoyée avec succès',
        id: `quote_${Date.now()}`,
        estimatedResponse: '24 heures'
      });
    } catch (emailError) {
      console.error('❌ Failed to send emails after retries:', emailError.message);
      
      // Still return success to user but log the email failure
      res.status(200).json({ 
        message: 'Demande de devis reçue avec succès',
        id: `quote_${Date.now()}`,
        estimatedResponse: '24 heures',
        note: 'Email de confirmation en cours de traitement'
      });
    }

  } catch (error) {
    console.error('❌ Error processing quote request:', error);
    res.status(500).json({ 
      message: 'Erreur lors du traitement de la demande',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      submittedAt: new Date().toISOString()
    };
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message', 'gdprConsent'];
    const missingFields = requiredFields.filter(field => !contactData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Champs requis manquants', 
        missingFields 
      });
    }

    // Email to company
    const companyEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: "contact@precisio.ma",
          Name: "IO Metric Team"
        }
      ],
      Subject: `📧 Nouveau message de contact - ${contactData.subject}`,
      HTMLPart: getContactEmailTemplate(contactData)
    };

    // Auto-reply to client
    const clientEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: contactData.email,
          Name: contactData.name
        }
      ],
      Subject: "✅ Confirmation de votre message - IO Metric",
      HTMLPart: getAutoReplyTemplate(contactData.name, 'contact')
    };

    // Send both emails
    try {
      await Promise.all([
        sendEmailWithMailjet(companyEmail),
        sendEmailWithMailjet(clientEmail)
      ]);

      console.log(`✅ Contact emails sent successfully from ${contactData.email}`);

      res.status(200).json({ 
        message: 'Message envoyé avec succès',
        id: `contact_${Date.now()}`,
        estimatedResponse: '24 heures'
      });
    } catch (emailError) {
      console.error('❌ Failed to send emails after retries:', emailError.message);
      
      // Still return success to user but log the email failure
      res.status(200).json({ 
        message: 'Message reçu avec succès',
        id: `contact_${Date.now()}`,
        estimatedResponse: '24 heures',
        note: 'Email de confirmation en cours de traitement'
      });
    }

  } catch (error) {
    console.error('❌ Error processing contact request:', error);
    res.status(500).json({ 
      message: 'Erreur lors du traitement du message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const testEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Test"
      },
      To: [
        {
          Email: "contact@precisio.ma",
          Name: "Test Recipient"
        }
      ],
      Subject: "🧪 Test Email - Mailjet Configuration",
      HTMLPart: `
        <h2>Test Email</h2>
        <p>This is a test email to verify Mailjet configuration.</p>
        <p>Sent at: ${new Date().toLocaleString('fr-FR')}</p>
        <p>Service: Mailjet API</p>
      `
    };

    await sendEmailWithMailjet(testEmail);
    res.status(200).json({ message: 'Test email sent successfully via Mailjet' });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ message: 'Test email failed', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mailjet: {
      configured: true,
      service: 'Mailjet API'
    }
  };

  // Test Mailjet connection
  try {
    await mailjetClient.get('user').request();
    health.mailjet.status = 'connected';
  } catch (error) {
    health.mailjet.status = 'error';
    health.mailjet.error = error.message;
  }

  res.status(200).json(health);
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email service configured with Mailjet API`);
  console.log(`🔍 Health check available at http://localhost:${PORT}/api/health`);
});