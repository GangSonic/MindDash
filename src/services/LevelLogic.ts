// LevelLogic.ts - Generador de niveles con respaldo
import axios from 'axios';
import { Dimensions } from 'react-native';
import { getServerURL, API_TIMEOUT } from './config';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = Math.max(width, height);
const SCREEN_HEIGHT = Math.min(width, height);

const API_URL = getServerURL();

export const LevelGenerator = {
  // Función para obtener el nivel desde la IA
  fetchAILevel: async (level: number, stats: any) => {
    console.log('LevelGenerator: Solicitando nivel', level);
    console.log('URL del servidor:', API_URL);

    try {
      const response = await axios.post(
        `${API_URL}/generate-level`,
        {
          level: level,
          stats: stats,
        },
        {
          timeout: API_TIMEOUT,
        }
      );

      console.log('LevelGenerator: Nivel recibido');
      
      // Validar que la respuesta tiene la estructura correcta
      if (!response.data.matrix || !response.data.enemies) {
        console.error('Respuesta del servidor incompleta');
        return null;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error('Servidor no disponible en:', API_URL);
        } else if (error.code === 'ETIMEDOUT') {
          console.error('Timeout - El servidor tardó mucho en responder');
        } else {
          console.error('Error de conexión:', error.message);
        }
      }
      return null;
    }
  },

  // Nivel de respaldo (fallback) en caso de que la IA falle
  generateLevel2Fallback: () => {
    console.log('Usando nivel de respaldo (fallback)');
    
    const map = Array(21)
      .fill(0)
      .map((_, y) =>
        Array(32)
          .fill(0)
          .map((_, x) => {
            // Bordes
            if (y === 0 || y === 20 || x === 0 || x === 31) return 1;
            // Algunos obstáculos aleatorios
            if (Math.random() > 0.85 && y > 2 && y < 18 && x > 2 && x < 29) return 1;
            return 0;
          })
      );

    return {
      map,
      spawn: { x: 1, y: 10 },
      portal: { x: 30, y: 10 },
      enemies: [
        { x: 200, y: 150, speed: 1.2, waypoints: [] },
        { x: 400, y: 200, speed: 1.0, waypoints: [] },
      ],
    };
  },
};

export default LevelGenerator;