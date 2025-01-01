<?php
$url = 'http://localhost/ReservENSAM/server/api/api.php';
$data = [
    'name' => 'John Doe',
    'email' => 'john@example.com'
];

// Convert data to JSON format
$jsonData = json_encode($data);

// Initialize cURL session
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_POST, 1); // Set method to POST
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']); // Set header for JSON
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData); // Set POST data

// Execute the cURL request
$response = curl_exec($ch);

// Check for errors
if(curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
} else {
    // Decode JSON response
    $responseData = json_decode($response, true);
    echo $responseData['message'];
}

// Close cURL session
curl_close($ch);
?>
