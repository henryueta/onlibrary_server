//usuario teste:   83e7d691-16e9-43a6-af3b-10509ac9e085
//biblioteca teste:  56dbe82d-b145-4060-a14d-fb5f83d5d731
// livro teste:  34c6fff7-8216-43bf-8f3d-e22ce0cd7bb6

import client from  "../database/supabase.js"
import { onQueryDatabase } from "../functions/query.js"

const teste = [
    {
        fk_id_livro:"1",
        id:"!$"
    },
    {
        fk_id_livro:"2",
        id:"14"
    }

]

const teste2 = [

    {
        fk_id_livro:"14"
    },
    {
        fk_id_livro:"2"
    },
    {
        fk_id_livro:"1"
    }

]

console.log(teste.filter((item)=>{
    return !teste2.includes({
        fk_id_livro:item.fk_id_livro
    })
}).map((item)=>item.id))

// const exemplares_disponiveis = await client
// .from("tb_usuario")
// .update({
//     nome:"Peidro"
// })
// .eq("id","04873ff5-5b48-4b99-bb73-0546312c5180")
// .select("id")

// !!exemplares_disponiveis.data
// && console.log(exemplares_disponiveis.data)
