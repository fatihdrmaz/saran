-- =====================================================================
-- Saran — e-posta bildirim tetikleyicileri (pg_net → notify-email Edge Function).
-- Olaylar: plan önerildi (plans insert, status=proposed) · yeni mesaj (messages insert).
-- Payload yalnızca {type, id} taşır; e-posta içeriğini fonksiyon service_role ile
-- DB'den kendisi okur (sahte istek veri sızdıramaz). Bildirim hatası asıl
-- işlemi ASLA bozmaz (exception yutuluyor).
-- =====================================================================

create extension if not exists pg_net;

create or replace function public.notify_edge(event text, record_id uuid)
  returns void language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://okzjpburiqwmrhlxonxe.supabase.co/functions/v1/notify-email',
    body := jsonb_build_object('type', event, 'id', record_id),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
exception when others then
  null; -- bildirim gönderilemese de plan/mesaj kaydı başarılı kalır
end;
$$;

create or replace function public.on_plan_proposed()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'proposed' then
    perform public.notify_edge('plan_proposed', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_plan_proposed on plans;
create trigger trg_plan_proposed
  after insert on plans
  for each row execute function public.on_plan_proposed();

create or replace function public.on_message_notify()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_edge('new_message', new.id);
  return new;
end;
$$;

drop trigger if exists trg_message_notify on messages;
create trigger trg_message_notify
  after insert on messages
  for each row execute function public.on_message_notify();
