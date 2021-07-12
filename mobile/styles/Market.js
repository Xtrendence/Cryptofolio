import { StyleSheet, Dimensions } from "react-native";
import { globalColors, globalStyles } from "../styles/global";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default styles = StyleSheet.create({
	page: {
		height:screenHeight - 190,
		backgroundColor:globalColors["Light"].mainSecond,
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	modalScroll: {
		backgroundColor:globalColors["Light"].mainThird
	},
	modalScrollDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	modalWrapper: {
		width:"100%",
		height:"100%",
		flex:1,
		justifyContent:"flex-start",
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainThird
	},
	modalWrapperDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	modal: {
		width:300,
		height:300,
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainFirst
	},
	modalDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	modalMessageWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].accentFirst,
		borderRadius:globalStyles.borderRadius,
		width:200,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	modalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	modalDescriptionWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].mainFirst,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 40,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	modalDescriptionWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
	},
	modalDescription: {
		color:globalColors["Light"].mainContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	modalDescriptionDark: {
		color:globalColors["Dark"].mainContrast
	},
	chartWrapper: {
		height:320,
		paddingTop:30,
		width:"100%",
		backgroundColor:globalColors["Light"].mainFirst
	},
	chartWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	buttonWrapper: {
		width:screenWidth - 40,
		marginTop:20,
		alignSelf:"center",
		flexDirection:"row",
		justifyContent:"center",
		alignItems:"center"
	},
	button: {
		height:40,
		width:120,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].mainContrast
	},
	buttonDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	},
	tableWrapper: {
		backgroundColor:globalColors["Light"].mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		maxHeight:screenHeight - 390,
		height:screenHeight - 390,
	},
	tableWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	row: {
		flexDirection:"row",
		alignItems:"center",
		paddingLeft:4,
		paddingTop:8,
		paddingBottom:8,
	},
	rowHighlightRowPositiveLight: {
		backgroundColor:"rgba(0,255,150,0.1)"
	},
	rowHighlightRowNegativeLight: {
		backgroundColor:"rgba(255,0,0,0.1)"
	},
	rowHighlightRowPositiveDark: {
		backgroundColor:"rgba(0,255,150,0.1)"
	},
	rowHighlightRowNegativeDark: {
		backgroundColor:"rgba(255,0,0,0.15)"
	},
	cellHighlightTextPositiveLight: {
		color:"rgb(40,150,70)"
	},
	cellHighlightTextNegativeLight: {
		color:"rgb(210,40,40)"
	},
	cellHighlightTextPositiveDark: {
		color:"rgb(20,180,120)"
	},
	cellHighlightTextNegativeDark: {
		color:"rgb(210,50,50)"
	},
	rowOdd: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowOddDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	loadingText: {
		marginLeft:20,
		marginTop:5,
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
		width:50,
		paddingLeft:20,
	},
	headerCoin: {
		width:100,
		marginLeft:15,
	},
	headerPrice: {
		width:100,
	},
	cellText: {
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellRank: {
		width:50,
		paddingLeft:20
	},
	cellSymbol: {
		width:74
	},
	cellPrice: {
		width:100
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