<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: GET");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$username = !empty($_GET["username"]) ? $_GET["username"] : die();

		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$platforms = ["web", "app", "desktop"];

		$platform = !empty($_GET["platform"]) && in_array($_GET["platform"], $platforms) ? $_GET["platform"] : die();
		$token = !empty($_GET["token"]) ? $_GET["token"] : die();

		if($helper->verifySession($token)) {
			$helper->generateToken($platform);
			echo json_encode(array("message" => "You are now logged out."));
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>