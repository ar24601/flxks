<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

// Allow showing errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/plain');

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
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . '=' . trim($value));
            $_ENV[trim($name)] = trim($value);
        }
    }
}

$smtpHost = getenv('MTP_HOST') ?: $_ENV['MTP_HOST'] ?? 'smtp.dreamhost.com';
$smtpPort = getenv('MTP_PORT') ?: $_ENV['MTP_PORT'] ?? 465;
$smtpUser = getenv('MTP_USER') ?: $_ENV['MTP_USER'] ?? 'support@flxks.com';
$smtpPassB64 = getenv('MTP_PASS_B64') ?: $_ENV['MTP_PASS_B64'] ?? '';
$smtpPass = $smtpPassB64 ? base64_decode($smtpPassB64) : (getenv('MTP_PASS') ?: $_ENV['MTP_PASS'] ?? '');

if (!$smtpPass) {
    echo "ERROR: No SMTP password found. Please ensure MTP_PASS_B64 or MTP_PASS is set in your .env file.\n";
    exit;
}

echo "Testing Hostinger PHP SMTP Connection...\n";
echo "Host: {$smtpHost}\n";
echo "Port: {$smtpPort}\n";
echo "User: {$smtpUser}\n";
echo "----------------------------------------\n\n";

$mail = new PHPMailer(true);

try {
    // Enable verbose debug output to print to the screen
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->SMTPSecure = $smtpPort == 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $smtpPort;

    // Recipients
    $mail->setFrom($smtpUser, 'flxks Support');
    $mail->addAddress($smtpUser); // Send to self

    // Content
    $mail->isHTML(false);
    $mail->Subject = 'Hostinger PHP SMTP Test';
    $mail->Body    = 'This is a test email sent from the Hostinger PHP backend using PHPMailer.';

    $mail->send();
    echo "\n----------------------------------------\n";
    echo "SUCCESS: Email has been sent to {$smtpUser}!\n";
} catch (Exception $e) {
    echo "\n----------------------------------------\n";
    echo "FAILED: Message could not be sent.\n";
    echo "Mailer Error: {$mail->ErrorInfo}\n";
}
?>
