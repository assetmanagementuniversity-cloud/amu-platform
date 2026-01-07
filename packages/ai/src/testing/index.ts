/**
 * AI Testing Module - AMU Platform
 *
 * AI-as-Learner testing system for content quality validation.
 *
 * "Ubuntu - I am because we are"
 */

// Personas
export {
  type LearnerPersona,
  type PersonaId,
  personas,
  personaList,
  getPersona,
  getPersonasByCharacteristic,
  getRandomPersonaSample,
  generatePersonaSystemPrompt,
  nomvulaPersona,
  jamesPersona,
  fatimaPersona,
  siphoPersona,
  priyaPersona,
  mandlaPersona,
} from './personas';

// Simulator
export {
  type SimulationConfig,
  type SimulationMessage,
  type SimulationResult,
  type SimulationMetrics,
  type ContentIssue,
  AILearnerSimulator,
  createSimulator,
} from './simulator';
