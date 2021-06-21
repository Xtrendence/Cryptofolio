<?php
	ini_set("max_execution_time", 0);

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: GET");
	header("Content-Type: application/json");
	
	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$utils = require_once("../utils.php");
		$helper = new Utils();

		$token = !empty($_GET["token"]) ? $_GET["token"] : die();
		if($helper->verifySession($token)) {
			$ids = !empty($_GET["ids"]) ? explode(",", $_GET["ids"]) : die();
			$currency = !empty($_GET["currency"]) ? $_GET["currency"] : die();
			$from = !empty($_GET["from"]) ? $_GET["from"] : die();
			$to = !empty($_GET["to"]) ? $_GET["to"] : die();

			$data = array();
			for($i = 0; $i < count($ids); $i++) {
				$data[$ids[$i]] = $helper->fetchHistoricalData($ids[$i], $currency, $from, $to);
				if($i !== count($ids) - 1 && !$helper->historicalDataExists($ids[$i + 1])) {
					// 30 requests per minute, 2 second interval between each request.
					sleep(2);
				}
			}

			echo json_encode($data);
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>