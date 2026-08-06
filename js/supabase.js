// const { createClient } = require('@supabase/supabase-js');

// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_KEY
// );

// module.exports = supabase;



const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://qxinrvwsrchujpqyysvv.supabase.co',
    'sb_publishable_60CeAR29OK4_sHCRibqprA_AaW8TaQz'
);

module.exports = supabase;