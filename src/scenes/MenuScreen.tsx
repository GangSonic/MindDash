// src/scenes/MenuScreen.tsx
import React from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

function PixelButton({
  text,
  onPress,
  imageName,
}: {
  text: string;
  onPress: () => void;
  imageName: string;
}) {
  // Mapeo de nombres a imágenes
  const buttonImages: { [key: string]: any } = {
    play: require("../../assets/ui/button_play.png"),
    options: require("../../assets/ui/button_options.png"),
    credits: require("../../assets/ui/button_credits.png"),
    exit: require("../../assets/ui/button_exit.png"),
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonWrapper,
        pressed && styles.buttonPressed,
      ]}
    >
      {({ pressed }) => (
        <>
          {/* CAPA 1: Imagen de fondo del botón */}
          <Image
            source={buttonImages[imageName]}
            style={styles.buttonBackgroundImage}
            resizeMode="stretch"
          />

          {/* CAPA 2: Marco decorativo (opcional) */}
          <View
            style={[styles.buttonFrame, pressed && styles.buttonFramePressed]}
          >
            {/* CAPA 3: Texto del botón */}
            <Text
              style={[styles.buttonText, pressed && styles.buttonTextPressed]}
            >
              {text}
            </Text>
          </View>

          {/* CAPA 4: Efecto de brillo al presionar */}
          {pressed && <View style={styles.buttonShine} />}
        </>
      )}
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
        <PixelButton
          text=""
          imageName="play"
          onPress={() => navigation.navigate("Game")}
        />
        <PixelButton text="" imageName="options" onPress={() => {}} />
        <PixelButton text="" imageName="credits" onPress={() => {}} />
        <PixelButton text="" imageName="exit" onPress={() => {}} />
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
    gap: 20, // Aumentado un poco
    paddingHorizontal: 40,
    marginTop: 80,
  },

  // 🌟 NUEVO: Contenedor del botón
  buttonWrapper: {
    width: "20%",
    height: 55, // Define una altura fija
    position: "relative",
    // Sombra exterior
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },

  // 🌟 NUEVO: Imagen de fondo del botón
  buttonBackgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // Sombra de la imagen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },

  // 🌟 MODIFICADO: Marco decorativo (ahora transparente)
  buttonFrame: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    // Si quieres un borde adicional sobre la imagen:
    // borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // 🌟 NUEVO: Estado presionado del marco
  buttonFramePressed: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },

  // 🌟 MODIFICADO: Estado presionado del botón
  buttonPressed: {
    transform: [{ scale: 0.96 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
    opacity: 0.9,
  },

  // Texto del botón
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    letterSpacing: 3,
    fontWeight: "bold",
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  // 🌟 NUEVO: Texto presionado
  buttonTextPressed: {
    opacity: 0.8,
  },

  // 🌟 NUEVO: Efecto de brillo al presionar
  buttonShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
  },

  // 🌟 ELIMINADOS (ya no los necesitas):
  // button
  // innerBorder
});
