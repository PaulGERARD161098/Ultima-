// Configuration Supabase côté navigateur.
// La clé « anon » est publiable : elle peut apparaître ici sans risque
// (la sécurité repose sur la RLS côté base). Ne JAMAIS mettre ici une
// clé service_role ni aucun autre secret.
// Laisser les deux champs vides = mode démo (données d'exemple locales).
// Clé publiable sb_publishable_… : exposable par conception, révocable
// indépendamment ; l'accès aux données reste gouverné par la RLS.
window.ULTIMA_CONFIG = {
  SUPABASE_URL: 'https://leosfqyidgsaescjbfom.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_BdzDDS6h3OBFEqr6Hlyn5A_axOPNO42'
};
