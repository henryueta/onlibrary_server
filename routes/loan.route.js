import express from "express";
import {onQueryDatabase} from "../functions/query.js"
import client from "../database/supabase.js";

const loan_router = express.Router();

const setLoanDate = (days)=>{
  const now = new Date();


  const newDate = new Date(now);
  newDate.setDate(newDate.getDate() + days);

  return newDate.toISOString().split('T')[0];
}


loan_router.get("/loan/get/dependencies",async (req,res)=>{

  try{
    let array  = {}
    console.log(req.query)
    const {id,id_biblioteca} = req.query

    const loan_data = await client
    .from("tb_emprestimo")
    .select("situacao,data_devolucao")
    .eq("fk_id_biblioteca",id_biblioteca)
    .eq("id",id)

    !!loan_data.data
    ? (()=>{
      array = {
      situacao:{
        label:"Pendente",
        value:loan_data.data[0].situacao
      },
      data_devolucao: loan_data.data[0].data_devolucao
    }
      res.status(200).send(array)
    })()
    : res.status(500).send({message:loan_data.error})


  }
  catch(error){
    console.log(error)
    res.status(500).send({message:"error"})

  }


})

loan_router.post("/loan/post",async(req,res)=>{

  try{

    console.log(req.body)
    const account_id = await onQueryDatabase({
      type:"getEq",
      table:"tb_usuario_biblioteca",
      getParams:"fk_id_perfil_usuario",
      eq:{
        field:"id",
        val:req.body.fk_id_usuario_biblioteca
      }
    })
    // PEGUEI O ID DO PERFIL DO USUARIO DO EMPRESTIMO NA TABELA tb_usuario_biblioteca()

    let account_date = null;
    let loan_id = null;
    let loanExemplary_id = null;


    !!account_id
    && console.log(account_id[0].fk_id_perfil_usuario)

    !!account_id[0]
    && (async()=>{
      account_date = await onQueryDatabase({
        type:"getEq",
        table:"tb_perfil_usuario",
        getParams:"prazo_devolucao_padrao",
        eq:{
          field:"id",
          val:account_id[0].fk_id_perfil_usuario
        }
      })
      //COM O ID DO PERFIL EU PEGUEI A O PRAZO DE DEVOLUCAO DELE

      //----LOGICA PARA CADASTRAR EMPRESTIMO DA BIBLIOTECA--
      !!account_date
        &&
      (async()=>{


         loan_id = await onQueryDatabase({
          type:"post",
          table:"tb_emprestimo",
          data:{
            fk_id_biblioteca:req.body.fk_id_biblioteca,
            data_emissao:(()=>{
              const now = new Date();
              return now.toISOString().split("T")[0]
            })(),
            data_devolucao:setLoanDate(account_date[0].prazo_devolucao_padrao),
            fk_id_usuario_biblioteca:req.body.fk_id_usuario_biblioteca,
            fk_id_bibliotecario:req.body.fk_id_bibliotecario,
            situacao:req.body.situacao
          }
        })
        console.log(loan_id)
        //----LOGICA PARA CADASTRAR VARIOS EXEMPLARES DO EMPRESTIMO(tb_emprestimo_exemplar)--

        !!loan_id
        && (async()=>{

            await onQueryDatabase({
            type:"putIn",
            table:"tb_exemplar",
            data:{
              disponivel:false
            },
            eq:{
              field:"id",
              array:req.body.exemplares
            }
          })

          loanExemplary_id = await onQueryDatabase({
            type:"post",
            table:"tb_emprestimo_exemplar",
            data:req.body.exemplares.map((item)=>{
              console.log("dentro :"+loan_id)
              return ({
                fk_id_emprestimo:loan_id,
                fk_id_exemplar:item
              })
            })
          })

        !!loanExemplary_id
        ? res.status(200).send({message:"success"})
        :res.status(500).send({message:"error"})

        })()
        
      })()



    })()
  }
  catch(error){
    console.log("___________________________________________")
    console.log(error)
      res.status(500).send({message:"error"})
  }

})

loan_router.put("/loan/put", async (req,res)=>{

  try{
    const {id} = req.query
    console.log(req.query)
    const new_loan = await onQueryDatabase({
      type:"put",
      table:"tb_emprestimo",
      getParams:"id",
      data:req.body,
      eq:{
        field:"id",
        val:id
      }
    })

    !!new_loan
    ? (async()=>{
      const loan_exemplariesId = await client.from("tb_emprestimo_exemplar")
      .select("fk_id_exemplar")
      .eq("fk_id_emprestimo",new_loan)

     !!loan_exemplariesId.data
     ? (async()=>{
      console.log(loan_exemplariesId.data)
       const booksOfExemplaries = await 
       client.from("tb_exemplar")
       .select("fk_id_livro,id")
       .in("id",loan_exemplariesId.data.map((item)=>{
            return item.fk_id_exemplar
          }))

      !!booksOfExemplaries.data
      ? (async()=>{
        console.log(booksOfExemplaries.data)
        const reserves = await client
      .from("vw_reserva_emprestimo_exemplar")
      .select("id,quantidade_pendente,fk_id_livro")
      .eq("situacao","pendente")
      .not("quantidade_pendente","eq",0)
      .in("fk_id_livro",booksOfExemplaries.data.map((item)=>item.fk_id_livro))
      .order("data_emissao",{ascending:false})
        
      !!reserves.data
      ? (async()=>{
        console.log(reserves.data)
        const reserve_exemplaries = await client.from("tb_reserva_exemplar")
        .insert(booksOfExemplaries.data.filter((item)=>{
          return !reserves.data.includes({
            fk_id_livro:item.fk_id_livro
          })
        }).map((item)=>{
            return ({
              fk_id_exemplar:item.id,
              fk_id_reserva:reserves.data.find((reserve)=>reserve.fk_id_livro == item.fk_id_livro).id
            })
          }))
        
        // .insert({
        //   fk_id_exemplar:booksOfExemplaries.data.filter((item)=>{
        //      return !reserves.data.includes({
        //         fk_id_livro:item.fk_id_livro
        //       })
        //   }).map((item)=>{
        //     return ({
              
        //     })
        //   }),
        //   fk_id_reserva:reserves.data.map((item)=>item.id)
        // })
        .select("id")

        !!reserve_exemplaries.data
        ? res.status(201).send({message:reserve_exemplaries})
        : (()=>{
          console.log(reserve_exemplaries)
          res.status(500).send({message:reserve_exemplaries})
        })()
      })()
      : (()=>{
        console.log(reserves)
        res.status(500).send({message:reserves.error})
      })()

      })()
      : (()=>{
        console.log(booksOfExemplaries)
        res.status(500).send({message:booksOfExemplaries})
      })()
     })()
     : (()=>{
      console.log(loan_exemplariesId)
      res.status(500).send({message:loan_exemplariesId})
     })()
      
      

    })()  
    : (()=>{
      console.log(new_loan)
      res.status(500).send({message:new_loan})
    })()

  }
  catch(error){
    console.log(error)
      res.status(500).send({message:error})
  }

})


export default loan_router;


