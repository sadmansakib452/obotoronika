// @ts-ignore
import { z } from 'zod'
import convertFileToBase64 from '@@/shared/utils/convertFileToBase64'
// @ts-ignore
import type { FormSubmitEvent } from '#ui/types'

// Function to create the schema dynamically
export function createSchema(thumbnailRequired: boolean) {
  return z
    .object({
      title: z
        .string({ required_error: 'Product name is mandatory.' })
        .nonempty('Please provide product name.'),
      sku: z
        .string().optional(),
      category_id: z
        .number({
          required_error: 'Category is mandatory.',
          invalid_type_error: 'Category must be a valid number.',
        })
        .nonnegative('Category must be a positive number.'),
      description: z
        .string().optional(),
      thumbnail: thumbnailRequired
        ? z.any().optional()
        : z
            .instanceof(globalThis.File, {
              message: 'Thumbnail is mandatory and must be a file.',
            })
            .refine(file => file.type.startsWith('image/'), {
              message:
                'Thumbnail must be an image file (e.g., .jpg, .jpeg, .png).',
            }),
      files: z.any().optional(),
      price: z.number({
        required_error: 'Price is mandatory.',
        invalid_type_error: 'Price must be a valid number.',
      }),
      cost_price: z.number({
        required_error: 'Price is mandatory.',
        invalid_type_error: 'Price must be a valid number.',
      }),
      offer_price: z.number().optional().nullable(),
      track_inventory: z.boolean(),
      current_stock: z.number().optional().nullable(),
      low_stock_alert: z.number().optional().nullable(),
      initial_stock: z.number().optional().nullable(),
      availability: z.string().optional().nullable(),
      global_trade_number: z.string().optional().nullable(),
      manufacturer_number: z.string().optional().nullable(),
      brand: z.string().optional().nullable(),
      item_upc: z.string().optional().nullable(),
      custom_fields: z.any().optional().nullable(),
      free_shipping: z.boolean().optional().nullable(),
      shipping_price: z.number().optional().nullable(),
      locationBasedShipping: z.boolean().optional().nullable(),
      locationBasedShippingPrice: z.any().optional().nullable(),
      availableDate: z.string().optional().nullable(),
      endDate: z.string().optional().nullable(),
      variants: z.any().optional().nullable(),
      tags: z.any().optional().nullable(),
      page_title: z.string().optional().nullable(),
      meta_keywords: z.any().optional().nullable(),
      meta_description: z.string().optional().nullable(),
      slug: z.string().optional().nullable(),
      product_visibility: z.string().optional().nullable(),
    }).refine(
      (data: any) =>
        data.free_shipping === true || (data.shipping_price !== null && data.shipping_price !== undefined),
      {
        message: 'Shipping price is required when free shipping is disabled.',
        path: ['shipping_price'],
      },
    )
}

// Example usage of the schema
export async function productFormSubmit(
  event: FormSubmitEvent<any>,
  state: any,
  fileError: { value: string },
  emit: any,
) {
  if (fileError.value) return

  const formData = new FormData()

  const appendField = (key: string, value: any, defaultValue = '') => {
    formData.append(key, value ?? defaultValue)
  }

  appendField('title', event.data.title)
  appendField('description', event.data.description)
  appendField('sku', event.data.sku)
  appendField('category_id', event.data.category_id)
  appendField('track_inventory', event.data.track_inventory.toString())
  appendField('price', event.data.price)
  appendField('cost_price', event.data.cost_price)
  appendField('offer_price', event.data.offer_price)
  appendField('initial_stock', event.data.initial_stock)
  appendField('current_stock', event.data.current_stock)
  appendField('low_stock_alert', event.data.low_stock_alert)
  appendField('availability', event.data.availability)
  appendField('global_trade_number', event.data.global_trade_number)
  appendField('manufacturer_number', event.data.manufacturer_number)
  appendField('brand', event.data.brand)
  appendField('item_upc', event.data.item_upc)
  appendField('free_shipping', event.data.free_shipping)
  appendField('locationBasedShipping', event.data.locationBasedShipping)
  appendField('availableDate', event.data.availableDate)
  appendField('endDate', event.data.endDate)
  appendField('page_title', event.data.page_title)
  appendField('meta_keywords', JSON.stringify(event.data.meta_keywords))
  appendField('meta_description', event.data.meta_description)
  appendField('slug', event.data.slug)
  if (state.product_visibility) {
    appendField('product_visibility', state.product_visibility)
  }

  formData.append('custom_fields', JSON.stringify(event.data.custom_fields))
  formData.append(
    'locationBasedShippingPrice',
    JSON.stringify(event.data.locationBasedShippingPrice),
  )
  formData.append('variants', JSON.stringify(event.data.variants))
  formData.append('tags', event.data.tags.toString())

  if (event.data.thumbnail instanceof File) {
    formData.append(
      'thumbnail',
      (await convertFileToBase64(event.data.thumbnail)) as string,
    )
  }

  for (let index = 0; index < event.data.files.length; index++) {
    if (event.data.files[index] instanceof File) {
      formData.append(
        `file-${index + 1}`,
        (await convertFileToBase64(event.data.files[index])) as string,
      )
    }
  }

  emit('getFormData', formData)
}

export { z, FormSubmitEvent }
