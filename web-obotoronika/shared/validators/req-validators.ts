import { z } from 'zod'

export const siteSettingsGeneraleSchema = z.object({
  site_name: z.string({ required_error: 'Name is required.' }),
  favicon: z.string({ required_error: 'Favicon is required.' }).optional(),
  logo: z.string({ required_error: 'Logo is required.' }).optional(),
  description: z.string({ required_error: 'Description is required.' }),
  language: z.string({ required_error: 'Language is required.' }),
  currency: z.string({ required_error: 'Currency is required.' }),
  timezone: z.string({ required_error: 'Time zone is required.' }),
  email: z.string({ required_error: 'Email is required.' }),
  phone: z.string({ required_error: 'Phone is required.' }),
  address: z.string({ required_error: 'Address is required.' }),
})
