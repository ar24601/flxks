<?php
// Load environment variables
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
            $_ENV[trim($name)] = trim($value);
        }
    }
}

$secret = $_SERVER['DOWNLOAD_SECRET'] ?? $_ENV['DOWNLOAD_SECRET'] ?? getenv('DOWNLOAD_SECRET') ?: 'flxks_fallback_secret_key_123';

$expires = $_GET['expires'] ?? 0;
$signature = $_GET['signature'] ?? '';
$fileName = 'flxks-app.dmg';

// 1. Verify Expiration
if (time() > $expires) {
    http_response_code(403);
    die("This download link has expired. Please return to the homepage and click download again.");
}

// 2. Verify Signature
$expectedSignature = hash_hmac('sha256', $fileName . '|' . $expires, $secret);
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(403);
    die("Invalid or tampered download link.");
}

// 3. Serve the File
// Look for the real file one level above public_html
// __DIR__ is public_html/api. So __DIR__/../../ is /home/u696579458/domains/flxks.com/
$realFilePath = __DIR__ . '/../../' . $fileName;

if (!file_exists($realFilePath)) {
    http_response_code(404);
    die("The software update is currently being uploaded to the server. Please try again in 5 minutes.");
}

// Stream the file directly to the browser
header('Content-Description: File Transfer');
header('Content-Type: application/x-apple-diskimage');
header('Content-Disposition: attachment; filename="flxks-mac.dmg"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($realFilePath));

// Clear output buffer and stream the file securely
if (ob_get_level()) {
    ob_end_clean();
}
readfile($realFilePath);
exit;
