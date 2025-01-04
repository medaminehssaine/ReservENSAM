
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