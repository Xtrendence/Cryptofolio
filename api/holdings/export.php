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
			$current = json_decode(file_get_contents($helper->holdingsFile), true);

			header("Content-Type: text/csv");
			header("Pragma: no-cache");
			header("Expires: 0");
			header("Content-Disposition: attachment; filename=Holdings-" . time() . ".csv");

			$output = fopen("php://output", "w");

			fputcsv($output, array("id", "symbol", "amount"));

			$ids = array_keys($current);

			for($i = 0; $i < count($ids); $i++) {
				fputcsv($output, array($ids[$i], $current[$ids[$i]]["symbol"], $current[$ids[$i]]["amount"]));
			}

			fclose($output);
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>