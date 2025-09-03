import { Test } from '@nestjs/testing';
import { ProductsService } from '../src/products/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/product.entity';

const repoMock = () => ({
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: ReturnType<typeof repoMock>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useFactory: repoMock },
      ],
    }).compile();

    service = module.get(ProductsService);
    repo = module.get(getRepositoryToken(Product));
  });

  it('findPublic returns pagination structure', async () => {
    const res = await service.findPublic({ page: 1 });
    expect(res).toHaveProperty('items');
    expect(res.pageSize).toBe(5);
  });

  it('deletePublic sets deletedAt', async () => {
    const now = new Date();
    jest.useFakeTimers().setSystemTime(now);
    repo.findOne.mockResolvedValue({ id: '1', deletedAt: null });
    await service.deletePublic('1');
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: now }));
  });
});