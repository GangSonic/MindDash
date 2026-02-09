import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Pressable,
  Image,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import {
  AdaptiveEnemyGenerator,
  MAP_BOUNDS,
} from "../services/Adaptiveenemygenerator";
import LoadingScreen from "../components/LoadingScreen";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";

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
  DASH_SPEED: 3,
  DASH_DURATION: 200,
  DASH_COOLDOWN: 5000,

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
    require("../../assets/player/walk_6_dash.png"),
  ],
  dash: [require("../../assets/player/walk_6_dash.png")],
};

// === ARREGLO DE FONDOS ===
const BACKGROUND_IMAGES = [
  require("../../assets/mapa_bosque.jpg"),
  require("../../assets/mapa_bosque2.png"),
  require("../../assets/mapa_bosque3.png"),
  require("../../assets/mapa_bosque4.png"),
];

// === MATRIZ DEL MAPA ===
const INITIAL_MAP = [
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
    1, 1, 1, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    1, 1, 1, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    0, 1, 1, 1, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
  [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
];

// === CONFIGURACIÓN DEL SPRITE DEL ENEMIGO ===
const ENEMY_SPRITE = require("../../assets/enemy/sprite_sheet_enemy.png");

const ENEMY_SPRITE_CONFIG = {
  columns: 4,
  rows: 5,
  frameWidth: 64,
  frameHeight: 64,
  animationSpeed: 200,
};

// === RENDERER DEL ENEMIGO ===
const EnemyRenderer = ({ body }: { body: any }) => {
  if (body.health <= 0 || body.isDead) return null;

  // Escala para que se vea mejor
  const scale = 0.6;
  const frameWidth = ENEMY_SPRITE_CONFIG.frameWidth * scale;
  const frameHeight = ENEMY_SPRITE_CONFIG.frameHeight * scale;

  // --- CONFIGURACIÓN DE LIMPIEZA ---
  const CROP_AMOUNT = 3; // Aumenta este número si sigues viendo manchas a los lados
  // ---------------------------------

  const col = (body.animation?.frameIndex || 0) % ENEMY_SPRITE_CONFIG.columns;
  const row = body.animation?.row ?? 0;
  const shouldFlip = body.animation?.direction === "left";
  const healthPercentage = (body.health / 3) * 100;

  return (
    <View
      style={{
        position: "absolute",
        // CENTRADO CORRECTO
        left: body.position.x - frameWidth / 2,
        top: body.position.y - frameHeight / 2 - 8,
        width: frameWidth - CROP_AMOUNT * 2, // Contenedor más angosto
        height: frameHeight + 8,
        alignItems: "center",
        backgroundColor: "transparent", // <- FONDO TRANSPARENTE
      }}
    >
      {/* BARRA DE VIDA */}
      <View
        style={{
          width: (frameWidth - CROP_AMOUNT * 2) * 0.8,
          height: 4,
          backgroundColor: "#333",
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <View
          style={{
            width: `${healthPercentage}%`,
            height: "100%",
            backgroundColor: body.health > 1 ? "#00ff00" : "#ff0000",
          }}
        />
      </View>

      {/* CONTENEDOR DEL SPRITE CON RECORTE LATERAL */}
      <View
        style={{
          width: frameWidth - CROP_AMOUNT * 2,
          height: frameHeight,
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      >
        <Image
          source={ENEMY_SPRITE}
          style={{
            width: ENEMY_SPRITE_CONFIG.columns * frameWidth,
            height: ENEMY_SPRITE_CONFIG.rows * frameHeight,
            position: "absolute",
            // Ajustamos el 'left' para que el dibujo se mueva al centro y oculte los bordes
            left: -(col * frameWidth) - CROP_AMOUNT,
            top: -(row * frameHeight),
            transform: [{ scaleX: shouldFlip ? -1 : 1 }],
          }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const INITIAL_ENEMIES = {
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
      detectionRange: 120,
      animation: {
        frameIndex: 0,
        timer: 0,
        row: 0,
      },
    },
    renderer: EnemyRenderer,
  },
  enemy2: {
    body: {
      position: { x: 500, y: 250 },
      waypoints: [
        { x: 500, y: 250 },
        { x: 600, y: 250 },
      ],
      nextPointIndex: 0,
      speed: 1.4,
      health: 3,
      radius: 10,
      detectionRange: 120,
      animation: {
        frameIndex: 0,
        timer: 0,
        row: 0,
      },
    },
    renderer: EnemyRenderer,
  },
  enemy3: {
    body: {
      position: { x: 300, y: 300 },
      waypoints: [
        { x: 300, y: 300 },
        { x: 200, y: 300 },
      ],
      nextPointIndex: 0,
      speed: 1.1,
      health: 3,
      radius: 10,
      detectionRange: 120,
      animation: {
        frameIndex: 0,
        timer: 0,
        row: 0,
      },
    },
    renderer: EnemyRenderer,
  },
};

// === TIPOS ===
interface PlayerBody {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
  animation: {
    state: "idle" | "run" | "dash" | "attack";
    direction: "left" | "right";
    frameIndex: number;
    timer: number;
  };
  dash: {
    isDashing: boolean;
    timeLeft: number;
    cooldown: number;
    facing: { x: number; y: number };
    requested: boolean;
    dashCount: number;
  };
  attackRequested: boolean;
  health: number;
  attackCount: number;
  hitsLanded: number;
  kills: number;
  survivalTime: number;
  isWinner?: boolean;
  reachedPortal?: boolean;
}

const SPRITE_SIZE = {
  width: 100,
  height: 100,
};

interface GameEntities {
  map: { renderer: React.ComponentType<any> };
  player: {
    body: PlayerBody;
    renderer: React.ComponentType<any>;
  };
  [key: string]: any;
  portal: {
    body: { position: { x: number; y: number }; size: number };
    renderer: React.ComponentType<any>;
  };
}

// === RENDERER DEL MAPA ===
const MapRenderer = ({ backgroundImage }: { backgroundImage: any }) => {
  return (
    <View
      style={{
        position: "absolute",
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      }}
    >
      <Image
        source={backgroundImage}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          resizeMode: "stretch",
          zIndex: -1,
        }}
      />
    </View>
  );
};

// === RENDERER DEL JUGADOR ===
const PlayerRenderer = ({ body }: { body: PlayerBody }) => {
  const { state, direction, frameIndex } = body.animation;
  const { x, y } = body.velocity;

  let row = 1;
  if (state === "attack") row = 2;
  else if (state === "run") row = 0;

  let currentFrame = 0;
  let shouldFlip = false;

  if (state === "attack") {
    currentFrame = frameIndex % 2;
    shouldFlip = direction === "left";
  } else if (state === "run") {
    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 0.1) {
      if (direction === "right") {
        currentFrame = frameIndex % 2;
        shouldFlip = false;
      } else {
        row = 1;
        currentFrame = 1;
        shouldFlip = false;
      }
    } else if (Math.abs(y) > 0.1) {
      if (y < 0) {
        currentFrame = 2 + (frameIndex % 2);
        shouldFlip = false;
      } else {
        row = 1;
        currentFrame = 1;
        shouldFlip = false;
      }
    } else {
      currentFrame = 0;
    }
  } else {
    currentFrame = 1;
    shouldFlip = false;
  }

  const baseSize = body.radius * 4;
  const displayWidth = baseSize;
  const displayHeight = baseSize * (177 / 117);

  return (
    <View
      style={{
        position: "absolute",
        left: body.position.x - displayWidth / 2,
        top: body.position.y - displayHeight / 2,
        width: displayWidth,
        height: displayHeight,
        overflow: "hidden",
      }}
    >
      <Image
        source={require("../../assets/player/sprite_sheet_player.png")}
        style={{
          width: displayWidth * 4,
          height: displayHeight * 3,
          position: "absolute",
          left: -currentFrame * displayWidth,
          top: -row * displayHeight,
          resizeMode: "stretch",
          transform: [{ scaleX: shouldFlip ? -1 : 1 }],
        }}
      />
    </View>
  );
};

// === COMPONENTE DE VIDAS ===
const HealthBar = ({ health }: { health: number }) => {
  const numHearts = 5;
  const hearts = [];

  for (let i = 0; i < numHearts; i++) {
    const heartValue = (i + 1) * 20;
    const isFull = health >= heartValue;
    const isEmpty = health <= heartValue - 20;

    hearts.push(
      <View key={i} style={styles.heartWrapper}>
        <Image
          source={require("../../assets/life/heart_pixel.png")}
          style={[
            styles.heartImage,
            isEmpty && { opacity: 0.3, tintColor: "gray" },
            !isFull && !isEmpty && { tintColor: "#ff8888" },
          ]}
        />
      </View>,
    );
  }

  return <View style={styles.healthContainer}>{hearts}</View>;
};

// === FÍSICA Y ANIMACIÓN ===
const PhysicsSystem = (entities: GameEntities, { time }: { time: any }) => {
  if (!time || !time.delta) {
    return entities;
  }

  const player = entities.player.body;
  player.survivalTime += time.delta;

  // --- GESTIÓN DEL DASH ---
  if (player.dash.cooldown > 0) {
    player.dash.cooldown -= time.delta;
  }

  if (player.velocity.x !== 0 || player.velocity.y !== 0) {
    player.dash.facing = {
      x: Math.sign(player.velocity.x),
      y: Math.sign(player.velocity.y),
    };
  }

  if (player.dash.requested && player.dash.cooldown <= 0) {
    player.dash.isDashing = true;
    player.dash.timeLeft = CONFIG.DASH_DURATION;
    player.dash.cooldown = CONFIG.DASH_COOLDOWN;
    player.dash.dashCount = (player.dash.dashCount || 0) + 1;
    player.dash.requested = false;
    player.animation.state = "dash";
  }
  player.dash.requested = false;

  let finalVelocity = { x: player.velocity.x, y: player.velocity.y };

  if (player.dash.isDashing) {
    player.dash.timeLeft -= time.delta;

    if (player.dash.timeLeft <= 0) {
      player.dash.isDashing = false;
    } else {
      const dirX =
        player.dash.facing.x === 0 && player.dash.facing.y === 0
          ? 1
          : player.dash.facing.x;
      const dirY = player.dash.facing.y;

      finalVelocity = {
        x: dirX * CONFIG.DASH_SPEED,
        y: dirY * CONFIG.DASH_SPEED,
      };
      player.animation.state = "dash";
    }
  }

  // --- MOVIMIENTO Y COLISIONES ---
  const nextX = player.position.x + finalVelocity.x;
  const nextY = player.position.y + finalVelocity.y;

  const cellWidth = SCREEN_WIDTH / 32;
  const cellHeight = SCREEN_HEIGHT / 21;
  const checkX = finalVelocity.x > 0 ? nextX + player.radius * 2 : nextX;
  const checkY = finalVelocity.y > 0 ? nextY + player.radius * 2 : nextY;
  const gridX = Math.floor(checkX / cellWidth);
  const gridY = Math.floor(checkY / cellHeight);

  const currentMap = entities.mapData?.matrix || INITIAL_MAP;

  if (finalVelocity.x !== 0 || finalVelocity.y !== 0) {
    if (
      gridY >= 0 &&
      gridY < currentMap.length &&
      gridX >= 0 &&
      gridX < currentMap[0].length &&
      currentMap[gridY][gridX] === 0
    ) {
      player.position.x = nextX;
      player.position.y = nextY;
    } else {
      if (player.dash.isDashing) player.dash.isDashing = false;
    }
  }

  // --- ANIMACIÓN ---
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

  if (player.attackRequested) {
    player.animation.state = "attack";
    player.animation.frameIndex = 0;
    player.attackCount = (player.attackCount || 0) + 1;
  }

  // === LÓGICA DE ENEMIGOS ===
  Object.keys(entities).forEach((key) => {
    if (key.startsWith("enemy")) {
      const enemy = entities[key].body;

      if (enemy.isDead) return;

      if (!enemy.animation) {
        enemy.animation = { frameIndex: 0, timer: 0, row: 0 };
      }

      enemy.animation.timer += time.delta;
      if (enemy.animation.timer >= ENEMY_SPRITE_CONFIG.animationSpeed) {
        enemy.animation.timer = 0;
        enemy.animation.frameIndex =
          (enemy.animation.frameIndex + 1) % ENEMY_SPRITE_CONFIG.columns;
      }

      const dx = player.position.x - enemy.position.x;
      const dy = player.position.y - enemy.position.y;
      const distanceToPlayer = Math.hypot(dx, dy);

      const oldX = enemy.position.x;

      if (distanceToPlayer < enemy.detectionRange) {
        enemy.animation.row = 1;
      } else {
        enemy.animation.row = 0;
      }

      if (distanceToPlayer < enemy.detectionRange) {
        if (distanceToPlayer === 0) return;

        const vX = (dx / distanceToPlayer) * enemy.speed;
        const vY = (dy / distanceToPlayer) * enemy.speed;

        const prevX = enemy.position.x;
        const prevY = enemy.position.y;

        enemy.position.x += vX;
        enemy.position.y += vY;

        enemy.position.x = Math.max(
          enemy.radius,
          Math.min(SCREEN_WIDTH - enemy.radius * 2, enemy.position.x),
        );

        enemy.position.y = Math.max(
          enemy.radius,
          Math.min(SCREEN_HEIGHT - enemy.radius * 2, enemy.position.y),
        );

        // 2. Después de que la posición X se haya actualizado, calculamos la dirección
        if (enemy.position.x > oldX + 0.1) {
          enemy.animation.direction = "right";
        } else if (enemy.position.x < oldX - 0.1) {
          enemy.animation.direction = "left";
        }

        const stuck =
          Math.abs(enemy.position.x - prevX) < 0.01 &&
          Math.abs(enemy.position.y - prevY) < 0.01;

        if (stuck && enemy.waypoints?.length > 0) {
          enemy.nextPointIndex =
            (enemy.nextPointIndex + 1) % enemy.waypoints.length;
        }
      } else if (enemy.waypoints && enemy.waypoints.length > 0) {
        const target = enemy.waypoints[enemy.nextPointIndex];
        const tDx = target.x - enemy.position.x;
        const tDy = target.y - enemy.position.y;
        const distanceToTarget = Math.hypot(tDx, tDy);

        if (distanceToTarget === 0) {
          enemy.nextPointIndex =
            (enemy.nextPointIndex + 1) % enemy.waypoints.length;
          return;
        }

        if (distanceToTarget < 25) {
          enemy.nextPointIndex =
            (enemy.nextPointIndex + 1) % enemy.waypoints.length;
        } else {
          const pvX = (tDx / distanceToTarget) * enemy.speed;
          const pvY = (tDy / distanceToTarget) * enemy.speed;

          enemy.position.x += pvX;
          enemy.position.y += pvY;

          enemy.position.x = Math.max(
            MAP_BOUNDS.minX + enemy.radius + 20,
            Math.min(MAP_BOUNDS.maxX - enemy.radius - 20, enemy.position.x),
          );

          enemy.position.y = Math.max(
            MAP_BOUNDS.minY + enemy.radius + 20,
            Math.min(MAP_BOUNDS.maxY - enemy.radius - 20, enemy.position.y),
          );

          if (
            enemy.position.x < MAP_BOUNDS.minX + 30 ||
            enemy.position.x > MAP_BOUNDS.maxX - 30 ||
            enemy.position.y < MAP_BOUNDS.minY + 30 ||
            enemy.position.y > MAP_BOUNDS.maxY - 30
          ) {
            enemy.nextPointIndex =
              (enemy.nextPointIndex + 1) % enemy.waypoints.length;
          }
        }
      }

      if (distanceToPlayer < 18) {
        player.health -= 0.5;
      }

      if (player.attackRequested && distanceToPlayer < 60) {
        enemy.health -= 1;
        player.hitsLanded += 1;

        const knockbackForce = 35;
        const angle = Math.atan2(dy, dx);
        enemy.position.x += Math.cos(angle) * knockbackForce;
        enemy.position.y += Math.sin(angle) * knockbackForce;

        const hitBoundary =
          enemy.position.x <= MAP_BOUNDS.minX + enemy.radius ||
          enemy.position.x >= MAP_BOUNDS.maxX - enemy.radius ||
          enemy.position.y <= MAP_BOUNDS.minY + enemy.radius ||
          enemy.position.y >= MAP_BOUNDS.maxY - enemy.radius;

        if (hitBoundary) {
          enemy.nextPointIndex =
            (enemy.nextPointIndex + 1) % enemy.waypoints.length;
        }

        if (enemy.health <= 0) {
          enemy.health = 0;
          enemy.isDead = true;
          player.kills += 1;
        }
      }
    }
  });

  if (player.attackRequested) {
    player.attackRequested = false;
  }

  if (player.animation.state === "attack" && player.animation.frameIndex >= 3) {
    player.animation.state = "idle";
    player.animation.frameIndex = 0;
  }

  // --- FIN DE NIVEL ---
  const portal = entities.portal?.body;
  if (portal) {
    const distToPortal = Math.hypot(
      player.position.x - portal.position.x,
      player.position.y - portal.position.y,
    );

    if (distToPortal < 35 && !player.isWinner) {
      player.isWinner = true;
      player.reachedPortal = true;
    }
  }

  return entities;
};

// === PANTALLA PRINCIPAL ===
export default function GameScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const musicRef = useRef<Audio.Sound | null>(null);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [mapMatrix, setMapMatrix] = useState(INITIAL_MAP);
  const [enemiesData, setEnemiesData] = useState(INITIAL_ENEMIES);

  const [playerHP, setPlayerHP] = useState(100);
  const [running, setRunning] = useState(true);
  const gameEngineRef = useRef<GameEngine>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const dashSignalRef = useRef(false);
  const attackSignalRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [finalStats, setFinalStats] = useState({ kills: 0, time: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(
    BACKGROUND_IMAGES[0],
  );
  const [accumulatedStats, setAccumulatedStats] = useState({
    kills: 0,
    time: 0,
  });
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // FUNCIÓN DE SONIDO
  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/click.mp3"),
      );
      await sound.playAsync();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let isMounted = true;

    const playMusic = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/audio/bg_music.mp3"),
          {
            isLooping: true,
            volume: 0.4,
          },
        );

        if (isMounted) {
          musicRef.current = sound;
          await sound.playAsync();
        }
      } catch (e) {
        console.error("Error al reproducir música:", e);
      }
    };

    playMusic();

    return () => {
      isMounted = false;
      if (musicRef.current) {
        musicRef.current.stopAsync();
        musicRef.current.unloadAsync();
      }
    };
  }, [isLoading]);

  const setupNextLevel = async (
    currentKills: number,
    currentTimeInSeconds: number,
    currentHealth: number,
    currentDashes: number = 0,
  ) => {
    setRunning(false);

    const nextLevel = currentLevel + 1;
    console.log("\n🎮 === PASANDO AL NIVEL", nextLevel, "===");

    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    const selectedBg = BACKGROUND_IMAGES[randomIndex];

    setAccumulatedStats({
      kills: currentKills,
      time: currentTimeInSeconds,
    });

    console.log("Nivel completado. Vida restante:", currentHealth);

    setTimeout(async () => {
      setCurrentBackground(selectedBg);
      setMapMatrix(INITIAL_MAP);

      try {
        const enemies = await AdaptiveEnemyGenerator.generate(nextLevel, {
          time: currentTimeInSeconds,
          kills: currentKills,
          dashes: currentDashes,
        });

        console.log(`${enemies.length} enemigos generados con IA`);

        const gameEnemies: any = {};
        enemies.forEach((enemy, index) => {
          gameEnemies[`enemy_lvl${nextLevel}_${index}`] = {
            body: {
              position: enemy.position,
              waypoints: enemy.waypoints,
              nextPointIndex: enemy.nextPointIndex,
              speed: enemy.speed,
              health: enemy.health,
              radius: enemy.radius,
              detectionRange: enemy.detectionRange,
              animation: {
                frameIndex: 0,
                timer: 0,
                row: 0,
              },
            },
            renderer: EnemyRenderer,
          };
        });

        setEnemiesData(gameEnemies);
      } catch (error) {
        console.error("Error generando enemigos con IA:", error);
        const freshEnemies = JSON.parse(JSON.stringify(INITIAL_ENEMIES));
        setEnemiesData(freshEnemies);
      }

      setPlayerHP(currentHealth);
      setCurrentLevel(nextLevel);
      setGameKey((prev) => prev + 1);
      setIsTransitioning(false);
      setRunning(true);

      console.log("🎮 === NIVEL LISTO ===\n");
    }, 1000);
  };

  const getEntities = () => {
    const enemiesCopy = JSON.parse(JSON.stringify(enemiesData));

    const enemyEntities: any = {};
    Object.keys(enemiesCopy).forEach((key) => {
      enemyEntities[key] = {
        body: enemiesCopy[key].body,
        renderer: EnemyRenderer,
      };
    });

    return {
      map: {
        matrix: mapMatrix,
        backgroundImage: currentBackground,
        renderer: MapRenderer,
      },
      player: {
        body: {
          position: { x: 50, y: SCREEN_HEIGHT / 2 },
          velocity: { x: 0, y: 0 },
          radius: CONFIG.PLAYER_SIZE / 2,
          health: playerHP,
          animation: {
            state: "idle",
            direction: "right",
            frameIndex: 0,
            timer: 0,
          },
          dash: {
            isDashing: false,
            timeLeft: 0,
            cooldown: 0,
            facing: { x: 1, y: 0 },
            requested: false,
            dashCount: 0,
          },
          kills: accumulatedStats.kills,
          survivalTime: accumulatedStats.time,
          reachedPortal: false,
          attackCounted: 0,
          hitsLanded: 0,
        },
        renderer: PlayerRenderer,
      },
      ...enemyEntities,
      mapData: { matrix: mapMatrix },
      portal: {
        body: {
          position: { x: SCREEN_WIDTH - 50, y: SCREEN_HEIGHT / 2 },
          size: 60,
        },
        renderer: () => null,
      },
    };
  };

  const InputSystem = (entities: GameEntities) => {
    const player = entities.player.body;
    player.velocity.x = velocityRef.current.x;
    player.velocity.y = velocityRef.current.y;

    if (dashSignalRef.current) {
      player.dash.requested = true;
      dashSignalRef.current = false;
    }

    if (player.health <= 0 && !gameOver) {
      setGameOver(true);
      setFinalStats({
        kills: player.kills,
        time: Math.floor(player.survivalTime / 1000),
      });
      setRunning(false);
    }

    if (attackSignalRef.current) {
      player.animation.state = "attack";
      player.attackRequested = true;
      attackSignalRef.current = false;
    }

    if (player.health !== playerHP) {
      setPlayerHP(player.health);
    }

    if (player.reachedPortal && !isTransitioning) {
      setIsTransitioning(true);
      const timeInSeconds = Math.floor(player.survivalTime / 1000);
      setupNextLevel(
        player.kills,
        timeInSeconds,
        player.health,
        player.dash.dashCount,
      );
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
        dash: {
          isDashing: false,
          timeLeft: 0,
          cooldown: 0,
          facing: { x: 1, y: 0 },
          requested: false,
          dashCount: 0,
        },
        health: 100,
        attackRequested: false,
        attackCount: 0,
        hitsLanded: 0,
        kills: 0,
        survivalTime: 0,
        isWinner: false,
        reachedPortal: false,
      },
      renderer: PlayerRenderer,
    },
    portal: {
      body: {
        position: {
          x: 31 * (SCREEN_WIDTH / 32),
          y: 9 * (SCREEN_HEIGHT / 21),
        },
        size: 60,
      },
      renderer: () => null,
    },
  };

  const startMove = (direction: "up" | "down" | "left" | "right") => {
    switch (direction) {
      case "up":
        velocityRef.current = { x: 0, y: -CONFIG.PLAYER_SPEED };
        break;
      case "down":
        velocityRef.current = { x: 0, y: CONFIG.PLAYER_SPEED };
        break;
      case "left":
        velocityRef.current = { x: -CONFIG.PLAYER_SPEED, y: 0 };
        break;
      case "right":
        velocityRef.current = { x: CONFIG.PLAYER_SPEED, y: 0 };
        break;
    }
  };

  const stopMove = () => {
    velocityRef.current = { x: 0, y: 0 };
  };

  const handleDashPress = () => {
    dashSignalRef.current = true;
  };

  const handleAttackPress = () => {
    attackSignalRef.current = true;
  };

  const handlePause = () => {
    if (gameOver) return;
    setIsPaused(true);
    setRunning(false);

    if (musicRef.current && !isMusicMuted) {
      musicRef.current.pauseAsync();
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    setRunning(true);

    if (musicRef.current && !isMusicMuted) {
      musicRef.current.playAsync();
    }
  };

  const toggleMusic = async () => {
    try {
      if (musicRef.current) {
        if (isMusicMuted) {
          // Reanudar música
          await musicRef.current.playAsync();
          setIsMusicMuted(false);
        } else {
          // Pausar música
          await musicRef.current.pauseAsync();
          setIsMusicMuted(true);
        }
      }
    } catch (e) {
      console.log("Error al toggle música:", e);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <View style={styles.container}>
            <GameEngine
              key={gameKey}
              ref={gameEngineRef}
              style={styles.gameContainer}
              entities={getEntities()}
              systems={[InputSystem, PhysicsSystem]}
              running={running}
            />

            <View style={styles.hudContainer}>
              <HealthBar health={playerHP} />
            </View>

            <View style={styles.controlsArea}>
              <View style={styles.dpadContainer}>
                {/* BOTÓN ARRIBA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadBtnWrapper,
                    styles.btnUpWrapper,
                    pressed && styles.dpadBtnPressed,
                  ]}
                  onPressIn={() => startMove("up")}
                  onPressOut={stopMove}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/cruceta_up.png")} // ← Asegúrate de tener esta imagen
                        style={styles.dpadBtnImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.dpadBtnShine} />}
                    </>
                  )}
                </Pressable>

                {/* BOTÓN ABAJO */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadBtnWrapper,
                    styles.btnDownWrapper,
                    pressed && styles.dpadBtnPressed,
                  ]}
                  onPressIn={() => startMove("down")}
                  onPressOut={stopMove}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/cruceta_down.png")} // ← Asegúrate de tener esta imagen
                        style={styles.dpadBtnImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.dpadBtnShine} />}
                    </>
                  )}
                </Pressable>

                {/* BOTÓN IZQUIERDA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadBtnWrapper,
                    styles.btnLeftWrapper,
                    pressed && styles.dpadBtnPressed,
                  ]}
                  onPressIn={() => startMove("left")}
                  onPressOut={stopMove}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/cruceta_left.png")} // ← Asegúrate de tener esta imagen
                        style={styles.dpadBtnImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.dpadBtnShine} />}
                    </>
                  )}
                </Pressable>

                {/* BOTÓN DERECHA */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadBtnWrapper,
                    styles.btnRightWrapper,
                    pressed && styles.dpadBtnPressed,
                  ]}
                  onPressIn={() => startMove("right")}
                  onPressOut={stopMove}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/cruceta_right.png")} // ← Asegúrate de tener esta imagen
                        style={styles.dpadBtnImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.dpadBtnShine} />}
                    </>
                  )}
                </Pressable>

                {/* CENTRO DE LA CRUCETA */}
                <View style={styles.dpadCenter} />
              </View>
              {/* BOTONES DE ACCIÓN (ATAQUE Y DASH) */}
              <View style={styles.actionButtons}>
                {/* BOTÓN DE ATAQUE */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButtonWrapper,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={handleAttackPress}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/button_attack.png")}
                        style={styles.actionButtonImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.actionButtonShine} />}
                    </>
                  )}
                </Pressable>

                {/* BOTÓN DE DASH */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButtonWrapper,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={handleDashPress}
                >
                  {({ pressed }) => (
                    <>
                      <Image
                        source={require("../../assets/ui/button_dash.png")}
                        style={styles.actionButtonImage}
                        resizeMode="stretch"
                      />
                      {pressed && <View style={styles.actionButtonShine} />}
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* BOTÓN DE PAUSA CON ESTILOS MEJORADOS DE LA VERSIÓN 2 */}
            {!isPaused && !gameOver && (
              <View style={styles.pauseIconButtonWrapper}>
                <Image
                  source={require("../../assets/ui/pause_icon.png")}
                  style={styles.pauseBackgroundImage}
                  resizeMode="contain"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.pauseButtonOverlay,
                    pressed && styles.pauseButtonPressed,
                  ]}
                  onPress={handlePause}
                >
                  {({ pressed }) => (
                    <>
                      <View
                        style={[
                          styles.pressIndicator,
                          pressed && styles.pressIndicatorActive,
                        ]}
                      />
                      {pressed && <View style={styles.pressShine} />}
                    </>
                  )}
                </Pressable>
              </View>
            )}

            {/* MENÚ DE PAUSA CON ESTILOS MEJORADOS DE LA VERSIÓN 2 */}
            {isPaused && (
              <View style={styles.pauseContainer}>
                <Image
                  source={require("../../assets/ui/menu_paused2.png")}
                  style={styles.pauseMenuBackground}
                  resizeMode="contain"
                />

                <View style={styles.pauseMenuContent}>
                  <Text style={styles.pauseTitle}></Text>

                  <View style={styles.pauseButtonsContainer}>
                    <View style={styles.pauseMainButtonsColumn}>
                      {/* BOTÓN CONTINUAR */}
                      <Pressable
                        style={({ pressed }) => [
                          styles.pauseMenuButtonWrapper,
                          pressed && styles.pauseButtonPressedMenu,
                        ]}
                        onPress={() => {
                          playClickSound();
                          handleResume();
                        }}
                      >
                        {({ pressed }) => (
                          <>
                            <Image
                              source={require("../../assets/ui/button_continue.png")}
                              style={styles.pauseButtonImage}
                              resizeMode="stretch"
                            />
                            <View style={styles.pauseButtonOverlayMenu}>
                              <Text style={styles.pauseButtonText}></Text>
                            </View>
                            {pressed && (
                              <View style={styles.pauseButtonShine} />
                            )}
                          </>
                        )}
                      </Pressable>

                      {/* BOTÓN REINICIAR */}
                      <Pressable
                        style={({ pressed }) => [
                          styles.pauseMenuButtonWrapper,
                          pressed && styles.pauseButtonPressedMenu,
                        ]}
                        onPress={() => {
                          playClickSound();
                          const freshEnemies = JSON.parse(
                            JSON.stringify(INITIAL_ENEMIES),
                          );
                          setMapMatrix(INITIAL_MAP);
                          setEnemiesData(freshEnemies);
                          setAccumulatedStats({ kills: 0, time: 0 });
                          setGameKey((prev) => prev + 1);
                          setIsPaused(false);
                          setPlayerHP(100);
                          setRunning(true);
                          velocityRef.current = { x: 0, y: 0 };
                          dashSignalRef.current = false;
                          attackSignalRef.current = false;
                        }}
                      >
                        {({ pressed }) => (
                          <>
                            <Image
                              source={require("../../assets/ui/button_restart.png")}
                              style={styles.pauseButtonImage}
                              resizeMode="stretch"
                            />
                            <View style={styles.pauseButtonOverlayMenu}>
                              <Text style={styles.pauseButtonText}></Text>
                            </View>
                            {pressed && (
                              <View style={styles.pauseButtonShine} />
                            )}
                          </>
                        )}
                      </Pressable>

                      {/* BOTÓN SALIR A MENÚ */}
                      <Pressable
                        style={({ pressed }) => [
                          styles.pauseMenuButtonWrapper,
                          pressed && styles.pauseButtonPressedMenu,
                        ]}
                        onPress={async () => {
                          playClickSound();
                          setRunning(false);
                          setIsPaused(false);

                          if (musicRef.current) {
                            try {
                              await musicRef.current.stopAsync();
                            } catch (e) {
                              console.log(e);
                            }
                          }

                          navigation.navigate("Menu");
                        }}
                      >
                        {({ pressed }) => (
                          <>
                            <Image
                              source={require("../../assets/ui/button_menu.png")}
                              style={styles.pauseButtonImage}
                              resizeMode="stretch"
                            />
                            <View style={styles.pauseButtonOverlayMenu}>
                              <Text style={styles.pauseButtonText}></Text>
                            </View>
                            {pressed && (
                              <View style={styles.pauseButtonShine} />
                            )}
                          </>
                        )}
                      </Pressable>
                    </View>

                    {/* COLUMNA DERECHA - Botón de música */}
                    <View style={styles.pauseMusicButtonColumn}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.musicButtonWrapper,
                          pressed && styles.musicButtonPressed,
                        ]}
                        onPress={() => {
                          playClickSound();
                          toggleMusic();
                        }}
                      >
                        {({ pressed }) => (
                          <>
                            <Image
                              source={require("../../assets/ui/button_music.png")}
                              style={[
                                styles.musicButtonImage,
                                isMusicMuted && { opacity: 0.5 },
                              ]}
                              resizeMode="stretch"
                            />
                            <View style={styles.musicButtonOverlay}>
                              {isMusicMuted && (
                                <Image
                                  source={require("../../assets/ui/no_music2.png")}
                                  style={styles.mutedImage}
                                  resizeMode="contain"
                                />
                              )}
                            </View>
                            {pressed && (
                              <View style={styles.pauseButtonShine} />
                            )}
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {gameOver && (
              <View style={styles.gameOverContainer}>
                <Text style={styles.gameOverText}>¡GAME OVER!</Text>
                <Text style={styles.statsText}>
                  Enemigos eliminados: {finalStats.kills}
                </Text>
                <Text style={styles.statsText}>
                  Tiempo sobrevivido: {finalStats.time}s
                </Text>

                <Pressable
                  style={styles.restartButton}
                  onPress={() => {
                    const freshEnemies = JSON.parse(
                      JSON.stringify(INITIAL_ENEMIES),
                    );
                    setMapMatrix(INITIAL_MAP);
                    setEnemiesData(freshEnemies);
                    setAccumulatedStats({ kills: 0, time: 0 });
                    setGameKey((prev) => prev + 1);
                    setGameOver(false);
                    setPlayerHP(100);
                    setRunning(true);
                    dashSignalRef.current = false;
                    attackSignalRef.current = false;
                    velocityRef.current = { x: 0, y: 0 };
                  }}
                >
                  <Text style={styles.btnText}>Reiniciar</Text>
                </Pressable>
              </View>
            )}

            {isTransitioning && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>INGRESANDO AL TÚNEL...</Text>
                <Text style={styles.subLoadingText}>
                  Generando siguiente zona con IA
                </Text>
                <Pressable
                  style={styles.cancelLoadingBtn}
                  onPress={() => {
                    console.log("Carga cancelada, regresando al menú...");
                  }}
                >
                  <Text style={styles.cancelLoadingText}> Cancelar </Text>
                </Pressable>
              </View>
            )}

            <View
              style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
            >
              {BACKGROUND_IMAGES.map((img, index) => (
                <Image key={index} source={img} />
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gameContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  controlsArea: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 50,
    paddingBottom: 30,
  },
  dpadContainer: { width: 150, height: 150, position: "relative" },
  dpadBtn: {
    position: "absolute",
    backgroundColor: "rgba(80, 80, 80, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  btnPressed: { backgroundColor: "rgba(120, 120, 120, 0.9)" },
  btnUp: {
    top: 0,
    left: 50,
    width: 50,
    height: 50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  btnDown: {
    bottom: 0,
    left: 50,
    width: 50,
    height: 50,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  btnLeft: {
    top: 50,
    left: 0,
    width: 50,
    height: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  btnRight: {
    top: 50,
    right: 0,
    width: 50,
    height: 50,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  dpadCenter: {
    position: "absolute",
    top: 50,
    left: 50,
    width: 50,
    height: 50,
    backgroundColor: "rgba(60, 60, 60, 1)",
    zIndex: -1,
  },
  arrow: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 20,
    fontWeight: "bold",
  },
  btn: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  btnAttack: { backgroundColor: "rgba(231, 76, 60, 0.3)", marginBottom: 30 },
  btnDash: { backgroundColor: "rgba(52, 152, 219, 0.3)", marginTop: 10 },
  hudContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  healthContainer: { flexDirection: "row", gap: 5 },
  heartWrapper: { width: 30, height: 30 },
  heartImage: { width: "100%", height: "100%", resizeMode: "contain" },
  hpTextLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  gameOverContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  gameOverText: {
    color: "#ff4444",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsText: { color: "#fff", fontSize: 20, marginBottom: 10 },
  restartButton: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: "#3498db",
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 18 },

  // === ESTILOS MEJORADOS DE PAUSA (VERSIÓN 2) ===
  pauseIconButtonWrapper: {
    position: "relative",
    top: 15,
    left: 40,
    width: 80,
    height: 80,
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  pauseBackgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },
  pauseButtonOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  pauseButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 3 },
  },
  pressIndicator: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "transparent",
  },
  pressIndicatorActive: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pressShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopColor: "rgba(255, 255, 255, 0.4)",
    borderLeftColor: "rgba(255, 255, 255, 0.4)",
  },
  pauseContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  pauseMenuBackground: {
    position: "absolute",
    width: "90%",
    maxWidth: 500,
    height: "70%",
    maxHeight: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  pauseMenuContent: {
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
    gap: 3,
    zIndex: 101,
  },
  pauseTitle: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 3,
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  pauseButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    paddingHorizontal: 10,
  },
  pauseMainButtonsColumn: {
    flex: 0,
    gap: 3,
    alignItems: "center",
  },
  pauseMusicButtonColumn: {
    flex: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseMenuButtonWrapper: {
    top: -15,
    width: 180,
    height: 60,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  pauseButtonImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  pauseButtonOverlayMenu: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  pauseButtonPressedMenu: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
  },
  pauseButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  pauseButtonShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
  },
  musicButtonWrapper: {
    width: 50,
    height: 50,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  musicButtonImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  musicButtonOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  musicButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
  },
  mutedImage: {
    position: "absolute",
    width: 40,
    height: 40,
    opacity: 0.9,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  loadingText: {
    color: "#00ff00",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  subLoadingText: {
    color: "#888",
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
  },
  cancelLoadingBtn: {
    marginTop: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#89a48f",
    borderRadius: 5,
  },
  cancelLoadingText: {
    color: "#a3aab3",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  // === ESTILOS PARA BOTONES DE ACCIÓN (ATAQUE Y DASH) ===

  actionButtons: {
    flexDirection: "row",
    gap: 25,
    alignItems: "center",
  },

  // Wrapper del botón de acción (reemplaza a btn, btnAttack, btnDash)
  actionButtonWrapper: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    position: "relative",
    // Sombra exterior
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },

  // Imagen de fondo del botón
  actionButtonImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 37.5, // Para mantener la forma circular
  },

  // Estado presionado (animación)
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.92 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 3 },
  },

  // Efecto de brillo al presionar
  actionButtonShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 37.5,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopColor: "rgba(255, 255, 255, 0.4)",
    borderLeftColor: "rgba(255, 255, 255, 0.4)",
  },

  // Wrapper base para todos los botones de la cruceta
  dpadBtnWrapper: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },

  // Posiciones específicas de cada botón
  btnUpWrapper: {
    top: 0,
    left: 50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  btnDownWrapper: {
    bottom: 0,
    left: 50,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  btnLeftWrapper: {
    top: 50,
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  btnRightWrapper: {
    top: 50,
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  // Imagen de cada botón
  dpadBtnImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  // Estado presionado (animación)
  dpadBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.92 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
  },

  // Efecto de brillo al presionar
  dpadBtnShine: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    borderLeftColor: "rgba(255, 255, 255, 0.3)",
  },
});
