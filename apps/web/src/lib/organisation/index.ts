// Organisation module exports
export * from './types';
export {
  getCompany,
  getCompanyByCode,
  getUserCompany,
  createCompany,
  updateCompany,
  addCompanyAdmin,
  linkEmployeeToCompany,
  removeEmployeeFromCompany,
  getCompanyEmployees,
  getTeamProgress,
  isCompanyAdmin,
} from './service';

// SETA/Skills Development Act export
export {
  generateSetaExport,
  getSetaReportSummary,
} from './seta-export';
export type {
  SetaReportRow,
  SetaExportResult,
  SetaExportOptions,
} from './seta-export';
