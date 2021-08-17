<?php
	ini_set("max_execution_time", 0);

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: GET");
	header("Content-Type: application/json");
	
	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$username = !empty($_GET["username"]) ? $_GET["username"] : die();

		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($_GET["token"]) ? $_GET["token"] : die();
		if($helper->verifySession($token)) {
			$ids = !empty($_GET["ids"]) ? explode(",", $_GET["ids"]) : die();
			$currency = !empty($_GET["currency"]) ? $_GET["currency"] : die();
			$from = !empty($_GET["from"]) ? $_GET["from"] : die();
			$to = !empty($_GET["to"]) ? $_GET["to"] : die();

			$data = array();
			for($i = 0; $i < count($ids); $i++) {
				$data[$ids[$i]] = $helper->fetchHistoricalData($ids[$i], $currency, $from, $to);
				if($i !== count($ids) - 1 && !$helper->historicalDataExists($ids[$i + 1], $currency)) {
					// 30 requests per minute, 2 second interval between each request.
					sleep(2);
				}
			}

			if(!empty($_GET["background"]) && $_GET["background"] == "true") {
				echo json_encode(array("message" => "Fetched historical data."));
			} else {
				echo json_encode($data);
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>