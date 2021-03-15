<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "PUT") {
		$input = json_decode(file_get_contents("php://input"), true);

		$utils = require_once("../utils.php");
		$helper = new Utils();

		$token = !empty($input["token"]) ? $input["token"] : die();
		if($helper->verifySession($token)) {
			$id = !empty($input["id"]) ? $input["id"] : die();
			$amount = !empty($input["amount"]) ? $input["amount"] : die();

			$current = json_decode(file_get_contents($helper->holdingsFile), true);
		
			if(array_key_exists($id, $current)) {
				$current[$id]["amount"] = $amount;

				$update = file_put_contents($helper->holdingsFile, json_encode($current));

				if($update) {
					echo json_encode(array("message" => "The asset has been updated."));
				} else {
					echo json_encode(array("error" => "Asset couldn't be updated."));
				}
			} else {
				echo json_encode(array("error" => "Asset not found."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use PUT."));
	}
?>