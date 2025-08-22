<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';
$wallet = $_GET['wallet'];

$sql = "SELECT farm_name, contact_info, language FROM farmers WHERE address = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $wallet);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

echo json_encode($data);
?>
