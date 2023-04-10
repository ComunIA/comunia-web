import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

export const allKeywords = [
  'Luminarias',
  'Semáforo',
  'Rondines',
  'Violación al reglamento de tránsito',
  'Contaminación',
  'Baches',
  'Cables',
  'Banqueta',
  'Rotura',
  'Información de accidentes víales',
  'Pintura vial',
  'Estacionamiento',
  'Postes',
  'Quejas',
  'Parquímetros',
  'Licencias',
  'Multas',
  'Movilidad',
  'Parabuses',
  'Vehículos dañados por baches',
  'Banquetas',
  'Waze',
  'Puentes',
];
export const mappedKeywords = allKeywords.map((x) => ({ value: x, label: x }));

export function normalize(numbers: number[]) {
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  const normalized = numbers.map((num: number) => num - min);

  const range = max - min;
  if (range === 0) {
    return normalized.map(() => 0);
  }
  return normalized.map((num: number) => num / range);
}

export const pollyClient = new PollyClient({
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_POLLY_ACCESS_KEY as string,
    secretAccessKey: process.env.NEXT_PUBLIC_POLLY_SECRET_KEY as string,
  },
  region: process.env.NEXT_PUBLIC_POLLY_REGION,
});

export const speak = async (message: string) => {
  try {
    const input = {
      OutputFormat: 'mp3',
      Text: message,
      VoiceId: 'Mia',
    };
    const command = new SynthesizeSpeechCommand(input);
    const data = await pollyClient.send(command);
    if (data.AudioStream) {
      const bytes = await data.AudioStream.transformToByteArray();
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = webkitURL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    }
  } catch (error) {
    // console.error(error);
  }
};

export function transformListToObject(list: any[]): { [id: string]: any[] } {
  let result: { [id: string]: any[] } = {};
  list.forEach((obj: any) => {
    Object.keys(obj).forEach(function (key: string) {
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(obj[key]);
    });
  });
  return result;
}

export interface Report {
  latitude: number;
  longitude: number;
  num_reports: number;
  score: number;
  scores: number[];
  alias: string[];
  cluster: string;
  complaint: string;
  date: string;
  location: string;
  neighborhood: string;
  report_id: string[];
  sector: string;
}

export interface Complaint {
  latitude: number;
  longitude: number;
  num_reports: number;
  score: number | undefined;
  alias: string;
  cluster: string;
  complaint: string;
  date: string;
  location: string;
  neighborhood: string;
  report_id: string;
  sector: string;
}
