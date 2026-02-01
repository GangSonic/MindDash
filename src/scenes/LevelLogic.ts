import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

export const LevelGenerator = {
  generateLevel2: () => {
    // Mapa: Bordes con paredes (1) y centro vacío (0)
    const map = Array(21).fill(0).map((_, y) => 
      Array(32).fill(0).map((_, x) => {
        if (y === 0 || y === 20 || x === 0 || x === 31) return 1;
        if (x > 12 && x < 18 && y === 10) return 1; // Un pequeño pilar central
        return 0;
      })
    );

    const enemies = {
      bossEnemy: {
        body: { 
          position: { x: 100, y: 100 }, 
          waypoints: [], 
          nextPointIndex: 0,
          speed: 0.8, 
          health: 15, 
          radius: 25, 
          detectionRange: 500 
        }
      }
    };

    return { map, enemies };
  }
};
export default LevelGenerator;