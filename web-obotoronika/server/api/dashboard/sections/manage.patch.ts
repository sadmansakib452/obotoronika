import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const body = await readBody(event)
    const { sections: sectionIDS } = body

    if (!sectionIDS || !Array.isArray(sectionIDS)) {
      return errorResponse(event, 400, 'Invalid section IDs')
    }

    const activeIds = sectionIDS.map((s: any) => s.id)

    // 1. Update provided IDs to "active" with position
    const updates = sectionIDS.map((section: any) =>
      supabaseAdmin
        .from('sections')
        .update({
          status: 'active',
          active_position: section.index,
        })
        .eq('id', section.id),
    )

    const activeResults = await Promise.all(updates)

    const activeErrors = activeResults.filter(r => r.error)
    if (activeErrors.length > 0) {
      console.error('Active section updates failed:', activeErrors)
      return errorResponse(event, 500, 'Some active section updates failed')
    }

    // 2. Set all OTHER sections to "draft"
    const { error: draftError } = await supabaseAdmin
      .from('sections')
      .update({ status: 'draft', active_position: null })
      .not('id', 'in', `(${activeIds.join(',')})`)

    if (draftError) {
      console.error('Draft section updates failed:', draftError)
      return errorResponse(event, 500, 'Failed to update draft sections')
    }

    return successResponse(event, 200, 'Sections updated successfully')
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error in section update:', error)
    return errorResponse(event, 500, error.message)
  }
})
