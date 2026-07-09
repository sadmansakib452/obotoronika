import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { successResponse, errorResponse } from '@@/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    // Fetch active banners with optional section data
    const { data: banners, error: bannersError } = await supabaseAdmin
      .from('banners')
      .select(`
        id,
        image_url,
        title,
        description,
        button_text,
        button_link,
        section_id,
        display_order,
        status,
        created_at,
        updated_at,
        sections:section_id (
          id,
          title,
          slug,
          description
        )
      `)
      .eq('status', 'active')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })

    if (bannersError) throw bannersError

    if (!banners || banners.length === 0) {
      return successResponse(event, 200, { banners: [] })
    }

    // Transform the data to flatten section relationship
    const transformedBanners = banners.map((banner: any) => {
      const bannerData: any = {
        id: banner.id,
        image_url: banner.image_url,
        title: banner.title,
        description: banner.description,
        button_text: banner.button_text || 'Shop Now',
        button_link: banner.button_link,
        section_id: banner.section_id,
        display_order: banner.display_order,
        created_at: banner.created_at,
        updated_at: banner.updated_at,
      }

      // If banner is linked to a section, include section data and set button_link if not already set
      if (banner.sections && banner.sections.length > 0) {
        const section = Array.isArray(banner.sections) ? banner.sections[0] : banner.sections
        bannerData.section = {
          id: section.id,
          title: section.title,
          slug: section.slug,
          description: section.description,
        }
        // Auto-set button_link to section page if not manually set
        if (!bannerData.button_link && section.slug) {
          bannerData.button_link = `/sections/${section.slug}`
        }
      }

      return bannerData
    })

    return successResponse(event, 200, {
      banners: transformedBanners,
    })
  }
  catch (error: any) {
    console.error('Error in get banners:', error)
    return errorResponse(event, 500, error?.message || 'Internal Server Error')
  }
})
