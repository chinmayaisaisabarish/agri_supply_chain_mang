<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../db.php';

$orderId = $_POST['order_id'];

// ✅ Get order + crop info from DB
$order = $conn->query("SELECT o.*, c.crop_id, c.price as farmer_price, u.name as distributor_name FROM orders o 
  JOIN crops c ON o.crop_id = c.crop_id 
  JOIN users u ON o.distributor_address = u.wallet 
  WHERE o.order_id = $orderId")->fetch_assoc();

$farmer = $conn->query("SELECT f.*, u.name FROM farmers f 
  JOIN users u ON f.address = u.wallet 
  WHERE f.farmer_id = {$order['farmer_id']}")->fetch_assoc();

// ✅ Call Node.js to interact with blockchain
$cmd = "node ../../blockchain/logStep.js {$order['crop_id']} $orderId {$farmer['address']} \"{$farmer['name']}\" {$order['farmer_price']} {$order['distributor_address']} \"{$order['distributor_name']}\" {$order['price']} 0x0000000000000000000000000000000000000000 \"\" 0 \"Accepted\"";
exec($cmd);

// ✅ Update DB status
$conn->query("UPDATE orders SET status='Accepted' WHERE order_id=$orderId");

echo json_encode(["message" => "Order accepted and logged"]);
