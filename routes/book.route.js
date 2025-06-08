import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const book_router = express.Router();

book_router.get("/book/get/search",async (req,res)=>{

  try {
    const {filter,value} = req.query
    const book_data = await onQueryDatabase({
      type:"getEq",
      table:"tb_livro",
      getParams:"titulo,capa",
      eq:{
        field:filter,
        val:value
      }
    })

    !!book_data
    ? res.status(200).send(book_data)
    : res.status(500).send(book_data)

  } catch (error) {
    res.status(500).send({message:error})
    console.log(error)
  }

})

book_router.get("/book/libraries",async (req,res)=>{
  try {
    const {id} = req.query

    const libraries = await onQueryDatabase({
      type:"getEq",
      table:"vw_biblioteca_reserva_exemplar",
      getParams:"*",
      eq:{
        field:"fk_id_livro",
        val:id
      }
    })

    !!libraries
    ? res.status(200).send(libraries)
    : res.status(500).send({message:libraries})

  } catch (error) {
    res.status(500).send({message:error})
  }
})

book_router.get("/book/list",async (req,res)=>{

    const {categoria} = req.query

    try{

      const books_data = await client
      .from("tb_livro")
      .select("id,titulo,capa")
      .neq("deletado",true)

      !!books_data.data
      ? res.status(200).send(books_data.data)
      : res.status(200).send({message:books_data.error})
    }
    catch(error){
      res.status(500).send({message:error})
    }

})

book_router.get("/book/get",async (req,res)=>{

  const {id} = req.query

  try{
      const book = await onQueryDatabase({
        type:"getEq",
        table:"vw_livro",
        getParams:"*",
        eq:{
          field:"id",
          val:id
        }
      })

      !!book
      ? res.status(200).send(book[0])
      : res.status(500).send({message:book})
  }
  catch(error){
      res.status(500).send({message:error})
  }

})

book_router.post("/book/post",async (req,res)=>{

  try{
    console.log(req.body)
      const check_book = await onQueryDatabase({
        type:"getEq",
        table:"tb_livro",
        getParams:"isbn",
        eq:{
          field:"isbn",
          val:req.body.isbn
        }
      })

      console.log(check_book)

      !!check_book.length
      ? res.status(500).send({message:"Livro já cadastrado!"})
      : res.status(200).send({message:"success"})
      //----LOGICA PARA CADASTRAR LIVROS----

  // const  bookId = await onQueryDatabase({
  //       type:"post",
  //       table:"tb_livro",
  //       data:{
  //           ISBN:isbn,
  //           titulo:titulo,
  //           descricao:descricao,
  //           ano_lancamento:ano_lancamento
  //         }
  //     })
  //     !!bookId &&
  //
  //     (async()=>{
  //
  //
  //     const  bookAuthorsId = await onQueryDatabase({
  //         type:"post",
  //         table:"tb_livro_autor",
  //         data:autores.map((item)=>{
  //           return ({
  //             fk_id_livro:bookId,
  //             fk_id_autor:item
  //           })
  //         }),
  //         id:null
  //       })
  //
  //     const  bookCategoriesId = await onQueryDatabase({
  //         type:"post",
  //         table:"tb_livro_categoria",
  //         data:categorias.map((item)=>{
  //           return ({
  //             fk_id_livro:bookId,
  //             fk_id_categoria:item
  //           })
  //         }),
  //         id:null
  //       })
  //
  //     const  bookPublishersId = await onQueryDatabase({
  //         type:"post",
  //         table:"tb_livro_editora",
  //         data:editoras.map((item)=>{
  //           return ({
  //             fk_id_livro:bookId,
  //             fk_id_editora:item
  //           })
  //         }),
  //         id:null
  //       })
  //
  //     const  bookGendersId = await onQueryDatabase({
  //         type:"post",
  //         table:"tb_livro_genero",
  //         data:generos.map((item)=>{
  //           return ({
  //             fk_id_livro:bookId,
  //             fk_id_genero:item
  //           })
  //         }),
  //         id:null
  //       })
  //
  //       !!bookGendersId && !!bookGendersId.error ? console.log(bookGendersId.error) : console.log(bookGendersId)
  //       !!bookAuthorsId && !!bookAuthorsId.error ? console.log(bookAuthorsId.error) : console.log(bookAuthorsId)
  //       !!bookCategoriesId && !!bookCategoriesId.error ? console.log(bookCategoriesId.error) : console.log(bookCategoriesId)
  //       !!bookPublishersId && !!bookPublishersId.error ? console.log(bookPublishersId.error) : console.log(bookPublishersId)
  //       res.status(200).send({message:"success"})
  //     })()
  }
  catch(error){
    console.log(error)
    res.status(500).send({message:"error"})
  }

})

export default book_router;
