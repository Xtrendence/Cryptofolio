import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import LinearGradient from "react-native-linear-gradient";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { empty, separateThousands, abbreviateNumber, epoch, wait, currencies, capitalizeFirstLetter } from "../utils/utils";
import styles from "../styles/Dashboard";
import { getWatchlist } from "../utils/requests";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Dashboard({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const marketRef = React.createRef();
	const holdingsRef = React.createRef();

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());
	const [marketKey, setMarketKey] = React.useState(epoch() + "-market");
	const [holdingsKey, setHoldingsKey] = React.useState(epoch() + "-holdings");

	const [refreshing, setRefreshing] = React.useState(false);

	const [dashboardWatchlistState, setDashboardWatchlistState] = React.useState("disabled");
	const [transactionsAffectHoldingsState, setTransactionsAffectHoldingsState] = React.useState("disabled");
	const [additionalDashboardColumnsState, setAdditionalDashboardColumnsState] = React.useState("disabled");
	const [highlightPriceChangeState, setHighlightPriceChangeState] = React.useState("disabled");

	const [marketCap, setMarketCap] = React.useState(loadingText);
	const [marketChange, setMarketChange] = React.useState();
	const [holdingsValue, setHoldingsValue] = React.useState(loadingText);

	const [marketData, setMarketData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
	const [holdingsData, setHoldingsData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		// setInterval(() => {
		// 	if(navigation.isFocused()) {
		// 		getMarket();
		// 		getGlobal();
		// 		getHoldings();
		// 	}
		// }, 20000);

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					setPageKey(epoch());
					getMarket();
					getGlobal();
					getHoldings();
				}, 500);
			}
		});
	}, []);

	useEffect(() => {
		setMarketData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
		setHoldingsData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

		setPageKey(epoch());

		getMarket();
		getGlobal();
		getHoldings();
	}, [theme]);

	useEffect(() => {
		setMarketData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
		setHoldingsData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
		setMarketKey(epoch() + "-market");
		setHoldingsKey(epoch() + "-holdings");
	}, [dashboardWatchlistState, transactionsAffectHoldingsState, additionalDashboardColumnsState, highlightPriceChangeState]);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		getMarket();
		getGlobal();
		getHoldings();
		wait(750).then(() => setRefreshing(false));
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true} key={pageKey} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[globalColors[theme].accentFirst]} progressBackgroundColor={globalColors[theme].mainFirst}/>}>
			<LinearGradient style={[styles.card, { marginBottom:20, marginTop:0 }]} colors={globalColors[theme].purpleGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{marketCap} {marketChange}</Text>
			</LinearGradient>
			<ScrollView ref={marketRef} key={marketKey} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} nestedScrollEnabled={true} horizontal={true}>
				<ScrollView contentContainerStyle={{ paddingTop:10, paddingBottom:10, minWidth:screenWidth - 40 }} nestedScrollEnabled={true} horizontal={false}>
					{ !empty(marketData) &&
						marketData.map(row => {
							return row;
						})
					}
				</ScrollView>
			</ScrollView>
			<LinearGradient style={[styles.card, { marginBottom:20 }]} colors={globalColors[theme].blueGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{holdingsValue}</Text>
			</LinearGradient>
			<ScrollView ref={holdingsRef} key={holdingsKey} style={[styles.tableWrapper, styles[`tableWrapper${theme}`], { marginBottom:60 }]} nestedScrollEnabled={true} horizontal={true}>
				<ScrollView contentContainerStyle={{ paddingTop:10, paddingBottom:10, minWidth:screenWidth - 40 }} nestedScrollEnabled={true} horizontal={false}>
					{ !empty(holdingsData) &&
						holdingsData.map(row => {
							return row;
						})
					}
				</ScrollView>
			</ScrollView>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	async function getMarket() {
		console.log("Dashboard - Getting Market - " + epoch());

		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		let dashboardWatchlist = await AsyncStorage.getItem("dashboardWatchlist");
		if(empty(dashboardWatchlist)) {
			dashboardWatchlist = "disabled";
		}

		if(dashboardWatchlistState !== dashboardWatchlist) {
			setDashboardWatchlistState(dashboardWatchlist);
		}

		let additionalDashboardColumns = await AsyncStorage.getItem("additionalDashboardColumns");
		if(empty(additionalDashboardColumns)) {
			additionalDashboardColumns = "disabled";
		}

		if(additionalDashboardColumnsState !== additionalDashboardColumns) {
			setAdditionalDashboardColumnsState(additionalDashboardColumns);
		}

		let highlightPriceChange = await AsyncStorage.getItem("highlightPriceChange");
		if(empty(highlightPriceChange)) {
			highlightPriceChange = "disabled";
		}

		if(highlightPriceChangeState !== highlightPriceChange) {
			setHighlightPriceChangeState(highlightPriceChange);
		}

		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=10&page=1&sparkline=false";

		let watchlist;

		if(dashboardWatchlist === "enabled") {
			watchlist = await getWatchlist();
			endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=100&page=1&sparkline=false&ids=" + Object.keys(watchlist).join("%2C");
		}

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (coins) => {
			let data = [];

			data.push(
				<View style={styles.row} key={epoch() + "market-header"}>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]}>#</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]}>Coin</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerPrice]}>Price</Text>
					{ (additionalDashboardColumns === "enabled") &&
						<View style={{ flexDirection:"row" }}>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerMarketCap]}>Market Cap</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerDay]}>24h Change</Text>
						</View>
					}
				</View>
			);

			let keys = Object.keys(coins);

			let rank = 0;

			keys.map(key => {
				rank += 1;

				let coin = coins[key];
				let price = parseFloat(coin.current_price);

				if(price > 1) {
					price = separateThousands(price);
				}

				let marketCap = abbreviateNumber(coin.market_cap, 2);

				let priceChangeDay = coin.price_change_percentage_24h;

				if(!empty(priceChangeDay)) {
					priceChangeDay = priceChangeDay.toFixed(2).includes("-") ? priceChangeDay.toFixed(2) : "+" + priceChangeDay.toFixed(2);
				} else {
					priceChangeDay = "-";
				}

				let change = parseFloat(coin.market_cap_change_percentage_24h);

				let changeType = "";
				if(change > 0) {
					changeType = "Positive";
				} else if(change === 0) {
					changeType = "None"
				} else {
					changeType = "Negative";
				}

				let highlightRow = `rowHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;
				let highlightText = `cellHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;

				let icon = coin.image;

				let symbol = coin.symbol.toUpperCase();

				data.push(
					<View style={[styles.row, styles[highlightRow]]} key={epoch() + key}>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank, styles[highlightText]]}>{rank}</Text>
						<Image style={styles.cellImage} source={{uri:icon}}/>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol, styles[highlightText]]}>{symbol}</Text>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellPrice, styles[highlightText]]}>{currencies[currency] + price}</Text>
						{ (additionalDashboardColumns === "enabled") &&
							<View style={{ flexDirection:"row" }}>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellMarketCap, styles[highlightText]]}>{currencies[currency] + marketCap}</Text>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellDay, styles[highlightText]]}>{priceChangeDay}%</Text>
							</View>
						}
					</View>
				);
			});

			if(navigation.isFocused()) {
				setMarketData(data);
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function getGlobal() {
		console.log("Dashboard - Getting Global - " + epoch());

		let endpoint = "https://api.coingecko.com/api/v3/global";

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (global) => {
			let currency = await AsyncStorage.getItem("currency");
			if(empty(currency)) {
				currency = "usd";
			}

			let marketCap = (global.data.total_market_cap[currency]).toFixed(0);
			let marketChange = (global.data.market_cap_change_percentage_24h_usd).toFixed(1);

			if(screenWidth < 380) {
				marketCap = abbreviateNumber(marketCap, 3);
			}
			
			if(navigation.isFocused()) {
				setMarketCap(currencies[currency] + separateThousands(marketCap));
				setMarketChange("(" + marketChange + "%)");
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function getHoldings() {
		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		let transactionsAffectHoldings = await AsyncStorage.getItem("transactionsAffectHoldings");
		if(empty(transactionsAffectHoldings)) {
			transactionsAffectHoldings = "disabled";
		}

		if(transactionsAffectHoldingsState !== transactionsAffectHoldings) {
			setTransactionsAffectHoldingsState(transactionsAffectHoldings);
		}
		
		let additionalDashboardColumns = await AsyncStorage.getItem("additionalDashboardColumns");
		if(empty(additionalDashboardColumns)) {
			additionalDashboardColumns = "disabled";
		}

		if(additionalDashboardColumnsState !== additionalDashboardColumns) {
			setAdditionalDashboardColumnsState(additionalDashboardColumns);
		}

		let highlightPriceChange = await AsyncStorage.getItem("highlightPriceChange");
		if(empty(highlightPriceChange)) {
			highlightPriceChange = "disabled";
		}

		if(highlightPriceChangeState !== highlightPriceChange) {
			setHighlightPriceChangeState(highlightPriceChange);
		}

		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "holdings/read.php?platform=app&token=" + token;

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (coins) => {
			if(Object.keys(coins).length === 0 && transactionsAffectHoldings !== "override" && transactionsAffectHoldings !== "mixed") {
				if(navigation.isFocused()) {
					setHoldingsData([<Text key="empty" style={[styles.headerText, styles[`headerText${theme}`]]}>No Holdings Found.</Text>]);
					setHoldingsValue("-");
				}
			} else {
				let transactionsBySymbol;

				if(transactionsAffectHoldings === "mixed") {
					transactionsBySymbol = await getActivityHoldings();

					let ids = Object.keys(transactionsBySymbol);
					ids.map(id => {
						if(!(id in coins)) {
							coins[id] = { amount:0, symbol:transactionsBySymbol[id].symbol };
						}
					});
				} else if(transactionsAffectHoldings === "override") {
					transactionsBySymbol = await getActivityHoldings();

					coins = {};

					let ids = Object.keys(transactionsBySymbol);
					ids.map(id => {
						if(transactionsBySymbol[id].amount > 0) {
							coins[id] = { amount:transactionsBySymbol[id].amount, symbol:transactionsBySymbol[id].symbol };
						}
					});
				}

				parseHoldings(coins).then(async holdings => {
					let data = [];

					data.push(
						<View style={styles.row} key={epoch() + "holdings-header"}>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]}>#</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]}>Coin</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerAmount]}>Amount</Text>
							{ (additionalDashboardColumns === "enabled") &&
								<View style={{ flexDirection:"row" }}>
									<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerValue]}>Value</Text>
									<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerDay]}>24h Change</Text>
								</View>
							}
						</View>
					);

					let rank = 0;
					
					let mixedValue = 0;

					Object.keys(holdings).map(holding => {
						rank += 1;

						let coin = holdings[holding];

						let icon = coin.image;
						let amount = coin.amount;
						let symbol = coin.symbol;
						let value = separateThousands(abbreviateNumber(coin.value.toFixed(2), 2));

						let day = coin.change.includes("-") ? coin.change + "%" : "+" + coin.change + "%";

						if(!empty(transactionsBySymbol)) {
							if(transactionsAffectHoldings === "mixed") {
								if(holding in transactionsBySymbol) {
									amount = parseFloat(amount) + transactionsBySymbol[holding].amount;
									value = (coin.price * amount).toFixed(2);
									mixedValue += parseFloat(value.replaceAll(",", ""));
									value = separateThousands(abbreviateNumber(parseFloat(value.replaceAll(",", "")), 2));
								}
							}
						}

						let change = parseFloat(coin.change);

						let changeType = "";
						if(change > 0) {
							changeType = "Positive";
						} else if(change === 0) {
							changeType = "None"
						} else {
							changeType = "Negative";
						}

						let highlightRow = `rowHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;
						let highlightText = `cellHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;

						if(amount < 0) {
							amount = 0;
						}

						if(value < 0) {
							value = 0;
						}

						data.push(
							<View key={epoch() + holding} style={[styles.row, styles[highlightRow]]}>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank, styles[highlightText]]}>{rank}</Text>
								<Image style={styles.cellImage} source={{uri:icon}}/>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol, styles[highlightText]]}>{symbol}</Text>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellAmount, styles[highlightText]]}>{separateThousands(amount)}</Text>
								{ (additionalDashboardColumns === "enabled") &&
									<View>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellValue, styles[highlightText]]} ellipsizeMode="tail">{currencies[currency] + value}</Text>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellDay, styles[highlightText]]}>{day}</Text>
									</View>
								}
							</View>
						);
					});

					if(mixedValue > 0 && navigation.isFocused()) {
						let currency = await AsyncStorage.getItem("currency");
						if(empty(currency)) {
							currency = "usd";
						}

						let totalValue = holdingsValue;

						if(!isNaN(totalValue)) {
							totalValue += mixedValue;
						} else {
							totalValue = mixedValue;
						}

						if(screenWidth > 380) {
							setHoldingsValue(currencies[currency] + separateThousands(totalValue.toFixed(2)));
						} else {
							setHoldingsValue(currencies[currency] + abbreviateNumber(totalValue, 2));
						}
					}

					if(navigation.isFocused()) {
						setHoldingsData(data);
					}
				}).catch(e => {
					console.log(e);
				});
			}
		}).catch(error => {
			console.log(error);
		});
	}

	function parseHoldings(coins) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log("Parsing Holdings - " + epoch());

				let currency = await AsyncStorage.getItem("currency");
				if(empty(currency)) {
					currency = "usd";
				}

				let list = Object.keys(coins).join("%2C");

				let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&ids=" + list + "&order=market_cap_desc&per_page=250&page=1&sparkline=false";

				fetch(endpoint, {
					method: "GET",
					headers: {
						Accept: "application/json", "Content-Type": "application/json"
					}
				})
				.then((json) => {
					return json.json();
				})
				.then(async (response) => {
					let holdingsValue = 0;

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
							symbol:coins[id].symbol.toUpperCase(),
							amount:amount,
							value:value,
							price:price,
							change:priceChangeDay,
							image:coin.image
						};

						holdingsValue += value;
					});

					if(holdingsValue > 0 && navigation.isFocused()) {
						let currency = await AsyncStorage.getItem("currency");
						if(empty(currency)) {
							currency = "usd";
						}
						
						if(screenWidth > 380) {
							setHoldingsValue(currencies[currency] + separateThousands(holdingsValue.toFixed(2)));
						} else {
							setHoldingsValue(currencies[currency] + abbreviateNumber(holdingsValue, 2));
						}
					}

					resolve(Object.fromEntries(
						Object.entries(holdings).sort(([,a],[,b]) => b.value - a.value)
					));
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			} catch(error) {
				reject(error);
			}
		});
	}

	async function getActivityHoldings() {
		console.log("Holdings - Getting Activity - " + epoch());

		return new Promise(async (resolve, reject) => {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");

			let endpoint = api + "activity/read.php?platform=app&token=" + token;

			fetch(endpoint, {
				method: "GET",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((response) => {
				return response.json();
			})
			.then(async (events) => {
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

				resolve(sorted);
			}).catch(error => {
				console.log(arguments.callee.name + " - " + error);
				reject(error);
			});
		});
	}
}