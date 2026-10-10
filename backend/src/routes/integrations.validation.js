import { z } from 'zod';

export const PROVIDERS = ['facebook', 'instagram', 'x', 'linkedin'];

export const providerParamSchema = z.object({
  provider: z.enum(PROVIDERS, 'Unknown provider'),
});

export const integrationIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid integration ID'),
});

export const savePageSchema = z.object({
  tempState: z.string().min(1, 'tempState is required'),
  pageData: z.object({
    id: z.string().min(1, 'pageData.id is required'),
    name: z.string().min(1, 'pageData.name is required'),
    access_token: z.string().min(1, 'pageData.access_token is required'),
    picture: z
      .object({ data: z.object({ url: z.string() }).optional() })
      .optional(),
    username: z.string().optional(),
  }),
});

export const tempStateQuerySchema = z.object({
  tempState: z.string().min(1, 'tempState is required'),
});

export const toggleDisableSchema = z.object({
  disabled: z.boolean('disabled must be a boolean'),
});
