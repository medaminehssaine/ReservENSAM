
<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$clubId = $data['club_id'];
$activityDescription = $data['activity_description'];
$eventType = $data['event_type'];
$internalAttendees = $data['internal_attendees'];
$externalAttendees = $data['external_attendees'];
$dates = $data['dates'];
$startTime = $data['start_time'];
$endTime = $data['end_time'];
$room = $data['room'];
$requiredEquipment = json_encode($data['required_equipment']);

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

foreach ($dates as $date) {
    $startDate = $date . ' ' . $startTime;
    $endDate = $date . ' ' . $endTime;

    $sql = "INSERT INTO RESERVATION (club_id, room_id, start_date, end_date, start_time, end_time, activity_description, required_equipment, internal_attendees, external_attendees, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_ADEAM')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iissssssis", $clubId, $room, $startDate, $endDate, $startTime, $endTime, $activityDescription, $requiredEquipment, $internalAttendees, $externalAttendees);
    $stmt->execute();
}

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit reservation']);
}

$stmt->close();
$conn->close();
?>