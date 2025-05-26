import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const category_router = express.Router();

category_router.get("/category/get",async (req,res)=>{

    try {

        const category_data = await onQueryDatabase({
            type:"get",
            table:"tb_categoria",
            getParams:"nome"
        })

        !!category_data
        ? res.status(200).send(category_data)
        : res.status(500).send(category_data)

    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

export default category_router