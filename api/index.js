import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import client from "../database/supabase.js";
import {onQueryDatabase,onCheckValue,onGetToken} from "../functions/query.js"
import user_route from "../routes/user.route.js";
import table_router from "../routes/table.route.js";
import loan_router from "../routes/loan.route.js";
import account_router from "../routes/account.route.js";
import library_user_router from "../routes/library_user.route.js";
import book_router from "../routes/book.route.js";
import exemplary_router from "../routes/exemplary.route.js";
import notification_router from "../routes/notification.route.js";

const server = express();


server.use(express.json());

server.use(cors({
    origin:true,
    credentials:true
}))

server.use(cookieParser())

server.use(user_route);
server.use(table_router);
server.use(book_router);
server.use(exemplary_router);
server.use(loan_router);
server.use(account_router);
server.use(library_user_router);
server.use(notification_router);

server.get("/books",(req,res)=>{

    try{
        res.status(200).send(JSON.stringify({quantidade:120}))
    }
    catch(error){
        res.status(201).send({message:error})
    }

})

server.post("/data/create", async (req,res)=>{

    try{
        const {type,userId} = req.query

        switch (type) {

            case "library":
                try
                {
                console.log(req.body)
                let libraryId = null;
                let accountId =null;
                let libraryUserId = null;

                const current_libraryCpf = await onQueryDatabase({
                  type:"getEq",
                  table:"tb_usuario",
                  getParams:"cpf",
                  eq:{
                    field:"id",
                    val:userId
                  }
                })
                console.log(current_libraryCpf)
                libraryId = await onQueryDatabase({
                        type:"post",
                        table:"tb_biblioteca",
                        data:{
                            nome:req.body.nome,
                            cep:req.body.endereco.cep,
                            numero:req.body.endereco.numero,
                            rua:req.body.endereco.rua,
                            telefone:req.body.telefone,
                            aplicacao_multa:req.body.aplicacao_multa,
                            aplicacao_bloqueio:req.body.aplicacao_bloqueio,
                            reserva_online:req.body.reserva_online
                        }
                      })
                      console.log(libraryId)
                !!libraryId && current_libraryCpf
                ? (async ()=>{
                    accountId = await onQueryDatabase({
                        type:"post",
                        table:"tb_perfil_usuario",
                        data:{
                            fk_id_biblioteca:libraryId,
                            nome:"Bibliotecario",
                            multa_padrao:"0",
                            prazo_devolucao_padrao:"0"
                        }
                    })
                    !!accountId
                    ?  libraryUserId = await onQueryDatabase({
                        type:"post",
                        table:"tb_usuario_biblioteca",
                        data:{
                            fk_id_biblioteca:libraryId,
                            fk_id_usuario:userId,
                            fk_id_perfil_usuario:accountId,
                            tipo_usuario:"admin_master",
                            numero_matricula:0,
                            cpf:current_libraryCpf[0]
                        }
                    })
                    : null
                    !!accountId
                    && res.status(201).send({message:"success"})
                })()
                : res.status(500).send({message:"error"})}
                catch(error){
                    console.log(error)
                    res.status(500).send({message:error})
                }

            break;
          case "book":
          let bookId = null;
          let bookAuthorsId = null;
          let bookCategoriesId = null;
          let bookPublishersId = null;
          let bookGendersId = null;

                const {
                    ISBN,
                    titulo,
                    descricao,
                    capa,
                    ano_lancamento,
                    autores,
                    categorias,
                    generos,
                    editoras
                    } = req.body

                     const reqArray = Object.entries(req.body)
                     console.log(reqArray)
                    reqArray.forEach((item,index)=>{
                        let current_value = null;
                        return typeof item[1] !== "object" && typeof item[1] !== "number" &&

                      (()=>{
                        current_value = (onCheckValue({
                            value: item[1],
                            type:item[0]
                            }))

                           return !!current_value &&
                            !current_value.isValidated
                            ?
                            res.status(500).send({
                                error:"",
                                message:current_value.message,
                                status:500,
                            })
                            : console.log("validado: "+current_value.message)
                      })()
                    })

                    res.status(201).send({message:"success"})
            // bookId = await onQueryDatabase({
            //     type:"post",
            //     table:"tb_livro",
            //     data:{
            //         ISBN:ISBN,
            //         titulo:titulo,
            //         descricao:descricao,
            //         ano_lancamento:ano_lancamento
            //       }
            //   })
            //   !!bookId &&

            //   (async()=>{


            //     bookAuthorsId = await onQueryDatabase({
            //       type:"post",
            //       table:"tb_livro_autor",
            //       data:autores.map((item)=>{
            //         return ({
            //           fk_id_livro:bookId,
            //           fk_id_autor:item
            //         })
            //       }),
            //       id:null
            //     })

            //     bookCategoriesId = await onQueryDatabase({
            //       type:"post",
            //       table:"tb_livro_categoria",
            //       data:categorias.map((item)=>{
            //         return ({
            //           fk_id_livro:bookId,
            //           fk_id_categoria:item
            //         })
            //       }),
            //       id:null
            //     })

            //     bookPublishersId = await onQueryDatabase({
            //       type:"post",
            //       table:"tb_livro_editora",
            //       data:editoras.map((item)=>{
            //         return ({
            //           fk_id_livro:bookId,
            //           fk_id_editora:item
            //         })
            //       }),
            //       id:null
            //     })

            //     bookGendersId = await onQueryDatabase({
            //       type:"post",
            //       table:"tb_livro_genero",
            //       data:generos.map((item)=>{
            //         return ({
            //           fk_id_livro:bookId,
            //           fk_id_genero:item
            //         })
            //       }),
            //       id:null
            //     })

            //     !!bookGendersId && !!bookGendersId.error ? console.log(bookGendersId.error) : console.log(bookGendersId)
            //     !!bookAuthorsId && !!bookAuthorsId.error ? console.log(bookAuthorsId.error) : console.log(bookAuthorsId)
            //     !!bookCategoriesId && !!bookCategoriesId.error ? console.log(bookCategoriesId.error) : console.log(bookCategoriesId)
            //     !!bookPublishersId && !!bookPublishersId.error ? console.log(bookPublishersId.error) : console.log(bookPublishersId)
            //     res.status(200).send({message:"success"})
            //   })()

          }
    }
    catch(error){
      res.status(500).send({message:error})
    }

})



