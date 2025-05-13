import express from "express";
import {onQueryDatabase} from "../functions/query.js"

const library_user_router = express.Router();

library_user_router.post("/library_user/post", async (req,res)=>{

  try{
    //----LOGICA PARA CADASTRAR USUÁRIOS PARTICULARES DA BIBLIOTECA--

    const user_library_id = onQueryDatabase({
      type:"post",
      table:"tb_usuario_biblioteca",
      data:req.body
    })
    !!user_library_id
      ?res.status(201).send({message:"success"})
      : res.status(500).send({message:"error"})
  }
  catch(error){
    res.status(500).send({message:"error"})
  }

})

export default library_user_router;
