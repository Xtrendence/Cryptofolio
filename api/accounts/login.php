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

		$helper->fetchCoins();

		if(!empty($_POST["token"])) {
			if($helper->verifySession($_POST["token"])) {
				echo json_encode(array("message" => "You are now being logged in...", "valid" => true, "username" => $helper->username));
			} else {
				echo json_encode(array("error" => "Invalid token.", "valid" => false));
			}
		} else {
			$platforms = ["web", "app", "desktop"];

			$platform = !empty($_GET["platform"]) && in_array($_GET["platform"], $platforms) ? $_GET["platform"] : die();
			$password = !empty($_POST["password"]) ? $_POST["password"] : die();

			if($helper->verifyPassword($password)) {
				$token = $helper->generateToken($platform);
				echo json_encode(array("message" => "You are now being logged in...", "token" => $token, "valid" => true, "username" => $helper->username));
			} else {
				echo json_encode(array("error" => "Invalid password.", "valid" => false));
			}
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use POST."));
	}
?>