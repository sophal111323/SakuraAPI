import { Test, TestingModule } from '@nestjs/testing';
import { AvatarService } from './avatar.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AvatarService', () => {
  let service: AvatarService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { updateMany: vi.fn() },
      reseller: { updateMany: vi.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate valid SVG initial', () => {
    const svg = service.generateSvg('C');
    expect(svg).toContain('<svg');
    expect(svg).toContain('C</text>');
  });

  it('should return SVG fallback for empty username', async () => {
    const result = await service.getOrFetchAvatar('');
    expect(result.svg).toBeDefined();
    expect(result.svg).toContain('S</text>');
  });
});
