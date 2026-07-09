import FormData from 'form-data'

export const paymentInitDataProcess = (data: any) => {
  const postData = {
    /* Integration Required Parameters */
    // Required
    store_id: data.store_id,
    store_passwd: data.store_passwd,
    productcategory: data.productcategory,
    tran_id: data.tran_id,
    total_amount: data.total_amount,
    currency: data.currency,
    success_url: data.success_url,
    fail_url: data.fail_url,
    cancel_url: data.cancel_url,
    // Optional
    ipn_url: data.ipn_url,
    multi_card_name: data.multi_card_name,
    allowed_bin: data.allowed_bin,

    /* Parameters to Handle EMI Transaction */
    // Required
    emi_option: data.emi_option,
    // Optional
    emi_max_inst_option: data.emi_max_inst_option,
    emi_selected_inst: data.emi_selected_inst,

    /* Customer Information */
    // Required
    cus_name: data.cus_name,
    cus_email: data.cus_email,
    cus_add1: data.cus_add1,
    cus_add2: data.cus_add2,
    cus_city: data.cus_city,
    cus_state: data.cus_state,
    cus_postcode: data.cus_postcode,
    cus_country: data.cus_country,
    cus_phone: data.cus_phone,
    // Optional
    cus_fax: data.cus_fax,

    /* Shipment Information */
    // Required
    shipping_method: data.shipping_method,
    num_of_item: data.num_of_item,
    // Optional
    ship_name: data.ship_name,
    shipcity: data.shipcity,
    ship_add1: data.ship_add1,
    ship_add2: data.ship_add2,
    ship_city: data.ship_city,
    ship_state: data.ship_state,
    ship_postcode: data.ship_postcode,
    ship_country: data.ship_country,

    /* Product Information */
    // Required
    product_name: data.product_name,
    product_category: data.product_category,
    product_profile: data.product_profile,
    // Optional
    hours_till_departure: data.hours_till_departure,
    flight_type: data.flight_type,
    pnr: data.pnr,
    journey_from_to: data.journey_from_to,
    third_party_booking: data.third_party_booking,
    hotel_name: data.hotel_name,
    length_of_stay: data.length_of_stay,
    check_in_time: data.check_in_time,
    hotel_city: data.hotel_city,
    product_type: data.product_type,
    topup_number: data.topup_number,
    country_topup: data.country_topup,
    cart: data.cart,
    product_amount: data.product_amount,
    discount_amount: data.discount_amount,
    convenience_fee: data.convenience_fee,

    /* Customized or Additional Parameters */
    // Optional
    value_a: data.value_a,
    value_b: data.value_b,
    value_c: data.value_c,
    value_d: data.value_d,
  }
  return postData

  // const fdata = new FormData()
  // for (const key in postData) {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   fdata.append(key, postData[key] ?? '')
  // }

  // return fdata
}
