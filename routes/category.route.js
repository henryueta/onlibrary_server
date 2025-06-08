import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const category_router = express.Router();

category_router.get("/category/get",async (req,res)=>{

    try {



        const category_data = await client
        .from("tb_categoria")
        .select("nome")
        .neq("deletado",true)

        !!category_data.data
        ? res.status(200).send(category_data.data)
        : res.status(500).send(category_data.error)

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

export default category_router