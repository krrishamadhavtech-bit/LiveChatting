import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { Dimensions, Platform } from "react-native";

// Function to convert width pixels to percentage
const wpx = (pixels: number) => wp((pixels / 375) * 100); // Assuming 375 is the base width

// Function to convert height pixels to percentage
const hpx = (pixels: number) => hp((pixels / 812) * 100); // Assuming 812 is the base height

const getFontSize = (size: number) => {
  return RFValue(size, 780); // This uses a reference scale
  // return size;
};

const fontFamily = {
  bold: Platform.OS === "android" ? "InterBold" : "Inter-Bold",
  extra_bold: Platform.OS === "android" ? "InterExtraBold" : "Inter-ExtraBold",
  semi_bold:
    Platform.OS === "android" ? "InterSemiBold" : "Inter-SemiBold",
  medium: Platform.OS === "android" ? "InterMedium" : "Inter-Medium",
  regular: Platform.OS === "android" ? "InterRegular" : "Inter-Regular",
  inter_Light: Platform.OS === "android" ? "InterLight" : "Inter-Light",
};

export { wpx, hpx, getFontSize, fontFamily, wp, hp };

export const Full_Height = Dimensions.get("window").height;
export const Full_Width = Dimensions.get("window").width;
