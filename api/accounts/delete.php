<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: DELETE");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "DELETE") {
		$input = json_decode(file_get_contents("php://input"), true);

		$username = !empty($input["username"]) ? $input["username"] : die();
		$account = !empty($input["account"]) ? $input["account"] : die();
		
		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($input["token"]) ? $input["token"] : die();
		if($helper->verifySession($token)) {
			if($helper->username == "admin") {
				if(trim(strtolower($account)) !== "admin") {
					$helper->rrmdir("../data/users/" . $account);

					$delete = !is_dir("../data/users/" . $account);

					if($delete) {
						echo json_encode(array("message" => "The account has been deleted."));
					} else {
						echo json_encode(array("error" => "Account couldn't be deleted."));
					}
				} else {
					echo json_encode(array("error" => "The admin account cannot be deleted."));
				}
			} else {
				echo json_encode(array("error" => "Only the admin can do that."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use DELETE."));
	}
?>