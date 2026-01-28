import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Pressable,
  Image,
} from "react-native";
import { GameEngine } from "react-native-game-engine";

// === TRUCO PARA PANTALLA ===
const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

// === CONFIGURACIÓN ===
const CONFIG = {
  PLAYER_SIZE: 12,
  PLAYER_SPEED: 1,
  PLAYER_COLOR: "#ff4444",
  
  // --- CONFIGURACIÓN DEL DASH ---
  DASH_SPEED: 3,         // Velocidad del impulso (3x más rápido)
  DASH_DURATION: 200,    // Duración en milisegundos
  DASH_COOLDOWN: 5000,   // Tiempo de espera (1 segundo)
  
  ANIMATION_SPEED: 70,
};

// === CARGA DE IMÁGENES ===
const SPRITES = {
  idle: [require("../../assets/player/idle_1.png")],
  run: [
    require("../../assets/player/walk_1.png"),
    require("../../assets/player/walk_2.png"),
    require("../../assets/player/walk_3.png"),
    require("../../assets/player/walk_4.png"),
    // require("../../assets/player/walk_5.png"), // Descomenta si tienes este archivo
    require("../../assets/player/walk_6_dash.png"),
  ],
  // Nueva categoría exclusiva para el Dash
  dash: [require("../../assets/player/walk_6_dash.png")],
};

// === MATRIZ DEL MAPA ===
const MAP_LOGIC = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// === TIPOS ===
interface PlayerBody {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
  // Variables para la lógica del juego y animación
  animation: {
    state: "idle" | "run" | "dash"; 
    direction: "left" | "right";
    frameIndex: number;
    timer: number;
  };
  // Variables para el Dash
  dash: {
    isDashing: boolean;
    timeLeft: number;
    cooldown: number;
    facing: { x: number; y: number }; // Hacia dónde miramos para impulsarnos
    requested: boolean; // Si se presionó el botón
  };
  health: number;
}

interface GameEntities {
  map: { renderer: React.ComponentType<any> };
  player: {
    body: PlayerBody;
    renderer: React.ComponentType<any>;
  };
  enemy: {
    body: any; 
    renderer: React.ComponentType<any>;
  }
}

// === RENDERER DEL MAPA ===
const MapRenderer = () => {
  return (
    <Image
      source={require("../../assets/mapa_bosque.png")}
      style={{
        position: "absolute", top: 0, left: 0,
        width: SCREEN_WIDTH, height: SCREEN_HEIGHT,
        resizeMode: "stretch", zIndex: -1,
      }}
    />
  );
};

// === RENDERER DEL JUGADOR ===
const PlayerRenderer = ({ body }: { body: PlayerBody }) => {
  const { state, direction, frameIndex } = body.animation;
  
  // Elegimos la lista de imágenes según el estado
  let currentSpriteList = SPRITES.idle;
  if (state === "run") currentSpriteList = SPRITES.run;
  if (state === "dash") currentSpriteList = SPRITES.dash;
  
  const safeIndex = frameIndex % currentSpriteList.length;
  const imageToDraw = currentSpriteList[safeIndex];

  return (
    <Image
      source={imageToDraw}
      style={{
        position: "absolute",
        left: body.position.x,
        top: body.position.y,
        width: body.radius * 7,
        height: body.radius * 7,
        resizeMode: "contain",
        transform: [{ scaleX: direction === "left" ? -1 : 1 }],
      }}
    />
  );
};

// === COMPONENTE DE VIDAS ===
const HealthBar = ({ health }: { health: number }) => {
  // Cada corazón representa 20 de vida (5 corazones = 100 HP)
  const numHearts = 5;
  const hearts = [];

  for (let i = 0; i < numHearts; i++) {
    const heartValue = (i + 1) * 20;
    // Lógica simple: si la vida es mayor al valor del corazón, está lleno
    const isFull = health >= heartValue;
    const isEmpty = health <= heartValue - 20;

    hearts.push(
      <View key={i} style={styles.heartWrapper}>
        <Image
          source={require("../../assets/life/heart_pixel.png")} 
          style={[
            styles.heartImage,
            isEmpty && { opacity: 0.3, tintColor: 'gray' }, // Se ve vacío/gris
            !isFull && !isEmpty && { tintColor: '#ff8888' } // "Medio" lleno (opcional)
          ]}
        />
      </View>
    );
  }

  return <View style={styles.healthContainer}>{hearts}</View>;
};

