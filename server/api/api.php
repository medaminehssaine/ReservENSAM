<?php
header("Content-Type: application/json");

require 'config.php';

$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod === 'GET') {
    $stmt = $pdo->query("SELECT * FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} elseif ($requestMethod === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['name']) && isset($data['email'])) {
        $stmt = $pdo->prepare("INSERT INTO users (name, email) VALUES (:name, :email)");
        $stmt->execute(['name' => $data['name'], 'email' => $data['email']]);
        echo json_encode(['message' => 'User created successfully']);
    } else {
        echo json_encode(['message' => 'Invalid input']);
    }
} else {
    echo json_encode(['message' => 'Method not allowed']);
}
?>
