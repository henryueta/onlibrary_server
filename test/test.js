//usuario teste:   83e7d691-16e9-43a6-af3b-10509ac9e085
//biblioteca teste:  56dbe82d-b145-4060-a14d-fb5f83d5d731
// livro teste:  34c6fff7-8216-43bf-8f3d-e22ce0cd7bb6

import client from  "../database/supabase.js"
import { onQueryDatabase } from "../functions/query.js"

const exemplares_disponiveis = await client
.from("tb_exemplar")
.select("id",{count:'exact'})
.eq("fk_id_biblioteca","35082ee6-5b83-4ff0-b626-a78864386d84")
.eq("disponivel",true)

let current_exemplaries = [];


// const exemplares = await onQueryDatabase({
//     type:"getEq",
//     table:"tb_exemplar",
//     getParams:"id",
//     eq:{
//         field:"fk_id_biblioteca",
//         val:"35082ee6-5b83-4ff0-b626-a78864386d84"
//     }
// })
const quantidade = 5;


!!exemplares_disponiveis
? current_exemplaries = exemplares_disponiveis.data.slice(0,quantidade)
: console.log(exemplares_disponiveis.error)

!!current_exemplaries
&&
current_exemplaries.forEach((item)=>{
    console.log("alterar "+item+" para reservado")
})

const pendences = quantidade - current_exemplaries.length


console.log("Colocar como quantidade de exemplares pendentes o valor: "+pendences)

