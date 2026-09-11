import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { UserLocation } from '../stores/location.store';

// Mapeamento padrão das 27 UFs para capitais e códigos IBGE
export const IBGE_MAP: Record<string, { uf: string; municipality: string; ibge_code: string }> = {
  AC: { uf: 'AC', municipality: 'Rio Branco', ibge_code: '1200401' },
  AL: { uf: 'AL', municipality: 'Maceió', ibge_code: '2704302' },
  AP: { uf: 'AP', municipality: 'Macapá', ibge_code: '1600309' },
  AM: { uf: 'AM', municipality: 'Manaus', ibge_code: '1302603' },
  BA: { uf: 'BA', municipality: 'Salvador', ibge_code: '2927408' },
  CE: { uf: 'CE', municipality: 'Fortaleza', ibge_code: '2304400' },
  DF: { uf: 'DF', municipality: 'Brasília', ibge_code: '5300108' },
  ES: { uf: 'ES', municipality: 'Vitória', ibge_code: '3205309' },
  GO: { uf: 'GO', municipality: 'Goiânia', ibge_code: '5208707' },
  MA: { uf: 'MA', municipality: 'São Luís', ibge_code: '2111300' },
  MT: { uf: 'MT', municipality: 'Cuiabá', ibge_code: '5103403' },
  MS: { uf: 'MS', municipality: 'Campo Grande', ibge_code: '5002704' },
  MG: { uf: 'MG', municipality: 'Belo Horizonte', ibge_code: '3106200' },
  PA: { uf: 'PA', municipality: 'Belém', ibge_code: '1501402' },
  PB: { uf: 'PB', municipality: 'João Pessoa', ibge_code: '2507507' },
  PR: { uf: 'PR', municipality: 'Curitiba', ibge_code: '4106902' },
  PE: { uf: 'PE', municipality: 'Recife', ibge_code: '2611606' },
  PI: { uf: 'PI', municipality: 'Teresina', ibge_code: '2211001' },
  RJ: { uf: 'RJ', municipality: 'Rio de Janeiro', ibge_code: '3304557' },
  RN: { uf: 'RN', municipality: 'Natal', ibge_code: '2408102' },
  RS: { uf: 'RS', municipality: 'Porto Alegre', ibge_code: '4314902' },
  RO: { uf: 'RO', municipality: 'Porto Velho', ibge_code: '1100205' },
  RR: { uf: 'RR', municipality: 'Boa Vista', ibge_code: '1400100' },
  SC: { uf: 'SC', municipality: 'Florianópolis', ibge_code: '4205407' },
  SP: { uf: 'SP', municipality: 'São Paulo', ibge_code: '3550308' },
  SE: { uf: 'SE', municipality: 'Aracaju', ibge_code: '2800308' },
  TO: { uf: 'TO', municipality: 'Palmas', ibge_code: '1721000' },
};

const STATE_NAME_TO_UF: Record<string, string> = {
  Acre: 'AC', Alagoas: 'AL', Amapá: 'AP', Amapa: 'AP',
  Amazonas: 'AM', Bahia: 'BA', Ceará: 'CE', Ceara: 'CE',
  'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Espirito Santo': 'ES',
  Goiás: 'GO', Goias: 'GO', Maranhão: 'MA', Maranhao: 'MA',
  'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
  Pará: 'PA', Para: 'PA', Paraíba: 'PB', Paraiba: 'PB',
  Paraná: 'PR', Parana: 'PR', Pernambuco: 'PE', Piauí: 'PI', Piaui: 'PI',
  'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
  Rondônia: 'RO', Rondonia: 'RO', Roraima: 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sao Paulo': 'SP', Sergipe: 'SE', Tocantins: 'TO',
};

const DEFAULT_LOCATION: UserLocation = IBGE_MAP.RJ!;

export async function requestUserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(new Error(err.message || 'Geolocalização não permitida pelo navegador')),
          { timeout: 8000, enableHighAccuracy: false }
        );
      } else {
        reject(new Error('Geolocalização não suportada neste navegador'));
      }
    });
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização não autorizada no dispositivo');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}

export async function resolveLocationFromCoords(lat: number, lng: number): Promise<UserLocation> {
  // 1. Tentar geocodificação nativa do Expo Location no dispositivo móvel
  if (Platform.OS !== 'web') {
    try {
      const geoResults = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geoResults && geoResults.length > 0) {
        const item = geoResults[0];
        const rawRegion = item.region || item.subregion || '';
        const city = item.city || item.subregion || item.district || 'Rio de Janeiro';
        let uf = (rawRegion.length === 2 ? rawRegion.toUpperCase() : STATE_NAME_TO_UF[rawRegion]) || '';

        if (!uf && item.isoCountryCode === 'BR' && rawRegion) {
          const match = Object.keys(STATE_NAME_TO_UF).find((k) =>
            rawRegion.toLowerCase().includes(k.toLowerCase())
          );
          if (match) uf = STATE_NAME_TO_UF[match];
        }

        if (uf && IBGE_MAP[uf]) {
          return {
            uf,
            municipality: city || IBGE_MAP[uf].municipality,
            ibge_code: IBGE_MAP[uf].ibge_code,
            latitude: lat,
            longitude: lng,
          };
        }
      }
    } catch {
      // Continua para o fallback via Nominatim
    }
  }

  // 2. Fallback via Nominatim OpenStreetMap
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'EleicoesProgressistas/2.2.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      const state = address.state || '';
      const city = address.city || address.town || address.municipality || address.village || 'Rio de Janeiro';

      let ufCode = (address['ISO3166-2-lvl4']?.split('-')[1] || '').toUpperCase();
      if (!ufCode || ufCode.length !== 2) {
        ufCode = STATE_NAME_TO_UF[state] || state.substring(0, 2).toUpperCase();
      }

      const mapped = IBGE_MAP[ufCode];
      if (mapped) {
        return {
          ...mapped,
          municipality: city || mapped.municipality,
          latitude: lat,
          longitude: lng,
        };
      }

      return {
        uf: ufCode.length === 2 && IBGE_MAP[ufCode] ? ufCode : 'RJ',
        municipality: city,
        ibge_code: '3304557',
        latitude: lat,
        longitude: lng,
      };
    }
  } catch {
    // Retorna fallback padrão
  }

  return { ...DEFAULT_LOCATION, latitude: lat, longitude: lng };
}

