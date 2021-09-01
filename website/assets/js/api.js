class NoAPI {
	constructor(data) {
		this.data = data;
	}

	getData() {
		return this.data;
	}

	setData(data) {
		this.data = data;
	}

	// Activity
	createActivity(id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to) {

	}

	deleteActivity(txID) {

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
}