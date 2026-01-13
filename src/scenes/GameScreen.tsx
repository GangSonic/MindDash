// src/scenes/GameScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Phaser from 'phaser';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Config Phaser para móvil
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT * 0.8,
      parent: 'game-container',
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View id="game-container" style={styles.gameContainer} />
    </View>
  );
}

function preload(this: Phaser.Scene) {
  // Cargar sprites (después)
  this.load.image('tiles', 'assets/sprites/tiles.png');
}

function create(this: Phaser.Scene) {
  // Jugador básico (círculo por ahora)
  const player = this.add.circle(100, 100, 20, 0xff0000);
  player.setInteractive();
}

function update(this: Phaser.Scene) {
  // Lógica juego
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gameContainer: { flex: 1 },
});

export type { };
