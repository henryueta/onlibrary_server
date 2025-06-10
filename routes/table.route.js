import express from "express";
import {onQueryDatabase} from "../functions/query.js";
import client from '../database/supabase.js';
const table_router = express.Router();

table_router.get("/data/week",async(req,res)=>{

  try {
    
    const table_data = ""

    

  } catch (error) {
    res.status(500).send({message:error})
    console.log(error)
  }

})

table_router.get("/data/group",async(req,res)=>{
    try{
        let array = {};
///////////////////////////////////////
        const {type,id,userId} = req.query
        ///////////////////////////////
             //parametros URL: usar [type(livro,usuario_biblioteca...),id(da biblioteca)]

        //livro: retornar [autores,categorias,generos,editoras]

        //usuario_biblioteca: retornar [usuarios,perfis_biblioteca]

        //emprestimo: retornar [exemplares_biblioteca,usuarios_biblioteca]

        //reserva: retornar [exemplares_biblioteca,usuarios_biblioteca]

        //multa: retornar [usuarios_biblioteca]

        //exemplar: retornar [livros_biblioteca]
        switch (type) {
            case "library_user":
            (async()=>{
              const users_id = await (async()=>{

               const current_libraryUsersId = await client.from("tb_usuario_biblioteca")
              .select("fk_id_usuario,situacao")
              .eq("fk_id_biblioteca",id)
              .neq("deletado",true)

               return !!current_libraryUsersId.data
                ? client.from("tb_usuario")
                .select("label:username,value:id")
                .neq("deletado",true)
                .not('id','in',`(${current_libraryUsersId.data.map((item)=>item.fk_id_usuario)})`)
                : []
              })()
              
              const accounts_id = await (async()=>{

                const current_accountsId = await 
                client.from("tb_perfil_usuario")
                .select("label:nome,value:id")
                .eq("fk_id_biblioteca",id)
                .neq("deletado",true)

                return !!current_accountsId.data
                ? current_accountsId
                : []

              })()

              array = {
              usuarios: await users_id.data,
              perfis_biblioteca:await accounts_id.data
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
              getParams:"isbn,titulo,id"
            });

              !!current_books.length
              && (()=>{
              
                array = {
                  livros_biblioteca:current_books.map((item,index)=>{
                    return ({
                      label:item.titulo+" isbn:("+item.isbn+")",
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
             .eq("tipo_usuario","COMUM")
             .neq("situacao","BLOQUEADO")
             .neq("deletado",true);

             !!current_userId.data
             && console.log(current_userId.data)

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
              .or("situacao.eq.DISPONIVEL,situacao.eq.RESERVADO")
              .neq("deletado",true)

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
            case "reserve":
              
              const library_book_data = await client
              .from("vw_livro")
              .select("label:titulo,value:id")
              .eq("fk_id_biblioteca",id)

              const user_data = await client
              .from("tb_usuario")
              .select("label:username,value:id")
              

              library_book_data.data 
              &&
              user_data.data
              ?
              (()=>{

                array = {
                  usuarios_biblioteca:user_data.data,
                  livros_biblioteca:library_book_data.data
                }

                res.status(200).send(array)

              })()
              : (()=>{
                return res.status(500).send({message:"error"})
              })()

              break;
            case "amerce":
              const users_amerce_id = (async()=>{

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
             .eq("tipo_usuario","COMUM")
             .neq("deletado",true);

             !!current_userId.data
             && console.log(current_userId.data)

             const formated_users = await onQueryDatabase({
               type:"getIn",
               table:"vw_usuario_biblioteca",
               getParams:"value:fk_id_usuario,label:username",
               eq:{
                 field:"usuario_biblioteca_id",
                 array:current_userId.data.map((item)=>item.id)
               }
             })

             return !!formated_users
             ? formated_users
             : []

           })()

           array = {
            usuarios_biblioteca:await users_amerce_id
           }
           users_amerce_id&&
            (()=>{
              console.log(users_amerce_id)
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
 
    (async()=>{
      switch (type) {
          case "book":
            const bookCount = await client
            .from('tb_biblioteca_livro')
            .select('id', { count: 'exact'})
            .eq("fk_id_biblioteca",id)
            .neq("deletado",true);
          !!bookCount
          &&
          (()=>{
                  count=bookCount.count,
                  warn=false
            })()


              break;
          case "account":
            const account_count = await client
            .from("tb_perfil_usuario")
            .select("id",{count:"exact"})
            .eq("fk_id_biblioteca",id)
            .neq("deletado",true)

            !!account_count
            &&
            (()=>{
              count=account_count.count,
              warn=false
            })()
          break;
          case "library_user":
          const userCount = await client
            .from('tb_usuario_biblioteca')
            .select('id', { count: 'exact'})
            .eq("fk_id_biblioteca",id)
            .neq("deletado",true);

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
            .eq("fk_id_biblioteca",id)
            .neq("deletado",true);
          !!loanCount
          &&
          (()=>{

                  count=loanCount.count,
                  warn=!!loanCount.data.filter((item)=>item.situacao === "VENCIDO").length ? true : false
                
            })()
            break;
            case "amerce":
             const amerceCount = await client
            .from('tb_multa')
            .select('situacao', { count: 'exact'})
            .eq("fk_id_biblioteca",id)
            .neq("deletado",true);
            !!amerceCount
            &&
            (()=>{

                    count=amerceCount.count,
                    warn=!!amerceCount.data.filter((item)=>item.situacao === "VENCIDO").length ? true : false

            })() 
            break;
            case "exemplary":
              const exemplaryCount = await client
              .from('tb_exemplar')
              .select('id', { count: 'exact'})
              .eq("fk_id_biblioteca",id)
              .neq("deletado",true);
              !!exemplaryCount
              &&
              (()=>{
  
                      count=exemplaryCount.count,
                      warn=false
  
              })() 
            break;
          case "reserve":
              const reserveCount = await client
              .from("tb_reserva")
              .select('situacao', { count: 'exact'})
              .eq("fk_id_biblioteca",id)
              .neq("deletado",true);
              !!reserveCount
              &&
              (()=>{
                count = reserveCount.count
                warn=(()=>{

                  const total =
                  reserveCount
                  .data
                  .filter((item)=>
                    item.situacao.toLowerCase() === "atendido_parcialmente"
                  ).length
                  +
                  reserveCount
                  .data
                  .filter((item)=>
                    item.situacao.toLowerCase() === "atendido_totalmente"
                  ).length
                  console.log("TOTAL",total)
                  return total

                })()
                ? true
                : false
              })()
          break;
          case "online_reserve":
              const onlineReserveCount = await client
              .from("tb_reserva")
              .select('situacao', { count: 'exact'})
              .eq("fk_id_biblioteca",id)
              .eq("tipo","online")
              .neq("deletado",true);
              !!onlineReserveCount
              &&
              (()=>{
                count = onlineReserveCount.count
                warn=!!onlineReserveCount.data.filter((item)=>item.situacao === "pendente").length ? true : false
              })()
          break;

        }
        res.status(200).send({quantidade:count,aviso:warn})

    })()

    }catch(error){
        res.status(201).send({message:error})
    }

})




export default table_router;
