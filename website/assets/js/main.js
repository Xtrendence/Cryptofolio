document.addEventListener("DOMContentLoaded", () => {
	let settings = {};

	let globalData = {};

	// TODO: Remove after development.
	let transactionsData = {
		"1613393109-CNWD": {
			"symbol":"BTC",
			"id":"bitcoin",
			"type":"buy",
			"amount":1.5,
			"price":30000
		},
		"1613885309-YJGZ": {
			"symbol":"ETH",
			"id":"ethereum",
			"type":"buy",
			"amount":3.5,
			"price":1850
		},
		"1613569509-WTTF": {
			"symbol":"DOT",
			"id":"polkadot",
			"type":"sell",
			"amount":400,
			"price":31.5
		},
		"1613655909-WYTF": {
			"symbol":"BTC",
			"id":"bitcoin",
			"type":"sell",
			"amount":1,
			"price":35000
		},
		"1613763909-GDFD": {
			"symbol":"BTC",
			"id":"bitcoin",
			"type":"buy",
			"amount":0.5,
			"price":36000
		},
		"1613886459-XMTO": {
			"symbol":"ADA",
			"id":"cardano",
			"type":"sell",
			"amount":150,
			"price":0.93
		},
		"1613850309-GGFT": {
			"symbol":"DOT",
			"id":"polkadot",
			"type":"buy",
			"amount":25,
			"price":28.5
		},
		"1613884309-XLBZ": {
			"symbol":"ETH",
			"id":"ethereum",
			"type":"buy",
			"amount":6.5,
			"price":1800
		},
		"1613886309-TYTY": {
			"symbol":"ETH",
			"id":"ethereum",
			"type":"sell",
			"amount":5,
			"price":1800
		},
		"1613884509-XTIL": {
			"symbol":"ADA",
			"id":"cardano",
			"type":"buy",
			"amount":250,
			"price":0.91
		},
	};

	let holdingsData = {};
	
	let body = document.body;

	let spanGlobalMarketCap = document.getElementById("global-market-cap");
	let spanGlobalVolume = document.getElementById("global-volume");
	let spanGlobalDominance = document.getElementById("global-dominance");

	let divLoadingOverlay = document.getElementById("loading-overlay");

	let divPageDashboard = document.getElementById("page-dashboard");
	let divPageMarket = document.getElementById("page-market");
	let divPageHoldings = document.getElementById("page-holdings");
	let divPageSettings = document.getElementById("page-settings");

	let spanPageNumber = document.getElementById("page-number");

	let spanHeaderMarketCap = divPageMarket.getElementsByClassName("header market-cap")[0];

	let buttonPreviousPage = document.getElementById("previous-page");
	let buttonNextPage = document.getElementById("next-page");

	let buttonSettingsChoices = divPageSettings.getElementsByClassName("choice");

	let divNavbarBackground = document.getElementById("navbar-background");
	let divNavbarDashboard = document.getElementById("navbar-dashboard");
	let divNavbarMarket = document.getElementById("navbar-market");
	let divNavbarHoldings = document.getElementById("navbar-holdings");
	let divNavbarSettings = document.getElementById("navbar-settings");

	let divPageNavigation = document.getElementById("page-navigation");
	let divMarketList = document.getElementById("market-list");
	let divHoldingsList = document.getElementById("holdings-list");

	let divChartWrapper = document.getElementById("chart-wrapper");
	let divChartContainer = document.getElementById("chart-container");

	let spanHoldingsTotalValue = document.getElementById("holdings-total-value");

	let divThemeToggle = document.getElementById("theme-toggle");

	detectMobile() ? body.id = "mobile" : body.id = "desktop";

	adjustToScreen();

	empty(localStorage.getItem("defaultPage")) ? switchPage("market") : switchPage(localStorage.getItem("defaultPage"));

	getSettings();

	listMarket();

	let updateMarketListInterval = setInterval(listMarket, 30000);

	window.addEventListener("resize", () => {
		clearStats();
		clearMarketList();

		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(() => {
			let page = parseInt(divMarketList.getAttribute("data-page"));
			listMarket(page);
		}, 1000);

		adjustToScreen();
	});

	divNavbarDashboard.addEventListener("click", () => {
		switchPage("dashboard");
	});

	divNavbarMarket.addEventListener("click", () => {
		switchPage("market");
	});

	divNavbarHoldings.addEventListener("click", () => {
		switchPage("holdings");
	});

	divNavbarSettings.addEventListener("click", () => {
		switchPage("settings");
	});

	buttonPreviousPage.addEventListener("click", () => {
		previousPage();
	});

	buttonNextPage.addEventListener("click", () => {
		nextPage();
	});

	divThemeToggle.addEventListener("click", () => {
		if(divThemeToggle.classList.contains("active")) {
			// Switch to dark mode.
			switchTheme("dark");
		} else {
			// Switch to light mode.
			switchTheme("light");
		}
	});

	for(let i = 0; i < buttonSettingsChoices.length; i++) {
		buttonSettingsChoices[i].addEventListener("click", () => {
			let key = buttonSettingsChoices[i].parentElement.getAttribute("data-key");
			let value = buttonSettingsChoices[i].getAttribute("data-value");
			localStorage.setItem(key, value);
			getSettings();
		});
	}

	function switchTheme(theme) {
		if(theme === "dark") {
			localStorage.setItem("theme", "dark");
			divThemeToggle.classList.remove("active");
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			localStorage.setItem("theme", "light");
			divThemeToggle.classList.add("active");
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
		}
	}

	function switchPage(page) {
		divNavbarDashboard.classList.remove("active");
		divNavbarMarket.classList.remove("active");
		divNavbarHoldings.classList.remove("active");
		divNavbarSettings.classList.remove("active");

		divPageDashboard.classList.remove("active");
		divPageMarket.classList.remove("active");
		divPageHoldings.classList.remove("active");
		divPageSettings.classList.remove("active");

		switch(page) {
			case "dashboard":
				divNavbarDashboard.classList.add("active");
				divPageDashboard.classList.add("active");
				divNavbarBackground.setAttribute("class", "background dashboard");
				break;
			case "market":
				divNavbarMarket.classList.add("active");
				divPageMarket.classList.add("active");
				divNavbarBackground.setAttribute("class", "background market");
				listMarket();
				break;
			case "holdings":
				divNavbarHoldings.classList.add("active");
				divPageHoldings.classList.add("active");
				divNavbarBackground.setAttribute("class", "background holdings");
				listHoldings();
				break;
			case "settings":
				divNavbarSettings.classList.add("active");
				divPageSettings.classList.add("active");
				divNavbarBackground.setAttribute("class", "background settings");
				getSettings();
				break;
		}
	}

	function adjustToScreen() {
		if(window.innerWidth <= 440) {
			spanHeaderMarketCap.textContent = "M. Cap";
		} else {
			spanHeaderMarketCap.textContent = "Market Cap";
		}
	}

	function previousPage() {
		let page = parseInt(divMarketList.getAttribute("data-page"));
		if(page > 1) {
			page -= 1;
			divMarketList.setAttribute("data-page", page);
			clearMarketList();
			spanPageNumber.textContent = "Page " + page;
			listMarket(page);
		}
	}

	function nextPage() {
		let page = parseInt(divMarketList.getAttribute("data-page"));
		let limit = 5;
		if(page < limit) {
			page += 1;
			divMarketList.setAttribute("data-page", page);
			clearMarketList();
			spanPageNumber.textContent = "Page " + page;
			listMarket(page);
		}
	}

	function clearMarketList() {
		divMarketList.classList.add("loading");
		divMarketList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
	}

	function clearStats() {
		spanGlobalMarketCap.textContent = "...";
		spanGlobalVolume.textContent = "...";
		spanGlobalDominance.textContent = "...";
	}

	function listMarket(page) {
		if(document.getElementById("navbar-market").classList.contains("active")) {
			divPageNavigation.classList.remove("active");

			setTimeout(() => {
				if(divMarketList.classList.contains("loading")) {
					listMarket(page);
				}
			}, 5000);

			getMarket(page).then(coins => {
				if(divMarketList.getElementsByClassName("coin-wrapper loading").length > 0) {
					divMarketList.getElementsByClassName("coin-wrapper loading")[0].remove();
					divMarketList.classList.remove("loading");
				}

				coins.map(coin => {
					let price = parseFloat(coin.current_price);
					if(price > 1) {
						price = separateThousands(price);
					}
					let id = "market-coin-" + coin.id;
					let marketCap = coin.market_cap;
					if(window.innerWidth <= 960 && window.innerWidth > 440) {
						marketCap = abbreviateNumber(marketCap, 2);
					}
					else if(window.innerWidth <= 440) {
						marketCap = abbreviateNumber(marketCap, 0);
					}
					let rank = coin.market_cap_rank;
					let name = coin.name;
					let icon = coin.image;
					let priceChangeDay = coin.price_change_percentage_24h;
					if(!empty(priceChangeDay)) {
						priceChangeDay = priceChangeDay.toFixed(2);
					} else {
						priceChangeDay = "-";
					}
					let symbol = coin.symbol;
					let volume = coin.total_volume;

					let div;

					try {
						if(document.getElementById(id)) {
							div = document.getElementById(id);
							div.getElementsByClassName("price")[0].textContent = "$ " + price;
							div.getElementsByClassName("market-cap")[0].textContent = "$ " + separateThousands(marketCap);
							div.getElementsByClassName("day")[0].textContent = priceChangeDay + "%";
						} else {
							div = document.createElement("div");
							div.id = id;
							div.classList.add("coin-wrapper");

							div.innerHTML = '<span class="rank">' + rank + '</span><img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="price">$ ' + price + '</span><span class="market-cap">$ ' + separateThousands(marketCap) + '</span><span class="day">' + priceChangeDay + '%</span>';

							divMarketList.appendChild(div);
						}

						divPageNavigation.classList.add("active");
					} catch(e) {
						console.log(e);
					}
				});

				getBitcoin().then(bitcoin => {
					let bitcoinMarketCap = bitcoin.market_data.market_cap.usd;

					getGlobal().then(global => {
						globalData = global.data;

						let marketCap = (global.data.total_market_cap.usd).toFixed(0);
						let volume = (global.data.total_volume.usd).toFixed(0);
						let dominance = ((bitcoinMarketCap / marketCap) * 100).toFixed(1);

						if(window.innerWidth <= 1020) {
							marketCap = abbreviateNumber(marketCap, 3);
							volume = abbreviateNumber(volume, 0);
						}

						spanGlobalMarketCap.textContent = "$ " + separateThousands(marketCap);
						spanGlobalVolume.textContent = "$ " + separateThousands(volume);
						spanGlobalDominance.textContent = dominance + "%";
					}).catch(e => {
						console.log(e);
					});
				});
			}).catch(e => {
				console.log(e);
			});
		}
	}

	function listHoldings() {
		if(document.getElementById("navbar-holdings").classList.contains("active")) {
			divPageNavigation.classList.remove("active");

			setTimeout(() => {
				if(divHoldingsList.classList.contains("loading")) {
					listMarket(page);
				}
			}, 5000);
	
			getTransactions().then(transactions => {
				let coins = parseTransactions(transactions);

				parseHoldings(coins).then(holdings => {
					if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
						divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].remove();
						divHoldingsList.classList.remove("loading");
					}

					spanHoldingsTotalValue.textContent = "$ " + separateThousands(globalData.totalValue.toFixed(2));

					Object.keys(holdings).map(holding => {
						let coin = holdings[holding];
					
						let id = "holdings-coin-" + holding;
						let icon = coin.image;
						let amount = coin.amount;
						let symbol = coin.symbol;
						let value = coin.value.toFixed(2);

						let div;

						try {
							if(document.getElementById(id)) {
								div = document.getElementById(id);
								div.getElementsByClassName("amount")[0].textContent = amount;
								div.getElementsByClassName("value")[0].textContent = "$ " + separateThousands(value);
							} else {
								div = document.createElement("div");
								div.id = id;
								div.classList.add("coin-wrapper");

								let more = document.createElement("div");
								more.classList.add("more");
								more.innerHTML = '<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M576 736v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm512 0v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm512 0v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68z"/></svg>';

								div.innerHTML = '<img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="amount">' + amount + '</span><span class="value">$ ' + separateThousands(value) + '</span>';

								div.appendChild(more);

								divHoldingsList.appendChild(div);
							}
						} catch(e) {
							console.log(e);
						}
					});
				}).catch(e => {
					console.log(e);
				});
			}).catch(e => {
				console.log(e);
			});;
		}
	}

	function getSettings() {
		settings.theme = empty(localStorage.getItem("theme")) ? "light" : localStorage.getItem("theme");
		settings.defaultPage = empty(localStorage.getItem("defaultPage")) ? "market" : localStorage.getItem("defaultPage");

		switchTheme(settings.theme);

		for(let i = 0; i < buttonSettingsChoices.length; i++) {
			buttonSettingsChoices[i].classList.remove("active");
		}

		for(let i = 0; i < buttonSettingsChoices.length; i++) {
			if(buttonSettingsChoices[i].getAttribute("data-value") === settings.defaultPage) {
				buttonSettingsChoices[i].classList.add("active");
			}
		}

		setTimeout(() => {
			if(divLoadingOverlay.classList.contains("active")) {
				divLoadingOverlay.classList.remove("active");
			}
		}, 250);
	}

	function getGlobal() {
		return new Promise((resolve, reject) => {
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				xhr.open("GET", "https://api.coingecko.com/api/v3/global", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getBitcoin() {
		return new Promise((resolve, reject) => {
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/bitcoin", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getMarket(page) {
		return new Promise((resolve, reject) => {
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=" + page + "&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	// TODO: Modify after development.
	function getTransactions() {
		return new Promise((resolve, reject) => {
			resolve(transactionsData);
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				xhr.open("GET", "", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getHistoricalData(id, from, to) {
		return new Promise((resolve, reject) => {
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							resolve(JSON.parse(xhr.responseText));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/market_chart/range?vs_currency=usd&from=" + from + "&to=" + to, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}


	function parseTransactions(transactions) {
		let holdings = {};

		let timeframe = "week";

		let now = Date.now();

		let timeHour = 3600 * 1000;
		let timeDay = timeHour * 24;
		let timeWeek = timeDay * 7;
		let timeMonth = timeDay * 30;
		let timeYear = timeDay * 365;

		let pastDay = {};
		let pastWeek = {};
		let pastMonth = {};
		let pastYear = {};

		let startDay = now - timeDay;
		let startWeek = now - timeWeek;
		let startMonth = now - timeMonth;
		let startYear = now - timeYear;

		for(let i = startDay; i < now; i += timeHour) {
			let format = formatHour(new Date(i));
			pastDay[format] = null;
		}

		for(let i = startWeek; i < now; i += timeDay) {
			let format = formatDate(new Date(i));
			pastWeek[format] = null;
		}

		for(let i = startMonth; i < now; i += timeDay) {
			let format = formatDate(new Date(i));
			pastMonth[format] = null;
		}

		for(let i = startYear; i < now; i += timeWeek) {
			let format = formatDate(new Date(i));
			pastYear[format] = null;
		}

		let dates;

		switch(timeframe) {
			case "day":
				dates = pastDay;
				break;
			case "week":
				dates = pastWeek;
				break;
			case "month":
				dates = pastMonth;
				break;
			case "year":
				dates = pastYear;
				break;
		}

		let txs = Object.keys(transactions).sort((a, b) => a.split("-")[0].localeCompare(b.split("-")[0]));

		txs.map(tx => {
			let timestamp = tx.split("-")[0];
			let date = new Date(timestamp * 1000);

			let transaction = transactions[tx];

			let amount = transaction.amount;
			let id = transaction.id;
			let price = transaction.price;
			let symbol = transaction.symbol;
			let type = transaction.type;

			if(id in holdings) {
				let holding = holdings[id];
				let currentAmount = holding.amount;

				if(type === "sell") {
					amount = currentAmount - amount;
					if(amount < 0) {
						amount = 0;
					}
				} else {
					amount = currentAmount + amount;
				}

				holdings[id].amount = amount;
				holdings[id].value = amount * price;
			} else {
				if(amount > 0) {
					if(type === "buy") {
						holdings[id] = {
							"symbol":symbol,
							"amount":amount,
							"value":amount * price
						};
					}
				}
			}
		});

		return holdings;
	}

	function generateChart(dates, totals) {
		let canvas = document.createElement("canvas");
		canvas.classList.add("chart");
		let chart = new Chart(canvas, {
			type:"line",
			data: {
				labels:dates,
				datasets:[{
					label:"Value ($)",
					backgroundColor:"rgba(100,80,150,0.04)",
					borderColor:"rgb(100,80,150)",
					data:totals
				}],
			},
			options: {
				responsive:true,
				legend:false,
				scales: {
					xAxes: [{
						gridLines: {
							color:"rgba(0,0,0,0)"
						}
					}],
					yAxes: [{
						gridLines: {
							color:"rgba(0,0,0,0)"
						}
					}]
				}
			}
		});

		divChartContainer.innerHTML = "";
		divChartContainer.appendChild(canvas);
	}

	function parseHoldings(coins) {
		return new Promise((resolve, reject) => {
			try {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);

							globalData.totalValue = 0;

							let holdings = {};

							Object.keys(response).map(index => {
								let coin = response[index];
								let id = coin.id;
								let price = coin.current_price;
								let amount = coins[id].amount;
								let value = price * amount;

								holdings[id] = {
									symbol:coins[id].symbol,
									amount:amount,
									value:value,
									price:price,
									image:coin.image
								};

								globalData.totalValue += value;
							});

							resolve(Object.fromEntries(
								Object.entries(holdings).sort(([,a],[,b]) => b.value - a.value)
							));
						} else {
							reject("Invalid JSON.");
						}
					}
				});

				let list = Object.keys(coins).join("%2C");

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + list + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}
});

function sum(total, num) {
	return total + num;
}

function formatHour(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	return hours + ":" + minutes;
}

function formatDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return year + " / " + month + " / " + day;
}

function empty(value) {
	if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}

function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return true;
		}
	}
	catch(e) { }
	return false;
}

// Separate number by thousands.
function separateThousands(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function abbreviateNumber(num, digits) {
	let si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "k" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "B" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	];
	let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for(i = si.length - 1; i > 0; i--) {
		if(num >= si[i].value) {
			break;
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function detectMobile() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}