import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const reserve_router = express.Router();


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
      .eq("disponivel",true)
      
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




