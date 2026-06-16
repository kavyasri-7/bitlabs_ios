import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

interface Props {
  onPress: () => void;
  loading?: boolean;
}

export const LmsCourseCard: React.FC<Props> = ({
  onPress,
  loading = false,
}) => {
  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.skeletonImageContainer}>
          <View style={styles.skeletonImage} />
        </View>

        <View style={styles.skeletonCardGradient}>
          <View style={styles.skeletonInnerCard}>
            <View style={styles.imagePlaceholder} />

            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonTextLine1} />
              <View style={styles.skeletonTextLine2} />
            </View>
          </View>

          <View style={styles.skeletonButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.imageContainer}
      >
        <Image
          source={require("../../assests/Images/backgrounds/Lmslogo.png")}
          style={styles.lmsImage}
          resizeMode="contain"
        />
      </View>

      <LinearGradient
        colors={["#FBBB5C", "#E66A0E"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        useAngle
        angle={225}
        style={styles.cardGradient}
      >
        <View style={styles.innerCard}>
          <View style={styles.imagePlaceholder} />

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Learn Grow Succeed -{" "}
              <Text style={styles.lmsCourses}>LMS Courses!</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "visible",
    position: "relative",
  },

  cardGradient: {
    width: "100%",
    borderRadius: 20,
    padding: 4,
    paddingTop: 30,
    minHeight: 28,
    marginTop: 30,
    overflow: "hidden",
  },

  innerCard: {
    backgroundColor: "transparent",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 0,
  },

  imageContainer: {
    position: "absolute",
    top: -10,
    left: 0,
    width: 120,
    height: 120,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  lmsImage: {
    width: 120,
    height: 120,
  },

  imagePlaceholder: {
    width: 75,
    height: 45,
  },

  textContainer: {
    flex: 1,
    paddingLeft: 24,
    paddingTop: 2,
  },

  title: {
    fontSize: hp("1.4%"),
    color: "#fff",
    fontFamily: "PlusJakartaSans-Medium",
  },

  lmsCourses: {
    fontSize: hp("1.6%"),
    color: "#7E3601",
    fontFamily: "PlusJakartaSans-Bold",
  },

  button: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 22,
    width: "90%",
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  buttonText: {
    textAlign: "center",
    color: "#000",
    fontSize: hp("1.5%"),
    fontFamily: "PlusJakartaSans-Medium",
  },

  skeletonImageContainer: {
    position: "absolute",
    top: -10,
    left: 0,
    width: 120,
    height: 120,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  skeletonImage: {
    width: 120,
    height: 120,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },

  skeletonCardGradient: {
    width: "100%",
    borderRadius: 20,
    padding: 4,
    paddingTop: 30,
    minHeight: 28,
    marginTop: 30,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },

  skeletonInnerCard: {
    backgroundColor: "transparent",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 0,
  },

  skeletonTextContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingTop: 2,
  },

  skeletonTextLine1: {
    width: "70%",
    height: hp("1.4%"),
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: hp("0.3%"),
  },

  skeletonTextLine2: {
    width: "50%",
    height: hp("1.4%"),
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },

  skeletonButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 22,
    width: "90%",
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 4,
    marginBottom: 4,
    height: hp("3%"),
  },
});