<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';

$sql = "SELECT c.*, f.farm_name FROM crops c
        JOIN farmers f ON c.farmer_id = f.farmer_id
        WHERE c.availability = 1 AND c.quantity > 0
        ORDER BY crop_id DESC";

$result = $conn->query($sql);
$crops = [];

while ($row = $result->fetch_assoc()) {
  $crops[] = $row;
}

echo json_encode($crops);
?>
