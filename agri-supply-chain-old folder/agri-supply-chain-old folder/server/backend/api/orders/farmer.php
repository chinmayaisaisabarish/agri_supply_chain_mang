<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';
$wallet = $_GET['wallet'];

$sql = "SELECT o.*, c.crop_name, c.crop_id FROM orders o
        JOIN crops c ON o.crop_id = c.crop_id
        WHERE c.farmer_id = (SELECT farmer_id FROM farmers WHERE address = ?)
        ORDER BY o.order_id DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $wallet);
$stmt->execute();

$result = $stmt->get_result();
$orders = [];
while ($row = $result->fetch_assoc()) {
  $orders[] = $row;
}

echo json_encode($orders);
?>
