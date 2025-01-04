<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = $data['id'];
$userId = $data['user_id'];

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Get reservation details
$reservationSql = "SELECT room_id, start_date, end_date FROM RESERVATION WHERE id = ? AND club_id = ?";
$reservationStmt = $conn->prepare($reservationSql);
$reservationStmt->bind_param("ii", $reservationId, $userId);
$reservationStmt->execute();
$reservationResult = $reservationStmt->get_result();
$reservation = $reservationResult->fetch_assoc();

if ($reservation) {
    // Delete room unavailability
    $unavailabilitySql = "DELETE FROM ROOM_UNAVAILABILITY WHERE room_id = ? AND start_date = ? AND end_date = ?";
    $unavailabilityStmt = $conn->prepare($unavailabilitySql);
    $unavailabilityStmt->bind_param("iss", $reservation['room_id'], $reservation['start_date'], $reservation['end_date']);
    $unavailabilityStmt->execute();
}

$sql = "DELETE FROM RESERVATION WHERE id = ? AND club_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $reservationId, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to cancel reservation']);
}

$stmt->close();
$conn->close();
?>