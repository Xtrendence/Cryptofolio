<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: PUT");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "PUT") {
		$input = json_decode(file_get_contents("php://input"), true);

		$username = !empty($input["username"]) ? $input["username"] : die();

		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($input["token"]) ? $input["token"] : die();
		if($helper->verifySession($token)) {
			$key = !empty($input["key"]) ? $input["key"] : die();
			$value = isset($input["value"]) ? $input["value"] : die();

			$current = json_decode(file_get_contents($helper->settingsFile), true);
		
			if(array_key_exists($key, $current)) {
				$current[$key] = $value;

				$update = file_put_contents($helper->settingsFile, json_encode($current));

				if($update) {
					echo json_encode(array("message" => "The setting has been updated."));
				} else {
					echo json_encode(array("error" => "Setting couldn't be updated."));
				}
			} else {
				echo json_encode(array("error" => "Setting not found."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use PUT."));
	}
?>