<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$token = $data['token'];

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "SELECT t.*, u.role FROM TOKENS t JOIN USER u ON t.user_id = u.id WHERE t.token = ? AND t.expires_at > NOW()";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $tokenData = $result->fetch_assoc();
    echo json_encode(['success' => true, 'role' => $tokenData['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
}

$stmt->close();
$conn->close();
?>