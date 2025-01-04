<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = $data['id'];
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

// Get reservation details
$reservationSql = "SELECT room_id, start_date, end_date FROM RESERVATION WHERE id = ?";
$reservationStmt = $conn->prepare($reservationSql);
$reservationStmt->bind_param("i", $reservationId);
$reservationStmt->execute();
$reservationResult = $reservationStmt->get_result();
$reservation = $reservationResult->fetch_assoc();

if ($reservation) {
    // Check room availability
    $availabilitySql = "SELECT * FROM ROOM_UNAVAILABILITY WHERE room_id = ? AND ((start_date < ? AND end_date > ?) OR (start_date < ? AND end_date > ?))";
    $availabilityStmt = $conn->prepare($availabilitySql);
    $availabilityStmt->bind_param("issss", $reservation['room_id'], $reservation['end_date'], $reservation['start_date'], $reservation['end_date'], $reservation['start_date']);
    $availabilityStmt->execute();
    $availabilityResult = $availabilityStmt->get_result();

    if ($availabilityResult->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Room is unavailable for the selected time interval']);
        $availabilityStmt->close();
        $conn->close();
        exit;
    }

    if ($userRole == 'ADMIN') {
        // Update room unavailability
        $unavailabilitySql = "INSERT INTO ROOM_UNAVAILABILITY (room_id, start_date, end_date, reason, created_by) VALUES (?, ?, ?, 'Reservation', ?)";
        $unavailabilityStmt = $conn->prepare($unavailabilitySql);
        $unavailabilityStmt->bind_param("issi", $reservation['room_id'], $reservation['start_date'], $reservation['end_date'], $userId);
        $unavailabilityStmt->execute();
    }
}

if ($userRole == 'ADEAM') {
    $sql = "UPDATE RESERVATION SET status = 'PENDING_ADMIN', adeam_approved_by = ? WHERE id = ?";
} else if ($userRole == 'ADMIN') {
    $sql = "UPDATE RESERVATION SET status = 'APPROVED', admin_approved_by = ? WHERE id = ?";
} else {
    die(json_encode(['error' => 'Invalid user role']));
}

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $userId, $reservationId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to approve reservation']);
}

$stmt->close();
$conn->close();
?>