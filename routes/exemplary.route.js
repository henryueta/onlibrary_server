import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const exemplary_router = express.Router();

// exemplary_router.get("/exemplary/get")


exemplary_router.get("/exemplary/get",async (req,res)=>{

  try{
    const {id_biblioteca} = req.query;

    const exemplary_list = await onQueryDatabase({
      type:"getEq",
      table:"tb_exemplar",
      getParams:"disponivel",
      eq:{
        field:"fk_id_biblioteca",
        val:id_biblioteca
      }
    })

    !!exemplary_list.length
    ? res.status(200).send(exemplary_list)
    : res.status(500).send({message:"error"})

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
