
class Error{

  constructor(query){
    this.error = query.error;
    this.message = query.message;
    this.status = query.status;
  }

  show(){
    return ({
      error:this.error,
      message:this.message,
      status:this.status
    })
  }

}

export default Error;