// === FÍSICA Y ANIMACIÓN (EL CEREBRO) ===
const PhysicsSystem = (entities: GameEntities, { time }: { time: any }) => {
  const player = entities.player.body;
 
  // --- 1. GESTIÓN DEL DASH ---
  
  // Actualizar cooldown (enfriamiento)
  if (player.dash.cooldown > 0) {
    player.dash.cooldown -= time.delta;
  }

  // Detectar hacia dónde mira el jugador (para saber a dónde hacer el dash)
  if (player.velocity.x !== 0 || player.velocity.y !== 0) {
    // Normalizamos la dirección (1, 0, -1)
    player.dash.facing = { 
      x: Math.sign(player.velocity.x), 
      y: Math.sign(player.velocity.y) 
    };
  }

  // Activar Dash si se pidió y hay cooldown disponible
  if (player.dash.requested && player.dash.cooldown <= 0) {
    player.dash.isDashing = true;
    player.dash.timeLeft = CONFIG.DASH_DURATION;
    player.dash.cooldown = CONFIG.DASH_COOLDOWN; // Reiniciar cooldown
    player.animation.state = "dash"; // Forzar animación
  }
  player.dash.requested = false; // Limpiar petición

  // Calcular velocidad real
  let finalVelocity = { x: player.velocity.x, y: player.velocity.y };

  if (player.dash.isDashing) {
    // Si está en Dash, ignoramos el control y usamos la velocidad turbo
    player.dash.timeLeft -= time.delta;
    
    if (player.dash.timeLeft <= 0) {
      player.dash.isDashing = false; // Se acabó el dash
    } else {
      // Aplicar velocidad turbo
      // Si estaba quieto, hacemos dash a la derecha por defecto
      const dirX = player.dash.facing.x === 0 && player.dash.facing.y === 0 ? 1 : player.dash.facing.x;
      const dirY = player.dash.facing.y;
      
      finalVelocity = {
        x: dirX * CONFIG.DASH_SPEED,
        y: dirY * CONFIG.DASH_SPEED
      };
      player.animation.state = "dash";
    }
  }

  // --- 2. MOVIMIENTO Y COLISIONES ---
  const nextX = player.position.x + finalVelocity.x;
  const nextY = player.position.y + finalVelocity.y;
  
  const cellWidth = SCREEN_WIDTH / 32;
  const cellHeight = SCREEN_HEIGHT / 21;
  const checkX = finalVelocity.x > 0 ? nextX + player.radius * 2 : nextX;
  const checkY = finalVelocity.y > 0 ? nextY + player.radius * 2 : nextY;
  const gridX = Math.floor(checkX / cellWidth);
  const gridY = Math.floor(checkY / cellHeight);

  // Aplicar movimiento si no hay pared
  if (finalVelocity.x !== 0 || finalVelocity.y !== 0) {
    if (
      gridY >= 0 && gridY < MAP_LOGIC.length &&
      gridX >= 0 && gridX < MAP_LOGIC[0].length &&
      MAP_LOGIC[gridY][gridX] === 0
    ) {
      player.position.x = nextX;
      player.position.y = nextY;
    } else {
      // Si choca durante un dash, detener el dash inmediatamente
      if (player.dash.isDashing) {
        player.dash.isDashing = false;
      }
    }
  }

  // --- 3. ANIMACIÓN ---
  const isMoving = finalVelocity.x !== 0 || finalVelocity.y !== 0;

  if (!player.dash.isDashing) {
    if (isMoving) {
      player.animation.state = "run";
      if (finalVelocity.x > 0) player.animation.direction = "right";
      if (finalVelocity.x < 0) player.animation.direction = "left";
    } else {
      player.animation.state = "idle";
    }
  }

  // Timer de frames
  player.animation.timer += time.delta;
  if (player.animation.timer >= CONFIG.ANIMATION_SPEED) {
    player.animation.timer = 0;
    player.animation.frameIndex++;
  }

  //== Fisica del enemigo == 

  if (!entities.enemy || !entities.enemy.body) {
    return entities;
  }
  const enemy = entities.enemy.body;
  const speed = enemy.speed || 0.6; 

  const dx = player.position.x - enemy.position.x;
  const dy = player.position.y - enemy.position.y;
  const distance = Math.hypot(dx, dy);

  // Solo movemos si no estamos "encima" del jugador
  if (distance > 12) {
    const angle = Math.atan2(dy, dx);
    
    // Calculamos la siguiente posición potencial
    const nextX = enemy.position.x + Math.cos(angle) * speed;
    const nextY = enemy.position.y + Math.sin(angle) * speed;

    // Colision usando el punto Central del enemigo 
    const gridX = Math.floor((nextX + enemy.radius) / cellWidth);
    const gridY = Math.floor((nextY + enemy.radius) / cellHeight);

    // Verificamos si la celda es camino (0)
    if (MAP_LOGIC[gridY] && MAP_LOGIC[gridY][gridX] === 0) {
      enemy.position.x = nextX;
      enemy.position.y = nextY;
    } else {
      // Si hay colisión, el enemigo no se mueve// Si se bloquea, intentamos mover solo en X o solo en Y (deslizamiento)
    const canMoveX = MAP_LOGIC[Math.floor((enemy.position.y + enemy.radius)/cellHeight)][Math.floor((nextX + enemy.radius)/cellWidth)] === 0;
    const canMoveY = MAP_LOGIC[Math.floor((nextY + enemy.radius)/cellHeight)][Math.floor((enemy.position.x + enemy.radius)/cellWidth)] === 0;
    
      if (canMoveX) enemy.position.x = nextX;
      else if (canMoveY) enemy.position.y = nextY;
    }  
  }
    if (distance < 18) { 
    player.health -= 0.3; // Daño por contacto real
    if (player.health < 0) player.health = 0;
    //console.log("personaje herido! HP:", Math.round(player.health));
  }

  return entities;
};

