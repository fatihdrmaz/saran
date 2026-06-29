-- =====================================================================
-- Saran — GÜVENLİK: self-signup rol yükseltmesini engelle.
-- Önceki handle_new_user, client'ın raw_user_meta_data.role değerine güveniyordu;
-- bu, anon bir kullanıcının kendini 'nurse'/'admin' yapmasına izin verirdi.
-- Artık self-signup HER ZAMAN 'patient'. nurse/admin yalnızca yönetici tarafından
-- (service_role) profiles.role güncellenerek + nurses kaydı eklenerek atanır.
-- =====================================================================

create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, email, phone, kvkk_consent_at)
  values (
    new.id,
    'patient',  -- SABİT: client rol seçemez
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    case when (new.raw_user_meta_data ->> 'kvkk_consent') = 'true' then now() else null end
  );
  insert into public.patients (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
