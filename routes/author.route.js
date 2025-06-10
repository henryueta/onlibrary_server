import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const author_router = express.Router();

author_router.get("/author/get")