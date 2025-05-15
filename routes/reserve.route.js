import express from "express";
import {onQueryDatabase} from "../functions/query.js"

const reserve_router = express.Router();

const setLoanDate = (days)=>{
  const now = new Date();


  const newDate = new Date(now);
  newDate.setDate(newDate.getDate() + days);

  return newDate.toISOString().split('T')[0];
}

reserve_router.post("/reserve/post",async(req,res)=>{

    try{

    }
    catch(error){
        
    }

})

export default reserve_router;




