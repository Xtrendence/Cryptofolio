import React from "react";
import { StyleSheet } from "react-native";
import { globalStyles } from "./global";

export default function getStyle(globalColors, screenWidth, screenHeight) {
	return StyleSheet.create({
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
}