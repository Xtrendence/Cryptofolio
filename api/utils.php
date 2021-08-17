<?php
	class Utils {
		public $username;
		public $dataFolder;
		public $accountFile;
		public $holdingsFile;
		public $activityFile;
		public $settingsFile;
		public $watchlistFile;
		public $coinsFile;

		public function __construct($username) {
			if($this->userExists($username)) {
				$this->username = $username;
				$this->dataFolder = "../data/users/" . $username . "/";
				$this->accountFile = $this->dataFolder . "account.json";
				$this->holdingsFile = $this->dataFolder . "holdings.json";
				$this->activityFile = $this->dataFolder . "activity.json";
				$this->settingsFile = $this->dataFolder . "settings.json";
				$this->watchlistFile = $this->dataFolder . "watchlist.json";
				$this->coinsFile = $this->dataFolder . "coins.json";
			} else {
				$this->username = "admin";
				$this->dataFolder = "../data/users/admin/";
				$this->accountFile = $this->dataFolder . "account.json";
				$this->holdingsFile = $this->dataFolder . "holdings.json";
				$this->activityFile = $this->dataFolder . "activity.json";
				$this->settingsFile = $this->dataFolder . "settings.json";
				$this->watchlistFile = $this->dataFolder . "watchlist.json";
				$this->coinsFile = $this->dataFolder . "coins.json";
				
				$this->generateAccount();
			}
		}

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

		function validUsername($username) {
			if(empty($username) || preg_match('/[^a-z_\-0-9]/i', $username)) {
				return false;
			}
			return true;
		}

		function userExists($username) {
			if(is_dir("../data/users/" . $username)) {
				return true;
			}
			return false;
		}

		function generateAccount() {
			if(!is_dir("../data/users/")) {
				mkdir("../data/users/");
			}

			if(!is_dir("../data/users/admin/")) {
				mkdir("../data/users/admin/");
			}

			$content = file_get_contents($this->accountFile);
			$current = json_decode($content, true);
			if(!file_exists($this->accountFile) || !array_key_exists("password", $current) || empty($content)) {
				$password = password_hash("admin", PASSWORD_DEFAULT);
				$account = json_encode(array("username" => "admin", "password" => $password, "web" => $this->generateToken("web"), "app" => $this->generateToken("app"), "desktop" => $this->generateToken("desktop")));
				file_put_contents($this->accountFile, $account);
			}

			if(empty(file_get_contents($this->settingsFile))) {
				$settings = json_encode(array("shareHoldings" => "disabled", "pin" => "0000", "css" => "", "refetchTime" => 86400));
				file_put_contents($this->settingsFile, $settings);
			}

			if(!file_exists($this->holdingsFile)) {
				file_put_contents($this->holdingsFile, "{}");
			}

			if(!file_exists($this->activityFile)) {
				file_put_contents($this->activityFile, "{}");
			}

			if(!file_exists($this->watchlistFile)) {
				file_put_contents($this->watchlistFile, "{}");
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

		function fetchCoins() {
			if(!file_exists($this->coinsFile) || empty(file_get_contents($this->coinsFile)) || time() - 3600 > filemtime($this->coinsFile)) {
				$pairs = array();
				$coins = json_decode(file_get_contents("https://api.coingecko.com/api/v3/coins/list"), true);
				foreach($coins as $coin) {
					$symbol = strtolower($coin["symbol"]);
					$pair = array($symbol => $coin["id"]);
					array_push($pairs, $pair);
				}
				file_put_contents($this->coinsFile, json_encode($pairs));
			}
		}

		function fetchHistoricalData($id, $currency, $from, $to) {
			if(!file_exists("../data/historical/")) {
				mkdir("../data/historical/");
			}

			$historicalFile = "../data/historical/" . $id . "-" . $currency;

			if(!$this->historicalDataExists($id, $currency)) {
				$json = file_get_contents("https://api.coingecko.com/api/v3/coins/" . $id . "/market_chart/range?vs_currency=" . $currency . "&from=" . $from . "&to=" . $to);

				file_put_contents($historicalFile, $json);

				return json_decode($json, true);
			} else {
				return json_decode(file_get_contents($historicalFile), true);
			}
		}

		function historicalDataExists($id, $currency) {
			$historicalFile = "../data/historical/" . $id . "-" . $currency;

			$settings = json_decode(file_get_contents($this->settingsFile), true);
			$refetchTime = 86400;
			if(!empty($settings["refetchTime"])) {
				$refetchTime = $settings["refetchTime"];
			}

			if(!file_exists($historicalFile) || empty(file_get_contents($historicalFile)) || time() - $refetchTime > filemtime($historicalFile)) {
				return false;
			}

			return true;
		}

		function rrmdir($directory) {
			if(is_dir($directory)) {
				$files = scandir($directory);

				foreach($files as $file) {
					if($file != "." && $file != "..") {
						if(filetype($directory . "/" . $file) == "dir") {
							$this->rrmdir($directory . "/" . $file);
						} else {
							unlink($directory . "/" . $file);
						}
					}
				}
				reset($files);
				rmdir($directory);
			}

			if(file_exists($directory)) {
				return false;
			}
			return true;
		}

		function rglob($pattern, $flags = 0) {
			$files = glob($pattern, $flags); 
			foreach(glob(dirname($pattern) . "/*", GLOB_ONLYDIR|GLOB_NOSORT) as $directory) {
				$files = array_merge($files, $this->rglob($directory . "/" . basename($pattern), $flags));
			}
			return $files;
		}

		function validDate($date){
			return (bool)strtotime($date);
		}
	}
?>