const bookData = [
    {
        livraryId:"11",
        id:"A"+Math.random()*20,
        titulo:"A névoa da floresta",
        autor:"Endrick",
        editora:"ACJ",
        categoria:"Adulto",
        genero:"Suspense",
        quantidade:"3",
        estante:"1",
        prateleira:"C",
        setor:"Suspense"
    },
    {
        livraryId:"11",
        id:"A"+Math.random()*20,
        titulo:"A chuva da floresta",
        autor:"Endrick",
        editora:"ACJ",
        categoria:"Adulto",
        genero:"Suspense",
        quantidade:"3",
        estante:"1",
        prateleira:"C",
        setor:"Suspense"
    },
    {
        livraryId:"11",
        id:"A"+Math.random()*20,
        titulo:"A luz da caverna",
        autor:"Herick",
        editora:"BBD",
        categoria:"Infantil",
        genero:"Drama",
        quantidade:"3",
        estante:"1",
        prateleira:"C",
        setor:"Drama"
    },
    {
        livraryId:"22",
        id:"A"+Math.random()*20,
        titulo:"A sombra da caverna",
        autor:"Emilly",
        editora:"AWSD",
        categoria:"Adulto",
        genero:"Suspense",
        quantidade:"2",
        estante:"3",
        prateleira:"A",
        setor:"Suspense"
    },
    {
        livraryId:"22",
        id:"A"+Math.random()*20,
        titulo:"A janela na caverna",
        autor:"Penny",
        editora:"AWAF",
        categoria:"Adulto",
        genero:"Suspense",
        quantidade:"1",
        estante:"1",
        prateleira:"C",
        setor:"Suspense"
    },
]

