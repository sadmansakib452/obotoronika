DROP VIEW IF EXISTS merchant_order_view;

CREATE VIEW merchant_order_view AS
SELECT
  mo.id AS merchant_order_id,
  mo.sub_order_id,
  mo.merchant_id,
  mo.status AS merchant_order_status,
  mo.shipping_method,
  mo.shipping_cost,
  mo.estimated_delivery_date,
  mo.tracking_info,
  mo.created_at AS merchant_order_created_at,

  o.id AS order_id,
  o.user_id,
  o.status AS order_status,
  o.total_amount,
  o.shipping_address,
  o.billing_address,
  o.order_id AS external_order_id,
  o.payment_method,
  o.payment_info,
  o.notes,
  o.created_at AS order_created_at,

  -- user info from extended_users
  eu.raw_user_meta_data->>'name' AS user_name

FROM merchant_orders mo
JOIN orders o ON mo.order_id = o.id
JOIN extended_users eu ON o.user_id = eu.id;
