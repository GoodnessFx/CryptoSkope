import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThetaDexService } from './thetaDexService';
import { ethers } from 'ethers';

vi.mock('ethers', () => {
  const mockContract = {
    getReserves: vi.fn(),
    token0: vi.fn(),
  };
  const mockProvider = {
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  };
  return {
    ethers: {
      providers: {
        JsonRpcProvider: vi.fn(() => mockProvider),
      },
      Contract: vi.fn(() => mockContract),
      utils: {
        formatUnits: vi.fn((val) => val.toString()),
      },
    },
  };
});

describe('ThetaDexService', () => {
  let service: ThetaDexService;
  let mockContract: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ThetaDexService();
    mockContract = (ethers.Contract as any).mock.results[0].value;
  });

  it('should calculate token price correctly when token0 is the target token', async () => {
    mockContract.getReserves.mockResolvedValue({
      reserve0: 1000,
      reserve1: 2000,
    });
    mockContract.token0.mockResolvedValue("0x4Dc08B15Ea0E10B96c41Aec22Fab934Ba15c983e");

    const price = await service.getTokenPrice();
    expect(price).toBe(2); // 2000 / 1000
  });

  it('should calculate token price correctly when token0 is NOT the target token', async () => {
    mockContract.getReserves.mockResolvedValue({
      reserve0: 1000,
      reserve1: 2000,
    });
    mockContract.token0.mockResolvedValue("0xOtherToken");

    const price = await service.getTokenPrice();
    expect(price).toBe(0.5); // 1000 / 2000
  });
});
