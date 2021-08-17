<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "POST") {
		if(empty($_POST)) {
			$json = file_get_contents("php://input");
			$_POST = json_decode($json, true);
		}

		$username = !empty($_POST["username"]) ? $_POST["username"] : die();
		
		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($_POST["token"]) ? $_POST["token"] : die();
		if($helper->verifySession($token)) {
			$rows = !empty($_POST["rows"]) ? $_POST["rows"] : die();

			$valid = true;
			
			$current = json_decode(file_get_contents($helper->holdingsFile), true);

			foreach($rows as $row) {
				$data = explode(",", $row);
				$id = !empty($data[0]) ? $data[0] : $valid = false;
				$symbol = !empty($data[1]) ? $data[1] : $valid = false;
				$amount = !empty($data[2]) ? $data[2] : $valid = false;	
		
				if(array_key_exists($id, $current)) {
					$current[$id]["amount"] += $amount;
				} else {
					$current[$id] = array("symbol" => $symbol, "amount" => $amount);
				}
			}

			if($valid) {
				$import = file_put_contents($helper->holdingsFile, json_encode($current));

				if($import) {
					echo json_encode(array("message" => "The assets have been created."));
				} else {
					echo json_encode(array("error" => "Assets couldn't be created."));
				}
			} else {
				echo json_encode(array("error" => "Invalid content format."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use POST."));
	}
?>