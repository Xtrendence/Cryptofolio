<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");

	if($_SERVER["REQUEST_METHOD"] == "POST") {
		if(empty($_POST)) {
			$json = file_get_contents("php://input");
			$_POST = json_decode($json, true);
		}
		
		$utils = require_once("../utils.php");
		$helper = new Utils();

		$helper->generateAccount();

		if(!empty($_POST["token"])) {
			if($helper->verifySession($_POST["token"])) {
				echo json_encode(array("message" => "You are now being logged in...", "valid" => true));
			} else {
				echo json_encode(array("error" => "Invalid token.", "valid" => false));
			}
		} else {
			$password = !empty($_POST["password"]) ? $_POST["password"] : die();

			if($helper->verifyPassword($password)) {
				$token = $helper->generateToken();
				echo json_encode(array("message" => "You are now being logged in...", "token" => $token, "valid" => true));
			} else {
				echo json_encode(array("error" => "Invalid password.", "valid" => false));
			}
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use POST."));
	}
?>