<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
$targetDir = "../uploads/";
$targetFile = $targetDir . basename($_FILES["image"]["name"]);
move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile);
echo json_encode(["imageUrl" => "http://localhost/backend/uploads/" . $_FILES["image"]["name"]]);
?>
