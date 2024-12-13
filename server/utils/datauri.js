import DataUriParser from 'datauri/parser.js'
import path from 'path';


const parser =  new DataUriParser();

const getDataUri = (file)=>{

const extname = path.extname(file.originalname).toString();
return parser.format(extname,file.buffer).content

}

export default getDataUri;