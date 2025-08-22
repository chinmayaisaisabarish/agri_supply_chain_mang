<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include '../db.php';

$orderId = $_POST['order_id'];
$newStatus = $_POST['status'];

$order = $conn->query("SELECT o.*, c.crop_id, c.price as distributor_price, u.name as farmer_name, u.wallet as farmer_address
                       FROM orders o
                       JOIN crops c ON o.crop_id = c.crop_id
                       JOIN users u ON c.farmer_id = u.id
                       WHERE o.order_id = $orderId")->fetch_assoc();

$distributor = $conn->query("SELECT * FROM users WHERE wallet = '{$order['distributor_address']}'")->fetch_assoc();

// Only if "Shipped" or "Delivered"
if ($newStatus == 'Shipped' || $newStatus == 'Delivered') {
  $retailerWallet = $newStatus === 'Delivered' ? $_POST['retailer_address'] : "0x0000000000000000000000000000000000000000";
  $retailerName = $newStatus === 'Delivered' ? $_POST['retailer_name'] : "";

  $cmd = "node ../../blockchain/logStep.js {$order['crop_id']} $orderId {$order['farmer_address']} \"{$order['farmer_name']}\" {$order['price']} {$order['distributor_address']} \"{$distributor['name']}\" {$order['distributor_price']} $retailerWallet \"$retailerName\" 0 \"$newStatus\"";
  exec($cmd);
}

// Update status in DB
$conn->query("UPDATE orders SET status='$newStatus' WHERE order_id=$orderId");

echo json_encode(["message" => "✅ Status updated & logged to blockchain"]);