const libraries = [

    {
        id:"11",
        name:"Biblioteca Cora Coralina",
    },
    {
        id:"22",
        name:"Biblioteca Vinicíus Moraes"
    }

]

const admin_library = [

    {
        id_lib:"11",
        id_admin:"KJK1"
    },
    {
        id_lib:"22",
        id_admin:"KJK1"
    }

]

server.get("/tables/data",async (req,res)=>{
    let tableData = [];

    const onGetView =async (view,id,id_biblioteca)=>{
 
                try{
                    id != undefined
                ? tableData = [

                ]
                :  tableData = await onQueryDatabase({
                  type:"getEq",
                  table:view,
                  getParams:"*",
                  eq:{
                    field:"fk_id_biblioteca",
                    val:id_biblioteca
                  }  
                })
                !!tableData
                && console.log(tableData)

                !!tableData
                ? res.status(200).send(tableData)
                : (()=>{
                    console.log("AA")
                    res.status(500).send([])
                })()   
                }
                catch(error){
                    console.log(error)
                }
    }

    try{
        const {type,id,id_biblioteca} = req.query

        switch(type){

            case "book":
              onGetView("vw_table_livro",id,id_biblioteca)
            break;
            case "exemplary":
                (async()=>{
                    await onGetView("vw_table_exemplar",id,id_biblioteca)
                })()
            break;
            case "library_user":
                (async()=>{
                    await onGetView("vw_table_usuario_biblioteca",id,id_biblioteca)
                })()
               break;
               case "account":
                (async()=>{
                    await onGetView("vw_table_perfil_usuario",id,id_biblioteca)
                })()
               break;
               case "loan":
                (async()=>{
                    /////////////////////////////apenas os disponíveis 
                    await onGetView("vw_table_emprestimo",id,id_biblioteca)
                })()
               break;
               case "amerce":
                 (async()=>{
                    await onGetView("vw_table_multa",id,id_biblioteca)
                })()
               break;
        }
    }
    catch(error){
        console.log(error)
        res.status(200).send({message:error})
    }
})

let queryStatus = {

    hasAuth:false,
    error:""

}

server.post("/register",(req,res)=>{

    try{
        console.log(req)
        const {step} = req.query

        switch(step){

            case "name":
                console.log(req.body)
                const {nome,sobrenome,cpf} = req.body
                queryStatus = {...queryStatus,hasAuth:true}
            break;
            case "contact":
                const {username,email} = req.body
                queryStatus = {...queryStatus,hasAuth:true}
            break;
            case "password":

            break;
            default:

            break;
        }

        res.status(201).send(queryStatus)
    }
    catch(error){
        queryStatus = {...queryStatus,hasAuth:false,error:error}
       res.status(500).send(queryStatus)
    }

})

server.get("/get",(req,res)=>{

    try{
        const {value,quantidade,filter} = req.query;
    }
    catch(error){

    }
})

let current_libraries = [

]

server.get("/auth/library", async (req,res)=>{

    try{
        console.log(req)
        console.log(req.cookies)
        const token = JSON.parse(req.cookies.user_id || "")
        

        const user_libraries = await client.from("tb_usuario_biblioteca").select("fk_id_biblioteca").eq("fk_id_usuario",token.user_id)
    //    const admin_libraries =  admin_library.filter((item)=>item.id_admin === token.user_id)
        console.log(user_libraries.data)

        const current_librariesId = user_libraries.data.map((item)=>{
            return item.fk_id_biblioteca
        })
        console.log(current_librariesId)

        const current_userLibraries = await client.from("tb_biblioteca").select("nome,id").in("id",current_librariesId)
        console.log(current_userLibraries)

        !!current_userLibraries.data
        ? res.status(200).send(current_userLibraries.data)
        : res.status(500).send({message:"error"})


    }
    catch(error){
        console.log(error)
        res.status(500).send({message:error})
    }

})


server.listen(5900,(error)=>{
    if(error){
        console.log(error);
    }
    console.log('success');
})
