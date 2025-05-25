import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const exemplary_router = express.Router();

// exemplary_router.get("/exemplary/get")

exemplary_router.get("/exemplary/get/dependencies",async (req,res)=>{

  try{
    let array = {};
    const {id,id_biblioteca} = req.query
    //livros_biblioteca,numero_tombo,disponivel,setor,prateleira,estante
    const exemplary_data = await client
    .from("tb_exemplar")
    .select("numero_tombo,disponivel,setor,prateleira,estante,fk_id_livro")
    .eq("fk_id_biblioteca",id_biblioteca)
    .eq('id',id)

    !!exemplary_data.data
    ? (async()=>{

      const current_book = await onQueryDatabase({
              type:"getEq",
              table:"tb_livro",
              getParams:"ISBN,titulo,id",
              eq:{
                field:"id",
                val:exemplary_data.data[0].fk_id_livro
              }
            });
              !!current_book.length
              ? (()=>{

                array = {
                  livros_biblioteca:{
                      label:current_book[0].titulo+" ISBN:("+current_book[0].ISBN+")",
                      value:current_book[0].id
                    },
                  numero_tombo: exemplary_data.data[0].numero_tombo,
                  disponivel:exemplary_data.data[0].disponivel 
                  ? {
                    label:"Disponível",
                    value:true
                  }
                  : {
                    label:"Indisponível",
                    value:false
                  },
                  setor:exemplary_data.data[0].setor,
                  prateleira:exemplary_data.data[0].prateleira,
                  estante:exemplary_data.data[0].estante
                }

                res.status(200).send(array)
              })()
              : res.status(500).send({message:current_book})

    })()
    : res.status(500).send({message:exemplary_data.error})

  }
  catch(error){
    res.status(500).send({message:error})
  }

})

exemplary_router.get("/exemplary/get",async (req,res)=>{

  try{
    const {id_biblioteca,id_livro} = req.query;

    const exemplary_list = await client
        .from("tb_exemplar")
        .select("disponivel")
        .eq("fk_id_biblioteca",id_biblioteca)
        .eq("fk_id_livro",id_livro)

    !!exemplary_list.data
    ? (()=>{
      console.log(exemplary_list.data)
      return res.status(200).send(exemplary_list.data)
    })()
    : res.status(500).send({message:exemplary_list})

  }
  catch(error){
    res.status(500).send({message:error})
  }

})

exemplary_router.post("/exemplary/post",async(req,res)=>{

  try{
    //----LOGICA PARA CADASTRAR EXEMPLAR DA BIBLIOTECA--

    (async()=>{
      const exemplary_id = await onQueryDatabase({
        type:"post",
        table:"tb_exemplar",
        data:req.body
      })
      //----CADASTREI EXEMPLAR(tb_exemplar)--

      !!exemplary_id.length
      ? (async()=>{

        const library_exemplary = await client.from("tb_biblioteca_livro")
        .select("fk_id_livro")
        .eq("fk_id_biblioteca",req.body.fk_id_biblioteca)
        .neq("fk_id_livro",req.body.fk_id_livro)
              
        !!library_exemplary.data.length 
        ?(async()=>{

          const bookLibrary_id =
        await onQueryDatabase({ 
            type:"post",
            table:"tb_biblioteca_livro",
            data:{
              fk_id_livro:req.body.fk_id_livro,
              fk_id_biblioteca:req.body.fk_id_biblioteca
            }
          }) 

        //----CADASTREI LIVRO DO EXEMPLAR NA BIBLIOTECA(tb_biblioteca_livro)--
        !!bookLibrary_id.length
        ? res.status(200).send({message:"success"})
        :(()=>{
          console.log(bookLibrary_id.error)
          res.status(500).send({message:bookLibrary_id.error})
        })

        })()
        : res.status(200).send({message:"success"})
      })()
      :res.status(500).send({message:"error"})
    })()

  }
  catch(error){
    console.log(error)
    res.status(500).send({message:"error"})
  }

})

export default exemplary_router;
