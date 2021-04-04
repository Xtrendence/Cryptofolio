<?php
	class Utils {
		public $accountFile = "../data/account.json";
		public $holdingsFile = "../data/holdings.json";
		public $transactionsFile = "../data/transactions.json";
		public $settingsFile = "../data/settings.json";

		function verifyPassword($password) {
			$account = json_decode(file_get_contents($this->accountFile), true);
			$hash = $account["password"];
			return password_verify($password, $hash);
		}

		function verifySession($token) {
			$platform = explode("$", $token)[0];
			$account = json_decode(file_get_contents($this->accountFile), true);
			$valid = $account[$platform];
			if($token == $valid) {
				return true;
			}
			return false;
		}

		function verifyPIN($pin) {
			$settings = json_decode(file_get_contents($this->settingsFile), true);
			$valid = $settings["pin"];
			if($settings["shareHoldings"] == "enabled" && $pin == $valid) {
				return true;
			}
			return false;
		}

		function generateAccount() {
			$content = file_get_contents($this->accountFile);
			$current = json_decode($content, true);
			if(!array_key_exists("password", $current) || empty($content)) {
				$password = password_hash("admin", PASSWORD_DEFAULT);
				$account = json_encode(array("password" => $password, "web" => $this->generateToken("web"), "app" => $this->generateToken("app"), "desktop" => $this->generateToken("desktop")));
				file_put_contents($this->accountFile, $account);
			}

			if(empty(file_get_contents($this->settingsFile))) {
				$settings = json_encode(array("shareHoldings" => "disabled", "pin" => "0000", "css" => ""));
				file_put_contents($this->settingsFile, $settings);
			}

			if(!file_exists($this->holdingsFile)) {
				file_put_contents($this->holdingsFile, "{}");
			}

			if(!file_exists($this->transactionsFile)) {
				file_put_contents($this->transactionsFile, "{}");
			}
		}

		function generateToken($platform) {
			$account = json_decode(file_get_contents($this->accountFile), true);
			$token = $platform . "$" . $this->getRandomHex(64);
			while($account[$platform] == $token) {
				$token = $platform . "$" . $this->getRandomHex(64);
			}
			$account[$platform] = $token;
			file_put_contents($this->accountFile, json_encode($account));
			return $token;
		}

		function getRandomHex($bytes) {
			return bin2hex(openssl_random_pseudo_bytes($bytes));
		}
	}
?>