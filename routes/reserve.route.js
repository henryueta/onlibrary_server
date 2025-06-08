import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const reserve_router = express.Router();

reserve_router.get("/reserve/get/dependencies",async (req,res)=>{

  try {
    const {id} = req.query
    let array = {};
    const reserve_data = await onQueryDatabase({
      type:"getEq",
      table:"tb_reserva",
      getParams:"fk_id_livro,quantidade_total,fk_id_usuario,situacao,data_retirada",
      eq:{
        field:"id",
        val:id
      }
    })

    !!reserve_data
    ?
    (async()=>{
      console.log("resera",reserve_data)

        const reserve_book_data = await onQueryDatabase({
          type:"getEq",
          table:"tb_livro",
          getParams:"label:titulo,value:id",
          eq:{
            field:"id",
            val:reserve_data[0].fk_id_livro
          }
        })

        const reserve_user_data = await onQueryDatabase({
          type:"getEq",
          table:"tb_usuario",
          getParams:"label:username,value:id",
          eq:{
            field:"id",
            val:reserve_data[0].fk_id_usuario
          }
        })

        !!reserve_book_data && !!reserve_user_data
        ? (()=>{  

          console.log("book",reserve_book_data)
          console.log('user',reserve_user_data)

          array = {
            data_retirada:reserve_data[0].data_retirada,
            livros_biblioteca:{
              label:reserve_book_data[0].label,
              value:reserve_book_data[0].value
            },
            quantidade_total:reserve_data[0].quantidade_total,
            situacao:{
              label:reserve_data[0].situacao.toLowerCase(),
              value:reserve_data[0].situacao.toLowerCase()
            },
            usuarios_biblioteca:{
              label:reserve_user_data[0].label,
              value:reserve_user_data[0].value
            }
          }
          res.status(200).send(array)
        })()
        : res.status(500).send({message:[
          reserve_book_data,reserve_user_data
        ]})


    })()
    : res.status(500).send({message:reserve_data})

  } catch (error) {
    res.status(500).send({message:error})
    console.log(error)
  }

})

reserve_router.get("/reserve/get/user",async (req,res)=>{

  try{

    const {id} = req.query
    const reserve_data = await onQueryDatabase({
      type:"getEq",
      table:"vw_table_reserva",
      eq:{
        field:"fk_id_usuario",
        val:id
      }
        
    })

    !!reserve_data
    && console.log(reserve_data)

    !!reserve_data
    ? res.status(200).send(reserve_data)
    : res.status(500).send(reserve_data)

  }
  catch(error){
    console.log(error)
    res.status(500).send({message:error})
  }

})

reserve_router.get("/reserve/get",async(req,res)=>{

  try{

    const {type,id_biblioteca} =  req.query;
    let reserve_id
    switch (type) {
      case "online":

        break;
      case "fisico":

        break;
      default:
        break;
    }

  }
  catch(error){
    res.status(500).send({message:error})
  }

})

reserve_router.post("/reserve/post",async(req,res)=>{

    try{
      //quantidade
      //fk_id_usuario
      //fk_id_biblioteca
      //
      let exemplaries_id = null;
      let reserve_id = null;
      let reserveExemplary_id = null;

      exemplaries_id = await client
      .from("tb_exemplar")
      .select("id",{count:'exact'})
      .eq("fk_id_biblioteca",req.body.fk_id_biblioteca)
      .eq("fk_id_livro",req.body.fk_id_livro)
      .eq("situacao","DISPONIVEL")
      
      let current_exemplaries = [];
      
      current_exemplaries = exemplaries_id.data.slice(0,req.body.quantidade_total)

      const pendences = req.body.quantidade_total - current_exemplaries.length;
    

      (async()=>{

        reserve_id = await client
        .from("tb_reserva")
        .insert({
          fk_id_biblioteca:req.body.fk_id_biblioteca,
          fk_id_usuario:req.body.fk_id_usuario,
          fk_id_bibliotecario:null,
          fk_id_livro:req.body.fk_id_livro,
          data_emissao:(()=>{
              const now = new Date();
              return now.toISOString().split("T")[0]
            })(),
          data_retirada:null,
          situacao:"pendente",
          tipo:"online",
          quantidade_total:req.body.quantidade_total,
          quantidade_pendente:pendences
        })
        .select("id");

        !!reserve_id.data
        &&(()=>{
           console.log(reserve_id.data)
           console.log(reserve_id.data[0])
        })()



       !!reserve_id.data &&
       (async()=>{

        reserveExemplary_id = await client
        .from("tb_reserva_exemplar")
        .insert(current_exemplaries.map((item)=>{
          return ({
              fk_id_exemplar:item.id,
              fk_id_reserva:reserve_id.data[0].id
          })
        })
        )
        .select("fk_id_exemplar")
        
        !!reserveExemplary_id.data
        &&  (async()=>{
         const exemplariesChange =  await onQueryDatabase({
            type:"putIn",
            table:"tb_exemplar",
            data:{
              disponivel:false
            },
            eq:{
              field:"id",
              array:reserveExemplary_id.data.map((item)=>{
                return item.fk_id_exemplar
              })
            }
          })

          !!exemplariesChange
          && console.log(exemplariesChange)

        })()

        !!reserve_id.data
        ? res.status(201).send({message:reserveExemplary_id})
        : res.status(500).send({message:current_exemplaries})
         

       })()


      })()
        

    }
    catch(error){
      console.log(error)
        res.status(500).send({message:error})
    }

})

export default reserve_router;




