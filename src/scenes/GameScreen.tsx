import React, { useState, useRef } from 'react';
// 1. Agregamos 'Image' a los imports
import { View, StyleSheet, Dimensions, Text, Pressable, Image } from 'react-native';
import { GameEngine } from 'react-native-game-engine';

// === TRUCO PARA PANTALLA ===
const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

// === CONFIGURACIÓN ===
const CONFIG = {
  PLAYER_SIZE: 12,       // Ajustado un poco para que se vea bien en el mapa
  PLAYER_SPEED: 3,
  PLAYER_COLOR: '#ff4444',
  SAFE_BOTTOM_MARGIN: 0, 
};

// Matriz de 20x13 basada en tamaño de imagen de fondo (800x533)
const MAP_LOGIC = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 0 (Muro superior)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 1
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1], // Fila 2
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1], // Fila 3
  [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1], // Fila 4
  [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1], // Fila 5
  [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1], // Fila 6 (Entrada Izquierda/Derecha)
  [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1], // Fila 7
  [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1], // Fila 8
  [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // Fila 9
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1], // Fila 10
  
  [1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1], // Fila 11
  [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1], // Fila 12
  [1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], 
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 19 (Muro inferior)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 20
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Fila 21
];

// === TIPOS ===
interface PlayerBody {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
}

interface GameEntities {
  // 2. Agregamos el mapa a las entidades
  map: { renderer: React.ComponentType<any> };
  player: {
    body: PlayerBody;
    renderer: React.ComponentType<any>;
  };
}

// === 3. RENDERER DEL MAPA (IMAGEN) ===
const MapRenderer = () => {
  return (
    <Image
      // Asegúrate de que el nombre coincida con tu archivo en 'assets'
      source={require('../../assets/mapa_bosque.png')} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,   // Estira la imagen al ancho de la pantalla
        height: SCREEN_HEIGHT, // Estira la imagen al alto de la pantalla
        resizeMode: 'stretch', // 'stretch' ajusta, 'cover' recorta si es necesario
        zIndex: -1, // Se asegura de estar DETRÁS del jugador
      }}
    />
  );
};

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
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: body.color,
        shadowOpacity: 0.8,
        elevation: 5,
      }}
    />
  );
};

// === FÍSICA ===
const PhysicsSystem = (entities: GameEntities, { time }:{time:any}) => {
  const player = entities.player.body;
  
  // Si no hay velocidad, no calculamos nada
  if (player.velocity.x === 0 && player.velocity.y === 0) return entities;

  // Calculamos la posición futura
  const nextX = player.position.x + player.velocity.x;
  const nextY = player.position.y + player.velocity.y;

  // Convertimos los píxeles actuales a coordenadas de nuestra matriz de 20x13
  // Dividimos el ancho total entre 20 columnas y el alto total entre 13 filas
  const cellWidth = SCREEN_WIDTH / 32;
  const cellHeight = SCREEN_HEIGHT / 21;

  const checkX = player.velocity.x > 0 ? nextX + player.radius * 2 : nextX;
  const checkY = player.velocity.y > 0 ? nextY + player.radius * 2 : nextY;

  const gridX = Math.floor(checkX / cellWidth);
  const gridY = Math.floor(checkY / cellHeight);

  
  // Verificamos colisión
  if (
    gridY >= 0 && gridY < MAP_LOGIC.length &&
    gridX >= 0 && gridX < MAP_LOGIC[0].length
  ) {
    if (MAP_LOGIC[gridY][gridX] === 0) {
      // Si es camino (0), permitimos el movimiento
      player.position.x = nextX;
      player.position.y = nextY;
    } else {
      // Si es muro (1), detenemos la velocidad
      player.velocity = { x: 0, y: 0 };
    }
  }

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
    // 4. Cargamos el mapa primero (Fondo)
    map: {
        renderer: MapRenderer,
    },
    // Cargamos al jugador después (Capa superior)
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
      case 'up': velocityRef.current = { x: 0, y: -CONFIG.PLAYER_SPEED }; break;
      case 'down': velocityRef.current = { x: 0, y: CONFIG.PLAYER_SPEED }; break;
      case 'left': velocityRef.current = { x: -CONFIG.PLAYER_SPEED, y: 0 }; break;
      case 'right': velocityRef.current = { x: CONFIG.PLAYER_SPEED, y: 0 }; break;
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
        {/* CRUCETA (D-PAD) */}
        <View style={styles.dpadContainer}>
            <Pressable style={({pressed}) => [styles.dpadBtn, styles.btnUp, pressed && styles.btnPressed]} onPressIn={() => startMove('up')} onPressOut={stopMove}><Text style={styles.arrow}>▲</Text></Pressable>
            <Pressable style={({pressed}) => [styles.dpadBtn, styles.btnDown, pressed && styles.btnPressed]} onPressIn={() => startMove('down')} onPressOut={stopMove}><Text style={styles.arrow}>▼</Text></Pressable>
            <Pressable style={({pressed}) => [styles.dpadBtn, styles.btnLeft, pressed && styles.btnPressed]} onPressIn={() => startMove('left')} onPressOut={stopMove}><Text style={styles.arrow}>◀</Text></Pressable>
            <Pressable style={({pressed}) => [styles.dpadBtn, styles.btnRight, pressed && styles.btnPressed]} onPressIn={() => startMove('right')} onPressOut={stopMove}><Text style={styles.arrow}>▶</Text></Pressable>
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
    backgroundColor: '#000', // Fondo negro por si la imagen no carga
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
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
  dpadContainer: { width: 150, height: 150, position: 'relative' },
  dpadBtn: { position: 'absolute', backgroundColor: 'rgba(80, 80, 80, 0.6)', justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnPressed: { backgroundColor: 'rgba(120, 120, 120, 0.9)' },
  btnUp: { top: 0, left: 50, width: 50, height: 50, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  btnDown: { bottom: 0, left: 50, width: 50, height: 50, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  btnLeft: { top: 50, left: 0, width: 50, height: 50, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  btnRight: { top: 50, right: 0, width: 50, height: 50, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  dpadCenter: { position: 'absolute', top: 50, left: 50, width: 50, height: 50, backgroundColor: 'rgba(60, 60, 60, 1)', zIndex: -1 },
  arrow: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 20, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 25, alignItems: 'center' },
  btn: { width: 75, height: 75, borderRadius: 37.5, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)' },
  btnAttack: { backgroundColor: 'rgba(231, 76, 60, 0.3)', marginBottom: 30 },
  btnDash: { backgroundColor: 'rgba(52, 152, 219, 0.3)', marginTop: 10 },
});