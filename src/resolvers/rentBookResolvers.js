import { AuthenticationError } from 'apollo-server';
import bookModel from '../models/bookModel';

export default {
  Query: {
    rentBook: async (
      parent,
      { id },
      { models: { rentBookModel }, me },
      info
    ) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const rentBook = await rentBookModel.findById({ _id: id }).exec();
      return rentBook;
    },
    listRentBook: async (
      parent,
      args,
      { models: { rentBookModel }, me },
      info
    ) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const listRentBook = await rentBookModel.find({ author: me.id }).exec();
      return listRentBook;
    }
  },
  Mutation: {
    createRentBook: async (
      parent,
      { book },
      { models: { rentBookModel }, me },
      info
    ) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      // Get Current Date
      const startDate = Date.now();

      // Check book availability
      const bookAvailable = await bookModel.findById({ _id: book });
      if (!bookAvailable.available > 0) {
        throw new Error('Book not available MF!');
      }
      // Decrement book counts
      const availability = bookAvailable.available - 1;
      const rentBook = await rentBookModel.create({
        book,
        author: me.id,
        startDate
      });

      // Update availability
      await bookModel.findByIdAndUpdate(
        book,
        { $set: { available: availability } },
        { new: true }
      );

      return rentBook;
    },
    updateBook: async (
      parent,
      { id, title, subtitle },
      { models: { bookModel }, me },
      info
    ) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const book = await bookModel.findByIdAndUpdate(
        id,
        { $set: { title, subtitle } },
        { new: true }
      );
      // $set: { title: title, subtitle: subtitle } can be simplified to $set: { title, subtitle }
      return book;
    },
    deleteBook: async (parent, { id }, { models: { bookModel }, me }, info) => {
      if (!me) {
        throw new AuthenticationError('You are not authenticated');
      }
      const book = await bookModel.findByIdAndRemove({ _id: id }).exec();
      if (!book) {
        throw new Error('Error. Book not found!');
      }
      return book;
    }
  },
  RentBook: {
    author: ({ author }, args, { models: { userModel } }, info) =>
      userModel.findById({ _id: author }).exec(),
    book: ({ book }, args, { models: { bookModel } }, info) =>
      bookModel.findById({ _id: book }).exec()
  }
};