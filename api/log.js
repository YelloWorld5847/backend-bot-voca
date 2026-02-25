import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { username, article_url, used_mb, status } = req.body;

  if (!username || used_mb === undefined) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  // déduire la data de l'utilisateur (via la fonction SQL créée précédemment)
  const { error: rpcError } = await supabase.rpc('deduct_mb', { 
    p_username: username, 
    p_amount: used_mb 
  });

  if (rpcError) return res.status(500).json({ error: rpcError.message });

  // ajouter la ligne dans l'historique des logs
  await supabase.from('logs').insert([{
    username,
    article_url,
    used_mb,
    status
  }]);

  return res.status(200).json({ success: true });
}