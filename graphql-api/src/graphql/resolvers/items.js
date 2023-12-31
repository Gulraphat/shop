import createKnexConnection from '../../knex.js';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import path from 'path';
import { createWriteStream } from 'fs';
const db = createKnexConnection;

export default {
    Upload: GraphQLUpload,
    Query: {
        items: async () => {
            const rows = await db('items').select('*');
            return rows;
        },
        item: async (parent, { id }) => {
            const rows = await db('items').select('*').where('id', id);
            if (rows.length > 0) {
                return rows[0];
            } else {
                return null;
            }
        }
    },
    Item: {
        category: async (parent) => {
            const rows = await db('categories').select('*').where('id', parent.category_id).first();
            return rows;
        },
        seller: async (parent) => {
            const rows = await db('users').select('*').where('id', parent.seller_id).first();
            return rows;
        }
    },
    Mutation: {
        createItem: async (parent, { name, category_id, seller_id, detail, image, price }) => {
            try{
                const { createReadStream, filename, mimetype, encoding } = await image;
                const stream = createReadStream();
                const pathName = path.join(process.cwd(), `public/images/items/${filename}`);
                const writeStream = createWriteStream(pathName);
            
                await new Promise((resolve, reject) => {
                  stream.pipe(writeStream)
                    .on('finish', resolve)
                    .on('error', reject);
                });
            
                const imagePath = `http://localhost:4000/images/items/${filename}`;
                await db('items').insert({name: name,category_id: category_id, seller_id: seller_id, detail: detail,image: imagePath,price: price});
                
                return "Create Success";
            }catch(err){
                return "Create Fail";
            }
        },
        deleteItem: async (parent, { id }) => {
            try{
                await db('items').delete().where('id', id);
                return "Delete Success";
            }catch(err){
                return "Delete Fail";
            }
        }
    }
}