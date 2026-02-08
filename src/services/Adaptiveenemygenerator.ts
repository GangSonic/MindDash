// AdaptiveEnemyGenerator.ts

///IMPORTANTE 
//Recuerda cambiar el api key a tu propia clave de Gemini en el archivo .env para que funcione 
// la generación con IA. Si no lo haces, el sistema usará reglas simples como respaldo, 
// pero no aprovechará el poder de la IA para crear enemigos adaptativos según el comportamiento del 
// jugador.

// Genera enemigos adaptativos basados en el comportamiento del jugador

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';

interface PlayerStats {
  time: number;    // Segundos que tardó
  kills: number;   // Enemigos eliminados
  dashes: number;  // Veces que usó dash
}

interface Enemy {
  position: { x: number; y: number };
  waypoints: Array<{ x: number; y: number }>;
  speed: number;
  health: number;
  radius: number;
  detectionRange: number;
  nextPointIndex: number;
}

export const MAP_BOUNDS = {
  minX: 50,
  maxX: 850,
  minY: 50,
  maxY: 450,
};

function generateSafeWaypoints(startX: number, startY: number): Array<{ x: number; y: number }> {
  const { minX, maxX, minY, maxY } = MAP_BOUNDS;
  const MARGIN = 120; // Margen de seguridad desde los bordes
  
  // Área segura
  const safeMinX = minX + MARGIN;
  const safeMaxX = maxX - MARGIN;
  const safeMinY = minY + MARGIN;
  const safeMaxY = maxY - MARGIN;

  // Clampear posición inicial
  const safeStartX = Math.max(safeMinX, Math.min(safeMaxX, startX));
  const safeStartY = Math.max(safeMinY, Math.min(safeMaxY, startY));

  // Tamaño del rectángulo de patrulla (más grande y aleatorio)
  const sizeX = 80 + Math.random() * 120; // Entre 100 y 300
  const sizeY = 60 + Math.random() * 100;  // Entre 80 y 230

  // Calcular waypoints asegurando que NO salgan del área segura
  const waypoints = [
    { x: safeStartX, y: safeStartY },
    { 
      x: Math.min(safeStartX + sizeX, safeMaxX), 
      y: safeStartY 
    },
    { 
      x: Math.min(safeStartX + sizeX, safeMaxX), 
      y: Math.min(safeStartY + sizeY, safeMaxY) 
    },
    { 
      x: safeStartX, 
      y: Math.min(safeStartY + sizeY, safeMaxY) 
    },
  ];

  return waypoints;
}

