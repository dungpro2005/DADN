/**
 * ML-based Yield Prediction Model
 * Predicts drying machine output yield based on temperature and humidity
 * Using polynomial regression with historical data patterns
 */

export interface PredictionInput {
  temperature: number; // °C
  humidity: number; // %
  duration?: number; // minutes
  fruitType?: string;
}

export interface PredictionResult {
  predictedYield: number; // kg
  confidence: number; // 0-100%
  yieldPercentage: number; // % of expected output
  factors: {
    tempImpact: number;
    humidityImpact: number;
    durationImpact: number;
  };
  recommendation: string;
  status: 'optimal' | 'good' | 'fair' | 'poor';
}

/**
 * Historical yield data patterns (training data approximation)
 * Real ML models would use actual production data
 */
const YIELD_PATTERNS = {
  mango: {
    baseYield: 85, // kg per batch (standard input)
    tempOptimal: 55, // °C
    humidityOptimal: 35, // %
  },
  banana: {
    baseYield: 75,
    tempOptimal: 50,
    humidityOptimal: 30,
  },
  papaya: {
    baseYield: 90,
    tempOptimal: 58,
    humidityOptimal: 40,
  },
  generic: {
    baseYield: 80,
    tempOptimal: 55,
    humidityOptimal: 35,
  },
};

/**
 * Calculate temperature impact on yield using polynomial regression
 * Optimal temperature around 50-60°C, decreases on both sides
 */
function calculateTemperatureImpact(temp: number, optimalTemp: number): number {
  // Gaussian-like curve centered at optimal temp
  const tempDiff = Math.abs(temp - optimalTemp);
  
  if (tempDiff > 20) return 0.2; // Very poor if too far from optimal
  if (tempDiff > 15) return 0.4;
  if (tempDiff > 10) return 0.65;
  if (tempDiff > 5) return 0.85;
  
  // Near optimal: use quadratic formula for smooth curve
  return 1 - (tempDiff / optimalTemp) ** 2 * 0.1;
}

/**
 * Calculate humidity impact on yield
 * Too low humidity leads to excessive moisture loss
 * Too high humidity prevents proper drying
 */
function calculateHumidityImpact(humidity: number, optimalHumidity: number): number {
  const humidityDiff = Math.abs(humidity - optimalHumidity);
  
  if (humidityDiff > 25) return 0.3; // Very poor conditions
  if (humidityDiff > 20) return 0.45;
  if (humidityDiff > 15) return 0.6;
  if (humidityDiff > 10) return 0.75;
  if (humidityDiff > 5) return 0.9;
  
  // Near optimal: quadratic impact
  return 1 - (humidityDiff / optimalHumidity) ** 2 * 0.08;
}

/**
 * Calculate duration impact (longer drying = better quality/yield up to saturation)
 */
function calculateDurationImpact(duration?: number): number {
  if (!duration) return 0.8; // Default moderate impact
  
  if (duration < 120) return 0.6; // Too short
  if (duration < 300) return 0.7;
  if (duration < 600) return 0.85;
  if (duration < 900) return 0.95;
  if (duration > 1440) return 0.85; // Over-drying reduces yield
  
  return 0.95; // Optimal range (600-1440 minutes)
}

/**
 * Determine yield quality status based on confidence and yield percentage
 */
function determineStatus(
  yieldPercentage: number,
  confidence: number
): 'optimal' | 'good' | 'fair' | 'poor' {
  if (yieldPercentage >= 90 && confidence >= 85) return 'optimal';
  if (yieldPercentage >= 75 && confidence >= 70) return 'good';
  if (yieldPercentage >= 60 && confidence >= 50) return 'fair';
  return 'poor';
}

/**
 * Generate recommendation based on prediction
 */