// === PANTALLA PRINCIPAL ===
export default function GameScreen() {
  const [playerHP, setPlayerHP] = useState(100);
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef<GameEngine>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const dashSignalRef = useRef(false); // Para comunicar el botón con el juego

  const InputSystem = (entities: GameEntities) => {
    // Pasar input de movimiento
    entities.player.body.velocity.x = velocityRef.current.x;
    entities.player.body.velocity.y = velocityRef.current.y;
    
    // Pasar input de Dash
    if (dashSignalRef.current) {
      entities.player.body.dash.requested = true;
      dashSignalRef.current = false; // Resetear señal
    }

    //logica vida (corazones) 
    if (entities.player.body.health !== playerHP) {
    setPlayerHP(entities.player.body.health);
  }
    
    return entities;
  };

  const initialEntities: GameEntities = {
    map: { renderer: MapRenderer },
    player: {
      body: {
        position: { x: 1 * (SCREEN_WIDTH / 32), y: 10 * (SCREEN_HEIGHT / 21) },
        velocity: { x: 0, y: 0 },
        radius: CONFIG.PLAYER_SIZE / 2,
        color: CONFIG.PLAYER_COLOR,
        animation: {
          state: "idle",
          direction: "right",
          frameIndex: 0,
          timer: 0,
        },
        // Estado inicial del Dash
        dash: {
          isDashing: false,
          timeLeft: 0,
          cooldown: 0,
          facing: { x: 1, y: 0 }, // Empieza mirando a la derecha
          requested: false,
        },
        health: 100,
        
      },
      renderer: PlayerRenderer,
    },
    //enemigo 
    enemy: {
      body: {
        position: { x: 15* (SCREEN_WIDTH / 32), y: 9 * (SCREEN_HEIGHT / 21) },
        velocity: { x: 0, y: 0 },
        radius: CONFIG.PLAYER_SIZE / 2,
        speed: 0.6, // Un poco más lento para escapar
        type: "near", // Lo identificamos como el villano fácil
        health: 1, 
      },
      renderer: (props: any) => (
        <View style={{
          position: 'absolute',
          left: props.body.position.x,
          top: props.body.position.y,
          width: props.body.radius * 4,
          height: props.body.radius * 4,
          backgroundColor: 'green', // Color temporal del villano fácil
          borderRadius: 10
        }} />
      )
    },  
  };

  const startMove = (direction: "up" | "down" | "left" | "right") => {
    switch (direction) {
      case "up": velocityRef.current = { x: 0, y: -CONFIG.PLAYER_SPEED }; break;
      case "down": velocityRef.current = { x: 0, y: CONFIG.PLAYER_SPEED }; break;
      case "left": velocityRef.current = { x: -CONFIG.PLAYER_SPEED, y: 0 }; break;
      case "right": velocityRef.current = { x: CONFIG.PLAYER_SPEED, y: 0 }; break;
    }
  };

  const stopMove = () => {
    velocityRef.current = { x: 0, y: 0 };
  };
  
  const handleDashPress = () => {
    dashSignalRef.current = true;
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

      <View style={styles.hudContainer}>
      <HealthBar health={playerHP} />
    </View>
      <View style={styles.controlsArea}>
        {/* CRUCETA */}
        <View style={styles.dpadContainer}>
          <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnUp, pressed && styles.btnPressed]} onPressIn={() => startMove("up")} onPressOut={stopMove}><Text style={styles.arrow}>▲</Text></Pressable>
          <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnDown, pressed && styles.btnPressed]} onPressIn={() => startMove("down")} onPressOut={stopMove}><Text style={styles.arrow}>▼</Text></Pressable>
          <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnLeft, pressed && styles.btnPressed]} onPressIn={() => startMove("left")} onPressOut={stopMove}><Text style={styles.arrow}>◀</Text></Pressable>
          <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnRight, pressed && styles.btnPressed]} onPressIn={() => startMove("right")} onPressOut={stopMove}><Text style={styles.arrow}>▶</Text></Pressable>
          <View style={styles.dpadCenter} />
        </View>
        <View style={styles.actionButtons}>
          <View style={[styles.btn, styles.btnAttack]} />
          
          {/* BOTÓN DE DASH (AZUL) */}
          <Pressable 
            style={({ pressed }) => [styles.btn, styles.btnDash, pressed && styles.btnPressed]} 
            onPress={handleDashPress}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gameContainer: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  controlsArea: { position: "absolute", width: "100%", height: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 50, paddingBottom: 30 },
  dpadContainer: { width: 150, height: 150, position: "relative" },
  dpadBtn: { position: "absolute", backgroundColor: "rgba(80, 80, 80, 0.6)", justifyContent: "center", alignItems: "center", borderRadius: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  btnPressed: { backgroundColor: "rgba(120, 120, 120, 0.9)" },
  btnUp: { top: 0, left: 50, width: 50, height: 50, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  btnDown: { bottom: 0, left: 50, width: 50, height: 50, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  btnLeft: { top: 50, left: 0, width: 50, height: 50, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  btnRight: { top: 50, right: 0, width: 50, height: 50, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  dpadCenter: { position: "absolute", top: 50, left: 50, width: 50, height: 50, backgroundColor: "rgba(60, 60, 60, 1)", zIndex: -1 },
  arrow: { color: "rgba(255, 255, 255, 0.6)", fontSize: 20, fontWeight: "bold" },
  actionButtons: { flexDirection: "row", gap: 25, alignItems: "center" },
  btn: { width: 75, height: 75, borderRadius: 37.5, borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.3)" },
  btnAttack: { backgroundColor: "rgba(231, 76, 60, 0.3)", marginBottom: 30 },
  btnDash: { backgroundColor: "rgba(52, 152, 219, 0.3)", marginTop: 10 },
  hudContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  healthContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  heartWrapper: {
    width: 30,
    height: 30,
  },
  heartImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  hpTextLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
});