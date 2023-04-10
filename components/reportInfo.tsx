import { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

import { generateReport } from 'api/Api';
import { Report } from 'utils/constants';
import { useCookies } from 'react-cookie';

export function ReportInfo({ report }: { report: Report }) {
  const [cookies, setCookie] = useCookies(['api_key']);
  const [reportSummary, setReportSummary] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setReportSummary(null);
      const newReport = await generateReport(report.report_id, cookies.api_key);
      setReportSummary(newReport);
    }
    fetchData();
  }, [report]);

  return (
    <Box m="2">
      <Text>
        <b>Reportes Ciudadanos: </b>
        {report.num_reports}
      </Text>
      <Text>
        <b>Palabras clave: </b>
        {report.keywords.join(', ')}
      </Text>
      {report.score ? (
        <Text>
          <b>Match: </b>
          {(report.score * 100).toFixed(0)}%
        </Text>
      ) : null}
      {reportSummary ? (
        <Text>
          <b>Informe Ciudadano: </b>
          <br />
          <span style={{ whiteSpace: 'pre-line' }}>{reportSummary}</span>
        </Text>
      ) : (
        <Spinner />
      )}
    </Box>
  );
}
