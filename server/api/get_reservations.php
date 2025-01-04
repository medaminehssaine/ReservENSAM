<?php
header('Content-Type: application/json');

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "SELECT r.*, c.club_name, ro.name as room_name, 
        a.username as adeam_approved_by_name, ad.username as admin_approved_by_name, r.event_type 
        FROM RESERVATION r 
        JOIN CLUB c ON r.club_id = c.user_id 
        JOIN ROOM ro ON r.room_id = ro.id 
        LEFT JOIN USER a ON r.adeam_approved_by = a.id 
        LEFT JOIN USER ad ON r.admin_approved_by = ad.id
        ORDER BY r.created_at"; // Sort reservations by created_at

$result = $conn->query($sql);

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

echo json_encode($reservations);

$conn->close();
?>