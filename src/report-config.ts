export interface ReportConfig {
  id: string;
  testSuite: string;
  tests: ReportConfigTest[];
}

export interface ReportConfigTest {
  pair: {
    fileName: string;
    label: string;
    reference: string;
    test: string;
    diffImage?: string;
    error?: string;
    url?: string;
  };
  status: 'pass' | 'fail';
}
