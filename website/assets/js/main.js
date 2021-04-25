document.addEventListener("DOMContentLoaded", async () => {
	// Begin Changeable Variables
	const api = "../api/"; // Default: "../api/"
	const updateInterval = 30000; // Default: 30000
	
	const Notify = new XNotify("BottomRight");

	let updateDashboardListInterval = setInterval(listDashboard, updateInterval);
	let updateMarketListInterval = setInterval(listMarket, updateInterval);
	let updateHoldingsListInterval = setInterval(listHoldings, updateInterval);
	let updateActivityListInterval = setInterval(listActivity, updateInterval);

	let sessionToken = localStorage.getItem("token");

	let currencies = {
		usd: "$",
		gbp: "£",
		eur: "€"
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

	let inputLoginPassword = document.getElementById("login-password");

	let buttonLogin = document.getElementById("login-button");
	let buttonLogout = document.getElementById("logout-button");

	let divLoadingOverlay = document.getElementById("loading-overlay");
	let divPopupOverlay = document.getElementById("popup-overlay");

	let divPopupWrapper = document.getElementById("popup-wrapper");
	let divPopupBottom = divPopupWrapper.getElementsByClassName("bottom")[0];

	let spanPopupTitle = divPopupWrapper.getElementsByClassName("title")[0];
	
	let divPageDashboard = document.getElementById("page-dashboard");
	let divPageMarket = document.getElementById("page-market");
	let divPageHoldings = document.getElementById("page-holdings");
	let divPageActivity = document.getElementById("page-activity");
	let divPageSettings = document.getElementById("page-settings");

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

	let buttonChangePassword = document.getElementById("change-password-button");

	let buttonChangePIN = document.getElementById("change-pin-button");
	let buttonCopyURL = document.getElementById("copy-url-button");

	let buttonImportHoldings = document.getElementById("import-holdings-button");
	let buttonExportHoldings = document.getElementById("export-holdings-button");

	let buttonImportActivity = document.getElementById("import-activity-button");
	let buttonExportActivity = document.getElementById("export-activity-button");

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
			listMarket();
		}).catch(e => {
			console.log(e);
		});
	}

	window.addEventListener("resize", () => {
		clearStats();
		clearMarketList();

		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(() => {
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
		if(divLoginWrapper.classList.contains("active")) {
			inputLoginPassword.focus();
		}
	});

	buttonLogin.addEventListener("click", () => {
		let password = inputLoginPassword.value;
		login(password);
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

	buttonMoreEdit.addEventListener("click", () => {
		let id = divHoldingsMoreMenu.getAttribute("data-coin");
		let symbol = divHoldingsMoreMenu.getAttribute("data-symbol");
		let currentAmount = divHoldingsMoreMenu.getAttribute("data-amount");

		let html = '<input id="popup-coin" placeholder="Coin Symbol... (e.g. BTC)" value="' + symbol + '" readonly><input id="popup-amount" placeholder="Amount... (e.g. 2.5)" value="' + currentAmount + '" type="number"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		popup("Editing Asset", html, 300, 240);

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

		popup("Deleting Asset", html, 240, 120);

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

	divHoldingsAddCard.addEventListener("click", () => {
		let html = '<input id="popup-coin" placeholder="Coin Symbol... (e.g. BTC)"><input id="popup-amount" placeholder="Amount... (e.g. 2.5)" type="number"><button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		let popupHeight = 240;

		popup("Adding Asset", html, 300, popupHeight);

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
					// Switch to dark mode.
					switchTheme("dark");
				} else {
					// Switch to light mode.
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
						logout();
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
		download(api + "holdings/export.php?token=" + sessionToken);
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
		download(api + "activity/export.php?token=" + sessionToken);
	});

	function login(password) {
		try {
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

								localStorage.setItem("token", response.token);

								Notify.success({
									title:"Logging In...",
									description:response.message
								});

								listMarket();
								listHoldings();

								divLoginWrapper.classList.remove("active");

								inputLoginPassword.value = "";
								inputLoginPassword.blur();
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

			xhr.open("POST", api + "account/login.php?platform=web", true);
			xhr.send(JSON.stringify({ password:password }));
		} catch(e) {
			reject(e);
		}
	}

	function logout() {
		try {
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

							localStorage.removeItem("token");

							Notify.success({
								title:"Logging Out...",
								description:response.message
							});

							clearMarketList();
							clearHoldingsList();

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

			xhr.open("GET", api + "account/logout.php?platform=web&token=" + sessionToken, true);
			xhr.send();
		} catch(e) {
			reject(e);
		}
	}

	function checkSession() {
		if(empty(sessionToken)) {
			if(divLoadingOverlay.classList.contains("active")) {
				divLoadingOverlay.classList.remove("active");
			}

			if(!divLoginWrapper.classList.contains("active")) {
				divLoginWrapper.classList.add("active");
				inputLoginPassword.focus();
			}
		} else {
			verifySession(sessionToken).then(response => {
				setTimeout(() => {
					if(divLoadingOverlay.classList.contains("active")) {
						divLoadingOverlay.classList.remove("active");
					}
				}, 250);

				if("valid" in response && response.valid) {
					if(divLoginWrapper.classList.contains("active")) {
						divLoginWrapper.classList.remove("active");
					}
				} else {
					if(!divLoginWrapper.classList.contains("active")) {
						divLoginWrapper.classList.add("active");
						inputLoginPassword.focus();
					}
				}
			}).catch(e => {
				console.log(e);
			});
		}
	}

	function popup(title, html, width, height) {
		divPopupOverlay.classList.add("active");
		divPopupWrapper.style.width = width + "px";
		divPopupWrapper.style.height = height + "px";
		divPopupWrapper.style.left = "calc(50% - " + width + "px / 2)";
		divPopupWrapper.style.top = "calc(50% - " + height + "px / 2)";
		divPopupWrapper.classList.add("active");
		spanPopupTitle.textContent = title;
		divPopupBottom.innerHTML = html;
	}

	function hidePopup() {
		divPopupOverlay.classList.remove("active");
		divPopupWrapper.classList.remove("active");
		spanPopupTitle.textContent = "Popup Title";
		divPopupBottom.remove();

		let div = document.createElement("div");
		div.classList.add("bottom");
		divPopupWrapper.appendChild(div);
		divPopupBottom = divPopupWrapper.getElementsByClassName("bottom")[0];
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

	function clearMarketList() {
		divMarketList.classList.add("loading");
		divMarketList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
	}

	function clearHoldingsList() {
		divHoldingsList.classList.add("loading");
		divHoldingsList.innerHTML = '<div class="coin-wrapper loading"><span>Loading...</span></div>';
	}

	function clearActivityList() {
		divActivityList.classList.add("loading");
		divActivityList.innerHTML = '<div class="event-wrapper loading"><span>Loading...</span></div>';
	}

	function clearStats() {
		spanGlobalMarketCap.textContent = "...";
		spanGlobalVolume.textContent = "...";
		spanGlobalDominance.textContent = "...";
	}

	function listDashboard() {
		if(!divLoginWrapper.classList.contains("active") && divNavbarDashboard.classList.contains("active")) {
			clearInterval(updateDashboardListInterval);

			setTimeout(() => {
				if(divDashboardMarketList.classList.contains("loading") || divDashboardHoldingsList.classList.contains("loading")) {
					listDashboard();
				}
			}, 5000);

			getMarket(1, 10).then(coins => {
				if(divDashboardMarketList.getElementsByClassName("coin-wrapper loading").length > 0) {
					divDashboardMarketList.getElementsByClassName("coin-wrapper loading")[0].remove();
					divDashboardMarketList.classList.remove("loading");
				}

				let keys = Object.keys(coins);
				keys.sort((a, b) => {
					return coins[keys[b]].market_cap - coins[keys[a]].market_cap;
				});

				keys.map(key => {
					let coin = coins[key];
					let price = parseFloat(coin.current_price);

					if(price > 1) {
						price = separateThousands(price);
					}

					let id = "dashboard-market-coin-" + coin.id;

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

							div.innerHTML = '<img draggable="false" src="' + icon + '" title="' + name + '"><span class="coin" title="' + name + '">' + symbol.toUpperCase() + '</span><span class="price">' + currencies[settings.currency] + price + '</span><span class="day">' + priceChangeDay + '%</span>';

							divDashboardMarketList.appendChild(div);
						}
					} catch(e) {
						console.log(e);
					}
				});

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
			}).catch(e => {
				console.log(e);
			});

			getHoldings().then(coins => {
				try {
					if(Object.keys(coins).length === 0) {
						if(divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
							divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
						}
					} else {
						parseHoldings(coins).then(holdings => {
							if(divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
								divDashboardHoldingsList.getElementsByClassName("coin-wrapper loading")[0].remove();
								divDashboardHoldingsList.classList.remove("loading");
							}

							if(globalData.totalValue > 0) {
								if(window.innerWidth > 480) {
									spanDashboardHoldingsValue.textContent = currencies[settings.currency] + separateThousands(globalData.totalValue.toFixed(2));
								} else {
									spanDashboardHoldingsValue.textContent = currencies[settings.currency] + abbreviateNumber(globalData.totalValue, 2);
								}
							}

							Object.keys(holdings).map(holding => {
								let coin = holdings[holding];
				
								let id = "dashboard-holdings-coin-" + holding;
								let icon = coin.image;
								let amount = coin.amount;
								let symbol = coin.symbol;

								let div;

								try {
									if(document.getElementById(id)) {
										div = document.getElementById(id);
										div.getElementsByClassName("amount")[0].textContent = separateThousands(amount);
									} else {
										div = document.createElement("div");
										div.id = id;
										div.classList.add("coin-wrapper");

										div.innerHTML = '<img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="amount">' + separateThousands(amount) + '</span>';

										divDashboardHoldingsList.appendChild(div);
									}
								} catch(e) {
									console.log(e);
								}
							});
						}).catch(e => {
							console.log(e);
						});
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

	function listHoldings() {
		if((!divLoginWrapper.classList.contains("active") && divNavbarHoldings.classList.contains("active")) || url.searchParams.get("access") === "view") {
			clearInterval(updateHoldingsListInterval);

			divPageNavigation.classList.remove("active");

			setTimeout(() => {
				if(divHoldingsList.classList.contains("loading")) {
					listHoldings();
				}
			}, 5000);

			getHoldings().then(coins => {
				try {
					if(Object.keys(coins).length === 0) {
						clearActivityList();
						if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
							divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].innerHTML = '<span>No Holdings Found...</span>';
						}
					} else {
						parseHoldings(coins).then(holdings => {
							if(divHoldingsList.getElementsByClassName("coin-wrapper loading").length > 0) {
								divHoldingsList.getElementsByClassName("coin-wrapper loading")[0].remove();
								divHoldingsList.classList.remove("loading");
							}

							if(globalData.totalValue > 0) {
								if(window.innerWidth > 480) {
									spanHoldingsTotalValue.textContent = currencies[settings.currency] + separateThousands(globalData.totalValue.toFixed(2));
								} else {
									spanHoldingsTotalValue.textContent = currencies[settings.currency] + abbreviateNumber(globalData.totalValue, 2);
								}
							}

							Object.keys(holdings).map(holding => {
								let coin = holdings[holding];
				
								let id = "holdings-coin-" + holding;
								let icon = coin.image;
								let amount = coin.amount;
								let symbol = coin.symbol;
								let value = coin.value.toFixed(2);

								if(window.innerWidth <= 600 && window.innerWidth > 440) {
									value = abbreviateNumber(value, 2);
								} else if(window.innerWidth <= 440) {
									value = abbreviateNumber(value, 0);
								}

								let day = coin.change.includes("-") ? coin.change + "%" : "+" + coin.change + "%";

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

										div.innerHTML = '<img draggable="false" src="' + icon + '"><span class="coin">' + symbol.toUpperCase() + '</span><span class="amount">' + separateThousands(amount) + '</span><span class="value">' + currencies[settings.currency] + separateThousands(value) + '</span><span class="day">' + day + '</span>';

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

						events = sortActivity(events);
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

	function getLocalSettings() {
		return new Promise((resolve, reject) => {
			checkSession();

			getServerSettings().then((response) => {
				settings = response;

				settings.currency = empty(localStorage.getItem("currency")) ? "usd" : localStorage.getItem("currency");

				settings.theme = empty(localStorage.getItem("theme")) ? "light" : localStorage.getItem("theme");

				settings.coinBackdrop = empty(localStorage.getItem("coinBackdrop")) ? "disabled" : localStorage.getItem("coinBackdrop");

				settings.highlightPriceChange = empty(localStorage.getItem("highlightPriceChange")) ? "disabled" : localStorage.getItem("highlightPriceChange");

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

				if(settings.highlightPriceChange === "enabled") {
					divDashboardMarketList.classList.add("highlight");
					divDashboardHoldingsList.classList.add("highlight");
					divMarketList.classList.add("highlight");
					divHoldingsList.classList.add("highlight");
				} else {
					divDashboardMarketList.classList.remove("highlight");
					divDashboardHoldingsList.classList.remove("highlight");
					divMarketList.classList.remove("highlight");
					divHoldingsList.classList.remove("highlight");
				}

				inputSharingURL.value = window.location.href.replaceAll("index.html", "") + "index.html?access=view&pin=" + settings.pin;

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

				xhr.open("GET", api + "settings/read.php?token=" + sessionToken, true);
				xhr.send();
			} catch(e) {
				reject(e);
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

				xhr.open("PUT", api + "account/update.php", true);
				xhr.send(JSON.stringify({ currentPassword:currentPassword, newPassword:newPassword }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function changeSetting(key, value) {
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

				xhr.open("PUT", api + "settings/update.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, key:key, value:value }));
			} catch(e) {
				reject(e);
			}
		});
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
				xhr.send(JSON.stringify({ token:sessionToken, id:id, symbol:symbol, amount:amount }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function updateHolding(id, amount) {
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

				xhr.open("PUT", api + "holdings/update.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, id:id, amount:amount }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteHolding(id) {
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

				xhr.open("DELETE", api + "holdings/delete.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, id:id }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function importHoldings(rows) {
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
		xhr.send(JSON.stringify({ token:sessionToken, rows:rows }));
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
			html += '<button class="delete" id="popup-delete">Delete Event</button>';
		}
		
		html += '<button class="reject" id="popup-cancel">Cancel</button><button class="resolve" id="popup-confirm">Confirm</button>';

		let popupHeight = 360;
	
		popup((action === "create") ? "Recording Event" : "Editing Event", html, 300, popupHeight);

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
				symbol = symbol.trim().toLowerCase();

				getCoinID("symbol", symbol).then(response => {
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

	function createActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
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

				xhr.open("POST", api + "activity/create.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function updateActivity(txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
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

				xhr.open("PUT", api + "activity/update.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, txID:txID, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function deleteActivity(txID) {
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

				xhr.open("DELETE", api + "activity/delete.php", true);
				xhr.send(JSON.stringify({ token:sessionToken, txID:txID }));
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
		xhr.send(JSON.stringify({ token:sessionToken, rows:rows }));
	}

	function getCoin(id) {
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

				xhr.open("GET", api + "coins/read.php?token=" + sessionToken + "&" + key + "=" + value, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function getMarket(page, amount) {
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

				xhr.open("GET", "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + settings.currency + "&order=market_cap_desc&per_page=" + amount + "&page=" + page + "&sparkline=false", true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
	}

	function verifySession(token) {
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

				xhr.open("POST", api + "account/login.php", true);
				xhr.send(JSON.stringify({ token:token }));
			} catch(e) {
				reject(e);
			}
		});
	}

	function getHoldings() {
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

				xhr.open("GET", api + "holdings/read.php?token=" + sessionToken, true);
				xhr.send();
			} catch(e) {
				reject(e);
			}
		});
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

				xhr.open("GET", api + "activity/read.php?token=" + sessionToken, true);
				xhr.send();
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

		array.reverse().map(item => {
			sorted[item[0]] = events[item[0]];
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

	function download(url) {
		let frame = document.createElement("iframe");
		frame.src = url;
		frame.classList.add("hidden");
		divPageSettings.appendChild(frame);
		frame.addEventListener("load", () => {
			frame.remove();
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
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}