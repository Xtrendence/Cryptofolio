import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import LinearGradient from "react-native-linear-gradient";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { empty, separateThousands, abbreviateNumber, epoch } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Dashboard({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const marketRef = React.createRef();
	const holdingsRef = React.createRef();

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());
	const [refresh, setRefresh] = React.useState();

	const [marketCap, setMarketCap] = React.useState(loadingText);
	const [marketChange, setMarketChange] = React.useState();
	const [holdingsValue, setHoldingsValue] = React.useState(loadingText);

	const [marketData, setMarketData] = React.useState([<Text key="loading" style={[styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
	const [holdingsData, setHoldingsData] = React.useState([<Text key="loading" style={[styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		setRefresh();

		setMarketData([<Text key="loading" style={[styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);
		setHoldingsData([<Text key="loading" style={[styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

		setPageKey(epoch());

		clearInterval(refresh);
		setRefresh();

		getMarket();
		getGlobal();
		getHoldings();

		setRefresh(setInterval(() => {
			if(navigation.isFocused() && !empty(refresh)) {
				getMarket();
				getGlobal();
				getHoldings();
			}
		}, 20000));
	}, [theme]);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true} key={pageKey}>
			<LinearGradient style={[styles.card, { marginBottom:20, marginTop:0 }]} colors={globalColors[theme].purpleGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{marketCap} {marketChange}</Text>
			</LinearGradient>
			<ScrollView ref={marketRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} contentContainerStyle={{ paddingLeft:20, paddingTop:10, paddingBottom:10 }} nestedScrollEnabled={true}>
				{ !empty(marketData) &&
					marketData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={[styles.card, { marginBottom:20 }]} colors={globalColors[theme].blueGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{holdingsValue}</Text>
			</LinearGradient>
			<ScrollView ref={holdingsRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`], { marginBottom:60 }]} contentContainerStyle={{ paddingLeft:20, paddingTop:10, paddingBottom:10 }} nestedScrollEnabled={true}>
				{ !empty(holdingsData) &&
					holdingsData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	async function getMarket() {
		setTimeout(() => {
			if(marketData.length === 1 && navigation.isFocused()) {
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
				<View style={styles.row} key={epoch() + "market-header"}>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]}>#</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]}>Coin</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerPrice]}>Price</Text>
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
					<View style={styles.row} key={epoch() + key}>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank]}>{rank}</Text>
						<Image style={styles.cellImage} source={{uri:icon}}/>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol]}>{symbol}</Text>
						<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellPrice]}>{price}</Text>
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
		setTimeout(() => {
			if((marketCap === loadingText || empty(marketChange)) && navigation.isFocused()) {
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
			
			if(navigation.isFocused()) {
				setMarketCap("$" + separateThousands(marketCap));
				setMarketChange("(" + marketChange + "%)");
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function getHoldings() {
		setTimeout(() => {
			if(holdingsData[0] === <Text key="loading" style={[styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text> && navigation.isFocused()) {
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
				if(navigation.isFocused()) {
					setHoldingsData([<Text key="empty" style={[styles.headerText, styles[`headerText${theme}`]]}>No Holdings Found.</Text>]);
				}
			} else {
				parseHoldings(coins).then(holdings => {
					let data = [];

					data.push(
						<View style={styles.row} key={epoch() + "holdings-header"}>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]}>#</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]}>Coin</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerAmount]}>Amount</Text>
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
							<View style={styles.row} key={epoch() + holding}>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank]}>{rank}</Text>
								<Image style={styles.cellImage} source={{uri:icon}}/>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol]}>{symbol}</Text>
								<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellAmount]}>{amount}</Text>
							</View>
						);
					});

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

					if(holdingsValue > 0 && navigation.isFocused()) {
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

const styles = StyleSheet.create({
	page: {
		height:screenHeight - 180,
		backgroundColor:globalColors["Light"].mainSecond
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	tableWrapper: {
		backgroundColor:globalColors["Light"].mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		maxHeight:240
	},
	tableWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
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
		color:globalColors["Light"].mainContrastLight,
		marginBottom:4,
	},
	headerTextDark: {
		color:globalColors["Dark"].mainContrastLight
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
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
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
		borderRadius:15,
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
		color:globalColors["Light"].accentContrast,
		fontWeight:"bold",
		textAlign:"center"
	},
	cardTextDark: {
		color:globalColors["Dark"].accentContrast
	}
});