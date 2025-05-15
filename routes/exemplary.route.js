import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const exemplary_router = express.Router();

// exemplary_router.get("/exemplary/get")


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
        ? res.status(200).send({message:""})
        :(()=>{
          console.log(bookLibrary_id.error)
          res.status(500).send({message:bookLibrary_id.error})
        })
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
