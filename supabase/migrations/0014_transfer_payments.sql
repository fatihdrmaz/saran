-- =====================================================================
-- Yara Takibi — Havale/EFT ödeme akışı.
-- Hasta havale bildirimi yapar (payments insert, YALNIZCA awaiting_approval);
-- hemşire onayı confirm-payment Edge Function'ı ile (service_role) yapılır.
-- =====================================================================

-- ödeme yöntemi (transfer | card); mevcut kayıtlar simülasyon/karttı
alter table payments add column if not exists method text not null default 'transfer';

-- hasta kendi planı için havale bildirimi ekleyebilir — SADECE awaiting_approval
create policy payments_patient_report_transfer on payments for insert
  with check (
    patient_id = auth.uid()
    and status = 'awaiting_approval'
    and exists (
      select 1 from plans p
      where p.id = plan_id
        and p.patient_id = auth.uid()
        and p.status = 'proposed'
    )
  );

-- aynı plan için birden fazla bekleyen bildirim olmasın
create unique index if not exists payments_one_awaiting_per_plan
  on payments (plan_id) where status = 'awaiting_approval';
