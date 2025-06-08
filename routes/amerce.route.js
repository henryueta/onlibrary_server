import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const amerce_router = express.Router();


amerce_router.get("/amerce/get/dependencies",async(req,res)=>{

    try {
        
        const {id} = req.query
        let array = {};
        const amerce_data = await onQueryDatabase({
            type:"getEq",
            table:"tb_multa",
            getParams:"fk_id_usuario,valor,motivo,data_vencimento,situacao",
            eq:{
                field:"id",
                val:id
            }
        })
        console.log("ID",id)
        !!amerce_data
        ?(async()=>{
            console.log("AMERCE",amerce_data)
            const user_library_data = await onQueryDatabase({
            type:"getEq",
            table:"tb_usuario",
            getParams:"label:username,value:id",
            eq:{
                field:"id",
                val:amerce_data[0].fk_id_usuario
                }
            })

            !!user_library_data
            ? (async()=>{
                console.log("USER",user_library_data)
                array = {
                    usuarios_biblioteca:{
                        label:user_library_data[0].label,
                        value:user_library_data[0].value
                    },
                    valor:amerce_data[0].valor,
                    data_vencimento:amerce_data[0].data_vencimento,
                    situacao:{
                        label:
                        amerce_data[0].situacao.toLowerCase() === "pendente"
                        ? "pendente"
                        : amerce_data[0].situacao.toLowerCase() === "concluido"
                        ? "concluido"
                        : "cancelado",
                        value:
                        amerce_data[0].situacao.toLowerCase() === "pendente"
                        ? "pendente"
                        : amerce_data[0].situacao.toLowerCase() === "concluido"
                        ? "concluido"
                        : "cancelado"
                    
                    },
                    motivo:amerce_data[0].motivo
                }
                res.status(200).send(array)
            })()
            : res.status(500).send({message:user_library_data})

            
        })()
        :res.status(500).send({message:amerce_data})
        

    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

amerce_router.get("/amerce/get/user",async(req,res)=>{

    try{

        const {id} = req.query;
        const amerce_data = await onQueryDatabase({
            type:"getEq",
            table:"vw_table_multa",
            eq:{
                field:"fk_id_usuario",
                val:id
            }
        })
        !!amerce_data
        ? res.status(200).send(amerce_data)
        : res.status(500).send(amerce_data)

    }
    catch(error){
        console.log(error)
        res.status(500).send({message:error})
    }

})

export default amerce_router;
