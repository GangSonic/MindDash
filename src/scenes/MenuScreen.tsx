// src/scenes/MenuScreen.tsx
import React from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

function PixelButton({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <View style={styles.innerBorder}>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </Pressable>
  );
}

export default function MenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* FONDO */}
      <Image
        source={require("../../assets/menu.png")}
        style={styles.background}
        resizeMode="stretch"
      />

      {/* MENÚ */}
      <View style={styles.menuContainer}>
        <PixelButton text="PLAY" onPress={() => navigation.navigate("Game")} />
        <PixelButton text="OPTIONS" onPress={() => {}} />
        <PixelButton text="CREDITS" onPress={() => {}} />
        <PixelButton text="EXIT" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 40,
    marginTop: 80,
  },

  button: {
    width: "20%",
    backgroundColor: "#cf616194",
    borderWidth: 4,
    borderColor: "#3d0c64",

    // sombra pixel
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },

  innerBorder: {
    borderWidth: 2,
    borderColor: "#5f1212",
    paddingVertical: 8,
    alignItems: "center",
  },

  buttonPressed: {
    transform: [{ translateY: 3 }],
    shadowOffset: { width: 1, height: 1 },
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    letterSpacing: 3,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
