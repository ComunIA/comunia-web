import {
  Flex,
  Box,
  Input,
  Slider,
  Tooltip,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { MultiValue, Select } from 'chakra-react-select';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Chat from 'components/Chat';
import SplitPane, { Pane, SashContent } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import { Report, mappedKeywords, transformListToObject } from 'utils/constants';
import { Map } from 'components/Map';
import _ from 'lodash';
import { ReportInfo } from 'components/reportInfo';

export default function MapReportsPage() {
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [_problem, _setProblem] = useState<string>('');
  const [problem, setProblem] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(2);
  const [typeData, setTypeData] = useState<string>('comunitario');
  const [percentage, setPercentage] = useState<number>(0.5);
  const [sizes, setSizes] = useState<any[]>(['40%', '50%']);
  const [keywordsData, setKeywords] = useState<MultiValue<{ label: string; value: string }>>([]);
  const keywords = useMemo(() => keywordsData.map((x) => x.value), [keywordsData]);
  const Sash = SashContent as any;
  let selectedReport: any = null;
  if (selectedReports.length != 0) {
    selectedReport = transformListToObject(selectedReports);
    selectedReport.latitude = _.mean(selectedReport.latitude);
    selectedReport.longitude = _.mean(selectedReport.longitude);
    selectedReport.num_reports = _.sum(selectedReport.num_reports);
    selectedReport.alias = _.flatMap(selectedReport.alias);
    selectedReport.scores = _.mean(selectedReport.scores);
    selectedReport.score = _.mean(selectedReport.score);
    selectedReport.cluster = selectedReport.cluster[0];
    selectedReport.complaint = selectedReport.complaint[0];
    selectedReport.date = selectedReport.date[0];
    selectedReport.location = _.flatMap(selectedReport.location);
    selectedReport.neighborhood = _.flatMap(selectedReport.neighborhood);
    selectedReport.sector = _.flatMap(selectedReport.sector);
    selectedReport.report_id = _.flatMap(selectedReport.report_id);
    console.log('Despues', selectedReport);
  }
  useEffect(() => {
    const timeOutId = setTimeout(() => setProblem(_problem), 500);
    return () => clearTimeout(timeOutId);
  }, [_problem]);

  return (
    <Flex style={{ height: '100vh' }}>
      <SplitPane
        split="vertical"
        sizes={sizes}
        onChange={setSizes}
        sashRender={() => <Sash style={{ backgroundColor: 'rgba(0,0,0,0.1)', width: '2px' }} />}
        style={{ height: '100%' }}
      >
        <Pane>
          <Box overflowY="auto" style={{ height: '100%' }}>
            <Accordion defaultIndex={[0]}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      Filtrado
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel p={4} pt={0}>
                  <RadioGroup onChange={setTypeData} value={typeData}>
                    <Stack direction="row">
                      <Radio value="ciudadano">Vista Ciudadana</Radio>
                      <Radio value="comunitario">Vista Comunitaria</Radio>
                    </Stack>
                  </RadioGroup>
                  <FormControl>
                    <FormLabel>Agrupaciones</FormLabel>
                    <Slider
                      defaultValue={2}
                      min={1}
                      max={10}
                      step={0.5}
                      aria-label="slider-ex-6"
                      onChange={setThreshold}
                    >
                      <SliderTrack bg="red.100">
                        <Box position="relative" right={10} />
                        <SliderFilledTrack bg="tomato" />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        bg="teal.500"
                        color="white"
                        placement="top"
                        label={threshold}
                      >
                        <SliderThumb />
                      </Tooltip>
                    </Slider>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Palabras Clave</FormLabel>
                    <Select
                      isMulti
                      placeholder="Palabras Clave"
                      value={keywordsData}
                      onChange={setKeywords}
                      options={mappedKeywords}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Problematica</FormLabel>
                    <Input
                      placeholder="Problematica"
                      value={_problem}
                      onChange={(e) => _setProblem(e.target.value)}
                      w="100%"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Limite Match</FormLabel>
                    <Slider
                      defaultValue={0.5}
                      min={0}
                      max={1}
                      step={0.1}
                      aria-label="slider-ex-6"
                      onChange={setPercentage}
                    >
                      <SliderTrack bg="red.100">
                        <Box position="relative" right={10} />
                        <SliderFilledTrack bg="tomato" />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        bg="teal.500"
                        color="white"
                        placement="top"
                        label={percentage}
                      >
                        <SliderThumb />
                      </Tooltip>
                    </Slider>
                  </FormControl>
                </AccordionPanel>
              </AccordionItem>
              {selectedReport ? <ReportItems report={selectedReport} /> : null}
            </Accordion>
          </Box>
        </Pane>
        <Pane>
          <Map
            keywords={keywords}
            threshold={threshold}
            percentage={percentage}
            problem={problem}
            typeData={typeData}
            onSelect={setSelectedReports}
          />
        </Pane>
      </SplitPane>
    </Flex>
  );
}

export function ReportItems({ report }: { report: Report }) {
  return (
    <Fragment>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Reporte
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel p={2} pt={0}>
          <ReportInfo report={report} />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem h="500">
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Chat
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel h="500">
          <Chat reportIds={report.report_id} />
        </AccordionPanel>
      </AccordionItem>
    </Fragment>
  );
}
