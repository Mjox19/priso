<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get form data
$input = json_decode(file_get_contents('php://input'), true);

// Determine form type and validate accordingly
$form_type = isset($input['firstName']) ? 'quote' : 'contact';

if ($form_type === 'quote') {
    // Quote form validation
    $required_fields = ['firstName', 'lastName', 'email', 'company', 'industry', 'projectType', 'description', 'gdprConsent'];
} else {
    // Contact form validation
    $required_fields = ['name', 'email', 'subject', 'message', 'gdprConsent'];
}

$missing_fields = [];

foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing required fields', 
        'missing' => $missing_fields,
        'received_data' => array_keys($input),
        'form_type' => $form_type
    ]);
    exit;
}

// Validate email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Prepare email content based on form type
$to = 'contact@precisio.ma';

if ($form_type === 'quote') {
    $subject = '🎯 Nouvelle demande de devis - ' . $input['company'];
    $message = generateQuoteEmail($input);
    $client_subject = '✅ Confirmation de votre demande de devis - IO Metric';
    $client_message = generateQuoteClientEmail($input);
    $data_file = 'data/quotes.json';
    $record_prefix = 'quote_';
} else {
    $subject = '📧 Nouveau message de contact - ' . $input['subject'];
    $message = generateContactEmail($input);
    $client_subject = '✅ Confirmation de réception de votre message - IO Metric';
    $client_message = generateContactClientEmail($input);
    $data_file = 'data/contacts.json';
    $record_prefix = 'contact_';
}

// Email headers
$headers = array(
    'MIME-Version' => '1.0',
    'Content-type' => 'text/html; charset=UTF-8',
    'From' => 'nonreply@precisio.ma',
    'Reply-To' => $input['email'],
    'X-Mailer' => 'PHP/' . phpversion()
);

// Convert headers array to string
$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= $key . ': ' . $value . "\r\n";
}

// Send email
$mail_sent = mail($to, $subject, $message, $headers_string);

if ($mail_sent) {
    // Send auto-reply to client    
    $client_headers = array(
        'MIME-Version' => '1.0',
        'Content-type' => 'text/html; charset=UTF-8',
        'From' => 'nonreply@precisio.ma',
        'X-Mailer' => 'PHP/' . phpversion()
    );
    
    $client_headers_string = '';
    foreach ($client_headers as $key => $value) {
        $client_headers_string .= $key . ': ' . $value . "\r\n";
    }
    
    mail($input['email'], $client_subject, $client_message, $client_headers_string);
    
    // Save to file for records
    $record = [
        'id' => $record_prefix . time() . '_' . substr(md5(uniqid()), 0, 8),
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $input
    ];
    
    if (!file_exists('data')) {
        mkdir('data', 0755, true);
    }
    
    $existing_records = [];
    if (file_exists($data_file)) {
        $existing_records = json_decode(file_get_contents($data_file), true) ?: [];
    }
    
    $existing_records[] = $record;
    file_put_contents($data_file, json_encode($existing_records, JSON_PRETTY_PRINT));
    
    $success_message = $form_type === 'quote' ? 'Demande de devis envoyée avec succès' : 'Message envoyé avec succès';
    
    echo json_encode([
        'message' => $success_message,
        'id' => $record['id'],
        'estimatedResponse' => '24 heures'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'envoi de l\'email']);
}

// Email template functions
function generateQuoteEmail($input) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e40af; }
            .value { margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎯 Nouvelle Demande de Devis</h1>
                <p>IO Metric - Precision</p>
            </div>
            <div class='content'>
                <h2>Informations du Client</h2>
                <div class='field'>
                    <span class='label'>Nom:</span>
                    <span class='value'>" . htmlspecialchars($input['firstName']) . " " . htmlspecialchars($input['lastName']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Email:</span>
                    <span class='value'>" . htmlspecialchars($input['email']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Téléphone:</span>
                    <span class='value'>" . htmlspecialchars($input['phone'] ?? 'Non renseigné') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Entreprise:</span>
                    <span class='value'>" . htmlspecialchars($input['company']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Secteur d'activité:</span>
                    <span class='value'>" . htmlspecialchars($input['industry']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Type de projet:</span>
                    <span class='value'>" . htmlspecialchars($input['projectType']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Description du projet:</span>
                    <div style='background: white; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px;'>
                        " . nl2br(htmlspecialchars($input['description'])) . "
                    </div>
                </div>
                <div class='field'>
                    <span class='label'>Date de soumission:</span>
                    <span class='value'>" . date('d/m/Y H:i:s') . "</span>
                </div>
            </div>
        </div>
    </body>
    </html>";
}

function generateContactEmail($input) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1e40af; }
            .value { margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>📧 Nouveau Message de Contact</h1>
                <p>IO Metric - Precision</p>
            </div>
            <div class='content'>
                <h2>Informations du Contact</h2>
                <div class='field'>
                    <span class='label'>Nom:</span>
                    <span class='value'>" . htmlspecialchars($input['name']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Email:</span>
                    <span class='value'>" . htmlspecialchars($input['email']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Entreprise:</span>
                    <span class='value'>" . htmlspecialchars($input['company'] ?? 'Non renseigné') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Sujet:</span>
                    <span class='value'>" . htmlspecialchars($input['subject']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Message:</span>
                    <div style='background: white; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px;'>
                        " . nl2br(htmlspecialchars($input['message'])) . "
                    </div>
                </div>
                <div class='field'>
                    <span class='label'>Date de soumission:</span>
                    <span class='value'>" . date('d/m/Y H:i:s') . "</span>
                </div>
            </div>
        </div>
    </body>
    </html>";
}

function generateQuoteClientEmail($input) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .cta { background: #059669; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>✅ Confirmation de réception</h1>
                <p>IO Metric - Precision</p>
            </div>
            <div class='content'>
                <h2>Bonjour " . htmlspecialchars($input['firstName']) . ",</h2>
                <p>Nous avons bien reçu votre demande de devis et nous vous remercions de votre intérêt pour nos solutions de monitoring industriel.</p>
                
                <div class='cta'>
                    <h3>⏱️ Délai de réponse: 24h maximum</h3>
                </div>
                
                <p><strong>Prochaines étapes:</strong></p>
                <ul>
                    <li>📋 Analyse de votre demande par notre équipe technique</li>
                    <li>📞 Prise de contact sous 24h</li>
                    <li>🎯 Proposition personnalisée adaptée à vos besoins</li>
                </ul>
                
                <p>Cordialement,<br>
                <strong>L'équipe IO Metric - Precision</strong></p>
            </div>
        </div>
    </body>
    </html>";
}

function generateContactClientEmail($input) {
    return "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .cta { background: #059669; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>✅ Confirmation de réception</h1>
                <p>IO Metric - Precision</p>
            </div>
            <div class='content'>
                <h2>Bonjour " . htmlspecialchars($input['name']) . ",</h2>
                <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
                
                <div class='cta'>
                    <h3>⏱️ Délai de réponse: 24h maximum</h3>
                </div>
                
                <p><strong>Votre message concernant:</strong> " . htmlspecialchars($input['subject']) . "</p>
                
                <p>Notre équipe va examiner votre demande et vous contacter dans les plus brefs délais.</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe IO Metric - Precision</strong></p>
            </div>
        </div>
    </body>
    </html>";
}
?>