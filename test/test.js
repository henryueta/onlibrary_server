//usuario teste:   83e7d691-16e9-43a6-af3b-10509ac9e085
//biblioteca teste:  56dbe82d-b145-4060-a14d-fb5f83d5d731
// livro teste:  34c6fff7-8216-43bf-8f3d-e22ce0cd7bb6

import client from  "../database/supabase.js"
import { onQueryDatabase } from "../functions/query.js"



(async()=>{

  const library_user_data = await client
  .from("vw_table_usuario_biblioteca")
  .select("*")
  .ilike("username","F%")

  library_user_data.data
  ? (()=>{
    console.log(library_user_data.data)
  })()
  : console.log(library_user_data.error)

}
)()
