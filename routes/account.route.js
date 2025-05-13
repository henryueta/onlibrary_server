import express from "express";
import {onQueryDatabase} from "../functions/query.js"

const account_router = express.Router();

account_router.post("/account/post",async (req,res)=>{

  try{
    const {fk_id_biblioteca,nome,multa_padrao,prazo_devolucao_padrao} = req.body
    //----LOGICA PARA CADASTRAR PERFIS DA BIBLIOTECA--
    const account_id =  await onQueryDatabase({
        type:"post",
        table:"tb_perfil_usuario",
        data:{
            fk_id_biblioteca:fk_id_biblioteca,
            nome:nome,
            multa_padrao:multa_padrao,
            prazo_devolucao_padrao:prazo_devolucao_padrao
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
