<?php
// Simple server-side proxy to send Telegram messages
// Configure secrets in env.server.php (ignored by git)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'method_not_allowed']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) { $data = []; }
$payload = isset($data['payload']) ? $data['payload'] : $data;

// Load secrets
@include __DIR__ . '/env.server.php';
$token = defined('TELEGRAM_TOKEN') ? TELEGRAM_TOKEN : getenv('TELEGRAM_TOKEN');
$chatId = defined('TELEGRAM_CHAT_ID') ? TELEGRAM_CHAT_ID : getenv('TELEGRAM_CHAT_ID');

if (!$token || !$chatId) { http_response_code(500); echo json_encode(['error' => 'missing_config']); exit; }

// Build text
$lines = [];
foreach ($payload as $k => $v) { $lines[] = $k . ': ' . $v; }
$text = implode("\n", $lines);

$url = "https://api.telegram.org/bot{$token}/sendMessage";
$body = [
  'chat_id' => $chatId,
  'text' => $text,
  'disable_web_page_preview' => true
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
$result = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code(($code >= 200 && $code < 300) ? 200 : 500);
header('Content-Type: application/json');
echo $result ?: json_encode(['ok' => $code >= 200 && $code < 300]);

