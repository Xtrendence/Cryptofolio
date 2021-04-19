<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: PUT");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "PUT") {
		$input = json_decode(file_get_contents("php://input"), true);

		$utils = require_once("../utils.php");
		$helper = new Utils();

		$token = !empty($input["token"]) ? $input["token"] : die();
		if($helper->verifySession($token)) {
			$txID = !empty($input["txID"]) ? $input["txID"] : die();
			$id = !empty($_POST["id"]) ? $_POST["id"] : die();
			$symbol = !empty($_POST["symbol"]) ? $_POST["symbol"] : die();
			$date = !empty($_POST["date"]) ? $_POST["date"] : die();
			$type = !empty($_POST["type"]) ? $_POST["type"] : die();
			$amount = !empty($_POST["amount"]) ? $_POST["amount"] : die();
			$fee = !empty($_POST["fee"]) ? $_POST["fee"] : die();
			$notes = !empty($_POST["notes"]) ? $_POST["notes"] : die();

			if($helper->validDate($date)) {
				$activity = array("id" => $id, "symbol" => $symbol, "date" => $date, "time" => strtotime($date), "type" => $type, "amount" => $amount, "fee" => $fee, "notes" => $notes);
			
				if($type == "buy" || $type == "sell" || $type == "transfer") {
					if($type == "buy" || $type == "sell") {
						$exchange = !empty($_POST["exchange"]) ? $_POST["exchange"] : die();
						$pair = !empty($_POST["pair"]) ? $_POST["pair"] : die();
						$price = !empty($_POST["price"]) ? $_POST["price"] : die();
					
						$activity["exchange"] = $exchange;
						$activity["pair"] = $pair;
						$activity["price"] = $price;
					} else if($type == "transfer") {
						$from = !empty($_POST["from"]) ? $_POST["from"] : die();
						$to = !empty($_POST["to"]) ? $_POST["to"] : die();

						$activity["from"] = $from;
						$activity["to"] = $to;
					}
				} else {
					echo json_encode(array("error" => "Invalid activity type."));
				}

				$current = json_decode(file_get_contents($helper->activityFile), true);
		
				if(array_key_exists($txID, $current)) {
					$current[$txID] = $activity;

					$update = file_put_contents($helper->activityFile, json_encode($current));

					if($update) {
						echo json_encode(array("message" => "The activity has been updated."));
					} else {
						echo json_encode(array("error" => "Activity couldn't be updated."));
					}
				} else {
					echo json_encode(array("error" => "Activity not found."));
				}
			} else {
				echo json_encode(array("error" => "Invalid date."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use PUT."));
	}
?>