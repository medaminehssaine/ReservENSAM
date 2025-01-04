<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = $data['id'];
$reason = $data['reason'];
$userId = $data['user_id']; // Assuming user_id is passed in the request
$userRole = $data['user_role']; // Assuming user_role is passed in the request

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

if ($userRole == 'ADEAM') {
    $sql = "UPDATE RESERVATION SET status = 'REJECTED', rejection_reason = ?, adeam_approved_by = ? WHERE id = ?";
} else if ($userRole == 'ADMIN') {
    $sql = "UPDATE RESERVATION SET status = 'REJECTED', rejection_reason = ?, admin_approved_by = ? WHERE id = ?";
} else {
    die(json_encode(['error' => 'Invalid user role']));
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("sii", $reason, $userId, $reservationId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to reject reservation']);
}

$stmt->close();
$conn->close();
?>