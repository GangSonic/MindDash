import axios, { AxiosError } from 'axios';
import { getServerURL, API_TIMEOUT } from './config';

const API_URL = getServerURL();

interface LevelStats {
  kills: number;
  dashes: number;
  time: number;
}

interface AILevelResponse {
  matrix: number[][];
  spawn: { x: number; y: number };
  portal: { x: number; y: number };
  enemies: Array<{
    x: number;
    y: number;
    speed: number;
    waypoints?: Array<{ x: number; y: number }>;
  }>;
}

export const generateAILevel = async (
  currentLevel: number,
  stats: LevelStats
): Promise<AILevelResponse | null> => {
  console.log('Solicitando nivel', currentLevel, 'al servidor:', API_URL);
  console.log('Stats del jugador:', stats);

  try {
    const response = await axios.post<AILevelResponse>(
      `${API_URL}/generate-level`,
      {
        level: currentLevel,
        stats: stats,
      },
      {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Nivel recibido exitosamente');
    console.log('Datos:', {
      matrixSize: `${response.data.matrix.length}x${response.data.matrix[0]?.length}`,
      enemyCount: response.data.enemies.length,
      spawn: response.data.spawn,
      portal: response.data.portal,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        console.error('No se pudo conectar al servidor. ¿Está corriendo?');
        console.error('Verifica que el servidor esté en:', API_URL);
      } else if (axiosError.code === 'ETIMEDOUT') {
        console.error('El servidor tardó demasiado en responder');
      } else if (axiosError.response) {
        console.error('El servidor respondió con error:', axiosError.response.status);
        console.error('Mensaje:', axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No se recibió respuesta del servidor');
        console.error('URL intentada:', API_URL);
      }
    } else {
      console.error('Error desconocido:', error);
    }

    return null;
  }
};

// Función auxiliar para verificar la conexión con el servidor
export const testServerConnection = async (): Promise<boolean> => {
  try {
    console.log('Probando conexión con:', API_URL);
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('Servidor disponible');
    return true;
  } catch (error) {
    console.error('Servidor no disponible');
    return false;
  }
};