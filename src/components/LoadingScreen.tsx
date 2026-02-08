import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current; // ← CAMBIADO
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de barra de progreso (ahora loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false, // ← FALSE porque anima width
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Animación de pulso
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const dotOpacity = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.container}>
      {/* Fondo del mapa */}
      <Image
        source={require('../../assets/loading/loading-mind.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Overlay oscuro */}
      <View style={styles.overlay} />

      {/* Contenido animado */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Título del juego */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleMind}>MIND</Text>
          <Text style={styles.titleDash}>DASH</Text>
        </View>

        {/* Texto de loading */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.loadingTextContainer}>
            <Text style={styles.loadingText}>LOADING</Text>
            <Animated.Text style={[styles.loadingDots, { opacity: dotOpacity }]}>
              ...
            </Animated.Text>
          </View>
        </Animated.View>

        {/* Barra de progreso CORREGIDA */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth, // ← Ahora funciona correctamente
              },
            ]}
          />
        </View>

        {/* Tip */}
        <Text style={styles.tipText}>
          🎮 Tip: Usa el dash para esquivar enemigos
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d5016',
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  titleMind: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#FF8C00',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 8,
  },
  titleDash: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00CED1',
    textShadowColor: '#0080FF',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 8,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 4,
  },
  loadingDots: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  progressBarContainer: {
    width: 300,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 3,
  },
  tipText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 40,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});