<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

header('Content-Type: application/json');

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load .env variables
$envPaths = [__DIR__ . '/../.env', __DIR__ . '/../../.env'];
$envFile = null;
foreach ($envPaths as $path) {
    if (file_exists($path)) {
        $envFile = $path;
        break;
    }
}

if ($envFile) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
        $_ENV[trim($name)] = trim($value);
    }
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$transaction_id = $data['transaction_id'] ?? null;

if (!$transaction_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing transaction_id']);
    exit;
}

$paddle_api_key = getenv('PADDLE_API_KEY') ?: $_ENV['PADDLE_API_KEY'] ?? '';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://sandbox-api.paddle.com/transactions/{$transaction_id}?include=customer");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer {$paddle_api_key}"
));

$result = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode !== 200) {
    http_response_code(400);
    echo json_encode(['error' => 'Failed to verify transaction']);
    exit;
}

$paddleData = json_decode($result, true);
$transaction = $paddleData['data'] ?? [];

$status = $transaction['status'] ?? '';
if (!in_array($status, ['completed', 'paid', 'ready'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Transaction is not completed']);
    exit;
}

$email = $transaction['customer']['email'] ?? $transaction['details']['customer']['email'] ?? 'customer@example.com';

// 2. Prepare JSON Payload
$licenseData = [
    'email' => $email,
    'txn_id' => $transaction_id,
    'date' => $transaction['created_at'] ?? gmdate("Y-m-d\TH:i:s\Z")
];

// 3. Cryptographic Signing (ECDSA)
$rawEnvVar = getenv('ECDSA_PRIVATE_KEY_B64') ?: $_ENV['ECDSA_PRIVATE_KEY_B64'] ?? getenv('ECDSA_PRIVATE_KEY') ?: $_ENV['ECDSA_PRIVATE_KEY'] ?? '';

// Format the key
$privateKeyStr = $rawEnvVar;
if (strpos($rawEnvVar, '-----BEGIN') !== false) {
    $privateKeyStr = str_replace('\n', "\n", $rawEnvVar);
} else {
    // If it's pure base64
    $decoded = base64_decode($rawEnvVar);
    if ($decoded) {
        $privateKeyStr = str_replace(['"', '\n'], ['', "\n"], $decoded);
    }
}

$privateKey = openssl_pkey_get_private($privateKeyStr);

$signature = '';
if ($privateKey) {
    $payloadString = json_encode($licenseData);
    openssl_sign($payloadString, $signature_raw, $privateKey, OPENSSL_ALGO_SHA256);
    $signature = bin2hex($signature_raw);
}

$licenseContent = json_encode([
    'data' => $licenseData,
    'signature' => $signature
], JSON_PRETTY_PRINT);

// 4. Send Email via PHPMailer
$smtpHost = getenv('SMTP_HOST') ?: $_ENV['SMTP_HOST'] ?? 'smtp.dreamhost.com';
$smtpPort = getenv('SMTP_PORT') ?: $_ENV['SMTP_PORT'] ?? 465;
$smtpUser = getenv('SMTP_USER') ?: $_ENV['SMTP_USER'] ?? 'support@flxks.com';
$smtpPassB64 = getenv('SMTP_PASS_B64') ?: $_ENV['SMTP_PASS_B64'] ?? '';
$smtpPass = $smtpPassB64 ? base64_decode($smtpPassB64) : (getenv('SMTP_PASS') ?: $_ENV['SMTP_PASS'] ?? '');

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = $smtpPort == 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $smtpPort;

    // Recipients
    $mail->setFrom($smtpUser, 'flxks Support');
    $mail->addAddress($email);

    // Attachments
    $mail->addStringAttachment($licenseContent, 'license.flxkskey', 'base64', 'application/json');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Your flxks License Key & Download Instructions';
    
    $mail->Body = '
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #6366f1;">Welcome to flxks!</h2>
        <p>Thank you for purchasing flxks. We are thrilled to have you on board.</p>
        <p>Attached to this email is your personal license key: <strong>license.flxkskey</strong>.</p>
        
        <h3>How to get started:</h3>
        <ol style="line-height: 1.6;">
            <li>Download the flxks application from our website.</li>
            <li>Install and launch the app on your device.</li>
            <li>When prompted, drag and drop the attached <code>license.flxkskey</code> file into the app, or select it through the activation menu.</li>
        </ol>
        
        <p>If you have any questions or run into issues, simply reply to this email.</p>
        
        <p>Enjoy your complete control over your media!</p>
        <p>— The flxks Team</p>
    </div>';

    $mail->AltBody = "Welcome to flxks!\n\nThank you for purchasing flxks. Attached to this email is your personal license key: license.flxkskey.\n\nHow to get started:\n1. Download the flxks application from our website.\n2. Install and launch the app.\n3. Import the attached license.flxkskey file to activate.\n\nEnjoy!\n— The flxks Team";

    $mail->send();
} catch (Exception $e) {
    error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send license email. Please contact support.']);
    exit;
}

echo json_encode(['success' => true]);
