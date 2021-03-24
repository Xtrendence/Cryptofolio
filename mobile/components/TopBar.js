import Constants from "expo-constants";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";

export default function TopBar(props) {
	const { theme } = React.useContext(ThemeContext);

	return (
		<View style={[styles.bar, styles[`bar${theme}`]]}>
			<Text style={[styles.header, styles[`header${theme}`]]}>{props.title}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	bar: {
		justifyContent:"center",
		height:70,
		paddingBottom:10,
		paddingTop:Constants.statusBarHeight,
		width:"100%",
		backgroundColor:globalColors["Light"].mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	barDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	header: {
		fontFamily:globalStyles.fontFamily,
		fontSize:20,
		fontWeight:"bold",
		width:"100%",
		textAlign:"center",
		color:globalColors["Light"].mainContrast
	},
	headerDark: {
		color:globalColors["Dark"].mainContrast
	}
});