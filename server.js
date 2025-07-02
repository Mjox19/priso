const express = require('express');
const mailjet = require('node-mailjet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Storage configuration
const STORAGE_DIR = path.join(__dirname, 'data');
const QUOTES_FILE = path.join(STORAGE_DIR, 'quotes.json');
const CONTACTS_FILE = path.join(STORAGE_DIR, 'contacts.json');

// Initialize storage
async function initializeStorage() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    
    // Initialize quotes file if it doesn't exist
    try {
      await fs.access(QUOTES_FILE);
    } catch {
      await fs.writeFile(QUOTES_FILE, JSON.stringify([], null, 2));
      console.log('📁 Created quotes storage file');
    }
    
    // Initialize contacts file if it doesn't exist
    try {
      await fs.access(CONTACTS_FILE);
    } catch {
      await fs.writeFile(CONTACTS_FILE, JSON.stringify([], null, 2));
      console.log('📁 Created contacts storage file');
    }
    
    console.log('✅ Storage initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
  }
}

// Storage functions
async function saveQuote(quoteData) {
  try {
    const quotes = await loadQuotes();
    const newQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...quoteData,
      savedAt: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2));
    console.log(`💾 Quote saved with ID: ${newQuote.id}`);
    return newQuote;
  } catch (error) {
    console.error('❌ Failed to save quote:', error);
    throw error;
  }
}

async function saveContact(contactData) {
  try {
    const contacts = await loadContacts();
    const newContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...contactData,
      savedAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    console.log(`💾 Contact saved with ID: ${newContact.id}`);
    return newContact;
  } catch (error) {
    console.error('❌ Failed to save contact:', error);
    throw error;
  }
}

async function loadQuotes() {
  try {
    const data = await fs.readFile(QUOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to load quotes:', error);
    return [];
  }
}

async function loadContacts() {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to load contacts:', error);
    return [];
  }
}

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

// Initialize connection verification and storage
initializeStorage();
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
            <span class="label">ID de la demande:</span>
            <span class="value">${data.id || 'N/A'}</span>
          </div>
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
            <span class="label">ID du message:</span>
            <span class="value">${data.id || 'N/A'}</span>
          </div>
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

    // Save quote to storage first
    let savedQuote;
    try {
      savedQuote = await saveQuote(quoteData);
      console.log(`💾 Quote saved successfully: ${savedQuote.id}`);
    } catch (saveError) {
      console.error('❌ Failed to save quote:', saveError);
      // Continue with email sending even if save fails
      savedQuote = { id: `quote_${Date.now()}`, ...quoteData };
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
      Subject: `🎯 Nouvelle demande de devis - ${savedQuote.company}`,
      HTMLPart: getQuoteEmailTemplate(savedQuote)
    };

    // Auto-reply to client
    const clientEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: savedQuote.email,
          Name: `${savedQuote.firstName} ${savedQuote.lastName}`
        }
      ],
      Subject: "✅ Confirmation de votre demande de devis - IO Metric",
      HTMLPart: getAutoReplyTemplate(savedQuote.firstName, 'quote')
    };

    // Send both emails
    try {
      await Promise.all([
        sendEmailWithMailjet(companyEmail),
        sendEmailWithMailjet(clientEmail)
      ]);

      console.log(`✅ Quote emails sent successfully for ${savedQuote.company}`);

      res.status(200).json({ 
        message: 'Demande de devis envoyée avec succès',
        id: savedQuote.id,
        estimatedResponse: '24 heures'
      });
    } catch (emailError) {
      console.error('❌ Failed to send emails after retries:', emailError.message);
      
      // Still return success to user but log the email failure
      res.status(200).json({ 
        message: 'Demande de devis reçue avec succès',
        id: savedQuote.id,
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

    // Save contact to storage first
    let savedContact;
    try {
      savedContact = await saveContact(contactData);
      console.log(`💾 Contact saved successfully: ${savedContact.id}`);
    } catch (saveError) {
      console.error('❌ Failed to save contact:', saveError);
      // Continue with email sending even if save fails
      savedContact = { id: `contact_${Date.now()}`, ...contactData };
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
      Subject: `📧 Nouveau message de contact - ${savedContact.subject}`,
      HTMLPart: getContactEmailTemplate(savedContact)
    };

    // Auto-reply to client
    const clientEmail = {
      From: {
        Email: "nonreply@precisio.ma",
        Name: "IO Metric - Precision"
      },
      To: [
        {
          Email: savedContact.email,
          Name: savedContact.name
        }
      ],
      Subject: "✅ Confirmation de votre message - IO Metric",
      HTMLPart: getAutoReplyTemplate(savedContact.name, 'contact')
    };

    // Send both emails
    try {
      await Promise.all([
        sendEmailWithMailjet(companyEmail),
        sendEmailWithMailjet(clientEmail)
      ]);

      console.log(`✅ Contact emails sent successfully from ${savedContact.email}`);

      res.status(200).json({ 
        message: 'Message envoyé avec succès',
        id: savedContact.id,
        estimatedResponse: '24 heures'
      });
    } catch (emailError) {
      console.error('❌ Failed to send emails after retries:', emailError.message);
      
      // Still return success to user but log the email failure
      res.status(200).json({ 
        message: 'Message reçu avec succès',
        id: savedContact.id,
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

// Admin endpoints to view stored data
app.get('/api/admin/quotes', async (req, res) => {
  try {
    const quotes = await loadQuotes();
    res.status(200).json({
      total: quotes.length,
      quotes: quotes.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    });
  } catch (error) {
    console.error('❌ Error loading quotes:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des devis' });
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    const contacts = await loadContacts();
    res.status(200).json({
      total: contacts.length,
      contacts: contacts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    });
  } catch (error) {
    console.error('❌ Error loading contacts:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des contacts' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const quotes = await loadQuotes();
    const contacts = await loadContacts();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: {
        quotes: quotes.length,
        contacts: contacts.length,
        all: quotes.length + contacts.length
      },
      today: {
        quotes: quotes.filter(q => new Date(q.submittedAt) >= today).length,
        contacts: contacts.filter(c => new Date(c.submittedAt) >= today).length
      },
      thisWeek: {
        quotes: quotes.filter(q => new Date(q.submittedAt) >= thisWeek).length,
        contacts: contacts.filter(c => new Date(c.submittedAt) >= thisWeek).length
      },
      thisMonth: {
        quotes: quotes.filter(q => new Date(q.submittedAt) >= thisMonth).length,
        contacts: contacts.filter(c => new Date(c.submittedAt) >= thisMonth).length
      }
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error generating stats:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
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
    },
    storage: {
      directory: STORAGE_DIR,
      quotesFile: QUOTES_FILE,
      contactsFile: CONTACTS_FILE
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

  // Test storage
  try {
    await fs.access(STORAGE_DIR);
    await fs.access(QUOTES_FILE);
    await fs.access(CONTACTS_FILE);
    health.storage.status = 'accessible';
  } catch (error) {
    health.storage.status = 'error';
    health.storage.error = error.message;
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
  console.log(`💾 Data storage: ${STORAGE_DIR}`);
  console.log(`🔍 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`📊 Admin endpoints:`);
  console.log(`   - GET /api/admin/quotes - View all quotes`);
  console.log(`   - GET /api/admin/contacts - View all contacts`);
  console.log(`   - GET /api/admin/stats - View statistics`);
});