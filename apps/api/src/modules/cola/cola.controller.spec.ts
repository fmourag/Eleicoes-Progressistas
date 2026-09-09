import { Test, TestingModule } from '@nestjs/testing';
import { ColaController } from './cola.controller';
import { ColaService } from './cola.service';
import { PrismaService } from '../common/prisma.service';

describe('ColaController', () => {
  let controller: ColaController;
  let colaService: ColaService;

  const mockPdfBuffer = Buffer.from('%PDF-1.4 Mock PDF');

  const mockColaService = {
    getCandidatesByIds: jest.fn().mockResolvedValue([
      {
        id: 'cand-1',
        name: 'Lula',
        cargo: 'PRESIDENTE',
        party: 'PT',
        partyNumber: 13,
        numeroUrna: '13',
      },
    ]),
    generatePdf: jest.fn().mockResolvedValue(mockPdfBuffer),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColaController],
      providers: [
        { provide: ColaService, useValue: mockColaService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ColaController>(ColaController);
    colaService = module.get<ColaService>(ColaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return inline PDF stream on getPdfInline', async () => {
    const mockRes = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    } as any;

    await controller.getPdfInline('cand-1', 'RJ', 'Rio de Janeiro', undefined as any, undefined as any, mockRes);

    expect(mockColaService.getCandidatesByIds).toHaveBeenCalledWith(['cand-1']);
    expect(mockColaService.generatePdf).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cola-eleitoral-2026.pdf"',
      }),
    );
    expect(mockRes.end).toHaveBeenCalledWith(mockPdfBuffer);
  });

  it('should return attachment PDF stream on getPdfDownload', async () => {
    const mockRes = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    } as any;

    await controller.getPdfDownload('cand-1', 'RJ', 'Rio de Janeiro', undefined as any, undefined as any, mockRes);

    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cola-eleitoral-2026.pdf"',
      }),
    );
    expect(mockRes.end).toHaveBeenCalledWith(mockPdfBuffer);
  });
});
