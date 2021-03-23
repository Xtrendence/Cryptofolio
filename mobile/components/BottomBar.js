import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";
import getStyle from "../styles/bottombar";

export default function BottomBar({ screen, navigation, colors, setColors, theme, setTheme }) {
	const [styles, setStyles] = React.useState(getStyle(colors));

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
							<Icon name="th-large" size={iconSize} color={colors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Market") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="university" size={iconSize} color={colors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Holdings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="wallet" size={iconSize} color={colors.mainContrastLight}></Icon>
						</View>
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.tab} onPress={() => { screen.setActive("Settings") }}>
					<View style={styles.itemWrapper}>
						<View style={styles.iconWrapper}>
							<Icon name="cog" size={iconSize} color={colors.mainContrastLight}></Icon>
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
				navigation.current.navigate("Dashboard", { colors:colors, theme:theme });
				break;
			case "Market":
				animateLeft(25);
				navigation.current.navigate("Market", { colors:colors, theme:theme });
				break;
			case "Holdings":
				animateLeft(50);
				navigation.current.navigate("Holdings", { colors:colors, theme:theme });
				break;
			case "Settings":
				animateLeft(75);
				navigation.current.navigate("Settings", { colors:colors, theme:theme });
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