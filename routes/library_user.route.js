import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const library_user_router = express.Router();

library_user_router.get("/library_user/get/dependencies",async(req,res)=>{

  try{
      let array = {};
      const {id,id_biblioteca} = req.query
      const library_user_data = await client.from("tb_usuario_biblioteca")
      .select("numero_matricula,tipo_usuario,fk_id_perfil_usuario")
      .eq("id",id)
      .eq("fk_id_biblioteca",id_biblioteca)
  
                  !!library_user_data.data
                  &&
                  (async()=>{
                      const accounts_id =  await client
                    .from("tb_perfil_usuario")
                    .select("label:nome,value:id")
                    .eq("fk_id_biblioteca",id_biblioteca)
                    .eq("id",library_user_data.data[0].fk_id_perfil_usuario)
                    

                    !!accounts_id.data 
                    &&
                    (async()=>{
                      array = {
                      numero_matricula:library_user_data.data[0].numero_matricula,
                      tipo_usuario: {
                        label:library_user_data.data[0].tipo_usuario === "admin"
                        ? "Administrador"
                        : "Comum",
                        value:library_user_data.data[0].tipo_usuario
                      },
                      perfis_biblioteca: accounts_id.data[0]
                    }
                    console.log(array)
                    res.status(200).send(array)
                    })()
                  })()
      
  }
  catch(error){
    res.status(500).send({message:error})
  }

})


library_user_router.get("/library_user/check",async (req,res)=>{

  try{
    (async()=>{
      const {id_usuario,id_biblioteca} = req.query
      const library_user_data = await client.from("tb_usuario_biblioteca")
                        .select("situacao")
                        .eq("fk_id_usuario",id_usuario)
                        .eq("fk_id_biblioteca",id_biblioteca);
                        
                        const user_armece = await client.from("tb_multa")
                        .select("*")
                        .eq("fk_id_usuario",id_usuario)
                        .neq("situacao","concluido")
                        .neq("situacao","cancelado")
        
                        !!user_armece.data
                        ? res.status(200).send(library_user_data.data)
                        : res.status(500).send({message:"error"})
    })()
  }
  catch(error){
    res.status(500).send({message:"error"})
  }

})

library_user_router.post("/library_user/post", async (req,res)=>{

  try{
    //----LOGICA PARA CADASTRAR USUÁRIOS PARTICULARES DA BIBLIOTECA--

    const user_library_checkout = await onQueryDatabase({
      type:"getEq",
      table:"tb_usuario",
      getParams:"cpf",
      eq:{
        field:"cpf",
        val:req.body.cpf
      }
    })
    
    const noLibraryanAccount = await client.from("tb_perfil_usuario")
    .select("*")
    .eq("id",req.body.fk_id_perfil_usuario)
    .neq("nome","Bibliotecario");

    const noAdminUser = req.body.tipo_usuario;
    let isValidated = false;

    !!noLibraryanAccount.data.length && noAdminUser.toLowerCase() !== "admin" 
    ? isValidated = true
    : !noLibraryanAccount.data.length && noAdminUser.toLowerCase() === "admin"
    ? isValidated = true
    : isValidated = false;
    

    isValidated 
   ? !!user_library_checkout.length 
   ? (async()=>{

     const user_library_id = await onQueryDatabase({
      type:"post",
      table:"tb_usuario_biblioteca",
      data:req.body   
    })
    
    !!user_library_id
      ?res.status(201).send({message:"success"})
      : res.status(500).send({message:"error"})
   })()
   : res.status(500).send({message:"Campo cpf inválido para usuário"})
   : res.status(500).send({message:"Bibliotecários devem ser administradores do sistema!"})
  }
  catch(error){
    res.status(500).send({message:"error"})
  }

})

export default library_user_router;
