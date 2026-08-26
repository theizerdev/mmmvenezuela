<?php

return [
    'api_url' => env('WHATSAPP_API_URL', 'http://localhost:3000'),
    'api_key' => env('WHATSAPP_API_KEY', 'test-api-key-vargas-centro'),
    'jwt_secret' => env('WHATSAPP_JWT_SECRET', 'test-api-key-vargas-centro'),
    'timeout' => (int) env('WHATSAPP_TIMEOUT', 30),
];