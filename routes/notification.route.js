import express from "express";
import {onQueryDatabase} from "../functions/query.js";
import client from '../database/supabase.js';
const notification_router = express.Router();

notification_router.get("/notification/get",async (req,res)=>{

    try{
        const {id_usuario,id_biblioteca,type} = req.query;
        switch (type) {
            case "admin":
                    (async()=>{
                        const notification_data = await client.from("tb_notificacao")
                        .select("*")
                        .eq("fk_id_usuario",id_usuario)
                        .eq("fk_id_biblioteca",id_biblioteca)
                        .eq("tipo","admin");


                        !!notification_data
                        ? res.status(200).send(notification_data.data)
                        : res.status(500).send({message:"error"})
                    })()
                break;
            case "comum":
                    (async()=>{
                      const notification_data = await client.from("tb_notificacao").select("*").eq("fk_id_usuario",id_usuario).eq("tipo","comum");


                      !!notification_data
                      ? res.status(200).send(notification_data.data)
                      : res.status(500).send({message:"error"})
                    })()
                break;
            default:
                break;
        }
    }
    catch(error){
        res.status(500),send({message:error})
    }

})

export default notification_router;
