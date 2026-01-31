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
  
  ANIMATION_SPEED: 110,
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
    state: "idle" | "run" | "dash" | "attack"; 
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
  attackRequested: boolean;
  health: number;

  kills: number;        // Contador de enemigos eliminados
  survivalTime: number; // Tiempo sobreviviendo (ms)
  isWinner?: boolean;   // para indicar si ganó
  reachedPortal?: boolean; // para indicar si llegó al portal
}



const SPRITE_SIZE = {
  width: 100, // Ajusta según el tamaño real de un solo muñequito en tu PNG
  height: 100
};

interface GameEntities {
  map: { renderer: React.ComponentType<any> };
  player: {
    body: PlayerBody;
    renderer: React.ComponentType<any>;
  };

  //para que soporte ms enemigos 
  [key: string]: any;

  portal: { 
    body: { position: { x: number, y: number }, size: number }, 
    renderer: React.ComponentType<any> 
  };
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
  const { x, y } = body.velocity;

  // 1. DETERMINAR FILA
  let row = 1; 
  if (state === "attack") row = 2;
  else if (state === "run") row = 0;

  // 2. LÓGICA DE COLUMNA
  let currentFrame = 0;
  let shouldFlip = false;
  
  if (state === "attack") {
    currentFrame = (frameIndex % 2);
    shouldFlip = direction === "left";
  } else if (state === "run") {
    // Si se mueve más horizontalmente
    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 0.1) {
      if (direction === "right") {
        // DERECHA: animar con frames 0 y 1
        currentFrame = (frameIndex % 2);
        shouldFlip = false;
      } else {
        // IZQUIERDA: usar el frame de IDLE (de frente)
        row = 1;
        currentFrame = 1;
        shouldFlip = false;
      }
    } 
    // Si se mueve más verticalmente
    else if (Math.abs(y) > 0.1) {
      if (y < 0) {
        // Caminar ARRIBA: usar frames 2 y 3 (de espalda)
        currentFrame = 2 + (frameIndex % 2);
        shouldFlip = false;
      } else {
        // Caminar ABAJO: usar frame idle (de frente)
        row = 1;
        currentFrame = 1;
        shouldFlip = false;
      }
    } else {
      currentFrame = 0;
    }
  } else {
    // Idle: frame 1 de la fila 1 (de frente)
    currentFrame = 1;
    shouldFlip = false;
  }

  const baseSize = body.radius * 4;
  const displayWidth = baseSize;
  const displayHeight = baseSize * (177 / 117); 

  return (
    <View style={{
      position: "absolute",
      left: body.position.x, 
      top: body.position.y,
      width: displayWidth, 
      height: displayHeight,
      overflow: 'hidden',
    }}>
      <Image
        source={require("../../assets/player/sprite_sheet_player.png")}
        style={{
          width: displayWidth * 4, 
          height: displayHeight * 3,
          position: 'absolute',
          left: -currentFrame * displayWidth,
          top: -row * displayHeight,
          resizeMode: 'stretch',
          transform: [{ scaleX: shouldFlip ? -1 : 1 }],
        }}
      />
    </View>
  );
};

