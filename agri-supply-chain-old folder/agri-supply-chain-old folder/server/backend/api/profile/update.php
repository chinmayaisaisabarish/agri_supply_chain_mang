<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
include '../db.php';

$wallet = $_POST['wallet'];
$farm_name = $_POST['farm_name'];
$contact_info = $_POST['contact_info'];
$language = $_POST['language'];
$profile_image = null;

if (!empty($_FILES['profile_image']['name'])) {
  $imgPath = '../uploads/profile-pictures/' . basename($_FILES['profile_image']['name']);
  move_uploaded_file($_FILES['profile_image']['tmp_name'], $imgPath);
  $profile_image = basename($_FILES['profile_image']['name']);
}

$sql = "UPDATE farmers SET farm_name = ?, contact_info = ?, language = ?" .
       ($profile_image ? ", profile_image = ?" : "") .
       " WHERE address = ?";

if ($profile_image) {
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("sssss", $farm_name, $contact_info, $language, $profile_image, $wallet);
} else {
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ssss", $farm_name, $contact_info, $language, $wallet);
}

if ($stmt->execute()) {
  echo json_encode(["message" => "Profile updated"]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "DB update failed"]);
}
?>
