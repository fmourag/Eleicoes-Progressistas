import { Injectable, BadRequestException, HttpException , Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CARGOS_BY_LEVEL, ElectionLevel } from '@np/shared';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

interface IBGEMunicipioResponse {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: { id: number; sigla: string; nome: string };
    };
  };
}

const CEP_TO_LEVEL: Record<string, ElectionLevel[]> = {
  // SP capital
  '01000-000': ['MUNICIPAL', 'ESTADUAL', 'FEDERAL'],
};

@Injectable()
export class GeoService {
  private viaCepUrl: string;
  private ibgeUrl: string;

  constructor(@Inject(ConfigService) private config?: ConfigService) {
    this.viaCepUrl = this.config?.get('VIA_CEP_URL') || process.env.VIA_CEP_URL || 'https://viacep.com.br';
    this.ibgeUrl = this.config?.get('IBGE_URL') || process.env.IBGE_URL || 'https://servicodados.ibge.gov.br/api/v1';
  }

  async resolveCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new BadRequestException('CEP must have 8 digits');

    const viaCepData = await this.fetchViaCEP(cleanCep);
    if (viaCepData.erro) throw new BadRequestException('CEP not found');

    const ibgeData = await this.fetchIBGEMunicipio(viaCepData.ibge);

    const levels = this.determineLevels(cleanCep);
    const cargos = levels.flatMap((l) => CARGOS_BY_LEVEL[l]);

    return {
      cep: viaCepData.cep,
      municipality: viaCepData.localidade,
      state: viaCepData.uf,
      ibgeCode: viaCepData.ibge,
      microregion: ibgeData?.microrregiao?.nome,
      mesoregion: ibgeData?.microrregiao?.mesorregiao?.nome,
      eligibleLevels: levels,
      eligibleCargos: cargos,
    };
  }

  private async fetchViaCEP(cep: string): Promise<ViaCEPResponse> {
    try {
      const res = await fetch(`${this.viaCepUrl}/ws/${cep}/json/`);
      if (!res.ok) throw new HttpException('ViaCEP unavailable', 502);
      return res.json() as Promise<ViaCEPResponse>;
    } catch {
      throw new HttpException('Failed to fetch CEP data', 502);
    }
  }

  private async fetchIBGEMunicipio(ibgeCode: string): Promise<IBGEMunicipioResponse | null> {
    try {
      const res = await fetch(
        `${this.ibgeUrl}/localidades/municipios/${ibgeCode}?fields=nome,microrregiao(nome,mesorregiao(nome,UF(sigla)))`,
      );
      if (!res.ok) return null;
      return res.json() as Promise<IBGEMunicipioResponse>;
    } catch {
      return null;
    }
  }

  private determineLevels(cep: string): ElectionLevel[] {
    // All CEPs have at least municipal + federal
    // State level depends on state (all states have it)
    return ['MUNICIPAL', 'ESTADUAL', 'FEDERAL'];
  }
}
