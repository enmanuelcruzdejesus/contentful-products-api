import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private baseUrl = `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT}`;

  private readField<T = any>(v: any): T | null {
    if (v == null) return null;
    if (typeof v === 'object' && !Array.isArray(v)) {
      const first = Object.values(v)[0];
      return (first as T) ?? null;
    }
    return v as T;
  }

  async listAllProducts(): Promise<any[]> {
    const contentType = process.env.CONTENTFUL_CONTENT_TYPE;
    const token = process.env.CONTENTFUL_ACCESS_TOKEN;
    const pageSize = parseInt(process.env.CONTENTFUL_PAGE_SIZE || '100', 10);

    let skip = 0;
    const items: any[] = [];
    while (true) {
      const { data } = await axios.get(`${this.baseUrl}/entries`, {
        params: {
          content_type: contentType,
          access_token: token,
          limit: pageSize,
          skip,
        },
      });
      for (const e of data.items as any[]) {
        const name = this.readField<string>(e.fields?.name);
        const category = this.readField<string>(e.fields?.category);
        const price = this.readField<number>(e.fields?.price);
        items.push({
          contentfulId: e.sys.id,
          name: name ?? null,
          category: category ?? null,
          price: price != null ? String(price) : null,
          contentfulUpdatedAt: e.sys.updatedAt
            ? new Date(e.sys.updatedAt)
            : null,
        });
      }
      skip += data.items.length;
      if (!data.items.length || skip >= (data.total || 0)) break;
    }
    this.logger.log(`Fetched ${items.length} products from Contentful`);
    return items;
  }
}
