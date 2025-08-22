<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';

$data = json_decode(file_get_contents("php://input"));

$sql = "INSERT INTO crops (farmer_id, crop_name, quantity, price, harvest_date, expiry_date, image_url, availability)
        VALUES (
          (SELECT farmer_id FROM farmers WHERE address = ?),
          ?, ?, ?, ?, ?, ?, 1
        )";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssiddss", $data->wallet, $data->cropName, $data->quantity, $data->price, $data->harvestDate, $data->expiryDate, $data->imageUrl);

if ($stmt->execute()) {
  echo json_encode(["message" => "Crop saved"]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "DB Error"]);
}
?>
