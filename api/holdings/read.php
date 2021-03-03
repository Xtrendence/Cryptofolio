<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json");
	
	if($_SERVER["REQUEST_METHOD"] == "GET") {
		$utils = require_once("../utils.php");
		$helper = new Utils();

		echo file_get_contents($helper->holdingsFile);
	} else {
		echo json_encode(array("error" => "Wrong request method. Please use GET."));
	}
?>