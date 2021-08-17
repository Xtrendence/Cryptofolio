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
		$account = !empty($_POST["account"]) ? $_POST["account"] : die();
		
		$utils = require_once("../utils.php");
		$helper = new Utils($username);

		$token = !empty($_POST["token"]) ? $_POST["token"] : die();
		if($helper->verifySession($token)) {
			if($helper->username == "admin") {
				if($helper->validUsername($account)) {
					if(!is_dir("../data/users/")) {
						mkdir("../data/users/");
					}

					if(!$helper->userExists($account)) {
						mkdir("../data/users/" . $account);
					}

					$accountHelper = new Utils($account);

					$content = file_get_contents($accountHelper->accountFile);
					$current = json_decode($content, true);
					if(!file_exists($accountHelper->accountFile) || !array_key_exists("password", $current) || empty($content)) {
						$password = password_hash($account, PASSWORD_DEFAULT);
						$account = json_encode(array("username" => $account, "password" => $password, "web" => $accountHelper->generateToken("web"), "app" => $accountHelper->generateToken("app"), "desktop" => $accountHelper->generateToken("desktop")));
						file_put_contents($accountHelper->accountFile, $account);
					}

					if(empty(file_get_contents($accountHelper->settingsFile))) {
						$settings = json_encode(array("shareHoldings" => "disabled", "pin" => "0000", "css" => "", "refetchTime" => 86400));
						file_put_contents($accountHelper->settingsFile, $settings);
					}

					if(!file_exists($accountHelper->holdingsFile)) {
						file_put_contents($accountHelper->holdingsFile, "{}");
					}

					if(!file_exists($accountHelper->activityFile)) {
						file_put_contents($accountHelper->activityFile, "{}");
					}

					if(!file_exists($accountHelper->watchlistFile)) {
						file_put_contents($accountHelper->watchlistFile, "{}");
					}

					echo json_encode(array("message" => "The account has been created."));
				} else {
					echo json_encode(array("error" => "The username can only contain letters and numbers."));
				}
			} else {
				echo json_encode(array("error" => "Only the admin can do that."));
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use POST."));
	}
?>