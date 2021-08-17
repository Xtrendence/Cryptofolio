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
			$current = json_decode(file_get_contents($helper->activityFile), true);

			header("Content-Type: text/csv");
			header("Pragma: no-cache");
			header("Expires: 0");
			header("Content-Disposition: attachment; filename=Activity-" . time() . ".csv");

			$output = fopen("php://output", "w");

			fputcsv($output, array("txID", "id", "symbol", "date", "type", "amount", "fee", "notes", "exchange", "pair", "price", "from", "to"));

			$txIDs = array_keys($current);

			for($i = 0; $i < count($txIDs); $i++) {
				fputcsv($output, array($txIDs[$i], $current[$txIDs[$i]]["id"], strtoupper($current[$txIDs[$i]]["symbol"]), $current[$txIDs[$i]]["date"], ucfirst($current[$txIDs[$i]]["type"]), $current[$txIDs[$i]]["amount"], $current[$txIDs[$i]]["fee"], $current[$txIDs[$i]]["notes"], $current[$txIDs[$i]]["exchange"], strtoupper($current[$txIDs[$i]]["pair"]), $current[$txIDs[$i]]["price"], $current[$txIDs[$i]]["from"], $current[$txIDs[$i]]["to"]));
			}

			fclose($output);
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>