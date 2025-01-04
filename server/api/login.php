<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'];
$password = $data['password'];

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "SELECT * FROM USER WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($password === $user['password']) {
        // Generate token
        $token = bin2hex(random_bytes(16));
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 month'));

        // Store token in database
        $sql = "INSERT INTO TOKENS (user_id, token, expires_at) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $user['id'], $token, $expires_at);
        $stmt->execute();

        echo json_encode(['success' => true, 'token' => $token, 'role' => $user['role']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>