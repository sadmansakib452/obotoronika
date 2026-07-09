create or replace function update_cart_quantity(
  p_user_id uuid,
  p_product_id uuid,
  p_new_quantity integer,
  p_add boolean
)
returns void as $$
begin
  update cart_items
  set quantity = case
    when p_add then quantity + p_new_quantity
    else p_new_quantity
  end,
  updated_at = now()
  where user_id = p_user_id and product_id = p_product_id;
end;
$$ language plpgsql;
