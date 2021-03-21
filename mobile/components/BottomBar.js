import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";

let globalColors = globalColorsLight;

export default function BottomBar({ screen, navigation }) {
	const [left, setLeft] = React.useState("0%");

	useEffect(() => {
		checkActive();
	}, [screen.active]);

	return (
		<View style={styles.bar}>
			<View style={styles.background}>
				<View style={[styles.backdrop, { left:left }]}></View>
			</View>
			<View style={styles.foreground}>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Dashboard") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="th-large" size={iconSize} color={globalColors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Market") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="university" size={iconSize} color={globalColors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Holdings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="wallet" size={iconSize} color={globalColors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Settings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="cog" size={iconSize} color={globalColors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);

	function checkActive() {
		switch(screen.active) {
			case "Dashboard":
				animateLeft(0);
				navigation.current.navigate("Dashboard");
				break;
			case "Market":
				animateLeft(25);
				navigation.current.navigate("Market");
				break;
			case "Holdings":
				animateLeft(50);
				navigation.current.navigate("Holdings");
				break;
			case "Settings":
				animateLeft(75);
				navigation.current.navigate("Settings");
				break;
		}
	}

	function animateLeft(to) {
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
		height:60,
		backgroundColor:globalColors.mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
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
		width:"20%",
		borderRadius:40,
		marginLeft:"2.5%",
		height:"70%",
		backgroundColor:globalColors.mainThird
	},
	tab: {
		width:"25%"
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