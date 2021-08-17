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
			$id = !empty($input["id"]) ? $input["id"] : die();

			$current = json_decode(file_get_contents($helper->watchlistFile), true);
			unset($current[$id]);
			$delete = file_put_contents($helper->watchlistFile, json_encode($current));

			if($delete) {
				echo json_encode(array("message" => "Asset removed from watchlist."));
			} else {
				echo json_encode(array("error" => "Asset couldn't be removed from watchlist."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use DELETE."));
	}
?>