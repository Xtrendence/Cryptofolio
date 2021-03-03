<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "DELETE") {
		$input = json_decode(file_get_contents("php://input"), true);

		$id = !empty($input["id"]) ? $input["id"] : die();

		$utils = require_once("../utils.php");
		$helper = new Utils();

		$current = json_decode(file_get_contents($helper->holdingsFile), true);
		unset($current[$id]);
		$delete = file_put_contents($helper->holdingsFile, json_encode($current));

		if($delete) {
			echo json_encode(array("message" => "The asset has been deleted."));
		} else {
			echo json_encode(array("error" => "Asset couldn't be deleted."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use DELETE."));
	}
?>