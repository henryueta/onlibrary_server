import express from "express";
import {onQueryDatabase} from "../functions/query.js";
import client from '../database/supabase.js';
const table_router = express.Router();

table_router.get("/data/group",async(req,res)=>{
    try{
        let array = {};
///////////////////////////////////////
        const {type,id,userId} = req.query
        ///////////////////////////////

        switch (type) {
            case "library_user":
            (async()=>{
              const users_id = await (async()=>{

               const current_libraryUsersId = await client.from("tb_usuario_biblioteca")
              .select("fk_id_usuario")
              .eq("fk_id_biblioteca",id);

               return !!current_libraryUsersId.data
                ? client.from("tb_usuario")
                .select("label:username,value:id")
                .not('id','in',`(${current_libraryUsersId.data.map((item)=>item.fk_id_usuario)})`)
                : []
              })()



              array = {
              ////cpf
              usuarios: await users_id.data,
              perfis_biblioteca: await onQueryDatabase({
                type:"getEq",
                table:"tb_perfil_usuario",
                getParams:"label:nome,value:id",
                eq:{
                  field:"fk_id_biblioteca",
                  val:id
                }
              })
            }
            res.status(200).send(array)
            })()
            
            break;
            case "book":
            array = {
              autores:await onQueryDatabase({
                type:"get",
                table:"tb_autor",
                getParams:"label:nome,value:id"
              }),

              categorias:await onQueryDatabase({
                type:"get",
                table:"tb_categoria",
                getParams:"label:nome,value:id"
              }),

              editoras:await onQueryDatabase({
                type:"get",
                table:"tb_editora",
                getParams:"label:nome,value:id"
              }),

              generos: await onQueryDatabase({
                type:"get",
                table:"tb_genero",
                getParams:"label:nome,value:id"
              }),

            }
                  res.status(200).send(array)
                break;
            case "exemplary":
            const current_books = await onQueryDatabase({
              type:"get",
              table:"tb_livro",
              getParams:"ISBN,titulo,id"
            });
              !!current_books.length
              && (()=>{
                array = {
                  livros_biblioteca:current_books.map((item,index)=>{
                    return ({
                      label:item.titulo+" ("+item.ISBN+")",
                      value:item.id
                    })
                  })
                }
                res.status(200).send(array)
              })()

            break;
            case "loan":
            const users_id = (async()=>{

             // const current_userId = await onQueryDatabase({
             //   type:"getEq",
             //   table:"tb_usuario_biblioteca",
             //   getParams:"fk_id_usuario,id",
             //   eq:{
             //     field:"fk_id_biblioteca",
             //     val:id
             //   }
             // })

              

             const current_userId = await client
             .from('tb_usuario_biblioteca')
             .select('fk_id_usuario,id')
             .eq("fk_id_biblioteca",id)
             .eq("tipo_usuario","comum")
             .neq("situacao","bloqueado");

             console.log(current_userId.data)

             const current_userLibraryId =  
             !!current_userId.data.length
             ? await onQueryDatabase({
               type:"getIn",
               table:"tb_usuario_biblioteca",
               getParams:"value:id",
               eq:{
                 field:"fk_id_usuario",
                 array:current_userId.data.map((item)=>item.fk_id_usuario)
               }
             })
             : [];

            //  const current_user = !!current_userLibraryId
            //  ? await onQueryDatabase({
            //    type:"getIn",
            //    table:"tb_usuario",
            //    getParams:"label:username",
            //    eq:{
            //      field:"id",
            //      array:current_userId.map((item)=>item.fk_id_usuario)
            //    }
            //  })
            //  : []

             const formated_users = await onQueryDatabase({
               type:"getIn",
               table:"vw_usuario_biblioteca",
               getParams:"value:usuario_biblioteca_id,label:username",
               eq:{
                 field:"usuario_biblioteca_id",
                 array:current_userId.data.map((item)=>item.id)
               }
             })

             return !!formated_users
             ? formated_users
             : []

           })()

           const exemplars_id = (async()=>{
            const current_exemplaryId = await client.from("tb_exemplar")
              .select("label:numero_tombo,value:id")
              .eq("fk_id_biblioteca",id)
              .eq("disponivel",true)

            return !!current_exemplaryId.data
            ? current_exemplaryId.data
            : [];
           })()

            array  = {
              exemplares_biblioteca: await exemplars_id,
                // exemplares_biblioteca: await onQueryDatabase({
                //   type:"getEq",
                //   table:"tb_exemplar",
                //   getParams:"label:numero_tombo,value:id",
                //   eq:{
                //     field:"fk_id_biblioteca",
                //     val:id
                //   }
                // }),
                usuarios_biblioteca:await users_id


            }
            users_id&&
            (()=>{
              console.log(users_id)
                res.status(200).send(array)
            })()

              break;

            default:
                break;
        }
    }
    catch(error){
      console.log(error)
        res.status(500).send({message:error})
    }
})



table_router.get("/count",async (req,res)=>{
    try{
        const {type,id} = req.query

    let count =  0;
    let warn = false;
        //parametros URL: usar [type(livro,usuario_biblioteca...),id(da biblioteca)]

        //livro: retornar [autores,categorias,generos,editoras]

        //usuario_biblioteca: retornar [usuarios,perfis_biblioteca]

        //emprestimo: retornar [exemplares_biblioteca,usuarios_biblioteca]

        //reserva: retornar [exemplares_biblioteca,usuarios_biblioteca]

        //multa: retornar [usuarios_biblioteca]

        //exemplar: retornar [livros_biblioteca]
    (async()=>{
      switch (type) {
          case "book":
          count = 0;
            warn = false
              break;
          case "library_user":
          const userCount = await client
            .from('tb_usuario_biblioteca')
            .select('*', { count: 'exact'})
            .eq("fk_id_biblioteca",id);

          !!userCount
          &&
          (()=>{
            console.log(userCount.count+"AAA")
                  count=userCount.count,
                  warn=false
            })()
          break;
          case "loan":
          const loanCount = await client
            .from('tb_emprestimo')
            .select('situacao', { count: 'exact'})
            .eq("fk_id_biblioteca",id);

          !!loanCount
          &&
          (()=>{

                  count=loanCount.count,
                  warn=!!loanCount.data.filter((item)=>item.situacao === "vencido").length ? true : false
                
            })()
            break;
            case "amerce":
             const amerceCount = await client
            .from('tb_multa')
            .select('situacao', { count: 'exact'})
            .eq("fk_id_biblioteca",id)
            !!amerceCount
            &&
            (()=>{

                    count=amerceCount.count,
                    warn=!!amerceCount.data.filter((item)=>item.situacao === "vencido").length ? true : false

            })() 
            break;
          default:
              break;


        }
        res.status(200).send({quantidade:count,aviso:warn})

    })()

    }catch(error){
        res.status(201).send({message:error})
    }

})




export default table_router;
