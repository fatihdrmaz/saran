-- Yara Takibi — mesaj "okundu" işareti: konuşma katılımcıları messages
-- satırını güncelleyebilir (read_at için). 0002'de yalnızca select+insert vardı.

create policy messages_update_participants on messages for update
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.patient_id = auth.uid() or c.nurse_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.patient_id = auth.uid() or c.nurse_id = auth.uid())
    )
  );
