<?php
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

// SMTP sending would go here...

echo json_encode(['success' => true]);
