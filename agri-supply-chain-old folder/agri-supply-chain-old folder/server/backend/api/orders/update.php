<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';
$data = json_decode(file_get_contents("php://input"));

$orderId = $data->orderId;
$action = $data->action;

if ($action === 'accept') {
  $sql1 = "UPDATE orders SET status = 'Accepted' WHERE order_id = ?";
  $stmt1 = $conn->prepare($sql1);
  $stmt1->bind_param("i", $orderId);
  $stmt1->execute();

  // Update crop quantity
  $sql2 = "UPDATE crops SET quantity = quantity - ? WHERE crop_id = ?";
  $stmt2 = $conn->prepare($sql2);
  $stmt2->bind_param("ii", $data->soldQty, $data->cropId);
  $stmt2->execute();

  echo json_encode(["message" => "✅ Order accepted & updated"]);
} elseif ($action === 'reject') {
  $sql = "UPDATE orders SET status = 'Rejected' WHERE order_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("i", $orderId);
  $stmt->execute();
  echo json_encode(["message" => "❌ Order rejected"]);
} else {
  http_response_code(400);
  echo json_encode(["error" => "Invalid action"]);
}
?>
