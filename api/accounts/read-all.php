<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: GET");
	header("Content-Type: application/json");
	
	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$username = !empty($_GET["username"]) ? $_GET["username"] : die();

		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($_GET["token"]) ? $_GET["token"] : die();
		if($helper->verifySession($token)) {
			if($helper->username == "admin") {
				$files = $helper->rglob("../data/users/*account.json");

				$accounts = array("accounts" => [], "usernames" => []);

				foreach($files as $file) {
					$content = json_decode(file_get_contents($file), true);
					array_push($accounts["accounts"], basename(dirname($file)));
					array_push($accounts["usernames"], $content["username"]);
				}

				echo json_encode($accounts);
			} else {
				echo json_encode(array("error" => "Only the admin can do that."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>