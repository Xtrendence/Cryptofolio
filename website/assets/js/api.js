class NoAPI {
	constructor(data) {
		this.data = data;

		this.fetchCoins().then(coins => {
			this.coins = coins;
		}).catch(error => {
			console.log(error);
		});
	}

	getData() {
		return this.data;
	}

	setData(data) {
		if(!("modified" in this.data) || this.validGracePeriod(this.data.modified)) {
			data.modified = new Date().getTime();
			this.data = data;
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

			if(this.validDate(date)) {
				let time = new Date(Date.parse(date)).getTime() / 1000;
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

				let txID = new Date().getTime() / 1000 + this.getRandomHex(8);
				while(txID in this.data.activity) {
					txID = new Date().getTime() / 1000 + this.getRandomHex(8);
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

		let current = this.data.activity;

		rows.map(row => {
			let data = row.split(",");

			let txID = !this.empty(data[0]) ? data[0] : valid = false;

			if(txID === "-") {
				txID = new Date().getTime() / 1000 + this.getRandomHex(8);
				while(txID in this.data.activity) {
					txID = new Date().getTime() / 1000 + this.getRandomHex(8);
				}
			}

			id = !this.empty(data[1]) ? data[1] : valid = false;
			symbol = !this.empty(data[2]) ? data[2] : valid = false;
			date = !this.empty(data[3]) ? this.replaceAll(this.replaceAll(data[3], "'", ""), '"', "") : valid = false;
			type = !this.empty(data[4]) ? data[4].toLowerCase() : valid = false;
			amount = !this.empty(data[5]) ? data[5] : valid = false;
			fee = !this.empty(data[6]) ? data[6] : 0;
			notes = !this.empty(data[7]) ? this.replaceAll(data[7], '"', "") : "-";
			notes = !this.empty(data[7]) ? this.replaceAll(data[7], '"', "") : "-";

			if(this.validDate(date)) {
				let time = new Date(Date.parse(date)).getTime() / 1000;
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

					current[txID] = activity;
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

			if(this.validDate(date)) {
				let time = new Date(Date.parse(date)).getTime() / 1000;
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

	readCoins(id = null, symbol = null) {
		this.fetchCoins().then(coins => {
			if((this.empty(id) && this.empty(symbol)) || (!this.empty(id) && !this.empty(symbol))) {
				return;
			} else if(!this.empty(symbol)) {
				return findBySymbol(coins, symbol, true);
			} else if(!this.empty(id)) {
				return findByID(coins, id, true);
			}
		}).catch(error => {
			console.log(error);
		});
	}

	fetchCoins() {
		return new Promise((resolve, reject) => {
			if(this.empty(this.coins) || new Date.getTime() - 3600 > this.fetchedCoins) {
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

					this.fetchedCoins = new Date().getTime();

					resolve(pairs);
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			} else {
				resolve(this.coins);
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
			delete this.data.historical;
			return { message:"Historical data has been deleted." };
		} else {
			return { message:"Historical data not found." };
		}
	}

	readHistorical(ids, currency, from, to, background) {

	}

	// Holdings

	createHoldings(id, symbol, amount) {

	}

	deleteHoldings(id) {

	}

	exportHoldings() {

	}

	importHoldings(rows) {

	}

	readHoldings() {

	}

	updateHoldings(id, amount) {

	}

	// Settings

	readSettings() {

	}

	updateSettings(key, value) {

	}

	// Watchlist

	createWatchlist(id, symbol) {

	}

	deleteWatchlist(id) {

	}

	readWatchlist() {

	}

	// Utils

	validGracePeriod(time) {
		let now = new Date().getTime();
		if(now - 1000 > time) {
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