import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const library_router = express.Router();


library_router.get("/library/get/dependencies",(async(req,res)=>{

    try {   
        const {id} = req.query
        const library_data = await client.from("tb_biblioteca")
        .select("nome,telefone,rua,numero,cep,aplicacao_multa,reserva_online,aplicacao_bloqueio")
        .eq('id',id)
        .neq("deletado",true);

        console.log("ID",id)

        !!library_data.data
        &&
        console.log(library_data.data)

        !!library_data.data
        ? res.status(200).send({
            aplicacao_bloqueio:{
                label:!!library_data.data[0].aplicacao_bloqueio
                ? "Habilitar"
                : "Desabilitar",
                value:library_data.data[0].aplicacao_bloqueio
            },
            aplicacao_multa:{
                label:!!library_data.data[0].aplicacao_multa
                ? "Habilitar"
                : "Desabilitar",
                value:library_data.data[0].aplicacao_multa
            },
            cep:library_data.data[0].cep,
            nome:library_data.data[0].nome,
            numero:library_data.data[0].numero,
            reserva_online:{
                label:!!library_data.data[0].reserva_online
                ? "Habilitar"
                : "Desabilitar",
                value:library_data.data[0].reserva_online
            },
            rua:library_data.data[0].rua,
            telefone:library_data.data[0].telefone
        })
        : res.status(500).send({message:library_data.error})
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

}))

export default library_router