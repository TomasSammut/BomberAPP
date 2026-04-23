import { UserProfile, TestScore, SessionRecord } from '../types';
import { oppositions, allScoringCriteria } from '../scoring';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const FALLBACK_API_KEY = (import.meta.env as any).VITE_GEMINI_API_KEY || '';

export async function generateTrainingPlan(
  apiKey: string | null,
  profile: UserProfile,
  currentStats: TestScore[],
  history: SessionRecord[]
) {
  const finalApiKey = (apiKey && apiKey.length > 5) ? apiKey : FALLBACK_API_KEY;
  const opposition = oppositions.find(o => o.id === profile.activeOppositionId) || oppositions[0];

  const birthDate = new Date(profile.physicalData?.birthDate || '1995-01-01');
  const age = new Date().getFullYear() - birthDate.getFullYear();

  // Cálculo de semanas hasta examen (dinámico si existe examDate en el perfil)
  let weeksUntilExam = 24;
  if (profile.examDate) {
    const examDate = new Date(profile.examDate);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks > 0) weeksUntilExam = diffWeeks;
  }

  // Identificar debilidad principal
  const sortedStats = [...currentStats].sort((a, b) => a.score - b.score);
  const weakestTest = sortedStats.length > 0 ? sortedStats[0] : null;

  // Calcular tendencia de fatiga (RPE)
  const recentWorkoutsHistory = history.filter(h => h.type === 'workout' && h.rpe);
  const avgRPE = recentWorkoutsHistory.length > 0
    ? recentWorkoutsHistory.slice(0, 5).reduce((acc, h) => acc + (h.rpe || 0), 0) / Math.min(5, recentWorkoutsHistory.length)
    : 0;

  const statsContext = currentStats.length > 0 ? currentStats.map(s => {
    const criteria = allScoringCriteria[opposition.scoringTable][s.name];
    const unitLabel = criteria?.unit === 'time' || criteria?.unit === 'towerTime' ? 'seg/min' : criteria?.unit;
    return `${s.name}: ${s.value} (${s.score} pts). Objetivo 10: ${criteria?.thresholds[profile.gender][0].value} ${unitLabel}`;
  }).join('\n') : 'Sin datos registrados aún (Nivel INICIACIÓN).';

  const recentWorkouts = history.length > 0 ? history
    .filter(h => h.type === 'workout')
    .slice(0, 10)
    .map(h => `- ${new Date(h.timestamp).toLocaleDateString()}: ${h.workoutTitle}. RPE ${h.rpe || 'N/A'}/10. Notas: ${h.notes || 'Sin notas'}`)
    .join('\n') : 'Sin historial reciente.';

  const selectedDays = profile.availability?.specificDays || [1, 2, 3, 4, 5];
  const daysMapping: Record<number, string> = {
    0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
  };

  // Mapeo técnico de fases para coherencia con UI
  const phaseMapping = {
    tapering: 'tapering',
    specific: 'transformation',
    base: 'base'
  };
  const suggestedPhase = weeksUntilExam <= 3 ? 'tapering' : (weeksUntilExam <= 10 ? 'specific' : 'base');
  const finalPhase = phaseMapping[suggestedPhase as keyof typeof phaseMapping];

  const prompt = `
Eres un preparador físico de ÉLITE (The Firefighter Coach) de bomberos en España.
Genera un PLAN DE ENTRENAMIENTO SEMANAL estricto en formato JSON puro. NO uses bloques de código markdown (json), devuelve únicamente el texto parseable.

DATOS DEL ASPIRANTE:
- Sexo: ${profile.gender === 'male' ? 'HOMBRE' : 'MUJER'}, Edad: ${age} años, Peso: ${profile.physicalData?.weight}kg.
- Oposición: ${opposition.name}.
- Semanas hasta examen: ${weeksUntilExam} (Fase: ${finalPhase.toUpperCase()}).
- Marcas Actuales:
${statsContext}
${weakestTest ? `- DEBILIDAD PRIORITARIA A MEJORAR: ${weakestTest.name} (${weakestTest.score} pts)` : ''}

CONTEXTO DE CARGA RECIENTE:
- RPE Medio (últimas 5 sesiones): ${avgRPE.toFixed(1)}/10.
- Historial:
${recentWorkouts}

REGLAS TÁCTICAS Y DE SEGURIDAD:
1. FOCO EN DEBILIDAD: Si una marca es < 6 puntos, aumenta la frecuencia de esa prueba técnica a 2-3 veces/semana.
2. GESTIÓN DE FATIGA:
   - Si RPE medio > 8.5: Esta semana debe ser de DESCARGA (Volumen -40%, Intensidad RPE 6). Explícalo en el focus.
   - Si RPE medio < 6: Aumenta la intensidad de las series principales para evitar estancamiento.
3. ESPECIFICIDAD: Usa ejercicios reales de la oposición (Cuerda, Press Banca, 3000m, 60m, Natación, Torre).
4. INSTALACIONES: Piscina (${profile.availability?.hasPool ? 'Disponible' : 'NO'}), Pista (${profile.availability?.hasTrack ? 'Disponible' : 'NO'}), Torre (${profile.availability?.hasTower ? 'Disponible' : 'NO'}).

REGLAS DE DISTRIBUCIÓN SEMANAL:
- El usuario SOLO entrena los días: ${selectedDays.map(d => daysMapping[d]).join(', ')}.
- Los días no mencionados deben tener el "type" configurado como "rest" o "active_recovery".

ESTRUCTURA JSON EXACTA REQUERIDA:
{
  "phase": "${finalPhase}",
  "weeklyFocus": "Frase motivacional y técnica centrada en el objetivo",
  "weeklySchedule": {
    "0": {
      "dayName": "Domingo",
      "type": "rest | athletics | strength | swimming | active_recovery",
      "title": "...",
      "warmup": ["ejercicio 1", "ejercicio 2"],
      "exercises": [
        {
          "name": "...",
          "sets": 4,
          "reps_or_time": "10 reps / 1:20 min",
          "rest": "90s",
          "coach_tip": "Consejo breve",
          "target": "Objetivo",
          "completed": false
        }
      ]
    },
    ... (incluir todos los días del 0 al 6)
  }
}

RESPONDE SOLO EL JSON SIN MARKDOWN.
`;



  let lastError: any = null;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${finalApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
              parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        let errorMsg = 'Error desconocido';
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.error?.message || errorMsg;
        } catch (e) { /* ignore */ }

        if (response.status === 503 || response.status === 429) {
          lastError = new Error(`API_${response.status}: ${errorMsg}`);
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        throw new Error(`API_${response.status}: ${errorMsg}`);
      }

      const data = await response.json();
      let content = data.candidates[0].content.parts[0].text;

      // Limpieza de Markdown si lo incluye
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(content);
    } catch (error: any) {
      lastError = error;
      if (attempt === maxRetries) {
        console.error('Plan Generation Error after retries:', error);
        throw new Error(`IA_ERROR: ${error.message}`);
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
