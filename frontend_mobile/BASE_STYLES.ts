import { StyleSheet } from "react-native";

export const getStyles = (colors: any) => StyleSheet.create({
    miniText: { 
        fontWeight: '300', 
        fontSize: 10, 
        color: colors.text 
    },
    baseText: {
        fontWeight: '500', 
        fontSize: 14, 
        color: colors.text
    },
    container: {
        backgroundColor: colors.background,
        flex: 1
    }
});