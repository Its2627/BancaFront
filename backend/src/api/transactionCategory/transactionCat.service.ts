import { Types } from 'mongoose'
import { TransactionCategory } from './transactionCat.entity'
import { TransactionCategoryModel } from './transactionCat.model'

export class TransactionCategoryService {

    async findAll(): Promise<TransactionCategory[]> {
        return await TransactionCategoryModel.find().sort({ type: 1, categoryName: 1 });
    }

    async getCategoryIdByName(name: string): Promise<Types.ObjectId | null> {
        const category = await TransactionCategoryModel.findOne({ categoryName: name }).select('_id');
        return category?._id ?? null;
    }

}

export default new TransactionCategoryService();
