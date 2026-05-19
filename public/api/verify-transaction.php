<?php
header('Content-Type: application/json');

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$transaction_id = $_GET['transaction_id'] ?? null;

if (!$transaction_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing transaction_id']);
    exit;
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

$email = $transaction['customer']['email'] ?? $transaction['details']['customer']['email'] ?? null;

echo json_encode([
    'success' => true,
    'email' => $email,
    'status' => $status
]);
