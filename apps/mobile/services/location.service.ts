import { UserLocation } from '../stores/location.store';

// Mapeamento padrão de capitais / municípios principais para fallback e IBGE codes
const IBGE_MAP: Record<string, { uf: string; municipality: string; ibge_code: string }> = {
  SP: { uf: 'SP', municipality: 'São Paulo', ibge_code: '3550308' },
  MG: { uf: 'MG', municipality: 'Belo Horizonte', ibge_code: '3106200' },
  BA: { uf: 'BA', municipality: 'Salvador', ibge_code: '2927408' },
  RJ: { uf: 'RJ', municipality: 'Rio de Janeiro', ibge_code: '3304557' },
  PR: { uf: 'PR', municipality: 'Curitiba', ibge_code: '4106902' },
  RS: { uf: 'RS', municipality: 'Porto Alegre', ibge_code: '4314902' },
};

const DEFAULT_LOCATION: UserLocation = IBGE_MAP.SP!;

export async function requestUserCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          reject(new Error(err.message || 'Geolocalização não permitida pelo navegador'));
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      reject(new Error('Geolocalização não suportada no dispositivo'));
    }
  });
}

export async function resolveLocationFromCoords(lat: number, lng: number): Promise<UserLocation> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'NorteProgressistaApp/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      const state = address.state || '';
      const city = address.city || address.town || address.municipality || address.village || 'São Paulo';

      // Extrai UF (2 letras) se disponível
      const ufCode = (address['ISO3166-2-lvl4']?.split('-')[1] || state.substring(0, 2)).toUpperCase();
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
        uf: ufCode.length === 2 ? ufCode : 'SP',
        municipality: city,
        ibge_code: '3550308',
        latitude: lat,
        longitude: lng,
      };
    }
  } catch {
    // Retorna localização padrão se a API de geocodificação inversa estiver indisponível
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
