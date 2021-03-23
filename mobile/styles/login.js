import React from "react";
import { StyleSheet } from "react-native";
import { globalStyles } from "./global";

export default function getStyle(globalColors) {
	return StyleSheet.create({
		container: {
			flex:1,
			alignItems:"center",
			justifyContent:"center",
			backgroundColor:globalColors.mainSecond
		},
		input: {
			backgroundColor:globalColors.mainFirst,
			paddingLeft:10,
			paddingRight:10,
			width:180,
			height:40,
			marginBottom:20,
			borderRadius:globalStyles.borderRadius,
			backgroundColor:globalColors.mainFirst,
			shadowColor:globalStyles.shadowColor,
			shadowOffset:globalStyles.shadowOffset,
			shadowOpacity:globalStyles.shadowOpacity,
			shadowRadius:globalStyles.shadowRadius,
			elevation:globalStyles.shadowElevation,
			color:globalColors.mainContrast,
		},
		button: {
			height:40,
			width:100,
			alignItems:"center",
			justifyContent:"center",
			borderRadius:globalStyles.borderRadius
		},
		text: {
			lineHeight:38,
			fontFamily:globalStyles.fontFamily,
			fontSize:18,
			paddingBottom:2,
			color:globalColors.accentContrast
		}
	});
}