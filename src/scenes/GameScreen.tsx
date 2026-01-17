import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { GameEngine } from 'react-native-game-engine';

// === TRUCO PARA PANTALLA ===
const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

// === CONFIGURACIÓN ===
const CONFIG = {
  PLAYER_SIZE: 7,       // Tu tamaño actual (se ve lejos)
  PLAYER_SPEED: 6,
  PLAYER_COLOR: '#ff4444',
  SAFE_BOTTOM_MARGIN: 95, // <--- ¡NUEVO! Margen de seguridad inferior
};

// === TIPOS ===
interface PlayerBody {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
}

interface GameEntities {
  player: {
    body: PlayerBody;
    renderer: React.ComponentType<any>;
  };
}

// === RENDERER DEL JUGADOR ===
const PlayerRenderer = ({ body }: { body: PlayerBody }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: body.position.x,
        top: body.position.y,
        width: body.radius * 2,
        height: body.radius * 2,
        borderRadius: body.radius,
        backgroundColor: body.color,
        borderWidth: 1, // Bajé un poco el borde ya que el jugador es pequeño
        borderColor: '#fff',
        shadowColor: body.color,
        shadowOpacity: 0.8,
        elevation: 5,
      }}
    />
  );
};

// === FÍSICA ===
const PhysicsSystem = (entities: GameEntities, { time }: any) => {
  const player = entities.player.body;

  player.position.x += player.velocity.x;
  player.position.y += player.velocity.y;

  // === LÍMITES DE PANTALLA (Corregidos) ===
  
  // Izquierda
  if (player.position.x < 0) player.position.x = 0;
  
  // Derecha
  if (player.position.x > SCREEN_WIDTH - player.radius * 2) 
      player.position.x = SCREEN_WIDTH - player.radius * 2;
  
  // Arriba
  if (player.position.y < 0) player.position.y = 0;
  
  // Abajo (Aquí aplicamos el margen de seguridad)
  const floorLimit = SCREEN_HEIGHT - player.radius * 2 - CONFIG.SAFE_BOTTOM_MARGIN;
  if (player.position.y > floorLimit) 
      player.position.y = floorLimit;

  return entities;
};

// === COMPONENTE PRINCIPAL ===
export default function GameScreen() {
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef<GameEngine>(null);
  const velocityRef = useRef({ x: 0, y: 0 });

  // === SISTEMA DE INPUT ===
  const InputSystem = (entities: GameEntities) => {
    entities.player.body.velocity.x = velocityRef.current.x;
    entities.player.body.velocity.y = velocityRef.current.y;
    return entities;
  };

  // === ENTIDADES INICIALES ===
  const initialEntities: GameEntities = {
    player: {
      body: {
        position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
        velocity: { x: 0, y: 0 },
        radius: CONFIG.PLAYER_SIZE / 2,
        color: CONFIG.PLAYER_COLOR,
      },
      renderer: PlayerRenderer,
    },
  };

  // === LÓGICA DE BOTONES ===
  const startMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    switch (direction) {
      case 'up':
        velocityRef.current = { x: 0, y: -CONFIG.PLAYER_SPEED };
        break;
      case 'down':
        velocityRef.current = { x: 0, y: CONFIG.PLAYER_SPEED };
        break;
      case 'left':
        velocityRef.current = { x: -CONFIG.PLAYER_SPEED, y: 0 };
        break;
      case 'right':
        velocityRef.current = { x: CONFIG.PLAYER_SPEED, y: 0 };
        break;
    }
  };

  const stopMove = () => {
    velocityRef.current = { x: 0, y: 0 };
  };

  return (
    <View style={styles.container}>
      <GameEngine
        ref={gameEngineRef}
        style={styles.gameContainer}
        systems={[InputSystem, PhysicsSystem]} 
        entities={initialEntities}
        running={running}
      />

      <View style={styles.controlsArea}>
        {/* === CRUCETA DE BOTONES (D-PAD) === */}
        <View style={styles.dpadContainer}>
            
            {/* Botón ARRIBA */}
            <Pressable 
              style={({pressed}) => [styles.dpadBtn, styles.btnUp, pressed && styles.btnPressed]}
              onPressIn={() => startMove('up')}
              onPressOut={stopMove}
            >
              <Text style={styles.arrow}>▲</Text>
            </Pressable>

            {/* Botón ABAJO */}
            <Pressable 
              style={({pressed}) => [styles.dpadBtn, styles.btnDown, pressed && styles.btnPressed]}
              onPressIn={() => startMove('down')}
              onPressOut={stopMove}
            >
              <Text style={styles.arrow}>▼</Text>
            </Pressable>

            {/* Botón IZQUIERDA */}
            <Pressable 
              style={({pressed}) => [styles.dpadBtn, styles.btnLeft, pressed && styles.btnPressed]}
              onPressIn={() => startMove('left')}
              onPressOut={stopMove}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>

            {/* Botón DERECHA */}
            <Pressable 
              style={({pressed}) => [styles.dpadBtn, styles.btnRight, pressed && styles.btnPressed]}
              onPressIn={() => startMove('right')}
              onPressOut={stopMove}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>

            {/* Centro Decorativo */}
            <View style={styles.dpadCenter} />
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionButtons}>
          <View style={[styles.btn, styles.btnAttack]} />
          <View style={[styles.btn, styles.btnDash]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
  },
  controlsArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 50,
    paddingBottom: 30,
  },
  
  // === ESTILOS DE LA CRUCETA ===
  dpadContainer: {
    width: 150,
    height: 150,
    position: 'relative', 
  },
  dpadBtn: {
    position: 'absolute',
    backgroundColor: 'rgba(80, 80, 80, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  btnPressed: {
    backgroundColor: 'rgba(120, 120, 120, 0.9)',
  },
  
  // Posiciones
  btnUp: {
    top: 0, left: 50, width: 50, height: 50,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
  },
  btnDown: {
    bottom: 0, left: 50, width: 50, height: 50,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  btnLeft: {
    top: 50, left: 0, width: 50, height: 50,
    borderTopLeftRadius: 8, borderBottomLeftRadius: 8,
  },
  btnRight: {
    top: 50, right: 0, width: 50, height: 50,
    borderTopRightRadius: 8, borderBottomRightRadius: 8,
  },
  
  dpadCenter: {
    position: 'absolute', top: 50, left: 50, width: 50, height: 50,
    backgroundColor: 'rgba(60, 60, 60, 1)', zIndex: -1,
  },

  arrow: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20, fontWeight: 'bold',
  },

  // Botones de Acción
  actionButtons: {
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center',
  },
  btn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  btnAttack: { 
    backgroundColor: 'rgba(231, 76, 60, 0.3)', 
    marginBottom: 30, 
  },
  btnDash: { 
    backgroundColor: 'rgba(52, 152, 219, 0.3)', 
    marginTop: 10, 
  },
});