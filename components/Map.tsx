import { Config, Data, Layout } from 'plotly.js';
import { useEffect, useRef, useState } from 'react';
import { Complaint, Report } from 'utils/constants';
import { getComplaints, getReports } from 'api/Api';
import _ from 'lodash';
import { useCookies } from 'react-cookie';
import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const initConfig = {
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  responsive: true,
};
const location = [25.656333648837215, -100.37167898604652];
const initLayout: Partial<Layout> = {
  hovermode: 'closest',
  hoverlabel: { bgcolor: '#FFF' },
  mapbox: {
    style: 'streets',
    center: {
      lat: location[0],
      lon: location[1],
    },
    zoom: 12,
  },
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
    pad: 0,
  },
  legend: {
    x: 0,
    y: 1,
  },
};

const toDataReports = (reports: Report[], problem: string): Data => {
  const latitudes = reports.map((x) => x.latitude).flat();
  const longitudes = reports.map((x) => x.longitude).flat();
  let sizeReports = reports.map((x) => x.num_reports);
  // sizeReports = normalize(sizeReports);
  sizeReports = sizeReports.map((x) => x / 1.2 + 5);
  const scores = reports.map((x) => x.score || 0.5 * 20);
  const reportsData = reports.map((x) => ({ ...x, score: (x.score || 0.5) * 100 }));
  return {
    name: 'Comunitarios',
    type: 'scattermapbox',
    lat: latitudes,
    lon: longitudes,
    hovertemplate: `
    <b>Numero de Reportes:</b> %{text.num_reports}
    <br><b>Match:</b> %{text.score:.0f}%
    <br><b>Palabras Clave:</b> %{text.keywords}
    `,
    text: reportsData as any,
    showlegend: true,
    mode: 'markers',
    marker: {
      color: scores,
      opacity: 0.9,
      size: sizeReports,
      colorscale: [
        [0, 'yellow'],
        [1, 'red'],
      ],
    },
  };
};
const toDataComplaints = (complaints: Complaint[], problem: string): any => {
  const latitudes = complaints.map((x) => x.latitude);
  const longitudes = complaints.map((x) => x.longitude);
  const scores = complaints.map((x) => x.score || 0.5);
  const scoresVisualized = scores.map((x) => x * 25);
  const complaintsData = complaints.map((x) => ({ ...x, score: x.score || 0.5 * 100 }));
  return {
    name: 'Cuidadanos',
    type: 'densitymapbox',
    radius: scoresVisualized,
    hovertemplate: `
    <b>Folio:</b> %{text.report_id}
    <br><b>Match:</b> %{text.score:.0f}%
    <br><b>Colonia:</b> %{text.neighborhood}
    `,
    text: complaintsData as any,
    legendgroup: '',
    lat: latitudes,
    lon: longitudes,
    showlegend: true,
    mode: 'markers',
    marker: {
      color: scores,
      opacity: scores,
      size: scoresVisualized,
      colorscale: [
        [0, 'yellow'],
        [1, 'red'],
      ],
    },
  };
};

const useDidMountEffect = (func: any, deps: any) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};

export default useDidMountEffect;

export function Map({
  keywords,
  problem,
  threshold,
  percentage,
  typeData,
  onSelect,
}: {
  keywords: string[];
  problem: string;
  threshold: number;
  percentage: number;
  typeData: string;
  onSelect: (selected: Report[]) => void;
}) {
  const [cookies, setCookie] = useCookies(['api_key']);
  const [info, setInfo] = useState<{
    data: Data[];
    layout: Partial<Layout>;
    config: Partial<Config>;
  }>({
    data: [],
    layout: initLayout,
    config: initConfig,
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredInfo, setFilteredInfo] = useState<{ complaints: Complaint[]; reports: Report[] }>({
    complaints: [],
    reports: [],
  });
  function getData(complaints: Complaint[], reports: Report[]): Partial<Data>[] {
    const data =
      typeData == 'ciudadano'
        ? toDataComplaints(complaints, problem)
        : toDataReports(reports, problem);
    return [data];
  }

  async function fetchData() {
    const newComplaints = await getComplaints(problem, keywords, cookies.api_key);
    const newReports = await getReports(problem, keywords, threshold, cookies.api_key);
    setComplaints(newComplaints);
    setReports(newReports);
    const filteredComplaints = newComplaints.filter((x) => !x.score || x.score > percentage);
    const filteredReports = newReports.filter((x) => !x.score || x.score > percentage);
    setFilteredInfo({ complaints: filteredComplaints, reports: filteredReports });
    setInfo({
      data: getData(filteredComplaints, filteredReports),
      config: initConfig,
      layout: initLayout,
    });
  }

  useDidMountEffect(() => {
    fetchData();
  }, [keywords, threshold, typeData, problem]);

  useDidMountEffect(() => {
    if (complaints.length == 0 || reports.length == 0) return;
    const filteredComplaints = complaints.filter((x) => !x.score || x.score > percentage);
    const filteredReports = reports.filter((x) => !x.score || x.score > percentage);
    setFilteredInfo({ complaints: filteredComplaints, reports: filteredReports });
    setInfo({
      data: getData(filteredComplaints, filteredReports),
      config: initConfig,
      layout: initLayout,
    });
  }, [percentage]);

  const clickEvent = async (event: any) => {
    console.log(event.points);
    console.log(reports);
    const selectedReports = event.points.map((x: any) => reports[x.pointIndex]);
    console.log(selectedReports);
    onSelect(selectedReports);
  };

  return (
    <Plot
      data={info.data}
      layout={info.layout}
      config={info.config}
      onClick={clickEvent}
      onSelected={clickEvent}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
