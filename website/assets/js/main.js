document.addEventListener("DOMContentLoaded", () => {
	let globalData = {};
	
	let body = document.body;

	let spanGlobalMarketCap = document.getElementById("global-market-cap");
	let spanGlobalVolume = document.getElementById("global-volume");
	let spanGlobalDominance = document.getElementById("global-dominance");

	let spanPageNumber = document.getElementById("page-number");

	let buttonPreviousPage = document.getElementById("previous-page");
	let buttonNextPage = document.getElementById("next-page");

	let divNavbarBackground = document.getElementById("navbar-background");
	let divNavbarDashboard = document.getElementById("navbar-dashboard");
	let divNavbarMarket = document.getElementById("navbar-market");
	let divNavbarHoldings = document.getElementById("navbar-holdings");
	let divNavbarSettings = document.getElementById("navbar-settings");

	let divPageNavigation = document.getElementById("page-navigation");
	let divMarketList = document.getElementById("market-list");

	detectMobile() ? body.id = "mobile" : body.id = "desktop";

	adjustToScreen();

	listMarket();

	let updateMarketListInterval = setInterval(listMarket, 30000);

	window.addEventListener("resize", () => {
		clearStats();
		clearMarketList();

		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(() => {
			listMarket();
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

	function switchPage(page) {
		divNavbarDashboard.classList.remove("active");
		divNavbarMarket.classList.remove("active");
		divNavbarHoldings.classList.remove("active");
		divNavbarSettings.classList.remove("active");

		switch(page) {
			case "dashboard":
				divNavbarDashboard.classList.add("active");
				divNavbarBackground.setAttribute("class", "background dashboard");
				break;
			case "market":
				divNavbarMarket.classList.add("active");
				divNavbarBackground.setAttribute("class", "background market");
				break;
			case "holdings":
				divNavbarHoldings.classList.add("active");
				divNavbarBackground.setAttribute("class", "background holdings");
				break;
			case "settings":
				divNavbarSettings.classList.add("active");
				divNavbarBackground.setAttribute("class", "background settings");
				break;
		}
	}

	function adjustToScreen() {
		
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

			getMarket(page).then(coins => {
				if(document.getElementsByClassName("coin-wrapper loading").length > 0) {
					document.getElementsByClassName("coin-wrapper loading")[0].remove();
					divMarketList.classList.remove("loading");
				}

				coins.map(coin => {
					let price = parseFloat(coin.current_price);
					if(price > 1) {
						price = separateThousands(price);
					}
					let id = coin.id;
					let marketCap = coin.market_cap;
					if(window.innerWidth <= 960) {
						marketCap = abbreviateNumber(marketCap, 2);
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

							div.innerHTML = '<span class="rank">' + rank + '</span><img src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="price">$ ' + price + '</span><span class="market-cap">$ ' + separateThousands(marketCap) + '</span><span class="day">' + priceChangeDay + '%</span>';

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
});

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