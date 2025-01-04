<?php
header('Content-Type: application/json');

include_once 'db_connect.php';

// Get token from Authorization header
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

// Verify token and get user role
$sql = "SELECT u.role, u.id FROM TOKENS t 
        JOIN USER u ON t.user_id = u.id 
        WHERE t.token = ? AND t.expires_at > NOW()";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$user = $result->fetch_assoc();

// Get reservations based on role
switch($user['role']) {
    case 'CLUB':
        $sql = "SELECT r.*, u.username as club_name 
                FROM RESERVATION r 
                JOIN USER u ON r.club_id = u.id 
                WHERE r.club_id = ? AND r.deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user['id']);
        break;
    case 'ADEAM':
        $sql = "SELECT r.*, u.username as club_name 
                FROM RESERVATION r 
                JOIN USER u ON r.club_id = u.id 
                WHERE r.status = 'PENDING_ADEAM' AND r.deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        break;
    case 'ADMIN':
        $sql = "SELECT r.*, u.username as club_name 
                FROM RESERVATION r 
                JOIN USER u ON r.club_id = u.id 
                WHERE r.status = 'PENDING_ADMIN' AND r.deleted_at IS NULL";
        $stmt = $conn->prepare($sql);
        break;
}

$stmt->execute();
$reservations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode($reservations);
$conn->close();
?>