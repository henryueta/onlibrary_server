import client from  "../database/supabase.js"

// Contar registros da tabela 'tb_usuario'
async function contarUsuarios() {
  const tableCount = await client
    .from('tb_emprestimo')
    .select('situacao', { count: 'exact'})
    .eq("fk_id_biblioteca","");

  !!tableCount
  &&console.log(tableCount.data.map((item)=>{
    return ({
        quantidade:tableCount.count,
        aviso:tableCount.data.aviso === "vencido" ? true : false
    })
  }))
}

contarUsuarios();
