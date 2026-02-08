// src/scenes/MenuScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet, Image, Text, Pressable, BackHandler, Alert, Platform} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from 'expo-av';

async function playClickSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audio/click.mp3")
    );
    await sound.playAsync();
  } catch (error) {
    console.log("Error cargando sonido", error);
  }
}

function PixelButton({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        playClickSound(); // <--- ¡Sonido primero!
        onPress();        // <--- Luego la acción original
      }}
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
  const [showCredits, setShowCredits] = useState(false); 
  // === FUNCIÓN PARA SALIR ===
  const handleExit = () => {
    Alert.alert(
      "Salir del Juego",
      "¿Seguro que quieres salir?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sí, salir", 
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp(); 
            } else {
              // En iOS no se permite cerrar la app programáticamente
              Alert.alert("Aviso", "En iPhone debes usar el botón de inicio para salir.");
            }
          } 
        }
      ]
    );
  };
  return (
    <View style={styles.container}>
      {/* 1. FONDO */}
      <Image
        source={require("../../assets/menu.png")}
        style={styles.background}
        resizeMode="stretch"
      />

      {/* 2. MENÚ PRINCIPAL */}
      <View style={styles.menuContainer}>
        <PixelButton text="PLAY" onPress={() => navigation.navigate("Game")} />
        <PixelButton text="OPTIONS" onPress={() => {}} />
        <PixelButton text="CREDITS" onPress={() => setShowCredits(true)} />       
        <PixelButton text="EXIT" onPress={handleExit} />
      </View>

      {/* 3. Mostrar creditos */}
      {showCredits && (
        <View style={styles.customOverlay}>
          {/* Fondo oscuro transparente */}
          <View style={styles.darkBackdrop} />

          {/* Contenedor del contenido */}
          <View style={styles.popupContent}>
            
            <Image
              source={require("../../assets/creditos.png")} 
              style={styles.creditsImage}
              resizeMode="contain"
            />
            
            {/* Botón de cerrar */}
            <PixelButton 
              text="CERRAR" 
              onPress={() => setShowCredits(false)} 
            />
          </View>
        </View>
      )}

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


  customOverlay: {
    position: "absolute", 
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100, 
  },
  darkBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  popupContent: {
    width: "85%",
    height: "70%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 101, 
  },
  creditsImage: {
    width: "100%",
    height: "80%",
    marginBottom: 20,
  },
});