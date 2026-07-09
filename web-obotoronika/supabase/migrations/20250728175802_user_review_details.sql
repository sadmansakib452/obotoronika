DROP VIEW IF EXISTS user_review_details;

CREATE VIEW user_review_details AS
SELECT
  r.id AS review_id,
  r.user_id,
  r.comment,
  r.rating,
  r.images,
  r.created_at,
  p.id AS product_id,
  p.title,
  p.thumbnail,
  oi.variants,
  oi.id AS order_item_id,
  r.order_id
FROM reviews r
JOIN order_items oi ON r.order_item_id = oi.id
JOIN products p ON oi.product_id = p.id;
