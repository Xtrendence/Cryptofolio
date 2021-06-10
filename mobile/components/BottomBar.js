import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";

export default function BottomBar({ screen, navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const [left, setLeft] = React.useState("0%");

	useEffect(() => {
		checkActive();
	}, [screen.active]);

	return (
		<View style={[styles.bar, styles[`bar${theme}`]]}>
			<View style={styles.background}>
				<View style={[styles.backdrop, styles[`backdrop${theme}`], { left:left }]}></View>
			</View>
			<View style={styles.foreground}>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Dashboard") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="th-large" size={iconSize} color={globalColors[theme].mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Market") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="university" size={iconSize} color={globalColors[theme].mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Holdings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="wallet" size={iconSize} color={globalColors[theme].mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Activity") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="exchange-alt" size={iconSize} color={globalColors[theme].mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Settings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="cog" size={iconSize} color={globalColors[theme].mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);

	async function checkActive() {
		switch(screen.active) {
			case "Dashboard":
				animateLeft(0);
				navigation.current.navigate("Dashboard");
				break;
			case "Market":
				animateLeft(20);
				navigation.current.navigate("Market");
				break;
			case "Holdings":
				animateLeft(40);
				navigation.current.navigate("Holdings");
				break;
			case "Activity":
				animateLeft(60);
				navigation.current.navigate("Activity");
				break;
			case "Settings":
				animateLeft(80);
				navigation.current.navigate("Settings");
				break;
		}
	}

	async function animateLeft(to) {
		let from = parseInt(left.replace("%", ""));
		let animate = setInterval(() => {
			if(from === to) {
				clearInterval(animate);
			} else {
				from = from > to ? from - 5 : from + 5;
				setLeft(from + "%");
			}
		}, 5);
	}
}

const iconSize = 24;

const styles = StyleSheet.create({
	bar: {
		position:"absolute",
		bottom:0,
		left:0,
		width:"100%",
		height:62,
		borderTopColor:globalColors["Light"].mainThird,
		borderTopWidth:2,
		borderStyle:"solid",
		backgroundColor:globalColors["Light"].mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	barDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
		borderTopColor:globalColors["Dark"].mainThird
	},
	foreground: {
		width:"100%",
		height:"100%",
		flex:1,
		flexDirection:"row",
		alignItems:"center",
		position:"absolute",
		zIndex:3,
	},
	background: {
		zIndex:2,
		width:"100%",
		height:"100%",
		position:"absolute"
	},
	backdrop: {
		top:"15%",
		width:"15%",
		borderRadius:40,
		marginLeft:"2.5%",
		height:"70%",
		backgroundColor:globalColors["Light"].mainThird
	},
	backdropDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	tab: {
		width:"20%"
	},
	itemWrapper: {
		flex:1,
		flexGrow:1,
		flexDirection:"column",
		height:40,
		marginLeft:10,
		marginRight:10,
		justifyContent:"center",
		alignItems:"center",
		borderRadius:40
	},
	iconWrapper: {
		height:"100%",
		alignItems:"center",
		justifyContent:"center"
	}
});