export type ContentfulSys = { id: string; updatedAt?: string };
export type ContentfulEntry = {
  sys: ContentfulSys;
  fields: Record<string, any>;
};
