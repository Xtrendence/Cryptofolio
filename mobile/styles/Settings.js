import { StyleSheet, Dimensions } from "react-native";
import { globalColors, globalStyles } from "../styles/global";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default styles = StyleSheet.create({
	page: {
		height:screenHeight - 190,
		backgroundColor:globalColors["Light"].mainSecond
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	modalWrapper: {
		width:"100%",
		height:"100%",
		flex:1,
		justifyContent:"center",
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
	buttonDelete: {
		backgroundColor:"rgb(230,50,50)",
		width:"auto",
	},
	section: {
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].mainFirst,
		width:"100%",
		alignItems:"center",
		padding:20,
		marginBottom:20
	},
	sectionDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	container: {
		flexDirection:"row",
		flexWrap:"wrap",
		justifyContent:"center"
	},
	containerText: {
		fontSize:16,
		color:globalColors["Light"].mainContrast,
		fontFamily:globalStyles.fontFamily,
		marginRight:4,
		paddingTop:1,
	},
	containerTextDark: {
		color:globalColors["Dark"].mainContrast,
	},
	header: {
		fontSize:18,
		fontWeight:"bold",
		color:globalColors["Light"].mainContrast,
		fontFamily:globalStyles.fontFamily,
		marginBottom:20,
	},
	headerDark: {
		color:globalColors["Dark"].mainContrast
	},
	messageWrapper: {
		backgroundColor:"rgb(230,50,50)",
		borderRadius:globalStyles.borderRadius,
		width:200,
		padding:10,
		marginBottom:20,
	},
	message: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	button: {
		marginBottom:20,
		height:40,
		width:200,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].accentFirst
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	},
	sectionDescriptionWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].mainThird,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 120,
		alignItems:"center",
		padding:10,
		marginBottom:10,
	},
	sectionDescriptionWrapperDark: {
		backgroundColor:globalColors["Dark"].mainThird,
	},
	sectionDescription: {
		color:globalColors["Light"].mainContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	sectionDescriptionDark: {
		color:globalColors["Dark"].mainContrast
	},
	inlineButton: {
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		padding:10,
		margin:10,
		backgroundColor:globalColors["Light"].mainThird
	},
	inlineButtonDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	inlineButtonActive: {
		backgroundColor:globalColors["Light"].accentFirst
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
	input: {
		backgroundColor:globalColors["Light"].mainFirst,
		color:globalColors["Light"].mainContrast,
		paddingLeft:10,
		paddingRight:10,
		width:200,
		height:40,
		marginBottom:20,
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainThird,
		color:globalColors["Dark"].mainContrast
	},
});