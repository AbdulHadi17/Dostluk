// import

export const getData = async(req,res)=>{

    try{
        return res.status(200).json({message:'Hello World' , success:true});
    }catch(error){
        console.log(error);
    }
}