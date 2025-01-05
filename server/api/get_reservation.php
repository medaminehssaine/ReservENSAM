<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

$servername = "localhost";
$dbname = "reserv_ensam";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (!isset($_GET['id'])) {
        echo json_encode(['success' => false, 'message' => 'ID is required']);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT r.*, c.club_name, rm.name as room_name 
        FROM RESERVATION r 
        JOIN CLUB c ON r.club_id = c.user_id 
        JOIN ROOM rm ON r.room_id = rm.id 
        WHERE r.id = ?
    ");
    
    $stmt->execute([$_GET['id']]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($reservation) {
        // Ensure required_equipment is valid JSON
        if (!empty($reservation['required_equipment'])) {
            $equipment = json_decode($reservation['required_equipment']);
            if (json_last_error() === JSON_ERROR_NONE) {
                $reservation['required_equipment'] = json_encode($equipment);
            } else {
                $reservation['required_equipment'] = json_encode([
                    'tables' => 0,
                    'chaises' => 0,
                    'sonorisation' => 0,
                    'videoprojecteurs' => 0,
                    'autres' => ''
                ]);
            }
        }
        
        echo json_encode(['success' => true, 'reservation' => $reservation]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Reservation not found']);
    }

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
