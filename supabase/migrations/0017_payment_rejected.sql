-- Yara Takibi — havale reddi: hemşire gelmeyen ödemeyi reddedebilsin.
-- 'rejected' durumu eklenince plan başına tek-bekleyen-bildirim index'i
-- (yalnızca awaiting_approval'ı kapsar) serbest kalır → hasta yeniden bildirebilir.

alter type payment_status add value if not exists 'rejected';
