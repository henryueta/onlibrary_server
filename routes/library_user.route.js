import express from "express";
import {onQueryDatabase, onQuerySearch} from "../functions/query.js"
import client from "../database/supabase.js";

const library_user_router = express.Router();

library_user_router.get("/library_user/get/search", async (req,res)=>{

  try {
    const {value,filter,id_biblioteca} = req.query
    
    const library_user_data = await onQuerySearch({
      value:value,
      filter:filter,
      id_biblioteca:id_biblioteca
    },
    {
      name:"vw_table_usuario_biblioteca",
      field_list:['username','nome','email','cpf','perfil','situacao']
    })

    res.status(200).send(library_user_data)

  } catch (error) {
    console.log(error)
    res.status(500).send({message:error})
  }

})

library_user_router.get("/library_user/get/dependencies",async(req,res)=>{

  try{
      let array = {};
      const {id,id_biblioteca} = req.query
      const library_user_data = await client.from("tb_usuario_biblioteca")
      .select("numero_matricula,cpf,tipo_usuario,fk_id_perfil_usuario,fk_id_usuario,situacao")
      .eq("id",id)
      .eq("fk_id_biblioteca",id_biblioteca)
      .neq("deletado",true)

                  !!library_user_data.data
                  &&
                  (async()=>{
                      const accounts_id =  await client
                    .from("tb_perfil_usuario")
                    .select("label:nome,value:id")
                    .eq("fk_id_biblioteca",id_biblioteca)
                    .eq("id",library_user_data.data[0].fk_id_perfil_usuario)
                    .neq("deletado",true)



                    !!accounts_id.data
                    ? (async ()=>{

                      const user_id = await client
                      .from("tb_usuario")
                      .select("label:username,value:id")
                      .eq("id",library_user_data.data[0].fk_id_usuario)
                      .neq("deletado",true)

                      !!user_id.data 
                    &&
                    (async()=>{
                      array = {
                      usuarios:{
                        label:user_id.data[0].label,
                        value:user_id.data[0].value
                      },
                      situacao:{
                        label:library_user_data.data[0].situacao,
                        value:library_user_data.data[0].situacao
                      },
                      numero_matricula:library_user_data.data[0].numero_matricula,
                      cpf:library_user_data.data[0].cpf,
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
                    : res.status(500).send({message:accounts_id.error})

                    
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
                        .eq("fk_id_biblioteca",id_biblioteca)
                        .neq("deletado",true);

                        const user_armece = await client.from("tb_multa")
                        .select("*")
                        .eq("fk_id_usuario",id_usuario)
                        .neq("situacao","concluido")
                        .neq("situacao","cancelado")
                        .neq("deletado",true);

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

library_user_router.delete("/library_user/delete",async (req,res)=>{

  try {
    const {id} = req.query
    console.log("ID",id)
    const library_user_data = await onQueryDatabase({
      type:"getEq",
      table:"tb_usuario_biblioteca",
      getParams:"deletado,fk_id_biblioteca",
      eq:{
        field:"id",
        val:id
      }
    })

    !!library_user_data
    &&
    console.warn("DELETADO",library_user_data)

    !!library_user_data
    &&
    (async()=>{

      const view = await onQueryDatabase({
      type:"getEq",
      table:"vw_table_perfil_usuario",
      eq:{
        field:"fk_id_biblioteca",
        val:library_user_data[0].fk_id_biblioteca
      }
    })

    !!library_user_data && view
    ? res.status(200).send(view)
    : res.status(500).send({message:"error"})

    })()

  } catch (error) {
    console.log(error)
    res.status(500).send({message:error})
  }

})

export default library_user_router;
