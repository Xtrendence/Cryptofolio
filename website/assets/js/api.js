class NoAPI {
	constructor(data) {
		this.data = data;
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

	}

	importActivity(rows) {

	}

	readActivity() {

	}

	updateActivity(txID, id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to) {

	}

	// Coins

	readCoins(id = null, symbol = null) {

	}

	// Historical

	deleteHistorical() {

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