import express from "express";
import {onQueryDatabase} from "../functions/query.js"

const loan_router = express.Router();

const setLoanDate = (days)=>{
  const now = new Date();


  const newDate = new Date(now);
  newDate.setDate(newDate.getDate() + days);

  return newDate.toISOString().split('T')[0];
}

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

        })()
        console.log(loanExemplary_id)
      })()
      !!loanExemplary_id
      ? res.status(200).send({message:""})
      :res.status(500).send({message:"error"})


    })()
  }
  catch(error){
    console.log(error)
      res.status(500).send({message:"error"})
  }

})

export default loan_router;
