<?php

header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "reserv_ensam";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Handle HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? explode("/", trim($_SERVER['PATH_INFO'], "/")) : [];
$resource = $path[0] ?? null;

switch ($method) {
    case 'POST':
        if ($resource === 'login') {
            loginUser($conn);
        } else {
            echo json_encode(["error" => "Invalid resource"]);
        }
        break;
    default:
        echo json_encode(["error" => "Invalid request method"]);
        break;
}

$conn->close();

// Functions
function loginUser($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['username'], $data['password'])) {
        echo json_encode(["error" => "Username and password are required"]);
        return;
    }

    $stmt = $conn->prepare("SELECT id, username, email, role FROM USER WHERE username = ? AND password = ?");
    $stmt->bind_param("ss", $data['username'], $data['password']);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode(["success" => true, "user" => $user]);
        } else {
            echo json_encode(["error" => "Invalid username or password"]);
        }
    } else {
        echo json_encode(["error" => $stmt->error]);
    }
}

?>