export const AdaptiveEnemyGenerator = {
  /**
   * Genera enemigos usando IA de Gemini
   */
  async generateWithAI(level: number, stats: PlayerStats): Promise<Enemy[] | null> {
    console.log('\n=== GENERADOR DE ENEMIGOS CON IA ===');
    console.log('Stats del jugador:');
    console.log(`   Tiempo: ${stats.time}s`);
    console.log(`   Kills: ${stats.kills}`);
    console.log(`   Dashes: ${stats.dashes}`);

    const prompt = `Eres un diseñador de niveles para un juego tipo PAC-MAN. 
Genera enemigos adaptativos según el comportamiento del jugador.

ESTADÍSTICAS DEL JUGADOR (Nivel ${level - 1}):
- Tiempo completado: ${stats.time} segundos
- Enemigos eliminados: ${stats.kills}
- Dashes usados: ${stats.dashes}

REGLAS DE GENERACIÓN:
1. Si tiempo < 30s → MÁS enemigos (5-6) y MÁS velocidad (1.4-1.6)
2. Si tiempo > 60s → MENOS enemigos (2-3) y MENOS velocidad (0.9-1.1)
3. Si kills > 2 → MÁS enemigos (agregar 1-2 extra)
4. Si dashes > 5 → Enemigos MÁS rápidos (agregar +0.3 a velocidad)
5. 5. El número de enemigos debe escalar según el desempeño del jugador.
6. No generar más de 15 enemigos en una sola sala.
7. Si el jugador es extremadamente hábil, aumentar dificultad con velocidad y patrones, no solo cantidad.
9. La velocidad debe escalar según la habilidad del jugador.
10. En niveles bajos, velocidades cercanas a 1.0.
11. En niveles altos, aumenta la velocidad gradualmente.
12. Prioriza aumentar complejidad de patrones antes que valores extremos.

ÁREA DEL MAPA:
- X: entre 130 y 766 (NUNCA menos de 130, NUNCA más de 766)
- Y: entre 130 y 458 (NUNCA menos de 130, NUNCA más de 458)
FORMATO DE SALIDA (JSON PURO, SIN markdown):
{
  "enemies": [
    {
      "x": 250,
      "y": 180,
      "speed": 1.3,
      "waypoints": [
        {"x": 250, "y": 180},
        {"x": 350, "y": 180},
        {"x": 350, "y": 280},
        {"x": 250, "y": 280}
      ]
    }
  ],
  "reason": "Jugador muy rápido, aumentando dificultad"
}

IMPORTANTE:
- Responde ÚNICAMENTE con JSON válido
- No incluyas texto adicional
- No cortes la respuesta
- Si no puedes completar el JSON, responde:
{ "enemies": [], "reason": "generation_failed" } 
- Solo genera las posiciones X, Y y velocidad
- NO generes waypoints (el sistema los creará automáticamente)
- Las coordenadas X deben estar entre 150-750
- Las coordenadas Y deben estar entre 150-450
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error('Error de Gemini:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Respuesta vacía de Gemini');
        return null;
      }

      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json|```/g, '').trim();

      let aiResponse;
        try {
        aiResponse = JSON.parse(text);
        } catch {
        console.error('JSON inválido devuelto por IA:', text);
        return null;
        }

      //Limitador suave de seguridad
    const MAX_ENEMIES = 15;

    ///velocidad de enemigo 
    const normalizeSpeed = (rawSpeed: number, level: number) => {
    const BASE = 1.0;
    const MAX_BOOST = Math.min(level * 0.15, 1.2); // límite suave
    const target = BASE + MAX_BOOST;

  // clamp suave
  return Math.max(0.6, Math.min(target, rawSpeed));
};
    if (aiResponse.enemies.length > MAX_ENEMIES) {
    console.warn(`IA generó ${aiResponse.enemies.length} enemigos, limitando a ${MAX_ENEMIES}`);
    aiResponse.enemies = aiResponse.enemies.slice(0, MAX_ENEMIES);
    }
      
      console.log('IA respondió:', aiResponse.reason);
      console.log(`Generados: ${aiResponse.enemies.length} enemigos`);

      // Convertir al formato del juego
      const enemies: Enemy[] = aiResponse.enemies.map((e: any) => ({
        position: { x: e.x, y: e.y },
        waypoints: generateSafeWaypoints(e.x, e.y),
        speed: normalizeSpeed(e.speed, level),
        health: 3,
        radius: 10,
        detectionRange: Math.max(120, 200 - normalizeSpeed(e.speed, level) * 30),
        nextPointIndex: 0,
      }));

      return enemies;

    } catch (error: any) {
      console.error('Error con IA:', error.message);
      return null;
    }
  },

  /**
   * Genera enemigos usando REGLAS (sin IA, como fallback)
   */
  generateWithRules(stats: PlayerStats): Enemy[] {
    console.log('Generando enemigos con REGLAS (sin IA)');

    let enemyCount = 3; // Base
    let baseSpeed = 1.2; // Base

    // REGLA 1: Tiempo
    if (stats.time < 30) {
    enemyCount += 2;
      baseSpeed += 0.3;
    } else if (stats.time > 60) {
      enemyCount -= 1;
      baseSpeed -= 0.2;
    }

    // REGLA 2: Kills
    if (stats.kills > 2) {
      enemyCount += 2;
    } else if (stats.kills === 0) {
      enemyCount -= 1;
    }

    // REGLA 3: Dashes
    if (stats.dashes > 5) {
      baseSpeed += 0.4;
    }

    // Límites
    enemyCount = Math.max(2, Math.min(6, enemyCount));
    baseSpeed = Math.max(0.8, Math.min(1.8, baseSpeed));

    console.log(`Resultado: ${enemyCount} enemigos a velocidad ${baseSpeed.toFixed(1)}`);

    // Posiciones seguras (lejos de paredes)
    const spawnPoints = [
      { x: 200, y: 150 },
        { x: 400, y: 200 },
      { x: 600, y: 180 },
      { x: 300, y: 350 },
      { x: 500, y: 300 },
      { x: 700, y: 250 },
      { x: 250, y: 400 },
      { x: 550, y: 420 },
    ];

    const enemies: Enemy[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const spawn = spawnPoints[i % spawnPoints.length];
      
      enemies.push({
        position: { x: spawn.x, y: spawn.y },
        waypoints: generateSafeWaypoints(spawn.x, spawn.y),
        speed: baseSpeed + (Math.random() * 0.2 - 0.1), // Variación
        health: 3,
        radius: 10,
        detectionRange: 150,
        nextPointIndex: 0,
      });
    }

    return enemies;
  },

  /**
   * Función principal: Intenta IA, si falla usa reglas
   */
  async generate(level: number, stats: PlayerStats): Promise<Enemy[]> {
    // Si no pusiste la API key, usa solo reglas
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim().length === 0) {
    console.log('API key no configurada, usando solo reglas');
    return this.generateWithRules(stats);
    }

    // Intenta con IA
    const aiEnemies = await this.generateWithAI(level, stats);
    
    if (aiEnemies && aiEnemies.length > 0) {
      return aiEnemies;
    }

    // Si falla, usa reglas
    console.log('IA falló, usando reglas de respaldo');
    return this.generateWithRules(stats);
  },
};

export default AdaptiveEnemyGenerator;