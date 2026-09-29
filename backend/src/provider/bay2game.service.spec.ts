import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Bay2GameService } from './bay2game.service';

describe('Bay2GameService', () => {
  let service: Bay2GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Bay2GameService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'BAY2GAME_CHECKID_URL') return 'https://checkid.bay2game.xyz/check_id';
              if (key === 'BAY2GAME_API_URL') return 'https://api.bay2game.xyz/api';
              if (key === 'BAY2GAME_API_KEY') return 'b2g_mock_key';
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<Bay2GameService>(Bay2GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeGameCode', () => {
    it('should map standard aliases to Bay2Game codes', () => {
      expect(service.normalizeGameCode('mobile-legends')).toBe('mlbb');
      expect(service.normalizeGameCode('free-fire')).toBe('freefire_global');
      expect(service.normalizeGameCode('genshin-impact')).toBe('genshin_impact');
      expect(service.normalizeGameCode('pubg-mobile')).toBe('pubgm_global');
    });

    it('should keep custom Bay2Game game codes unchanged', () => {
      expect(service.normalizeGameCode('mlbb_tr')).toBe('mlbb_tr');
      expect(service.normalizeGameCode('freefire_sgmy')).toBe('freefire_sgmy');
    });
  });

  describe('checkId handling', () => {
    it('should correctly process successful ID verification', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          status: 'success',
          username: 'ProGamer123',
          region: 'Asia',
          game_title: 'Mobile Legends',
        }),
      });
      global.fetch = mockFetch;

      const result = await service.checkId('mobile-legends', '12345678', '1234');
      expect(result.valid).toBe(true);
      expect(result.username).toBe('ProGamer123');
      expect(result.gameCode).toBe('mlbb');
      expect(result.userId).toBe('12345678');
      expect(result.serverId).toBe('1234');
    });

    it('should correctly process invalid or non-existent ID', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          status: 'NOT_ALLOW',
          message: 'User not found or invalid.',
          username: null,
        }),
      });
      global.fetch = mockFetch;

      const result = await service.checkId('free-fire', '00000000');
      expect(result.valid).toBe(false);
      expect(result.username).toBeNull();
      expect(result.message).toBe('User not found or invalid.');
    });
  });
});
