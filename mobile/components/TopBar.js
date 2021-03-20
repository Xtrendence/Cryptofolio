import Constants from "expo-constants";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";

let globalColors = globalColorsLight;

export default function TopBar(props) {
	return (
		<View style={styles.bar}>
			<Text style={styles.header}>{props.title}</Text>
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
		backgroundColor:globalColors.mainFirst,
		backgroundColor:globalColors.mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	header: {
		fontFamily:globalStyles.fontFamily,
		fontSize:20,
		fontWeight:"bold",
		width:"100%",
		textAlign:"center"
	}
});