// === RENDERER DEL ENEMIGO ===
const EnemyRenderer = ({ body }: { body: any }) => {
  return (
    <View style={{
      position: 'absolute',
      left: body.position.x,
      top: body.position.y,
      width: body.radius * 2, // Ajustado al radio
      height: body.radius * 2,
      backgroundColor: 'green',
      borderRadius: body.radius,
      borderWidth: 1,
      borderColor: '#00ff00',
    }} />
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
  if (!time || !time.delta) {
    return entities;
  }

  const player = entities.player.body;

  
  // 1. CONTAR TIEMPO: Al principio de la función
  player.survivalTime += time.delta;

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

  if (finalVelocity.x !== 0 || finalVelocity.y !== 0) {
    if (
      gridY >= 0 && gridY < MAP_LOGIC.length &&
      gridX >= 0 && gridX < MAP_LOGIC[0].length &&
      MAP_LOGIC[gridY][gridX] === 0
    ) {
      player.position.x = nextX;
      player.position.y = nextY;
    } else {
      if (player.dash.isDashing) {
        player.dash.isDashing = false;
      }
    }
  }

  // --- 3. ANIMACIÓN ---
  const isMoving = finalVelocity.x !== 0 || finalVelocity.y !== 0;

  if (!player.dash.isDashing && player.animation.state !== "attack") {
    if (isMoving) {
      player.animation.state = "run";
      player.animation.timer += time.delta;
      if (finalVelocity.x > 0) player.animation.direction = "right";
      if (finalVelocity.x < 0) player.animation.direction = "left";
    } else {
      player.animation.state = "idle";
      player.animation.frameIndex = 0;
    }
  }

  player.animation.timer += time.delta;
  if (player.animation.timer >= CONFIG.ANIMATION_SPEED) {
    player.animation.timer = 0;
    player.animation.frameIndex++;
  }


  // == Logica para cada enemigo ==
  Object.keys(entities).forEach(key => {
    if (key.startsWith("enemy")) {
      const enemy = entities[key].body;
      if (enemy.health <= 0) return; // Si ya murió, lo ignoramos

      // 1. Persecución (ya tienes la lógica, solo aplícala a 'enemy')
      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;
      const distanceToPlayer = Math.hypot(dx, dy);

      if (distanceToPlayer < enemy.detectionRange) {
      // MODO PERSECUCIÓN
      const vX = (dx / distanceToPlayer) * enemy.speed;
      const vY = (dy / distanceToPlayer) * enemy.speed;
      enemy.position.x += vX;
      enemy.position.y += vY;
    } else if (enemy.waypoints && enemy.waypoints.length > 0) {
      // MODO PATRULLA POR WAYPOINTS
      const target = enemy.waypoints[enemy.nextPointIndex];
      const tDx = target.x - enemy.position.x;
      const tDy = target.y - enemy.position.y;
      const distanceToTarget = Math.hypot(tDx, tDy);

      if (distanceToTarget < 5) {
        // Si llegó al punto, que pase al siguiente (vuelve a 0 al final)
        enemy.nextPointIndex = (enemy.nextPointIndex + 1) % enemy.waypoints.length;
      } else {
        // Moverse hacia el punto del circuito
        enemy.position.x += (tDx / distanceToTarget) * (enemy.speed * 0.7); // Un poco más lento al patrullar
        enemy.position.y += (tDy / distanceToTarget) * (enemy.speed * 0.7);
      }
    }

      // 2. Daño al jugador
      if (distanceToPlayer < 18) { 
        player.health -= 0.5; // Ajustado para que no mueras tan rápido con 3
      }

      // 3. Recibir daño del jugador (4 golpes para morir)
      if (player.attackRequested && distanceToPlayer < 50) {
        enemy.health -= 1; 
        player.attackRequested = false;
        
        if (enemy.health <= 0) {
          enemy.position = { x: -1000, y: -1000 };
          player.kills += 1;
        }
      }
    }
  });



    // SIEMPRE completar la animación de ataque, independientemente del enemigo
    if (player.animation.frameIndex >= 3) {
      player.attackRequested = false;
      player.animation.state = "idle";
      player.animation.frameIndex = 0;
    }
  

  /// --- FIN DE NIVEL ---
  const portal = entities.portal?.body;
  if (portal) {
    const distToPortal = Math.hypot(
      player.position.x - portal.position.x,
      player.position.y - portal.position.y
    );

    // Si Finn está cerca de la entrada del túnel
    if (distToPortal < 35 && !player.isWinner) {
      player.isWinner = true; // Nueva bandera para evitar múltiples disparos
      // Enviamos una señal al componente principal
      player.reachedPortal = true;
    }
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
  const attackSignalRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [finalStats, setFinalStats] = useState({ kills: 0, time: 0 }); // Para guardar el récord
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // Estado para cuando pase de nivel 

  const InputSystem = (entities: GameEntities) => {
    const player = entities.player.body;
    player.velocity.x = velocityRef.current.x;
    player.velocity.y = velocityRef.current.y;
    
    // Señal de Dash
    if (dashSignalRef.current) {
      player.dash.requested = true;
      dashSignalRef.current = false;
    }

    if (player.health <= 0 && !gameOver) {
    setGameOver(true);
    setFinalStats({
      kills: player.kills,
      time: Math.floor(player.survivalTime / 1000) // Convertir ms a segundos
    });
    setRunning(false); // Detener el motor del juego
    }

    // Señal de Ataque
    if (attackSignalRef.current) {
      player.animation.state = "attack";
      player.attackRequested = true;
      attackSignalRef.current = false;
    }

    // Sincronizar corazones
    if (player.health !== playerHP) {
      setPlayerHP(player.health);
    }
    
    //sincronizar portal con fin de nivel 
    if (player.reachedPortal && !isTransitioning) {
    setIsTransitioning(true);
    setRunning(false); // Pausamos el juego mientras "carga"
    
    // Aquí se llamara a la IA
    console.log("Iniciando carga de Nivel 2 con IA...");
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
        attackRequested: false,
        // En initialEntities -> player -> body:
        kills: 0,
        survivalTime: 0,
        isWinner: false,
        reachedPortal: false,
        
      },
      renderer: PlayerRenderer,
    },
    //enemigo 
    enemy1: {
      body: { 
        position: { x: 400, y: 100 },
        waypoints: [
          { x: 400, y: 100 },
          { x: 500, y: 100 },
          { x: 500, y: 200 },
          { x: 400, y: 200 },
        ], 
        nextPointIndex: 0,
        speed: 1.2, 
        health: 3, 
        radius: 10,
        detectionRange: 120
       },
      renderer: EnemyRenderer 
    },
    enemy2: {
      body: { 
        position: { x: 500, y: 250 }, 
        waypoints: [
          { x: 500, y: 250 }, 
          { x: 600, y: 250 }
        ],
        nextPointIndex: 0,
        speed: 1.4, 
        health: 3, 
        radius: 10,
        detectionRange: 120 },
      renderer: EnemyRenderer 
    },
    enemy3: {
      body: { 
        position: { x: 300, y: 300 }, 
        waypoints: [
          { x: 300, y: 300 }, 
          { x: 200, y: 300 }
        ],
        nextPointIndex: 0,
        speed: 1.1, 
        health: 3, 
        radius: 10, 
        detectionRange: 120 },
      renderer: EnemyRenderer 
    },

    //fin de nivel 
    portal: {
      body: {
        // Calculamos la posición basada en tus coordenadas [29, 9]
        position: { 
          x: 31 * (SCREEN_WIDTH / 32), 
          y: 9 * (SCREEN_HEIGHT / 21) 
        },
        size: 60 
      },
      renderer: () => null // Invisible, ya que el mapa ya tiene el dibujo del túnel
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

  //Ataque del usuario 
  const handleAttackPress = () => {
  attackSignalRef.current = true;
};

const handlePause = () => {
    if (gameOver) return; // No pausar si ya perdiste
    setIsPaused(true);
    setRunning(false); // Detiene el motor del juego
  };

  const handleResume = () => {
    setIsPaused(false);
    setRunning(true); // Arranca el motor
  };

  return (
    <View style={styles.container}>
      <GameEngine
        key={gameKey}
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
           {/* ... botones flechas ... */}
            <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnUp, pressed && styles.btnPressed]} onPressIn={() => startMove("up")} onPressOut={stopMove}><Text style={styles.arrow}>▲</Text></Pressable>
            <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnDown, pressed && styles.btnPressed]} onPressIn={() => startMove("down")} onPressOut={stopMove}><Text style={styles.arrow}>▼</Text></Pressable>
            <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnLeft, pressed && styles.btnPressed]} onPressIn={() => startMove("left")} onPressOut={stopMove}><Text style={styles.arrow}>◀</Text></Pressable>
            <Pressable style={({ pressed }) => [styles.dpadBtn, styles.btnRight, pressed && styles.btnPressed]} onPressIn={() => startMove("right")} onPressOut={stopMove}><Text style={styles.arrow}>▶</Text></Pressable>
            <View style={styles.dpadCenter} />
        </View>

        <View style={styles.actionButtons}>
          {/* BOTÓN DE ATAQUE */}
          <Pressable 
            style={({ pressed }) => [styles.btn, styles.btnAttack, pressed && styles.btnPressed]} 
            onPress={handleAttackPress} 
          />

          {/* BOTÓN DE DASH */}
          <Pressable 
            style={({ pressed }) => [styles.btn, styles.btnDash, pressed && styles.btnPressed]} 
            onPress={handleDashPress}
          />
        </View> 
        {/* 1. AQUÍ CERRAMOS controlsArea (antes estaba dentro) */}
      </View>
      {/* BOTÓN DE PAUSA (Esquina Superior Izquierda) */}
      {!isPaused && !gameOver && (
        <Pressable style={styles.pauseButton} onPress={handlePause}>
          <Text style={styles.pauseIcon}>||</Text>
        </Pressable>
      )}

      {/* MENÚ DE PAUSA */}
      {isPaused && (
        <View style={styles.pauseContainer}>
          <Text style={styles.pauseTitle}>PAUSA</Text>

          {/* Opción 1: Continuar */}
          <Pressable style={styles.menuBtn} onPress={handleResume}>
            <Text style={styles.menuText}>Continuar</Text>
          </Pressable>

          {/* Opción 2: Reiniciar (Usamos la lógica que ya tenías) */}
          <Pressable 
            style={styles.menuBtn} 
            onPress={() => {
              setGameKey((prev) => prev + 1); // Reinicio mágico
              setIsPaused(false);
              setPlayerHP(100);
              setRunning(true);
              velocityRef.current = { x: 0, y: 0 };
            }}
          >
            <Text style={styles.menuText}>Reiniciar</Text>
          </Pressable>

          {/* Opción 3: Salir (Solo visual por ahora) */}
          <Pressable style={[styles.menuBtn, styles.exitBtn]}>
            <Text style={styles.menuText}>Salir a Menú Principal</Text>
          </Pressable>
        </View>
      )}
      {/* 2. AQUÍ PEGAMOS EL GAME OVER (Afuera de todo, al final) */}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>¡GAME OVER!</Text>
          <Text style={styles.statsText}>Enemigos eliminados: {finalStats.kills}</Text>
          <Text style={styles.statsText}>Tiempo sobrevivido: {finalStats.time}s</Text>
          
          <Pressable 
            style={styles.restartButton} 
            onPress={() => {
              setGameKey((prev) => prev + 1);
              
              setGameOver(false);
              setPlayerHP(100); 
              setRunning(true);
              
              velocityRef.current = { x: 0, y: 0 };
            }}
          >
            <Text style={styles.btnText}>Reiniciar</Text>
          </Pressable>
        </View>
      )}

      {/* CAPA DE CARGA (SIGUIENTE NIVEL) */}
    {isTransitioning && (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingText}>INGRESANDO AL TÚNEL...</Text>
        <Text style={styles.subLoadingText}>Generando siguiente zona con IA</Text>
        {/* Aquí podrías poner un ActivityIndicator de React Native */}
        <Pressable 
          style={styles.cancelLoadingBtn} 
          onPress={() => {
            console.log("Carga cancelada, regresando al menú...");
            //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Cuando este el menu de inicio, se redirige al mismo 

          }}
        >
          <Text style={styles.cancelLoadingText}> Cancelar </Text>
        </Pressable>
      </View>
    )}

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
  gameOverContainer: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverText: {
    color: '#ff4444',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    // fontFamily: 'monospace', // Descomenta si quieres letra tipo retro
  },
  statsText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
  },
  restartButton: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: '#3498db',
    borderRadius: 10,
  },
  btnText: { // <--- OJO: Este también te va a faltar si no lo tienes
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // === ESTILOS DE PAUSA ===
  pauseButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    zIndex: 50,
  },
  pauseIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseContainer: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pauseTitle: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 2,
  },
  menuBtn: {
    backgroundColor: '#5d6166',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginBottom: 15,
    width: 250,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#89a48f',
  },
  exitBtn: {
    backgroundColor: '#5d6166', // Rojo para salir
    borderColor: '#89a48f',
    marginTop: 10,
  },
  menuText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200, // Por encima de todo
  },
  loadingText: {
    color: '#00ff00', // Verde tipo terminal
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  subLoadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
  cancelLoadingBtn: {
    marginTop: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#89a48f', // 
    borderRadius: 5,
  },
  cancelLoadingText: {
    color: '#a3aab3',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

});
