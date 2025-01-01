<?php
$host = 'localhost';
$username = 'root'; // Default username for XAMPP
$password = '';     // Default password for XAMPP

try {
    // Connect to MySQL
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Database name
    $dbname = 'reservensam';

    // SQL query to create database if it doesn't exist
    $createDbQuery = "CREATE DATABASE IF NOT EXISTS $dbname";
    $pdo->exec($createDbQuery);

    // Select the database
    $pdo->exec("USE $dbname");

    // Table creation query
    $createTableQuery = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
    )";

    $pdo->exec($createTableQuery);

    echo "Database '$dbname' created successfully and users table is set up.";

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
