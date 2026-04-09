import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lwflnnjhrvaquvxmglwf.supabase.co'
const supabaseKey = 'sb_publishable_VQm_g5Y8GT-x5Y8mazBLnA_Kpktos6Z'

export const supabase = createClient(supabaseUrl, supabaseKey)