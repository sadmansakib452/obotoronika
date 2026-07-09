// Generate unique invoice number
async function generateInvoiceNumber() {
  const today = new Date()
  const datePart = `${today.getFullYear()}${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`

  // Look for the most recent invoice created today
  const { data: lastInvoice } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${datePart}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let sequence = 1

  if (lastInvoice?.invoice_number) {
    const parts = lastInvoice.invoice_number.split('-')
    const lastSequence = parseInt(parts[2], 10)
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }

  const sequencePart = sequence.toString().padStart(4, '0')
  return `INV-${datePart}-${sequencePart}`
}

const generateInvoice = async (user_id: string, order_id: number | string, total_amount: number) => {
  const invoiceNumber = await generateInvoiceNumber()

  // Insert invoice
  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      user_id: user_id,
      order_id: order_id,
      total_amount: total_amount,
      status: 'unpaid',
    })
    .select('*')
    .single()

  if (invoiceError) throw new Error('Failed to create invoice.')
  return invoice
}

export default generateInvoice
