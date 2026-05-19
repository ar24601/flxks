<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Load environment variables (mimic logic from generate-license.php)
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

// Use a secret for signing URLs. Fallback to a hardcoded string if not set, 
// though setting it in .env is much safer.
$secret = $_SERVER['DOWNLOAD_SECRET'] ?? $_ENV['DOWNLOAD_SECRET'] ?? getenv('DOWNLOAD_SECRET') ?: 'flxks_fallback_secret_key_123';

$expires = time() + 60; // Link valid for 60 seconds
$fileName = 'flxks-app.dmg'; // Identifier
$signature = hash_hmac('sha256', $fileName . '|' . $expires, $secret);

echo json_encode([
    'success' => true,
    'url' => "/api/download.php?expires={$expires}&signature={$signature}"
]);
