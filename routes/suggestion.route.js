import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const suggestion_router = express.Router();


suggestion_router.get("/suggestion/get",async (req,res)=>{

    try {

        const {value} = req.query
        !!value.length
        &&
        (async()=>{

            const suggestion_data = await client
            .rpc('get_suggestion_query', { value: value });

            !!suggestion_data.data
            ? res.status(200).send(suggestion_data.data)
            : !!suggestion_data.error
            ? res.status(500).send(suggestion_data.error)
            : res.status(200).send([])

        })()

    } catch (error) {
        console.log(error)
        res.status(500).send({message:error})
    }

})

export default suggestion_router;