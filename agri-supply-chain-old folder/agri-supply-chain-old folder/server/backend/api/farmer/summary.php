<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../db.php';

// Get wallet from query parameters
$wallet = $_GET['wallet'] ?? '';  // Default to empty if not provided

if (empty($wallet)) {
    echo json_encode(["error" => "Wallet address is required."]);
    exit();
}

// Find farmer ID from wallet (prepared statement)
$sql1 = "SELECT farmer_id FROM farmers WHERE address = ?";
$stmt1 = $conn->prepare($sql1);
$stmt1->bind_param("s", $wallet);
$stmt1->execute();
$result1 = $stmt1->get_result();

// Check if farmer was found
if ($result1->num_rows === 0) {
    echo json_encode(["error" => "Farmer not found for this wallet."]);
    exit();
}

$row = $result1->fetch_assoc();
$farmerId = $row['farmer_id'];

// Summary queries - Use prepared statements to prevent SQL injection
// Total crops
$sql2 = "SELECT COUNT(*) as count FROM crops WHERE farmer_id = ?";
$stmt2 = $conn->prepare($sql2);
$stmt2->bind_param("i", $farmerId);
$stmt2->execute();
$result2 = $stmt2->get_result();
$totalCrops = $result2->fetch_assoc()['count'];

// Total orders
$sql3 = "SELECT COUNT(*) as count FROM orders WHERE crop_id IN (SELECT crop_id FROM crops WHERE farmer_id = ?)";
$stmt3 = $conn->prepare($sql3);
$stmt3->bind_param("i", $farmerId);
$stmt3->execute();
$result3 = $stmt3->get_result();
$totalOrders = $result3->fetch_assoc()['count'];

// Total earnings
$sql4 = "SELECT SUM(amount) as total FROM transactions WHERE farmer_address = ?";
$stmt4 = $conn->prepare($sql4);
$stmt4->bind_param("s", $wallet);
$stmt4->execute();
$result4 = $stmt4->get_result();
$earnings = $result4->fetch_assoc()['total'] ?? 0;

// Return the JSON response
echo json_encode([
    "crops" => $totalCrops,
    "orders" => $totalOrders,
    "earnings" => $earnings
]);
?>
