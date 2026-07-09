select
  transaction_id,
  status,
  (payment_details ? 'ipn') as has_ipn,
  (payment_details ? 'validation') as has_validation,
  payment_details->'ipn' as ipn_payload,
  payment_details->'validation' as validation_payload
from public.transactions
where transaction_id = 'TXN20260423190942666';