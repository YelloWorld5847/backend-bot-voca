import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Paramètre name manquant' });

  const { data, error } = await supabase
    .from('users')
    .select('remaining_mb, proxy_config')
    .eq('username', name)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Utilisateur introuvable' });

  return res.status(200).json({
    remaining_mb: data.remaining_mb,
    proxy: data.proxy_config
  });
}