export async function fetchUserLocationWithConsent(): Promise<UserLocation> {
  const coords = await requestUserCoordinates();
  return resolveLocationFromCoords(coords.latitude, coords.longitude);
}

export interface Municipality {
  code: string;
  name: string;
}

export async function fetchMunicipalities(uf: string): Promise<Municipality[]> {
  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    );
    if (!response.ok) return [];
    const data = (await response.json()) as Array<{ id: number | string; nome: string }>;
    const list = data
      .map((m) => ({ code: String(m.id), name: m.nome }))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (list.length > 0) return list;
    return FALLBACK_MUNICIPALITIES[uf] ?? [];
  } catch {
    return FALLBACK_MUNICIPALITIES[uf] ?? [];
  }
}

// Lista de fallback (capitais + principais cidades) caso a API do IBGE esteja indisponível.
const FALLBACK_MUNICIPALITIES: Record<string, Municipality[]> = {
  AC: [{ code: '1200401', name: 'Rio Branco' }],
  AL: [{ code: '2704302', name: 'Maceió' }],
  AP: [{ code: '1600309', name: 'Macapá' }],
  AM: [{ code: '1302603', name: 'Manaus' }],
  BA: [
    { code: '2927408', name: 'Salvador' },
    { code: '2910800', name: 'Feira de Santana' },
    { code: '2926405', name: 'Vitória da Conquista' },
  ],
  CE: [
    { code: '2304400', name: 'Fortaleza' },
    { code: '2308709', name: 'Juazeiro do Norte' },
    { code: '2310804', name: 'Sobral' },
  ],
  DF: [{ code: '5300108', name: 'Brasília' }],
  ES: [{ code: '3205309', name: 'Vitória' }, { code: '3201307', name: 'Serra' }, { code: '3205200', name: 'Vila Velha' }],
  GO: [{ code: '5208707', name: 'Goiânia' }, { code: '5212803', name: 'Aparecida de Goiânia' }],
  MA: [{ code: '2111300', name: 'São Luís' }],
  MT: [{ code: '5103403', name: 'Cuiabá' }, { code: '5105101', name: 'Várzea Grande' }],
  MS: [{ code: '5002704', name: 'Campo Grande' }, { code: '5007900', name: 'Dourados' }],
  MG: [
    { code: '3106200', name: 'Belo Horizonte' },
    { code: '3160900', name: 'Uberlândia' },
    { code: '3124455', name: 'Contagem' },
    { code: '3136702', name: 'Juiz de Fora' },
    { code: '3141900', name: 'Betim' },
  ],
  PA: [
    { code: '1501402', name: 'Belém' },
    { code: '1500107', name: 'Ananindeua' },
    { code: '1507808', name: 'Santarém' },
  ],
  PB: [{ code: '2507507', name: 'João Pessoa' }, { code: '2505204', name: 'Campina Grande' }],
  PR: [
    { code: '4106902', name: 'Curitiba' },
    { code: '4113700', name: 'Londrina' },
    { code: '4115201', name: 'Maringá' },
    { code: '4105805', name: 'Ponta Grossa' },
  ],
  PE: [
    { code: '2611606', name: 'Recife' },
    { code: '2611309', name: 'Jaboatão dos Guararapes' },
    { code: '2607909', name: 'Olinda' },
  ],
  PI: [{ code: '2211001', name: 'Teresina' }],
  RJ: [
    { code: '3304557', name: 'Rio de Janeiro' },
    { code: '3301702', name: 'Niterói' },
    { code: '3303609', name: 'Duque de Caxias' },
    { code: '3302403', name: 'Nova Iguaçu' },
  ],
  RN: [{ code: '2408102', name: 'Natal' }],
  RS: [
    { code: '4314902', name: 'Porto Alegre' },
    { code: '4323009', name: 'Caxias do Sul' },
    { code: '4305105', name: 'Canoas' },
    { code: '4314101', name: 'Pelotas' },
  ],
  RO: [{ code: '1100205', name: 'Porto Velho' }],
  RR: [{ code: '1400100', name: 'Boa Vista' }],
  SC: [
    { code: '4205407', name: 'Florianópolis' },
    { code: '4219302', name: 'Joinville' },
    { code: '4108304', name: 'Blumenau' },
  ],
  SP: [
    { code: '3550308', name: 'São Paulo' },
    { code: '3509500', name: 'Campinas' },
    { code: '3518800', name: 'Guarulhos' },
    { code: '3543402', name: 'Santos' },
    { code: '3523409', name: 'Osasco' },
    { code: '3506008', name: 'Bauru' },
  ],
  SE: [{ code: '2800308', name: 'Aracaju' }],
  TO: [{ code: '1721000', name: 'Palmas' }],
};