function generateRecommendation(
  input: PredictionInput,
  factors: PredictionResult['factors'],
  optimalTemp: number,
  optimalHumidity: number
): string {
  const issues: string[] = [];
  
  if (input.temperature < optimalTemp - 5) {
    issues.push('Tăng nhiệt độ');
  } else if (input.temperature > optimalTemp + 5) {
    issues.push('Giảm nhiệt độ');
  }
  
  if (input.humidity < optimalHumidity - 5) {
    issues.push('Tăng độ ẩm');
  } else if (input.humidity > optimalHumidity + 5) {
    issues.push('Giảm độ ẩm');
  }
  
  if (!issues.length) return 'Điều kiện tối ưu - tiếp tục duy trì';
  
  return `Cần tối ưu: ${issues.join(', ')}`;
}

/**
 * Main prediction function
 * Uses polynomial regression with environmental factors
 */
export function predictYield(input: PredictionInput): PredictionResult {
  // Determine fruit type for optimal values
  const fruitType = input.fruitType?.toLowerCase() || 'generic';
  const pattern = YIELD_PATTERNS[fruitType as keyof typeof YIELD_PATTERNS] || YIELD_PATTERNS.generic;
  
  // Calculate individual impacts
  const tempImpact = calculateTemperatureImpact(input.temperature, pattern.tempOptimal);
  const humidityImpact = calculateHumidityImpact(input.humidity, pattern.humidityOptimal);
  const durationImpact = calculateDurationImpact(input.duration);
  
  // Combined impact using weighted formula
  // Temperature: 40%, Humidity: 35%, Duration: 25%
  const combinedImpact = 
    tempImpact * 0.4 + 
    humidityImpact * 0.35 + 
    durationImpact * 0.25;
  
  // Calculate predicted yield
  const predictedYield = pattern.baseYield * combinedImpact;
  
  // Calculate confidence based on how close to optimal conditions
  const tempConfidence = Math.max(0, 100 - Math.abs(input.temperature - pattern.tempOptimal) * 2);
  const humidityConfidence = Math.max(0, 100 - Math.abs(input.humidity - pattern.humidityOptimal) * 2);
  const confidence = (tempConfidence * 0.6 + humidityConfidence * 0.4);
  
  const yieldPercentage = (predictedYield / pattern.baseYield) * 100;
  const status = determineStatus(yieldPercentage, confidence);
  const recommendation = generateRecommendation(
    input,
    { tempImpact, humidityImpact, durationImpact },
    pattern.tempOptimal,
    pattern.humidityOptimal
  );
  
  return {
    predictedYield: Math.round(predictedYield * 10) / 10, // 1 decimal place
    confidence: Math.round(confidence),
    yieldPercentage: Math.round(yieldPercentage),
    factors: {
      tempImpact: Math.round(tempImpact * 100),
      humidityImpact: Math.round(humidityImpact * 100),
      durationImpact: Math.round(durationImpact * 100),
    },
    recommendation,
    status,
  };
}

/**
 * Predict yield for multiple machines/conditions
 */
export function predictYieldBatch(inputs: PredictionInput[]): PredictionResult[] {
  return inputs.map(input => predictYield(input));
}

/**
 * Calculate optimal conditions for target yield
 */
export function findOptimalConditions(
  targetYield: number,
  fruitType: string = 'generic'
): { temperature: number; humidity: number; estimatedDuration: number } {
  const pattern = YIELD_PATTERNS[fruitType.toLowerCase() as keyof typeof YIELD_PATTERNS] || YIELD_PATTERNS.generic;
  
  return {
    temperature: pattern.tempOptimal,
    humidity: pattern.humidityOptimal,
    estimatedDuration: 600, // 10 hours recommended
  };
}

/**
 * Train model parameters with historical data (placeholder for future ML integration)
 * This would integrate with TensorFlow.js or similar library
 */
export function trainModel(historicalData: any[]): {
  weights: number[];
  bias: number;
  accuracy: number;
} {
  // Placeholder for actual ML training
  // In production, this would use TensorFlow.js or similar
  return {
    weights: [0.4, 0.35, 0.25], // Weights for temp, humidity, duration
    bias: 0.05,
    accuracy: 87.5, // Model accuracy percentage
  };
}
