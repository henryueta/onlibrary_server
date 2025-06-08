import client from "../database/supabase.js"



const onQueryDatabase = (query)=>{

  //query = {type,table,data,equal,id}
  let tableQuery = null;

  const checkType = {
    getEq:async ()=>{
      tableQuery = await client.from(query.table).select(query.getParams).eq(query.eq.field,query.eq.val)

      return !!tableQuery
      && tableQuery.error
      ? tableQuery
      : tableQuery.data
    },
    get:async ()=>{
      console.log(query)
         tableQuery = await client.from(query.table).select(query.getParams);

       return !!tableQuery
       && tableQuery.error
       ? tableQuery
       : tableQuery.data
    },
    getIn:async ()=>{
        tableQuery = await client.from(query.table).select(query.getParams).in(query.eq.field,query.eq.array)
        
          return !!tableQuery
          && tableQuery.error
          ? tableQuery
          : tableQuery.data
    },
    post:async ()=>{
      tableQuery = await client.from(query.table).insert(query.data).select("id");
      return !!tableQuery
            && tableQuery.error
            ? (()=>{
              console.log(tableQuery)
              return tableQuery
            })()
            : tableQuery.data[0].id
    },
    put:async ()=>{
      tableQuery = await client.from(query.table).update(query.data).eq(query.eq.field,query.eq.val).select(query.getParams)

      return !!tableQuery
      && tableQuery.error
      ? (()=>{
        console.log(tableQuery)
        return tableQuery
      })()
      : tableQuery.data[0][query.getParams]
    },
    putIn:async()=>{
      tableQuery = await  client.from(query.table).update(query.data).in(query.eq.field,query.eq.array)
      return tableQuery
    },
    delete:async ()=>{

    }
  }
return  checkType[query.type]();



}

const onCheckValue = (data)=>{

  const {value,type} = data;



 return !!value.length && !!type.length ?
  value.trim().length <= 0
  ? ({
    isValidated:false,
    message:`Campo ${type} inválido`
  })
  : ({
    isValidated:true,
    message:`Campo ${type} validado`
  })
  : null
}


const onGetToken = async (data)=>{

const {login,senha} = data

    let current_user = null;

  return  !!login && !!senha
    &&

   (async ()=>{
    current_user = await client.from("tb_usuario").select("id").eq("username",login).eq("senha",senha)


    return !!current_user.data.length == false ?
    (async ()=>{
        current_user = await client.from("tb_usuario").select("id").eq("email",login).eq("senha",senha)
      return (current_user.data[0].id)
    })()

   : (current_user.data[0].id)

   })()

  }
//search value,filter,id_biblioteca
//table name,field_list


const onSearch = (search)=>{

  

}

export {
  onQueryDatabase,
  onCheckValue,
  onGetToken,
  onSearch
}
