document.addEventListener("DOMContentLoaded", async () => {
	let noAPI;

	const api = "../api/"; // Default: "../api/"
	const updateInterval = 30000; // Default: 30000
	
	const Notify = new XNotify("BottomRight");

	let updateDashboardListInterval = setInterval(listDashboard, updateInterval);
	let updateMarketListInterval = setInterval(listMarket, updateInterval);
	let updateHoldingsListInterval = setInterval(listHoldings, updateInterval);
	let updateActivityListInterval = setInterval(listActivity, updateInterval);

	let sessionToken = localStorage.getItem("token");
	let sessionUsername = localStorage.getItem("username");

	let currencies = {
		usd: "$",
		gbp: "£",
		eur: "€",
		chf: "Fr ",
		aud: "$",
		jpy: "¥",
		cad: "$"
	};

	let settings = {
		currency: "usd"
	};

	let globalData = {};
	
	let body = document.body;

	let spanGlobalMarketCap = document.getElementById("global-market-cap");
	let spanGlobalVolume = document.getElementById("global-volume");
	let spanGlobalDominance = document.getElementById("global-dominance");

	let divLoginWrapper = document.getElementById("login-wrapper");

	let inputLoginUsername = document.getElementById("login-username");
	let inputLoginPassword = document.getElementById("login-password");

	let buttonLogin = document.getElementById("login-button");
	let buttonNoAPIMode = document.getElementById("login-noapi-button");
	let buttonNoAPILogout = document.getElementById("noapi-logout-button");
	let buttonLogout = document.getElementById("logout-button");

	let divLoadingOverlay = document.getElementById("loading-overlay");
	let divPopupOverlay = document.getElementById("popup-overlay");

	let divPopupWrapper = document.getElementById("popup-wrapper");
	let divPopupBottom = divPopupWrapper.getElementsByClassName("bottom")[0];

	let spanPopupTitle = divPopupWrapper.getElementsByClassName("title")[0];

	let buttonPopupClose = divPopupWrapper.getElementsByClassName("close-button")[0];
	
	let divPageDashboard = document.getElementById("page-dashboard");
	let divPageMarket = document.getElementById("page-market");
	let divPageHoldings = document.getElementById("page-holdings");
	let divPageActivity = document.getElementById("page-activity");
	let divPageSettings = document.getElementById("page-settings");

	let divHeaderWrappers = document.getElementsByClassName("headers-wrapper");

	let divDashboardMarketList = document.getElementById("dashboard-market-list");
	let divDashboardHoldingsList = document.getElementById("dashboard-holdings-list");

	let spanDashboardMarketCap = document.getElementById("dashboard-market-cap");
	let spanDashboardMarketChange = document.getElementById("dashboard-market-change");
	let spanDashboardHoldingsValue = document.getElementById("dashboard-holdings-value");

	let spanPageNumber = document.getElementById("page-number");

	let spanHeaderMarketCap = divPageMarket.getElementsByClassName("header market-cap")[0];

	let buttonPreviousPage = document.getElementById("previous-page");
	let buttonNextPage = document.getElementById("next-page");

	let buttonSettingsChoices = divPageSettings.getElementsByClassName("choice");
	let buttonSettingsServerChoices = divPageSettings.getElementsByClassName("server-choice");

	let divNavbarBackground = document.getElementById("navbar-background");
	let divNavbarDashboard = document.getElementById("navbar-dashboard");
	let divNavbarMarket = document.getElementById("navbar-market");
	let divNavbarHoldings = document.getElementById("navbar-holdings");
	let divNavbarActivity = document.getElementById("navbar-activity");
	let divNavbarSettings = document.getElementById("navbar-settings");

	let divPageNavigation = document.getElementById("page-navigation");
	let divMarketList = document.getElementById("market-list");
	let divHoldingsList = document.getElementById("holdings-list");
	let divActivityList = document.getElementById("activity-list");

	let divHoldingsValueCard = document.getElementById("holdings-value-card");
	let divHoldingsAddCard = document.getElementById("holdings-add-card");
	let divHoldingsMoreMenu = document.getElementById("holdings-more-menu");

	let divActivityAddCard = document.getElementById("activity-add-card");

	let inputActivitySearch = document.getElementById("activity-search-input");

	let buttonActivitySearch = document.getElementById("activity-search-button");

	let buttonMoreEdit = document.getElementById("more-edit");
	let buttonMoreRemove = document.getElementById("more-remove");

	let spanHoldingsTotalValue = document.getElementById("holdings-total-value");

	let divThemeToggle = document.getElementById("theme-toggle");

	let inputThemeCSS = document.getElementById("theme-css-input");

	let buttonResetCSS = document.getElementById("theme-css-reset");
	let buttonApplyCSS = document.getElementById("theme-css-confirm");

	let inputCurrentPassword = document.getElementById("input-current-password");
	let inputNewPassword = document.getElementById("input-new-password");
	let inputRepeatPassword = document.getElementById("input-repeat-password");

	let inputAccessPIN = document.getElementById("input-access-pin");
	let inputSharingURL = document.getElementById("sharing-url");

	let inputETHAddress = document.getElementById("input-eth-address");

	let divStorageProgress = document.getElementById("storage-progress");

	let spanStorageText = document.getElementById("storage-text");

	let buttonNoAPIClear = document.getElementById("noapi-clear-button");

	let buttonChangePassword = document.getElementById("change-password-button");
	let buttonManageAccounts = document.getElementById("manage-accounts-button");

	let buttonChangePIN = document.getElementById("change-pin-button");
	let buttonCopyURL = document.getElementById("copy-url-button");

	let buttonImportTokens = document.getElementById("import-tokens-button");

	let buttonImportHoldings = document.getElementById("import-holdings-button");
	let buttonExportHoldings = document.getElementById("export-holdings-button");

	let buttonImportActivity = document.getElementById("import-activity-button");
	let buttonExportActivity = document.getElementById("export-activity-button");

	let buttonDeleteCache = document.getElementById("delete-cache-button");

	let buttonShowQRCode = document.getElementById("show-qr-code-button");

	let buttonDonations = document.getElementsByClassName("donation-button");

	detectMobile() ? body.id = "mobile" : body.id = "desktop";

	adjustToScreen();

	let url = new URL(window.location.href);
	if(url.searchParams.get("access") === "view") {
		divLoadingOverlay.classList.add("active");

		body.classList.add("view-mode");
		document.head.innerHTML += '<link rel="stylesheet" href="./assets/css/view.css">';

		setTimeout(() => {
			if(divLoadingOverlay.classList.contains("active")) {
				divLoadingOverlay.classList.remove("active");
			}

			switchPage("holdings");

			let pin = url.searchParams.get("pin");
			if(empty(pin)) {
				if(empty(sessionToken)) {
					Notify.error({
						title:"Error",
						description:"Access PIN not found in the URL."
					});
				}
			} else {
				sessionToken = pin;
				listHoldings();
			}
		}, 500);
	} else {
		empty(localStorage.getItem("defaultPage")) ? switchPage("market") : switchPage(localStorage.getItem("defaultPage"));

		getLocalSettings().then(() => {
			listDashboard();
			listMarket();
			listHoldings();
			listActivity();
		}).catch(e => {
			console.log(e);
		});
	}

	window.addEventListener("resize", () => {
		clearStats();
		clearMarketList();

		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(() => {
			if(divNavbarDashboard.classList.contains("active")) {
				listDashboard();
			}
			if(divNavbarMarket.classList.contains("active")) {
				listMarket();
			}
			if(divNavbarHoldings.classList.contains("active")) {
				listHoldings();
			}
		}, 1000);

		adjustToScreen();
	});

	document.addEventListener("click", (e) => {
		if(divNavbarHoldings.classList.contains("active")) {
			if(!divHoldingsMoreMenu.classList.contains("hidden")) {
				let whitelist = ["more-menu", "more-menu", "more", "more-icon", "more-path"];
				if(!whitelist.includes(e.target.classList[0]) && !whitelist.includes(e.target.parentElement.classList[0])) {
					divHoldingsMoreMenu.classList.add("hidden");
				}
			}
		}
	});

	document.addEventListener("keydown", (e) => {
		if(e.key.toLocaleLowerCase() === "enter") {
			if(divLoginWrapper.classList.contains("active")) {
				buttonLogin.click();
			}

			if(divPopupWrapper.classList.contains("active") && document.getElementById("popup-confirm")) {
				document.getElementById("popup-confirm").click();
			}
		}
	});

	buttonLogin.addEventListener("click", () => {
		let username = inputLoginUsername.value;
		let password = inputLoginPassword.value;
		login(username, password);
	});

	buttonNoAPIMode.addEventListener("click", () => {
		let json = localStorage.getItem("NoAPI");
		let data;
		if(empty(json)) {
			data = {};
		} else {
			validJSON(json) ? data = JSON.parse(json) : data = {};
		}

		noAPI = new NoAPI(data, "website", localStorage);

		let style = document.createElement("style");
		style.innerHTML = ".noapi-hidden { display:none !important; }";
		document.getElementsByTagName("head")[0].appendChild(style);

		empty(localStorage.getItem("defaultPage")) ? switchPage("market") : switchPage(localStorage.getItem("defaultPage"));

		getLocalSettings().then(() => {
			listDashboard();
			listMarket();
			listHoldings();
			listActivity();
		}).catch(e => {
			console.log(e);
		});
	});

	buttonNoAPILogout.addEventListener("click", () => {
		window.location.reload(true);
	});

	buttonNoAPIClear.addEventListener("click", () => {
		let html = '<button class="reject" id="popup-cancel">Cancel</button><button class="resolve warning" id="popup-confirm">Delete</button>';

		popup("Deleting No-API Data", html, "240px", "120px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			localStorage.removeItem("NoAPI");
			window.location.reload(true);
		});
	});

	buttonLogout.addEventListener("click", () => {
		logout();
	});

	buttonChangePIN.addEventListener("click", () => {
		changeSetting("pin", inputAccessPIN.value).then((response) => {
			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				Notify.success({
					title:"PIN Changed",
					description:response.message
				});
			}
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't change access PIN."
			});
		});
	});

	divPopupOverlay.addEventListener("click", () => {
		hidePopup();
	});

	buttonPopupClose.addEventListener("click", () => {
		hidePopup();
	});

	buttonMoreEdit.addEventListener("click", () => {
		let id = divHoldingsMoreMenu.getAttribute("data-coin");
		let symbol = divHoldingsMoreMenu.getAttribute("data-symbol");
		let currentAmount = divHoldingsMoreMenu.getAttribute("data-amount");

		let html = '<input id="popup-coin" placeholder="Coin Symbol... (e.g. BTC)" value="' + symbol + '" readonly><input id="popup-amount" placeholder="Amount... (e.g. 2.5)" value="' + currentAmount + '" type="number"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		popup("Editing Asset", html, "300px", "240px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			let amount = document.getElementById("popup-amount").value;

			updateHolding(id, amount).then(response => {
				clearHoldingsList();

				if("message" in response) {
					hidePopup();

					Notify.success({
						title:"Asset Updated",
						description:response.message
					});
				} else {
					Notify.error({
						title:"Error",
						description:response.error
					});
				}
				
				listHoldings();
			}).catch(e => {
				Notify.error({
					title:"Error",
					description:"Asset couldn't be updated."
				});
			});
		});

		divHoldingsMoreMenu.classList.add("hidden");
	});

	buttonMoreRemove.addEventListener("click", () => {
		let id = divHoldingsMoreMenu.getAttribute("data-coin");

		divHoldingsMoreMenu.classList.add("hidden");

		let html = '<button class="reject" id="popup-cancel">Cancel</button><button class="resolve warning" id="popup-confirm">Delete</button>';

		popup("Deleting Asset", html, "240px", "120px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			deleteHolding(id).then(response => {
				clearHoldingsList();

				hidePopup();

				if("message" in response) {
					Notify.success({
						title:"Asset Deleted",
						description:response.message
					});
				} else {
					Notify.error({
						title:"Error",
						description:response.error
					});
				}
				
				listHoldings();
			}).catch(e => {
				Notify.error({
					title:"Error",
					description:"Asset couldn't be deleted."
				});
			});
		});
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

	divNavbarActivity.addEventListener("click", () => {
		switchPage("activity");
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

	for(let i = 0; i < divHeaderWrappers.length; i++) {
		let wrapper = divHeaderWrappers[i];
		let list = wrapper.getAttribute("data-list");
		let validLists = ["dashboardMarket", "dashboardHoldings"];
		if(validLists.includes(list)) {
			let headers = wrapper.getElementsByClassName("header");
			for(let j = 0; j < headers.length; j++) {
				let header = headers[j];
				let item = header.getAttribute("data-item");
				header.addEventListener("click", () => {
					let order = "ascending";
					let currentOrder = localStorage.getItem(list + "SortOrder");
					if(currentOrder === "ascending") {
						order = "descending";
					}
					changeSortOrder(list, item, order);
				});
			}
		}
	}

	divHoldingsValueCard.addEventListener("click", () => {
		if(settings.transactionsAffectHoldings === "override" && divHoldingsList.getElementsByClassName("more").length === 0) {
			getActivity().then(events => {
				events = sortActivity(events);

				let coins = [];

				let chartData = {};

				let counter = 0;
				let startDate = previousYear(new Date()).getTime() / 1000;
				for(let i = 0; i < 366; i++) {
					let time = (startDate + counter) * 1000;
					let date = formatDate(new Date(time)).replaceAll(" ", "");
					chartData[date] = { holdingsValue:0 };
					counter += 86400;
				}

				let keys = Object.keys(events);

				keys.map(key => {
					let event = events[key];
					let id = event.id;
					let amount = parseFloat(event.amount);
					let eventTime = parseInt(event.time) * 1000;
					let eventDate = formatDate(new Date(eventTime)).replaceAll(" ", "");
					let previousYearTime = previousYear(new Date());
					if(eventTime > previousYearTime && event.type !== "transfer") {
						if(!coins.includes(id)) {
							coins.push(id);
						}

						if(id in chartData[eventDate]) {
							event.type === "buy" ? chartData[eventDate][id] += amount : chartData[eventDate][id] -= amount;
						} else {
							event.type === "buy" ? chartData[eventDate][id] = amount : chartData[eventDate][id] = -amount;
						}
					}
				});

				let ids = coins.join(",");

				showLoading((coins.length * 2000) + 6000, "This might take a while... Don't touch anything.");

				check();

				let update = setInterval(() => {
					check();
				}, 2000);

				function check() {
					if(document.getElementById("loading-text")) {
						let spanText = document.getElementById("loading-text");
						if(!spanText.hasAttribute("data-current")) {
							spanText.setAttribute("data-current", "0");
						} else {
							spanText.setAttribute("data-current", parseInt(spanText.getAttribute("data-current")) + 1);
						}

						let current = spanText.getAttribute("data-current");
						spanText.textContent = "This might take a while... Don't touch anything. (" + current + " / " + coins.length + ")";
					} else {
						clearInterval(update);
					}
				}
				
				getCoinHistoricalMarketData(ids, settings.currency, previousYear(new Date()), new Date()).then(data => {
					hideLoading();
					
					showLoading(1400, "Generating chart...");

					let keys = Object.keys(data);

					let formattedPrices = {};

					keys.map(coinID => {
						if(!(coinID in formattedPrices)) {
							formattedPrices[coinID] = {};
						}

						let prices = data[coinID].prices;

						for(let i = 0; i < prices.length; i++) {
							let time = prices[i][0];
							let price = prices[i][1];
							let date = formatDate(new Date(time)).replaceAll(" ", "");
							formattedPrices[coinID][date] = price;
						}
					});

					let dates = Object.keys(chartData);

					let startDate;

					for(let i = 0; i < dates.length; i++) {
						let previousDay = chartData[dates[i - 1]];
						let currentDay = chartData[dates[i]];

						if(i - 1 >= 0 && Object.keys(previousDay).length > 1) {
							Object.keys(previousDay).map(coin => {
								if(coin !== "holdingsValue") {
									if(empty(startDate)) {
										startDate = i - 1;
									}

									if(previousDay[coin] < 0) {
										chartData[dates[i - 1]][coin] = 0;
									}

									if(coin in currentDay) {
										chartData[dates[i]][coin] = chartData[dates[i]][coin] + previousDay[coin];
									} else {
										chartData[dates[i]][coin] = previousDay[coin];
									}
								}
							});
						}

						Object.keys(chartData[dates[i]]).map(coin => {
							if(coin !== "holdingsValue") {
								let value = chartData[dates[i]][coin] * formattedPrices[coin][dates[i]];
								chartData[dates[i]].holdingsValue += value;
							}
						});
					}

					holdingsChartPopup(chartData, startDate);
				}).catch(e => {
					console.log(e);
				});
			});
		}
	});

	divHoldingsAddCard.addEventListener("click", () => {
		let html = '<input id="popup-coin" placeholder="Coin Symbol... (e.g. BTC)"><input id="popup-amount" placeholder="Amount... (e.g. 2.5)" type="number"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		let popupHeight = 240;

		popup("Adding Asset", html, "300px", popupHeight + "px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			let id = document.getElementById("popup-coin").value;
			let amount = document.getElementById("popup-amount").value;

			if(empty(id) || empty(amount)) {
				Notify.error({
					title:"Error",
					description:"Both fields must be filled out."
				});
			} else {
				if(isNaN(amount)) {
					Notify.error({
						title:"Error",
						description:"The amount field must be a number."
					});
				} else {
					let symbol = id.trim().toLowerCase();
					getCoinID("symbol", symbol).then(response => {
						Notify.alert({
							title:"Checking...",
							description:"Checking whether or not that coin exists."
						});

						for(let i = 0; i < document.getElementsByClassName("popup-list").length; i++) {
							document.getElementsByClassName("popup-list")[i].remove();
						}

						if("id" in response) {
							addHolding(response.id, amount);
						} else if("matches" in response) {
							Notify.info({
								title:"Multiple Results",
								description:"There are " + response.matches.length + " coins with that symbol. Please choose one from the list.",
								duration:8000
							});

							let inputAmount = document.getElementById("popup-amount");

							let wrapper = document.createElement("div");
							wrapper.classList.add("popup-list");

							let matches = response.matches;
							Object.keys(matches).map(key => {
								let match = matches[key];
								let symbol = Object.keys(match)[0];
								let id = match[symbol];

								let row = document.createElement("div");
								row.innerHTML = '<span class="title">' + symbol.toUpperCase() + '</span><span class="subtitle">' + capitalizeFirstLetter(id) + '</span>';

								row.addEventListener("click", () => {
									addHolding(id, amount);
								});

								wrapper.appendChild(row);
							});

							let addedHeight = matches * 40;

							if(matches.length >= 3) {
								addedHeight = 120;
							}

							let adjustedHeight = (popupHeight + addedHeight) + 20;

							divPopupWrapper.style.height = adjustedHeight + "px";
							divPopupWrapper.style.top = "calc(50% - " + adjustedHeight + "px / 2)";

							insertAfter(wrapper, inputAmount);
						} else {
							Notify.error({
								title:"Error",
								description:"Couldn't add coin. Try adding by ID."
							});
						}
					}).catch(e => {
						console.log(e);
					});
				}
			}
		});
	});

	inputActivitySearch.addEventListener("keydown", (e) => {
		if(e.key.toLowerCase() === "enter") {
			buttonActivitySearch.click();
		}
	});

	inputActivitySearch.addEventListener("input", () => {
		if(empty(inputActivitySearch.value) || empty(inputActivitySearch.value.trim())) {
			let events = divActivityList.getElementsByClassName("event-wrapper");
			for(let i = 0; i < events.length; i++) {
				events[i].classList.remove("hidden");
			}
		}
	});

	buttonActivitySearch.addEventListener("click", () => {
		let input = inputActivitySearch.value;
		if(!empty(input)) {
			let query = input.toLowerCase().trim();

			let events = divActivityList.getElementsByClassName("event-wrapper");

			for(let i = 0; i < events.length; i++) {
				let match = false;
				let data = [];

				let symbol = events[i].getAttribute("data-symbol").toLowerCase().trim();
				let date = events[i].getAttribute("data-date");
				let amount = events[i].getAttribute("data-amount");
				let fee = events[i].getAttribute("data-fee");
				let notes = events[i].getAttribute("data-notes").toLowerCase().trim();
				let type = events[i].getAttribute("data-type").toLowerCase().trim();

				data.push(symbol);
				data.push(date);
				data.push(amount);
				data.push(fee);
				data.push(notes);
				data.push(type);
									
				if(type.toLowerCase() === "transfer") {
					let from = events[i].getAttribute("data-from").toLowerCase().trim();
					let to = events[i].getAttribute("data-to").toLowerCase().trim();

					data.push(from);
					data.push(to);
				} else {
					let exchange = events[i].getAttribute("data-exchange").toLowerCase().trim();
					let pair = events[i].getAttribute("data-pair").toLowerCase().trim();
					let price = events[i].getAttribute("data-price");

					data.push(exchange);
					data.push(pair);
					data.push(price);
				}

				data.map(value => {
					if(value.includes(query)) {
						match = true;
					}
				});

				if(match) {
					events[i].classList.remove("hidden");
				} else {
					events[i].classList.add("hidden");
				}
			}
		}
	});

	divActivityAddCard.addEventListener("click", () => {
		activityPopup("create");
	});

	divThemeToggle.addEventListener("click", () => {
		changeSetting("css", "").then(async (response) => {
			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				if(divThemeToggle.classList.contains("active")) {
					switchTheme("dark");
				} else {
					switchTheme("light");
				}

				await getLocalSettings();
			}
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't remove CSS."
			});
		});
	});

	buttonResetCSS.addEventListener("click", () => {
		if(document.getElementById("custom-css")) {
			document.getElementById("custom-css").remove();
		}

		switchTheme("light");

		changeSetting("css", "").then(async (response) => {
			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				await getLocalSettings();
			}
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't remove CSS."
			});
		});
	});

	buttonApplyCSS.addEventListener("click", () => {
		switchTheme("light");

		changeSetting("css", inputThemeCSS.value).then(async (response) => {
			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				await getLocalSettings();
			}
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't apply CSS."
			});
		});
	});

	for(let i = 0; i < buttonSettingsChoices.length; i++) {
		buttonSettingsChoices[i].addEventListener("click", async () => {
			let key = buttonSettingsChoices[i].parentElement.getAttribute("data-key");
			let value = buttonSettingsChoices[i].getAttribute("data-value");
			localStorage.setItem(key, value);
			processSettingChange(key);
			await getLocalSettings();
		});
	}

	for(let i = 0; i < buttonSettingsServerChoices.length; i++) {
		buttonSettingsServerChoices[i].addEventListener("click", () => {
			let key = buttonSettingsServerChoices[i].parentElement.getAttribute("data-key");
			let value = buttonSettingsServerChoices[i].getAttribute("data-value");
			changeSetting(key, value).then(async (response) => {
				if("error" in response) {
					Notify.error({
						title:"Error",
						description:response.error
					});
				} else {
					await getLocalSettings();
				}
			}).catch(e => {
				console.log(e);
				Notify.error({
					title:"Error",
					description:"Couldn't change setting."
				});
			});
		});
	}

	buttonChangePassword.addEventListener("click", () => {
		let currentPassword = inputCurrentPassword.value;
		let newPassword = inputNewPassword.value;
		let repeatPassword = inputRepeatPassword.value;

		if(!empty(currentPassword) && !empty(newPassword) && !empty(repeatPassword)) {
			if(newPassword === repeatPassword) {
				inputCurrentPassword.value = "";
				inputNewPassword.value = "";
				inputRepeatPassword.value = "";
				
				changePassword(currentPassword, newPassword).then((response) => {
					if("error" in response) {
						Notify.error({
							title:"Error",
							description:response.error
						});
					} else {
						Notify.success({
							title:"Password Changed",
							description:response.message
						});
						checkSession();
					}
				}).catch(e => {
					console.log(e);
					Notify.error({
						title:"Error",
						description:"Couldn't change password."
					});
				});
			} else {
				Notify.error({
					title:"Error",
					description:"The passwords don't match."
				});
			}
		} else {
			Notify.error({
				title:"Error",
				description:"All fields must be filled out."
			});
		}
	});

	buttonManageAccounts.addEventListener("click", () => {
		getAccounts().then(accounts => {
			let users = accounts.accounts;

			let popupHeight = 240;
			let addedHeight = users.length * 40;

			if(users.length >= 3) {
				addedHeight = 120;
			}

			let adjustedHeight = (popupHeight + addedHeight) + 20;

			divPopupWrapper.style.height = adjustedHeight + "px";
			divPopupWrapper.style.top = "calc(50% - " + adjustedHeight + "px / 2)";

			popup("Manage Accounts", '<div id="popup-list" class="popup-list"></div><div id="popup-choice"><button id="popup-create" data-value="create" class="choice active">Create</button><button id="popup-delete" data-value="delete" class="choice">Delete</button></div><input id="popup-username" placeholder="Username..." type="text"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>', "300px", adjustedHeight + "px");

			let divPopupList = document.getElementById("popup-list");

			let inputUsername = document.getElementById("popup-username");

			users.map(user => {
				let row = document.createElement("div");
				row.innerHTML = '<span class="title">' + user + '</span>';

				row.addEventListener("click", () => {
					inputUsername.value = user;
				});

				divPopupList.appendChild(row);
			});

			let choices = document.getElementById("popup-choice").getElementsByClassName("choice");
			for(let i = 0; i < choices.length; i++) {
				choices[i].addEventListener("click", () => {
					for(let j = 0; j < choices.length; j++) {
						choices[j].classList.remove("active");
					}
					choices[i].classList.add("active");
				});
			}

			document.getElementById("popup-cancel").addEventListener("click", () => {
				hidePopup();
			});

			document.getElementById("popup-confirm").addEventListener("click", () => {
				let username = inputUsername.value;

				if(!empty(username)) {
					if(username.toLowerCase().trim() !== "admin") {
						if(document.getElementById("popup-create").classList.contains("active")) {
							createAccount(username).then(response => {
								if("error" in response) {
									Notify.error({
										title:"Error",
										description:response.error
									});
								} else {
									Notify.success({
										title:"Account Created",
										description:response.message
									});

									hidePopup();
								}
							}).catch(e => {
								console.log(e);
								Notify.error({
									title:"Error",
									description:"Couldn't create account."
								});
							});
						} else {
							deleteAccount(username).then(response => {
								if("error" in response) {
									Notify.error({
										title:"Error",
										description:response.error
									});
								} else {
									Notify.success({
										title:"Account Deleted",
										description:response.message
									});

									hidePopup();
								}
							}).catch(e => {
								console.log(e);
								Notify.error({
									title:"Error",
									description:"Couldn't delete account."
								});
							});
						}
					} else {
						Notify.error({
							title:"Error",
							description:"The admin account cannot be modified."
						});
					}
				} else {
					Notify.error({
						title:"Error",
						description:"Please fill out the input field."
					});
				}
			});
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't fetch accounts."
			});
		});
	});

	buttonCopyURL.addEventListener("click", () => {
		inputSharingURL.select();
		inputSharingURL.setSelectionRange(0, 99999);

		document.execCommand("copy");
		
		if(window.getSelection) {
			window.getSelection().removeAllRanges();
		} else if(document.selection) {
			document.selection.empty();
		}

		Notify.success({
			title:"Copied To Clipboard",
			description:"The URL has been copied to your clipboard."
		});
	});

	buttonImportTokens.addEventListener("click", () => {
		let address = inputETHAddress.value;

		if(!empty(address)) {
			getETHAddressBalance(address).then(balance => {
				let eth = parseFloat(balance["ETH"].balance.toFixed(3));
				let tokens = balance.tokens;

				let index = 0;

				Object.keys(tokens).map(key => {
					index++;

					let token = tokens[key];
					let info = token.tokenInfo;
					let symbol = info.symbol;
					if("coingecko" in info) {
						let balance = token.balance;
						let string = balance.toFixed(0);
						let decimals = parseInt(info.decimals);
						let position = string.length - decimals;
						let split = string.split("");
						split.splice(position, 0, ".");
						let join = split.join("");
						
						let id = info.coingecko;
						let amount = parseFloat(parseFloat(join).toFixed(2));

						setTimeout(() => {
							getCoinID("id", id).then(response => {
								if("id" in response) {
									if(settings.importTokens === "add") {
										addHolding(id, amount);
									} else {
										updateHolding(id, amount);
									}
								} else {
									Notify.error({
										title:"Error",
										description:"Couldn't add " + symbol + "."
									});
								}
							}).catch(e => {
								console.log(e);
								Notify.error({
									title:"Error",
									description:"Couldn't find " + symbol + "."
								});
							});
						}, index * 4000);

						Notify.info({
							title:"Adding " + symbol,
							description:"Adding asset to holdings."
						});
					} else {
						Notify.error({
							title:symbol + " Not Found",
							description:symbol + " isn't listed on CoinGecko."
						});
					}
				});
			}).catch(e => {
				console.log(e);
				Notify.error({
					title:"Error",
					description:"Couldn't fetch balance."
				});
			});
		} else {
			Notify.error({
				title:"Error",
				description:"Please provide an address to fetch the balance of."
			});
		}
	});

	buttonImportHoldings.addEventListener("click", () => {
		upload().then(data => {
			let rows = data.split(/\r?\n/);
			if(rows[0] === "id,symbol,amount") {
				let formatted = [];
				rows.map(row => {
					if(!empty(row) && !row.toLowerCase().includes("symbol,")) {
						formatted.push(row);
					}
				});
				importHoldings(formatted);
			} else {
				Notify.error({
					title:"Error",
					description:"Invalid column order. Expected: id, symbol, amount. Make sure to include the header row as well.",
					duration:8000
				});
			}
		});
	});

	buttonExportHoldings.addEventListener("click", () => {
		if(!empty(noAPI)) {
			downloadCSV(noAPI.exportHoldings(), "Holdings-" + Math.floor(new Date().getTime() / 1000) + ".csv");
		} else {
			download(api + "holdings/export.php?token=" + sessionToken + "&username=" + sessionUsername);
		}
	});

	buttonImportActivity.addEventListener("click", () => {
		upload().then(data => {
			let rows = data.split(/\r?\n/);
			if(rows[0].includes("id,symbol,date,type,amount,fee,notes,exchange,pair,price,from,to")) {
				let formatted = [];
				rows.map(row => {
					if(!empty(row) && !row.toLowerCase().includes("symbol,")) {
						if(rows[0].includes("txID")) {
							formatted.push(row);
						} else {
							formatted.push("-," + row);
						}
					}
				});
				importActivity(formatted);
			} else {
				Notify.error({
					title:"Error",
					description:"Invalid column order. Expected: id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to. Make sure to include the header row as well.",
					duration:12000
				});
			}
		});
	});

	buttonExportActivity.addEventListener("click", () => {
		if(!empty(noAPI)) {
			downloadCSV(noAPI.exportActivity(), "Activity-" + Math.floor(new Date().getTime() / 1000) + ".csv");
		} else {
			download(api + "activity/export.php?token=" + sessionToken + "&username=" + sessionUsername);
		}
	});

	buttonDeleteCache.addEventListener("click", () => {
		deleteCache().then(response => {
			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				Notify.success({
					title:"Cache Deleted",
					description:response.message
				});
			}
		}).catch(e => {
			console.log(e);
			Notify.error({
				title:"Error",
				description:"Couldn't delete cache."
			});
		});
	});

	buttonShowQRCode.addEventListener("click", () => {
		let html = '<span class="message">Generating a QR code would log you out of any mobile device you\'re currently logged in on.</span><input id="popup-password" placeholder="Password..." type="password"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		popup("Confirmation", html, "340px", "310px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			let password = document.getElementById("popup-password").value;

			if(!empty(password)) {
				console.log("Logging In...");

				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);

							if("error" in response) {
								Notify.error({
									title:"Error",
									description:response.error
								});
							} else {
								if(response.valid) {
									let token = response.token;

									hidePopup();

									setTimeout(() => {
										let html = '<span class="message">Please scan the QR code with the Cryptofolio mobile app from the login screen.</span><div class="popup-canvas-wrapper"></div><button class="reject" id="popup-dismiss">Dismiss</button>';
				
										popup("QR Login Code", html, "400px", "540px");

										let qrStyle = JSON.parse(qrCodeStyle);
										qrStyle.width = 340;
										qrStyle.height = 340;
										qrStyle.data = token + "!" + new URL(api, document.baseURI).href + "!" + sessionUsername;

										let qrCode = new QRCodeStyling(qrStyle);

										qrCode.append(document.getElementsByClassName("popup-canvas-wrapper")[0]);

										document.getElementById("popup-dismiss").addEventListener("click", () => {
											hidePopup();
										});
									}, 300);
								}
							}
						} else {
							Notify.error({
								title:"Error",
								description:"Invalid JSON."
							});
						}
					}
				});

				xhr.open("POST", api + "accounts/login.php?platform=app", true);
				xhr.send(JSON.stringify({ username:sessionUsername, password:password }));
			} else {
				Notify.error({
					title:"Error",
					description:"Please enter your password."
				});
			}
		});
	});

	for(let i = 0; i < buttonDonations.length; i++) {
		buttonDonations[i].addEventListener("click", () => {
			let symbol = buttonDonations[i].getAttribute("data-symbol");
			donationPopup(symbol);
		});
	}

	function donationPopup(symbol) {
		let addresses = {
			ADA: "addr1qyh9ejp2z7drzy8vzpyfeuvzuej5t5tnmjyfpfjn0vt722zqupdg44rqfw9fd8jruaez30fg9fxl34vdnncc33zqwhlqn37lz4",
			XMR: "49wDQf83p5tHibw9ay6fBvcv48GJynyjVE2V8EX8Vrtt89rPyECRm5zbBqng3udqrYHTjsZStSpnMCa8JRw7cfyGJwMPxDM",
			ETH: "0x40E1452025d7bFFDfa05d64C2d20Fb87c2b9C0be",
			BCH: "qrvyd467djuxtw5knjt3d50mqzspcf6phydmyl8ka0",
			BTC: "bc1qdy5544m2pwpyr6rhzcqwmerczw7e2ytjjc2wvj",
			LTC: "ltc1qq0ptdjsuvhw6gz9m4huwmhq40gpyljwn5hncxz",
			NANO: "nano_3ed4ip7cjkzkrzh9crgcdipwkp3h49cudxxz4t8x7pkb8rad7bckqfhzyadg",
			DOT: "12nGqTQsgEHwkAuHGNXpvzcfgtQkTeo3WCZgwrXLsiqs3KyA"
		};

		let html = '<span class="message">Donate ' + symbol + '</span><div class="popup-canvas-wrapper donation"></div><span class="message break">' + addresses[symbol] + '</span><button class="reject" id="popup-dismiss">Dismiss</button>';
				
		popup("Donation Address", html, "400px", "520px");

		let style = { 
			width:310,
			height:310,
			data:addresses[symbol],
			margin:0,
			qrOptions: {
				typeNumber:0,
				mode:"Byte",
				errorCorrectionLevel:"Q"
			},
			backgroundOptions: {
				color:"rgba(0,0,0,0)"
			}
		};

		let qrCode = new QRCodeStyling(style);

		qrCode.append(document.getElementsByClassName("popup-canvas-wrapper")[0]);

		document.getElementById("popup-dismiss").addEventListener("click", () => {
			hidePopup();
		});
	}

	function watchlistPopup() {
		let html = '<input id="popup-coin" placeholder="Coin Symbol... (e.g. BTC)"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		let popupHeight = 180;

		popup("Adding to Watchlist", html, "300px", popupHeight + "px");

		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});

		document.getElementById("popup-confirm").addEventListener("click", () => {
			let inputCoin = document.getElementById("popup-coin");
			let id = inputCoin.value;

			if(empty(id)) {
				Notify.error({
					title:"Error",
					description:"Please provide the ticker/symbol or ID of the coin."
				});
			} else {
				let symbol = id.trim().toLowerCase();
				getCoinID("symbol", symbol).then(response => {
					Notify.alert({
						title:"Checking...",
						description:"Checking whether or not that coin exists."
					});

					for(let i = 0; i < document.getElementsByClassName("popup-list").length; i++) {
						document.getElementsByClassName("popup-list")[i].remove();
					}

					if("id" in response) {
						addWatchlist(response.id, response.symbol);
					} else if("matches" in response) {
						Notify.info({
							title:"Multiple Results",
							description:"There are " + response.matches.length + " coins with that symbol. Please choose one from the list.",
							duration:8000
						});

						let wrapper = document.createElement("div");
						wrapper.classList.add("popup-list");

						let matches = response.matches;
						Object.keys(matches).map(key => {
							let match = matches[key];
							let symbol = Object.keys(match)[0];
							let id = match[symbol];

							let row = document.createElement("div");
							row.innerHTML = '<span class="title">' + symbol.toUpperCase() + '</span><span class="subtitle">' + capitalizeFirstLetter(id) + '</span>';

							row.addEventListener("click", () => {
								addWatchlist(id, symbol);
							});

							wrapper.appendChild(row);
						});

						let addedHeight = matches * 40;

						if(matches.length >= 3) {
							addedHeight = 120;
						}

						let adjustedHeight = (popupHeight + addedHeight) + 20;

						divPopupWrapper.style.height = adjustedHeight + "px";
						divPopupWrapper.style.top = "calc(50% - " + adjustedHeight + "px / 2)";

						insertAfter(wrapper, inputCoin);
					} else {
						Notify.error({
							title:"Error",
							description:"Couldn't add coin. Try adding by ID."
						});
					}
				}).catch(e => {
					console.log(e);
				});
			}
		});

		function addWatchlist(id, symbol) {
			createWatchlist(id, symbol).then(response => {
				hidePopup();
				
				if("error" in response) {
					Notify.error({
						title:"Error",
						description:response.error
					});
				} else {
					Notify.success({
						title:"Added to Watchlist",
						description:response.message
					});
				}
				clearDashboard();
				listDashboard();
			}).catch(e => {
				Notify.error({
					title:"Error",
					description:"Couldn't add coin to watchlist."
				});
				console.log(e);
			});
		}
	}

	function marketChartPopup(coinID, symbol, currentPrice) {
		showLoading(10000);

		getCoinInfo(coinID).then(info => {
			getCoinHistoricalMarketData(coinID, settings.currency, previousYear(new Date()), new Date()).then(data => {
				data = parseMarketData(data[coinID], new Date().getTime(), currentPrice);

				if(empty(info.description.en)) {
					info.description.en = "No description found for " + symbol.toUpperCase() + ".";
				}

				let html = '<div class="coin-popup-wrapper"><div class="coin-chart-wrapper"></div><div class="stats-wrapper noselect"><span class="stats-icon-wrapper" id="coin-popup-watchlist"><svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"/></svg></span><span id="coin-popup-ath">All-Time High: ...</span></div><span class="message">' + info.description.en + '</span><button class="reject" id="popup-dismiss">Back</button></div>';

				popup(symbol.toUpperCase() + " / " + settings.currency.toUpperCase() + " - " + info.name, html, "calc(100% - 40px)", "calc(100% - 40px)", { delay:1500, closeIcon:true });

				generateMarketChart(document.getElementsByClassName("coin-chart-wrapper")[0], "Price", data.labels, data.tooltips, data.prices, { symbol:symbol });

				let ath = parseFloat(info.market_data.ath[settings.currency]);

				if(ath > 1) {
					ath = separateThousands(ath.toFixed(2));
				}

				document.getElementById("coin-popup-ath").textContent = "All-Time High: " + currencies[settings.currency] + ath + " (" + formatDateHuman(new Date(Date.parse(info.market_data.ath_date[settings.currency]))).replaceAll(" ", "") + ")";

				let buttonWatchlist = document.getElementById("coin-popup-watchlist");

				getWatchlist().then(watchlist => {
					if(Object.keys(watchlist).includes(coinID)) {
						buttonWatchlist.classList.add("active");
					}
				}).catch(e => {
					Notify.error({
						title:"Error",
						description:"Couldn't fetch watchlist."
					});
					console.log(e);
				});

				buttonWatchlist.addEventListener("click", () => {
					if(buttonWatchlist.classList.contains("active")) {
						deleteWatchlist(coinID).then(response => {
							if("error" in response) {
								Notify.error({
									title:"Error",
									description:response.error
								});
							} else {
								Notify.success({
									title:"Removed from Watchlist",
									description:response.message
								});
								buttonWatchlist.classList.remove("active");
							}
							clearDashboard();
							listDashboard();
						}).catch(e => {
							Notify.error({
								title:"Error",
								description:"Couldn't remove coin from watchlist."
							});
							console.log(e);
						});
					} else {
						createWatchlist(coinID, symbol).then(response => {
							if("error" in response) {
								Notify.error({
									title:"Error",
									description:response.error
								});
							} else {
								Notify.success({
									title:"Added to Watchlist",
									description:response.message
								});
								buttonWatchlist.classList.add("active");
							}
							clearDashboard();
							listDashboard();
						}).catch(e => {
							Notify.error({
								title:"Error",
								description:"Couldn't add coin to watchlist."
							});
							console.log(e);
						});
					}
				});

				document.getElementById("popup-dismiss").addEventListener("click", () => {
					hidePopup();
				});

				setTimeout(() => {
					hideLoading();
				}, 1400);
			}).catch(e => {
				console.log(e);
			});
		}).catch(e => {
			console.log(e);
		});
	}

	function holdingsChartPopup(chartData, startDate) {
		let today = formatDate(new Date()).replaceAll(" ", "");

		delete chartData[today];

		if(!(today in chartData) || empty(chartData[today]) || isNaN(chartData[today].holdingsValue)) {
			let holdingsData = localStorage.getItem("holdingsData");
			if(validJSON(holdingsData)) {
				chartData[today] = { holdingsValue:0 };

				let holdings = JSON.parse(holdingsData);
				let keys = Object.keys(holdings);
							
				keys.map(id => {
					chartData[today][id] = parseFloat(holdings[id].amount);
					chartData[today].holdingsValue += parseFloat(holdings[id].value);
				});
			}
		}

		let labels = [];
		let tooltips = [];
		let values = [];

		let dates = Object.keys(chartData);
		
		for(let i = startDate; i < dates.length; i++) {
			let date = dates[i];

			labels.push(new Date(Date.parse(date)));
			tooltips.push(formatDateHuman(new Date(Date.parse(date))));
			
			if(chartData[date].holdingsValue < 0) {
				values.push(0);
			} else {
				values.push(chartData[date].holdingsValue);
			}
		}
		
		let currentValue = chartData[today].holdingsValue;

		let value0d = values.length >= 1 ? values[values.length - 1] : "-";
		let value1d = values.length >= 2 ? values[values.length - 2] : "-";
		let value1w = values.length >= 7 ? values[values.length - 8] : "-";
		let value1m = values.length >= 30 ? values[values.length - 31] : "-";
		let value3m = values.length >= 90 ? values[values.length - 91] : "-";
		let value6m = values.length >= 180 ? values[values.length - 181] : "-";
		let value1y = values.length >= 365 ? values[values.length - 366] : "-";

		let stats = "";

		if(!isNaN(value0d) && value0d > 1) {
			value0d = separateThousands(value0d.toFixed(2));
			stats += '<span>Current (' + currencies[settings.currency] + '): ' + value0d + '</span>';
		}
		if(!isNaN(value1d) && value1d > 1) {
			let spanClass = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "positive" : "negative";
			value1d = separateThousands((currentValue - value1d).toFixed(2));
			stats += '<span class="' + spanClass + '">1D (' + currencies[settings.currency] + '): ' + value1d + '</span>';
		}
		if(!isNaN(value1w) && value1w > 1) {
			let spanClass = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "positive" : "negative";
			value1w = separateThousands((currentValue - value1w).toFixed(2));
			stats += '<span class="' + spanClass + '">1W (' + currencies[settings.currency] + '): ' + value1w + '</span>';
		}
		if(!isNaN(value1m) && value1m > 1) {
			let spanClass = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "positive" : "negative";
			value1m = separateThousands((currentValue - value1m).toFixed(2));
			stats += '<span class="' + spanClass + '">1M (' + currencies[settings.currency] + '): ' + value1m + '</span>';
		}
		if(!isNaN(value3m) && value3m > 1) {
			let spanClass = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "positive" : "negative";
			value3m = separateThousands((currentValue - value3m).toFixed(2));
			stats += '<span class="' + spanClass + '">3M (' + currencies[settings.currency] + '): ' + value3m + '</span>';
		}
		if(!isNaN(value6m) && value6m > 1) {
			let spanClass = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "positive" : "negative";
			value6m = separateThousands((currentValue - value6m).toFixed(2));
			stats += '<span class="' + spanClass + '">6M (' + currencies[settings.currency] + '): ' + value6m + '</span>';
		}
		if(!isNaN(value1y) && value1y > 1) {
			let spanClass = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "positive" : "negative";
			value1y = separateThousands((currentValue - value1y).toFixed(2));
			stats += '<span class="' + spanClass + '">1Y (' + currencies[settings.currency] + '): ' + value1y + '</span>';
		}

		let html = '<div class="holdings-popup-wrapper"><div class="holdings-chart-wrapper"></div><div class="stats-wrapper noselect">' + stats + '</div><button class="reject" id="popup-dismiss">Back</button></div>';

		popup("Holdings Performance", html, "calc(100% - 40px)", "calc(100% - 40px)", { delay:1500, closeIcon:true });

		generateHoldingsChart(document.getElementsByClassName("holdings-chart-wrapper")[0], "Value", labels, tooltips, values);

		document.getElementById("popup-dismiss").addEventListener("click", () => {
			hidePopup();
		});
	}

	async function individualHoldingChartPopup(coinID, firstEvent, chartData, startDate) {
		let today = formatDate(new Date()).replaceAll(" ", "");

		delete chartData[today];

		if(!(today in chartData) || empty(chartData[today]) || isNaN(chartData[today].holdingsValue)) {
			let holdingsData = localStorage.getItem("holdingsData");
			if(validJSON(holdingsData)) {
				chartData[today] = { holdingsValue:0 };

				let holdings = JSON.parse(holdingsData);
				let keys = Object.keys(holdings);

				keys.map(id => {
					if(coinID === id) {
						chartData[today][id] = parseFloat(holdings[id].amount);
						chartData[today].holdingsValue += parseFloat(holdings[id].value);
					}
				});
			}
		}

		let initialAmount = parseFloat(firstEvent.amount);
		let initialPrice = parseFloat(firstEvent.price);
		if(initialPrice <= 0) {
			let initialDate = new Date(Date.parse(firstEvent.date));
			let coinPrice = await getCoinPrice(coinID, formatDateHyphenated(initialDate));
			initialPrice = coinPrice?.market_data?.current_price[settings.currency];
		}

		let initialValue = initialAmount * initialPrice;

		let labels = [];
		let tooltips = [];
		let values = [initialValue];

		let dates = Object.keys(chartData);
		
		for(let i = startDate; i < dates.length; i++) {
			let date = dates[i];

			labels.push(new Date(Date.parse(date)));
			tooltips.push(formatDateHuman(new Date(Date.parse(date))));
			
			if(chartData[date].holdingsValue < 0) {
				values.push(0);
			} else {
				values.push(chartData[date].holdingsValue);
			}
		}
		
		let currentValue = chartData[today].holdingsValue;

		let value0d = values.length >= 1 ? values[values.length - 1] : "-";
		let value1d = values.length >= 2 ? values[values.length - 2] : "-";
		let value1w = values.length >= 7 ? values[values.length - 8] : "-";
		let value1m = values.length >= 30 ? values[values.length - 31] : "-";
		let value3m = values.length >= 90 ? values[values.length - 91] : "-";
		let value6m = values.length >= 180 ? values[values.length - 181] : "-";
		let value1y = values.length >= 365 ? values[values.length - 366] : "-";
		let valueAll = values[0];

		let stats = "";

		if(!isNaN(value0d) && value0d > 1) {
			value0d = separateThousands(value0d.toFixed(2));
			stats += '<span>Current (' + currencies[settings.currency] + '): ' + value0d + '</span>';
		}
		if(!isNaN(value1d) && value1d > 1) {
			let spanClass = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "positive" : "negative";
			let percentage1d = (((currentValue - value1d) / currentValue) * 100).toFixed(2);
			value1d = separateThousands((currentValue - value1d).toFixed(2));
			stats += '<span class="' + spanClass + '">1D (' + currencies[settings.currency] + '): ' + value1d + ' (' + percentage1d + '%)</span>';
		}
		if(!isNaN(value1w) && value1w > 1) {
			let spanClass = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "positive" : "negative";
			let percentage1w = (((currentValue - value1w) / currentValue) * 100).toFixed(2);
			value1w = separateThousands((currentValue - value1w).toFixed(2));
			stats += '<span class="' + spanClass + '">1W (' + currencies[settings.currency] + '): ' + value1w + ' (' + percentage1w + '%)</span>';
		}
		if(!isNaN(value1m) && value1m > 1) {
			let spanClass = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "positive" : "negative";
			let percentage1m = (((currentValue - value1m) / currentValue) * 100).toFixed(2);
			value1m = separateThousands((currentValue - value1m).toFixed(2));
			stats += '<span class="' + spanClass + '">1M (' + currencies[settings.currency] + '): ' + value1m + ' (' + percentage1m + '%)</span>';
		}
		if(!isNaN(value3m) && value3m > 1) {
			let spanClass = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "positive" : "negative";
			let percentage3m = (((currentValue - value3m) / currentValue) * 100).toFixed(2);
			value3m = separateThousands((currentValue - value3m).toFixed(2));
			stats += '<span class="' + spanClass + '">3M (' + currencies[settings.currency] + '): ' + value3m + ' (' + percentage3m + '%)</span>';
		}
		if(!isNaN(value6m) && value6m > 1) {
			let spanClass = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "positive" : "negative";
			let percentage6m = (((currentValue - value6m) / currentValue) * 100).toFixed(2);
			value6m = separateThousands((currentValue - value6m).toFixed(2));
			stats += '<span class="' + spanClass + '">6M (' + currencies[settings.currency] + '): ' + value6m + ' (' + percentage6m + '%)</span>';
		}
		if(!isNaN(value1y) && value1y > 1) {
			let spanClass = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "positive" : "negative";
			let percentage1y = (((currentValue - value1y) / currentValue) * 100).toFixed(2);
			value1y = separateThousands((currentValue - value1y).toFixed(2));
			stats += '<span class="' + spanClass + '">1Y (' + currencies[settings.currency] + '): ' + value1y + ' (' + percentage1y + '%)</span>';
		}
		if(!isNaN(valueAll) && valueAll > 1) {
			let spanClass = (currentValue - valueAll) === 0 ? "" : (currentValue - valueAll) > 0 ? "positive" : "negative";
			let percentageAll = (((currentValue - valueAll) / currentValue) * 100).toFixed(2);
			valueAll = separateThousands((currentValue - valueAll).toFixed(2));
			stats += '<span class="' + spanClass + '">All (' + currencies[settings.currency] + '): ' + valueAll + ' (' + percentageAll + '%)</span>';
		}

		let html = '<div class="holdings-popup-wrapper"><div class="holdings-chart-wrapper"></div><div class="stats-wrapper noselect">' + stats + '</div><button class="reject" id="popup-dismiss">Back</button></div>';

		popup(firstEvent.symbol.toUpperCase() + " - Holding Performance", html, "calc(100% - 40px)", "calc(100% - 40px)", { delay:1500, closeIcon:true });

		generateHoldingsChart(document.getElementsByClassName("holdings-chart-wrapper")[0], "Value", labels, tooltips, values);

		document.getElementById("popup-dismiss").addEventListener("click", () => {
			hidePopup();
		});
	}

	function login(username, password) {
		try {
			if(empty(noAPI)) {
				console.log("Logging In...");

				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);

							if("error" in response) {
								Notify.error({
									title:"Error",
									description:response.error
								});
							} else {
								if(response.valid) {
									sessionToken = response.token;
									sessionUsername = response.username;

									localStorage.setItem("token", response.token);
									localStorage.setItem("username", response.username);

									Notify.success({
										title:"Logging In...",
										description:response.message
									});

									setTimeout(() => {
										empty(localStorage.getItem("defaultPage")) ? switchPage("market") : switchPage(localStorage.getItem("defaultPage"));

										getLocalSettings().then(() => {
											listDashboard();
											listMarket();
											listHoldings();
											listActivity();
										}).catch(e => {
											console.log(e);
										});
										
										divLoginWrapper.classList.remove("active");
									}, 250);

									inputLoginPassword.value = "";
									inputLoginPassword.blur();

									if(sessionUsername === "admin") {
										buttonManageAccounts.classList.remove("hidden");
									} else {
										buttonManageAccounts.classList.add("hidden");
									}
								}
							}
						} else {
							Notify.error({
								title:"Error",
								description:"Invalid JSON."
							});
						}
					}
				});

				xhr.open("POST", api + "accounts/login.php?platform=web", true);
				xhr.send(JSON.stringify({ username:username, password:password }));
			}
		} catch(e) {
			reject(e);
		}
	}

	function logout() {
		try {
			if(empty(noAPI)) {
				let xhr = new XMLHttpRequest();

				xhr.addEventListener("readystatechange", () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(validJSON(xhr.responseText)) {
							let response = JSON.parse(xhr.responseText);

							if("error" in response) {
								Notify.error({
									title:"Error",
									description:response.error
								});
							} else {
								sessionToken = null;
								sessionUsername = null;

								localStorage.removeItem("token");
								localStorage.removeItem("username");

								Notify.success({
									title:"Logging Out...",
									description:response.message
								});

								clearDashboard();
								clearMarketList();
								clearHoldingsList();
								clearActivityList();

								spanHoldingsTotalValue.textContent = "...";

								inputAccessPIN.value = "";
								inputCurrentPassword.value = "";
								inputNewPassword.value = "";
								inputRepeatPassword.value = "";

								divLoginWrapper.classList.add("active");
							}
						} else {
							Notify.error({
								title:"Error",
								description:"Invalid JSON."
							});
						}
					}
				});

				xhr.open("GET", api + "accounts/logout.php?platform=web&token=" + sessionToken + "&username=" + sessionUsername, true);
				xhr.send();
			}
		} catch(e) {
			reject(e);
		}
	}

	function checkSession() {
		if(!empty(noAPI)) {
			setTimeout(() => {
				if(divLoadingOverlay.classList.contains("active")) {
					divLoadingOverlay.classList.remove("active");
				}
			}, 250);

			if(divLoginWrapper.classList.contains("active")) {
				divLoginWrapper.classList.remove("active");
			}

			return;
		}

		if(empty(sessionToken) || empty(sessionUsername)) {
			if(divLoadingOverlay.classList.contains("active")) {
				divLoadingOverlay.classList.remove("active");
			}

			showLogin();
		} else {
			verifySession(sessionToken).then(response => {
				setTimeout(() => {
					if(divLoadingOverlay.classList.contains("active")) {
						divLoadingOverlay.classList.remove("active");
					}
				}, 250);

				if("valid" in response && response.valid) {
					sessionUsername = response.username;

					if(divLoginWrapper.classList.contains("active")) {
						divLoginWrapper.classList.remove("active");
					}

					if(sessionUsername === "admin") {
						buttonManageAccounts.classList.remove("hidden");
					}
				} else {
					showLogin();
				}
			}).catch(e => {
				console.log(e);
			});
		}
	}

	function showLogin() {
		sessionToken = null;
		sessionUsername = null;

		localStorage.removeItem("token");
		localStorage.removeItem("username");
		
		if(!divLoginWrapper.classList.contains("active")) {
			divLoginWrapper.classList.add("active");
			inputLoginUsername.focus();
		}

		buttonManageAccounts.classList.add("hidden");
	}

	function popup(title, html, width, height, options) {
		divPopupOverlay.classList.add("active");
		divPopupWrapper.style.width = width;
		divPopupWrapper.style.height = height;
		divPopupWrapper.style.left = "calc(50% - " + width + " / 2)";
		divPopupWrapper.style.top = "calc(50% - " + height + " / 2)";
		divPopupWrapper.classList.add("active");
		spanPopupTitle.textContent = title;
		buttonPopupClose.classList.add("hidden");
		divPopupBottom.innerHTML = html;

		let delay = options?.delay;

		if(empty(delay)) {
			delay = 100;
		}

		setTimeout(() => {
			divPopupOverlay.style.opacity = 1;
			divPopupWrapper.style.opacity = 1;
		}, delay);

		if(options?.closeIcon) {
			buttonPopupClose.classList.remove("hidden");
		}
	}

	function hidePopup() {
		divPopupOverlay.style.opacity = 0;
		divPopupWrapper.style.opacity = 0;

		setTimeout(() => {
			divPopupOverlay.classList.remove("active");
			divPopupWrapper.classList.remove("active");
			spanPopupTitle.textContent = "Popup Title";
			divPopupBottom.remove();

			let div = document.createElement("div");
			div.classList.add("bottom");
			divPopupWrapper.appendChild(div);
			divPopupBottom = divPopupWrapper.getElementsByClassName("bottom")[0];
		}, 250);
	}

	function showLoading(limit, text) {
		if(empty(text)) {
			text = "";
		}

		hideLoading();

		let element = document.createElement("div");
		element.classList.add("loading-screen");
		element.innerHTML = '<div class="loading-icon"><div></div><div></div></div><span id="loading-text">' + text + '</span>';
		document.body.appendChild(element);

		setTimeout(() => {
			element.remove();
		}, limit);
	}

	function hideLoading() {
		for(let i = 0; i < document.getElementsByClassName("loading-screen").length; i++) {
			document.getElementsByClassName("loading-screen")[i].remove();
		}
	}

	function switchTheme(theme) {
		if(document.getElementById("custom-css")) {
			document.getElementById("custom-css").remove();
		}

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

	async function switchPage(page) {
		divNavbarDashboard.classList.remove("active");
		divNavbarMarket.classList.remove("active");
		divNavbarHoldings.classList.remove("active");
		divNavbarActivity.classList.remove("active");
		divNavbarSettings.classList.remove("active");

		divPageDashboard.classList.remove("active");
		divPageMarket.classList.remove("active");
		divPageHoldings.classList.remove("active");
		divPageActivity.classList.remove("active");
		divPageSettings.classList.remove("active");

		getLocalSettings().then(() => {
			switch(page) {
				case "dashboard":
					divNavbarDashboard.classList.add("active");
					divPageDashboard.classList.add("active");
					divNavbarBackground.setAttribute("class", "background dashboard");
					listDashboard();
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
				case "activity":
					divNavbarActivity.classList.add("active");
					divPageActivity.classList.add("active");
					divNavbarBackground.setAttribute("class", "background activity");
					listActivity();
					break;
				case "settings":
					divNavbarSettings.classList.add("active");
					divPageSettings.classList.add("active");
					divNavbarBackground.setAttribute("class", "background settings");
					break;
			}
		}).catch(e => {
			console.log(e);
		});
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
			listMarket();
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
			listMarket();
		}
	}

	function clearDashboard() {
		divDashboardMarketList.classList.add("loading");
		divDashboardHoldingsList.classList.add("loading");
		divDashboardMarketList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
		divDashboardHoldingsList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
		clearStats();
	}

	function clearMarketList() {
		divMarketList.classList.add("loading");
		divMarketList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
		clearStats();
	}

	function clearHoldingsList() {
		divHoldingsList.classList.add("loading");
		divHoldingsList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
		clearStats();
	}

	function clearActivityList() {
		divActivityList.classList.add("loading");
		divActivityList.innerHTML = '<div class="event-wrapper loading"><span>Loading...</span></div>';
		clearStats();
	}

	function clearStats() {
		spanDashboardMarketCap.textContent = "...";
		spanDashboardMarketChange.textContent = "...";
		spanDashboardHoldingsValue.textContent = "...";
		spanGlobalMarketCap.textContent = "...";
		spanGlobalVolume.textContent = "...";
		spanGlobalDominance.textContent = "...";
		spanHoldingsTotalValue.textContent = "...";
	}

	async function populateDashboardMarketList(coins) {
		if(divDashboardMarketList.getElementsByClassName("coin-wrapper loading").length > 0) {
			divDashboardMarketList.getElementsByClassName("coin-wrapper loading")[0].remove();
			divDashboardMarketList.classList.remove("loading");

			if(settings.dashboardWatchlist === "enabled") {
				let divAdd = document.createElement("div");
				divAdd.classList.add("coin-wrapper");
				divAdd.classList.add("add");
				divAdd.innerHTML = '<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 736v192q0 40-28 68t-68 28h-416v416q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-416h-416q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h416v-416q0-40 28-68t68-28h192q40 0 68 28t28 68v416h416q40 0 68 28t28 68z"/></svg><span class="add-text">Add Coin...';

				divAdd.addEventListener("click", () => {
					watchlistPopup();
				});

				divDashboardMarketList.appendChild(divAdd);
			}
		}

		let sortItem = localStorage.getItem("dashboardMarketSortItem");
		let sortOrder = localStorage.getItem("dashboardMarketSortOrder");

		if(empty(sortItem) || settings.dashboardWatchlist !== "enabled") {
			sortItem = "marketCap";
		}

		if(empty(sortOrder)) {
			sortOrder = "descending";
		}

		let keys = Object.keys(coins);

		switch(sortItem) {
			case "coin":
				keys.sort((a, b) => {
					return coins[b].symbol.charAt(0).localeCompare(coins[a].symbol.charAt(0));
				});
				break;
			case "price":
				keys.sort((a, b) => {
					return coins[b].current_price - coins[a].current_price;
				});
				break;
			case "marketCap":
				keys.sort((a, b) => {
					return coins[b].market_cap - coins[a].market_cap;
				});
				break;
			case "change":
				keys.sort((a, b) => {
					return coins[b].price_change_percentage_24h - coins[a].price_change_percentage_24h;
				});
				break;
		}

		if(sortOrder !== "descending") {
			keys.reverse();
		}

		keys.map(key => {
			let coin = coins[key];
			let price = parseFloat(coin.current_price);

			if(price > 1) {
				price = separateThousands(price);
			}

			let id = "dashboard-market-coin-" + coin.id;

			let marketCap = coin.market_cap;

			if(window.innerWidth <= 1100 && window.innerWidth > 440) {
				marketCap = abbreviateNumber(marketCap, 2);
			}
			else if(window.innerWidth <= 440) {
				marketCap = abbreviateNumber(marketCap, 0);
			}

			let name = coin.name;
			let icon = coin.image;
			let priceChangeDay = coin.price_change_percentage_24h;

			if(!empty(priceChangeDay)) {
				priceChangeDay = priceChangeDay.toFixed(2).includes("-") ? priceChangeDay.toFixed(2) : "+" + priceChangeDay.toFixed(2);
			} else {
				priceChangeDay = "-";
			}

			let symbol = coin.symbol;

			let div;

			try {
				if(document.getElementById(id)) {
					div = document.getElementById(id);
					div.getElementsByClassName("price")[0].textContent = currencies[settings.currency] + price;
					div.getElementsByClassName("market-cap")[0].textContent = currencies[settings.currency] + separateThousands(marketCap);
					div.getElementsByClassName("day")[0].textContent = priceChangeDay + "%";

					if(priceChangeDay.includes("+")) {
						div.classList.add("positive");
						div.classList.remove("negative");
					} else if(priceChangeDay.includes("-")) {
						div.classList.remove("positive");
						div.classList.add("negative");
					} else {
						div.classList.remove("positive");
						div.classList.remove("negative");
					}
				} else {
					div = document.createElement("div");
					div.id = id;
					div.classList.add("coin-wrapper");

					if(priceChangeDay.includes("+")) {
						div.classList.add("positive");
					} else if(priceChangeDay.includes("-")) {
						div.classList.add("negative");
					}

					div.innerHTML = '<img draggable="false" src="' + icon + '" title="' + name + '"><span class="coin" title="' + name + '">' + symbol.toUpperCase() + '</span><span class="price">' + currencies[settings.currency] + price + '</span><span class="market-cap">' + currencies[settings.currency] + separateThousands(marketCap) + '</span><span class="day">' + priceChangeDay + '%</span>';

					if(settings.dashboardWatchlist === "enabled") {
						div.classList.add("watchlist-row");
						
						let buttonWatchlist = document.createElement("button");
						buttonWatchlist.classList.add("watchlist-button");
						buttonWatchlist.innerHTML += '<svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"/></svg>';

						buttonWatchlist.addEventListener("click", () => {
							deleteWatchlist(coin.id).then(response => {
								if("error" in response) {
									Notify.error({
										title:"Error",
										description:response.error
									});
								} else {
									Notify.success({
										title:"Removed from Watchlist",
										description:response.message
									});
									buttonWatchlist.classList.remove("active");
								}
								clearDashboard();
								listDashboard();
							}).catch(e => {
								Notify.error({
									title:"Error",
									description:"Couldn't remove coin from watchlist."
								});
								console.log(e);
							});
						});

						div.appendChild(buttonWatchlist);
					}

					divDashboardMarketList.appendChild(div);
				}
			} catch(e) {
				console.log(e);
			}
		});
	}

	function changeSortOrder(list, item, order) {
		let orders = ["ascending", "descending"];
		let lists = { "dashboardMarket":"Dashboard Market", "dashboardHoldings":"Dashboard Holdings", "market":"Market", "holdings":"Holdings", "activity":"Activity" };
		let items = [];
		if(orders.includes(order) && Object.keys(lists).includes(list)) {
			let valid = true;
			switch(list) {
				case "dashboardMarket":
					clearDashboard();
					items = ["coin", "price", "marketCap", "change"];
					if(!items.includes(item)) {
						valid = false;
						console.error("Sort order item not found.");
					}
					break;
				case "dashboardHoldings":
					clearDashboard();
					items = ["coin", "amount", "value", "change"];
					if(!items.includes(item)) {
						valid = false;
						console.error("Sort order item not found.");
					}
					break;
				case "market":
					clearMarketList();
					items = ["rank", "coin", "price", "marketCap", "change"];
					if(!items.includes(item)) {
						valid = false;
						console.error("Sort order item not found.");
					}
					break;
				case "holdings":
					clearHoldingsList();
					items = ["coin", "amount", "value", "change"];
					if(!items.includes(item)) {
						valid = false;
						console.error("Sort order item not found.");
					}
					break;
				case "activity":
					clearActivityList();
					items = ["date", "coin", "amount", "type", "notes"];
					if(!items.includes(item)) {
						valid = false;
						console.error("Sort order item not found.");
					}
					break;
			}

			if(valid) {
				localStorage.setItem(list + "SortOrder", order);
				localStorage.setItem(list + "SortItem", item);

				if(settings.sortOrderNotification === "enabled") {
					Notify.success({
						title:"Changed Sort Order",
						description:"\"" + lists[list] + "\" list is now sorted by " + capitalizeFirstLetter(item) + " (" + capitalizeFirstLetter(order) + ")."
					});
				}
			}

			listDashboard();
			listMarket();
			listHoldings();
			listActivity();
		} else {
			console.error("Sort order invalid, or list not found.");
		}
	}

	async function listDashboard() {
		if(!divLoginWrapper.classList.contains("active") && divNavbarDashboard.classList.contains("active")) {
			clearInterval(updateDashboardListInterval);

			setTimeout(() => {
				if(divDashboardMarketList.classList.contains("loading") || divDashboardHoldingsList.classList.contains("loading")) {
					listDashboard();
				}
			}, 5000);

			if(settings.additionalDashboardColumns === "enabled") {
				divPageDashboard.classList.add("additional-columns");
			} else {
				divPageDashboard.classList.remove("additional-columns");
			}

			if(settings.dashboardWatchlist === "enabled") {
				getWatchlist().then(watchlist => {
					if(empty(watchlist)) {
						populateDashboardMarketList({});
					} else {
						getCoinMarketData(Object.keys(watchlist).join("%2c")).then(coins => {
							populateDashboardMarketList(coins);
						}).catch(e => {
							console.log(e);
						});
					}
				}).catch(e => {
					console.log(e);
				});
			} else {
				getMarket(1, 10).then(coins => {
					populateDashboardMarketList(coins);
				}).catch(e => {
					console.log(e);
				});
			}

			getGlobal().then(global => {
				globalData = global.data;

				let marketCap = (global.data.total_market_cap[settings.currency]).toFixed(0);
				let marketChange = (global.data.market_cap_change_percentage_24h_usd).toFixed(1);

				if(window.innerWidth <= 1020) {
					marketCap = abbreviateNumber(marketCap, 3);
				}

				spanDashboardMarketCap.textContent = currencies[settings.currency] + separateThousands(marketCap);
				spanDashboardMarketChange.textContent = marketChange + "%";
			}).catch(e => {
				console.log(e);
			});

			updateDashboardListInterval = setInterval(listDashboard, updateInterval);

			getHoldings().then(async coins => {
				try {
					if(Object.keys(coins).length === 0 && settings.transactionsAffectHoldings !== "override" && settings.transactionsAffectHoldings !== "mixed") {
						if(divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
							divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
						}
					} else {
						let transactionsBySymbol;
						if(settings.transactionsAffectHoldings === "mixed") {
							let activity = await getActivity();

							if(!empty(activity)) {
								transactionsBySymbol = sortActivityBySymbol(activity);

								let ids = Object.keys(transactionsBySymbol);
								ids.map(id => {
									if(!(id in coins)) {
										coins[id] = { amount:0, symbol:transactionsBySymbol[id].symbol };
									}
								});
							}
						} else if(settings.transactionsAffectHoldings === "override") {
							let activity = await getActivity();

							if(!empty(activity)) {
								transactionsBySymbol = sortActivityBySymbol(activity);

								coins = {};

								let ids = Object.keys(transactionsBySymbol);
								ids.map(id => {
									if(transactionsBySymbol[id].amount > 0) {
										coins[id] = { amount:transactionsBySymbol[id].amount, symbol:transactionsBySymbol[id].symbol };
									}
								});
							}
						}

						let mixedValue = 0;

						if(!empty(coins)) {
							parseHoldings(coins).then(holdings => {
								if(divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
									divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading")[0].remove();
									divDashboardHoldingsList.classList.remove("loading");
								}

								let sortItem = localStorage.getItem("dashboardHoldingsSortItem");
								let sortOrder = localStorage.getItem("dashboardHoldingsSortOrder");

								if(empty(sortItem)) {
									sortItem = "coin";
								}

								if(empty(sortOrder)) {
									sortOrder = "descending";
								}

								let keys = Object.keys(holdings);

								switch(sortItem) {
									case "coin":
										keys.sort((a, b) => {
											return holdings[b].symbol.charAt(0).localeCompare(holdings[a].symbol.charAt(0));
										});
										break;
									case "amount":
										keys.sort((a, b) => {
											return holdings[b].amount - holdings[a].amount;
										});
										break;
									case "value":
										keys.sort((a, b) => {
											return holdings[b].value - holdings[a].value;
										});
										break;
									case "change":
										keys.sort((a, b) => {
											return parseFloat(holdings[b].change) - parseFloat(holdings[a].change);
										});
										break;
								}

								if(sortOrder !== "descending") {
									keys.reverse();
								}

								keys.map(holding => {
									let coin = holdings[holding];
					
									let id = "dashboard-holdings-coin-" + holding;
									let icon = coin.image;
									let amount = coin.amount;
									let symbol = coin.symbol;
									let value = coin.value.toFixed(2);

									if(!empty(transactionsBySymbol)) {
										if(settings.transactionsAffectHoldings === "mixed") {
											if(holding in transactionsBySymbol) {
												amount = parseFloat(amount) + transactionsBySymbol[holding].amount;
												value = (coin.price * amount).toFixed(2);
												mixedValue += parseFloat(value);
											}
										}
									}

									if(window.innerWidth <= 600 && window.innerWidth > 440) {
										value = abbreviateNumber(parseFloat(value), 2);
									} else if(window.innerWidth <= 440) {
										value = abbreviateNumber(parseFloat(value), 0);
									}

									let day = coin.change.includes("-") ? coin.change + "%" : "+" + coin.change + "%";

									if(amount < 0) {
										amount = 0;
									}

									if(value < 0) {
										value = 0;
									}

									if(value !== 0) {
										let div;

										try {
											if(document.getElementById(id)) {
												div = document.getElementById(id);
												div.getElementsByClassName("amount")[0].textContent = separateThousands(amount);
												div.getElementsByClassName("value")[0].textContent = currencies[settings.currency] + separateThousands(value);

												if(day.includes("+")) {
													div.classList.add("positive");
													div.classList.remove("negative");
												} else if(day.includes("-")) {
													div.classList.remove("positive");
													div.classList.add("negative");
												} else {
													div.classList.remove("positive");
													div.classList.remove("negative");
												}
											} else {
												div = document.createElement("div");
												div.id = id;
												div.classList.add("coin-wrapper");

												if(day.includes("+")) {
													div.classList.add("positive");
												} else if(day.includes("-")) {
													div.classList.add("negative");
												}

												div.innerHTML = '<img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="amount">' + separateThousands(amount) + '</span><span class="value">' + currencies[settings.currency] + separateThousands(value) + '</span><span class="day">' + day + '</span>';

												divDashboardHoldingsList.appendChild(div);
											}
										} catch(e) {
											console.log(e);
										}
									}
								});

								if(mixedValue > 0) {
									globalData.totalValue = mixedValue;
								}

								if(window.innerWidth > 480) {
									spanDashboardHoldingsValue.textContent = currencies[settings.currency] + separateThousands(globalData.totalValue.toFixed(2));
								} else {
									spanDashboardHoldingsValue.textContent = currencies[settings.currency] + abbreviateNumber(globalData.totalValue, 2);
								}
							}).catch(e => {
								console.log(e);
							});
						} else {
							if(divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
								divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
							}
						}
					}
				} catch(e) {
					console.log(e);
				}
			}).catch(e => {
				console.log(e);
			});
		}
	}

	function listMarket() {
		if(!divLoginWrapper.classList.contains("active") && divNavbarMarket.classList.contains("active")) {
			clearInterval(updateMarketListInterval);

			divPageNavigation.classList.remove("active");

			setTimeout(() => {
				if(divMarketList.classList.contains("loading")) {
					listMarket();
				}
			}, 5000);

			let page = parseInt(divMarketList.getAttribute("data-page"));
			if(empty(page)) {
				page = 1;
			}

			getMarket(page, 100).then(coins => {
				if(divMarketList.getElementsByClassName("coin-wrapper loading").length > 0) {
					divMarketList.getElementsByClassName("coin-wrapper loading")[0].remove();
					divMarketList.classList.remove("loading");
				}

				let keys = Object.keys(coins);
				keys.sort((a, b) => {
					return coins[keys[b]].market_cap - coins[keys[a]].market_cap;
				});

				let index = 1;

				keys.map(key => {
					let coin = coins[key];
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

					let rank = ((page - 1) * 100) + index;

					if(page === 1) {
						rank = index;
					}
					let name = coin.name;
					let icon = coin.image;
					let priceChangeDay = coin.price_change_percentage_24h;

					if(!empty(priceChangeDay)) {
						priceChangeDay = priceChangeDay.toFixed(2).includes("-") ? priceChangeDay.toFixed(2) : "+" + priceChangeDay.toFixed(2);
					} else {
						priceChangeDay = "-";
					}

					let symbol = coin.symbol;

					let div;

					try {
						if(document.getElementById(id)) {
							div = document.getElementById(id);
							div.getElementsByClassName("price")[0].textContent = currencies[settings.currency] + price;
							div.getElementsByClassName("market-cap")[0].textContent = currencies[settings.currency] + separateThousands(marketCap);
							div.getElementsByClassName("day")[0].textContent = priceChangeDay + "%";

							if(priceChangeDay.includes("+")) {
								div.classList.add("positive");
								div.classList.remove("negative");
							} else if(priceChangeDay.includes("-")) {
								div.classList.remove("positive");
								div.classList.add("negative");
							} else {
								div.classList.remove("positive");
								div.classList.remove("negative");
							}
						} else {
							div = document.createElement("div");
							div.id = id;
							div.classList.add("coin-wrapper");

							if(priceChangeDay.includes("+")) {
								div.classList.add("positive");
							} else if(priceChangeDay.includes("-")) {
								div.classList.add("negative");
							}

							div.innerHTML = '<span class="rank">' + rank + '</span><img draggable="false" src="' + icon + '" title="' + name + '"><span class="coin" title="' + name + '">' + symbol.toUpperCase() + '</span><span class="price">' + currencies[settings.currency] + price + '</span><span class="market-cap">' + currencies[settings.currency] + separateThousands(marketCap) + '</span><span class="day">' + priceChangeDay + '%</span>';

							div.addEventListener("click", () => {
								marketChartPopup(coin.id, symbol, coin.current_price);
							});

							divMarketList.appendChild(div);
						}

						index += 1;

						divPageNavigation.classList.add("active");
					} catch(e) {
						console.log(e);
					}
				});

				getGlobal().then(global => {
					globalData = global.data;

					let marketCap = (global.data.total_market_cap[settings.currency]).toFixed(0);
					let volume = (global.data.total_volume[settings.currency]).toFixed(0);
					let dominance = (global.data.market_cap_percentage.btc).toFixed(1);

					if(window.innerWidth <= 1020) {
						marketCap = abbreviateNumber(marketCap, 3);
						volume = abbreviateNumber(volume, 0);
					}

					spanGlobalMarketCap.textContent = currencies[settings.currency] + separateThousands(marketCap);
					spanGlobalVolume.textContent = currencies[settings.currency] + separateThousands(volume);
					spanGlobalDominance.textContent = dominance + "%";
				}).catch(e => {
					console.log(e);
				});

				updateMarketListInterval = setInterval(() => {
					listMarket();
				}, updateInterval);
			}).catch(e => {
				console.log(e);
			});
		}
	}

	async function listHoldings() {
		if((!divLoginWrapper.classList.contains("active") && divNavbarHoldings.classList.contains("active")) || url.searchParams.get("access") === "view") {
			clearInterval(updateHoldingsListInterval);

			divPageNavigation.classList.remove("active");

			setTimeout(() => {
				if(divHoldingsList.classList.contains("loading")) {
					listHoldings();
				}
			}, 5000);

			getHoldings().then(async coins => {
				try {
					if(Object.keys(coins).length === 0 && settings.transactionsAffectHoldings !== "override" && settings.transactionsAffectHoldings !== "mixed") {
						clearHoldingsList();
						if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
							divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
						}
					} else {
						let transactionsBySymbol;
						if(settings.transactionsAffectHoldings === "mixed") {
							let activity = await getActivity();

							if(!empty(activity)) {
								transactionsBySymbol = sortActivityBySymbol(activity);

								let ids = Object.keys(transactionsBySymbol);
								ids.map(id => {
									if(!(id in coins)) {
										coins[id] = { amount:0, symbol:transactionsBySymbol[id].symbol };
									}
								});
							}
						} else if(settings.transactionsAffectHoldings === "override") {
							let activity = await getActivity();

							if(!empty(activity)) {
								transactionsBySymbol = sortActivityBySymbol(activity);

								coins = {};

								let ids = Object.keys(transactionsBySymbol);
								ids.map(id => {
									if(transactionsBySymbol[id].amount > 0) {
										coins[id] = { amount:transactionsBySymbol[id].amount, symbol:transactionsBySymbol[id].symbol };
									}
								});
							}
						}

						let mixedValue = 0;
						
						if(!empty(coins)) {
							parseHoldings(coins).then(holdings => {
								if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
									divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].remove();
									divHoldingsList.classList.remove("loading");
								}

								let holdingsObject = {};

								Object.keys(holdings).map(holding => {
									let coin = holdings[holding];
					
									let id = "holdings-coin-" + holding;
									let icon = coin.image;
									let amount = coin.amount;
									let symbol = coin.symbol;
									let value = coin.value.toFixed(2);

									holdingsObject[holding] = { amount:amount, value:value };

									let enableMoreMenu = true;

									if(window.innerWidth <= 600 && window.innerWidth > 440) {
										value = abbreviateNumber(value, 2);
									} else if(window.innerWidth <= 440) {
										value = abbreviateNumber(value, 0);
									}

									let day = coin.change.includes("-") ? coin.change + "%" : "+" + coin.change + "%";

									if(!empty(transactionsBySymbol)) {
										if(settings.transactionsAffectHoldings === "mixed") {
											if(holding in transactionsBySymbol) {
												amount = parseFloat(amount) + transactionsBySymbol[holding].amount;
												value = (coin.price * amount).toFixed(2);
												mixedValue += parseFloat(value);
												enableMoreMenu = false;
											}
										} else if(settings.transactionsAffectHoldings === "override") {
											enableMoreMenu = false;
										}
									}

									if(amount < 0) {
										amount = 0;
									}

									if(value < 0) {
										value = 0;
									}

									if(value !== 0) {
										let div;

										try {
											if(document.getElementById(id)) {
												div = document.getElementById(id);
												div.getElementsByClassName("amount")[0].textContent = separateThousands(amount);
												div.getElementsByClassName("value")[0].textContent = currencies[settings.currency] + separateThousands(value);
												div.getElementsByClassName("day")[0].textContent = day;

												if(day.includes("+")) {
													div.classList.add("positive");
													div.classList.remove("negative");
												} else if(day.includes("-")) {
													div.classList.remove("positive");
													div.classList.add("negative");
												} else {
													div.classList.remove("positive");
													div.classList.remove("negative");
												}
											} else {
												div = document.createElement("div");
												div.id = id;
												div.classList.add("coin-wrapper");

												if(day.includes("+")) {
													div.classList.add("positive");
												} else if(day.includes("-")) {
													div.classList.add("negative");
												}

												div.innerHTML = '<img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="amount">' + separateThousands(amount) + '</span><span class="value">' + currencies[settings.currency] + separateThousands(value) + '</span><span class="day">' + day + '</span>';

												if(enableMoreMenu) {
													let more = document.createElement("div");
													more.classList.add("more");
													more.innerHTML = '<svg class="more-icon" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path class="more-path" d="M576 736v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm512 0v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm512 0v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68z"/></svg>';

													more.addEventListener("click", (e) => {
														divHoldingsMoreMenu.setAttribute("data-coin", holding);
														divHoldingsMoreMenu.setAttribute("data-symbol", coin.symbol.toUpperCase());
														divHoldingsMoreMenu.setAttribute("data-amount", amount);

														divHoldingsMoreMenu.classList.remove("hidden");

														divHoldingsMoreMenu.style.top = e.clientY - 2 + "px";
														divHoldingsMoreMenu.style.left = e.clientX - 2 - 200 + "px";

														if(window.innerWidth <= 1230 && window.innerWidth > 700) {
															divHoldingsMoreMenu.style.left = e.clientX - 2 - 200 - divHoldingsMoreMenu.clientWidth + "px";
														}
														if(window.innerWidth <= 1120 && window.innerWidth > 700) {
															divHoldingsMoreMenu.style.left = e.clientX - 2 - 100 - divHoldingsMoreMenu.clientWidth + "px";
														}
														else if(window.innerWidth <= 700) {
															divHoldingsMoreMenu.style.left = e.clientX - 2 - divHoldingsMoreMenu.clientWidth + "px";
														}
													});
													
													div.appendChild(more);
												}

												if(settings.transactionsAffectHoldings === "override") {
													div.classList.add("clickable");
													div.addEventListener("click", () => {
														individualHoldingChart(holding);
													});
												}

												divHoldingsList.appendChild(div);
											}
										} catch(e) {
											console.log(e);
										}
									}
								});

								if(mixedValue > 0) {
									globalData.totalValue = mixedValue;
								}
								
								if(window.innerWidth > 480) {
									spanHoldingsTotalValue.textContent = currencies[settings.currency] + separateThousands(globalData.totalValue.toFixed(2));
								} else {
									spanHoldingsTotalValue.textContent = currencies[settings.currency] + abbreviateNumber(globalData.totalValue, 2);
								}

								localStorage.setItem("holdingsData", JSON.stringify(holdingsObject));
							}).catch(e => {
								console.log(e);
							});
						} else {
							clearHoldingsList();
							if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
								divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
							}
						}
					}
				} catch(e) {
					console.log(e);
				}
			}).catch(e => {
				console.log(e);
			});

			updateHoldingsListInterval = setInterval(listHoldings, updateInterval);
		}
	}
	
	function listActivity() {
		if(!divLoginWrapper.classList.contains("active") && divNavbarActivity.classList.contains("active")) {
			clearInterval(updateActivityListInterval);
	
			divPageNavigation.classList.remove("active");
	
			setTimeout(() => {
				if(divActivityList.classList.contains("loading")) {
					listActivity();
				}
			}, 5000);

			getActivity().then(events => {
				try {
					if(Object.keys(events).length === 0) {
						clearActivityList();
						if(divActivityList.getElementsByClassName("event-wrapper loading").length > 0) {
							divActivityList.getElementsByClassName("event-wrapper loading")[0].innerHTML = '<span>No Activity Found...</span>';
						}
					} else {
						if(divActivityList.getElementsByClassName("event-wrapper loading").length > 0) {
							divActivityList.getElementsByClassName("event-wrapper loading")[0].remove();
							divActivityList.classList.remove("loading");
						}

						events = sortActivityReverse(events);
						Object.keys(events).map(txID => {
							let activity = events[txID];
			
							let id = "activity-event-" + txID;
							let symbol = activity.symbol.toUpperCase();
							let date = activity.date;
							let amount = activity.amount;
							let fee = activity.fee;
							let notes = activity.notes;
							let type = capitalizeFirstLetter(activity.type);
							let exchange = activity.exchange;
							let pair = activity.pair;
							let price = activity.price;
							let from = activity.from;
							let to = activity.to;

							let div;

							try {
								if(document.getElementById(id)) {
									div = document.getElementById(id);

									div.setAttribute("data-tx", txID);
									div.setAttribute("data-id", activity.id);
									div.setAttribute("data-symbol", symbol);
									div.setAttribute("data-date", date);
									div.setAttribute("data-amount", amount);
									div.setAttribute("data-fee", fee);
									div.setAttribute("data-notes", notes);
									div.setAttribute("data-type", type);

									if(type.toLowerCase() === "transfer") {
										div.setAttribute("data-from", from);
										div.setAttribute("data-to", to);
									} else {
										div.setAttribute("data-exchange", exchange);
										div.setAttribute("data-pair", pair);
										div.setAttribute("data-price", price);
									}

									div.getElementsByClassName("date")[0].textContent = date;
									div.getElementsByClassName("symbol")[0].textContent = symbol;
									div.getElementsByClassName("amount")[0].textContent = separateThousands(amount);
									div.getElementsByClassName("type")[0].textContent = type;
									div.getElementsByClassName("notes")[0].textContent = notes;
								} else {
									div = document.createElement("div");
									div.id = id;

									div.setAttribute("data-tx", txID);
									div.setAttribute("data-id", activity.id);
									div.setAttribute("data-symbol", symbol);
									div.setAttribute("data-date", date);
									div.setAttribute("data-amount", amount);
									div.setAttribute("data-fee", fee);
									div.setAttribute("data-notes", notes);
									div.setAttribute("data-type", type);
									
									if(type.toLowerCase() === "transfer") {
										div.setAttribute("data-from", from);
										div.setAttribute("data-to", to);
									} else {
										div.setAttribute("data-exchange", exchange);
										div.setAttribute("data-pair", pair);
										div.setAttribute("data-price", price);
									}

									div.classList.add("event-wrapper");

									div.innerHTML = '<span class="date">' + date + '</span><span class="symbol">' + symbol + '</span><span class="amount">' + separateThousands(amount) + '</span><span class="type">' + type + '</span><span class="notes">' + notes + '</span>';

									div.addEventListener("click", () => {
										activityPopup("update", { txID:txID });
									});

									divActivityList.appendChild(div);
								}
							} catch(e) {
								console.log(e);
							}
						});
					}
				} catch(e) {
					console.log(e);
				}
			}).catch(e => {
				console.log(e);
			});

			updateActivityListInterval = setInterval(listActivity, updateInterval);
		}
	}

	function individualHoldingChart(coinID) {
		if(settings.transactionsAffectHoldings === "override") {
			let firstEvent = null;

			getActivity().then(events => {
				events = sortActivity(events);

				let chartData = {};

				let counter = 0;
				let startDate = previousYear(new Date()).getTime() / 1000;
				for(let i = 0; i < 366; i++) {
					let time = (startDate + counter) * 1000;
					let date = formatDate(new Date(time)).replaceAll(" ", "");
					chartData[date] = { holdingsValue:0 };
					counter += 86400;
				}

				let eventCount = 0;
				let keys = Object.keys(events);

				keys.map(key => {
					let event = events[key];
					let id = event.id;
					if(coinID === id) {
						let amount = parseFloat(event.amount);
						let eventTime = parseInt(event.time) * 1000;
						let eventDate = formatDate(new Date(eventTime)).replaceAll(" ", "");
						let previousYearTime = previousYear(new Date());
						if(eventTime > previousYearTime && event.type !== "transfer") {
							if(id in chartData[eventDate]) {
								event.type === "buy" ? chartData[eventDate][id] += amount : chartData[eventDate][id] -= amount;
							} else {
								event.type === "buy" ? chartData[eventDate][id] = amount : chartData[eventDate][id] = -amount;
							}
						}

						if(eventCount === 0) {
							firstEvent = events[key];
						}

						eventCount++;
					}
				});

				showLoading(8000, "This might take a while... Don't touch anything.");
				
				getCoinHistoricalMarketData(coinID, settings.currency, previousYear(new Date()), new Date()).then(data => {
					hideLoading();
					
					showLoading(1400, "Generating chart...");

					let keys = Object.keys(data);

					let formattedPrices = {};

					keys.map(coinID => {
						if(!(coinID in formattedPrices)) {
							formattedPrices[coinID] = {};
						}

						let prices = data[coinID].prices;

						for(let i = 0; i < prices.length; i++) {
							let time = prices[i][0];
							let price = prices[i][1];
							let date = formatDate(new Date(time)).replaceAll(" ", "");
							formattedPrices[coinID][date] = price;
						}
					});

					let dates = Object.keys(chartData);

					let startDate;

					for(let i = 0; i < dates.length; i++) {
						let previousDay = chartData[dates[i - 1]];
						let currentDay = chartData[dates[i]];

						if(i - 1 >= 0 && Object.keys(previousDay).length > 1) {
							Object.keys(previousDay).map(coin => {
								if(coin !== "holdingsValue") {
									if(empty(startDate)) {
										startDate = i - 1;
									}

									if(previousDay[coin] < 0) {
										chartData[dates[i - 1]][coin] = 0;
									}

									if(coin in currentDay) {
										chartData[dates[i]][coin] = chartData[dates[i]][coin] + previousDay[coin];
									} else {
										chartData[dates[i]][coin] = previousDay[coin];
									}
								}
							});
						}

						Object.keys(chartData[dates[i]]).map(coin => {
							if(coin !== "holdingsValue") {
								let value = chartData[dates[i]][coin] * formattedPrices[coin][dates[i]];
								chartData[dates[i]].holdingsValue += value;
							}
						});
					}

					if(!empty(firstEvent)) {
						individualHoldingChartPopup(coinID, firstEvent, chartData, startDate);
					} else {
						Notify.alert({
							title:"Alert",
							description:"No activity or events found for this holding."
						});
					}
				}).catch(e => {
					console.log(e);
				});
			});
		}
	}

	async function generateMarketChart(element, title, labels, tooltips, data, args) {
		let canvas = document.createElement("canvas");
		canvas.id = "chart-canvas";
		canvas.classList.add("chart-canvas");

		let context = canvas.getContext("2d");

		let gradientStroke = context.createLinearGradient(1000, 0, 300, 0);
		gradientStroke.addColorStop(0, "#feac5e");
		gradientStroke.addColorStop(0.5, "#c779d0");
		gradientStroke.addColorStop(1, "#4bc0c8");

		let datesBuy = [];
		let datesSell = [];

		let datesBuyFormatted = [];
		let datesSellFormatted = [];

		let amountsBuy = [];
		let amountsSell = [];

		if(settings.showTransactionsOnCharts === "enabled") {
			let activity = await getActivity();
			Object.keys(activity).map(txID => {
				let event = activity[txID];
				if(event.symbol.toUpperCase() === args?.symbol.toUpperCase()) {
					try {
						if(event.type.toLowerCase() === "buy") {
							datesBuy.push(new Date(Date.parse(event.date)));
							datesBuyFormatted.push(formatDateHuman(new Date(Date.parse(event.date))));
							amountsBuy.push(event.amount);
						} else if(event.type.toLowerCase() === "sell") {
							datesSell.push(new Date(Date.parse(event.date)));
							datesSellFormatted.push(formatDateHuman(new Date(Date.parse(event.date))));
							amountsSell.push(event.amount);
						}
					} catch(e) {
						console.log(e);
					}
				}
			});
		}

		let annotationsBuy = datesBuy.map(function(date, index) {
			return {
				type: "line",
				id: "line-buy-" + index,
				mode: "vertical",
				scaleID: "x-axis-0",
				value: date,
				borderColor: "#67b26f",
				borderWidth: 2.5
			}
		});

		let annotationsSell = datesSell.map(function(date, index) {
			return {
				type: "line",
				id: "line-sell-" + index,
				mode: "vertical",
				scaleID: "x-axis-0",
				value: date,
				borderColor: "#e94057",
				borderWidth: 2.5
			}
		});

		new Chart(canvas, {
			type: "line",
			data: {
				labels: labels,
				datasets:[{
					label: title,
					backgroundColor: "rgba(0,0,0,0)",
					borderColor: gradientStroke,
					data: data,
					pointRadius: 1,
					pointHoverRadius: 6,
				}],
			},
			options: {
				events: ["mousemove", "mouseout", "touchstart", "touchmove"],
				responsive: true,
				legend: {
					display: false
				},
				hover: {
					mode: "index",
					intersect: false,
				},
				scales: {
					xAxes: [{
						beginAtZero: true,
						gridLines: {
							zeroLineColor: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
							color: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
						},
						ticks: {
							autoSkip: true,
							maxTicksLimit: 12,
							fontColor: settings.theme === "dark" ? "rgba(255,255,255,0.9)" : "rgb(75,75,75)"
						},
						type: "time",
						time: {
							unit: "month"
						}
					}],
					yAxes: [{
						beginAtZero: true,
						gridLines: {
							color: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
						},
						ticks: {
							fontColor: settings.theme === "dark" ? "rgba(255,255,255,0.9)" : "rgb(75,75,75)"
						}
					}]
				},
				tooltips: {
					displayColors: false,
					intersect: false,
					callbacks: {
						title: function() {
							return "";
						},
						label: function(item) {
							let price = data[item.index];

							if(price > 1) {
								price = separateThousands(price.toFixed(2));
							}

							if(datesBuyFormatted.includes(tooltips[item.index])) {
								let amount = amountsBuy[datesBuyFormatted.indexOf(tooltips[item.index])];
								return [tooltips[item.index], "Bought " + amount + " @ " + currencies[settings.currency] + price];
							} else if(datesSellFormatted.includes(tooltips[item.index])) {
								let amount = amountsSell[datesSellFormatted.indexOf(tooltips[item.index])];
								return [tooltips[item.index], "Sold " + amount + " @ " + currencies[settings.currency] + price];
							}

							return [tooltips[item.index], currencies[settings.currency] + price];
						}
					}
				},
				annotation: {
					drawTime: "beforeDatasetsDraw",
					annotations: [...annotationsBuy, ...annotationsSell]
				}
			}
		});

		element.innerHTML = "";
		element.appendChild(canvas);
	}
	
	async function generateHoldingsChart(element, title, labels, tooltips, data) {
		let canvas = document.createElement("canvas");
		canvas.id = "chart-canvas";
		canvas.classList.add("chart-canvas");

		let context = canvas.getContext("2d");

		let gradientStroke = context.createLinearGradient(1000, 0, 300, 0);
		gradientStroke.addColorStop(0, "#11998e");
		gradientStroke.addColorStop(1, "#38ef7d");

		new Chart(canvas, {
			type: "line",
			data: {
				labels: labels,
				datasets:[{
					label: title,
					backgroundColor: "rgba(0,0,0,0)",
					borderColor: gradientStroke,
					data: data,
					pointRadius: 1,
					pointHoverRadius: 6,
				}],
			},
			options: {
				events: ["mousemove", "mouseout", "touchstart", "touchmove"],
				responsive: true,
				legend: {
					display: false
				},
				hover: {
					mode: "index",
					intersect: false,
				},
				scales: {
					xAxes: [{
						beginAtZero: true,
						gridLines: {
							zeroLineColor: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
							color: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
						},
						ticks: {
							autoSkip: true,
							maxTicksLimit: 12,
							fontColor: settings.theme === "dark" ? "rgba(255,255,255,0.9)" : "rgb(75,75,75)"
						},
						type: "time",
						time: {
							unit: "month"
						}
					}],
					yAxes: [{
						beginAtZero: true,
						gridLines: {
							color: settings.theme === "dark" ? "rgba(255,255,255,0.075)" : "rgba(0,0,0,0.1)",
						},
						ticks: {
							fontColor: settings.theme === "dark" ? "rgba(255,255,255,0.9)" : "rgb(75,75,75)"
						}
					}]
				},
				tooltips: {
					displayColors: false,
					intersect: false,
					callbacks: {
						title: function() {
							return "";
						},
						label: function(item) {
							let value = data[item.index];

							if(value > 1) {
								value = separateThousands(value.toFixed(2));
							}

							return [tooltips[item.index], currencies[settings.currency] + value];
						}
					}
				},
			}
		});

		element.innerHTML = "";
		element.appendChild(canvas);
	}

	function getChartInstance() {
		return new Promise((resolve) => {
			Chart.helpers.each(Chart.instances, function(instance) {
				if(instance.canvas.id === "chart-canvas") {
					resolve(instance);
				}
			});
		});
	}

	function processSettingChange(setting) {
		switch(setting) {
			case "transactionsAffectHoldings":
				clearDashboard();
				clearHoldingsList();
				break;
			case "dashboardWatchlist":
				clearDashboard();
				break;
			case "additionalDashboardColumns":
				clearDashboard();
				break;
		}
		updateLocalStorageSize();
	}

	function getLocalSettings() {
		let noAPIElements = document.getElementsByClassName("noapi-visible");
		if(empty(noAPI)) {
			for(let i = 0; i < noAPIElements.length; i++) {
				noAPIElements[i].classList.add("hidden");
			}
		} else {
			for(let i = 0; i < noAPIElements.length; i++) {
				noAPIElements[i].classList.remove("hidden");
			}
		}

		return new Promise((resolve, reject) => {
			checkSession();

			getServerSettings().then((response) => {
				settings = response;

				settings.currency = empty(localStorage.getItem("currency")) ? "usd" : localStorage.getItem("currency");

				settings.theme = empty(localStorage.getItem("theme")) ? "light" : localStorage.getItem("theme");

				settings.coinBackdrop = empty(localStorage.getItem("coinBackdrop")) ? "disabled" : localStorage.getItem("coinBackdrop");

				settings.transactionsAffectHoldings = empty(localStorage.getItem("transactionsAffectHoldings")) ? "disabled" : localStorage.getItem("transactionsAffectHoldings");

				settings.showTransactionsOnCharts = empty(localStorage.getItem("showTransactionsOnCharts")) ? "disabled" : localStorage.getItem("showTransactionsOnCharts");

				settings.highlightPriceChange = empty(localStorage.getItem("highlightPriceChange")) ? "disabled" : localStorage.getItem("highlightPriceChange");

				settings.dashboardWatchlist = empty(localStorage.getItem("dashboardWatchlist")) ? "disabled" : localStorage.getItem("dashboardWatchlist");

				settings.sortOrderNotification = empty(localStorage.getItem("sortOrderNotification")) ? "disabled" : localStorage.getItem("sortOrderNotification");

				settings.additionalDashboardColumns = empty(localStorage.getItem("additionalDashboardColumns")) ? "disabled" : localStorage.getItem("additionalDashboardColumns");

				settings.importTokens = empty(localStorage.getItem("importTokens")) ? "add" : localStorage.getItem("importTokens");

				settings.defaultPage = empty(localStorage.getItem("defaultPage")) ? "market" : localStorage.getItem("defaultPage");

				switchTheme(settings.theme);

				inputAccessPIN.value = settings.pin;

				if(!empty(settings.css)) {
					inputThemeCSS.value = settings.css;

					let css = "html.light, html.dark { " + inputThemeCSS.value + "}";

					if(document.getElementById("custom-css")) {
						document.getElementById("custom-css").textContent = css;
					} else {
						let style = document.createElement("style");
						style.id = "custom-css";
						style.textContent = css;
						document.head.appendChild(style);
					}

					localStorage.setItem("theme", "custom");
				}

				inputThemeCSS.value = inputThemeCSS.value.replaceAll("	", "");

				for(let i = 0; i < buttonSettingsChoices.length; i++) {
					buttonSettingsChoices[i].classList.remove("active");
				}

				for(let i = 0; i < buttonSettingsServerChoices.length; i++) {
					buttonSettingsServerChoices[i].classList.remove("active");
				}

				let keys = [];

				for(let i = 0; i < document.getElementsByClassName("settings-choices-wrapper").length; i++) {
					keys.push(document.getElementsByClassName("settings-choices-wrapper")[i].getAttribute("data-key"));
				}

				keys.map(key => {
					for(let i = 0; i < buttonSettingsChoices.length; i++) {
						if(buttonSettingsChoices[i].getAttribute("data-value") === settings[key] && buttonSettingsChoices[i].parentElement.getAttribute("data-key") === key) {
							buttonSettingsChoices[i].classList.add("active");
						}
					}

					for(let i = 0; i < buttonSettingsServerChoices.length; i++) {
						if(buttonSettingsServerChoices[i].getAttribute("data-value") === settings[key] && buttonSettingsServerChoices[i].parentElement.getAttribute("data-key") === key) {
							buttonSettingsServerChoices[i].classList.add("active");
						}
					}
				});

				if(settings.coinBackdrop === "enabled") {
					divDashboardMarketList.classList.add("backdrop");
					divDashboardHoldingsList.classList.add("backdrop");
					divMarketList.classList.add("backdrop");
					divHoldingsList.classList.add("backdrop");
				} else {
					divDashboardMarketList.classList.remove("backdrop");
					divDashboardHoldingsList.classList.remove("backdrop");
					divMarketList.classList.remove("backdrop");
					divHoldingsList.classList.remove("backdrop");
				}

				divDashboardMarketList.classList.remove("highlight-row");
				divDashboardHoldingsList.classList.remove("highlight-row");
				divMarketList.classList.remove("highlight-row");
				divHoldingsList.classList.remove("highlight-row");

				divDashboardMarketList.classList.remove("highlight-text");
				divDashboardHoldingsList.classList.remove("highlight-text");
				divMarketList.classList.remove("highlight-text");
				divHoldingsList.classList.remove("highlight-text");

				if(settings.highlightPriceChange === "row") {
					divDashboardMarketList.classList.add("highlight-row");
					divDashboardHoldingsList.classList.add("highlight-row");
					divMarketList.classList.add("highlight-row");
					divHoldingsList.classList.add("highlight-row");
				} else if(settings.highlightPriceChange === "text") {
					divDashboardMarketList.classList.add("highlight-text");
					divDashboardHoldingsList.classList.add("highlight-text");
					divMarketList.classList.add("highlight-text");
					divHoldingsList.classList.add("highlight-text");
				}

				if(settings.transactionsAffectHoldings === "override") {
					divHoldingsValueCard.classList.add("clickable");
				} else {
					divHoldingsValueCard.classList.remove("clickable");
				}

				inputSharingURL.value = window.location.href.replaceAll("index.html", "") + "index.html?access=view&pin=" + settings.pin;

				updateLocalStorageSize();

				resolve();
			}).catch(e => {
				reject(e);
				console.log(e);
			});
		});
	}

	function getServerSettings() {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.getData().settings);
				} else {
					if(empty(localStorage.getItem("NoAPI")) || !empty(localStorage.getItem("token"))) {
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

						xhr.open("GET", api + "settings/read.php?token=" + sessionToken + "&username=" + sessionUsername, true);
						xhr.send();
					} else {
						if(!empty(localStorage.getItem("NoAPI")) && validJSON(localStorage.getItem("NoAPI"))) {
							resolve(JSON.parse(localStorage.getItem("NoAPI")).settings);
						} else {
							reject(e);
						}
					}
				}
			} catch(e) {
				if(!empty(localStorage.getItem("NoAPI")) && validJSON(localStorage.getItem("NoAPI"))) {
					resolve(JSON.parse(localStorage.getItem("NoAPI")).settings);
				} else {
					reject(e);
				}
			}
		});
	}

	function changePassword(currentPassword, newPassword) {
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

				xhr.open("PUT", api + "accounts/update.php", true);
				xhr.send(JSON.stringify({ username:sessionUsername, currentPassword:currentPassword, newPassword:newPassword }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function changeSetting(key, value) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.updateSettings(key, value));
				} else {
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

					xhr.open("PUT", api + "settings/update.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, key:key, value:value }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function getGlobal() {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Global Market Data...");

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

	function addHolding(id, amount) {
		getCoin(id).then(coin => {
			if(!empty(coin.error)) {
				Notify.error({
					title:"Error",
					description:"Coin not found."
				});
			} else {
				createHolding(id, coin.symbol, amount).then(response => {
					clearHoldingsList();

					if("message" in response) {
						hidePopup();

						Notify.success({
							title:"Asset Created",
							description:response.message
						});
					} else {
						Notify.error({
							title:"Error",
							description:response.error
						});
					}
				
					listHoldings();
				}).catch(e => {
					Notify.error({
						title:"Error",
						description:"Asset couldn't be created."
					});
				});
			}
		}).catch(e => {
			console.log(e);
		});
	}

	function createHolding(id, symbol, amount) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.createHoldings(id, symbol, amount));
				} else {
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

					xhr.open("POST", api + "holdings/create.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id, symbol:symbol, amount:amount }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function updateHolding(id, amount) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.updateHoldings(id, amount));
				} else {
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

					xhr.open("PUT", api + "holdings/update.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id, amount:amount }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteHolding(id) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.deleteHoldings(id));
				} else {
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

					xhr.open("DELETE", api + "holdings/delete.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function importHoldings(rows) {
		if(!empty(noAPI)) {
			let response = noAPI.importHoldings(rows);

			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				Notify.success({
					title:"Holdings Imported",
					description:response.message
				});
			}
		} else {
			let xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", () => {
				if(xhr.readyState === XMLHttpRequest.DONE) {
					if(validJSON(xhr.responseText)) {
						let response = JSON.parse(xhr.responseText);

						if("error" in response) {
							Notify.error({
								title:"Error",
								description:response.error
							});
						} else {
							Notify.success({
								title:"Holdings Imported",
								description:response.message
							});
						}
					} else {
						Notify.error({
							title:"Error",
							description:"Invalid JSON."
						});
					}
				}
			});

			xhr.open("POST", api + "holdings/import.php", true);
			xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, rows:rows }));
		}
	}

	function activityPopup(action, params) {
		let html = "";

		html += '<input id="popup-symbol" placeholder="Symbol... (e.g. BTC)">';
		html += '<input id="popup-date" placeholder="Date... (e.g. 2021/04/18 04:20)">';
		html += '<div id="popup-choice"><button id="popup-buy" data-value="buy" class="choice active">Buy</button>';
		html += '<button id="popup-sell" data-value="sell" class="choice">Sell</button>';
		html += '<button id="popup-transfer" data-value="transfer" class="choice">Transfer</button></div>';
		html += '<input id="popup-amount" placeholder="Amount... (e.g. 2.5)" type="number">';
		html += '<input id="popup-fee" placeholder="Fee... (e.g. 0.25)" type="number">';
		html += '<input id="popup-notes" placeholder="Notes... (e.g. Rent)">';
		html += '<input id="popup-exchange" placeholder="Exchange... (e.g. Coinbase)">';
		html += '<input id="popup-pair" placeholder="Pair... (e.g. BTC/USDT)">';
		html += '<input id="popup-price" placeholder="Price... (e.g. 59000)">';
		html += '<input id="popup-from" class="hidden" placeholder="From... (e.g. Kraken)">';
		html += '<input id="popup-to" class="hidden" placeholder="To... (e.g. Cold Wallet)">';

		if(action !== "create") {
			html += '<input id="popup-id" class="hidden" placeholder="ID... (e.g. Bitcoin)">';
			html += '<button class="delete" id="popup-delete">Delete Event</button>';
		}
		
		html += '<button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		let popupHeight = 360;
	
		popup((action === "create") ? "Recording Event" : "Editing Event", html, "300px", popupHeight + "px");

		let popupID;
		let popupSymbol = document.getElementById("popup-symbol");
		let popupDate = document.getElementById("popup-date");
		let popupAmount = document.getElementById("popup-amount");
		let popupFee = document.getElementById("popup-fee");
		let popupNotes = document.getElementById("popup-notes");
		let popupExchange = document.getElementById("popup-exchange");
		let popupPair = document.getElementById("popup-pair");
		let popupPrice = document.getElementById("popup-price");
		let popupFrom = document.getElementById("popup-from");
		let popupTo = document.getElementById("popup-to");

		flatpickr(popupDate, {
			enableTime: true,
			dateFormat: "Y-m-d H:i",
			allowInput: true
		});

		if(action !== "create") {
			popupID = document.getElementById("popup-id");
		}

		let choices = document.getElementById("popup-choice").getElementsByClassName("choice");
		for(let i = 0; i < choices.length; i++) {
			choices[i].addEventListener("click", () => {
				for(let j = 0; j < choices.length; j++) {
					choices[j].classList.remove("active");
				}
				choices[i].classList.add("active");

				if(choices[i].getAttribute("data-value") === "transfer") {
					popupExchange.classList.add("hidden");
					popupPair.classList.add("hidden");
					popupPrice.classList.add("hidden");
					popupFrom.classList.remove("hidden");
					popupTo.classList.remove("hidden");
				} else {
					popupExchange.classList.remove("hidden");
					popupPair.classList.remove("hidden");
					popupPrice.classList.remove("hidden");
					popupFrom.classList.add("hidden");
					popupTo.classList.add("hidden");
				}
			});

			if(action !== "create") {
				let event = document.getElementById("activity-event-" + params.txID);
				if(choices[i].getAttribute("data-value") === event.getAttribute("data-type").toLowerCase()) {
					choices[i].click();
				}
			}
		}

		if(action !== "create") {
			let event = document.getElementById("activity-event-" + params.txID);
			popupID.value = event.getAttribute("data-id");
			popupSymbol.value = event.getAttribute("data-symbol");
			popupDate.value = event.getAttribute("data-date");
			popupAmount.value = event.getAttribute("data-amount");
			popupFee.value = event.getAttribute("data-fee");
			popupNotes.value = event.getAttribute("data-notes");
			if(event.getAttribute("data-type").toLowerCase() === "transfer") {
				popupFrom.value = event.getAttribute("data-from");
				popupTo.value = event.getAttribute("data-to");
			} else {
				popupExchange.value = event.getAttribute("data-exchange");
				popupPair.value = event.getAttribute("data-pair");
				popupPrice.value = event.getAttribute("data-price");
			}

			document.getElementById("popup-delete").addEventListener("click", () => {
				deleteActivity(params.txID).then(response => {
					if("error" in response) {
						Notify.error({
							title:"Error",
							description:response.error
						});
					} else {
						hidePopup();

						clearActivityList();
						listActivity();

						if(settings.transactionsAffectHoldings !== "disabled") {
							clearHoldingsList();
						}

						Notify.success({
							title:"Event Deleted",
							description:response.message
						});
					}
				}).catch(e => {
					console.log(e);
				});
			});
		}
	
		document.getElementById("popup-cancel").addEventListener("click", () => {
			hidePopup();
		});
	
		document.getElementById("popup-confirm").addEventListener("click", () => {
			let symbol = popupSymbol.value;
			let date = popupDate.value;
			let amount = popupAmount.value;
			let fee = popupFee.value;
			let notes = popupNotes.value;
			let type = document.getElementById("popup-choice").getElementsByClassName("active")[0].getAttribute("data-value");
			let exchange = popupExchange.value;
			let pair = popupPair.value;
			let price = popupPrice.value;
			let from = popupFrom.value;
			let to = popupTo.value;
			
			if(isNaN(amount) || isNaN(fee) || (isNaN(price) && !empty(price))) {
				Notify.error({
					title:"Error",
					description:"The amount, fee, and price fields must be numbers."
				});
			} else {
				let key = "symbol";
				let value = symbol.trim().toLowerCase();

				if(action === "update") {
					key = "id";
					value = popupID.value.trim().toLowerCase();
				}

				getCoinID(key, value).then(response => {
					Notify.alert({
						title:"Checking...",
						description:"Checking whether or not that coin exists."
					});

					for(let i = 0; i < document.getElementsByClassName("popup-list").length; i++) {
						document.getElementsByClassName("popup-list")[i].remove();
					}

					if("id" in response) {
						let id = response.id;
						if(action === "create") {
							addActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to);
						} else {
							updateActivity(params.txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to).then(response => {
								hidePopup();

								clearActivityList();
								listActivity();

								if(settings.transactionsAffectHoldings !== "disabled") {
									clearHoldingsList();
								}

								Notify.success({
									title:"Event Updated",
									description:response.message
								});
							}).catch(e => {
								console.log(e);
							});
						}
					} else if("matches" in response) {
						Notify.info({
							title:"Multiple Results",
							description:"There are " + response.matches.length + " coins with that symbol. Please choose one from the list.",
							duration:8000
						});

						let wrapper = document.createElement("div");
						wrapper.classList.add("popup-list");

						let matches = response.matches;
						Object.keys(matches).map(key => {
							let match = matches[key];
							let symbol = Object.keys(match)[0];
							let id = match[symbol];

							let row = document.createElement("div");
							row.innerHTML = '<span class="title">' + symbol.toUpperCase() + '</span><span class="subtitle">' + capitalizeFirstLetter(id) + '</span>';

							row.addEventListener("click", () => {
								if(action === "create") {
									addActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to);
								} else {
									updateActivity(params.txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to).then(response => {
										if("error" in response) {
											Notify.error({
												title:"Error",
												description:response.error
											});
										} else {
											hidePopup();

											clearActivityList();
											listActivity();

											Notify.success({
												title:"Event Updated",
												description:response.message
											});
										}
									}).catch(e => {
										console.log(e);
									});
								}
							});

							wrapper.appendChild(row);
						});

						let addedHeight = matches * 40;

						if(matches.length >= 3) {
							addedHeight = 120;
						}

						let adjustedHeight = (popupHeight + addedHeight) + 20;

						divPopupWrapper.style.height = adjustedHeight + "px";
						divPopupWrapper.style.top = "calc(50% - " + adjustedHeight + "px / 2)";

						insertAfter(wrapper, popupTo);
					} else {
						Notify.error({
							title:"Error",
							description:"Couldn't find coin. Try searching by ID."
						});
					}
				}).catch(e => {
					console.log(e);
				});
			}
		});
	}

	function getWatchlist() {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.readWatchlist());
				} else {
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

					xhr.open("GET", api + "watchlist/read.php?token=" + sessionToken + "&username=" + sessionUsername, true);
					xhr.send();
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function createWatchlist(id, symbol) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.createWatchlist(id, symbol));
				} else {
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

					xhr.open("POST", api + "watchlist/create.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id, symbol:symbol }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteWatchlist(id) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.deleteWatchlist(id));
				} else {
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

					xhr.open("DELETE", api + "watchlist/delete.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function createActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.createActivity(id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to));
				} else {
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

					xhr.open("POST", api + "activity/create.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function updateActivity(txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.updateActivity(txID, id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to));
				} else {
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

					xhr.open("PUT", api + "activity/update.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, txID:txID, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteActivity(txID) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.deleteActivity(txID));
				} else {
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

					xhr.open("DELETE", api + "activity/delete.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, txID:txID }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function addActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		let valid = true;
		for(let i = 0; i < arguments.length; i++) {
			let argument = arguments[i];
			if(argument.includes(",")) {
				valid = false;
			}
		}

		if(valid) {
			getCoin(id).then(coin => {
				if(!empty(coin.error)) {
					Notify.error({
						title:"Error",
						description:"Coin not found."
					});
				} else {
					createActivity(id, symbol.trim().toUpperCase(), date.trim(), amount, fee, notes.trim(), type, exchange.trim(), pair.trim().toUpperCase(), price, from.trim(), to.trim()).then(response => {
						clearActivityList();

						if("message" in response) {
							hidePopup();

							Notify.success({
								title:"Event Recorded",
								description:response.message
							});
						} else {
							Notify.error({
								title:"Error",
								description:response.error
							});
						}
					
						listActivity();

						if(settings.transactionsAffectHoldings !== "disabled") {
							clearHoldingsList();
						}
					}).catch(e => {
						Notify.error({
							title:"Error",
							description:"Event couldn't be recorded."
						});
					});
				}
			}).catch(e => {
				console.log(e);
			});
		} else {
			Notify.error({
				title:"Error",
				description:"You cannot use commas in any fields."
			});
		}
	}

	function importActivity(rows) {
		if(!empty(noAPI)) {
			let response = noAPI.importActivity(rows);

			if("error" in response) {
				Notify.error({
					title:"Error",
					description:response.error
				});
			} else {
				Notify.success({
					title:"Activity Imported",
					description:response.message
				});
			}
		} else {
			let xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", () => {
				if(xhr.readyState === XMLHttpRequest.DONE) {
					if(validJSON(xhr.responseText)) {
						let response = JSON.parse(xhr.responseText);

						if("error" in response) {
							Notify.error({
								title:"Error",
								description:response.error
							});
						} else {
							Notify.success({
								title:"Activity Imported",
								description:response.message
							});
						}
					} else {
						Notify.error({
							title:"Error",
							description:"Invalid JSON."
						});
					}
				}
			});

			xhr.open("POST", api + "activity/import.php", true);
			xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, rows:rows }));
		}
	}

	function getCoin(id) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Coin...");

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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/" + id, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getCoinID(key, value) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					noAPI.readCoins({ [key]:value }).then(response => {
						resolve(response);
					}).catch(e => {
						console.log(e);
						reject(e);
					});
				} else {
					console.log("Fetching Coins... (API)");

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

					xhr.open("GET", api + "coins/read.php?token=" + sessionToken + "&username=" + sessionUsername + "&" + key + "=" + value, true);
					xhr.send();
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function getCoinInfo(id) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Coin Info...");

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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/" + id + "?localization=false&market_data=true", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getCoinHistoricalMarketData(ids, currency, from, to) {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					noAPI.readHistorical(ids, currency, Math.floor(new Date(Date.parse(from)).getTime() / 1000), Math.floor(new Date(Date.parse(to)).getTime() / 1000), false).then(response => {
						resolve(response);
					}).catch(e => {
						console.log(e);
						reject(e);
					});
				} else {
					console.log("Fetching Historical Data... (API)");

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

					xhr.open("GET", api + "historical/read.php?token=" + sessionToken + "&username=" + sessionUsername + "&ids=" + ids + "&currency=" + currency + "&from=" + Math.floor(new Date(Date.parse(from)).getTime() / 1000) + "&to=" + Math.floor(new Date(Date.parse(to)).getTime() / 1000), true);
					xhr.send();
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function getCoinMarketData(ids) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Market Data...");

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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + settings.currency + "&ids=" + ids + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getCoinPrice(id, date) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Coin Price...");

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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/" + id + "/history?date=" + date, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function parseMarketData(data, currentTime, currentPrice) {
		let prices = data.prices;

		prices.push([currentTime, currentPrice]);

		let parsed = {
			labels: [],
			tooltips: [],
			prices: []
		};

		Object.keys(prices).map(key => {
			let time = prices[key][0];
			let price = parseFloat(prices[key][1]);

			parsed.labels.push(new Date(time));
			parsed.tooltips.push(formatDateHuman(new Date(time)));
			parsed.prices.push(price);
		});

		return parsed;
	}

	function getMarket(page, amount) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Market Data...");

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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + settings.currency + "&order=market_cap_desc&per_page=" + amount + "&page=" + page + "&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getAccounts() {
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

				xhr.open("GET", api + "accounts/read-all.php?token=" + sessionToken + "&username=" + sessionUsername, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getAccount() {
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

				xhr.open("GET", api + "accounts/read.php?token=" + sessionToken + "&username=" + sessionUsername, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function createAccount(account) {
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

				xhr.open("POST", api + "accounts/create.php", true);
				xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, account:account }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteAccount(account) {
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

				xhr.open("DELETE", api + "accounts/delete.php", true);
				xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken, account:account }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function verifySession(token) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Verifying Session...");

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

				xhr.open("POST", api + "accounts/login.php", true);
				xhr.send(JSON.stringify({ username:sessionUsername, token:token }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function getHoldings() {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.readHoldings());
				} else {
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

					xhr.open("GET", api + "holdings/read.php?token=" + sessionToken + "&username=" + sessionUsername, true);
					xhr.send();
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function parseHoldings(coins) {
		return new Promise((resolve, reject) => {
			try {
				console.log("Fetching Holdings Market Data...");

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
								let priceChangeDay = coin.price_change_percentage_24h;

								if(!empty(priceChangeDay)) {
									priceChangeDay = priceChangeDay.toFixed(2);
								} else {
									priceChangeDay = "-";
								}

								holdings[id] = {
									symbol:coins[id].symbol,
									amount:amount,
									value:value,
									price:price,
									change:priceChangeDay,
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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + settings.currency + "&ids=" + list + "&order=market_cap_desc&per_page=250&page=1&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getActivity() {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.readActivity());
				} else {
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

					xhr.open("GET", api + "activity/read.php?token=" + sessionToken + "&username=" + sessionUsername, true);
					xhr.send();
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function sortActivity(events) {
		let sorted = {};
		let array = [];
		for(let event in events) {
			array.push([event, events[event].time]);
		}

		array.sort(function(a, b) {
			return a[1] - b[1];
		});

		array.map(item => {
			sorted[item[0]] = events[item[0]];
		});

		return sorted;
	}

	function sortActivityReverse(events) {
		let sorted = {};
		let array = [];
		for(let event in events) {
			array.push([event, events[event].time]);
		}

		array.sort(function(a, b) {
			return a[1] - b[1];
		});

		array.reverse().map(item => {
			sorted[item[0]] = events[item[0]];
		});

		return sorted;
	}

	function sortActivityBySymbol(events) {
		let txIDs = Object.keys(events);

		let sorted = {};

		txIDs.map(txID => {
			let transaction = events[txID];
			let id = transaction.id;
			let symbol = transaction.symbol;
			let type = transaction.type;
			let amount = parseFloat(transaction.amount);

			if(!(id in sorted)) {
				sorted[id] = { amount:0, symbol:symbol };
			}
			
			if(type === "sell") {
				let subtracted = parseFloat(sorted[id].amount) - amount;
				if(subtracted < 0) {
					subtracted = 0;
				}
				sorted[id].amount = subtracted;
			} else if(type === "buy") {
				sorted[id].amount = parseFloat(sorted[id].amount) + amount;
			}
		});

		return sorted;
	}

	function upload() {
		return new Promise((resolve, reject) => {
			let input = document.createElement("input");
			input.type = "file";
			input.click();
			input.addEventListener("input", () => {
				if(!empty(input.files)) {
					let file = input.files[0];
					let reader = new FileReader();
					reader.readAsText(file, "UTF-8");
					reader.addEventListener("load", (event) => {
						let data = event.target.result;
						input.remove();
						resolve(data);
					});
					reader.addEventListener("error", (error) => {
						input.remove();
						Notify.error({
							title:"Error",
							description:"Couldn't read file content."
						});
						reject(error);
					});
				} else {
					input.remove();
					reject("No File Uploaded.");
				}
			});
		});
	}

	function getETHAddressBalance(address) {
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

				xhr.open("GET", "https://api.ethplorer.io/getAddressInfo/" + address + "?apiKey=freekey", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteCache() {
		return new Promise((resolve, reject) => {
			try {
				if(!empty(noAPI)) {
					resolve(noAPI.deleteHistorical());
				} else {
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

					xhr.open("DELETE", api + "historical/delete.php", true);
					xhr.send(JSON.stringify({ username:sessionUsername, token:sessionToken }));
				}
			} catch(e) {
				reject(e);
			}
		});
	}

	function download(url) {
		let frame = document.createElement("iframe");
		frame.src = url;
		frame.classList.add("hidden");
		divPageSettings.appendChild(frame);
		frame.addEventListener("load", () => {
			frame.remove();
		});
	}

	function downloadCSV(csv, filename) {
		let content = "data:text/csv;charset=utf-8," + csv;
		let encoded = encodeURI(content);
		let link = document.createElement("a");
		link.setAttribute("href", encoded);
		link.setAttribute("download", filename);
		link.classList.add("hidden");
		document.body.appendChild(link);
		link.click();
		setTimeout(() => {
			link.remove();
		}, 500);
	}

	function updateLocalStorageSize() {
		getLocalStorageSize().then(size => {
			let percentageRemaining = (size.remaining * 100) / size.size;
			let percentageUsed = 100 - percentageRemaining;
			divStorageProgress.style.width = percentageUsed + "%";
			spanStorageText.textContent = percentageUsed.toFixed(0) + "%";
		}).catch(e => {
			spanStorageText.textContent = "Error";
			console.log(e);
		});
	}
});

function getLocalStorageSize() {
	return new Promise((resolve, reject) => {
		if(localStorage) {
			if(empty(localStorage.getItem("storageSize"))) {
				let i = 0;
				try {
					for(i = 250; i <= 10000; i += 250) {
						localStorage.setItem("testSize", new Array((i * 1024) + 1).join("a"));
					}
				} catch(e) {
					localStorage.removeItem("testSize");
					localStorage.setItem("storageSize", i - 250);
					let remaining = (i - 250) - getLocalStorageUsedSize();
					resolve({ size:i - 250, remaining:remaining });
				}
			} else {
				let remaining = localStorage.getItem("storageSize") - getLocalStorageUsedSize();
				resolve({ size:parseInt(localStorage.getItem("storageSize")), remaining:remaining });
			}
		} else {
			reject({ size:0, remaining:0 });
		}
	});
}

function getLocalStorageUsedSize() {
	return JSON.stringify(localStorage).length / 1000;
}

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

function formatDateHuman(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return day + " / " + month + " / " + year;
}

function formatDateHyphenated(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return day + "-" + month + "-" + year;
}

function previousYear(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear() - 1;
	return new Date(Date.parse(year + "-" + month + "-" + day));
}

function previousMonth(date) {
	return new Date(date.getTime() - 2592000 * 1000);
}

function previousWeek(date) {
	return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
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

function separateThousands(number) {
	let parts = number.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
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

function positiveToNegative(number) {
	return -Math.abs(number);
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

function detectMobile() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}