<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = $data['reservationId'];
$role = $data['role'];
$reason = $data['reason'];
$token = $data['token'];

include_once 'db_connect.php';

// Verify token and role
$tokenSql = "SELECT u.role, u.id FROM TOKENS t JOIN USER u ON t.user_id = u.id WHERE t.token = ? AND t.expires_at > NOW()";
$stmt = $conn->prepare($tokenSql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

$userData = $result->fetch_assoc();
if ($userData['role'] !== $role) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Update reservation status
$status = 'REJECTED';
$sql = "UPDATE RESERVATION SET status = ?, rejection_reason = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssi", $status, $reason, $reservationId);
$success = $stmt->execute();

echo json_encode(['success' => $success]);
$conn->close();
?>