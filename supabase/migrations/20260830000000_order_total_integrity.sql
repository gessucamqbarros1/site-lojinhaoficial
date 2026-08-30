-- Closes the checkout TOCTOU: orders.total_amount was previously trusted
-- from the client at insert time, with no server-side check against the
-- actual order_items/product prices. A user could tamper with the total
-- via devtools before submitting.
--
-- order_items always insert after their parent order (the app needs the
-- order's id first), so total_amount can't be computed correctly in a
-- BEFORE INSERT trigger on `orders` itself. Instead, recompute it from
-- order_items.unit_price * quantity whenever order_items change, using
-- unit_price exactly as billed (already captured per line) — this trigger
-- is the source of truth for the total, not whatever the client sent.
--
-- Also drops orders.stripe_session_id: dead column from a Stripe
-- integration that was never built (checkout is WhatsApp-only).

CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_order_id integer;
BEGIN
  affected_order_id := COALESCE(NEW.order_id, OLD.order_id);

  UPDATE public.orders
  SET total_amount = COALESCE(
    (SELECT SUM(unit_price * quantity) FROM public.order_items WHERE order_id = affected_order_id),
    0
  )
  WHERE id = affected_order_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_recompute_order_total ON public.order_items;
CREATE TRIGGER trigger_recompute_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recompute_order_total();

-- Also validate unit_price server-side: it must match the product's actual
-- current price, so a tampered order_items.unit_price can't inflate/deflate
-- the recomputed total either.
CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price numeric;
BEGIN
  SELECT price INTO actual_price FROM public.products WHERE id = NEW.product_id;
  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'product % does not exist', NEW.product_id;
  END IF;
  NEW.unit_price := actual_price;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_order_item_price ON public.order_items;
CREATE TRIGGER trigger_validate_order_item_price
  BEFORE INSERT OR UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_item_price();

-- Dead column: no Stripe integration exists in the app (checkout is
-- WhatsApp-only via store_settings.whatsapp_number).
ALTER TABLE public.orders DROP COLUMN IF EXISTS stripe_session_id;
