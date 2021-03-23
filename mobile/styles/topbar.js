import React from "react";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import { globalStyles } from "./global";

export default function getStyle(globalColors) {
	return StyleSheet.create({
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
			textAlign:"center",
			color:globalColors.mainContrast
		}
	});
}