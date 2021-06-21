<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: GET");
	header("Content-Type: application/json");
	
	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$utils = require_once("../utils.php");
		$helper = new Utils();

		$token = !empty($_GET["token"]) ? $_GET["token"] : die();
		if($helper->verifySession($token)) {
			$id = !empty($_GET["id"]) ? $_GET["id"] : die();
			$currency = !empty($_GET["currency"]) ? $_GET["currency"] : die();
			$from = !empty($_GET["from"]) ? $_GET["from"] : die();
			$to = !empty($_GET["to"]) ? $_GET["to"] : die();
			
			echo $helper->fetchHistoricalData($id, $currency, $from, $to);
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>