import express from "express";
import {onGetToken} from "../functions/query.js"

const user_router = express.Router();


user_router.post("/check/account",async (req,res)=>{
    console.log(req.body)
    try{
    const current_id = await onGetToken(req.body)
        console.log(current_id)
        res.status(200).send({id:current_id})
    }
    catch(error){
      console.log(error)
        res.status(500).send({message:error})
    }

})

user_router.post("/create/account",async (req,res)=>{

    try{

        let userId = null;
        userId = await onQueryDatabase({
            type:"post",
            table:"tb_usuario",
            data:{
                nome:req.body.nome,
                sobrenome:req.body.sobrenome,
                email:req.body.email,
                cpf:req.body.cpf,
                senha:req.body.senha,
                situacao:"ativo",
                username:req.body.username
            }
        })
        console.log(userId)
        !!userId
        ? res.status(201).send({id:userId})
        : res.status(500).send({message:"error"})
    }
    catch(error){
        res.status(500).send({message:error})
    }

})

export default user_router
