//usuario teste:   83e7d691-16e9-43a6-af3b-10509ac9e085
//biblioteca teste:  56dbe82d-b145-4060-a14d-fb5f83d5d731
// livro teste:  34c6fff7-8216-43bf-8f3d-e22ce0cd7bb6

import client from  "../database/supabase.js"
const noLibraryanAccount = await client.from("tb_perfil_usuario")
    .select("*")
    .eq("id","98c3261b-8e78-433e-b0e8-bcf01c2e7b18")
    .neq("nome","Bibliotecario")

const noAdminUser = "Docente";

!!noLibraryanAccount.data.length && noAdminUser.toLowerCase() !== "admin" 
? console.log("VALIDO")
: !noLibraryanAccount.data.length && noAdminUser.toLowerCase() === "admin"
? console.log("Cadastrar Admin")
: console.log("Invalido")

    !!noLibraryanAccount.data.length &&
    console.log(noLibraryanAccount.data)