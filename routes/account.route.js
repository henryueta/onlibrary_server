import express from "express";
import {onQueryDatabase,onQuerySearch} from "../functions/query.js"
import client from "../database/supabase.js";

const account_router = express.Router();


account_router.get("/account/get/search", async (req,res)=>{

  try {
    const {value,filter,id_biblioteca} = req.query
    
    const account_data = await onQuerySearch({
      value:value,
      filter:filter,
      id_biblioteca:id_biblioteca
    },
    {
      name:"vw_table_perfil_usuario",
      field_list:['username','nome','email','cpf','perfil','situacao']
    })    

    res.status(200).send(account_data)

  } catch (error) {
    console.log(error)
    res.status(500).send({message:error})
  }

})

account_router.get("/account/get/dependencies",async (req,res)=>{

  try{
    let array = {};
    const {id,id_biblioteca} = req.query
    const account_data = await client
    .from("tb_perfil_usuario")
    .select("nome,multa_padrao,prazo_devolucao_padrao,prazo_multa_padrao")
    .eq("fk_id_biblioteca",id_biblioteca)
    .eq("id",id)
    .neq("deletado",true)

    !!account_data.data
    ? (()=>{

      array = {
        nome:account_data.data[0].nome,
        multa_padrao:account_data.data[0].multa_padrao,
        prazo_devolucao_padrao:account_data.data[0].prazo_devolucao_padrao,
        prazo_multa_padrao:account_data.data[0].prazo_multa_padrao
      }


      res.status(200).send(array)
    })()
    : res.status(500).send({message:account_data.error})

  }
  catch(error){
    res.status(500).send({message:error})
  }

})

account_router.post("/account/post",async (req,res)=>{

  try{
    const {fk_id_biblioteca,nome,multa_padrao,prazo_devolucao_padrao,prazo_multa_padrao} = req.body
    //----LOGICA PARA CADASTRAR PERFIS DA BIBLIOTECA--
    const account_id =  await onQueryDatabase({
        type:"post",
        table:"tb_perfil_usuario",
        data:{
            fk_id_biblioteca:fk_id_biblioteca,
            nome:nome,
            multa_padrao:multa_padrao,
            prazo_devolucao_padrao:prazo_devolucao_padrao,
            prazo_multa_padrao:prazo_multa_padrao
        }
    })

    !!account_id
    ? res.status(201).send({message:"success"})
    : res.status(500).send({message:"error"})

  }
  catch(error){
    res.status(500).send({message:"error"})
  }

})


export default account_router;
