import buildMenu from '@@/server/utils/buildMenu'

export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.log('====================huh================')
      console.log(error.message)
      console.log('====================================')
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
        data: { error: 'Internal Server Error' },
      })
    }

    // Handle empty or invalid data
    if (!data || data.length === 0) {
      return successResponse(event, 200, [
        { label: 'HOME', href: '/' },
      ])
    }

    const menu = [
      { label: 'HOME', href: '/' },
      ...buildMenu(null, data), // Use the utility function to build the menu
    ]

    return successResponse(event, 200, menu)
  }
  catch (error: any) {
    console.log('============got error from menus route========================')
    console.log(error.message)
    console.log('====================================')
    return errorResponse(event, 500)
  }
})
