import { Test } from '@nestjs/testing';
import { ReportsService } from '../src/reports/reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/product.entity';

const repoMock = () => ({
  count: jest.fn(),
  query: jest.fn(),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let repo: ReturnType<typeof repoMock>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Product), useFactory: repoMock },
      ],
    }).compile();

    service = module.get(ReportsService);
    repo = module.get(getRepositoryToken(Product));
  });

  it('percentageDeleted computes correctly', async () => {
    repo.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(2); // deleted
    const res = await service.percentageDeleted();
    expect(res).toEqual({ total: 10, deleted: 2, percentage: 20 });
  });

  it('percentageNonDeletedWithPrice handles zero base', async () => {
    repo.count.mockResolvedValueOnce(0);
    const res = await service.percentageNonDeletedWithPrice({ withPrice: true });
    expect(res.percentage).toBe(0);
  });
});