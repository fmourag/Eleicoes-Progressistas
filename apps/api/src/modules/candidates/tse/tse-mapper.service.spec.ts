import { TseMapperService } from './tse-mapper.service';
import { Cargo, ElectionLevel, CandidaturaStatus } from '@prisma/client';

describe('TseMapperService', () => {
  let service: TseMapperService;

  beforeEach(() => {
    service = new TseMapperService();
  });

  describe('mapRole', () => {
    it('should correctly map role codes and descriptions', () => {
      expect(service.mapRole(1)).toBe(Cargo.PRESIDENTE);
      expect(service.mapRole('PRESIDENTE')).toBe(Cargo.PRESIDENTE);
      expect(service.mapRole(3)).toBe(Cargo.GOVERNADOR);
      expect(service.mapRole(5)).toBe(Cargo.SENADOR);
      expect(service.mapRole(6)).toBe(Cargo.DEPUTADO_FEDERAL);
      expect(service.mapRole(7)).toBe(Cargo.DEPUTADO_ESTADUAL);
      expect(service.mapRole(8)).toBe(Cargo.DEPUTADO_ESTADUAL);
    });
  });

  describe('isPartyExcluded', () => {
    it('should exclude conservative parties and allow progressive parties', () => {
      expect(service.isPartyExcluded('PL')).toBe(true);
      expect(service.isPartyExcluded('REPUBLICANOS')).toBe(true);
      expect(service.isPartyExcluded('PP')).toBe(true);
      expect(service.isPartyExcluded('PT')).toBe(false);
      expect(service.isPartyExcluded('PSOL')).toBe(false);
      expect(service.isPartyExcluded('PSB')).toBe(false);
      expect(service.isPartyExcluded('REDE')).toBe(false);
    });
  });

  describe('mapStatus', () => {
    it('should map TSE status correctly', () => {
      expect(service.mapStatus('DEFERIDO')).toBe(CandidaturaStatus.DEFERIDO);
      expect(service.mapStatus('APTO')).toBe(CandidaturaStatus.DEFERIDO);
      expect(service.mapStatus('INDEFERIDO')).toBe(CandidaturaStatus.INDEFERIDO);
      expect(service.mapStatus('CANCELADO')).toBe(CandidaturaStatus.INDEFERIDO);
      expect(service.mapStatus('AGUARDANDO JULGAMENTO')).toBe(CandidaturaStatus.EM_ANALISE);
    });
  });

  describe('generateDefaultMatchingProfile', () => {
    it('should generate 13 profile dimensions set to 0.5', () => {
      const profile = service.generateDefaultMatchingProfile();
      for (let i = 1; i <= 13; i++) {
        expect(profile[`p${i}`]).toBe(0.5);
      }
    });
  });

  describe('mapApiCandidateToPrisma', () => {
    it('should map API candidate to Prisma entity input correctly', () => {
      const apiMock: any = {
        id: '280001600001',
        nomeUrna: 'CANDIDATO TESTE',
        nomeCompleto: 'CANDIDATO TESTE SILVA',
        numero: 13,
        partido: { sigla: 'PT' },
        cargo: { codigo: 1, nome: 'Presidente' },
        descricaoSituacao: 'DEFERIDO',
        fotoUrl: 'http://tse.jus.br/foto.jpg',
      };

      const result = service.mapApiCandidateToPrisma(apiMock, 'BR', 2026);
      expect(result.tseId).toBe('280001600001');
      expect(result.name).toBe('CANDIDATO TESTE SILVA');
      expect(result.socialName).toBe('CANDIDATO TESTE');
      expect(result.numeroUrna).toBe('13');
      expect(result.party).toBe('PT');
      expect(result.state).toBe('BR');
      expect(result.cargo).toBe(Cargo.PRESIDENTE);
      expect(result.level).toBe(ElectionLevel.FEDERAL);
      expect(result.candidaturaStatus).toBe(CandidaturaStatus.DEFERIDO);
      expect(result.profileScores.p1).toBe(0.94);
      expect(result.profileScores.p13).toBe(0.92);
    });
  });
});
