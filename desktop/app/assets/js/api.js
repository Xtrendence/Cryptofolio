class NoAPI {
	constructor(data, platform, storage) {
		this.data = data;

		this.checkData();

		this.fetchCoins().then(coins => {
			this.data.coins = coins;
			this.storeData();
		}).catch(error => {
			console.log(error);
		});

		this.platform = platform;
		this.storage = storage;
	}

	checkData() {
		if(this.empty(this.data.activity)) {
			this.data.activity = {};
		}
		if(this.empty(this.data.coins)) {
			this.data.coins = {};
		}
		if(this.empty(this.data.historical)) {
			this.data.historical = {};
		}
		if(this.empty(this.data.holdings)) {
			this.data.holdings = {};
		}
		if(this.empty(this.data.settings)) {
			this.data.settings = { 
				shareHoldings:"disabled", 
				pin:"0000", 
				css:"", 
				refetchTime:86400
			};
		}
		if(this.empty(this.data.watchlist)) {
			this.data.watchlist = {};
		}

		this.storeData();
	}

	async storeData() {
		let json = JSON.stringify(this.data);

		switch(this.platform) {
			case "website":
				this.storage.setItem("NoAPI", json);
				break;
			case "desktop":
				await this.storage.setItem("NoAPI", json);
				break;
			case "mobile":
				await this.storage.setItem("NoAPI", json);
				break;
		}
	}

	getData() {
		return this.data;
	}

	setData(data) {
		if(!("modified" in this.data) || this.validGracePeriod(parseInt(this.data.modified))) {
			data.modified = (Math.floor(new Date().getTime() / 1000));
			this.data = data;
			this.storeData();
			return true;
		}
		return false;
	}

	// Activity
	createActivity(id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to) {
		if(!this.empty(id) && !this.empty(symbol) && !this.empty(date) && !this.empty(type) && !this.empty(amount)) {
			if(this.empty(fee)) {
				fee = 0;
			}
			if(this.empty(notes)) {
				notes = "-";
			}

			date = this.replaceAll(date, "/", "-");

			if(this.validDate(date)) {
				let time = Math.floor(new Date(Date.parse(date)).getTime() / 1000);
				let activity = { id:id, symbol:symbol, date:date, time:time, type:type, amount:amount, fee:fee, notes:notes };

				if(type === "buy" || type === "sell" || type === "transfer") {
					if(type === "buy" || type === "sell") {
						if(this.empty(exchange)) {
							exchange = "-";
						}
						if(this.empty(pair)) {
							pair = "-";
						}
						if(this.empty(price)) {
							price = 0;
						}
					
						activity["exchange"] = exchange;
						activity["pair"] = pair;
						activity["price"] = price;
					} else if(type === "transfer") {
						if(this.empty(from)) {
							from = "-";
						}
						if(this.empty(to)) {
							to = "-";
						}

						activity["from"] = from;
						activity["to"] = to;
					}
				} else {
					return { error:"Invalid activity type." };
				}

				let txID = Math.floor(new Date().getTime() / 1000) + this.getRandomHex(8);
				while(txID in this.data.activity) {
					txID = Math.floor(new Date().getTime() / 1000) + this.getRandomHex(8);
				}

				let current = this.data;
				current.activity[txID] = activity;

				let set = this.setData(current);
				if(set) {
					return { message:"The activity has been recorded." };
				}

				return { error:"Activity couldn't be recorded." };
			} else {
				return { error:"Invalid date." };
			}
		}
	}

	deleteActivity(txID) {
		if(!this.empty(txID)) {
			let current = this.data;
			delete current.activity[txID];

			let set = this.setData(current);
			if(set) {
				return { message:"The activity has been deleted." };
			}

			return { error:"Activity couldn't be deleted." };
		}
	}

	exportActivity() {
		let headers = ["txID", "id", "symbol", "date", "type", "amount", "fee", "notes", "exchange", "pair", "price", "from", "to"];

		let csv = headers.join(",") + '\r\n';

		Object.keys(this.data.activity).map(txID => {
			let event = this.data.activity[txID];
			let array = [txID, event["id"], event["symbol"], event["date"], event["type"], event["amount"], event["fee"], event["notes"], event["exchange"], event["pair"], event["price"], event["from"], event["to"]];
			csv += array.join(",") + '\r\n';
		});

		return csv;
	}

	importActivity(rows) {
		let valid = true;

		let current = this.data;

		rows.map(row => {
			let data = row.split(",");

			let txID = !this.empty(data[0]) ? data[0] : valid = false;

			if(txID === "-") {
				txID = Math.floor(new Date().getTime() / 1000) + this.getRandomHex(8);
				while(txID in this.data.activity) {
					txID = Math.floor(new Date().getTime() / 1000) + this.getRandomHex(8);
				}
			}

			let id = !this.empty(data[1]) ? data[1] : valid = false;
			let symbol = !this.empty(data[2]) ? data[2] : valid = false;
			let date = !this.empty(data[3]) ? this.replaceAll(this.replaceAll(data[3], "'", ""), '"', "") : valid = false;
			let type = !this.empty(data[4]) ? data[4].toLowerCase() : valid = false;
			let amount = !this.empty(data[5]) ? data[5] : valid = false;
			let fee = !this.empty(data[6]) ? data[6] : 0;
			let notes = !this.empty(data[7]) ? this.replaceAll(data[7], '"', "") : "-";

			date = this.replaceAll(date, "/", "-");

			if(this.validDate(date)) {
				let time = Math.floor(new Date(Date.parse(date)).getTime() / 1000);
				let activity = { id:id, symbol:symbol, date:date, time:time, type:type, amount:amount, fee:fee, notes:notes };

				if(type === "buy" || type === "sell" || type === "transfer") {
					if(type === "buy" || type === "sell") {
						let exchange = !this.empty(data[8]) ? this.replaceAll(data[8], '"', "") : "-";
						let pair = !this.empty(data[9]) ? this.replaceAll(data[9], '"', "") : "-";
						let price = !this.empty(data[10]) ? data[10] : 0;
					
						activity["exchange"] = exchange;
						activity["pair"] = pair;
						activity["price"] = price;
					} else if(type === "transfer") {
						let from = !this.empty(data[11]) ? this.replaceAll(data[11], '"', "") : "-";
						let to = !this.empty(data[12]) ? this.replaceAll(data[12], '"', "") : "-";

						activity["from"] = from;
						activity["to"] = to;
					}

					current.activity[txID] = activity;
				} else {
					valid = false;
					return { error:"Invalid activity type." };
				}
			} else {
				valid = false;
				return { error:"Invalid date." };
			}
		});

		if(valid) {
			let set = this.setData(current);
			if(set) {
				return { message:"The activities have been recorded." };
			}

			return { error:"Activities couldn't be recorded." };
		} else {
			return { error:"Invalid content format." };
		}
	}

	readActivity() {
		return this.data.activity;
	}

	updateActivity(txID, id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to) {
		if(!this.empty(id) && !this.empty(symbol) && !this.empty(date) && !this.empty(type) && !this.empty(amount)) {
			if(this.empty(fee)) {
				fee = 0;
			}
			if(this.empty(notes)) {
				notes = "-";
			}

			date = this.replaceAll(date, "/", "-");

			if(this.validDate(date)) {
				let time = Math.floor(new Date(Date.parse(date)).getTime() / 1000);
				let activity = { id:id, symbol:symbol, date:date, time:time, type:type, amount:amount, fee:fee, notes:notes };

				if(type === "buy" || type === "sell" || type === "transfer") {
					if(type === "buy" || type === "sell") {
						if(this.empty(exchange)) {
							exchange = "-";
						}
						if(this.empty(pair)) {
							pair = "-";
						}
						if(this.empty(price)) {
							price = 0;
						}
					
						activity["exchange"] = exchange;
						activity["pair"] = pair;
						activity["price"] = price;
					} else if(type === "transfer") {
						if(this.empty(from)) {
							from = "-";
						}
						if(this.empty(to)) {
							to = "-";
						}

						activity["from"] = from;
						activity["to"] = to;
					}
				} else {
					return { error:"Invalid activity type." };
				}

				let current = this.data;

				if(txID in current.activity) {
					current.activity[txID] = activity;

					let set = this.setData(current);
					if(set) {
						return { message:"The activity has been updated." };
					}

					return { error:"Activity couldn't be updated." };
				} else {
					return { error:"Activity not found." };
				}
			} else {
				return { error:"Invalid date." };
			}
		}
	}

	// Coins

	readCoins(args) {
		return new Promise((resolve, reject) => {
			this.fetchCoins().then(coins => {
				let coin;

				if((this.empty(args.id) && this.empty(args.symbol)) || (!this.empty(args.id) && !this.empty(args.symbol))) {
					return;
				} else if(!this.empty(args.symbol)) {
					coin = this.findBySymbol(coins, args.symbol, true);
				} else if(!this.empty(args.id)) {
					coin = this.findByID(coins, args.id, true);
				}

				this.storeData();

				resolve(coin);
			}).catch(error => {
				console.log(error);
				reject(error);
			});
		});
	}

	fetchCoins() {
		return new Promise((resolve, reject) => {
			if(this.empty(this.data.coins) || (Math.floor(new Date().getTime() / 1000)) - 3600 > parseInt(this.data.fetchedCoins)) {
				console.log("Fetching Coins...");

				let pairs = [];

				let endpoint = "https://api.coingecko.com/api/v3/coins/list"

				fetch(endpoint, {
					method: "GET",
					headers: {
						Accept: "application/json", "Content-Type": "application/json"
					}
				})
				.then((json) => {
					return json.json();
				})
				.then((coins) => {
					Object.keys(coins).map(coin => {
						let symbol = coins[coin].symbol.toLowerCase();
						let pair = { [symbol]:coins[coin].id };
						pairs.push(pair);
					});

					this.data.fetchedCoins = (Math.floor(new Date().getTime() / 1000));

					resolve(pairs);
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			} else {
				resolve(this.data.coins);
			}
		});
	}

	findBySymbol(coins, symbol, retry) {
		let matches = [];

		coins.map(coin => {
			if(Object.keys(coin)[0] === symbol) {
				matches.push(coin);
			}
		});

		if(matches.length === 1) {
			return { id:matches[0][symbol], symbol:symbol };
		} else if(this.empty(matches)) {
			if(retry) {
				return this.findByID(coins, symbol, false);
			} else {
				return { error:"No coins were found with that symbol." };
			}
		} else {
			return { matches:matches };
		}
	}

	findByID(coins, id, retry) {
		let values = Object.values(coins);
		let symbols = {};
		let ids = [];

		values.map(value => {
			ids.push(value[Object.keys(value)[0]]);
			symbols[value[Object.keys(value)[0]]] = Object.keys(value)[0];
		});

		if(ids.includes(id)) {
			return { id:id, symbol:symbols[id] };
		} else {
			if(retry) {
				return this.findBySymbol(coins, id, false);
			} else {
				return { error:"No coins were found with that symbol." };
			}
		}
	}

	// Historical

	deleteHistorical() {
		if("historical" in this.data) {
			this.data.historical = {};
			this.storeData();
			return { message:"Historical data has been deleted." };
		} else {
			return { message:"Historical data not found." };
		}
	}

	readHistorical(ids, currency, from, to, background) {
		if(!this.empty(ids) && !this.empty(currency) && !this.empty(from) && !this.empty(to)) {
			return new Promise((resolve, reject) => {
				ids = ids.split(",");
				let data = {};
				for(let i = 0; i < ids.length; i++) {
					setTimeout(() => {
						this.fetchHistoricalData(ids[i], currency, from, to).then(historicalData => {
							data[ids[i]] = historicalData;
							if(i === ids.length - 1) {
								output();
							}
						}).catch(error => {
							if(i === ids.length - 1) {
								output();
							}
							console.log(error);
						});
					}, i * 2000);
				}

				function output() {
					if(background === "true") {
						resolve({ message:"Fetched historical data." });
					} else {
						resolve(data);
					}
				}
			});
		}
	}

	fetchHistoricalData(id, currency, from, to) {
		let key = id + currency;

		return new Promise((resolve, reject) => {
			if(!this.historicalDataExists(id, currency)) {
				console.log("Fetching Historical Data...");

				let endpoint = "https://api.coingecko.com/api/v3/coins/" + id + "/market_chart/range?vs_currency=" + currency + "&from=" + from + "&to=" + to;

				fetch(endpoint, {
					method: "GET",
					headers: {
						Accept: "application/json", "Content-Type": "application/json"
					}
				})
				.then((json) => {
					return json.json();
				})
				.then((data) => {
					this.data.historical[key] = data;
					this.data.historical["modified" + key] = (Math.floor(new Date().getTime() / 1000));
					this.storeData();
					resolve(data);
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			} else {
				resolve(this.data.historical[key]);
			}
		});
	}

	historicalDataExists(id, currency) {
		let key = id + currency;

		let settings = this.data.settings;
		let refetchTime = 86400;
		if(!this.empty(settings.refetchTime)) {
			refetchTime = parseInt(settings.refetchTime);
		}

		if(!(key in this.data.historical) || (Math.floor(new Date().getTime() / 1000)) - refetchTime > parseInt(this.data.historical["modified" + key])) {
			return false;
		}
		return true;
	}

	// Holdings

	createHoldings(id, symbol, amount) {
		if(!this.empty(id) && !this.empty(symbol) && !this.empty(amount)) {
			let current = this.data;

			if(Object.keys(current.holdings).includes(id)) {
				current.holdings[id].amount = parseFloat(current.holdings[id].amount) + parseFloat(amount);
			} else {
				current.holdings[id] = { symbol:symbol, amount:parseFloat(amount) };
			}

			let set = this.setData(current);
			if(set) {
				return { message:"The asset has been created." };
			}

			return { error:"Asset couldn't be created." };
		}
	}

	deleteHoldings(id) {
		if(!this.empty(id)) {
			let current = this.data;
			delete current.holdings[id];

			let set = this.setData(current);
			if(set) {
				return { message:"The asset has been deleted." };
			}

			return { error:"Asset couldn't be deleted." };
		}
	}

	exportHoldings() {
		let headers = ["id", "symbol", "amount"];

		let csv = headers.join(",") + '\r\n';

		Object.keys(this.data.holdings).map(id => {
			let holding = this.data.holdings[id];
			let array = [id, holding["symbol"], holding["amount"]];
			csv += array.join(",") + '\r\n';
		});

		return csv;
	}

	importHoldings(rows) {
		let valid = true;

		let current = this.data;

		rows.map(row => {
			let data = row.split(",");

			let id = !this.empty(data[0]) ? data[0] : valid = false;
			let symbol = !this.empty(data[1]) ? data[1] : valid = false;
			let amount = !this.empty(data[2]) ? data[2] : valid = false;

			if(Object.keys(current.holdings).includes(id)) {
				current.holdings[id].amount = parseFloat(current.holdings[id].amount) + parseFloat(amount);
			} else {
				current.holdings[id] = { symbol:symbol, amount:parseFloat(amount) };
			}
		});

		if(valid) {
			let set = this.setData(current);
			if(set) {
				return { message:"The assets have been created." };
			}

			return { error:"Assets couldn't be created." };
		} else {
			return { error:"Invalid content format." };
		}
	}

	readHoldings() {
		return this.data.holdings;
	}

	updateHoldings(id, amount) {
		if(!this.empty(id) && !this.empty(amount)) {
			let current = this.data;

			if(Object.keys(current.holdings).includes(id)) {
				current.holdings[id].amount = parseFloat(amount);

				let set = this.setData(current);
				if(set) {
					return { message:"The asset has been updated." };
				}
			} else {
				return { error:"Asset not found." };
			}

			return { error:"Asset couldn't be updated." };
		}
	}

	// Settings

	readSettings() {
		return this.data.settings;
	}

	updateSettings(key, value) {
		if(!this.empty(key) && typeof value !== "undefined") {
			let current = this.data;

			if(Object.keys(current.settings).includes(key)) {
				current.settings[key] = value;

				let set = this.setData(current);
				if(set) {
					return { message:"The setting has been updated." };
				}
			} else {
				return { error:"Setting not found." };
			}

			return { error:"Setting couldn't be updated." };
		}
	}

	// Watchlist

	createWatchlist(id, symbol) {
		if(!this.empty(id) && !this.empty(symbol)) {
			let current = this.data;

			current.watchlist[id] = { symbol:symbol };

			let set = this.setData(current);
			if(set) {
				return { message:"Asset added to watchlist." };
			}

			return { error:"Asset couldn't be added to watchlist." };
		}
	}

	deleteWatchlist(id) {
		if(!this.empty(id)) {
			let current = this.data;
			delete current.watchlist[id];

			let set = this.setData(current);
			if(set) {
				return { message:"Asset removed from watchlist." };
			}

			return { error:"Asset couldn't be removed from watchlist." };
		}
	}

	readWatchlist() {
		return this.data.watchlist;
	}

	// Utils

	validGracePeriod(time) {
		let now = (Math.floor(new Date().getTime() / 1000));
		if(now - 1 > time) {
			return true;
		}
		return false;
	}

	getRandomHex(bytes) {
		return [...Array(bytes * 2)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
	}

	validDate(date) {
		return (new Date(Date.parse(date)) !== "Invalid Date") && !isNaN(new Date(Date.parse(date)));
	}

	replaceAll(string, str1, str2, ignore) {
		return string.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
	}

	empty(value) {
		if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
			return true;
		}
		if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
			return true;
		}
		return false;
	}
}