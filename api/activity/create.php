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
			$id = !empty($_POST["id"]) ? $_POST["id"] : die();
			$symbol = !empty($_POST["symbol"]) ? $_POST["symbol"] : die();
			$date = !empty($_POST["date"]) ? $_POST["date"] : die();
			$type = !empty($_POST["type"]) ? $_POST["type"] : die();
			$amount = !empty($_POST["amount"]) ? $_POST["amount"] : die();
			$fee = !empty($_POST["fee"]) ? $_POST["fee"] : 0;
			$notes = !empty($_POST["notes"]) ? $_POST["notes"] : "-";

			if($helper->validDate($date)) {
				$activity = array("id" => $id, "symbol" => $symbol, "date" => $date, "time" => strtotime($date), "type" => $type, "amount" => $amount, "fee" => $fee, "notes" => $notes);
			
				if($type == "buy" || $type == "sell" || $type == "transfer") {
					if($type == "buy" || $type == "sell") {
						$exchange = !empty($_POST["exchange"]) ? $_POST["exchange"] : "-";
						$pair = !empty($_POST["pair"]) ? $_POST["pair"] : "-";
						$price = !empty($_POST["price"]) ? $_POST["price"] : 0;
					
						$activity["exchange"] = $exchange;
						$activity["pair"] = $pair;
						$activity["price"] = $price;
					} else if($type == "transfer") {
						$from = !empty($_POST["from"]) ? $_POST["from"] : "-";
						$to = !empty($_POST["to"]) ? $_POST["to"] : "-";

						$activity["from"] = $from;
						$activity["to"] = $to;
					}
				} else {
					echo json_encode(array("error" => "Invalid activity type."));
				}

				$current = json_decode(file_get_contents($helper->activityFile), true);

				$txID = time() . $helper->getRandomHex(8);
				while(array_key_exists($txID, $current)) {
					$txID = time() . $helper->getRandomHex(8);
				}
		
				$current[$txID] = $activity;

				if(time() - 1 > filemtime($helper->activityFile)) {
					$create = file_put_contents($helper->activityFile, json_encode($current));

					if($create) {
						echo json_encode(array("message" => "The activity has been recorded."));
					} else {
						echo json_encode(array("error" => "Activity couldn't be recorded."));
					}
				} else {
					echo json_encode(array("error" => "Duplicate request detected. Only the first was processed."));
				}
			} else {
				echo json_encode(array("error" => "Invalid date."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use POST."));
	}
?>