import React from "react";
import { StyleSheet } from "react-native";
import { globalStyles } from "./global";

export default function getStyle(globalColors) {
	return StyleSheet.create({
		bar: {
			position:"absolute",
			bottom:0,
			left:0,
			width:"100%",
			height:62,
			backgroundColor:globalColors.mainFirst,
			shadowColor:globalStyles.shadowColor,
			shadowOffset:globalStyles.shadowOffset,
			shadowOpacity:globalStyles.shadowOpacity,
			shadowRadius:globalStyles.shadowRadius,
			elevation:globalStyles.shadowElevation,
			borderTopWidth:2,
			borderTopColor:globalColors.mainThird
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
}