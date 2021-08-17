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
			
			$current = json_decode(file_get_contents($helper->activityFile), true);

			foreach($rows as $row) {
				$data = explode(",", $row);
				$txID = !empty($data[0]) ? $data[0] : $valid = false;

				if($txID == "-") {
					$txID = time() . $helper->getRandomHex(8);
					while(array_key_exists($txID, $current)) {
						$txID = time() . $helper->getRandomHex(8);
					}
				}

				$id = !empty($data[1]) ? $data[1] : $valid = false;
				$symbol = !empty($data[2]) ? $data[2] : $valid = false;
				$date = !empty($data[3]) ? str_replace("'", "", str_replace('"', "", $data[3])) : $valid = false;
				$type = !empty($data[4]) ? strtolower($data[4]) : $valid = false;
				$amount = !empty($data[5]) ? $data[5] : $valid = false;
				$fee = !empty($data[6]) ? $data[6] : 0;
				$notes = !empty($data[7]) ? str_replace('"', "", $data[7]) : "-";

				if($helper->validDate($date)) {
					$activity = array("id" => $id, "symbol" => $symbol, "date" => $date, "time" => strtotime($date), "type" => $type, "amount" => $amount, "fee" => $fee, "notes" => $notes);
			
					if($type == "buy" || $type == "sell" || $type == "transfer") {
						if($type == "buy" || $type == "sell") {
							$exchange = !empty($data[8]) ? str_replace('"', "", $data[8]) : "-";
							$pair = !empty($data[9]) ? str_replace('"', "", $data[9]) : "-";
							$price = !empty($data[10]) ? $data[10] : 0;
					
							$activity["exchange"] = $exchange;
							$activity["pair"] = $pair;
							$activity["price"] = $price;
						} else if($type == "transfer") {
							$from = !empty($data[11]) ? str_replace('"', "", $data[11]) : "-";
							$to = !empty($data[12]) ? str_replace('"', "", $data[12]) : "-";

							$activity["from"] = $from;
							$activity["to"] = $to;
						}

						$current[$txID] = $activity;
					} else {
						echo json_encode(array("error" => "Invalid activity type."));
						die();
					}
				} else {
					$valid = false;
					echo json_encode(array("error" => "Invalid date."));
					die();
				}
			}

			if($valid) {
				$import = file_put_contents($helper->activityFile, json_encode($current));

				if($import) {
					echo json_encode(array("message" => "The activities have been recorded."));
				} else {
					echo json_encode(array("error" => "Activities couldn't be recorded."));
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