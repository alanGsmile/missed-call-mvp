import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Инициализация на Supabase клиента
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook endpoint за Zadarma
app.all('/webhooks/zadarma', async (req: Request, res: Response) => {
  // Верификация за Zadarma (zd_echo)
  if (req.query.zd_echo) {
    return res.send(req.query.zd_echo);
  }

  const payload = req.method === 'POST' ? req.body : req.query;
  const { event, caller_id, called_did, pbx_call_id, disposition, call_start } = payload;

  console.log(`📞 Нов webhook от Zadarma: ${event}`);

  // Обработваме само приключили обаждания (NOTIFY_END)
  if (event === 'NOTIFY_END') {
    try {
      // 1. Намираме бизнеса по техническия DID номер
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('technical_did', called_did)
        .single();

      // 2. Записваме обаждането в таблицата calls
      const { error } = await supabase.from('calls').insert({
        business_id: business ? business.id : null,
        caller_phone: caller_id,
        called_did: called_did,
        zadarma_call_id: pbx_call_id,
        event: event,
        disposition: disposition,
        started_at: call_start ? new Date(call_start) : new Date()
      });

      if (error) {
        console.error('Грешка при запис в Supabase:', error.message);
      } else {
        console.log(`✅ Успешно записано обаждане в базата за Business ID: ${business?.id || 'неизвестен'}`);
      }
    } catch (err) {
      console.error('Непредвидена грешка:', err);
    }
  }

  return res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сървърът работи на порт ${PORT}`);
});