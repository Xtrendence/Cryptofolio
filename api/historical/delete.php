<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: DELETE");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "DELETE") {
		$input = json_decode(file_get_contents("php://input"), true);

		$username = !empty($input["username"]) ? $input["username"] : die();
		
		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($input["token"]) ? $input["token"] : die();
		if($helper->verifySession($token)) {
			$delete = $helper->rrmdir("../data/historical/");

			if($delete) {
				echo json_encode(array("message" => "Historical data has been deleted."));
			} else {
				echo json_encode(array("error" => "Historical data couldn't be deleted."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use DELETE."));
	}
?>