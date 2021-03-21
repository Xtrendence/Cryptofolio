import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";

let globalColors = globalColorsLight;

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Dashboard({ navigation }) {
	const loadingText = "Loading...";

	const [marketCap, setMarketCap] = React.useState(loadingText);
	const [marketChange, setMarketChange] = React.useState();
	const [holdingsValue, setHoldingsValue] = React.useState(loadingText);

	const [marketData, setMarketData] = React.useState([<Text key="loading" style={styles.headerText}>Loading...</Text>]);
	const [holdingsData, setHoldingsData] = React.useState([<Text key="loading" style={styles.headerText}>Loading...</Text>]);

	useEffect(() => {
		getMarket();
		getGlobal();
		getHoldings();
		setInterval(() => {
			if(navigation.isFocused()) {
				getMarket();
				getGlobal();
				getHoldings();
			}
		}, 20000);
	}, []);

	return (
		<ScrollView style={styles.page} contentContainerStyle={{ padding:20 }}>
			<ScrollView style={styles.tableWrapper} contentContainerStyle={{ paddingLeft:20, paddingTop:10, paddingBottom:10 }}>
				{ !empty(marketData) &&
					marketData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={[styles.card, { marginBottom:20 }]} colors={globalColors.purpleGradient} useAngle={true} angle={45}>
				<Text style={styles.cardText}>{marketCap} {marketChange}</Text>
			</LinearGradient>
			<ScrollView style={styles.tableWrapper} contentContainerStyle={{ paddingLeft:20, paddingTop:10, paddingBottom:10 }}>
				{ !empty(holdingsData) &&
					holdingsData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={styles.card} colors={globalColors.blueGradient} useAngle={true} angle={45}>
				<Text style={styles.cardText}>{holdingsValue}</Text>
			</LinearGradient>
		</ScrollView>
	);

	async function getMarket() {
		setTimeout(() => {
			if(marketData.length === 1) {
				getMarket();
			}
		}, 5000);

		let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

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
				<View style={styles.row} key="market-header">
					<Text style={[styles.headerText, styles.headerRank]}>#</Text>
					<Text style={[styles.headerText, styles.headerCoin]}>Coin</Text>
					<Text style={[styles.headerText, styles.headerPrice]}>Price</Text>
				</View>
			);

			let keys = Object.keys(coins);
			keys.sort((a, b) => {
				return coins[keys[b]].market_cap - coins[keys[a]].market_cap;
			});

			let rank = 0;

			keys.map(key => {
				rank += 1;

				let coin = coins[key];
				let price = parseFloat(coin.current_price);

				if(price > 1) {
					price = separateThousands(price);
				}

				let icon = coin.image;

				let symbol = coin.symbol.toUpperCase();

				data.push(
					<View style={styles.row} key={key}>
						<Text style={[styles.cellText, styles.cellRank]}>{rank}</Text>
						<Image style={styles.cellImage} source={{uri:icon}}/>
						<Text style={[styles.cellText, styles.cellSymbol]}>{symbol}</Text>
						<Text style={[styles.cellText, styles.cellPrice]}>{price}</Text>
					</View>
				);
			});

			setMarketData(data);
		}).catch(error => {
			console.log(error);
		});
	}

	async function getGlobal() {
		setTimeout(() => {
			if(marketCap === loadingText || empty(marketChange)) {
				getGlobal();
			}
		}, 5000);

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
			let marketCap = (global.data.total_market_cap.usd).toFixed(0);
			let marketChange = (global.data.market_cap_change_percentage_24h_usd).toFixed(1);

			if(screenWidth < 380) {
				marketCap = abbreviateNumber(marketCap, 3);
			}

			setMarketCap("$" + separateThousands(marketCap));
			setMarketChange("(" + marketChange + "%)");
		}).catch(error => {
			console.log(error);
		});
	}

	async function getHoldings() {
		setTimeout(() => {
			if(holdingsData[0] === <Text key="loading" style={styles.headerText}>Loading...</Text>) {
				getHoldings();
			}
		}, 5000);

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
			if(Object.keys(coins).length === 0) {
				setHoldingsData([<Text key="empty" style={styles.headerText}>No Holdings Found.</Text>]);
			} else {
				parseHoldings(coins).then(holdings => {
					let data = [];

					data.push(
						<View style={styles.row} key="market-header">
							<Text style={[styles.headerText, styles.headerRank]}>#</Text>
							<Text style={[styles.headerText, styles.headerCoin]}>Coin</Text>
							<Text style={[styles.headerText, styles.headerAmount]}>Amount</Text>
						</View>
					);

					let rank = 0;

					Object.keys(holdings).map(holding => {
						rank += 1;

						let coin = holdings[holding];

						let icon = coin.image;
						let amount = coin.amount;
						let symbol = coin.symbol;

						data.push(
							<View style={styles.row} key={holding}>
								<Text style={[styles.cellText, styles.cellRank]}>{rank}</Text>
								<Image style={styles.cellImage} source={{uri:icon}}/>
								<Text style={[styles.cellText, styles.cellSymbol]}>{symbol}</Text>
								<Text style={[styles.cellText, styles.cellAmount]}>{amount}</Text>
							</View>
						);
					});

					setHoldingsData(data);
				}).catch(e => {
					console.log(e);
				});
			}
		}).catch(error => {
			console.log(error);
		});
	}

	function parseHoldings(coins) {
		return new Promise((resolve, reject) => {
			try {
				let list = Object.keys(coins).join("%2C");

				let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + list + "&order=market_cap_desc&per_page=250&page=1&sparkline=false";

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

					if(holdingsValue > 0) {
						if(screenWidth > 380) {
							setHoldingsValue("$" + separateThousands(holdingsValue.toFixed(2)));
						} else {
							setHoldingsValue("$" + abbreviateNumber(holdingsValue, 2));
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
}

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

function empty(value) {
	if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}

const styles = StyleSheet.create({
	page: {
		maxHeight:screenHeight - 180,
		backgroundColor:globalColors.mainSecond
	},
	tableWrapper: {
		backgroundColor:globalColors.mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		maxHeight:240
	},
	row: {
		flexDirection:"row",
		alignItems:"center",
		padding:4
	},
	headerText: {
		fontSize:18,
		fontFamily:globalStyles.fontFamily,
		fontWeight:"bold",
		color:globalColors.mainContrastLight,
		marginBottom:4,
	},
	headerRank: {
		width:30
	},
	headerCoin: {
		width:100,
		marginLeft:15,
	},
	headerPrice: {

	},
	headerAmount: {

	},
	cellText: {
		color:globalColors.mainContrastLight
	},
	cellRank: {
		width:30
	},
	cellSymbol: {
		width:74
	},
	cellPrice: {

	},
	cellAmount: {

	},
	cellImage: {
		width:30,
		height:30,
		marginRight:10,
	},
	card: {
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		justifyContent:"center",
		alignItems:"center",
		height:60,
		marginTop:20,
	},
	cardText: {
		lineHeight:56,
		paddingBottom:4,
		fontSize:20,
		fontFamily:globalStyles.fontFamily,
		color:globalColors.accentContrast,
		fontWeight:"bold",
		textAlign:"center"
	}
});