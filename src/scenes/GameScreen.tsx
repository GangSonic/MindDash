// src/scenes/GameScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Image } from 'react-native';
import { GameEngine } from 'react-native-game-engine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// === ENTIDADES DEL JUEGO ===
interface Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocityX: number;
  velocityY: number;
}

interface Entities {
  player: {
    body: Player;
    renderer: React.ComponentType<any>;
  };
}

// === RENDERER DEL JUGADOR ===
const FINN_SPRITE = require('../../assets/finn_walk.png');

// Dimensiones basadas en tus 1000x250
const FRAME_W = 62;  // Ancho de un solo Finn
const FRAME_H = 125; // Alto de un solo Finn

const PlayerRenderer = ({ body }: { body: Player }) => {
  const [frame, setFrame] = React.useState(0);
  const totalFrames = 10; // Ajusta según cuántos pasos tenga la fila de caminata

  React.useEffect(() => {
    // Solo animar si hay movimiento
    if (body.velocityX !== 0 || body.velocityY !== 0) {
      const timer = setInterval(() => {
        setFrame((f) => (f + 1) % totalFrames);
      }, 100); // 100ms es una velocidad estándar para caminar
      return () => clearInterval(timer);
    } else {
      setFrame(0); // Frame de estar quieto
    }
  }, [body.velocityX, body.velocityY]);

  return (
    <View
      style={{
        position: 'absolute',
        left: body.x - (FRAME_W / 2),
        top: body.y - (FRAME_H / 2),
        width: FRAME_W,
        height: FRAME_H,
        overflow: 'hidden', // Esto crea la "ventana" para ver solo un frame
      }}
    >
      <Image
        source={FINN_SPRITE}
        style={{
          width: 1000, // Ancho total original
          height: 250, // Alto total original
          position: 'absolute',
          // Movemos la imagen a la izquierda según el frame actual
          left: -frame * FRAME_W,
          // Si la fila de caminar es la de abajo, ponemos -125
          top: 0, 
          // Espejo: si va a la izquierda (negativo), volteamos la imagen
          transform: [{ scaleX: body.velocityX < 0 ? -1 : 1 }],
        }}
        resizeMode="stretch"
      />
    </View>
  );
};

// === SISTEMA DE FÍSICA ===
const Physics = (entities: Entities, { time }: any) => {
  const player = entities.player.body;
  
  // Actualizar posición
  player.x += player.velocityX;
  player.y += player.velocityY;
  
  // Límites de pantalla
  if (player.x < player.radius) player.x = player.radius;
  if (player.x > SCREEN_WIDTH - player.radius) player.x = SCREEN_WIDTH - player.radius;
  if (player.y < player.radius) player.y = player.radius;
  if (player.y > (SCREEN_HEIGHT * 0.8) - player.radius) player.y = (SCREEN_HEIGHT * 0.8) - player.radius;
  
  return entities;
};

// === COMPONENTE PRINCIPAL ===
export default function GameScreen() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef<GameEngine>(null);
  
  // Velocidad del jugador
  const velocity = useRef({ x: 0, y: 0 });
  const speed = 5;

  // === ENTIDADES INICIALES ===
  const entities: Entities = {
    player: {
      body: {
        x: 100,
        y: 100,
        radius: 30,
        color: 'transparent',
        velocityX: 0,
        velocityY: 0,
      },
      renderer: PlayerRenderer,
    },
  };

  // === SISTEMA DE ACTUALIZACIÓN ===
  const updateHandler = (entities: Entities) => {
    entities.player.body.velocityX = velocity.current.x;
    entities.player.body.velocityY = velocity.current.y;
    return entities;
  };

  // === D-PAD HANDLER ===
  const dpadResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const dx = gestureState.dx;
      const dy = gestureState.dy;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        velocity.current.x = dx > 0 ? speed : -speed;
        velocity.current.y = 0;
      } else {
        velocity.current.y = dy > 0 ? speed : -speed;
        velocity.current.x = 0;
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const dx = gestureState.dx;
      const dy = gestureState.dy;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        velocity.current.x = dx > 0 ? speed : -speed;
        velocity.current.y = 0;
      } else {
        velocity.current.y = dy > 0 ? speed : -speed;
        velocity.current.x = 0;
      }
    },
    onPanResponderRelease: () => {
      velocity.current = { x: 0, y: 0 };
    },
  });

  return (
    <View style={styles.container}>
      {/* GAME ENGINE */}
      <GameEngine
        ref={gameEngineRef}
        style={styles.gameContainer}
        systems={[Physics, updateHandler]}
        entities={entities}
        running={running}
      />

      {/* CONTROLES */}
      <View style={styles.controls}>
        {/* D-PAD */}
        <View
          {...dpadResponder.panHandlers}
          style={styles.dpad}
        />

        {/* BOTONES */}
        <View style={styles.buttons}>
          <View style={[styles.button, styles.attackButton]} />
          <View style={[styles.button, styles.dashButton]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dpad: {
    width: 100,
    height: 100,
    backgroundColor: '#444444',
    borderRadius: 10,
  },
  buttons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  attackButton: {
    backgroundColor: '#ff4444',
  },
  dashButton: {
    backgroundColor: '#4444ff',
  },
});