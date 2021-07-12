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
		minHeight:screenHeight - 120,
		flex:1,
		justifyContent:"center",
		alignItems:"center",
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
		backgroundColor:globalColors["Light"].accentFirst,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 180,
		padding:10,
		marginTop:20,
	},
	modalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	calendar: {
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	inlineContainer: {
		flexDirection:"row",
		flexWrap:"wrap",
		justifyContent:"center",
		marginBottom:20,
		marginLeft:-14,
		width:screenWidth - 150,
	},
	inlineButton: {
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		padding:10,
		marginRight:10,
		marginLeft:10,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		backgroundColor:globalColors["Light"].mainFirst
	},
	inlineButtonDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	inlineButtonActive: {
		backgroundColor:globalColors["Light"].accentFirst
	},
	iconButton: {
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		backgroundColor:globalColors["Light"].mainFirst,
		height:48,
		width:48,
		justifyContent:"center",
		alignItems:"center",
		paddingBottom:2,
		borderRadius:globalStyles.borderRadius,
	},
	iconButtonDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	buttonText: {
		fontFamily:globalStyles.fontFamily,
		fontSize:16,
		fontWeight:"bold",
		paddingBottom:2,
		color:globalColors["Light"].mainContrastLight
	},
	buttonTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	buttonTextActive: {
		color:globalColors["Light"].accentContrast
	},
	coinList: {
		maxHeight:106,
		marginBottom:20,
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		backgroundColor:globalColors["Light"].mainFirst
	},
	coinListDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	input: {
		backgroundColor:globalColors["Light"].mainFirst,
		color:globalColors["Light"].mainContrast,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		paddingLeft:10,
		paddingRight:10,
		marginBottom:20,
		width:screenWidth - 176,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	buttonWrapper: {
		width:screenWidth - 180,
		flexDirection:"row"
	},
	button: {
		height:40,
		width:((screenWidth - 180) / 2) - 9,
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
	buttonConfirm: {
		marginLeft:20,
		backgroundColor:globalColors["Light"].accentFirst
	},
	buttonConfirmDark: {
		backgroundColor:globalColors["Dark"].accentFirst
	},
	buttonDelete: {
		backgroundColor:"rgb(230,50,50)",
		width:screenWidth - 176,
		marginBottom:20,
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
		height:screenHeight - 310,
		maxHeight:screenHeight - 310
	},
	tableWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	row: {
		flexDirection:"row",
		alignItems:"center",
		padding:12
	},
	rowEven: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowEvenDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	column: {
		width:"50%",
	},
	columnLeft: {
		alignItems:"flex-start"
	},
	columnRight: {
		alignItems:"flex-end"
	},
	loadingText: {
		marginLeft:20,
		marginTop:15
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
	cellText: {
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellDate: {
		marginBottom:10
	},
	cellAmount: {
		marginBottom:10
	},
	cellNotes: {
		maxWidth:120,
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
	},
	cardText: {
		width:screenWidth - 40,
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