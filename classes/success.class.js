
class Success{

  constructor(query){
      this.message = query.message;
      this.success = query.success;
      this.data = query.data;
  }

  show(){
    return ({
      data:this.data,
      success:this.success,
      message:this.message
    })
  }

}

export default Success;
