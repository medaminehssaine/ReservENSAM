
<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['user_id'];

$servername = "localhost";
$dbname = "reserv_ensam";
$dbusername = "root";
$dbpassword = "";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$sql = "SELECT contact_info FROM CLUB WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $club = $result->fetch_assoc();
    echo json_encode(['success' => true, 'contact_info' => $club['contact_info']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Contact info not found']);
}

$stmt->close();
$conn->close();
?>