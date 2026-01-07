/**
 * Content Module - AMU Platform
 *
 * Exports for course content loading from the amu-content repository.
 *
 * "Ubuntu - I am because we are"
 */

// Types
export * from './types';

// Content loaders
export {
  // Module content
  loadModuleMetadata,
  loadModuleCompetencies,
  loadCaseStudy,
  loadFacilitatorPlaybook,
  loadDiscoveryQuestions,
  loadScaffoldingStrategies,
  loadCommonMisconceptions,
  loadFullModuleContent,
  refreshModuleContent,
  // Email templates
  loadEmailTemplate,
  loadEmailTemplateBody,
  // UI text
  loadUIMessages,
  // Cache management
  clearContentCache,
  clearCacheEntry,
  // Webhook handler
  handleContentSyncWebhook,
} from './loader';
