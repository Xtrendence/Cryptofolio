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
			$helper->fetchCoins();
			
			$coins = json_decode(file_get_contents($helper->coinsFile), true);

			if((!empty($_GET["symbol"]) && !empty($_GET["id"])) || (empty($_GET["symbol"]) && empty($_GET["id"]))) {
				die();
			} elseif(!empty($_GET["symbol"])) {
				findBySymbol($coins, $_GET["symbol"], true);
			} elseif(!empty($_GET["id"])) {
				findByID($coins, $_GET["id"], true);
			}
		} else {
			echo json_encode(array("error" => "You need to be logged in to do that."));
		}
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
	
	function findBySymbol($coins, $symbol, $retry) {
		$matches = array();

		foreach($coins as $coin) {
			if(array_keys($coin)[0] == $symbol) {
				array_push($matches, $coin);
			}
		}

		if(count($matches) == 1) {
			echo json_encode(array("id" => $matches[0][$symbol], "symbol" => $symbol));
		} elseif(empty($matches)) {
			if($retry) {
				findByID($coins, $symbol, false);
			} else {
				echo json_encode(array("error" => "No coins were found with that symbol."));
			}
		} else {
			echo json_encode(array("matches" => $matches));
		}
	}

	function findByID($coins, $id, $retry) {
		$values = array_values($coins);
		$symbols = array();
		$ids = array();

		foreach($values as $value) {
			array_push($ids, $value[array_keys($value)[0]]);
			$symbols[$value[array_keys($value)[0]]] = array_keys($value)[0];
		}

		if(in_array($id, $ids)) {
			echo json_encode(array("id" => $id, "symbol" => $symbols[$id]));
		} else {
			if($retry) {
				findBySymbol($coins, $id, false);
			} else {
				echo json_encode(array("error" => "No coins were found with that symbol."));
			}
		}
	}
?>